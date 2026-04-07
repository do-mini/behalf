import React, { useState, useEffect } from 'react';
import { Heart, Quote, BookOpen, CheckCircle2 } from 'lucide-react';
import { getTargetMember, getMemberTopicsForCurrentWeek } from '../utils/todayUtils';
import './TodayTab.css';

const extractJson = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return null;
  }
};

const TodayTab = () => {
  const [member, setMember] = useState(null);
  const [topics, setTopics] = useState([]);
  const [prayerData, setPrayerData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, ready, completed, error
  const [errorMessage, setErrorMessage] = useState('');
  const [todayDateStr, setTodayDateStr] = useState('');

  useEffect(() => {
    const initializeToday = async () => {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      setTodayDateStr(dateStr);

      // Load members
      const savedMembers = localStorage.getItem('behalf_members_v2');
      if (!savedMembers) {
        setErrorMessage('멤버 데이터가 로컬스토리지에 없습니다.');
        setStatus('error');
        return;
      }

      const parsedMembers = JSON.parse(savedMembers);
      const targetMember = getTargetMember(parsedMembers, today);
      
      if (!targetMember) {
        setErrorMessage('할당할 대상 멤버가 없습니다 (모든 그룹 비어있음).');
        setStatus('error');
        return;
      }
      
      setMember(targetMember);
      const memberTopics = getMemberTopicsForCurrentWeek(targetMember);
      setTopics(memberTopics);

      // Check cache
      const cached = localStorage.getItem('behalf_today_prayer');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (parsedCache.date === dateStr && parsedCache.memberId === targetMember.id) {
          setPrayerData({
            verse: parsedCache.verse,
            prayerText: parsedCache.prayerText
          });
          setStatus(parsedCache.isCompleted ? 'completed' : 'ready');
          return;
        }
      }

      // Generate API prayer
      try {
        const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
        if (!apiKey) {
           throw new Error("Missing API Key");
        }

        const prompt = `대상자 이름: ${targetMember.name}
기도제목: ${memberTopics.join(", ")}

위 대상자와 기도제목을 바탕으로 위로와 격려가 되는 성경 구절 1개와 짧은 기도문을 작성해주세요.
반드시 아래 JSON 형식으로만 응답해야 합니다. 다른 말은 절대 추가하지 마세요.
{
  "verse": {
    "text": "성경 구절 내용",
    "reference": "책 장:절"
  },
  "prayerText": "기도문 내용"
}`;

        const res = await fetch('/api/anthropic/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }]
          })
        });

        if (!res.ok) {
           const errorText = await res.text();
           throw new Error(`API Exception: ${res.status} ${res.statusText} - ${errorText}`);
        }

        const data = await res.json();
        const generatedData = extractJson(data.content[0].text);

        if (!generatedData) throw new Error("Invalid Format");

        setPrayerData(generatedData);
        setStatus('ready');

        // Save cache
        localStorage.setItem('behalf_today_prayer', JSON.stringify({
          date: dateStr,
          memberId: targetMember.id,
          verse: generatedData.verse,
          prayerText: generatedData.prayerText,
          isCompleted: false
        }));

      } catch (err) {
        console.error(err);
        setErrorMessage(err.message);
        // Fallback dummy for error state specifically to keep app working if API fails, but status should be error.
        setStatus('error'); 
      }
    };

    initializeToday();
  }, []);

  const handleComplete = () => {
    // Update local storage for member.lastPrayedAt
    const savedMembers = localStorage.getItem('behalf_members_v2');
    if (savedMembers) {
      let parsed = JSON.parse(savedMembers);
      parsed = parsed.map(m => {
        if (m.id === member.id) {
           return { ...m, lastPrayedAt: Date.now() };
        }
        return m;
      });
      localStorage.setItem('behalf_members_v2', JSON.stringify(parsed));
    }

    // Update today's cache to completed
    const cached = localStorage.getItem('behalf_today_prayer');
    if (cached) {
      const parsedCache = JSON.parse(cached);
      parsedCache.isCompleted = true;
      localStorage.setItem('behalf_today_prayer', JSON.stringify(parsedCache));
    }

    // Update History Tab specific log
    const historyData = JSON.parse(localStorage.getItem('behalf_history') || '[]');
    const dateQuery = new Date().toISOString().split('T')[0];
    const isAlreadyLogged = historyData.some(h => h.date === dateQuery);
    if (!isAlreadyLogged) {
      historyData.push({
        date: dateQuery,
        memberId: member.id,
        memberName: member.name
      });
      localStorage.setItem('behalf_history', JSON.stringify(historyData));
    }

    setStatus('completed');
  };

  if (status === 'error') {
    return (
      <div className="today-tab-container error-state">
        <p>오늘의 기도 대상을 불러오지 못했거나 API 연결에 문제가 있습니다.</p>
        <p style={{ color: '#fca5a5', marginTop: '12px', fontSize: '13px' }}>상세 오류: {errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="today-tab-container">
      {/* Header Section */}
      <header className="today-header">
        {status === 'loading' ? (
           <div className="skeleton-title"></div>
        ) : (
          <>
            <h1 className="today-title">
              오늘은 <span className="highlight-text">{member?.name}님</span>을 위해 기도해요
            </h1>
            <p className="today-subtitle">{todayDateStr} ({member?.group})</p>
          </>
        )}
      </header>

      {/* Prayer Requests Section */}
      <section className="card-section">
        <h2 className="section-title">
          <Heart size={18} className="section-icon text-pink" />
          이번 주 기도제목
        </h2>
        {status === 'loading' ? (
           <div className="skeleton-list">
             <div className="skeleton-line"></div>
             <div className="skeleton-line" style={{ width: '80%' }}></div>
             <div className="skeleton-line" style={{ width: '60%' }}></div>
           </div>
        ) : (
          <ul className="request-list">
            {topics.length > 0 ? topics.map((req, idx) => (
              <li key={idx} className="request-item">
                <span className="bullet-point">{idx + 1}</span>
                <p className="request-text">{req}</p>
              </li>
            )) : (
              <p className="request-text text-muted">기록된 기도제목이 없습니다.</p>
            )}
          </ul>
        )}
      </section>

      {/* Bible Verse Section */}
      <section className="card-section verse-card">
        <h2 className="section-title">
          <BookOpen size={18} className="section-icon text-blue" />
          오늘의 말씀
        </h2>
        {status === 'loading' ? (
          <div className="skeleton-verse">
             <div className="skeleton-line"></div>
             <div className="skeleton-line" style={{ width: '40%', margin: '0 auto' }}></div>
          </div>
        ) : (
          <div className="verse-content">
            <Quote size={24} className="quote-icon" />
            <p className="verse-text">"{prayerData?.verse?.text}"</p>
            <span className="verse-reference">- {prayerData?.verse?.reference} -</span>
          </div>
        )}
      </section>

      {/* Prayer Text Section */}
      <section className="card-section prayer-card">
        <h2 className="section-title">
          <CheckCircle2 size={18} className="section-icon text-green" />
          {status === 'completed' ? '드려진 기도문' : '기도문 작성'}
        </h2>
        {status === 'loading' ? (
           <div className="skeleton-paragraph">
             <div className="skeleton-line"></div>
             <div className="skeleton-line"></div>
             <div className="skeleton-line" style={{ width: '80%' }}></div>
           </div>
        ) : (
          <div className="prayer-content">
            <p>{prayerData?.prayerText}</p>
          </div>
        )}
      </section>

      {/* Complete Button */}
      <div className="action-container">
        {status === 'completed' ? (
           <button className="complete-button success" disabled>
             <CheckCircle2 size={20} className="btn-icon" />
             오늘 기도 완료
           </button>
        ) : (
           <button 
             className="complete-button" 
             onClick={handleComplete}
             disabled={status === 'loading'}
           >
             {status === 'loading' ? '기도문 준비중...' : '기도 완료하기'}
           </button>
        )}
      </div>
    </div>
  );
};

export default TodayTab;
