import { Timestamp } from 'firebase/firestore';

export type TaskFrequency = 'everyday' | 'one-time' | 'custom';

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export type RepeatUnit = 'minutes' | 'hours';

export interface TaskModel {
  id?: string;
  name: string;
  alarmTime: string;
  frequency: TaskFrequency;
  enabled: boolean;
  lastTriggeredDate?: string;
  repeatInterval?: number;
  repeatUnit?: RepeatUnit;
  customDays?: DayOfWeek[];
  createdAt: Date;
}

export function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date().getDay()];
}

export function getRepeatIntervalMinutes(task: TaskModel): number {
  if (!task.repeatInterval || task.repeatInterval <= 0) return 0;
  return task.repeatUnit === 'hours' ? task.repeatInterval * 60 : task.repeatInterval;
}

export const taskFromFirestore = (documentId: string, data: Record<string, any>): TaskModel => {
  const name = data.name || '';
  const alarmTime = data.alarmTime || '09:00';
  const rawFreq = data.frequency;
  const frequency: TaskFrequency = rawFreq === 'one-time' || rawFreq === 'custom' ? rawFreq : 'everyday';
  const enabled = data.enabled !== false;
  const lastTriggeredDate = data.lastTriggeredDate || undefined;
  const customDays: DayOfWeek[] | undefined = Array.isArray(data.customDays) && data.customDays.length > 0
    ? data.customDays.filter((d: string) => DAYS_OF_WEEK.includes(d as DayOfWeek))
    : undefined;

  let createdAt: Date;
  const rawDate = data.createdAt ?? data.created_at;
  if (rawDate instanceof Timestamp) {
    createdAt = rawDate.toDate();
  } else if (rawDate?.seconds) {
    createdAt = new Date(rawDate.seconds * 1000);
  } else if (typeof rawDate === 'string') {
    createdAt = new Date(rawDate);
  } else {
    createdAt = new Date();
  }

  const repeatInterval = typeof data.repeatInterval === 'number' ? data.repeatInterval : 0;
  const rawRepeatUnit = data.repeatUnit;
  const repeatUnit: RepeatUnit = rawRepeatUnit === 'hours' ? 'hours' : 'minutes';

  return {
    id: documentId,
    name,
    alarmTime,
    frequency,
    enabled,
    lastTriggeredDate,
    repeatInterval,
    repeatUnit,
    customDays,
    createdAt,
  };
};

export const taskToFirestore = (task: TaskModel): Record<string, any> => {
  return {
    name: task.name,
    alarmTime: task.alarmTime,
    frequency: task.frequency,
    enabled: task.enabled,
    lastTriggeredDate: task.lastTriggeredDate ?? null,
    repeatInterval: task.repeatInterval ?? 0,
    repeatUnit: task.repeatUnit ?? 'minutes',
    customDays: task.customDays ?? null,
    createdAt: Timestamp.fromDate(task.createdAt),
  };
};
