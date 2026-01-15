export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Member {
  id: string;
  name: string;
  avatar: string; // Emoji or initial
}

export interface ReflectionTag {
  id: string;
  name: string;
  color: string; // Tailwind color class for chip/badge backgrounds
  icon?: string; // Optional emoji/icon
}

// Legacy flags kept for backward compatibility with existing data
export type ReflectionKey = 'regret' | 'waste' | 'save';
export interface ReflectionFlags {
  regret: boolean;
  waste: boolean;
  save: boolean;
}

export interface Transaction {
  id: string;
  name: string; // Title of the expense
  amount: number;
  categoryId: string;
  memberIds: string[]; // Who is this for?
  date: string; // ISO Date string YYYY-MM-DD
  endDate?: string; // If null/undefined, it's instant consumption. If set, it's amortization.
  isWaste: boolean; // Legacy regret flag for backwards compatibility
  reflection?: ReflectionFlags; // Legacy flags (regret/waste/save)
  reflectionTagIds?: string[]; // New dynamic reflection tags selected by the user
  note: string;
  timestamp: number; // For sorting
}

export type ViewMode = 'cashflow' | 'amortization';

export interface DailyStat {
  date: string;
  amount: number;
}

export type Language = 'en' | 'zh';
export type CurrencyCode = 'USD' | 'CNY' | 'EUR' | 'JPY' | 'GBP';

export interface AppSettings {
  language: Language;
  currency: CurrencyCode;
}