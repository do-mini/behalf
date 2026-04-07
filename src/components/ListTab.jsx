import React, { useState, useEffect } from 'react';
import { UserPlus, ChevronRight, User } from 'lucide-react';
import MemberDetail from './MemberDetail';
import MemberForm from './MemberForm';
import { getCurrentWeekObj } from '../utils/dateUtils';
import './ListTab.css';

const DUMMY_DATA = [
  {
    id: "1",
    name: "김믿음",
    group: "교회 목장",
    weeklyRequests: [
      {
        week: getCurrentWeekObj().id,
        label: getCurrentWeekObj().label,
        topics: ["예배 회복", "가족 구원", "재정의 축복"]
      }
    ]
  },
  {
    id: "2",
    name: "이소망",
    group: "교회 목장",
    weeklyRequests: [
      {
        week: getCurrentWeekObj().id,
        label: getCurrentWeekObj().label,
        topics: ["직장 이직", "건강 회복", "배우자 만남"]
      }
    ]
  },
  {
    id: "3",
    name: "박사랑",
    group: "회사",
    weeklyRequests: [
       {
        week: getCurrentWeekObj().id,
        label: getCurrentWeekObj().label,
        topics: ["프로젝트 성공", "인간관계의 지혜", "업무 스트레스 해소"]
      }
    ]
  }
];

const GROUPS = ["전체", "교회 목장", "회사", "지인"];

const ListTab = () => {
  const [members, setMembers] = useState([]);
  const [activeGroup, setActiveGroup] = useState("전체");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('behalf_members_v2');
    if (savedData) {
      setMembers(JSON.parse(savedData));
    } else {
      localStorage.setItem('behalf_members_v2', JSON.stringify(DUMMY_DATA));
      setMembers(DUMMY_DATA);
    }
  }, []);

  const saveToStorage = (newMembers) => {
    setMembers(newMembers);
    localStorage.setItem('behalf_members_v2', JSON.stringify(newMembers));
  };

  const handleAddMember = (newMemberData) => {
    const newMember = {
      ...newMemberData,
      id: Date.now().toString(),
    };
    saveToStorage([...members, newMember]);
    setShowAddForm(false);
  };

  const handleUpdateMember = (updatedMember) => {
    const newMembers = members.map(m => m.id === updatedMember.id ? updatedMember : m);
    saveToStorage(newMembers);
    setSelectedMember(updatedMember);
  };

  const filteredMembers = activeGroup === "전체" 
    ? members 
    : members.filter(m => m.group === activeGroup);

  const getPreviewText = (member) => {
    if (!member.weeklyRequests || member.weeklyRequests.length === 0) return "등록된 기도제목이 없습니다";
    const latestWeek = member.weeklyRequests[member.weeklyRequests.length - 1];
    if (!latestWeek.topics || latestWeek.topics.length === 0) return "등록된 기도제목이 없습니다";
    return latestWeek.topics[0];
  };

  if (selectedMember) {
    return (
      <MemberDetail 
        member={selectedMember} 
        onBack={() => setSelectedMember(null)} 
        onUpdateMember={handleUpdateMember}
      />
    );
  }

  return (
    <div className="list-tab-container">
      <header className="screen-header">
        <h1 className="screen-title">목록</h1>
      </header>

      {/* Group Filter Scrollable Tab */}
      <div className="group-filter-container">
        <div className="group-filter-scroll">
          {GROUPS.map(group => (
            <button
              key={group}
              className={`filter-chip ${activeGroup === group ? 'active' : ''}`}
              onClick={() => setActiveGroup(group)}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Member List */}
      <div className="member-list">
        {filteredMembers.length > 0 ? (
          filteredMembers.map(member => (
            <div 
              key={member.id} 
              className="member-card"
              onClick={() => setSelectedMember(member)}
            >
              <div className="member-card-avatar">
                <User size={20} className="text-white" />
              </div>
              <div className="member-card-info">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-preview">
                  {getPreviewText(member)}
                </p>
              </div>
              <ChevronRight size={20} className="chevron-icon" />
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p className="empty-text">이 그룹에 등록된 멤버가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Add Button */}
      <button 
        className="fab-button" 
        aria-label="멤버 추가"
        onClick={() => setShowAddForm(true)}
      >
        <UserPlus size={24} />
      </button>

      {showAddForm && (
        <MemberForm 
          mode="add" 
          onSave={handleAddMember} 
          onCancel={() => setShowAddForm(false)} 
        />
      )}
    </div>
  );
};

export default ListTab;
