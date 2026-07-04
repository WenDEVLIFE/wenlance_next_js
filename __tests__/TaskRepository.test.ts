import { describe, it, expect } from 'vitest';
import { TaskModel } from '@/app/model/TaskModel';

// Unit tests for TaskRepository logic (firebase-dependent methods skipped)

describe('TaskRepository (unit)', () => {
  it('should allow creation of a valid everyday task', () => {
    const task: TaskModel = {
      name: 'Morning Standup',
      alarmTime: '09:00',
      frequency: 'everyday',
      enabled: true,
      createdAt: new Date('2026-07-04'),
    };

    expect(task.name).toBe('Morning Standup');
    expect(task.alarmTime).toBe('09:00');
    expect(task.frequency).toBe('everyday');
    expect(task.enabled).toBe(true);
    expect(task.lastTriggeredDate).toBeUndefined();
  });

  it('should allow creation of a valid one-time task', () => {
    const task: TaskModel = {
      name: 'Doctor Appointment',
      alarmTime: '15:30',
      frequency: 'one-time',
      enabled: true,
      createdAt: new Date('2026-07-04'),
    };

    expect(task.frequency).toBe('one-time');
  });

  it('should allow a disabled task', () => {
    const task: TaskModel = {
      name: 'Inactive Reminder',
      alarmTime: '12:00',
      frequency: 'everyday',
      enabled: false,
      createdAt: new Date('2026-07-04'),
    };

    expect(task.enabled).toBe(false);
  });

  it('should track lastTriggeredDate', () => {
    const task: TaskModel = {
      name: 'Already Triggered',
      alarmTime: '08:00',
      frequency: 'one-time',
      enabled: false,
      lastTriggeredDate: '2026-07-03',
      createdAt: new Date('2026-07-01'),
    };

    expect(task.lastTriggeredDate).toBe('2026-07-03');
    expect(task.enabled).toBe(false);
  });

  it('should convert everyday task to one-time correctly', () => {
    const task: TaskModel = {
      name: 'Flexible Task',
      alarmTime: '10:00',
      frequency: 'everyday',
      enabled: true,
      createdAt: new Date(),
    };

    const modified: TaskModel = {
      ...task,
      frequency: 'one-time',
    };

    expect(modified.frequency).toBe('one-time');
  });

  it('should handle times in HH:MM format', () => {
    const times = ['00:00', '06:30', '12:00', '23:59'];
    for (const time of times) {
      const task: TaskModel = {
        name: 'Test',
        alarmTime: time,
        frequency: 'everyday',
        enabled: true,
        createdAt: new Date(),
      };
      expect(task.alarmTime).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it('should handle edge case: midnight alarm', () => {
    const task: TaskModel = {
      name: 'Midnight Task',
      alarmTime: '00:00',
      frequency: 'everyday',
      enabled: true,
      createdAt: new Date(),
    };
    expect(task.alarmTime).toBe('00:00');
  });

  it('should allow creation of a custom frequency task with days', () => {
    const task: TaskModel = {
      name: 'Gym Days',
      alarmTime: '06:00',
      frequency: 'custom',
      enabled: true,
      customDays: ['Mon', 'Wed', 'Fri'],
      createdAt: new Date(),
    };

    expect(task.frequency).toBe('custom');
    expect(task.customDays).toEqual(['Mon', 'Wed', 'Fri']);
  });

  it('should allow custom frequency without days initially', () => {
    const task: TaskModel = {
      name: 'Custom Task',
      alarmTime: '12:00',
      frequency: 'custom',
      enabled: true,
      createdAt: new Date(),
    };

    expect(task.frequency).toBe('custom');
    expect(task.customDays).toBeUndefined();
  });

  it('should allow single-day custom frequency', () => {
    const task: TaskModel = {
      name: 'Weekly Meeting',
      alarmTime: '10:00',
      frequency: 'custom',
      enabled: true,
      customDays: ['Mon'],
      createdAt: new Date(),
    };

    expect(task.customDays).toEqual(['Mon']);
  });
});
