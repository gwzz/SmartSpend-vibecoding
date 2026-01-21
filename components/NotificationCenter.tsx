import React, { useMemo, useState } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationsContext';
import { useSettings } from '../contexts/SettingsContext';
import { Button, Modal, Card } from './ui';

const relativeTime = (ts: number) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const { t } = useSettings();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative h-9 w-9 bg-white rounded-full flex items-center justify-center text-brand-muted shadow-sm border border-brand-border active:scale-95 transition-transform"
        title={t('notifications')}
        aria-label={t('notifications')}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border border-white"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenterModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};

const NotificationCenterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useSettings();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead, markRead, dismiss } = useNotifications();

  const visible = useMemo(() => notifications.filter(n => !n.dismissedAt), [notifications]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('notifications')}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[13px] text-slate-500 font-semibold">
            {unreadCount > 0 ? `${unreadCount} ${t('unread')}` : t('allCaughtUp')}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => markAllRead()}
              className="flex items-center gap-2"
              disabled={unreadCount === 0}
            >
              <Check size={16} />
              {t('markAllRead')}
            </Button>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-full border border-brand-border bg-white text-slate-500 flex items-center justify-center"
              aria-label={t('close')}
              title={t('close')}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {visible.length === 0 ? (
          <Card className="p-5 text-center text-slate-400">
            <div className="text-sm font-semibold">{t('noNotifications')}</div>
            <div className="text-xs mt-1">{t('noNotificationsHint')}</div>
          </Card>
        ) : (
          <div className="space-y-3">
            {visible.map(n => {
              const isUnread = !n.readAt;
              const tone = n.severity === 'danger'
                ? 'border-red-200 bg-red-50'
                : n.severity === 'warning'
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-slate-200 bg-white';

              return (
                <button
                  key={n.id}
                  className={`w-full text-left rounded-xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 ${tone}`}
                  onClick={() => {
                    if (isUnread) markRead(n.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {isUnread && <span className="w-2 h-2 rounded-full bg-red-500" />}
                        <div className="font-semibold text-[15px] text-slate-900 truncate">{n.title}</div>
                      </div>
                      <div className="text-[13px] text-slate-600 mt-1">{n.message}</div>

                      {n.actions && n.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {n.actions.map(a => (
                            <Button
                              key={a.id}
                              variant="secondary"
                              className="h-8 px-3 text-[13px]"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isUnread) markRead(n.id);
                                onClose();
                                if (a.type === 'navigate') navigate(a.to);
                              }}
                            >
                              {a.label}
                            </Button>
                          ))}
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 mt-2">{relativeTime(n.updatedAt ?? n.createdAt)}</div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        className="h-9 w-9 rounded-full border border-brand-border bg-white text-slate-500 flex items-center justify-center hover:text-red-600"
                        title={t('dismiss')}
                        aria-label={t('dismiss')}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          dismiss(n.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
