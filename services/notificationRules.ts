import { AppNotification } from '../types';

export type NotificationDelta = {
  upserts: AppNotification[];
  removes: string[];
};

const isoLocalDate = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const evaluateDailyLimitRules = (args: {
  todaySpend: number;
  dailyLimit: number; // 0 means no limit set
  now?: number;
  localeStrings: {
    limitExceededTitle: string;
    limitExceededMessage: (spend: string, limit: string) => string;
    noLimitTitle: string;
    noLimitMessage: string;
    setLimitAction: string;
    adjustLimitAction: string;
    reviewSpendAction: string;
  };
  formatted: {
    spend: string;
    limit: string;
  };
}): NotificationDelta => {
  const now = args.now ?? Date.now();
  const dateKey = isoLocalDate(new Date(now));

  const upserts: AppNotification[] = [];
  const removes: string[] = [];

  const exceededId = `system:daily_limit_exceeded:${dateKey}`;
  const noLimitId = `system:no_daily_limit_set`;

  if (args.dailyLimit <= 0) {
    upserts.push({
      id: noLimitId,
      createdAt: now,
      updatedAt: now,
      source: 'system',
      severity: 'info',
      title: args.localeStrings.noLimitTitle,
      message: args.localeStrings.noLimitMessage,
      actions: [
        {
          id: 'set-limit',
          type: 'navigate',
          label: args.localeStrings.setLimitAction,
          to: '/settings/daily-limit',
        },
      ],
      data: { kind: 'no_limit' },
    });

    removes.push(exceededId);
    return { upserts, removes };
  }

  // If limit is set, remove the "no limit" reminder.
  removes.push(noLimitId);

  if (args.todaySpend > args.dailyLimit) {
    upserts.push({
      id: exceededId,
      createdAt: now,
      updatedAt: now,
      source: 'system',
      severity: 'danger',
      title: args.localeStrings.limitExceededTitle,
      message: args.localeStrings.limitExceededMessage(args.formatted.spend, args.formatted.limit),
      actions: [
        {
          id: 'review',
          type: 'navigate',
          label: args.localeStrings.reviewSpendAction,
          to: '/',
        },
        {
          id: 'adjust-limit',
          type: 'navigate',
          label: args.localeStrings.adjustLimitAction,
          to: '/settings/daily-limit',
        },
      ],
      data: {
        kind: 'limit_exceeded',
        date: dateKey,
        todaySpend: args.todaySpend,
        dailyLimit: args.dailyLimit,
      },
    });
  } else {
    // Auto-resolve if no longer exceeded.
    removes.push(exceededId);
  }

  return { upserts, removes };
};
