import { create } from 'zustand';
import api from '../services/api';
import { pushNotification } from '../components/NotificationPopup';
import type { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  seenIds: Set<string>;
  initialized: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  seenIds: new Set<string>(),
  initialized: false,

  fetchNotifications: async () => {
    try {
      const data = await api.getNotifications();
      const { seenIds, initialized } = get();

      if (initialized) {
        // Show popup for any new unread notifications we haven't seen before
        for (const n of data.notifications) {
          if (!n.isRead && !seenIds.has(n.id)) {
            const popupType = n.type === 'TOURNAMENT' ? 'tournament-published' : 'player-joined';
            pushNotification({ type: popupType, title: n.title, message: n.message });
          }
        }
      }

      // Track all current notification IDs as seen
      const newSeenIds = new Set(data.notifications.map((n: Notification) => n.id));
      set({ notifications: data.notifications, unreadCount: data.unreadCount, seenIds: newSeenIds, initialized: true });
    } catch { /* ignore */ }
  },

  markRead: async (id) => {
    await api.markNotificationRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await api.markAllNotificationsRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
