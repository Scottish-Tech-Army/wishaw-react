import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store/notification-store';
import { Loading, EmptyState } from '../components/ui';
import { Bell, Trophy, Award, BookOpen, Megaphone } from 'lucide-react';
import type { Notification } from '../types';

const icons: Record<string, typeof Bell> = { TOURNAMENT: Trophy, BADGE: Award, MODULE: BookOpen, ANNOUNCEMENT: Megaphone };

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markRead, markAllRead } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await markRead(notification.id);
      }
    } finally {
      if (notification.linkTo) {
        navigate(notification.linkTo);
      }
    }
  };

  if (!notifications) return <Loading />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="page-header">Notifications</h1>
        {notifications.length > 0 && <button className="btn-secondary btn-sm" onClick={markAllRead}>Mark all read</button>}
      </div>
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = icons[n.type] || Bell;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => handleNotificationClick(n)}
                className={`card flex w-full items-start gap-3 text-left ${n.linkTo ? 'cursor-pointer' : ''} ${!n.isRead ? 'border-primary-500/30' : ''}`}
              >
                <Icon className={`w-5 h-5 mt-0.5 ${!n.isRead ? 'text-primary-400' : 'text-surface-500'}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${!n.isRead ? 'text-white' : 'text-surface-300'}`}>{n.title}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-surface-500 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                  {n.linkTo && <p className="mt-2 text-xs font-medium text-primary-400">Open related page</p>}
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-400 mt-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
