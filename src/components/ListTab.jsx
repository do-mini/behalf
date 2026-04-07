import React, { useState, useEffect } from 'react';
import { UserPlus, ChevronRight, User, FileText } from 'lucide-react';
import MemberDetail from './MemberDetail';
import MemberForm from './MemberForm';
import BulkAddForm from './BulkAddForm';
import GroupManager from './GroupManager';
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

const DEFAULT_GROUPS = ["교회 목장", "회사", "지인", "미분류"];

const ListTab = () => {
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState("전체");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkAddForm, setShowBulkAddForm] = useState(false);
  const [showGroupManager, setShowGroupManager] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedGroups = localStorage.getItem('behalf_groups');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    } else {
      localStorage.setItem('behalf_groups', JSON.stringify(DEFAULT_GROUPS));
      setGroups(DEFAULT_GROUPS);
    }

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

  const handleBulkAdd = (parsedData, group) => {
    const currentWeek = getCurrentWeekObj();
    const newMembers = parsedData.map((item, idx) => ({
      id: Date.now().toString() + idx.toString(),
      name: item.name,
      group: group,
      weeklyRequests: [
        {
          week: currentWeek.id,
          label: currentWeek.label,
          topics: item.topics || []
        }
      ]
    }));
    saveToStorage([...members, ...newMembers]);
    setShowBulkAddForm(false);
  };

  const handleUpdateMember = (updatedMember) => {
    const newMembers = members.map(m => m.id === updatedMember.id ? updatedMember : m);
    saveToStorage(newMembers);
    setSelectedMember(updatedMember);
  };

  const handleDeleteMember = (memberId) => {
    const newMembers = members.filter(m => m.id !== memberId);
    saveToStorage(newMembers);

    const savedHistory = localStorage.getItem('behalf_history');
    if (savedHistory) {
       const parsedHistory = JSON.parse(savedHistory);
       const updatedHistory = parsedHistory.filter(h => h.memberId !== memberId);
       localStorage.setItem('behalf_history', JSON.stringify(updatedHistory));
    }

    const todayCache = localStorage.getItem('behalf_today_prayer');
    if (todayCache) {
       const parsedToday = JSON.parse(todayCache);
       if (parsedToday.memberId === memberId) {
          localStorage.removeItem('behalf_today_prayer');
       }
    }

    setSelectedMember(null);
  };

  const handleUpdateGroups = (newGroups, deletedGroup = null) => {
    setGroups(newGroups);
    localStorage.setItem('behalf_groups', JSON.stringify(newGroups));
    
    if (deletedGroup) {
       const updatedMembers = members.map(m => {
           if (m.group === deletedGroup) {
               return { ...m, group: "미분류" };
           }
           return m;
       });
       saveToStorage(updatedMembers);
       if (activeGroup === deletedGroup) {
           setActiveGroup("전체");
       }
    }
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
        groups={groups}
        onBack={() => setSelectedMember(null)} 
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
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
          <button
            className={`filter-chip ${activeGroup === "전체" ? 'active' : ''}`}
            onClick={() => setActiveGroup("전체")}
          >
            전체
          </button>
          {groups.map(group => (
            <button
              key={group}
              className={`filter-chip ${activeGroup === group ? 'active' : ''}`}
              onClick={() => setActiveGroup(group)}
            >
              {group}
            </button>
          ))}
          <button
            className="filter-chip outline"
            onClick={() => setShowGroupManager(true)}
          >
            + 그룹 편집
          </button>
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

      {/* Add Buttons */}
      <div className="fab-container">
        <button 
          className="fab-button secondary" 
          aria-label="기도제목 일괄 파싱 추가"
          onClick={() => setShowBulkAddForm(true)}
        >
          <FileText size={20} />
        </button>
        <button 
          className="fab-button" 
          aria-label="멤버 개별 추가"
          onClick={() => setShowAddForm(true)}
        >
          <UserPlus size={24} />
        </button>
      </div>

      {showAddForm && (
        <MemberForm 
          groups={groups}
          mode="add" 
          onSave={handleAddMember} 
          onCancel={() => setShowAddForm(false)} 
        />
      )}

      {showBulkAddForm && (
        <BulkAddForm 
          groups={groups}
          onSave={handleBulkAdd}
          onCancel={() => setShowBulkAddForm(false)}
        />
      )}

      {showGroupManager && (
         <GroupManager 
           groups={groups}
           onClose={() => setShowGroupManager(false)}
           onUpdateGroups={handleUpdateGroups}
         />
      )}
    </div>
  );
};

export default ListTab;
