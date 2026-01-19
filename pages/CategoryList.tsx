import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, deleteCategory } from '../services/storageService';
import { Category } from '../types';
import { ListGroup, ListItem } from '../components/ui';
import { ChevronLeft, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);

  const loadData = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(t('deleteConfirm'))) {
      await deleteCategory(id);
      loadData();
    }
  };

  return (
    <div className="pt-safe pb-10 min-h-screen bg-brand-canvas">
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between sticky top-0 z-50 bg-brand-canvas/90 backdrop-blur-sm">
        <button 
          onClick={() => navigate('/settings')} 
          className="flex items-center text-brand-primary active:opacity-50 -ml-2"
        >
          <ChevronLeft size={24} />
          <span className="text-[17px]">{t('settings')}</span>
        </button>
        <h1 className="text-[17px] font-semibold">{t('categories')}</h1>
        <button 
          onClick={() => navigate('/settings/categories/add')}
          className="text-brand-primary active:opacity-50"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="px-4 mt-4">
        {categories.length === 0 ? (
          <div className="bg-white border border-brand-border rounded-xl p-6 text-center text-brand-muted shadow-soft">
            <p className="mb-4">No categories yet. Create one to keep things organized.</p>
            <button 
              onClick={() => navigate('/settings/categories/add')}
              className="px-4 py-2 rounded-pill bg-brand-primary text-white font-semibold shadow-soft"
            >
              New category
            </button>
          </div>
        ) : (
          <ListGroup title={t('allCategories')}>
            {categories.map((cat, index) => (
              <ListItem 
                key={cat.id} 
                isLast={index === categories.length - 1}
                onClick={() => navigate(`/settings/categories/edit/${cat.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${cat.color}`}>
                    {cat.icon}
                  </div>
                  <span className="text-[17px] font-medium text-slate-900">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                      onClick={(e) => handleDelete(e, cat.id)} 
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                     <Trash2 size={18} />
                   </button>
                   <ChevronRight size={20} className="text-slate-300" />
                </div>
              </ListItem>
            ))}
          </ListGroup>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
