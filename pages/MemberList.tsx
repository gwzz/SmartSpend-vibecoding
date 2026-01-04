import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMembers, deleteMember } from '../services/storageService';
import { Member } from '../types';
import { ListGroup, ListItem } from '../components/ui';
import { ChevronLeft, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const MemberList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    setMembers(getMembers());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(t('memberDeleteWarn'))) {
      deleteMember(id);
      setMembers(getMembers());
    }
  };

  return (
    <div className="pt-safe pb-10 min-h-screen bg-[#F2F2F7]">
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between sticky top-0 z-50 bg-[#F2F2F7]/90 backdrop-blur-sm">
        <button 
          onClick={() => navigate('/settings')} 
          className="flex items-center text-[#007AFF] active:opacity-50 -ml-2"
        >
          <ChevronLeft size={24} />
          <span className="text-[17px]">{t('settings')}</span>
        </button>
        <h1 className="text-[17px] font-semibold">{t('members')}</h1>
        <button 
          onClick={() => navigate('/settings/members/add')}
          className="text-[#007AFF] active:opacity-50"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="px-4 mt-4">
        <ListGroup title={t('householdMembers')}>
          {members.map((member, index) => (
            <ListItem 
              key={member.id} 
              isLast={index === members.length - 1}
              onClick={() => navigate(`/settings/members/edit/${member.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center text-2xl bg-slate-100 rounded-full">
                  {member.avatar}
                </div>
                <span className="text-[17px] font-medium text-slate-900">{member.name}</span>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                    onClick={(e) => handleDelete(e, member.id)} 
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                   <Trash2 size={18} />
                 </button>
                 <ChevronRight size={20} className="text-slate-300" />
              </div>
            </ListItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};

export default MemberList;