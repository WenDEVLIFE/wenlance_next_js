import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notificationService } from '@/lib/services/NotificationService';
import { getTodayDayOfWeek, DAYS_OF_WEEK } from '@/app/model/TaskModel';

vi.mock('@/lib/repositories/TaskRepository', () => ({
  default: {
    listenToTasks: vi.fn(() => vi.fn()),
    updateTask: vi.fn(),
  },
  taskRepository: {
    listenToTasks: vi.fn(() => vi.fn()),
    updateTask: vi.fn(),
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    notificationService.stop();
  });

  describe('isSupported', () => {
    it('should return true in browser environment', () => {
      expect(notificationService.isSupported).toBe(true);
    });
  });

  describe('onAlarm', () => {
    it('should register and return unsubscribe function', () => {
      const unsub = notificationService.onAlarm(vi.fn());
      expect(typeof unsub).toBe('function');
      unsub();
    });

    it('should allow multiple listeners', () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      const unsub1 = notificationService.onAlarm(cb1);
      const unsub2 = notificationService.onAlarm(cb2);
      unsub1();
      unsub2();
    });
  });

  describe('start/stop', () => {
    it('should start without errors', () => {
      notificationService.start();
      notificationService.stop();
    });

    it('should be idempotent on start', () => {
      notificationService.start();
      notificationService.start();
      notificationService.stop();
    });
  });

  describe('getTodayDayOfWeek', () => {
    it('should return a valid day of the week', () => {
      const today = getTodayDayOfWeek();
      expect(DAYS_OF_WEEK).toContain(today);
    });
  });
});
