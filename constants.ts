import { Category, Member } from './types';

export const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: 'Me', avatar: '🧑' },
  { id: 'm2', name: 'Partner', avatar: '👩' },
  { id: 'm3', name: 'Kid', avatar: '👶' },
  { id: 'm4', name: 'Home', avatar: '🏠' },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Food', icon: '🍔', color: 'bg-orange-100 text-orange-600' },
  { id: 'c2', name: 'Transport', icon: '🚗', color: 'bg-blue-100 text-blue-600' },
  { id: 'c3', name: 'Shopping', icon: '🛍️', color: 'bg-pink-100 text-pink-600' },
  { id: 'c4', name: 'Housing', icon: '🏠', color: 'bg-green-100 text-green-600' },
  { id: 'c5', name: 'Tech', icon: '💻', color: 'bg-purple-100 text-purple-600' },
  { id: 'c6', name: 'Health', icon: '💊', color: 'bg-red-100 text-red-600' },
  { id: 'c7', name: 'Entertainment', icon: '🎬', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'c8', name: 'Other', icon: '📦', color: 'bg-slate-100 text-slate-600' },
];

export const STORAGE_KEY = 'smartspend_data_v1';

export const CATEGORY_ICONS = [
  '🍔', '🍕', '☕', '🍺', '🍽️', 
  '🚗', '🚕', '✈️', '⛽', '🚆',
  '🛍️', '👗', '👟', '💍', '🕶️',
  '🏠', '💡', '🛋️', '🧹', '🔧',
  '💻', '📱', '📷', '🎮', '🎧',
  '💊', '💪', '🏥', '🧘', '🦷',
  '🎬', '🎵', '🎨', '📚', '🎫',
  '📦', '🎁', '🐶', '🎓', '💸'
];

export const CATEGORY_COLORS = [
  { id: 'orange', class: 'bg-orange-100 text-orange-600', hex: '#ea580c' },
  { id: 'blue', class: 'bg-blue-100 text-blue-600', hex: '#2563eb' },
  { id: 'pink', class: 'bg-pink-100 text-pink-600', hex: '#db2777' },
  { id: 'green', class: 'bg-green-100 text-green-600', hex: '#16a34a' },
  { id: 'purple', class: 'bg-purple-100 text-purple-600', hex: '#9333ea' },
  { id: 'red', class: 'bg-red-100 text-red-600', hex: '#dc2626' },
  { id: 'yellow', class: 'bg-yellow-100 text-yellow-600', hex: '#ca8a04' },
  { id: 'slate', class: 'bg-slate-100 text-slate-600', hex: '#475569' },
  { id: 'cyan', class: 'bg-cyan-100 text-cyan-600', hex: '#0891b2' },
  { id: 'indigo', class: 'bg-indigo-100 text-indigo-600', hex: '#4f46e5' },
];