import { Transaction, Category, Member, AppSettings } from '../types';
import { INITIAL_CATEGORIES, INITIAL_MEMBERS } from '../constants';
import { supabase } from './supabase';

// Helper to get current user ID
const getUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id;
};

// --- Initialization ---
// Checks if the user has data. If not, seeds the database with initial categories and members.
export const initStoragePersistence = async () => {
  const userId = await getUserId();
  if (!userId) return;

  try {
    // 1. Check & Seed Members
    const { count: memberCount, error: memberError } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (!memberError && (memberCount === null || memberCount === 0)) {
       console.log("Seeding default members...");
       const initMembers = INITIAL_MEMBERS.map(m => ({
           id: m.id,
           user_id: userId,
           name: m.name,
           avatar: m.avatar
       }));
       const { error: insertError } = await supabase.from('members').insert(initMembers);
       if (insertError) console.error("Error seeding members:", insertError.message);
    }

    // 2. Check & Seed Categories
    const { count: catCount, error: catError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (!catError && (catCount === null || catCount === 0)) {
        console.log("Seeding default categories...");
        const initCats = INITIAL_CATEGORIES.map(c => ({
            id: c.id,
            user_id: userId,
            name: c.name,
            icon: c.icon,
            color: c.color
        }));
        const { error: insertError } = await supabase.from('categories').insert(initCats);
        if (insertError) console.error("Error seeding categories:", insertError.message);
    }
  } catch (err) {
    console.error("Initialization Error:", err);
  }
};

// --- Transactions ---

export const getTransactions = async (): Promise<Transaction[]> => {
  const userId = await getUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error.message);
    return [];
  }

  if (!data) return [];

  return data.map((t: any) => ({
    id: t.id,
    name: t.name,
    amount: parseFloat(t.amount),
    categoryId: t.category_id,
    memberIds: t.member_ids, // JSONB array
    date: t.date,
    endDate: t.end_date || undefined,
    isWaste: t.is_waste,
    note: t.note || '',
    timestamp: typeof t.timestamp === 'string' ? parseInt(t.timestamp) : t.timestamp
  }));
};

export const getTransactionById = async (id: string): Promise<Transaction | undefined> => {
  const userId = await getUserId();
  if (!userId) return undefined;

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  if (error || !data) {
    if (error) console.error("Error fetching transaction by ID:", error.message);
    return undefined;
  }
  
  return {
    id: data.id,
    name: data.name,
    amount: parseFloat(data.amount),
    categoryId: data.category_id,
    memberIds: data.member_ids,
    date: data.date,
    endDate: data.end_date || undefined,
    isWaste: data.is_waste,
    note: data.note || '',
    timestamp: typeof data.timestamp === 'string' ? parseInt(data.timestamp) : data.timestamp
  };
};

export const addTransaction = async (tx: Transaction) => {
  const userId = await getUserId();
  if (!userId) return;

  const payload = {
    id: tx.id,
    user_id: userId,
    name: tx.name,
    amount: tx.amount,
    category_id: tx.categoryId,
    member_ids: tx.memberIds,
    date: tx.date,
    end_date: tx.endDate,
    is_waste: tx.isWaste,
    note: tx.note,
    timestamp: tx.timestamp
  };

  const { error } = await supabase.from('transactions').insert([payload]);
  if (error) console.error("Add Tx Error:", error.message);
};

export const updateTransaction = async (tx: Transaction) => {
  const userId = await getUserId();
  if (!userId) return;

  const payload = {
    name: tx.name,
    amount: tx.amount,
    category_id: tx.categoryId,
    member_ids: tx.memberIds,
    date: tx.date,
    end_date: tx.endDate,
    is_waste: tx.isWaste,
    note: tx.note,
    timestamp: tx.timestamp
  };

  const { error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', tx.id)
    .eq('user_id', userId);
  if (error) console.error("Update Tx Error:", error.message);
};

export const deleteTransaction = async (id: string) => {
  const userId = await getUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) console.error("Delete Tx Error:", error.message);
};

// --- Categories ---

export const getCategories = async (): Promise<Category[]> => {
  const userId = await getUserId();
  if (!userId) return INITIAL_CATEGORIES;

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.warn("Fetch Categories Error (using defaults):", error.message);
    return INITIAL_CATEGORIES;
  }
  if (!data || data.length === 0) return INITIAL_CATEGORIES;

  return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color
  }));
};

export const getCategoryById = async (id: string): Promise<Category | undefined> => {
  const userId = await getUserId();
  if (!userId) return undefined;

  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
   if (!data) return undefined;
   return { id: data.id, name: data.name, icon: data.icon, color: data.color };
};

export const addCategory = async (cat: Category) => {
  const userId = await getUserId();
  if (!userId) return;

  await supabase.from('categories').insert([{
    id: cat.id,
    user_id: userId,
    name: cat.name,
    icon: cat.icon,
    color: cat.color
  }]);
};

export const updateCategory = async (cat: Category) => {
  const userId = await getUserId();
  if (!userId) return;

  await supabase.from('categories').update({
    name: cat.name,
    icon: cat.icon,
    color: cat.color
  }).eq('id', cat.id).eq('user_id', userId);
};

export const deleteCategory = async (id: string) => {
  const userId = await getUserId();
  if (!userId) return;

  await supabase.from('categories').delete().eq('id', id).eq('user_id', userId);
};

// --- Members ---

export const getMembers = async (): Promise<Member[]> => {
    const userId = await getUserId();
    if (!userId) return INITIAL_MEMBERS;

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      console.warn("Fetch Members Error (using defaults):", error.message);
      return INITIAL_MEMBERS;
    }
    if (!data || data.length === 0) return INITIAL_MEMBERS;

    return data.map((m: any) => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar
    }));
};

export const getMemberById = async (id: string): Promise<Member | undefined> => {
    const userId = await getUserId();
    if (!userId) return undefined;

    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (!data) return undefined;
    return { id: data.id, name: data.name, avatar: data.avatar };
};

export const addMember = async (member: Member) => {
    const userId = await getUserId();
  if (!userId) return;

    await supabase.from('members').insert([{
        id: member.id,
        user_id: userId,
        name: member.name,
        avatar: member.avatar
    }]);
};

export const updateMember = async (member: Member) => {
  const userId = await getUserId();
  if (!userId) return;

  await supabase.from('members').update({
    name: member.name,
    avatar: member.avatar
  }).eq('id', member.id).eq('user_id', userId);
};

export const deleteMember = async (id: string) => {
  const userId = await getUserId();
  if (!userId) return;

  await supabase.from('members').delete().eq('id', id).eq('user_id', userId);
};

// --- Settings ---

const DEFAULT_SETTINGS: AppSettings = { language: 'en', currency: 'USD' };

export const getSettings = async (): Promise<AppSettings> => {
    const userId = await getUserId();
    if (!userId) return DEFAULT_SETTINGS;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
        console.warn("Error fetching settings:", error.message);
    }
    
    if (data) {
        return { language: data.language as any, currency: data.currency as any };
    }
    return DEFAULT_SETTINGS;
};

export const saveSettings = async (settings: AppSettings) => {
    const userId = await getUserId();
    if (!userId) return;

    // Upsert settings
    const { error } = await supabase.from('user_settings').upsert({
        user_id: userId,
        language: settings.language,
        currency: settings.currency,
        updated_at: new Date().toISOString()
    });
    
    if (error) console.error("Save Settings Error:", error.message);
};

// --- Utils (Export/Import/Calc) ---

export const exportTransactionsToCSV = async () => {
    const transactions = await getTransactions();
    const categories = await getCategories();
    const members = await getMembers();
    const settings = await getSettings();

    // Header row
    const headers = ['Date', 'Item Name', 'Amount', 'Category', 'Split With', 'Type', 'Is Waste', 'Note', 'End Date (Amortization)'];
    
    const rows = transactions.map(tx => {
      const catName = categories.find(c => c.id === tx.categoryId)?.name || 'Unknown';
      const memberNames = tx.memberIds.map(mid => members.find(m => m.id === mid)?.name || mid).join(', ');
      const type = tx.endDate ? 'Long-term' : 'Instant';
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
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartspend_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
};

export const exportBackupJSON = async () => {
    const data = {
        transactions: await getTransactions(),
        categories: await getCategories(),
        members: await getMembers(),
        settings: await getSettings()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `smartspend_backup.json`;
    link.click();
};

// Simplified logic for calculating daily cost without fetching everything locally
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

export const getDaysDiff = (start: string, end: string): number => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
    } catch (e) {
      return `${currencyCode} ${amount.toFixed(2)}`;
    }
};

// Stub for import (harder to do with async db without robust logic)
export const importBackupJSON = async (jsonString: string): Promise<boolean> => {
    alert("Import not fully supported in Cloud mode yet.");
    return false;
};