import { useState } from 'react'
import { useGuildStore } from '../store/useGuildStore'
import { Quest, QuestDifficulty, RewardItem, DIFFICULTY_EXP, REWARD_CATEGORIES } from '../types'
import { generateId } from '../utils/id'
import { useSound } from '../hooks/useSound'

const COMMON_EMOJIS = [
  '📚', '🎮', '💪', '🧹', '🛒', '📝', '💼', '🎯',
  '🏆', '💰', '🎁', '☕', '🍰', '🧸', '📖', '✨',
  '🗡️', '🛡️', '🏹', '💎', '🧪', '📜', '🗝️', '👑',
]

interface EditQuestModalProps {
  quest: Quest
  onClose: () => void
}

export function EditQuestModal({ quest, onClose }: EditQuestModalProps) {
  const { updateQuest } = useGuildStore()
  const sound = useSound()

  const [title, setTitle] = useState(quest.title)
  const [description, setDescription] = useState(quest.description)
  const [difficulty, setDifficulty] = useState<QuestDifficulty>(quest.difficulty)
  const [deadline, setDeadline] = useState(() => {
    const d = new Date(quest.deadline)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  })
  const [expReward, setExpReward] = useState(quest.expReward)
  const [penaltyEnabled, setPenaltyEnabled] = useState(quest.penaltyEnabled)
  const [rewards, setRewards] = useState<RewardItem[]>([...quest.rewards])
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null)

  const handleDifficultyChange = (d: QuestDifficulty) => {
    setDifficulty(d)
    setExpReward(DIFFICULTY_EXP[d])
  }

  const addReward = () => {
    setRewards([
      ...rewards,
      { id: generateId(), name: '', emoji: '🎁', quantity: 1, category: '其他' },
    ])
  }

  const updateReward = (index: number, updates: Partial<RewardItem>) => {
    setRewards(rewards.map((r, i) => (i === index ? { ...r, ...updates } : r)))
  }

  const removeReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('请输入委托标题！')
      return
    }
    sound.playPaper()
    updateQuest(quest.id, {
      title: title.trim(),
      description: description.trim(),
      difficulty,
      deadline: new Date(deadline).toISOString(),
      rewards: rewards.filter((r) => r.name.trim()),
      expReward,
      penaltyEnabled,
    })
    onClose()
  }

  return (
    <div className="modal-overlay fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="parchment-bg w-full max-w-lg rounded-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wood-bg h-3 rounded-t-lg" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-gothic text-xl font-bold text-wood-800">📝 编辑委托</h2>
            <button onClick={onClose} className="text-wood-400 hover:text-wood-700 text-2xl leading-none">×</button>
          </div>

          {/* 委托标题 */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-wood-700 mb-1">委托标题 <span className="text-guild-crimson">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-parchment-100 border border-parchment-300 rounded text-wood-800 focus:outline-none focus:border-guild-gold" />
          </div>

          {/* 委托描述 */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-wood-700 mb-1">委托描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 bg-parchment-100 border border-parchment-300 rounded text-wood-800 focus:outline-none focus:border-guild-gold resize-none" />
          </div>

          {/* 难度 */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-wood-700 mb-2">难度等级</label>
            <div className="flex gap-2">
              {(['D', 'C', 'B', 'A', 'S'] as QuestDifficulty[]).map((d) => (
                <button key={d} onClick={() => handleDifficultyChange(d)}
                  className={`flex-1 py-2 rounded text-sm font-bold transition-all ${difficulty === d ? 'bg-guild-gold text-wood-900 shadow-md' : 'bg-parchment-200 text-wood-600 hover:bg-parchment-300'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 截止时间 */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-wood-700 mb-1">完成期限</label>
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-parchment-100 border border-parchment-300 rounded text-wood-800 focus:outline-none focus:border-guild-gold" />
          </div>

          {/* 经验值 */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-wood-700 mb-1">经验值奖励</label>
            <input type="number" value={expReward} onChange={(e) => setExpReward(Number(e.target.value))} min={1} max={9999}
              className="w-full px-3 py-2 bg-parchment-100 border border-parchment-300 rounded text-wood-800 focus:outline-none focus:border-guild-gold" />
          </div>

          {/* 惩罚 */}
          <div className="mb-4 flex items-center gap-2">
            <input type="checkbox" id="edit-penalty" checked={penaltyEnabled} onChange={(e) => setPenaltyEnabled(e.target.checked)} className="accent-guild-crimson" />
            <label htmlFor="edit-penalty" className="text-sm text-wood-700">开启惩罚模式（失败扣除 20% 经验）</label>
          </div>

          {/* 奖励物品 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-wood-700">🎁 奖励物品</label>
              <button onClick={addReward} className="text-sm text-guild-gold hover:text-guild-darkGold">+ 添加奖励</button>
            </div>
            {rewards.map((reward, index) => (
              <div key={reward.id} className="flex items-center gap-2 mb-2">
                <div className="relative">
                  <button onClick={() => setShowEmojiPicker(showEmojiPicker === index ? null : index)}
                    className="text-2xl w-10 h-10 flex items-center justify-center bg-parchment-100 border border-parchment-300 rounded">
                    {reward.emoji}
                  </button>
                  {showEmojiPicker === index && (
                    <div className="absolute top-12 left-0 z-10 bg-parchment-100 border border-parchment-300 rounded p-2 shadow-lg grid grid-cols-8 gap-1 w-64">
                      {COMMON_EMOJIS.map((emoji) => (
                        <button key={emoji} onClick={() => { updateReward(index, { emoji }); setShowEmojiPicker(null) }}
                          className="text-xl hover:bg-parchment-200 rounded p-1">{emoji}</button>
                      ))}
                    </div>
                  )}
                </div>
                <input type="text" value={reward.name} onChange={(e) => updateReward(index, { name: e.target.value })} placeholder="物品名称"
                  className="flex-1 px-2 py-1.5 bg-parchment-100 border border-parchment-300 rounded text-sm text-wood-800 focus:outline-none focus:border-guild-gold" />
                <input type="number" value={reward.quantity} onChange={(e) => updateReward(index, { quantity: Math.max(1, Math.min(999, Number(e.target.value))) })} min={1} max={999}
                  className="w-16 px-2 py-1.5 bg-parchment-100 border border-parchment-300 rounded text-sm text-wood-800 focus:outline-none focus:border-guild-gold" />
                <select value={reward.category} onChange={(e) => updateReward(index, { category: e.target.value })}
                  className="px-2 py-1.5 bg-parchment-100 border border-parchment-300 rounded text-sm text-wood-800 focus:outline-none focus:border-guild-gold">
                  {REWARD_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <button onClick={() => removeReward(index)} className="text-wood-400 hover:text-guild-crimson">×</button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 bg-parchment-200 text-wood-600 rounded font-bold hover:bg-parchment-300 transition-colors">取消</button>
            <button onClick={handleSubmit} className="flex-1 py-2 bg-guild-gold text-wood-900 rounded font-bold hover:bg-guild-darkGold transition-colors">💾 保存修改</button>
          </div>
        </div>
      </div>
    </div>
  )
}
