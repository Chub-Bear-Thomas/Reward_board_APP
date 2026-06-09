import { Quest, DIFFICULTY_STARS } from '../types'
import { useGuildStore } from '../store/useGuildStore'
import { getCountdown, formatDateTime } from '../utils/time'
import { WaxSeal, Nail } from './Decorations'

interface QuestCardProps {
  quest: Quest
}

const STATUS_CONFIG = {
  pending: { label: '待接取', class: 'stamp-pending', icon: '📜' },
  in_progress: { label: '进行中', class: 'stamp-in-progress', icon: '⚔️' },
  completed: { label: '已完成', class: 'stamp-completed', icon: '✅' },
  failed: { label: '已失败', class: 'stamp-failed', icon: '❌' },
}

export function QuestCard({ quest }: QuestCardProps) {
  const { setSelectedQuestId, notificationSettings } = useGuildStore()
  const countdown = getCountdown(quest.deadline)
  const statusInfo = STATUS_CONFIG[quest.status]
  const isMuted = notificationSettings.mutedQuestIds.includes(quest.id)

  return (
    <div
      className="quest-card p-4 cursor-pointer animate-fade-in relative"
      onClick={() => setSelectedQuestId(quest.id)}
    >
      {/* 角落钉子装饰 */}
      <div className="absolute top-1.5 left-1.5"><Nail size={8} /></div>
      <div className="absolute top-1.5 right-1.5"><Nail size={8} /></div>
      <div className="absolute bottom-1.5 left-1.5"><Nail size={8} /></div>
      <div className="absolute bottom-1.5 right-1.5"><Nail size={8} /></div>

      {/* 顶部：状态戳记 + 难度 + 静音 */}
      <div className="flex items-center justify-between mb-2">
        <span className={`stamp ${statusInfo.class}`}>
          {statusInfo.icon} {statusInfo.label}
        </span>
        <div className="flex items-center gap-1">
          {isMuted && <span className="text-xs" title="已静音">🔕</span>}
          <span className="difficulty-star text-sm">
            {DIFFICULTY_STARS[quest.difficulty]}
          </span>
        </div>
      </div>

      {/* 委托标题 */}
      <h3 className="font-serif font-bold text-wood-800 text-base mb-1 line-clamp-1">
        {quest.title}
      </h3>

      {/* 委托人 NPC */}
      {quest.npcName && (
        <div className="text-xs text-wood-400 mb-1">
          委托人：{quest.npcName}
        </div>
      )}

      {/* 委托描述 */}
      {quest.description && (
        <p className="text-wood-600 text-sm mb-2 line-clamp-2">
          {quest.description}
        </p>
      )}

      {/* 倒计时 */}
      {(quest.status === 'pending' || quest.status === 'in_progress') && (
        <div className={`text-sm mb-2 ${countdown.isUrgent ? 'countdown-urgent' : 'text-wood-600'}`}>
          ⏱️ {countdown.text}
        </div>
      )}

      {/* 完成/失败时间 */}
      {quest.status === 'completed' && quest.completedAt && (
        <div className="text-sm text-guild-emerald mb-2">
          ✅ 完成于 {formatDateTime(quest.completedAt)}
        </div>
      )}
      {quest.status === 'failed' && quest.failedAt && (
        <div className="text-sm text-guild-crimson mb-2">
          ❌ 失败于 {formatDateTime(quest.failedAt)}
        </div>
      )}

      {/* 底部：奖励预览 + 火漆印章 */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-guild-gold/20">
        <div className="flex items-center gap-1 text-sm text-guild-darkGold">
          <span>⭐</span>
          <span>+{quest.expReward} EXP</span>
        </div>
        <div className="flex items-center gap-2">
          {quest.rewards.length > 0 && (
            <div className="flex items-center gap-1">
              {quest.rewards.slice(0, 3).map((r, i) => (
                <span key={i} className="text-lg" title={r.name}>
                  {r.emoji}
                </span>
              ))}
              {quest.rewards.length > 3 && (
                <span className="text-xs text-wood-500">+{quest.rewards.length - 3}</span>
              )}
            </div>
          )}
          {quest.status === 'completed' && (
            <WaxSeal color="#2d6b3f" size={20} />
          )}
          {quest.status === 'failed' && (
            <WaxSeal color="#8b2252" size={20} />
          )}
        </div>
      </div>
    </div>
  )
}
