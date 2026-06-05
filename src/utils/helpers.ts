import { LEVEL_MAP } from '../types';

// 格式化日期时间
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (taskDate.getTime() === today.getTime()) {
    return `今天 ${timeStr}`;
  } else if (taskDate.getTime() === tomorrow.getTime()) {
    return `明天 ${timeStr}`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
};

// 格式化剩余时间
export const formatTimeRemaining = (deadlineString: string): string => {
  const deadline = new Date(deadlineString);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return '已逾期';
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `剩余 ${diffDays}天 ${diffHours}时`;
  } else if (diffHours > 0) {
    return `剩余 ${diffHours}时 ${diffMinutes}分`;
  } else {
    return `剩余 ${diffMinutes}分`;
  }
};

// 检查是否逾期
export const isExpired = (deadlineString: string): boolean => {
  const deadline = new Date(deadlineString);
  const now = new Date();
  return deadline < now;
};

// 计算等级信息（单一数据源）
export const calculateLevel = (experience: number) => {
  let currentLevel = LEVEL_MAP[0];

  for (let i = LEVEL_MAP.length - 1; i >= 0; i--) {
    if (experience >= LEVEL_MAP[i].requiredExp) {
      currentLevel = LEVEL_MAP[i];
      break;
    }
  }

  const nextLevel = LEVEL_MAP.find(l => l.level === currentLevel.level + 1);
  const nextLevelExp = nextLevel ? nextLevel.requiredExp : currentLevel.requiredExp;
  const progress = nextLevel ? (experience - currentLevel.requiredExp) / (nextLevelExp - currentLevel.requiredExp) : 1;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentExp: experience,
    nextLevelExp,
    progress: Math.min(progress, 1),
  };
};

// 验证任务表单
export const validateQuestForm = (formData: {
  title: string;
  deadline: Date;
  exp: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.title.trim()) {
    errors.push('任务标题不能为空');
  }

  if (formData.title.length > 40) {
    errors.push('任务标题不能超过40个字符');
  }

  if (formData.deadline < new Date()) {
    errors.push('截止时间已过，请重新设定');
  }

  if (formData.exp < 1 || formData.exp > 9999) {
    errors.push('经验值必须在1-9999之间');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 格式化经验值
export const formatExp = (exp: number): string => {
  if (exp >= 10000) {
    return `${(exp / 1000).toFixed(1)}k`;
  }
  return exp.toString();
};

// 格式化数字
export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};

// 截断文本
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// 计算任务紧急程度
export const getTaskUrgency = (deadline: string): 'high' | 'medium' | 'low' => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 2) return 'high';
  if (diffHours <= 24) return 'medium';
  return 'low';
};
