import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReflectionTagById, addReflectionTag, updateReflectionTag } from '../services/storageService';
import { CATEGORY_COLORS } from '../constants';
import { ReflectionTag } from '../types';
import { Button, ListGroup } from '../components/ui';
import { ChevronLeft } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const EditReflectionTag: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useSettings();
  const { id } = useParams<{ id: string }>();

  const [name, setName] = useState('');
  const [colorId, setColorId] = useState(CATEGORY_COLORS[0].id);
  const [icon, setIcon] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const tag = await getReflectionTagById(id);
        if (tag) {
          setName(tag.name);
          setIcon(tag.icon || '');
          const col = CATEGORY_COLORS.find(c => c.class === tag.color);
          if (col) setColorId(col.id);
        }
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!name) return;
    setLoading(true);

    const colorObj = CATEGORY_COLORS.find(c => c.id === colorId) || CATEGORY_COLORS[0];
    const tag: ReflectionTag = {
      id: id || Math.random().toString(36).substr(2, 9),
      name,
      color: colorObj.class,
      icon: icon || undefined,
    };

    if (id) {
      await updateReflectionTag(tag);
    } else {
      await addReflectionTag(tag);
    }

    setLoading(false);
    navigate('/settings/reflection-tags');
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
        <h1 className="text-[17px] font-semibold">{id ? t('editReflectionTag') : t('newReflectionTag')}</h1>
        <div className="w-16"></div>
      </div>

      <div className="px-4 mt-6">
        <div className="flex flex-col items-center mb-8">
           <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm ${CATEGORY_COLORS.find(c => c.id === colorId)?.class}`}>
             {icon || '🏷️'}
           </div>
           <input
              type="text"
              placeholder={t('reflectionTagNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center bg-transparent text-2xl font-semibold placeholder-slate-300 focus:outline-none w-full"
              autoFocus
           />
           <input
              type="text"
              placeholder={t('emojiOptional')}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="mt-3 text-center bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm w-full max-w-xs"
              maxLength={2}
           />
        </div>

        <ListGroup title={t('color')}>
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

        <div className="mt-8">
          <Button onClick={handleSave} disabled={!name || loading}>
            {loading ? 'Saving...' : t('saveReflectionTag')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditReflectionTag;
