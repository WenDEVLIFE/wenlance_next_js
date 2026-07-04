import { TaskModel, getTodayDayOfWeek, getRepeatIntervalMinutes } from '@/app/model/TaskModel';
import taskRepository from '@/lib/repositories/TaskRepository';

export type AlarmCallback = (task: TaskModel) => void;

class NotificationService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private allTasks: TaskModel[] = [];
  private unsubscribe: (() => void) | null = null;
  private notifiedTaskIds: Set<string> = new Set();
  private repeatTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private lastCheckedDate: string = '';
  private started = false;
  private listeners: AlarmCallback[] = [];

  get isSupported(): boolean {
    return typeof window !== 'undefined';
  }

  onAlarm(callback: AlarmCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  start() {
    if (this.started) return;
    this.started = true;

    this.unsubscribe = taskRepository.listenToTasks((tasks) => {
      this.allTasks = tasks;
      this.checkAndNotify();
    });

    this.intervalId = setInterval(() => {
      this.checkAndNotify();
    }, 15_000);
  }

  stop() {
    this.started = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.repeatTimeouts.forEach(timeout => clearTimeout(timeout));
    this.repeatTimeouts.clear();
    this.allTasks = [];
    this.notifiedTaskIds.clear();
    this.listeners = [];
  }

  private shouldFireToday(task: TaskModel): boolean {
    if (task.frequency === 'everyday') return true;
    if (task.frequency === 'one-time') return true;
    if (task.frequency === 'custom' && task.customDays && task.customDays.length > 0) {
      return task.customDays.includes(getTodayDayOfWeek());
    }
    return false;
  }

  private checkAndNotify() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    // Clear notifiedTaskIds at midnight so tasks can re-fire on new day
    if (today !== this.lastCheckedDate) {
      this.notifiedTaskIds.clear();
      this.lastCheckedDate = today;
    }

    const enabledTasks = this.allTasks.filter(t => t.enabled);

    for (const task of enabledTasks) {
      if (task.alarmTime !== currentTime) continue;

      const notificationKey = `${task.id}-${today}`;
      if (this.notifiedTaskIds.has(notificationKey)) continue;

      if (task.frequency === 'one-time' && task.lastTriggeredDate) continue;

      if (!this.shouldFireToday(task)) continue;

      this.fireAlarm(task, notificationKey, today);
    }
  }

  private fireAlarm(task: TaskModel, notificationKey: string, todayDate: string) {
    this.notifiedTaskIds.add(notificationKey);

    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    this.listeners.forEach(cb => cb(task));

    try {
      const updatedTask: TaskModel = {
        ...task,
        lastTriggeredDate: todayDate,
        enabled: task.frequency === 'one-time' ? false : task.enabled,
      };
      taskRepository.updateTask(updatedTask);
    } catch (err) {
      console.error('Failed to update task after alarm:', err);
    }

    const repeatMinutes = getRepeatIntervalMinutes(task);
    if (repeatMinutes > 0 && task.id) {
      const existingTimeout = this.repeatTimeouts.get(task.id);
      if (existingTimeout) clearTimeout(existingTimeout);

      const timeoutMs = repeatMinutes * 60 * 1000;
      const taskId = task.id;
      const timeout = setTimeout(() => {
        this.repeatTimeouts.delete(taskId);
        const taskStillEnabled = this.allTasks.find(t => t.id === taskId && t.enabled);
        if (taskStillEnabled) {
          const now = new Date();
          const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const newToday = now.toISOString().split('T')[0];
          const repeatKey = `${taskId}-${newToday}-${currentTime}`;
          this.fireAlarm(taskStillEnabled, repeatKey, newToday);
        }
      }, timeoutMs);
      this.repeatTimeouts.set(task.id, timeout);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
