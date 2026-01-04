import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories, getMembers, addTransaction, updateTransaction, getTransactionById, getDaysDiff } from '../services/storageService';
import { Category, Member, Transaction } from '../types';
import { Button, ListGroup, ListItem } from '../components/ui';
import { ChevronLeft, Info } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const generateId = () => Math.random().toString(36).substr(2, 9);

const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t, formatCurrency, settings } = useSettings();
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLongTerm, setIsLongTerm] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [isWaste, setIsWaste] = useState(false);
  const [note, setNote] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    setCategories(getCategories());
    const loadedMembers = getMembers();
    setMembers(loadedMembers);
    
    if (!id) {
        const me = loadedMembers.find(m => m.name === 'Me');
        if (me) setSelectedMembers([me.id]);
    }

    if (id) {
        const tx = getTransactionById(id);
        if (tx) {
            setName(tx.name || '');
            setAmount(tx.amount.toString());
            setCategoryId(tx.categoryId);
            setSelectedMembers(tx.memberIds);
            setDate(tx.date);
            setIsWaste(tx.isWaste);
            setNote(tx.note);
            if (tx.endDate) {
                setIsLongTerm(true);
                setEndDate(tx.endDate);
            }
        }
    }
  }, [id]);

  const toggleMember = (mId: string) => {
    setSelectedMembers(prev => 
      prev.includes(mId) ? prev.filter(m => m !== mId) : [...prev, mId]
    );
  };

  const handleSave = () => {
    if (!amount || !categoryId || selectedMembers.length === 0) return;

    const tx: Transaction = {
      id: id || generateId(),
      name,
      amount: parseFloat(amount),
      categoryId,
      memberIds: selectedMembers,
      date,
      endDate: isLongTerm && endDate ? endDate : undefined,
      isWaste,
      note,
      timestamp: id ? (getTransactionById(id)?.timestamp || Date.now()) : Date.now()
    };

    if (id) {
        updateTransaction(tx);
    } else {
        addTransaction(tx);
    }
    navigate('/');
  };

  const dailyCostPreview = isLongTerm && endDate && amount 
    ? parseFloat(amount) / getDaysDiff(date, endDate) 
    : null;

  const currencySymbol = (0).toLocaleString(undefined, { style: 'currency', currency: settings.currency }).replace(/\d|\s|\./g, '');

  return (
    <div className="pt-safe pb-24 min-h-screen bg-[#F2F2F7]">
      {id ? (
        <div className="px-4 py-2 flex items-center justify-between sticky top-0 z-50 bg-[#F2F2F7]/90 backdrop-blur-sm">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-[#007AFF] active:opacity-50 -ml-2"
          >
            <ChevronLeft size={24} />
            <span className="text-[17px]">{t('back')}</span>
          </button>
          <h1 className="text-[17px] font-semibold">{t('editExpense')}</h1>
          <div className="w-16"></div>
        </div>
      ) : (
        <header className="px-4 pt-4 pb-6 sticky top-0 z-40 bg-[#F2F2F7]">
          <h1 className="text-[34px] font-bold text-slate-900 tracking-tight">{t('newExpense')}</h1>
        </header>
      )}

      <div className="px-4 mt-4">
        
        <div className="mb-8 text-center">
           <div className="inline-flex items-center justify-center relative">
             <span className="text-3xl font-semibold text-slate-400 absolute left-[-32px] top-1/2 -translate-y-1/2">{currencySymbol}</span>
             <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-48 text-5xl font-semibold text-center bg-transparent border-none p-0 focus:ring-0 placeholder-slate-300"
              autoFocus={!id}
            />
           </div>
           
           <div className="mt-4 border-b border-slate-300 w-3/4 mx-auto pb-1">
             <input 
                type="text" 
                placeholder={t('whatIsThis')} 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-center bg-transparent text-[17px] focus:outline-none placeholder-slate-400"
             />
           </div>
        </div>

        <ListGroup title={t('category')}>
          <div className="p-3 grid grid-cols-4 gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all active:scale-95 ${
                  categoryId === cat.id ? 'bg-slate-100' : ''
                }`}
              >
                <span className={`text-2xl mb-1 ${categoryId === cat.id ? 'scale-110' : 'opacity-80'}`}>{cat.icon}</span>
                <span className={`text-[10px] font-medium truncate w-full text-center ${categoryId === cat.id ? 'text-slate-900' : 'text-slate-500'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </ListGroup>

        <ListGroup title={t('splitBetween')}>
          <div className="p-3 flex gap-3 overflow-x-auto no-scrollbar">
            {members.map(m => {
              const isSelected = selectedMembers.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
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
            <div className="px-4 pb-3 text-[11px] text-slate-400 text-right">
              {formatCurrency(parseFloat(amount) / selectedMembers.length)} {t('perPerson')}
            </div>
          )}
        </ListGroup>

        <ListGroup title={t('date')}>
          <ListItem>
             <span className="text-[16px]">{t('date')}</span>
             <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-[16px] text-[#007AFF] bg-transparent text-right focus:outline-none"
             />
          </ListItem>
          
          <ListItem>
            <div className="flex justify-between w-full items-center">
              <span className="text-[16px]">{t('longTerm')}</span>
              <div 
                onClick={() => setIsLongTerm(!isLongTerm)}
                className={`w-[51px] h-[31px] rounded-full p-[2px] cursor-pointer transition-colors duration-200 ease-in-out ${isLongTerm ? 'bg-[#34C759]' : 'bg-[#E9E9EA]'}`}
              >
                <div className={`w-[27px] h-[27px] bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isLongTerm ? 'translate-x-[20px]' : 'translate-x-0'}`} />
              </div>
            </div>
          </ListItem>

          {isLongTerm && (
             <ListItem isLast={!dailyCostPreview}>
               <span className="text-[16px]">{t('endsOn')}</span>
               <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-[16px] text-[#007AFF] bg-transparent text-right focus:outline-none"
               />
             </ListItem>
          )}

          {dailyCostPreview && (
            <div className="bg-blue-50/50 p-3 flex items-center justify-center gap-2 text-[#007AFF]">
               <Info size={14} />
               <span className="text-[13px] font-medium">{t('trueCost')}: {formatCurrency(dailyCostPreview)} {t('perDay')}</span>
            </div>
          )}
        </ListGroup>

        <ListGroup title={t('reflection')}>
           <ListItem isLast>
            <div className="flex justify-between w-full items-center">
              <span className="text-[16px] text-red-500">{t('regret')}</span>
              <div 
                onClick={() => setIsWaste(!isWaste)}
                className={`w-[51px] h-[31px] rounded-full p-[2px] cursor-pointer transition-colors duration-200 ease-in-out ${isWaste ? 'bg-red-500' : 'bg-[#E9E9EA]'}`}
              >
                <div className={`w-[27px] h-[27px] bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isWaste ? 'translate-x-[20px]' : 'translate-x-0'}`} />
              </div>
            </div>
          </ListItem>
        </ListGroup>

        <ListGroup title={t('notes')}>
          <div className="p-0">
            <textarea
              placeholder={t('addDetails')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-24 p-4 text-[16px] resize-none focus:outline-none bg-transparent"
            />
          </div>
        </ListGroup>

        <div className="pt-2 pb-6">
          <Button 
            onClick={handleSave} 
            disabled={!amount || !categoryId || selectedMembers.length === 0}
            className={`${(!amount || !categoryId) ? 'opacity-30' : ''}`}
          >
            {id ? t('updateExpense') : t('saveExpense')}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default AddTransaction;