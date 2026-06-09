// 任务难度等级
export type QuestDifficulty = 'D' | 'C' | 'B' | 'A' | 'S'

// 任务状态
export type QuestStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

// 奖励物品
export interface RewardItem {
  id: string
  name: string
  emoji: string
  quantity: number
  category: string
}

// 悬赏任务
export interface Quest {
  id: string
  title: string
  description: string
  difficulty: QuestDifficulty
  deadline: string // ISO string
  status: QuestStatus
  rewards: RewardItem[]
  expReward: number
  penaltyEnabled: boolean
  npcName: string // 委托人 NPC 名字
  createdAt: string
  acceptedAt?: string
  completedAt?: string
  failedAt?: string
}

// 冒险者信息
export interface Adventurer {
  name: string
  avatar: string // emoji 或图片路径
  level: number
  exp: number
  title: string
  totalCompleted: number
  totalFailed: number
  streak: number // 连续完成天数
  maxDailyExp: number
}

// 背包物品
export interface BackpackItem {
  id: string
  name: string
  emoji: string
  quantity: number
  category: string
  obtainedAt: string
  fromQuestId: string
}

// 冒险日志条目
export interface LogEntry {
  id: string
  date: string // YYYY-MM-DD
  questId: string
  questTitle: string
  result: 'completed' | 'failed'
  expChange: number
  timestamp: string
}

// 等级配置
export interface LevelConfig {
  level: number
  requiredExp: number
  title: string
  unlockTheme?: string
}

// 难度经验值映射
export const DIFFICULTY_EXP: Record<QuestDifficulty, number> = {
  D: 50,
  C: 100,
  B: 200,
  A: 400,
  S: 800,
}

// 难度星级显示
export const DIFFICULTY_STARS: Record<QuestDifficulty, string> = {
  D: '★',
  C: '★★',
  B: '★★★',
  A: '★★★★',
  S: '★★★★★',
}

// 预设等级
export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, requiredExp: 0, title: '见习冒险者' },
  { level: 5, requiredExp: 500, title: '初级冒险者' },
  { level: 10, requiredExp: 2000, title: '独当一面的冒险者' },
  { level: 15, requiredExp: 5000, title: '公会精英' },
  { level: 20, requiredExp: 12000, title: '高阶冒险者' },
  { level: 30, requiredExp: 30000, title: '英雄级冒险者' },
  { level: 50, requiredExp: 80000, title: '传说级冒险者' },
]

// 预设奖励物品分类
export const REWARD_CATEGORIES = [
  '食物',
  '装备',
  '素材',
  '消耗品',
  '收藏品',
  '其他',
]

// 预设头像列表（emoji）
export const AVATAR_OPTIONS = [
  '🧙‍♂️', '🧙‍♀️', '⚔️', '🛡️', '🏹', '🗡️',
  '🧑‍🎤', '👨‍🎤', '👩‍🎤', '🧝‍♂️', '🧝‍♀️',
  '🧛‍♂️', '🧛‍♀️', '🧜‍♂️', '🧜‍♀️', '🧚‍♂️', '🧚‍♀️',
  '👑', '🎭', '🦅', '🐺', '🐉',
]

// 筛选选项
export type QuestFilter = 'today' | 'all' | 'completed' | 'failed' | 'in_progress'

// 底部导航页
export type ActivePage = 'quests' | 'backpack' | 'log' | 'stats' | 'settings'

// 通知设置
export interface NotificationSettings {
  enabled: boolean // 全局通知开关
  morningEnabled: boolean // 早间通知
  morningHour: number // 早间通知小时（0-23）
  deadlineEnabled: boolean // 截止预警
  mutedQuestIds: string[] // 静音的任务ID列表
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  morningEnabled: true,
  morningHour: 8,
  deadlineEnabled: true,
  mutedQuestIds: [],
}
