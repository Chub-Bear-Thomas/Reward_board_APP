import { useGuildStore } from '../store/useGuildStore'

export function Settings() {
  const { notificationSettings, updateNotificationSettings } = useGuildStore()

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="font-gothic text-xl font-bold text-guild-gold mb-6">
        ⚙️ 公会设置
      </h2>

      {/* 通知设置 */}
      <div className="quest-card p-4 mb-4">
        <h3 className="text-sm font-bold text-wood-700 mb-4">🔔 通知设置</h3>

        {/* 全局开关 */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-parchment-300">
          <div>
            <div className="text-sm font-bold text-wood-800">全局通知</div>
            <div className="text-xs text-wood-500">开启或关闭所有通知</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.enabled}
              onChange={(e) => updateNotificationSettings({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-parchment-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-guild-gold"></div>
          </label>
        </div>

        {/* 早间通知 */}
        <div className={`flex items-center justify-between mb-4 ${!notificationSettings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
            <div className="text-sm font-bold text-wood-800">🌅 早间集结通知</div>
            <div className="text-xs text-wood-500">每日定时提醒今日委托数量</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.morningEnabled}
              onChange={(e) => updateNotificationSettings({ morningEnabled: e.target.checked })}
              className="sr-only peer"
              disabled={!notificationSettings.enabled}
            />
            <div className="w-11 h-6 bg-parchment-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-guild-gold"></div>
          </label>
        </div>

        {/* 早间通知时间 */}
        {notificationSettings.morningEnabled && notificationSettings.enabled && (
          <div className="flex items-center justify-between mb-4 pl-4">
            <div className="text-sm text-wood-600">通知时间</div>
            <select
              value={notificationSettings.morningHour}
              onChange={(e) => updateNotificationSettings({ morningHour: Number(e.target.value) })}
              className="px-3 py-1.5 bg-parchment-100 border border-parchment-300 rounded text-sm text-wood-800 focus:outline-none focus:border-guild-gold"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 截止预警 */}
        <div className={`flex items-center justify-between ${!notificationSettings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
            <div className="text-sm font-bold text-wood-800">⚠️ 截止预警</div>
            <div className="text-xs text-wood-500">任务到期前 30/15/5 分钟提醒</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.deadlineEnabled}
              onChange={(e) => updateNotificationSettings({ deadlineEnabled: e.target.checked })}
              className="sr-only peer"
              disabled={!notificationSettings.enabled}
            />
            <div className="w-11 h-6 bg-parchment-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-guild-gold"></div>
          </label>
        </div>
      </div>

      {/* 关于 */}
      <div className="quest-card p-4">
        <h3 className="text-sm font-bold text-wood-700 mb-3">📜 关于</h3>
        <div className="text-sm text-wood-600 space-y-1">
          <p>冒险者公会 · 每日悬赏任务栏 v1.0.0</p>
          <p>将日常工作包装成悬赏委托，以游戏化方式完成每日任务！</p>
        </div>
      </div>
    </div>
  )
}
