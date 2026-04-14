export const getCurrentWeekObj = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const week = Math.ceil(date.getDate() / 7);
  
  const id = `${year}-${String(month).padStart(2, '0')}-W${week}`;
  const label = `${year}년 ${month}월 ${week}째주`;
  return { id, label };
};

export const getWeekObjFromId = (weekId) => {
  if (!weekId) return null;
  const [year, monthPart, weekPart] = weekId.split('-');
  const month = parseInt(monthPart, 10);
  const week = parseInt(weekPart.replace('W', ''), 10);
  return {
    id: weekId,
    label: `${year}년 ${month}월 ${week}째주`
  };
};

export const getAdjacentWeekId = (weekId, direction) => {
   const [yearStr, monthStr, weekStr] = weekId.split('-');
   let year = parseInt(yearStr, 10);
   let month = parseInt(monthStr, 10);
   let week = parseInt(weekStr.replace('W', ''), 10);

   if (direction === 'prev') {
       week -= 1;
       if (week < 1) {
           month -= 1;
           if (month < 1) {
               month = 12;
               year -= 1;
           }
           week = 5; 
       }
   } else {
       week += 1;
       if (week > 5) {
           week = 1;
           month += 1;
           if (month > 12) {
               month = 1;
               year += 1;
           }
       }
   }
   return `${year}-${String(month).padStart(2, '0')}-W${week}`;
};

export const calculateStreak = (historyData) => {
  if (!historyData || historyData.length === 0) return 0;
  
  const uniqueDates = [...new Set(historyData.map(h => h.date))].sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date();
  
  if (!uniqueDates.includes(todayStr)) {
     checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (uniqueDates.includes(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const getMaxStreak = (historyData) => {
  if (!historyData || historyData.length === 0) return 0;
  
  const uniqueDates = [...new Set(historyData.map(h => h.date))].sort();
  if (uniqueDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i-1]);
    const currDate = new Date(uniqueDates[i]);
    
    // Handle timezone differences carefully when comparing adjacent days using Date objects
    // Better way is to use UTC to calculate precise diff in days
    const utcPrev = Date.UTC(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
    const utcCurr = Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
    const diffDays = Math.floor((utcCurr - utcPrev) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
};
