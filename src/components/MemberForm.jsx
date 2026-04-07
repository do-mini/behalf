import React, { useState } from 'react';
import { X } from 'lucide-react';
import { getCurrentWeekObj } from '../utils/dateUtils';
import './MemberForm.css';

const GROUPS = ["교회 목장", "회사", "지인"];

const MemberForm = ({ mode, initialData = null, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [group, setGroup] = useState(initialData?.group || GROUPS[0]);
  const [requests, setRequests] = useState(['', '', '']); // Up to 3 requests for add mode

  const handleRequestChange = (index, value) => {
    const newReqs = [...requests];
    newReqs[index] = value;
    setRequests(newReqs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (mode === 'add') {
      const validRequests = requests.filter(r => r.trim() !== '');
      const weeklyRequests = [];
      
      if (validRequests.length > 0) {
        const currentWeek = getCurrentWeekObj();
        weeklyRequests.push({
          week: currentWeek.id,
          label: currentWeek.label,
          topics: validRequests
        });
      }

      onSave({
        name,
        group,
        weeklyRequests
      });
    } else {
      // Edit mode (only name and group updated)
      onSave({
        ...initialData,
        name,
        group
      });
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-container form-animation-rise">
        <header className="form-header">
          <h2 className="form-title">{mode === 'add' ? '멤버 추가' : '멤버 수정'}</h2>
          <button className="icon-button" onClick={onCancel} aria-label="Cancel">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label className="form-label">이름</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="멤버 이름 입력" 
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">그룹 선택</label>
            <select 
              className="form-select" 
              value={group}
              onChange={e => setGroup(e.target.value)}
            >
              {GROUPS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {mode === 'add' && (
            <div className="form-group">
              <label className="form-label">초기 기도제목 (최대 3개)</label>
              <div className="request-inputs">
                {requests.map((req, idx) => (
                  <input 
                    key={idx}
                    type="text" 
                    className="form-input" 
                    placeholder={`기도제목 ${idx + 1}`} 
                    value={req}
                    onChange={e => handleRequestChange(idx, e.target.value)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>취소</button>
            <button type="submit" className="btn-save" disabled={!name.trim()}>
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
