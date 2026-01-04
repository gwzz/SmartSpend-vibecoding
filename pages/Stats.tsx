import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { getTransactions, getCategories, getMembers } from '../services/storageService';
import { Card, ListGroup } from '../components/ui';
import { AlertTriangle, Users, Layers, PieChart as PieIcon } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { Category, Member } from '../types';

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#FF2D55', '#5856D6', '#8E8E93'];

type ViewMode = 'overview' | 'member' | 'category';

const StatsPage: React.FC = () => {
  const { t, formatCurrency } = useSettings();
  
  // Data State
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedFilterId, setSelectedFilterId] = useState<string>(''); // MemberID or CategoryID
  
  // Lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Chart Data
  const [primaryChartData, setPrimaryChartData] = useState<any[]>([]); // For Pie or Bar
  const [secondaryChartData, setSecondaryChartData] = useState<any[]>([]); // For Bar
  const [wasteTotal, setWasteTotal] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [displayTitle, setDisplayTitle] = useState('');

  // Initial Load
  useEffect(() => {
    setCategories(getCategories());
    const mems = getMembers();
    setMembers(mems);
    if (mems.length > 0) setSelectedFilterId(mems[0].id);
  }, []);

  // Calculation Effect
  useEffect(() => {
    const txs = getTransactions();
    const allCategories = getCategories();
    const allMembers = getMembers();
    
    let filteredTxs = txs;
    let calculatedTotal = 0;
    let calculatedWaste = 0;
    
    // Maps for aggregation
    let catMap: Record<string, number> = {};
    let memMap: Record<string, number> = {};

    // Logic Switch based on View Mode
    if (viewMode === 'overview') {
      setDisplayTitle(t('total'));
      
      txs.forEach(tx => {
        calculatedTotal += tx.amount;
        if (tx.isWaste) calculatedWaste += tx.amount;

        const catName = allCategories.find(c => c.id === tx.categoryId)?.name || 'Unknown';
        catMap[catName] = (catMap[catName] || 0) + tx.amount;

        const splitAmount = tx.amount / tx.memberIds.length;
        tx.memberIds.forEach(mId => {
          const memName = allMembers.find(m => m.id === mId)?.name || 'Unknown';
          memMap[memName] = (memMap[memName] || 0) + splitAmount;
        });
      });

    } else if (viewMode === 'member') {
      // Logic: Show Breakdown by Category for Selected Member
      // Only count the PORTION of the transaction assigned to this member
      
      const currentMember = allMembers.find(m => m.id === selectedFilterId);
      setDisplayTitle(currentMember ? `${t('totalFor')} ${currentMember.name}` : t('total'));

      txs.forEach(tx => {
        if (tx.memberIds.includes(selectedFilterId)) {
           const splitAmount = tx.amount / tx.memberIds.length;
           
           calculatedTotal += splitAmount;
           if (tx.isWaste) calculatedWaste += splitAmount;

           const catName = allCategories.find(c => c.id === tx.categoryId)?.name || 'Unknown';
           catMap[catName] = (catMap[catName] || 0) + splitAmount;
        }
      });
      // In Member view, we don't really need a secondary chart for "Members", 
      // maybe we can show "Waste vs Necessary" later, but for now leave secondary empty or generic.

    } else if (viewMode === 'category') {
      // Logic: Show Breakdown by Member for Selected Category
      
      const currentCategory = allCategories.find(c => c.id === selectedFilterId);
      setDisplayTitle(currentCategory ? `${t('totalFor')} ${currentCategory.name}` : t('total'));

      txs.forEach(tx => {
        if (tx.categoryId === selectedFilterId) {
          calculatedTotal += tx.amount;
          if (tx.isWaste) calculatedWaste += tx.amount;
          
          const splitAmount = tx.amount / tx.memberIds.length;
          tx.memberIds.forEach(mId => {
             const memName = allMembers.find(m => m.id === mId)?.name || 'Unknown';
             memMap[memName] = (memMap[memName] || 0) + splitAmount;
          });
        }
      });
    }

    setTotalSpend(calculatedTotal);
    setWasteTotal(calculatedWaste);

    // Format Data for Recharts
    const catData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    const memData = Object.entries(memMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

    if (viewMode === 'category') {
       // For Category View: Primary Chart is Member Breakdown (Bar), Secondary is empty/redundant
       setPrimaryChartData(memData); 
       setSecondaryChartData([]);
    } else {
       // For Overview & Member View: Primary is Category Pie, Secondary is Member Bar (Overview only)
       setPrimaryChartData(catData);
       setSecondaryChartData(viewMode === 'overview' ? memData : []);
    }

  }, [viewMode, selectedFilterId, t]);

  const handleTabChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Reset defaults when switching tabs
    if (mode === 'member' && members.length > 0) setSelectedFilterId(members[0].id);
    if (mode === 'category' && categories.length > 0) setSelectedFilterId(categories[0].id);
  };

  return (
    <div className="pt-safe pb-24 px-4 bg-[#F2F2F7] min-h-screen">
      <header className="pt-4 pb-4">
        <h1 className="text-[34px] font-bold text-slate-900 tracking-tight">{t('analysis')}</h1>
      </header>

      {/* Mode Switcher */}
      <div className="bg-[#E3E3E8] p-1 rounded-xl flex mb-6">
        <button 
          onClick={() => handleTabChange('overview')}
          className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all ${viewMode === 'overview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
        >
          {t('overview')}
        </button>
        <button 
          onClick={() => handleTabChange('member')}
          className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all ${viewMode === 'member' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
        >
          {t('byMember')}
        </button>
        <button 
          onClick={() => handleTabChange('category')}
          className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all ${viewMode === 'category' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
        >
          {t('byCategory')}
        </button>
      </div>

      {/* Sub Filters (Horizontal Scroll) */}
      {viewMode === 'member' && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6 pb-2">
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedFilterId(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                selectedFilterId === m.id
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <span>{m.avatar}</span>
              <span className="text-[14px] font-medium">{m.name}</span>
            </button>
          ))}
        </div>
      )}

      {viewMode === 'category' && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6 pb-2">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedFilterId(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                selectedFilterId === c.id
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <span>{c.icon}</span>
              <span className="text-[14px] font-medium">{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Regret Monitor - Always visible */}
      <ListGroup>
        <div className="p-4 bg-white relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
             <div className="p-1.5 bg-red-100 rounded-md text-red-600">
               <AlertTriangle size={18} />
             </div>
             <span className="text-[15px] font-semibold text-red-600 uppercase tracking-wide">{t('regretMonitor')}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{formatCurrency(wasteTotal)}</span>
            {totalSpend > 0 && (
                 <span className="text-sm text-slate-400">({Math.round((wasteTotal / totalSpend) * 100)}%)</span>
            )}
            <span className="text-slate-500 ml-1">{t('wasted')}</span>
          </div>
        </div>
      </ListGroup>

      {/* Primary Chart Area */}
      <div className="mb-6">
        <h3 className="text-[13px] uppercase text-slate-500 font-normal px-4 mb-2 ml-1">
            {viewMode === 'category' ? t('spendingByMember') : t('spendingByCategory')}
        </h3>
        
        <Card className="p-4">
          <div className="h-64 relative">
             <ResponsiveContainer width="100%" height="100%">
               {viewMode === 'category' ? (
                 <BarChart data={primaryChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                   <Tooltip 
                     cursor={{fill: '#f1f5f9'}}
                     contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                     formatter={(value: number) => formatCurrency(value)} 
                   />
                   <Bar dataKey="value" fill="#007AFF" radius={[0, 4, 4, 0]} barSize={24} />
                 </BarChart>
               ) : (
                 <PieChart>
                    <Pie
                      data={primaryChartData}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {primaryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                      formatter={(value: number) => formatCurrency(value)} 
                    />
                  </PieChart>
               )}
            </ResponsiveContainer>
            
            {/* Center Text for Pie Chart */}
            {viewMode !== 'category' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400 font-medium uppercase">{displayTitle}</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(totalSpend)}</span>
              </div>
            )}
          </div>
          
          {/* Legend for Pie Chart */}
          {viewMode !== 'category' && (
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-6">
              {primaryChartData.slice(0, 6).map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-[13px]">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-600 truncate flex-1">{entry.name}</span>
                  <span className="font-semibold">{Math.round((entry.value / (totalSpend || 1)) * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Secondary Chart Area (Only for Overview - spending by member) */}
      {viewMode === 'overview' && (
        <div className="mb-6">
            <h3 className="text-[13px] uppercase text-slate-500 font-normal px-4 mb-2 ml-1">{t('spendingByMember')}</h3>
            <Card className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={secondaryChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    formatter={(value: number) => formatCurrency(value)} 
                />
                <Bar dataKey="value" fill="#007AFF" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
            </ResponsiveContainer>
            </Card>
        </div>
      )}
    </div>
  );
};

export default StatsPage;