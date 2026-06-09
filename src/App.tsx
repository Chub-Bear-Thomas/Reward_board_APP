import { useEffect } from 'react'
import { useGuildStore } from './store/useGuildStore'
import { useNotifications } from './hooks/useNotifications'
import { useSound } from './hooks/useSound'
import { useLevelUp } from './hooks/useLevelUp'
import { Header } from './components/Header'
import { QuestBoard } from './components/QuestBoard'
import { Backpack } from './components/Backpack'
import { AdventureLog } from './components/AdventureLog'
import { Stats } from './components/Stats'
import { Settings } from './components/Settings'
import { BottomNav } from './components/BottomNav'
import { CreateQuestModal } from './components/CreateQuestModal'
import { QuestDetailModal } from './components/QuestDetailModal'
import { ProfileModal } from './components/ProfileModal'
import { LevelUpEffect } from './components/LevelUpEffect'

export default function App() {
  const { activePage, checkExpiredQuests, showCreateModal, selectedQuestId, showProfileModal } = useGuildStore()
  const sound = useSound()
  useLevelUp()

  // 初始化音效（需要用户交互）
  useEffect(() => {
    const handler = () => sound.init()
    document.addEventListener('click', handler, { once: true })
    return () => document.removeEventListener('click', handler)
  }, [sound])

  // 每分钟检查过期任务
  useEffect(() => {
    checkExpiredQuests()
    const interval = setInterval(checkExpiredQuests, 60000)
    return () => clearInterval(interval)
  }, [checkExpiredQuests])

  // 通知系统
  useNotifications()

  const renderPage = () => {
    switch (activePage) {
      case 'quests':
        return <QuestBoard />
      case 'backpack':
        return <Backpack />
      case 'log':
        return <AdventureLog />
      case 'stats':
        return <Stats />
      case 'settings':
        return <Settings />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部冒险者状态栏 */}
      <Header />

      {/* 主内容区域 */}
      <main className="flex-1 overflow-auto pb-20">
        {renderPage()}
      </main>

      {/* 底部导航 */}
      <BottomNav />

      {/* 模态框 */}
      {showCreateModal && <CreateQuestModal />}
      {selectedQuestId && <QuestDetailModal />}
      {showProfileModal && <ProfileModal />}

      {/* 升级特效 */}
      <LevelUpEffect />
    </div>
  )
}
