import React, { useEffect, useMemo, useState, useRef } from 'react';
import { getTransactions, getCategories, getDailyCostForDate, deleteTransaction, exportBackupJSON, getReflectionTags } from '../services/storageService';
import { Transaction, Category, ReflectionTag } from '../types';
import { Card, ListItem, FloatingActionButton } from '../components/ui';
import { Trash2, Search, XCircle, Plus, Download, ChevronDown, Check } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import AddTransactionModal from '../components/AddTransactionModal';
import { normalizeReflectionTagIds, deriveReflectionFromTransaction } from '../utils/reflection';

const REFLECTION_FILTER_PREFIX = 'reflection:';
const REFLECTION_FLAG_PREFIX = 'reflectionFlag:';

const HomePage: React.FC = () => {
  const { t, formatCurrency, settings } = useSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reflectionTags, setReflectionTags] = useState<ReflectionTag[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedReflections, setSelectedReflections] = useState<Set<string>>(new Set());
  const [longTermOnly, setLongTermOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const reflectionMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    const txs = await getTransactions();
    const cats = await getCategories();
    const tags = await getReflectionTags();
    setTransactions(txs);
    setCategories(cats);
    setReflectionTags(tags);
    return { txs, cats, tags };
  };

  useEffect(() => {
    loadData();
  }, [settings.language]); // Reload if language changes for day names
  
  // Refresh data when modal closes
  useEffect(() => {
      if (!isModalOpen) loadData();
  }, [isModalOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isFilterMenuOpen && reflectionMenuRef.current && !reflectionMenuRef.current.contains(e.target as Node)) {
        setIsFilterMenuOpen(false);
      }
      if (isCategoryMenuOpen && categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isFilterMenuOpen, isCategoryMenuOpen]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(t('deleteConfirm'))) {
      await deleteTransaction(id);
      loadData();
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
      setEditingId(null);
      setIsModalOpen(true);
  }

  const getCategory = (id: string) => categories.find(c => c.id === id);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const selectedDate = dateFilter || todayStr;

  const chartData = useMemo(() => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const locale = settings.language === 'zh' ? 'zh-CN' : 'en-US';
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    const formatLocalDate = (d: Date) => {
      const y = d.getFullYear();
      const m = `${d.getMonth() + 1}`.padStart(2, '0');
      const day = `${d.getDate()}`.padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const data = [] as { day: string; date: string; amount: number }[];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const dateStr = formatLocalDate(d);
      const label = days <= 7
        ? d.toLocaleDateString(locale, { weekday: 'narrow' })
        : d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
      const amount = getDailyCostForDate(dateStr, transactions);
      data.push({ day: label, date: dateStr, amount });
    }
    return data;
  }, [transactions, timeframe, settings.language]);

  const cashFlowForSelected = useMemo(() => {
    return transactions
      .filter(t => t.date === selectedDate)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedDate]);

  const barChartWidth = useMemo(() => {
    const bar = timeframe === '7d' ? 36 : timeframe === '30d' ? 22 : 16;
    return Math.max(360, bar * chartData.length + 40);
  }, [timeframe, chartData.length]);

  const allReflectionsSelected = reflectionTags.length > 0 && selectedReflections.size === reflectionTags.length;
  const allCategoriesSelected = categories.length > 0 && selectedCategories.size === categories.length;

  const filteredTransactions = transactions.filter(tx => {
    const cat = getCategory(tx.categoryId);
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      (tx.name || '').toLowerCase().includes(searchLower) ||
      (tx.note || '').toLowerCase().includes(searchLower) ||
      (cat?.name || '').toLowerCase().includes(searchLower) ||
      tx.amount.toString().includes(searchLower);
    
    if (!matchesSearch) return false;

    if (dateFilter && tx.date !== dateFilter) return false;

    if (longTermOnly && !tx.endDate) return false;

    if (selectedReflections.size > 0) {
      const normalized = normalizeReflectionTagIds(tx, reflectionTags, reflectionTags[0]?.id);
      for (const refId of selectedReflections) {
        if (!normalized.includes(refId)) return false;
      }
    }

    if (selectedCategories.size > 0 && !selectedCategories.has(tx.categoryId)) return false;

    return true;
  });

  const isFiltering = searchTerm !== '' || selectedCategories.size > 0 || selectedReflections.size > 0 || longTermOnly || !!dateFilter;

  const sortedTransactions = [...filteredTransactions].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
  const displayedTransactions = dateFilter
    ? sortedTransactions
    : (isExpanded || isFiltering)
      ? sortedTransactions
      : sortedTransactions.slice(0, 10);

  return (
    <div className="pt-safe pb-24 md:pb-8 md:pt-6 bg-brand-canvas">
      {/* Live snapshot (usage-first) */}
      <section className="px-4 md:px-6 mt-10 space-y-4 md:space-y-6">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-4">
            <img
              src="/assets/app-theme-pic.jpeg"
              alt="SmartSpend logo"
              className="w-14 h-14 rounded-2xl shadow-soft border border-brand-border object-cover"
            />
            <div>
              <p className="text-[13px] font-semibold text-brand-muted uppercase">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h2 className="text-3xl font-bold text-brand-ink tracking-tight">{t('today')}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={handleAdd}
                className="hidden md:flex h-10 px-5 bg-gradient-to-r from-brand-accent to-brand-primary rounded-pill items-center justify-center text-white shadow-soft hover:shadow-glass transition-all gap-2"
            >
                <Plus size={18} />
                <span className="text-sm font-semibold">{t('add')}</span>
            </button>
            <button 
                onClick={exportBackupJSON}
                className="h-9 w-9 bg-white rounded-full flex items-center justify-center text-brand-muted shadow-sm border border-brand-border active:scale-95 transition-transform"
                title={t('exportBackup')}
            >
                <Download size={18} />
            </button>
            <div className="h-9 w-9 bg-brand-surface rounded-full flex items-center justify-center text-lg border border-brand-border overflow-hidden">
                👤
            </div>
          </div>
        </div>
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Last 7 Days Chart */}
            <Card className="p-4 md:col-span-2">
                <div className="flex items-center justify-between mb-2 gap-3">
                  <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('last7Days')}</h2>
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    {([
                      { key: '7d', label: '7D' },
                      { key: '30d', label: '30D' },
                      { key: '90d', label: '90D' },
                    ] as const).map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setTimeframe(opt.key)}
                        className={`px-2.5 py-1 rounded-full border text-xs transition-all ${timeframe === opt.key ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-primary/50'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-52 w-full overflow-x-auto">
                  <div style={{ width: barChartWidth, height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.date === selectedDate ? '#3F7CAC' : '#E2E8F0'}
                                  onClick={() => {
                                    setDateFilter(entry.date);
                                    setIsExpanded(true);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                />
                                ))}
                            </Bar>
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-slate-900 text-white text-xs py-1 px-2 rounded shadow-lg">
                                        {formatCurrency(payload[0].value as number)}
                                        </div>
                                    );
                                    }
                                    return null;
                                }}
                            />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                              tick={{fontSize: 11, fill: '#94a3b8'}} 
                              dy={5}
                              interval={0}
                              minTickGap={4}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                        </div>
                </div>
            </Card>

            {/* Cash Flow Card */}
            <Card className="p-4 flex flex-row md:flex-col lg:justify-between items-center md:items-start justify-between h-full">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('cashFlow')}</p>
                  <p className="text-[10px] text-slate-400">{selectedDate === todayStr ? t('spentToday') : new Date(selectedDate).toLocaleDateString()}</p>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-2">{formatCurrency(cashFlowForSelected)}</h2>
                <div className="hidden md:block w-full h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-brand-primary/50 w-3/4 opacity-50"></div> 
                  {/* Placeholder progress bar */}
                </div>
            </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 pt-2">
          <div className="flex flex-1 gap-2">
            <div className="relative group flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-brand-surface rounded-xl py-2 pl-9 pr-8 text-[17px] placeholder-slate-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/30 transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                >
                  <XCircle size={18} fill="currentColor" className="text-slate-400" />
                </button>
              )}
            </div>

            <div className="w-40 relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2.5 text-[14px] text-brand-ink shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              />
              {dateFilter && (
                <button
                  className="absolute inset-y-0 right-2 flex items-center text-slate-400"
                  onClick={() => setDateFilter('')}
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>

            <button
              onClick={() => setLongTermOnly(v => !v)}
              className={`whitespace-nowrap px-3 py-2.5 rounded-xl border text-[14px] font-semibold flex items-center gap-2 transition-all shadow-soft ${longTermOnly ? 'bg-brand-primary text-white border-brand-primary' : 'bg-brand-surface border-brand-border text-brand-ink hover:-translate-y-0.5'}`}
            >
              <span>{t('longTerm')}</span>
              {longTermOnly && <Check size={16} />}
            </button>
          </div>

          <div className="flex flex-1 md:flex-none gap-2 relative">
            {/* Reflection filters dropdown */}
            <div className="relative flex-1" ref={reflectionMenuRef}>
              <button
                onClick={() => setIsFilterMenuOpen(v => !v)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2.5 flex items-center justify-between text-[14px] font-medium text-brand-ink shadow-soft hover:-translate-y-0.5 transition-all"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[12px] uppercase text-brand-muted tracking-wide">{t('reflection')}</span>
                  <span className="text-brand-primary font-semibold">{selectedReflections.size > 0 ? selectedReflections.size : t('all')}</span>
                </span>
                <ChevronDown size={16} className={`transition-transform ${isFilterMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isFilterMenuOpen && (
                <div className="absolute z-30 mt-2 w-full bg-brand-card border border-brand-border rounded-xl shadow-glass p-3 space-y-2">
                  <div className="flex items-center justify-between text-[12px] uppercase text-brand-muted font-semibold">
                    <span>{t('reflection')}</span>
                  </div>

                  <button
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-brand-surface text-sm"
                    onClick={() => {
                      if (allReflectionsSelected) {
                        setSelectedReflections(new Set());
                      } else {
                        setSelectedReflections(new Set(reflectionTags.map(t => t.id)));
                      }
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{t('all')}</span>
                    </span>
                    {allReflectionsSelected && <Check size={16} />}
                  </button>

                  {reflectionTags.map(tag => {
                    const active = selectedReflections.has(tag.id);
                    return (
                      <button
                        key={tag.id}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-brand-surface text-sm"
                        onClick={() => {
                          const next = new Set(selectedReflections);
                          if (active) next.delete(tag.id); else next.add(tag.id);
                          setSelectedReflections(next);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${tag.color}`}>{tag.icon || tag.name.slice(0,1)}</span>
                          <span>{tag.name}</span>
                        </span>
                        {active && <Check size={16} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category dropdown */}
            <div className="relative flex-1" ref={categoryMenuRef}>
              <button
                onClick={() => setIsCategoryMenuOpen(v => !v)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2.5 flex items-center justify-between text-[14px] font-medium text-brand-ink shadow-soft hover:-translate-y-0.5 transition-all"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[12px] uppercase text-brand-muted tracking-wide">{t('categories')}</span>
                  <span className="text-brand-primary font-semibold">{selectedCategories.size > 0 ? selectedCategories.size : t('all')}</span>
                </span>
                <ChevronDown size={16} className={`transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoryMenuOpen && (
                <div className="absolute z-30 mt-2 w-full bg-brand-card border border-brand-border rounded-xl shadow-glass p-3 space-y-2 max-h-72 overflow-y-auto">
                  <div className="flex items-center justify-between text-[12px] uppercase text-brand-muted font-semibold">
                    <span>{t('categories')}</span>
                  </div>

                  <button
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-brand-surface text-sm"
                    onClick={() => {
                      if (allCategoriesSelected) {
                        setSelectedCategories(new Set());
                      } else {
                        setSelectedCategories(new Set(categories.map(c => c.id)));
                      }
                    }}
                  >
                    <span className="flex items-center gap-2 font-semibold">{t('all')}</span>
                    {allCategoriesSelected && <Check size={16} />}
                  </button>

                  {categories.map(cat => {
                    const active = selectedCategories.has(cat.id);
                    return (
                      <button
                        key={cat.id}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-brand-surface text-sm"
                        onClick={() => {
                          const next = new Set(selectedCategories);
                          if (active) next.delete(cat.id); else next.add(cat.id);
                          setSelectedCategories(next);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                        {active && <Check size={16} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="text-[20px] font-bold text-slate-900">{t('recent')}</h3>
            {!isFiltering && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="text-[15px] text-brand-primary font-normal active:opacity-50"
              >
                {t(isExpanded ? 'showLess' : 'seeAll')}
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100/50">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>{t('noActivity')}</p>
              </div>
            ) : (
              displayedTransactions.map((tx, index) => {
                const cat = getCategory(tx.categoryId);
                const isLast = index === displayedTransactions.length - 1;
                const displayTitle = tx.name || cat?.name || t('newExpense');
                const displaySubtitle = tx.name ? (tx.note || cat?.name) : tx.note;
                const reflectionBadgeTags = normalizeReflectionTagIds(tx, reflectionTags, reflectionTags[0]?.id)
                  .map(id => reflectionTags.find(tag => tag.id === id))
                  .filter(Boolean) as ReflectionTag[];

                return (
                  <ListItem key={tx.id} isLast={isLast} onClick={() => handleEdit(tx.id)}>
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg ${cat?.color || 'bg-slate-100'}`}>
                        {cat?.icon || '📦'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[16px] text-slate-900 truncate">{displayTitle}</span>
                          {reflectionBadgeTags.length > 0 && (
                            <div className="flex items-center gap-1">
                              {reflectionBadgeTags.map(tag => (
                                <span
                                  key={tag.id}
                                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${tag.color}`}
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                          {tx.endDate && <div className="w-2 h-2 rounded-full bg-blue-500" title={t('longTerm')} />}
                        </div>
                        <p className="text-[13px] text-slate-500 truncate">
                          {displaySubtitle || new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-semibold text-[16px] tracking-tight">{formatCurrency(tx.amount)}</span>
                      <button onClick={(e) => handleDelete(e, tx.id)} className="text-slate-300 hover:text-red-500 p-1 -mr-2 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </ListItem>
                );
              })
            )}
          </div>
          
           {(isFiltering || isExpanded) && filteredTransactions.length > 0 && (
            <p className="text-center text-[12px] text-slate-400 pt-4 pb-2">
              {filteredTransactions.length} {t('items')}
            </p>
          )}
        </div>

      </section>

      {/* Mobile Only FAB */}
      <div className="md:hidden">
          <FloatingActionButton onClick={handleAdd} icon={<Plus size={28} strokeWidth={2.5} />} />
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSaved={async (d) => {
          await loadData();
          setDateFilter(d || todayStr);
          setTimeframe('7d');
          setIsExpanded(true);
        }}
        editId={editingId}
      />
    </div>
  );
};

export default HomePage;