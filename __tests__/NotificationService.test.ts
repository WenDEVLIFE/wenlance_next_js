import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notificationService } from '@/lib/services/NotificationService';
import { getTodayDayOfWeek, DAYS_OF_WEEK } from '@/app/model/TaskModel';

// Mock taskRepository
vi.mock('@/lib/repositories/TaskRepository', () => ({
  default: {
    listenToTasks: vi.fn((callback) => {
      callback([]);
      return vi.fn();
    }),
    updateTask: vi.fn(),
  },
  taskRepository: {
    listenToTasks: vi.fn((callback) => {
      callback([]);
      return vi.fn();
    }),
    updateTask: vi.fn(),
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // Mock Notification API
    Object.defineProperty(globalThis, 'Notification', {
      value: {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('granted'),
      },
      writable: true,
      configurable: true,
    });

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        controller: null,
        ready: Promise.resolve({
          showNotification: vi.fn(),
        }),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    notificationService.stop();
  });

  describe('isSupported', () => {
    it('should return true when Notification is available', () => {
      expect(notificationService.isSupported).toBe(true);
    });

    it('should return false when Notification is not available', () => {
      // @ts-expect-error - removing Notification for test
      delete globalThis.Notification;
      expect(notificationService.isSupported).toBe(false);
    });
  });

  describe('requestPermission', () => {
    it('should return false when notifications are not supported', async () => {
      // @ts-expect-error - removing Notification for test
      delete globalThis.Notification;
      const result = await notificationService.requestPermission();
      expect(result).toBe(false);
    });

    it('should return true when permission is already granted', async () => {
      Object.defineProperty(globalThis.Notification, 'permission', {
        value: 'granted',
        writable: true,
      });
      const result = await notificationService.requestPermission();
      expect(result).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      Object.defineProperty(globalThis.Notification, 'permission', {
        value: 'denied',
        writable: true,
      });
      const result = await notificationService.requestPermission();
      expect(result).toBe(false);
    });

    it('should request permission when default', async () => {
      Object.defineProperty(globalThis.Notification, 'permission', {
        value: 'default',
        writable: true,
      });
      const result = await notificationService.requestPermission();
      expect(result).toBe(true);
      expect(Notification.requestPermission).toHaveBeenCalledOnce();
    });
  });

  describe('getTodayDayOfWeek', () => {
    it('should return a valid day of the week', () => {
      const today = getTodayDayOfWeek();
      expect(DAYS_OF_WEEK).toContain(today);
    });
  });

  describe('permission getter', () => {
    it('should return denied when notifications are not supported', () => {
      // @ts-expect-error - removing Notification for test
      delete globalThis.Notification;
      expect(notificationService.permission).toBe('denied');
    });

    it('should return the current permission', () => {
      Object.defineProperty(globalThis.Notification, 'permission', {
        value: 'granted',
        writable: true,
      });
      expect(notificationService.permission).toBe('granted');
    });
  });
});
