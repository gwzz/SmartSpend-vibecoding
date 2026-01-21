import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { AppNotification } from '../types';
import { useAuth } from './AuthContext';

type State = {
  notifications: AppNotification[];
};

type Action =
  | { type: 'hydrate'; notifications: AppNotification[] }
  | { type: 'upsert'; notification: AppNotification; markUnreadIfNew?: boolean }
  | { type: 'remove'; id: string }
  | { type: 'markRead'; id: string; at: number }
  | { type: 'markAllRead'; at: number }
  | { type: 'dismiss'; id: string; at: number }
  | { type: 'clearDismissed' };

const sortByUpdatedDesc = (a: AppNotification, b: AppNotification) => {
  const at = a.updatedAt ?? a.createdAt;
  const bt = b.updatedAt ?? b.createdAt;
  return bt - at;
};

const normalize = (list: AppNotification[]) =>
  list
    .filter(n => !n.dismissedAt)
    .sort(sortByUpdatedDesc);

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'hydrate':
      return { notifications: normalize(action.notifications) };

    case 'upsert': {
      const existing = state.notifications.find(n => n.id === action.notification.id);
      if (!existing) {
        const n: AppNotification = {
          ...action.notification,
          readAt: action.markUnreadIfNew ? undefined : action.notification.readAt,
        };
        return { notifications: normalize([n, ...state.notifications]) };
      }

      const next: AppNotification = {
        ...existing,
        ...action.notification,
        // Never allow rules/upserts to rewrite creation time.
        createdAt: existing.createdAt,
        // Only bump updatedAt if explicitly provided.
        updatedAt: action.notification.updatedAt ?? existing.updatedAt,
        // Preserve read state unless explicitly provided.
        readAt: action.notification.readAt === undefined ? existing.readAt : action.notification.readAt,
        dismissedAt: action.notification.dismissedAt ?? existing.dismissedAt,
        actions: action.notification.actions ?? existing.actions,
      };

      const sameActions = JSON.stringify(existing.actions ?? []) === JSON.stringify(next.actions ?? []);
      const isSame =
        existing.severity === next.severity &&
        existing.source === next.source &&
        existing.title === next.title &&
        existing.message === next.message &&
        existing.readAt === next.readAt &&
        existing.dismissedAt === next.dismissedAt &&
        sameActions;

      if (isSame) return state;

      return {
        notifications: normalize(state.notifications.map(n => (n.id === next.id ? next : n))),
      };
    }

    case 'remove':
      if (!state.notifications.some(n => n.id === action.id)) return state;
      return { notifications: state.notifications.filter(n => n.id !== action.id) };

    case 'markRead':
      if (!state.notifications.some(n => n.id === action.id && !n.readAt)) return state;
      return {
        notifications: state.notifications.map(n => (n.id === action.id ? { ...n, readAt: action.at } : n)),
      };

    case 'markAllRead':
      if (state.notifications.every(n => !!n.readAt)) return state;
      return {
        notifications: state.notifications.map(n => ({ ...n, readAt: n.readAt ?? action.at })),
      };

    case 'dismiss':
      if (!state.notifications.some(n => n.id === action.id && !n.dismissedAt)) return state;
      return {
        notifications: state.notifications.map(n => (n.id === action.id ? { ...n, dismissedAt: action.at } : n)),
      };

    case 'clearDismissed':
      if (!state.notifications.some(n => !!n.dismissedAt)) return state;
      return {
        notifications: state.notifications.filter(n => !n.dismissedAt),
      };

    default:
      return state;
  }
};

type NotificationsContextType = {
  notifications: AppNotification[];
  unreadCount: number;
  upsert: (n: AppNotification, opts?: { markUnreadIfNew?: boolean }) => void;
  remove: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const storageKey = (userId: string) => `smartspend:notifications:${userId}`;

const safeRead = (key: string): AppNotification[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as AppNotification[];
  } catch {
    return [];
  }
};

const safeWrite = (key: string, value: AppNotification[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, { notifications: [] });

  useEffect(() => {
    if (!user?.id) {
      dispatch({ type: 'hydrate', notifications: [] });
      return;
    }
    dispatch({ type: 'hydrate', notifications: safeRead(storageKey(user.id)) });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    safeWrite(storageKey(user.id), state.notifications);
  }, [user?.id, state.notifications]);

  const unreadCount = useMemo(
    () => state.notifications.filter(n => !n.readAt && !n.dismissedAt).length,
    [state.notifications]
  );

  const api = useMemo<NotificationsContextType>(() => {
    return {
      notifications: state.notifications,
      unreadCount,
      upsert: (n, opts) => dispatch({ type: 'upsert', notification: n, markUnreadIfNew: opts?.markUnreadIfNew }),
      remove: (id) => dispatch({ type: 'remove', id }),
      markRead: (id) => dispatch({ type: 'markRead', id, at: Date.now() }),
      markAllRead: () => dispatch({ type: 'markAllRead', at: Date.now() }),
      dismiss: (id) => dispatch({ type: 'dismiss', id, at: Date.now() }),
    };
  }, [state.notifications, unreadCount]);

  return <NotificationsContext.Provider value={api}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
};
