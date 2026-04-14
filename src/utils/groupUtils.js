const BASE_COLORS = {
  "교회 목장": "#6366f1",
  "회사": "#3b82f6",
  "지인": "#10b981",
  "미분류": "#6b7280"
};

const EXTRA_COLORS = ["#f59e0b", "#ef4444", "#ec4899"];

export const getGroupColor = (groupName, allGroups = []) => {
  if (BASE_COLORS[groupName]) {
    return BASE_COLORS[groupName];
  }
  
  // Custom groups
  const customGroups = allGroups.filter(g => !BASE_COLORS[g]);
  const index = customGroups.indexOf(groupName);
  
  if (index === -1) {
    return EXTRA_COLORS[0];
  }
  return EXTRA_COLORS[index % EXTRA_COLORS.length];
};

export const getGroupInitial = (groupName) => {
  if (!groupName) return "?";
  return groupName.charAt(0);
};
