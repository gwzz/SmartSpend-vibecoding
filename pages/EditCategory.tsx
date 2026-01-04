import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategoryById, addCategory, updateCategory } from '../services/storageService';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import { Category } from '../types';
import { Button, ListGroup } from '../components/ui';
import { ChevronLeft } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const EditCategory: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useSettings();
  const { id } = useParams<{ id: string }>();
  
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [colorId, setColorId] = useState(CATEGORY_COLORS[0].id);

  useEffect(() => {
    if (id) {
      const cat = getCategoryById(id);
      if (cat) {
        setName(cat.name);
        setIcon(cat.icon);
        // Find color id from class string
        const col = CATEGORY_COLORS.find(c => c.class === cat.color);
        if (col) setColorId(col.id);
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!name) return;

    const colorObj = CATEGORY_COLORS.find(c => c.id === colorId) || CATEGORY_COLORS[0];
    
    const cat: Category = {
      id: id || Math.random().toString(36).substr(2, 9),
      name,
      icon,
      color: colorObj.class
    };

    if (id) {
      updateCategory(cat);
    } else {
      addCategory(cat);
    }
    navigate('/settings/categories');
  };

  return (
    <div className="pt-safe pb-10 min-h-screen bg-[#F2F2F7]">
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between sticky top-0 z-50 bg-[#F2F2F7]/90 backdrop-blur-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-[#007AFF] active:opacity-50 -ml-2"
        >
          <ChevronLeft size={24} />
          <span className="text-[17px]">{t('back')}</span>
        </button>
        <h1 className="text-[17px] font-semibold">{id ? t('editCategory') : t('newCategory')}</h1>
        <div className="w-16"></div>
      </div>

      <div className="px-4 mt-6">
        
        {/* Preview & Name */}
        <div className="flex flex-col items-center mb-8">
           <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm ${CATEGORY_COLORS.find(c => c.id === colorId)?.class}`}>
             {icon}
           </div>
           <input 
              type="text" 
              placeholder={t('categoryNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center bg-transparent text-2xl font-semibold placeholder-slate-300 focus:outline-none w-full"
              autoFocus
           />
        </div>

        {/* Color Picker */}
        <ListGroup title="Color">
          <div className="p-4 flex flex-wrap gap-4 justify-center">
            {CATEGORY_COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setColorId(c.id)}
                className={`w-10 h-10 rounded-full transition-transform ${colorId === c.id ? 'scale-110 ring-2 ring-offset-2 ring-[#007AFF]' : ''}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </ListGroup>

        {/* Icon Picker */}
        <ListGroup title="Icon">
          <div className="p-2 grid grid-cols-6 gap-2">
            {CATEGORY_ICONS.map(ic => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={`w-10 h-10 flex items-center justify-center text-2xl rounded-lg transition-colors ${icon === ic ? 'bg-slate-100' : ''}`}
              >
                {ic}
              </button>
            ))}
          </div>
        </ListGroup>

        <div className="mt-8">
          <Button onClick={handleSave} disabled={!name}>
            {t('saveCategory')}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default EditCategory;