import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMemberById, addMember, updateMember } from '../services/storageService';
import { Member } from '../types';
import { Button, ListGroup } from '../components/ui';
import { ChevronLeft } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const AVATARS = ['🧑', '👩', '👨', '👧', '👦', '👶', '👴', '👵', '👱', '🧔', '🏠', '🐱', '🐶', '🤖', '👻'];

const EditMember: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useSettings();
  const { id } = useParams<{ id: string }>();
  
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  useEffect(() => {
    if (id) {
      const member = getMemberById(id);
      if (member) {
        setName(member.name);
        setAvatar(member.avatar);
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!name) return;

    const member: Member = {
      id: id || Math.random().toString(36).substr(2, 9),
      name,
      avatar
    };

    if (id) {
      updateMember(member);
    } else {
      addMember(member);
    }
    navigate('/settings/members');
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
        <h1 className="text-[17px] font-semibold">{id ? t('editMember') : t('newMember')}</h1>
        <div className="w-16"></div>
      </div>

      <div className="px-4 mt-6">
        
        {/* Preview & Name */}
        <div className="flex flex-col items-center mb-8">
           <div className="w-20 h-20 rounded-full flex items-center justify-center text-5xl mb-4 bg-white shadow-sm border border-slate-100">
             {avatar}
           </div>
           <input 
              type="text" 
              placeholder={t('memberNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center bg-transparent text-2xl font-semibold placeholder-slate-300 focus:outline-none w-full"
              autoFocus
           />
        </div>

        {/* Avatar Picker */}
        <ListGroup title={t('chooseAvatar')}>
          <div className="p-4 grid grid-cols-5 gap-3 justify-items-center">
            {AVATARS.map(av => (
              <button
                key={av}
                onClick={() => setAvatar(av)}
                className={`w-10 h-10 flex items-center justify-center text-2xl rounded-lg transition-transform ${avatar === av ? 'bg-slate-200 scale-110' : ''}`}
              >
                {av}
              </button>
            ))}
          </div>
        </ListGroup>

        <div className="mt-8">
          <Button onClick={handleSave} disabled={!name}>
            {t('saveMember')}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default EditMember;