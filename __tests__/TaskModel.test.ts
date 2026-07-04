import { describe, it, expect } from 'vitest';
import { taskFromFirestore, taskToFirestore, TaskModel } from '@/app/model/TaskModel';
import { Timestamp } from 'firebase/firestore';

// Minimal Timestamp mock
function mockTimestamp(date: Date) {
  return {
    toDate: () => new Date(date),
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
  } as unknown as Timestamp;
}

describe('TaskModel', () => {
  const baseDate = new Date('2026-07-04T10:00:00Z');

  describe('taskFromFirestore', () => {
    it('should convert Firestore data with Timestamp createdAt', () => {
      const data = {
        name: 'Morning Standup',
        alarmTime: '09:00',
        frequency: 'everyday',
        enabled: true,
        createdAt: mockTimestamp(baseDate),
      };

      const task = taskFromFirestore('doc123', data);

      expect(task.id).toBe('doc123');
      expect(task.name).toBe('Morning Standup');
      expect(task.alarmTime).toBe('09:00');
      expect(task.frequency).toBe('everyday');
      expect(task.enabled).toBe(true);
      expect(task.createdAt).toEqual(baseDate);
    });

    it('should default to everyday frequency for unknown values', () => {
      const data = {
        name: 'Test',
        alarmTime: '14:30',
        frequency: 'weekly',
        createdAt: mockTimestamp(baseDate),
      };

      const task = taskFromFirestore('doc1', data);
      expect(task.frequency).toBe('everyday');
    });

    it('should accept one-time frequency', () => {
      const data = {
        name: 'Doctor Appointment',
        alarmTime: '15:00',
        frequency: 'one-time',
        createdAt: mockTimestamp(baseDate),
      };

      const task = taskFromFirestore('doc2', data);
      expect(task.frequency).toBe('one-time');
    });

    it('should default enabled to true when not present', () => {
      const data = {
        name: 'Test',
        alarmTime: '08:00',
        createdAt: mockTimestamp(baseDate),
      };

      const task = taskFromFirestore('doc3', data);
      expect(task.enabled).toBe(true);
    });

    it('should handle enabled=false', () => {
      const data = {
        name: 'Test',
        alarmTime: '08:00',
        enabled: false,
        createdAt: mockTimestamp(baseDate),
      };

      const task = taskFromFirestore('doc4', data);
      expect(task.enabled).toBe(false);
    });

    it('should parse lastTriggeredDate', () => {
      const data = {
        name: 'Test',
        alarmTime: '08:00',
        lastTriggeredDate: '2026-07-03',
        createdAt: mockTimestamp(baseDate),
      };

      const task = taskFromFirestore('doc5', data);
      expect(task.lastTriggeredDate).toBe('2026-07-03');
    });

    it('should accept custom frequency with customDays', () => {
      const data = {
        name: 'Gym Day',
        alarmTime: '07:00',
        frequency: 'custom',
        customDays: ['Mon', 'Wed', 'Fri'],
        createdAt: mockTimestamp(baseDate),
      };

      const task = taskFromFirestore('doc6', data);
      expect(task.frequency).toBe('custom');
      expect(task.customDays).toEqual(['Mon', 'Wed', 'Fri']);
    });

    it('should filter invalid customDays', () => {
      const data = {
        name: 'Test',
        alarmTime: '08:00',
        frequency: 'custom',
        customDays: ['Mon', 'Funday', 'Fri'],
        createdAt: mockTimestamp(baseDate),
      };

      const task = taskFromFirestore('doc7', data);
      expect(task.customDays).toEqual(['Mon', 'Fri']);
    });

    it('should set customDays to undefined when array is empty', () => {
      const data = {
        name: 'Test',
        alarmTime: '08:00',
        frequency: 'custom',
        customDays: [],
        createdAt: mockTimestamp(baseDate),
      };

      const task = taskFromFirestore('doc8', data);
      expect(task.customDays).toBeUndefined();
    });

    it('should handle missing name and alarmTime with defaults', () => {
      const data = { createdAt: mockTimestamp(baseDate) };

      const task = taskFromFirestore('doc9', data);
      expect(task.name).toBe('');
      expect(task.alarmTime).toBe('09:00');
    });
  });

  describe('taskToFirestore', () => {
    it('should convert TaskModel to Firestore-compatible object', () => {
      const task: TaskModel = {
        id: 'doc123',
        name: 'Morning Standup',
        alarmTime: '09:00',
        frequency: 'everyday',
        enabled: true,
        createdAt: baseDate,
      };

      const data = taskToFirestore(task);

      expect(data.name).toBe('Morning Standup');
      expect(data.alarmTime).toBe('09:00');
      expect(data.frequency).toBe('everyday');
      expect(data.enabled).toBe(true);
      expect(data.lastTriggeredDate).toBeNull();
      expect(data.createdAt).toBeInstanceOf(Timestamp);
    });

    it('should include lastTriggeredDate when set', () => {
      const task: TaskModel = {
        id: 'doc124',
        name: 'One Time Task',
        alarmTime: '14:00',
        frequency: 'one-time',
        enabled: false,
        lastTriggeredDate: '2026-07-04',
        createdAt: baseDate,
      };

      const data = taskToFirestore(task);

      expect(data.lastTriggeredDate).toBe('2026-07-04');
      expect(data.frequency).toBe('one-time');
      expect(data.enabled).toBe(false);
    });

    it('should persist customDays through toFirestore', () => {
      const task: TaskModel = {
        name: 'Gym',
        alarmTime: '07:00',
        frequency: 'custom',
        enabled: true,
        customDays: ['Mon', 'Wed', 'Fri'],
        createdAt: baseDate,
      };

      const data = taskToFirestore(task);

      expect(data.frequency).toBe('custom');
      expect(data.customDays).toEqual(['Mon', 'Wed', 'Fri']);
    });
  });

  describe('roundtrip', () => {
    it('should preserve all fields through toFirestore -> fromFirestore', () => {
      const original: TaskModel = {
        name: 'Daily Standup',
        alarmTime: '10:30',
        frequency: 'everyday',
        enabled: true,
        lastTriggeredDate: '2026-07-03',
        createdAt: baseDate,
      };

      const firestoreData = taskToFirestore(original);
      const result = taskFromFirestore('roundtrip1', firestoreData);

      expect(result.name).toBe(original.name);
      expect(result.alarmTime).toBe(original.alarmTime);
      expect(result.frequency).toBe(original.frequency);
      expect(result.enabled).toBe(original.enabled);
      expect(result.lastTriggeredDate).toBe(original.lastTriggeredDate);
      expect(result.createdAt.getTime()).toBe(original.createdAt.getTime());
    });

    it('should preserve one-time frequency through roundtrip', () => {
      const original: TaskModel = {
        name: 'One-off Reminder',
        alarmTime: '15:45',
        frequency: 'one-time',
        enabled: true,
        createdAt: baseDate,
      };

      const firestoreData = taskToFirestore(original);
      const result = taskFromFirestore('roundtrip2', firestoreData);

      expect(result.frequency).toBe('one-time');
    });

    it('should preserve custom frequency with days through roundtrip', () => {
      const original: TaskModel = {
        name: 'Team Standup',
        alarmTime: '09:30',
        frequency: 'custom',
        enabled: true,
        customDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        createdAt: baseDate,
      };

      const firestoreData = taskToFirestore(original);
      const result = taskFromFirestore('roundtrip3', firestoreData);

      expect(result.frequency).toBe('custom');
      expect(result.customDays).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    });
  });
});
