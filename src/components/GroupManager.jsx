import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import './GroupManager.css';

const DEFAULT_GROUPS = ["교회 목장", "회사", "지인", "미분류"];

const GroupManager = ({ groups, onClose, onUpdateGroups }) => {
  const [newGroup, setNewGroup] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = newGroup.trim();
    if (!trimmed) return;
    
    if (groups.includes(trimmed)) {
      alert('이미 존재하는 그룹 이름입니다.');
      return;
    }
    
    onUpdateGroups([...groups, trimmed]);
    setNewGroup('');
  };

  const handleDelete = (targetGroup) => {
    if (DEFAULT_GROUPS.includes(targetGroup)) return;
    
    if (window.confirm(`'${targetGroup}' 그룹을 삭제하시겠습니까?\n해당 그룹의 멤버들은 모두 '미분류'로 자동 이동됩니다.`)) {
      const updated = groups.filter(g => g !== targetGroup);
      onUpdateGroups(updated, targetGroup);
    }
  };

  return (
    <div className="group-manager-overlay">
      <div className="group-manager-container form-animation-rise">
        <header className="group-manager-header">
          <h2 className="group-manager-title">그룹 편집</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="group-manager-body">
          <form className="group-add-form" onSubmit={handleAdd}>
            <input 
              type="text" 
              className="group-input" 
              placeholder="새로운 그룹 이름 입력" 
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
            />
            <button type="submit" className="group-add-btn" disabled={!newGroup.trim()}>
              <Plus size={18} />
              추가
            </button>
          </form>

          <ul className="group-list">
            {groups.map(g => {
              const isDefault = DEFAULT_GROUPS.includes(g);
              return (
                <li key={g} className="group-list-item">
                  <span className={`group-name ${isDefault ? 'default-group' : ''}`}>{g}</span>
                  {!isDefault && (
                    <button 
                      className="group-delete-btn" 
                      onClick={() => handleDelete(g)}
                      aria-label="Delete Group"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {isDefault && (
                    <span className="group-badge">기본</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GroupManager;
