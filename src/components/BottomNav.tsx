import { useGuildStore } from '../store/useGuildStore'
import { ActivePage } from '../types'
import { useSound } from '../hooks/useSound'

const NAV_ITEMS: { key: ActivePage; label: string; icon: string }[] = [
  { key: 'quests', label: '任务板', icon: '📜' },
  { key: 'backpack', label: '背包', icon: '🎒' },
  { key: 'log', label: '日志', icon: '📖' },
  { key: 'stats', label: '统计', icon: '📊' },
  { key: 'settings', label: '设置', icon: '⚙️' },
]

export function BottomNav() {
  const { activePage, setActivePage } = useGuildStore()
  const sound = useSound()

  return (
    <nav className="fixed bottom-0 left-0 right-0 wood-bg border-t-2 border-guild-gold/30 z-40">
      <div className="max-w-4xl mx-auto flex">
        {NAV_ITEMS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => {
              sound.playClick()
              setActivePage(key)
            }}
            className={`flex-1 flex flex-col items-center py-3 transition-all ${
              activePage === key
                ? 'text-guild-gold bg-guild-gold/10'
                : 'text-parchment-400 hover:text-parchment-200'
            }`}
          >
            <span className="text-xl">{icon}</span>
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
