import { useState } from 'react'
import { useGuildStore } from '../store/useGuildStore'
import { AVATAR_OPTIONS } from '../types'
import { getExpProgress, getExpToNextLevel, getRequiredExp } from '../utils/exp'

export function ProfileModal() {
  const { adventurer, updateAdventurer, setShowProfileModal } = useGuildStore()
  const [name, setName] = useState(adventurer.name)
  const [avatar, setAvatar] = useState(adventurer.avatar)

  const progress = getExpProgress(adventurer.exp, adventurer.level)
  const expToNext = getExpToNextLevel(adventurer.exp, adventurer.level)
  const currentLevelExp = getRequiredExp(adventurer.level)
  const nextLevelExp = getRequiredExp(adventurer.level + 1)

  const handleSave = () => {
    updateAdventurer({
      name: name.trim() || '无名冒险者',
      avatar,
    })
    setShowProfileModal(false)
  }

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowProfileModal(false)}>
      <div
        className="parchment-bg w-full max-w-md rounded-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wood-bg h-3 rounded-t-lg" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-gothic text-xl font-bold text-wood-800">
              🎭 冒险者档案
            </h2>
            <button
              onClick={() => setShowProfileModal(false)}
              className="text-wood-400 hover:text-wood-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* 当前状态 */}
          <div className="bg-parchment-200/50 rounded-lg p-4 mb-4 border border-parchment-300">
            <div className="flex items-center gap-4 mb-3">
              <div className="text-5xl">{adventurer.avatar}</div>
              <div>
                <div className="font-bold text-wood-800 text-lg">{adventurer.name}</div>
                <div className="text-sm text-guild-gold font-bold">
                  Lv.{adventurer.level} {adventurer.title}
                </div>
              </div>
            </div>

            {/* 经验条详情 */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-wood-500 mb-1">
                <span>EXP {adventurer.exp} / {nextLevelExp}</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="exp-bar h-3">
                <div
                  className="exp-bar-fill"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="text-xs text-wood-400 mt-1">
                距下一级还需 {expToNext} EXP
              </div>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center">
                <div className="text-lg font-bold text-guild-emerald">{adventurer.totalCompleted}</div>
                <div className="text-xs text-wood-500">已完成</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-guild-crimson">{adventurer.totalFailed}</div>
                <div className="text-xs text-wood-500">已失败</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-guild-gold">{adventurer.streak}</div>
                <div className="text-xs text-wood-500">连续天数</div>
              </div>
            </div>
          </div>

          {/* 编辑昵称 */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-wood-700 mb-1">
              冒险者昵称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="无名冒险者"
              maxLength={20}
              className="w-full px-3 py-2 bg-parchment-100 border border-parchment-300 rounded text-wood-800 placeholder-wood-400 focus:outline-none focus:border-guild-gold"
            />
          </div>

          {/* 选择头像 */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-wood-700 mb-2">
              选择头像
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`text-3xl p-2 rounded-lg transition-all ${
                    avatar === emoji
                      ? 'bg-guild-gold/30 border-2 border-guild-gold shadow-md'
                      : 'bg-parchment-100 border border-parchment-300 hover:bg-parchment-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            className="w-full py-2 bg-guild-gold text-wood-900 rounded font-bold hover:bg-guild-darkGold transition-colors"
          >
            💾 保存档案
          </button>
        </div>
      </div>
    </div>
  )
}
