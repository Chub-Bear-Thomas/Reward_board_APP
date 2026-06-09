import { useGuildStore } from '../store/useGuildStore'
import { getExpProgress, getExpToNextLevel } from '../utils/exp'
import { useSound } from '../hooks/useSound'
import { GuildEmblem } from './Decorations'

export function Header() {
  const { adventurer, setShowProfileModal, exportAllData, importAllData } = useGuildStore()
  const progress = getExpProgress(adventurer.exp, adventurer.level)
  const expToNext = getExpToNextLevel(adventurer.exp, adventurer.level)
  const sound = useSound()

  return (
    <header className="wood-bg border-b-2 border-guild-gold/30 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* 左侧：公会标题 + 数据操作 */}
        <div className="flex items-center gap-3">
          <GuildEmblem size={36} />
          <div>
            <h1 className="font-gothic text-guild-gold text-lg font-bold tracking-wider">
              冒险者公会 · 悬赏栏
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => {
                  sound.playClick()
                  exportAllData()
                }}
                className="text-xs text-parchment-400 hover:text-guild-gold transition-colors"
                title="导出数据"
              >
                📤 导出
              </button>
              <span className="text-parchment-600">|</span>
              <button
                onClick={() => {
                  sound.playClick()
                  importAllData()
                }}
                className="text-xs text-parchment-400 hover:text-guild-gold transition-colors"
                title="导入数据"
              >
                📥 导入
              </button>
            </div>
          </div>
        </div>

        {/* 右侧：冒险者信息 */}
        <button
          onClick={() => {
            sound.playClick()
            setShowProfileModal(true)
          }}
          className="flex items-center gap-3 hover:bg-white/5 rounded-lg px-3 py-2 transition-colors"
        >
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm text-parchment-200">{adventurer.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-guild-gold/20 text-guild-gold border border-guild-gold/30">
                Lv.{adventurer.level}
              </span>
            </div>
            <div className="text-xs text-parchment-400 mt-0.5">{adventurer.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="exp-bar w-24">
                <div
                  className="exp-bar-fill"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="text-xs text-parchment-400">
                {expToNext > 0 ? `${expToNext} exp` : 'MAX'}
              </span>
            </div>
          </div>
          <div className="text-3xl">{adventurer.avatar}</div>
        </button>
      </div>
    </header>
  )
}
