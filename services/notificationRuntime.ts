import { NotificationDelta } from './notificationRules';
import { AppNotification } from '../types';

export const applyNotificationDelta = (
  delta: NotificationDelta,
  api: {
    upsert: (n: AppNotification, opts?: { markUnreadIfNew?: boolean }) => void;
    remove: (id: string) => void;
  }
) => {
  delta.removes.forEach(id => api.remove(id));
  delta.upserts.forEach(n => api.upsert(n, { markUnreadIfNew: true }));
};
