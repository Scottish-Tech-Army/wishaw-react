import { useState, useEffect, useCallback } from 'react';
import { Bell, X, Trophy, UserPlus, Megaphone, Award } from 'lucide-react';

export interface PopupNotification {
  id: string;
  type: 'tournament-published' | 'player-joined' | 'announcement' | 'badge';
  title: string;
  message: string;
}

let addNotificationFn: ((n: PopupNotification) => void) | null = null;

/** Call from anywhere to show a push notification popup */
export function pushNotification(notification: Omit<PopupNotification, 'id'>) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  addNotificationFn?.({ ...notification, id });
}

export default function NotificationPopup() {
  const [notifications, setNotifications] = useState<PopupNotification[]>([]);

  const addNotification = useCallback((n: PopupNotification) => {
    setNotifications((prev) => [...prev, n]);
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== n.id));
    }, 6000);
  }, []);

  useEffect(() => {
    addNotificationFn = addNotification;
    return () => { addNotificationFn = null; };
  }, [addNotification]);

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto animate-slide-in rounded-2xl border border-surface-700/60 bg-surface-800/95 backdrop-blur-xl shadow-2xl shadow-black/40 p-4 flex gap-3 items-start"
        >
          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
            n.type === 'tournament-published'
              ? 'bg-green-500/15 text-green-400'
              : n.type === 'player-joined'
                ? 'bg-primary-500/15 text-primary-400'
                : n.type === 'badge'
                  ? 'bg-yellow-500/15 text-yellow-400'
                  : 'bg-blue-500/15 text-blue-400'
          }`}>
            {n.type === 'tournament-published' ? <Trophy className="w-5 h-5" />
              : n.type === 'player-joined' ? <UserPlus className="w-5 h-5" />
              : n.type === 'badge' ? <Award className="w-5 h-5" />
              : <Megaphone className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-primary-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-400">Notification</p>
            </div>
            <p className="text-sm font-semibold text-white mt-1">{n.title}</p>
            <p className="text-xs text-surface-400 mt-0.5">{n.message}</p>
          </div>
          <button
            onClick={() => dismiss(n.id)}
            className="shrink-0 p-1 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
