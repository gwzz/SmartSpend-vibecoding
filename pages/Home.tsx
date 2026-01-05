import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions, getCategories, getDailyCostForDate, deleteTransaction, exportBackupJSON } from '../services/storageService';
import { Transaction, Category } from '../types';
import { Card, ListItem, FloatingActionButton } from '../components/ui';
import { Trash2, Search, XCircle, Plus, Download } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import AddTransactionModal from '../components/AddTransactionModal';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, formatCurrency, settings } = useSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cashFlowToday, setCashFlowToday] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const loadData = async () => {
    const txs = await getTransactions();
    const cats = await getCategories();
    setTransactions(txs);
    setCategories(cats);

    const todayStr = new Date().toISOString().split('T')[0];
    
    // Calculate last 7 days cost
    const last7 = [];
    const today = new Date();
    // Normalize today to start of day for comparison
    today.setHours(0,0,0,0);

    for (let i = 6; i >= 0; i--) {
       const d = new Date(today);
       d.setDate(today.getDate() - i);
       const dateStr = d.toISOString().split('T')[0];
       const amount = getDailyCostForDate(dateStr, txs);
       last7.push({
         day: d.toLocaleDateString(settings.language === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'narrow' }),
         date: dateStr,
         amount: amount
       });
    }
    setChartData(last7);

    // Cashflow Calculation
    const cashFlow = txs
      .filter(t => t.date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);
    setCashFlowToday(cashFlow);
  };

  useEffect(() => {
    loadData();
  }, [settings.language]); // Reload if language changes for day names
  
  // Refresh data when modal closes
  useEffect(() => {
      if (!isModalOpen) loadData();
  }, [isModalOpen]);

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

  const filteredTransactions = transactions.filter(tx => {
    const cat = getCategory(tx.categoryId);
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      (tx.name || '').toLowerCase().includes(searchLower) ||
      (tx.note || '').toLowerCase().includes(searchLower) ||
      (cat?.name || '').toLowerCase().includes(searchLower) ||
      tx.amount.toString().includes(searchLower);
    
    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'waste') return tx.isWaste;
    if (filterType === 'longterm') return !!tx.endDate;
    
    return tx.categoryId === filterType;
  });

  const isFiltering = searchTerm !== '' || filterType !== 'all';
  const displayedTransactions = (isExpanded || isFiltering) 
    ? filteredTransactions 
    : filteredTransactions.slice(0, 5);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="pt-safe pb-24 md:pb-8 md:pt-4">
      {/* Header */}
      <header className="px-4 md:px-6 pt-4 pb-2 bg-[#F2F2F7] sticky top-0 md:static z-40">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-[13px] font-semibold text-slate-500 uppercase">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('today')}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop Add Button (Visible on md+) */}
            <button 
                onClick={handleAdd}
                className="hidden md:flex h-9 px-4 bg-[#007AFF] rounded-full items-center justify-center text-white shadow-sm hover:bg-[#005ec4] transition-colors gap-2"
            >
                <Plus size={18} />
                <span className="text-sm font-semibold">{t('add')}</span>
            </button>
            <button 
                onClick={exportBackupJSON}
                className="h-9 w-9 bg-white rounded-full flex items-center justify-center text-slate-500 shadow-sm border border-slate-200 active:scale-95 transition-transform"
                title={t('exportBackup')}
            >
                <Download size={18} />
            </button>
            <div className="h-9 w-9 bg-slate-200 rounded-full flex items-center justify-center text-lg border border-slate-300 overflow-hidden">
                👤
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 md:px-6 space-y-4 md:space-y-6">
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Last 7 Days Chart */}
            <Card className="p-4 md:col-span-2">
                <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('last7Days')}</h2>
                <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.date === todayStr ? '#007AFF' : '#E2E8F0'} />
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
                                tick={{fontSize: 12, fill: '#94a3b8'}} 
                                dy={5}
                                interval={0}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Cash Flow Card */}
            <Card className="p-4 flex flex-row md:flex-col lg:justify-between items-center md:items-start justify-between h-full">
                <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('cashFlow')}</p>
                    <p className="text-[10px] text-slate-400">{t('spentToday')}</p>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-2">{formatCurrency(cashFlowToday)}</h2>
                <div className="hidden md:block w-full h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-[#007AFF] w-3/4 opacity-20"></div> 
                    {/* Placeholder progress bar */}
                </div>
            </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 pt-2">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#E3E3E8] rounded-xl py-2 pl-9 pr-8 text-[17px] placeholder-slate-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
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

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 md:max-w-2xl">
             <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${
                  filterType === 'all' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-600 shadow-sm'
                }`}
             >
               All
             </button>
             <button
                onClick={() => setFilterType('waste')}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${
                  filterType === 'waste' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-slate-600 shadow-sm'
                }`}
             >
               Waste
             </button>
             <button
                onClick={() => setFilterType('longterm')}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${
                  filterType === 'longterm' 
                    ? 'bg-[#007AFF] text-white' 
                    : 'bg-white text-slate-600 shadow-sm'
                }`}
             >
               Long-term
             </button>
             
             <div className="w-[1px] h-6 bg-slate-300 mx-1 self-center flex-shrink-0" />

             {categories.map(cat => (
               <button
                  key={cat.id}
                  onClick={() => setFilterType(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                    filterType === cat.id 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-white text-slate-600 shadow-sm'
                  }`}
               >
                 <span>{cat.icon}</span>
                 {cat.name}
               </button>
             ))}
          </div>
        </div>

        {/* Transactions List */}
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="text-[20px] font-bold text-slate-900">{t('recent')}</h3>
            {!isFiltering && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="text-[15px] text-[#007AFF] font-normal active:opacity-50"
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

                return (
                  <ListItem key={tx.id} isLast={isLast} onClick={() => handleEdit(tx.id)}>
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg ${cat?.color || 'bg-slate-100'}`}>
                        {cat?.icon || '📦'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[16px] text-slate-900 truncate">{displayTitle}</span>
                          {tx.isWaste && <div className="w-2 h-2 rounded-full bg-red-500" title={t('regret')} />}
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
      </div>

      {/* Mobile Only FAB */}
      <div className="md:hidden">
          <FloatingActionButton onClick={handleAdd} icon={<Plus size={28} strokeWidth={2.5} />} />
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editId={editingId}
      />
    </div>
  );
};

export default HomePage;