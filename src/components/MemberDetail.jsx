import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Heart, Edit2, Trash2, ChevronLeft, ChevronRight, Plus, Check, X } from 'lucide-react';
import MemberForm from './MemberForm';
import { getCurrentWeekObj, getWeekObjFromId, getAdjacentWeekId } from '../utils/dateUtils';
import './MemberDetail.css';

const MemberDetail = ({ member, onBack, onUpdateMember }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(() => getCurrentWeekObj());
  
  // Inline editing states
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editText, setEditText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTopicText, setNewTopicText] = useState('');

  if (!member) return null;

  // Find requests for the selected week
  const currentWeekData = member.weeklyRequests?.find(wr => wr.week === selectedWeek.id) || {
    week: selectedWeek.id,
    label: selectedWeek.label,
    topics: []
  };

  const handleWeekChange = (direction) => {
    const newId = getAdjacentWeekId(selectedWeek.id, direction);
    const newWeekObj = getWeekObjFromId(newId);
    setSelectedWeek(newWeekObj);
    // Reset editing states
    setEditingIndex(-1);
    setIsAdding(false);
  };

  const saveUpdatedRequests = (newTopics) => {
    let updatedWeekly = [...(member.weeklyRequests || [])];
    const weekIndex = updatedWeekly.findIndex(wr => wr.week === selectedWeek.id);
    
    if (weekIndex >= 0) {
      if (newTopics.length === 0) {
        // If empty, we can remove the week obj to keep it clean
        updatedWeekly.splice(weekIndex, 1);
      } else {
        updatedWeekly[weekIndex] = { ...updatedWeekly[weekIndex], topics: newTopics };
      }
    } else if (newTopics.length > 0) {
      updatedWeekly.push({
        week: selectedWeek.id,
        label: selectedWeek.label,
        topics: newTopics
      });
    }

    onUpdateMember({
      ...member,
      weeklyRequests: updatedWeekly
    });
  };

  const handleAddTopic = () => {
    if (!newTopicText.trim()) return;
    saveUpdatedRequests([...currentWeekData.topics, newTopicText]);
    setNewTopicText('');
    setIsAdding(false);
  };

  const handleEditSave = (index) => {
    if (!editText.trim()) return;
    const newTopics = [...currentWeekData.topics];
    newTopics[index] = editText;
    saveUpdatedRequests(newTopics);
    setEditingIndex(-1);
  };

  const handleDeleteTopic = (index) => {
    const newTopics = currentWeekData.topics.filter((_, i) => i !== index);
    saveUpdatedRequests(newTopics);
  };

  const handleMemberEditSave = (updatedData) => {
    onUpdateMember(updatedData);
    setShowEditForm(false);
  };

  return (
    <div className="member-detail-container">
      {/* Header */}
      <header className="detail-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <h1 className="detail-title">멤버 상세</h1>
        <div className="header-actions">
          <button className="icon-button" aria-label="Edit" onClick={() => setShowEditForm(true)}>
            <Edit2 size={20} />
          </button>
          {/* A global delete member could go here, but let's keep UI simple */}
        </div>
      </header>

      {/* Profile Info */}
      <section className="profile-section">
        <div className="profile-avatar">
          <User size={40} className="avatar-icon" />
        </div>
        <h2 className="profile-name">{member.name}</h2>
        <span className="profile-group">{member.group}</span>
      </section>

      {/* Week Navigation */}
      <div className="week-navigator">
        <button className="week-btn" onClick={() => handleWeekChange('prev')}>
          <ChevronLeft size={20} />
        </button>
        <span className="week-label">{selectedWeek.label}</span>
        <button className="week-btn" onClick={() => handleWeekChange('next')}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Prayer Requests for the week */}
      <section className="requests-section">
        <h3 className="section-subtitle">
          <Heart size={18} className="text-pink" />
          이번 주 기도제목
        </h3>
        
        {currentWeekData.topics.length > 0 ? (
          <ul className="detail-request-list">
            {currentWeekData.topics.map((req, idx) => (
              <li key={idx} className="detail-request-item">
                <span className="request-number">{idx + 1}</span>
                
                {editingIndex === idx ? (
                  <div className="inline-edit">
                    <input 
                      type="text"
                      className="inline-input"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      autoFocus
                    />
                    <button className="inline-action save" onClick={() => handleEditSave(idx)}><Check size={16} /></button>
                    <button className="inline-action cancel" onClick={() => setEditingIndex(-1)}><X size={16} /></button>
                  </div>
                ) : (
                  <div className="topic-display">
                    <p className="request-text">{req}</p>
                    <div className="topic-actions">
                       <button className="topic-btn" onClick={() => { setEditingIndex(idx); setEditText(req); }}>
                         <Edit2 size={14} />
                       </button>
                       <button className="topic-btn delete" onClick={() => handleDeleteTopic(idx)}>
                         <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-requests">
            <p>기록된 기도제목이 없습니다.</p>
          </div>
        )}

        {/* Add new topic */}
        {isAdding ? (
          <div className="inline-add">
             <input 
               type="text"
               className="inline-input"
               placeholder="새 기도제목 입력..."
               value={newTopicText}
               onChange={e => setNewTopicText(e.target.value)}
               autoFocus
             />
             <button className="inline-action save" onClick={handleAddTopic} disabled={!newTopicText.trim()}><Check size={16} /></button>
             <button className="inline-action cancel" onClick={() => { setIsAdding(false); setNewTopicText(''); }}><X size={16} /></button>
          </div>
        ) : (
          <button className="add-topic-btn" onClick={() => setIsAdding(true)}>
             <Plus size={16} /> 기도제목 추가
          </button>
        )}
      </section>

      {/* Action Button */}
      <div className="detail-actions">
        <button className="pray-now-button">
          이 분을 위해 기도하기
        </button>
      </div>

      {showEditForm && (
        <MemberForm 
          mode="edit" 
          initialData={member}
          onSave={handleMemberEditSave} 
          onCancel={() => setShowEditForm(false)} 
        />
      )}
    </div>
  );
};

export default MemberDetail;
