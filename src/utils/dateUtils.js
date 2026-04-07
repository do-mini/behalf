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
