import { useGuildStore } from '../store/useGuildStore'
import { getCurrentDateStr } from '../utils/time'

export function Stats() {
  const { adventurer, quests, logs, backpack } = useGuildStore()

  // 统计数据
  const totalQuests = quests.length
  const completedQuests = quests.filter((q) => q.status === 'completed').length
  const failedQuests = quests.filter((q) => q.status === 'failed').length
  const inProgressQuests = quests.filter((q) => q.status === 'in_progress').length
  const pendingQuests = quests.filter((q) => q.status === 'pending').length

  // 完成率
  const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0

  // 今日数据
  const today = getCurrentDateStr()
  const todayLogs = logs.filter((l) => l.date === today)
  const todayCompleted = todayLogs.filter((l) => l.result === 'completed').length
  const todayExp = todayLogs.reduce((sum, l) => sum + l.expChange, 0)

  // 最高单日经验
  const dailyExpMap = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.date] = (acc[log.date] || 0) + log.expChange
    return acc
  }, {})
  const maxDailyExp = Math.max(0, ...Object.values(dailyExpMap))

  // 最常获得的奖励
  const rewardCountMap = backpack.reduce<Record<string, { name: string; emoji: string; count: number }>>((acc, item) => {
    const key = item.name
    if (!acc[key]) {
      acc[key] = { name: item.name, emoji: item.emoji, count: 0 }
    }
    acc[key].count += item.quantity
    return acc
  }, {})
  const topRewards = Object.values(rewardCountMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // 连续完成天数（从 store 读取）
  const streak = adventurer.streak

  const statCards = [
    { label: '累计完成', value: completedQuests, icon: '✅', color: 'text-guild-emerald' },
    { label: '累计失败', value: failedQuests, icon: '❌', color: 'text-guild-crimson' },
    { label: '进行中', value: inProgressQuests, icon: '⚔️', color: 'text-guild-gold' },
    { label: '待接取', value: pendingQuests, icon: '📋', color: 'text-parchment-400' },
    { label: '完成率', value: `${completionRate}%`, icon: '📊', color: 'text-guild-gold' },
    { label: '连续天数', value: streak, icon: '🔥', color: 'text-orange-400' },
    { label: '今日完成', value: todayCompleted, icon: '🎯', color: 'text-guild-emerald' },
    { label: '今日经验', value: todayExp, icon: '⭐', color: 'text-guild-gold' },
    { label: '最高单日', value: maxDailyExp, icon: '🏆', color: 'text-guild-bronze' },
    { label: '背包物品', value: backpack.length, icon: '🎒', color: 'text-parchment-300' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="font-gothic text-xl font-bold text-guild-gold mb-4">
        📊 冒险统计
      </h2>

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="quest-card p-3 text-center">
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-wood-500">{card.label}</div>
          </div>
        ))}
      </div>

      {/* 最常获得的奖励 */}
      {topRewards.length > 0 && (
        <div className="quest-card p-4">
          <h3 className="text-sm font-bold text-wood-700 mb-3">🎁 最常获得的奖励</h3>
          <div className="space-y-2">
            {topRewards.map((reward, index) => (
              <div key={reward.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-wood-500 w-6">#{index + 1}</span>
                  <span className="text-xl">{reward.emoji}</span>
                  <span className="text-sm text-wood-800">{reward.name}</span>
                </div>
                <span className="text-sm font-bold text-guild-gold">×{reward.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
