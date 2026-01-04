import React, { useState, useEffect } from 'react';
import { getCategories, getMembers, addTransaction, updateTransaction, getTransactionById, getDaysDiff } from '../services/storageService';
import { Category, Member, Transaction } from '../types';
import { Button, Modal } from '../components/ui';
import { Info, Calendar, Clock, AlertTriangle, StickyNote } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editId?: string | null;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const AddTransactionModal: React.FC<Props> = ({ isOpen, onClose, editId }) => {
  const { t, formatCurrency, settings } = useSettings();
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  
  // Toggle States
  const [isLongTerm, setIsLongTerm] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [isWaste, setIsWaste] = useState(false);
  const [showOptions, setShowOptions] = useState(false); // Collapsed options

  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (isOpen) {
        const cats = getCategories();
        const mems = getMembers();
        setCategories(cats);
        setMembers(mems);

        if (editId) {
            const tx = getTransactionById(editId);
            if (tx) {
                setName(tx.name || '');
                setAmount(tx.amount.toString());
                setCategoryId(tx.categoryId);
                setSelectedMembers(tx.memberIds);
                setDate(tx.date);
                setIsWaste(tx.isWaste);
                setNote(tx.note || '');
                
                // Auto-expand options if there is extra info
                if (tx.endDate || tx.note) {
                    if (tx.endDate) {
                        setIsLongTerm(true);
                        setEndDate(tx.endDate);
                    }
                    setShowOptions(true);
                } else {
                    setShowOptions(false);
                }
            }
        } else {
            // Reset for new
            setName('');
            setAmount('');
            setCategoryId(cats[0]?.id || '');
            const me = mems.find(m => m.name === 'Me');
            setSelectedMembers(me ? [me.id] : []);
            setDate(new Date().toISOString().split('T')[0]);
            setIsLongTerm(false);
            setEndDate('');
            setIsWaste(false);
            setNote('');
            setShowOptions(false);
        }
    }
  }, [isOpen, editId]);

  const toggleMember = (mId: string) => {
    setSelectedMembers(prev => 
      prev.includes(mId) ? prev.filter(m => m !== mId) : [...prev, mId]
    );
  };

  const handleSave = () => {
    if (!amount || !categoryId || selectedMembers.length === 0) return;

    const tx: Transaction = {
      id: editId || generateId(),
      name,
      amount: parseFloat(amount),
      categoryId,
      memberIds: selectedMembers,
      date,
      endDate: isLongTerm && endDate ? endDate : undefined,
      isWaste,
      note,
      timestamp: editId ? (getTransactionById(editId)?.timestamp || Date.now()) : Date.now()
    };

    if (editId) {
        updateTransaction(tx);
    } else {
        addTransaction(tx);
    }
    onClose();
  };

  const dailyCostPreview = isLongTerm && endDate && amount 
    ? parseFloat(amount) / getDaysDiff(date, endDate) 
    : null;

  const currencySymbol = (0).toLocaleString(undefined, { style: 'currency', currency: settings.currency }).replace(/\d|\s|\./g, '');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editId ? t('editExpense') : t('newExpense')}>
        
        {/* Top Section: Amount & Name */}
        <div className="bg-white rounded-xl p-6 mb-4 flex flex-col items-center shadow-sm">
           <div className="inline-flex items-center justify-center relative mb-4">
             <span className="text-3xl font-semibold text-slate-400 mr-2">{currencySymbol}</span>
             <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-40 text-5xl font-semibold text-center bg-transparent border-none p-0 focus:ring-0 placeholder-slate-200 text-slate-900"
              autoFocus={!editId}
            />
           </div>
           
           <input 
              type="text" 
              placeholder={t('whatIsThis')} 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-center bg-slate-50 rounded-lg py-2 px-3 text-[17px] focus:outline-none placeholder-slate-400"
           />
        </div>

        {/* Compact Categories */}
        <div className="mb-4">
          <label className="px-1 text-xs font-semibold text-slate-500 uppercase mb-2 block">{t('category')}</label>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
                {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${
                        categoryId === cat.id ? 'opacity-100 scale-105' : 'opacity-50'
                    }`}
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        categoryId === cat.id ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100'
                    }`}>
                        {cat.icon}
                    </div>
                    <span className={`text-[10px] font-medium truncate w-full text-center ${categoryId === cat.id ? 'text-slate-900' : 'text-slate-500'}`}>
                    {cat.name}
                    </span>
                </button>
                ))}
            </div>
          </div>
        </div>

        {/* Compact Members */}
        <div className="mb-4">
          <label className="px-1 text-xs font-semibold text-slate-500 uppercase mb-2 block">{t('splitBetween')}</label>
          <div className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {members.map(m => {
                const isSelected = selectedMembers.includes(m.id);
                return (
                    <button
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all whitespace-nowrap ${
                        isSelected
                        ? 'bg-[#007AFF] border-[#007AFF] text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                    >
                    <span className="text-sm">{m.avatar}</span>
                    <span className="text-[13px] font-medium">{m.name}</span>
                    </button>
                );
                })}
            </div>
            {amount && selectedMembers.length > 0 && (
                <div className="pl-4 text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    {formatCurrency(parseFloat(amount) / selectedMembers.length)}/p
                </div>
            )}
          </div>
        </div>

        {/* Quick Toggles Bar */}
        <div className="flex gap-3 mb-6 relative z-0">
            <button 
                onClick={() => setShowOptions(!showOptions)}
                className={`relative flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${
                    showOptions ? 'bg-slate-200 text-slate-900' : 'bg-white text-slate-600 shadow-sm'
                }`}
            >
                <Calendar size={18} />
                <span className="text-[13px]">{date === new Date().toISOString().split('T')[0] ? t('today') : date}</span>
                {/* Dot indicator if details are hidden but present */}
                {!showOptions && (isLongTerm || note) && (
                    <div className="absolute top-2 right-3 w-1.5 h-1.5 bg-[#007AFF] rounded-full" />
                )}
            </button>
            
            <button 
                onClick={() => setIsWaste(!isWaste)}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${
                    isWaste ? 'bg-red-500 text-white shadow-sm' : 'bg-white text-slate-600 shadow-sm'
                }`}
            >
                <AlertTriangle size={18} />
                <span className="text-[13px]">{t('regret')}</span>
            </button>
        </div>

        {/* Collapsible Detailed Options */}
        {showOptions && (
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                 {/* Date Picker */}
                 <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <span className="text-sm text-slate-600">{t('date')}</span>
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="text-sm bg-transparent text-right focus:outline-none text-[#007AFF]"
                    />
                 </div>

                 {/* Amortization Toggle */}
                 <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-600">{t('longTerm')}</span>
                    </div>
                    <div 
                        onClick={() => setIsLongTerm(!isLongTerm)}
                        className={`w-[40px] h-[24px] rounded-full p-[2px] cursor-pointer transition-colors ${isLongTerm ? 'bg-[#34C759]' : 'bg-slate-200'}`}
                    >
                        <div className={`w-[20px] h-[20px] bg-white rounded-full shadow-sm transform transition-transform ${isLongTerm ? 'translate-x-[16px]' : 'translate-x-0'}`} />
                    </div>
                 </div>

                 {isLongTerm && (
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                        <span className="text-sm text-slate-600">{t('endsOn')}</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-sm bg-transparent text-right focus:outline-none text-[#007AFF]"
                        />
                    </div>
                 )}
                 
                 {/* Notes Field */}
                 <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <StickyNote size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-600">{t('notes')}</span>
                    </div>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t('addDetails')}
                        className="w-full bg-slate-50 rounded-lg p-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none h-20"
                    />
                 </div>

                 {dailyCostPreview && (
                     <div className="mt-3 bg-blue-50 p-2 rounded-lg flex items-center justify-center gap-2 text-[#007AFF]">
                        <Info size={14} />
                        <span className="text-xs font-semibold">{t('trueCost')}: {formatCurrency(dailyCostPreview)} {t('perDay')}</span>
                     </div>
                 )}
            </div>
        )}

        <Button 
            onClick={handleSave} 
            disabled={!amount || !categoryId || selectedMembers.length === 0}
            className={`${(!amount || !categoryId) ? 'opacity-30' : ''}`}
        >
            {editId ? t('update') : t('save')}
        </Button>
    </Modal>
  );
};

export default AddTransactionModal;