import { ReflectionFlags, ReflectionKey, ReflectionTag, Transaction } from '../types';

// Legacy fixed keys for backward compatibility
export const REFLECTION_KEYS: ReflectionKey[] = ['regret', 'waste', 'save'];

export const createReflectionFlags = (source?: Partial<ReflectionFlags>, fallbackRegret = false): ReflectionFlags => ({
  regret: source?.regret ?? fallbackRegret,
  waste: source?.waste ?? false,
  save: source?.save ?? false,
});

export const deriveReflectionFromTransaction = (tx: Transaction): ReflectionFlags =>
  createReflectionFlags(tx.reflection, tx.isWaste);

/**
 * Normalize to the new dynamic tag IDs while remaining backward compatible with legacy flags.
 */
export const normalizeReflectionTagIds = (tx: Transaction, defaultTags: ReflectionTag[], fallbackTagId?: string): string[] => {
  if (tx.reflectionTagIds && tx.reflectionTagIds.length > 0) return tx.reflectionTagIds;

  const legacy = deriveReflectionFromTransaction(tx);
  const nameLookup = (needle: string) =>
    defaultTags.find((tag) => tag.name.toLowerCase().includes(needle.toLowerCase()))?.id;

  const ids: string[] = [];
  if (legacy.regret) {
    const id = nameLookup('regret') || fallbackTagId;
    if (id) ids.push(id);
  }
  if (legacy.waste) {
    const id = nameLookup('waste');
    if (id) ids.push(id);
  }
  if (legacy.save) {
    const id = nameLookup('save');
    if (id) ids.push(id);
  }
  return ids;
};

export const hasReflectionTag = (tx: Transaction, tagId: string, defaults: ReflectionTag[], fallbackTagId?: string): boolean => {
  return normalizeReflectionTagIds(tx, defaults, fallbackTagId).includes(tagId);
};

export const toggleTagSelection = (selected: string[], tagId: string): string[] =>
  selected.includes(tagId) ? selected.filter(id => id !== tagId) : [...selected, tagId];
