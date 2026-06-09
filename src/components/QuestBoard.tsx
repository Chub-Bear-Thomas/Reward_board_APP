import { useGuildStore } from '../store/useGuildStore'
import { QuestCard } from './QuestCard'
import { QuestFilter } from '../types'
import { isDeadlineToday, isExpired } from '../utils/time'

const FILTER_LABELS: { key: QuestFilter; label: string }[] = [
  { key: 'today', label: '📋 今日悬赏' },
  { key: 'in_progress', label: '⚔️ 进行中' },
  { key: 'all', label: '📜 全部委托' },
  { key: 'completed', label: '✅ 已完成' },
  { key: 'failed', label: '❌ 已失败' },
]

export function QuestBoard() {
  const { quests, questFilter, setQuestFilter, setShowCreateModal } = useGuildStore()

  const filteredQuests = quests
    .filter((q) => {
      switch (questFilter) {
        case 'today':
          return (
            (q.status === 'pending' || q.status === 'in_progress') &&
            (isDeadlineToday(q.deadline) || !isExpired(q.deadline))
          )
        case 'in_progress':
          return q.status === 'in_progress'
        case 'completed':
          return q.status === 'completed'
        case 'failed':
          return q.status === 'failed'
        case 'all':
        default:
          return true
      }
    })
    .sort((a, b) => {
      // 今日视图：进行中优先，然后按截止时间排序
      if (questFilter === 'today') {
        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1
        if (a.status !== 'in_progress' && b.status === 'in_progress') return 1
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      // 其他视图：按创建时间倒序
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setQuestFilter(key)}
            className={`px-3 py-1.5 rounded text-sm transition-all ${
              questFilter === key
                ? 'bg-guild-gold text-wood-900 font-bold shadow-md'
                : 'bg-wood-700/50 text-parchment-300 hover:bg-wood-600/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 任务列表 */}
      {filteredQuests.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-parchment-400 text-lg">
            {questFilter === 'today'
              ? '今日暂无悬赏委托，冒险者可以休息一下~'
              : '暂无委托记录'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-6 py-2 bg-guild-gold text-wood-900 rounded font-bold hover:bg-guild-darkGold transition-colors"
          >
            发布新委托
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      )}

      {/* 悬浮发布按钮 */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="metal-btn fixed bottom-24 right-6 w-14 h-14 text-2xl z-30 flex items-center justify-center"
        title="发布新委托"
      >
        ✒️
      </button>
    </div>
  )
}
