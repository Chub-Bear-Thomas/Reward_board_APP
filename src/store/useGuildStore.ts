import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Quest,
  QuestDifficulty,
  QuestStatus,
  RewardItem,
  BackpackItem,
  LogEntry,
  Adventurer,
  QuestFilter,
  ActivePage,
  DIFFICULTY_EXP,
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '../types'
import { generateId } from '../utils/id'
import { calculateLevel, getTitle, getPenaltyExp } from '../utils/exp'
import { getCurrentDateStr, getTodayStart, isExpired } from '../utils/time'
import { exportData, importData, GuildBackupData } from '../utils/dataIO'
import { generateNpcName } from '../utils/npc'

interface GuildState {
  // 冒险者
  adventurer: Adventurer

  // 任务列表
  quests: Quest[]

  // 背包
  backpack: BackpackItem[]

  // 日志
  logs: LogEntry[]

  // UI 状态
  activePage: ActivePage
  questFilter: QuestFilter
  selectedQuestId: string | null
  showCreateModal: boolean
  showProfileModal: boolean

  // 通知设置
  notificationSettings: NotificationSettings
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void
  toggleQuestMute: (questId: string) => void

  // 冒险者操作
  updateAdventurer: (updates: Partial<Adventurer>) => void
  addExp: (amount: number) => void
  deductExp: (amount: number) => void

  // 任务操作
  createQuest: (quest: Omit<Quest, 'id' | 'status' | 'npcName' | 'createdAt'>) => void
  acceptQuest: (id: string) => void
  completeQuest: (id: string) => void
  failQuest: (id: string) => void
  abandonQuest: (id: string) => void
  updateQuest: (id: string, updates: Partial<Quest>) => void
  deleteQuest: (id: string) => void

  // 每日检查
  checkExpiredQuests: () => void

  // 背包操作
  addBackpackItem: (item: Omit<BackpackItem, 'id' | 'obtainedAt'>) => void
  removeBackpackItem: (id: string) => void

  // 日志操作
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void

  // 数据导入导出
  exportAllData: () => void
  importAllData: () => Promise<void>
  updateStreak: () => void

  // UI 操作
  setActivePage: (page: ActivePage) => void
  setQuestFilter: (filter: QuestFilter) => void
  setSelectedQuestId: (id: string | null) => void
  setShowCreateModal: (show: boolean) => void
  setShowProfileModal: (show: boolean) => void
}

const defaultAdventurer: Adventurer = {
  name: '无名冒险者',
  avatar: '⚔️',
  level: 1,
  exp: 0,
  title: '见习冒险者',
  totalCompleted: 0,
  totalFailed: 0,
  streak: 0,
  maxDailyExp: 0,
}

export const useGuildStore = create<GuildState>()(
  persist(
    (set, get) => ({
      // 初始状态
      adventurer: defaultAdventurer,
      quests: [],
      backpack: [],
      logs: [],
      activePage: 'quests',
      questFilter: 'today',
      selectedQuestId: null,
      showCreateModal: false,
      showProfileModal: false,
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,

      // 冒险者操作
      updateAdventurer: (updates) =>
        set((state) => ({
          adventurer: { ...state.adventurer, ...updates },
        })),

      addExp: (amount) =>
        set((state) => {
          const newExp = state.adventurer.exp + amount
          const newLevel = calculateLevel(newExp)
          const newTitle = getTitle(newLevel)
          const leveledUp = newLevel > state.adventurer.level

          return {
            adventurer: {
              ...state.adventurer,
              exp: newExp,
              level: newLevel,
              title: newTitle,
            },
          }
        }),

      deductExp: (amount) =>
        set((state) => {
          const newExp = Math.max(0, state.adventurer.exp - amount)
          const newLevel = calculateLevel(newExp)
          const newTitle = getTitle(newLevel)
          return {
            adventurer: {
              ...state.adventurer,
              exp: newExp,
              level: newLevel,
              title: newTitle,
            },
          }
        }),

      // 任务操作
      createQuest: (questData) =>
        set((state) => {
          const newQuest: Quest = {
            ...questData,
            id: generateId(),
            status: 'pending',
            npcName: generateNpcName(),
            createdAt: new Date().toISOString(),
          }
          return { quests: [...state.quests, newQuest] }
        }),

      acceptQuest: (id) =>
        set((state) => {
          // 检查同时接取上限：基础5个，每10级+1
          const maxConcurrent = 5 + Math.floor(state.adventurer.level / 10)
          const currentInProgress = state.quests.filter((q) => q.status === 'in_progress').length
          if (currentInProgress >= maxConcurrent) {
            alert(`同时进行的委托已达上限（${maxConcurrent}个）！请先完成或放弃进行中的委托。`)
            return state
          }
          return {
            quests: state.quests.map((q) =>
              q.id === id
                ? { ...q, status: 'in_progress' as QuestStatus, acceptedAt: new Date().toISOString() }
                : q
            ),
          }
        }),

      completeQuest: (id) =>
        set((state) => {
          const quest = state.quests.find((q) => q.id === id)
          if (!quest || quest.status !== 'in_progress') return state

          // 添加经验
          const newExp = state.adventurer.exp + quest.expReward
          const newLevel = calculateLevel(newExp)
          const newTitle = getTitle(newLevel)

          // 添加奖励到背包
          const newBackpackItems: BackpackItem[] = quest.rewards.map((r) => ({
            id: generateId(),
            name: r.name,
            emoji: r.emoji,
            quantity: r.quantity,
            category: r.category,
            obtainedAt: new Date().toISOString(),
            fromQuestId: quest.id,
          }))

          // 添加日志
          const newLog: LogEntry = {
            id: generateId(),
            date: getCurrentDateStr(),
            questId: quest.id,
            questTitle: quest.title,
            result: 'completed',
            expChange: quest.expReward,
            timestamp: new Date().toISOString(),
          }

          // 更新后的任务列表
          const updatedQuests = state.quests.map((q) =>
            q.id === id
              ? { ...q, status: 'completed' as QuestStatus, completedAt: new Date().toISOString() }
              : q
          )

          // 检查今日全清奖励：所有今日待接取/进行中的任务是否都已完成
          const todayStr = getCurrentDateStr()
          const todayPendingOrInProgress = updatedQuests.filter(
            (q) =>
              (q.status === 'pending' || q.status === 'in_progress') &&
              q.deadline.startsWith(todayStr)
          )
          let allClearBonus = 0
          const allClearLog: LogEntry[] = []
          if (todayPendingOrInProgress.length === 0) {
            // 全清！奖励基础经验的50%
            allClearBonus = Math.floor(quest.expReward * 0.5)
            allClearLog.push({
              id: generateId(),
              date: todayStr,
              questId: 'all-clear',
              questTitle: '🎉 今日全清奖励',
              result: 'completed',
              expChange: allClearBonus,
              timestamp: new Date().toISOString(),
            })
          }

          const finalExp = newExp + allClearBonus
          const finalLevel = calculateLevel(finalExp)
          const finalTitle = getTitle(finalLevel)

          return {
            quests: updatedQuests,
            adventurer: {
              ...state.adventurer,
              exp: finalExp,
              level: finalLevel,
              title: finalTitle,
              totalCompleted: state.adventurer.totalCompleted + 1,
            },
            backpack: [...state.backpack, ...newBackpackItems],
            logs: [...state.logs, newLog, ...allClearLog],
          }
        }),

      failQuest: (id) =>
        set((state) => {
          const quest = state.quests.find((q) => q.id === id)
          if (!quest) return state

          let expChange = 0
          let newExp = state.adventurer.exp

          // 如果开启惩罚，扣除经验
          if (quest.penaltyEnabled) {
            const penalty = getPenaltyExp(quest.expReward)
            newExp = Math.max(0, newExp - penalty)
            expChange = -penalty
          }

          const newLevel = calculateLevel(newExp)
          const newTitle = getTitle(newLevel)

          const newLog: LogEntry = {
            id: generateId(),
            date: getCurrentDateStr(),
            questId: quest.id,
            questTitle: quest.title,
            result: 'failed',
            expChange,
            timestamp: new Date().toISOString(),
          }

          return {
            quests: state.quests.map((q) =>
              q.id === id
                ? { ...q, status: 'failed' as QuestStatus, failedAt: new Date().toISOString() }
                : q
            ),
            adventurer: {
              ...state.adventurer,
              exp: newExp,
              level: newLevel,
              title: newTitle,
              totalFailed: state.adventurer.totalFailed + 1,
            },
            logs: [...state.logs, newLog],
          }
        }),

      abandonQuest: (id) => {
        const state = get()
        const quest = state.quests.find((q) => q.id === id)
        if (!quest) return
        // 放弃等同于失败
        get().failQuest(id)
      },

      updateQuest: (id, updates) =>
        set((state) => ({
          quests: state.quests.map((q) =>
            q.id === id ? { ...q, ...updates } : q
          ),
        })),

      deleteQuest: (id) =>
        set((state) => ({
          quests: state.quests.filter((q) => q.id !== id),
        })),

      // 每日检查：将过期的进行中任务标记为失败
      checkExpiredQuests: () =>
        set((state) => {
          const todayStart = getTodayStart()
          let changed = false
          const updatedQuests = state.quests.map((q) => {
            if (
              (q.status === 'pending' || q.status === 'in_progress') &&
              isExpired(q.deadline)
            ) {
              changed = true
              return { ...q, status: 'failed' as QuestStatus, failedAt: new Date().toISOString() }
            }
            return q
          })

          if (!changed) return state

          // 计算惩罚经验
          const failedQuests = updatedQuests.filter(
            (q) => q.status === 'failed' && q.failedAt && new Date(q.failedAt).toISOString() >= todayStart
          )

          let penaltyTotal = 0
          const newLogs: LogEntry[] = []

          failedQuests.forEach((q) => {
            if (q.penaltyEnabled) {
              penaltyTotal += getPenaltyExp(q.expReward)
            }
            newLogs.push({
              id: generateId(),
              date: getCurrentDateStr(),
              questId: q.id,
              questTitle: q.title,
              result: 'failed',
              expChange: q.penaltyEnabled ? -getPenaltyExp(q.expReward) : 0,
              timestamp: new Date().toISOString(),
            })
          })

          const newExp = Math.max(0, state.adventurer.exp - penaltyTotal)
          const newLevel = calculateLevel(newExp)
          const newTitle = getTitle(newLevel)

          return {
            quests: updatedQuests,
            adventurer: {
              ...state.adventurer,
              exp: newExp,
              level: newLevel,
              title: newTitle,
              totalFailed: state.adventurer.totalFailed + failedQuests.length,
            },
            logs: [...state.logs, ...newLogs],
          }
        }),

      // 背包操作
      addBackpackItem: (item) =>
        set((state) => ({
          backpack: [
            ...state.backpack,
            {
              ...item,
              id: generateId(),
              obtainedAt: new Date().toISOString(),
            },
          ],
        })),

      removeBackpackItem: (id) =>
        set((state) => ({
          backpack: state.backpack.filter((i) => i.id !== id),
        })),

      // 日志操作
      addLog: (entry) =>
        set((state) => ({
          logs: [
            ...state.logs,
            {
              ...entry,
              id: generateId(),
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      // 数据导入导出
      exportAllData: () => {
        const state = get()
        exportData({
          adventurer: state.adventurer,
          quests: state.quests,
          backpack: state.backpack,
          logs: state.logs,
        })
      },

      importAllData: async () => {
        try {
          const data = await importData()
          set({
            adventurer: data.adventurer,
            quests: data.quests,
            backpack: data.backpack,
            logs: data.logs,
          })
        } catch (err) {
          console.error('导入失败:', err)
          alert('数据导入失败，请检查文件格式')
        }
      },

      updateStreak: () =>
        set((state) => {
          const today = getCurrentDateStr()
          const todayLogs = state.logs.filter((l) => l.date === today)
          const todayCompleted = todayLogs.some((l) => l.result === 'completed')
          const todayAllCompleted = todayCompleted && todayLogs.every((l) => l.result === 'completed')

          // 检查昨天是否全部完成
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]
          const yesterdayLogs = state.logs.filter((l) => l.date === yesterdayStr)
          const yesterdayAllCompleted =
            yesterdayLogs.length > 0 && yesterdayLogs.every((l) => l.result === 'completed')

          let newStreak = state.adventurer.streak
          if (todayAllCompleted && !todayCompleted) {
            // 今天还没完成，不更新
          } else if (todayAllCompleted) {
            // 今天全部完成
            newStreak = yesterdayAllCompleted ? newStreak + 1 : 1
          } else if (!todayCompleted && !yesterdayAllCompleted) {
            // 连续中断
            newStreak = 0
          }

          return {
            adventurer: {
              ...state.adventurer,
              streak: newStreak,
            },
          }
        }),

      // 通知设置
      updateNotificationSettings: (updates) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...updates },
        })),

      toggleQuestMute: (questId) =>
        set((state) => {
          const muted = state.notificationSettings.mutedQuestIds
          const newMuted = muted.includes(questId)
            ? muted.filter((id) => id !== questId)
            : [...muted, questId]
          return {
            notificationSettings: {
              ...state.notificationSettings,
              mutedQuestIds: newMuted,
            },
          }
        }),

      // UI 操作
      setActivePage: (page) => set({ activePage: page }),
      setQuestFilter: (filter) => set({ questFilter: filter }),
      setSelectedQuestId: (id) => set({ selectedQuestId: id }),
      setShowCreateModal: (show) => set({ showCreateModal: show }),
      setShowProfileModal: (show) => set({ showProfileModal: show }),
    }),
    {
      name: 'adventurers-guild-storage',
      partialize: (state) => ({
        adventurer: state.adventurer,
        quests: state.quests,
        backpack: state.backpack,
        logs: state.logs,
        notificationSettings: state.notificationSettings,
      }),
    }
  )
)
