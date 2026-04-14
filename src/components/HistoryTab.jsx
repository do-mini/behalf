import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Flame, Trophy } from 'lucide-react';
import { calculateStreak, getMaxStreak } from '../utils/dateUtils';
import './HistoryTab.css';

const HistoryTab = () => {
  const [historyData, setHistoryData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  useEffect(() => {
    const loadHistory = () => {
      const data = localStorage.getItem('behalf_history');
      if (data) {
        setHistoryData(JSON.parse(data));
      }
    };
    loadHistory();
  }, []);

  const currentStreak = calculateStreak(historyData);
  const maxStreak = getMaxStreak(historyData);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Determine current month's completion count
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const thisMonthCompletions = historyData.filter(h => h.date.startsWith(currentMonthPrefix)).length;

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayStr: dStr, dateNum: i });
    }
    return days;
  };

  const calendarDays = getDaysInMonth();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // Helper for timeline list: From today down to 1st of the month
  const getTimelineData = () => {
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    
    let maxDate = isCurrentMonth ? today.getDate() : new Date(year, month + 1, 0).getDate();
    const timeline = [];

    for (let i = maxDate; i >= 1; i--) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const record = historyData.find(h => h.date === dStr);
      timeline.push({
        dateStr: dStr,
        dayNum: i,
        record: record || null
      });
    }
    return timeline;
  };

  const timelineData = getTimelineData();

  return (
    <div className="history-tab-container">
      <header className="screen-header">
        <h1 className="screen-title">기록</h1>
      </header>

      {/* Streak Summary */}
      <section className="streak-summary-section">
        <div className={`streak-card ${currentStreak >= 30 ? 'gold' : ''}`}>
          <div className="streak-icon-wrap">
            <Flame size={24} className={`streak-main-icon ${currentStreak >= 7 ? 'flame-anim' : ''}`} />
          </div>
          <div className="streak-info">
            <p className="streak-label">현재 연속 기도</p>
            <h3 className="streak-value">{currentStreak}일</h3>
          </div>
        </div>
        
        <div className="streak-card max-streak">
          <div className="streak-icon-wrap trophy">
            <Trophy size={20} className="streak-main-icon text-yellow" />
          </div>
          <div className="streak-info">
            <p className="streak-label">최고 기록</p>
            <h3 className="streak-value">{maxStreak}일</h3>
          </div>
        </div>
      </section>

      {/* Monthly Summary & Calendar Header */}
      <section className="calendar-section">
        <div className="calendar-header">
          <button className="icon-button" onClick={handlePrevMonth}><ChevronLeft size={20} /></button>
          <div className="calendar-title-group">
            <span className="cal-month-title">{month + 1}월</span>
            <span className="cal-summary">기도 {thisMonthCompletions}회</span>
          </div>
          <button className="icon-button" onClick={handleNextMonth}><ChevronRight size={20} /></button>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {weekDays.map(wd => (
            <div key={wd} className="cal-weekday">{wd}</div>
          ))}
          
          {calendarDays.map((dayObj, index) => {
            if (!dayObj) return <div key={`empty-${index}`} className="cal-cell empty"></div>;
            
            const isCompleted = historyData.some(h => h.date === dayObj.dayStr);
            const isToday = new Date().toISOString().split('T')[0] === dayObj.dayStr;

            return (
              <div 
                key={dayObj.dayStr} 
                className={`cal-cell ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}`}
              >
                <span className="cal-date-num">{dayObj.dateNum}</span>
                {isCompleted && <span className="cal-dot"></span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <h2 className="section-title">최근 기록</h2>
        <ul className="timeline-list">
          {timelineData.map(item => (
            <li key={item.dateStr} className={`timeline-item ${item.record ? 'completed' : 'missed'}`}>
              <div className="timeline-icon">
                {item.record ? (
                   <CheckCircle2 size={24} className="text-green" />
                ) : (
                   <Circle size={24} className="text-muted" />
                )}
              </div>
              <div className="timeline-content">
                <span className="timeline-date">{month + 1}월 {item.dayNum}일</span>
                {item.record ? (
                   <p className="timeline-desc"><strong>{item.record.memberName}님</strong>을 위해 기도함</p>
                ) : (
                   <p className="timeline-desc text-muted">기도 미완료</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default HistoryTab;
