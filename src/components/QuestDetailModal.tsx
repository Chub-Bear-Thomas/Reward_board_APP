import { useState, useEffect } from 'react'
import { useGuildStore } from '../store/useGuildStore'
import { DIFFICULTY_STARS } from '../types'
import { getCountdown, formatDateTime } from '../utils/time'
import { useSound } from '../hooks/useSound'
import { EditQuestModal } from './EditQuestModal'

export function QuestDetailModal() {
  const {
    quests,
    selectedQuestId,
    setSelectedQuestId,
    acceptQuest,
    completeQuest,
    failQuest,
    deleteQuest,
    notificationSettings,
    toggleQuestMute,
  } = useGuildStore()
  const sound = useSound()

  const quest = quests.find((q) => q.id === selectedQuestId)
  const [countdownText, setCountdownText] = useState('')
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    if (!quest) return
    const update = () => {
      const cd = getCountdown(quest.deadline)
      setCountdownText(cd.text)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [quest])

  if (!quest) return null

  const countdown = getCountdown(quest.deadline)

  const handleClose = () => setSelectedQuestId(null)

  const handleAccept = () => {
    sound.playPaper()
    acceptQuest(quest.id)
  }

  const handleComplete = () => {
    sound.playCoin()
    setTimeout(() => sound.playFanfare(), 300)
    completeQuest(quest.id)
  }

  const handleFail = () => {
    if (confirm('确定要放弃这个委托吗？放弃将视为失败。')) {
      sound.playGlass()
      failQuest(quest.id)
    }
  }

  const handleDelete = () => {
    if (confirm('确定要删除这个委托吗？此操作不可撤销。')) {
      deleteQuest(quest.id)
      handleClose()
    }
  }

  return (
    <>
      <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
        <div
          className="parchment-bg w-full max-w-lg rounded-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 顶部装饰条 */}
          <div className="wood-bg h-3 rounded-t-lg" />

          <div className="p-6">
            {/* 标题区域 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="difficulty-star">
                    {DIFFICULTY_STARS[quest.difficulty]}
                  </span>
                  <span className="text-sm text-wood-500">
                    {quest.difficulty}级委托
                  </span>
                  {/* 委托人 NPC 名字 */}
                  {quest.npcName && (
                    <span className="text-xs text-wood-400">
                      委托人：{quest.npcName}
                    </span>
                  )}
                </div>
                <h2 className="font-gothic text-xl font-bold text-wood-800">
                  {quest.title}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="text-wood-400 hover:text-wood-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* 委托描述 */}
            {quest.description && (
              <div className="mb-4 p-3 bg-parchment-200/50 rounded border border-parchment-300">
                <p className="text-wood-700 text-sm leading-relaxed">
                  {quest.description}
                </p>
              </div>
            )}

            {/* 信息网格 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-parchment-200/30 p-3 rounded">
                <div className="text-xs text-wood-500 mb-1">截止时间</div>
                <div className="text-wood-800 font-bold text-sm">
                  {formatDateTime(quest.deadline)}
                </div>
              </div>
              <div className="bg-parchment-200/30 p-3 rounded">
                <div className="text-xs text-wood-500 mb-1">经验值奖励</div>
                <div className="text-guild-gold font-bold text-sm">
                  ⭐ +{quest.expReward} EXP
                </div>
              </div>
              {(quest.status === 'pending' || quest.status === 'in_progress') && (
                <div className="col-span-2 bg-parchment-200/30 p-3 rounded">
                  <div className="text-xs text-wood-500 mb-1">剩余时间</div>
                  <div className={`font-bold text-lg ${countdown.isUrgent ? 'countdown-urgent' : 'text-wood-800'}`}>
                    ⏱️ {countdownText}
                  </div>
                </div>
              )}
            </div>

            {/* 奖励物品 */}
            {quest.rewards.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-wood-700 mb-2">🎁 悬赏奖励</h3>
                <div className="flex flex-wrap gap-2">
                  {quest.rewards.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-1 bg-parchment-200/50 px-2 py-1 rounded border border-parchment-300"
                    >
                      <span className="text-lg">{r.emoji}</span>
                      <span className="text-sm text-wood-700">{r.name}</span>
                      <span className="text-xs text-wood-500">×{r.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 惩罚状态 + 通知静音 */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs text-wood-500">
                {quest.penaltyEnabled ? '⚠️ 失败将扣除经验' : '🛡️ 失败不扣经验'}
              </span>
              {(quest.status === 'pending' || quest.status === 'in_progress') && (
                <button
                  onClick={() => toggleQuestMute(quest.id)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    notificationSettings.mutedQuestIds.includes(quest.id)
                      ? 'bg-guild-crimson/20 text-guild-crimson'
                      : 'bg-parchment-200 text-wood-500 hover:bg-parchment-300'
                  }`}
                  title={notificationSettings.mutedQuestIds.includes(quest.id) ? '点击开启提醒' : '点击静音'}
                >
                  {notificationSettings.mutedQuestIds.includes(quest.id) ? '🔕 已静音' : '🔔 提醒'}
                </button>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-2">
              {quest.status === 'pending' && (
                <button
                  onClick={handleAccept}
                  className="flex-1 py-2 bg-guild-emerald text-white rounded font-bold hover:bg-guild-emerald/80 transition-colors"
                >
                  ⚔️ 接受委托
                </button>
              )}
              {quest.status === 'in_progress' && (
                <button
                  onClick={handleComplete}
                  className="flex-1 py-2 bg-guild-gold text-wood-900 rounded font-bold hover:bg-guild-darkGold transition-colors"
                >
                  ✅ 完成委托
                </button>
              )}
              {(quest.status === 'pending' || quest.status === 'in_progress') && (
                <button
                  onClick={handleFail}
                  className="flex-1 py-2 bg-guild-crimson/20 text-guild-crimson rounded font-bold hover:bg-guild-crimson/30 transition-colors border border-guild-crimson/30"
                >
                  ❌ 放弃委托
                </button>
              )}
              {quest.status === 'pending' && (
                <>
                  <button
                    onClick={() => setShowEdit(true)}
                    className="px-4 py-2 text-wood-500 hover:text-guild-gold text-sm transition-colors"
                  >
                    📝 编辑
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-wood-400 hover:text-guild-crimson text-sm transition-colors"
                  >
                    🗑️ 删除
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 编辑模态框 */}
      {showEdit && (
        <EditQuestModal quest={quest} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}
