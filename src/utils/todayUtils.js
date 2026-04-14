import { getCurrentWeekObj, getLocalFormattedDate } from './dateUtils';

const GROUPS = ["교회 목장", "회사", "지인"];

/**
 * 요일별 순환 논리
 * 월: 0번째 (교회 목장)
 * 화: 1번째 (회사)
 * 수: 2번째 (지인)
 * 목: 0번째
 * 금: 1번째
 * 토: 2번째
 * 일: 0번째
 */
export const getDailyTargetGroup = (date = new Date()) => {
  let day = date.getDay(); // 0: 일요일, 1: 월요일...
  let targetIndex = day - 1;
  if (targetIndex < 0) targetIndex = 6;
  return GROUPS[targetIndex % 3];
};

export const getTargetMember = (members, date = new Date()) => {
  if (!members || members.length === 0) return null;

  const settingsStr = localStorage.getItem('behalf_settings');
  const settings = settingsStr ? JSON.parse(settingsStr) : { rotationMode: 'group' };

  if (settings.rotationMode === 'random') {
    // 안정성을 위해 오늘 날짜 문자열로 간단한 해시를 만들어 고정된 인덱스 도출
    const dayStr = getLocalFormattedDate(date);
    let hash = 0;
    for (let i = 0; i < dayStr.length; i++) {
        hash += dayStr.charCodeAt(i);
    }
    return members[hash % members.length];
  }

  const targetGroup = getDailyTargetGroup(date);
  
  let groupMembers = members.filter(m => m.group === targetGroup);
  
  // 해당 그룹에 멤버가 없으면 전체 멤버 중 오래된 사람 선택
  if (groupMembers.length === 0) {
    groupMembers = [...members];
  }
  
  // lastPrayedAt이 없는 사람 혹은 오래된 사람 순 정렬
  groupMembers.sort((a, b) => {
    const aTime = a.lastPrayedAt || 0;
    const bTime = b.lastPrayedAt || 0;
    return aTime - bTime;
  });
  
  return groupMembers[0] || null;
};

export const getMemberTopicsForCurrentWeek = (member) => {
  if (!member || !member.weeklyRequests || member.weeklyRequests.length === 0) {
    return ["기도제목을 등록해주세요"];
  }

  const sortedRequests = [...member.weeklyRequests].sort((a, b) => b.week.localeCompare(a.week));
  
  for (const req of sortedRequests) {
    if (req.topics && req.topics.length > 0) {
      return req.topics;
    }
  }

  return ["기도제목을 등록해주세요"];
};
