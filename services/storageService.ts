import { Transaction, Category, Member, AppSettings, CurrencyCode } from '../types';
import { INITIAL_CATEGORIES, INITIAL_MEMBERS, STORAGE_KEY } from '../constants';

interface AppData {
  transactions: Transaction[];
  categories: Category[];
  members: Member[];
  settings: AppSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  currency: 'USD'
};

// Request persistent storage to prevent browser from clearing data
export const initStoragePersistence = async () => {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted();
    if (!isPersisted) {
      await navigator.storage.persist();
    }
  }
};

const getStoredData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Migration for existing data without settings
    if (!parsed.settings) {
      parsed.settings = DEFAULT_SETTINGS;
    }
    return parsed;
  }
  const initialData: AppData = {
    categories: INITIAL_CATEGORIES,
    members: INITIAL_MEMBERS,
    transactions: [],
    settings: DEFAULT_SETTINGS
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  } catch (e) {
    console.error("Failed to initialize storage", e);
  }
  return initialData;
};

const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Storage failed", e);
    // Simple alert for MVP; in production use a toast or modal
    alert("Data save failed! Storage might be full. Please export your data immediately.");
  }
};

export const getTransactions = (): Transaction[] => {
  return getStoredData().transactions.sort((a, b) => b.timestamp - a.timestamp);
};

export const getTransactionById = (id: string): Transaction | undefined => {
  return getStoredData().transactions.find(t => t.id === id);
};

export const addTransaction = (tx: Transaction) => {
  const data = getStoredData();
  data.transactions.push(tx);
  saveData(data);
};

export const updateTransaction = (updatedTx: Transaction) => {
  const data = getStoredData();
  const index = data.transactions.findIndex(t => t.id === updatedTx.id);
  if (index !== -1) {
    data.transactions[index] = updatedTx;
    saveData(data);
  }
};

export const deleteTransaction = (id: string) => {
  const data = getStoredData();
  data.transactions = data.transactions.filter(t => t.id !== id);
  saveData(data);
};

export const getCategories = (): Category[] => getStoredData().categories;

export const getCategoryById = (id: string): Category | undefined => {
  return getStoredData().categories.find(c => c.id === id);
};

export const addCategory = (cat: Category) => {
  const data = getStoredData();
  data.categories.push(cat);
  saveData(data);
};

export const updateCategory = (updatedCat: Category) => {
  const data = getStoredData();
  const index = data.categories.findIndex(c => c.id === updatedCat.id);
  if (index !== -1) {
    data.categories[index] = updatedCat;
    saveData(data);
  }
};

export const deleteCategory = (id: string) => {
  const data = getStoredData();
  data.categories = data.categories.filter(c => c.id !== id);
  saveData(data);
};

// --- Member Management ---

export const getMembers = (): Member[] => getStoredData().members;

export const getMemberById = (id: string): Member | undefined => {
  return getStoredData().members.find(m => m.id === id);
};

export const addMember = (member: Member) => {
  const data = getStoredData();
  data.members.push(member);
  saveData(data);
};

export const updateMember = (updatedMember: Member) => {
  const data = getStoredData();
  const index = data.members.findIndex(m => m.id === updatedMember.id);
  if (index !== -1) {
    data.members[index] = updatedMember;
    saveData(data);
  }
};

export const deleteMember = (id: string) => {
  const data = getStoredData();
  data.members = data.members.filter(m => m.id !== id);
  saveData(data);
};

// --- Settings ---

export const getSettings = (): AppSettings => {
  return getStoredData().settings;
};

export const saveSettings = (settings: AppSettings) => {
  const data = getStoredData();
  data.settings = settings;
  saveData(data);
};

// --- Import / Export / Backup Logic ---

// Helper function to create a download
const triggerDownload = (content: string, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportTransactionsToCSV = () => {
  const data = getStoredData();
  const { transactions, categories, members, settings } = data;

  // Header row
  const headers = ['Date', 'Item Name', 'Amount', 'Category', 'Split With', 'Type', 'Is Waste', 'Note', 'End Date (Amortization)'];
  
  const rows = transactions.map(tx => {
    const catName = categories.find(c => c.id === tx.categoryId)?.name || 'Unknown';
    const memberNames = tx.memberIds.map(mid => members.find(m => m.id === mid)?.name || mid).join(', ');
    const type = tx.endDate ? 'Long-term' : 'Instant';
    
    // Escape quotes and commas for CSV format
    const clean = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

    return [
      tx.date,
      clean(tx.name),
      tx.amount.toFixed(2) + ' ' + settings.currency,
      clean(catName),
      clean(memberNames),
      type,
      tx.isWaste ? 'Yes' : 'No',
      clean(tx.note),
      tx.endDate || ''
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  triggerDownload(csvContent, `smartspend_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Exports the Full App State as a JSON file.
 * Includes a version number to help future imports.
 */
export const exportBackupJSON = () => {
  const data = getStoredData();
  const backupObject = {
    version: 1, // Schema version
    timestamp: Date.now(),
    app: "SmartSpend",
    data: data
  };
  
  const jsonContent = JSON.stringify(backupObject, null, 2);
  triggerDownload(jsonContent, `smartspend_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
};

/**
 * Imports data from a JSON string.
 * This acts as an ADAPTER for older versions.
 * @param jsonString The raw file content
 * @returns boolean indicating success or failure
 */
export const importBackupJSON = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Determine the structure of the import
    // Structure A: Exported via exportBackupJSON (has 'data' wrapper)
    // Structure B: Raw localStorage dump (root is the data)
    let rawData: Partial<AppData> = parsed.data || parsed;

    // --- Sanitization / Migration Logic ---
    // Ensure all required fields exist, even if importing from an older version
    
    const sanitizedData: AppData = {
      // 1. Transactions
      transactions: Array.isArray(rawData.transactions) 
        ? rawData.transactions.map((t: any) => ({
            id: t.id || Math.random().toString(36).substr(2, 9),
            name: t.name || 'Unknown',
            amount: Number(t.amount) || 0,
            categoryId: t.categoryId || 'c8', // Default to Other
            memberIds: Array.isArray(t.memberIds) ? t.memberIds : [],
            date: t.date || new Date().toISOString().split('T')[0],
            // Compatibility: 'endDate' might be missing in very old versions
            endDate: t.endDate || undefined,
            // Compatibility: 'isWaste' might be missing
            isWaste: typeof t.isWaste === 'boolean' ? t.isWaste : false,
            note: t.note || '',
            timestamp: t.timestamp || Date.now()
          }))
        : [],

      // 2. Categories
      categories: Array.isArray(rawData.categories) && rawData.categories.length > 0
        ? rawData.categories
        : INITIAL_CATEGORIES,

      // 3. Members
      members: Array.isArray(rawData.members) && rawData.members.length > 0
        ? rawData.members
        : INITIAL_MEMBERS,

      // 4. Settings
      settings: rawData.settings ? {
        language: rawData.settings.language === 'zh' ? 'zh' : 'en',
        currency: rawData.settings.currency || 'USD'
      } : DEFAULT_SETTINGS
    };

    saveData(sanitizedData);
    return true;
  } catch (e) {
    console.error("Import Failed", e);
    return false;
  }
};

// --- Amortization Logic ---

export const getDaysDiff = (start: string, end: string): number => {
  const d1 = new Date(start);
  const d2 = new Date(end);
  d1.setHours(0,0,0,0);
  d2.setHours(0,0,0,0);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const getDailyCostForDate = (dateStr: string, transactions: Transaction[]): number => {
  const targetDate = new Date(dateStr);
  targetDate.setHours(0,0,0,0);
  const targetTime = targetDate.getTime();

  let total = 0;

  transactions.forEach(tx => {
    const start = new Date(tx.date);
    start.setHours(0,0,0,0);
    const startTime = start.getTime();

    if (tx.endDate) {
      const end = new Date(tx.endDate);
      end.setHours(0,0,0,0);
      const endTime = end.getTime();
      if (targetTime >= startTime && targetTime <= endTime) {
        const days = getDaysDiff(tx.date, tx.endDate);
        total += tx.amount / days;
      }
    } else {
      if (startTime === targetTime) {
        total += tx.amount;
      }
    }
  });

  return total;
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  // Use a simple formatter. For a robust app, use Intl.NumberFormat with dynamically loaded locales.
  // Here we assume 'en-US' locale for formatting numbers, but use the correct currency style.
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
  } catch (e) {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};