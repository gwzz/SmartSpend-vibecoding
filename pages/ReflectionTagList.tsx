import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReflectionTags, deleteReflectionTag } from '../services/storageService';
import { ReflectionTag } from '../types';
import { ListGroup, ListItem } from '../components/ui';
import { ChevronLeft, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const ReflectionTagList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [tags, setTags] = useState<ReflectionTag[]>([]);

  const loadData = async () => {
    const data = await getReflectionTags();
    setTags(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(t('deleteConfirm'))) {
      await deleteReflectionTag(id);
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
        <h1 className="text-[17px] font-semibold">{t('reflectionTags')}</h1>
        <button
          onClick={() => navigate('/settings/reflection-tags/add')}
          className="text-brand-primary active:opacity-50"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="px-4 mt-4">
        {tags.length === 0 ? (
          <div className="bg-white border border-brand-border rounded-xl p-6 text-center text-brand-muted shadow-soft">
            <p className="mb-4">No reflection tags yet. Add tags to capture spend sentiment.</p>
            <button 
              onClick={() => navigate('/settings/reflection-tags/add')}
              className="px-4 py-2 rounded-pill bg-brand-primary text-white font-semibold shadow-soft"
            >
              Add tag
            </button>
          </div>
        ) : (
          <ListGroup title={t('reflectionTags')}>
            {tags.map((tag, index) => (
              <ListItem
                key={tag.id}
                isLast={index === tags.length - 1}
                onClick={() => navigate(`/settings/reflection-tags/edit/${tag.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${tag.color}`}>
                    {tag.icon || '🏷️'}
                  </div>
                  <span className="text-[17px] font-medium text-slate-900">{tag.name}</span>
                </div>
                <div className="flex items-center gap-2">
                   <button
                      onClick={(e) => handleDelete(e, tag.id)}
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

export default ReflectionTagList;
