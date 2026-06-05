// 冒险者身份类型
export interface Adventurer {
  id: number;
  nickname: string;
  avatarId: number;
  experience: number;
  morningReminderTime: string; // HH:mm 格式
  notificationEnabled: boolean;
}

// 任务状态类型
export type QuestStatus = 'todo' | 'in_progress' | 'done' | 'failed';

// 奖励物品类型
export interface RewardItem {
  name: string;
  emoji: string;
  quantity: number;
}

// 悬赏任务类型
export interface Quest {
  id: string;
  title: string;
  description?: string;
  deadline: string; // ISO 8601 格式
  status: QuestStatus;
  rewards: RewardItem[];
  exp: number;
  silentNotification: boolean;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

// 通知ID记录类型
export interface NotificationIdRecord {
  questId: string;
  triggerType: 'warning_30' | 'warning_15' | 'warning_5';
  notificationId: string;
}

// 等级系统类型
export interface LevelInfo {
  level: number;
  title: string;
  requiredExp: number;
}

// 筛选标签类型
export type FilterTag = 'today' | 'all' | 'done' | 'failed';

// 表单数据类型
export interface QuestFormData {
  title: string;
  description: string;
  deadline: Date;
  rewards: RewardItem[];
  exp: number;
  silentNotification: boolean;
}

// 等级映射表
export const LEVEL_MAP: LevelInfo[] = [
  { level: 1, title: '见习冒险者', requiredExp: 0 },
  { level: 2, title: '新手冒险者', requiredExp: 150 },
  { level: 3, title: '初级冒险者', requiredExp: 400 },
  { level: 4, title: '独当一面的冒险者', requiredExp: 800 },
  { level: 5, title: '公会骨干', requiredExp: 1500 },
  { level: 6, title: '精英冒险者', requiredExp: 2500 },
  { level: 7, title: '高阶冒险者', requiredExp: 4000 },
  { level: 8, title: '英雄冒险者', requiredExp: 6000 },
  { level: 9, title: '传奇冒险者', requiredExp: 10000 },
  { level: 10, title: '史诗冒险者Ⅰ', requiredExp: 18000 },
  { level: 11, title: '史诗冒险者Ⅱ', requiredExp: 27000 },
  { level: 12, title: '史诗冒险者Ⅲ', requiredExp: 40500 },
  { level: 13, title: '史诗冒险者Ⅳ', requiredExp: 60750 },
  { level: 14, title: '史诗冒险者Ⅴ', requiredExp: 91125 },
  { level: 15, title: '史诗冒险者Ⅵ', requiredExp: 136688 },
  { level: 16, title: '史诗冒险者Ⅶ', requiredExp: 205032 },
  { level: 17, title: '史诗冒险者Ⅷ', requiredExp: 307548 },
  { level: 18, title: '史诗冒险者Ⅸ', requiredExp: 461322 },
  { level: 19, title: '史诗冒险者Ⅹ', requiredExp: 691983 },
  { level: 20, title: '史诗冒险者MAX', requiredExp: 1037975 }
];

// 预设头像ID列表
export const AVATAR_IDS = [0, 1, 2, 3, 4, 5, 6, 7];

// 默认用户数据
export const DEFAULT_ADVENTURER: Adventurer = {
  id: 1,
  nickname: '无名冒险者',
  avatarId: 0,
  experience: 0,
  morningReminderTime: '08:00',
  notificationEnabled: true
};