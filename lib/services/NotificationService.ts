import { TaskModel, getTodayDayOfWeek } from '@/app/model/TaskModel';
import taskRepository from '@/lib/repositories/TaskRepository';

class NotificationService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private allTasks: TaskModel[] = [];
  private unsubscribe: (() => void) | null = null;
  private notifiedTaskIds: Set<string> = new Set();
  private started = false;

  get isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  get permission(): NotificationPermission {
    if (!this.isSupported) return 'denied';
    return Notification.permission;
  }

  get isRunning(): boolean {
    return this.started;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    try {
      const result = await Notification.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }

  start() {
    if (!this.isSupported) return;
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
    this.allTasks = [];
    this.notifiedTaskIds.clear();
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
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    const enabledTasks = this.allTasks.filter(t => t.enabled);

    for (const task of enabledTasks) {
      if (task.alarmTime !== currentTime) continue;

      const notificationKey = `${task.id}-${today}`;
      if (this.notifiedTaskIds.has(notificationKey)) continue;

      if (task.frequency === 'one-time' && task.lastTriggeredDate) {
        continue;
      }

      if (!this.shouldFireToday(task)) continue;

      this.fireNotification(task, notificationKey, today);
    }
  }

  private async fireNotification(task: TaskModel, notificationKey: string, todayDate: string) {
    this.notifiedTaskIds.add(notificationKey);

    const title = 'Task Reminder';
    const body = `Time for: ${task.name}`;

    try {
      new Notification(title, { body, icon: '/icon.png', tag: `task-${task.id}-${todayDate}` });
    } catch (err) {
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification(title, { body, icon: '/icon.png', tag: `task-${task.id}-${todayDate}` });
        }
      } catch (swErr) {
        console.error('Notification delivery failed:', swErr);
      }
    }

    try {
      const updatedTask: TaskModel = {
        ...task,
        lastTriggeredDate: todayDate,
        enabled: task.frequency === 'one-time' ? false : task.enabled,
      };
      await taskRepository.updateTask(updatedTask);
    } catch (err) {
      console.error('Failed to update task after notification:', err);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
