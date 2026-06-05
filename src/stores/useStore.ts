import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Adventurer, Quest, QuestStatus, FilterTag, QuestFormData, LEVEL_MAP, DEFAULT_ADVENTURER } from '../types';
import { databaseService } from '../services/database';
import { notificationService } from '../services/notification';

interface StoreState {
  // 状态
  adventurer: Adventurer | null;
  quests: Quest[];
  currentFilter: FilterTag;
  isLoading: boolean;
  error: string | null;

  // 操作
  initializeApp: () => Promise<void>;
  loadAdventurer: () => Promise<void>;
  loadQuests: (filter?: FilterTag) => Promise<void>;
  updateAdventurer: (updates: Partial<Adventurer>) => Promise<void>;
  createQuest: (formData: QuestFormData) => Promise<void>;
  updateQuest: (id: string, updates: Partial<Quest>) => Promise<void>;
  acceptQuest: (id: string) => Promise<void>;
  completeQuest: (id: string) => Promise<void>;
  abandonQuest: (id: string) => Promise<void>;
  deleteQuest: (id: string) => Promise<void>;
  setFilter: (filter: FilterTag) => Promise<void>;
  checkExpiredQuests: () => Promise<void>;
  exportData: () => Promise<{ user: Adventurer; quests: Quest[] }>;
  importData: (data: { user: Adventurer; quests: Quest[] }) => Promise<void>;
  clearError: () => void;

  // 计算属性
  getFilteredQuests: () => Quest[];
  getCurrentLevel: () => { level: number; title: string; currentExp: number; nextLevelExp: number };
  getMaxConcurrentQuests: () => number;
  getInProgressQuestCount: () => number;
}

export const useStore = create<StoreState>((set, get) => ({
  // 初始状态
  adventurer: null,
  quests: [],
  currentFilter: 'today',
  isLoading: false,
  error: null,

  // 初始化应用
  initializeApp: async () => {
    try {
      set({ isLoading: true, error: null });

      // 初始化数据库
      await databaseService.initialize();

      // 初始化通知服务
      await notificationService.initialize();

      // 加载数据
      await get().loadAdventurer();
      await get().loadQuests();

      // 检查逾期任务
      await get().checkExpiredQuests();

      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: '应用初始化失败' });
      console.error('应用初始化失败:', error);
    }
  },

  // 加载冒险者数据
  loadAdventurer: async () => {
    try {
      const adventurer = await databaseService.getUser();
      if (adventurer) {
        set({ adventurer });
      }
    } catch (error) {
      console.error('加载冒险者数据失败:', error);
    }
  },

  // 加载任务列表
  loadQuests: async (filter?: FilterTag) => {
    try {
      const currentFilter = filter || get().currentFilter;
      let quests: Quest[];

      if (currentFilter === 'today') {
        quests = await databaseService.getTodayQuests();
      } else if (currentFilter === 'all') {
        quests = await databaseService.getQuests('all');
      } else {
        quests = await databaseService.getQuests(currentFilter);
      }

      set({ quests, currentFilter });
    } catch (error) {
      console.error('加载任务列表失败:', error);
    }
  },

  // 更新冒险者信息
  updateAdventurer: async (updates: Partial<Adventurer>) => {
    try {
      await databaseService.updateUser(updates);
      const adventurer = await databaseService.getUser();
      if (adventurer) {
        set({ adventurer });

        // 如果更新了通知设置，重新调度晨间提醒
        if (updates.notificationEnabled !== undefined || updates.morningReminderTime !== undefined) {
          await notificationService.scheduleMorningReminder(adventurer);
        }
      }
    } catch (error) {
      set({ error: '更新冒险者信息失败' });
      console.error('更新冒险者信息失败:', error);
    }
  },

  // 创建新任务
  createQuest: async (formData: QuestFormData) => {
    try {
      const { adventurer } = get();
      if (!adventurer) throw new Error('冒险者数据不存在');

      const quest: Quest = {
        id: uuidv4(),
        title: formData.title,
        description: formData.description || undefined,
        deadline: formData.deadline.toISOString(),
        status: 'todo',
        rewards: formData.rewards,
        exp: formData.exp,
        silentNotification: formData.silentNotification,
        createdAt: new Date().toISOString(),
      };

      await databaseService.createQuest(quest);
      await get().loadQuests();

      console.log('任务创建成功:', quest.id);
    } catch (error) {
      set({ error: '创建任务失败' });
      console.error('创建任务失败:', error);
    }
  },

  // 更新任务
  updateQuest: async (id: string, updates: Partial<Quest>) => {
    try {
      await databaseService.updateQuest(id, updates);
      await get().loadQuests();
    } catch (error) {
      set({ error: '更新任务失败' });
      console.error('更新任务失败:', error);
    }
  },

  // 接受任务
  acceptQuest: async (id: string) => {
    try {
      const { adventurer } = get();
      if (!adventurer) throw new Error('冒险者数据不存在');

      // 检查并行任务上限
      const inProgressCount = get().getInProgressQuestCount();
      const maxConcurrent = get().getMaxConcurrentQuests();

      if (inProgressCount >= maxConcurrent) {
        set({ error: `并行委托已达上限 (当前上限${maxConcurrent})，请先完成或放弃部分任务` });
        return;
      }

      const now = new Date().toISOString();
      await databaseService.updateQuest(id, {
        status: 'in_progress',
        acceptedAt: now,
      });

      // 调度截止预警
      const quest = await databaseService.getQuestById(id);
      if (quest) {
        await notificationService.scheduleDeadlineWarnings(quest);
      }

      await get().loadQuests();
      console.log('任务已接受:', id);
    } catch (error) {
      set({ error: '接受任务失败' });
      console.error('接受任务失败:', error);
    }
  },

  // 完成任务
  completeQuest: async (id: string) => {
    try {
      const { adventurer } = get();
      if (!adventurer) throw new Error('冒险者数据不存在');

      const quest = await databaseService.getQuestById(id);
      if (!quest) throw new Error('任务不存在');

      const now = new Date().toISOString();
      await databaseService.updateQuest(id, {
        status: 'done',
        completedAt: now,
      });

      // 增加经验值
      const newExp = adventurer.experience + quest.exp;
      await databaseService.updateUser({ experience: newExp });

      // 取消截止预警
      await notificationService.cancelDeadlineWarnings(id);

      // 发送完成通知
      await notificationService.sendQuestCompletedNotification(quest);

      // 检查是否升级
      const oldLevel = get().getCurrentLevel().level;
      await get().loadAdventurer();
      const newLevel = get().getCurrentLevel().level;

      if (newLevel > oldLevel) {
        const levelInfo = LEVEL_MAP.find(l => l.level === newLevel);
        if (levelInfo) {
          await notificationService.sendLevelUpNotification(newLevel, levelInfo.title);
        }
      }

      await get().loadQuests();
      console.log('任务已完成:', id);
    } catch (error) {
      set({ error: '完成任务失败' });
      console.error('完成任务失败:', error);
    }
  },

  // 放弃任务
  abandonQuest: async (id: string) => {
    try {
      const now = new Date().toISOString();
      await databaseService.updateQuest(id, {
        status: 'failed',
        completedAt: now,
      });

      // 取消截止预警
      await notificationService.cancelDeadlineWarnings(id);

      await get().loadQuests();
      console.log('任务已放弃:', id);
    } catch (error) {
      set({ error: '放弃任务失败' });
      console.error('放弃任务失败:', error);
    }
  },

  // 删除任务
  deleteQuest: async (id: string) => {
    try {
      await databaseService.deleteQuest(id);
      await get().loadQuests();
      console.log('任务已删除:', id);
    } catch (error) {
      set({ error: '删除任务失败' });
      console.error('删除任务失败:', error);
    }
  },

  // 设置筛选条件
  setFilter: async (filter: FilterTag) => {
    try {
      set({ currentFilter: filter });
      await get().loadQuests(filter);
    } catch (error) {
      console.error('设置筛选条件失败:', error);
    }
  },

  // 检查逾期任务
  checkExpiredQuests: async () => {
    try {
      await notificationService.checkExpiredQuests();
      await get().loadQuests();
    } catch (error) {
      console.error('检查逾期任务失败:', error);
    }
  },

  // 导出数据
  exportData: async () => {
    try {
      return await databaseService.exportData();
    } catch (error) {
      set({ error: '导出数据失败' });
      console.error('导出数据失败:', error);
      throw error;
    }
  },

  // 导入数据
  importData: async (data: { user: Adventurer; quests: Quest[] }) => {
    try {
      await databaseService.importData(data);
      await get().loadAdventurer();
      await get().loadQuests();
      console.log('数据导入成功');
    } catch (error) {
      set({ error: '导入数据失败' });
      console.error('导入数据失败:', error);
    }
  },

  // 清除错误信息
  clearError: () => {
    set({ error: null });
  },

  // 计算属性：获取筛选后的任务
  getFilteredQuests: () => {
    const { quests, currentFilter } = get();

    if (currentFilter === 'today') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      return quests.filter(quest => {
        const deadline = new Date(quest.deadline);
        return deadline >= startOfDay && deadline <= endOfDay &&
               (quest.status === 'todo' || quest.status === 'in_progress');
      });
    }

    return quests;
  },

  // 计算属性：获取当前等级信息
  getCurrentLevel: () => {
    const { adventurer } = get();
    if (!adventurer) {
      return { level: 1, title: '见习冒险者', currentExp: 0, nextLevelExp: 150 };
    }

    const currentExp = adventurer.experience;
    let currentLevel = LEVEL_MAP[0];

    for (let i = LEVEL_MAP.length - 1; i >= 0; i--) {
      if (currentExp >= LEVEL_MAP[i].requiredExp) {
        currentLevel = LEVEL_MAP[i];
        break;
      }
    }

    const nextLevel = LEVEL_MAP.find(l => l.level === currentLevel.level + 1);
    const nextLevelExp = nextLevel ? nextLevel.requiredExp : currentLevel.requiredExp;

    return {
      level: currentLevel.level,
      title: currentLevel.title,
      currentExp,
      nextLevelExp,
    };
  },

  // 计算属性：获取最大并行任务数
  getMaxConcurrentQuests: () => {
    const level = get().getCurrentLevel().level;
    return 3 + level;
  },

  // 计算属性：获取进行中任务数量
  getInProgressQuestCount: () => {
    const { quests } = get();
    return quests.filter(q => q.status === 'in_progress').length;
  },
}));