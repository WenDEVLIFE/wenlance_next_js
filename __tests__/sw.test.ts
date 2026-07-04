import { describe, it, expect, vi } from 'vitest';

type MockClient = {
  url?: string;
  focus?: () => Promise<void>;
};

type MockClients = {
  matchAll: ReturnType<typeof vi.fn>;
  openWindow: ReturnType<typeof vi.fn>;
};

type MockNotificationEvent = {
  notification: {
    close: ReturnType<typeof vi.fn>;
    data: Record<string, unknown>;
  };
  waitUntil: ReturnType<typeof vi.fn>;
};

function createHandleClick(clients: MockClients) {
  return (event: MockNotificationEvent) => {
    event.notification.close();

    const data = event.notification.data;
    const urlToOpen = data?.taskId
      ? new URL('/tasks', 'https://wenlance.app').href
      : new URL('/', 'https://wenlance.app').href;

    return clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients: MockClient[]) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && client.focus) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    });
  };
}

describe('Service Worker', () => {
  it('should handle notificationclick event and close notification', async () => {
    const closeMock = vi.fn();
    const openWindowMock = vi.fn();

    const clients: MockClients = {
      matchAll: vi.fn().mockResolvedValue([]),
      openWindow: openWindowMock,
    };

    Object.defineProperty(globalThis, 'clients', {
      value: clients,
      writable: true,
      configurable: true,
    });

    const handleNotificationClick = createHandleClick(clients);

    const mockEvent: MockNotificationEvent = {
      notification: {
        close: closeMock,
        data: { taskId: 'task123', taskName: 'Test Task' },
      },
      waitUntil: vi.fn(),
    };

    await handleNotificationClick(mockEvent);

    expect(closeMock).toHaveBeenCalledOnce();
  });

  it('should navigate to /tasks when notification has taskId', async () => {
    const closeMock = vi.fn();
    const openWindowMock = vi.fn();

    const clients: MockClients = {
      matchAll: vi.fn().mockResolvedValue([]),
      openWindow: openWindowMock,
    };

    Object.defineProperty(globalThis, 'clients', {
      value: clients,
      writable: true,
      configurable: true,
    });

    const handleNotificationClick = createHandleClick(clients);

    const mockEvent: MockNotificationEvent = {
      notification: {
        close: closeMock,
        data: { taskId: 'abc' },
      },
      waitUntil: vi.fn(),
    };

    await handleNotificationClick(mockEvent);

    expect(openWindowMock).toHaveBeenCalledWith('https://wenlance.app/tasks');
  });

  it('should navigate to / when notification has no taskId', async () => {
    const closeMock = vi.fn();
    const openWindowMock = vi.fn();

    const clients: MockClients = {
      matchAll: vi.fn().mockResolvedValue([]),
      openWindow: openWindowMock,
    };

    Object.defineProperty(globalThis, 'clients', {
      value: clients,
      writable: true,
      configurable: true,
    });

    const handleNotificationClick = createHandleClick(clients);

    const mockEvent: MockNotificationEvent = {
      notification: {
        close: closeMock,
        data: {},
      },
      waitUntil: vi.fn(),
    };

    await handleNotificationClick(mockEvent);

    expect(openWindowMock).toHaveBeenCalledWith('https://wenlance.app/');
  });
});
