import { useState } from 'react'
import { useGuildStore } from '../store/useGuildStore'
import { formatDateTime, getCurrentDateStr } from '../utils/time'

export function AdventureLog() {
  const { logs } = useGuildStore()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 按日期分组
  const logsByDate = logs.reduce<Record<string, typeof logs>>((acc, log) => {
    if (!acc[log.date]) acc[log.date] = []
    acc[log.date].push(log)
    return acc
  }, {})

  const dates = Object.keys(logsByDate).sort((a, b) => b.localeCompare(a))

  // 获取最近30天的日期列表（用于日历热力图）
  const getLast30Days = () => {
    const days: string[] = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().split('T')[0])
    }
    return days
  }

  const last30Days = getLast30Days()

  const getDayCount = (dateStr: string) => {
    return logsByDate[dateStr]?.filter((l) => l.result === 'completed').length || 0
  }

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-wood-800/50'
    if (count === 1) return 'bg-guild-gold/30'
    if (count === 2) return 'bg-guild-gold/50'
    if (count === 3) return 'bg-guild-gold/70'
    return 'bg-guild-gold'
  }

  const displayLogs = selectedDate ? logsByDate[selectedDate] || [] : [...logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="font-gothic text-xl font-bold text-guild-gold mb-4">
        📖 冒险日志
      </h2>

      {/* 热力图 */}
      <div className="quest-card p-4 mb-6">
        <h3 className="text-sm font-bold text-wood-700 mb-3">近 30 天完成情况</h3>
        <div className="flex flex-wrap gap-1">
          {last30Days.map((day) => {
            const count = getDayCount(day)
            const dayNum = new Date(day).getDate()
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(selectedDate === day ? null : day)}
                className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center transition-all ${getHeatColor(count)} ${
                  selectedDate === day ? 'ring-2 ring-guild-gold' : ''
                }`}
                title={`${day}: ${count} 个完成`}
              >
                {dayNum}
              </button>
            )
          })}
        </div>
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="mt-2 text-xs text-guild-gold hover:text-guild-darkGold"
          >
            清除筛选
          </button>
        )}
      </div>

      {/* 日志列表 */}
      {displayLogs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-parchment-400">暂无冒险记录</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayLogs.map((log) => (
            <div
              key={log.id}
              className="quest-card p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {log.result === 'completed' ? '✅' : '❌'}
                </span>
                <div>
                  <div className="text-sm font-bold text-wood-800">
                    {log.questTitle}
                  </div>
                  <div className="text-xs text-wood-500">
                    {formatDateTime(log.timestamp)}
                  </div>
                </div>
              </div>
              <div
                className={`text-sm font-bold ${
                  log.expChange >= 0 ? 'text-guild-emerald' : 'text-guild-crimson'
                }`}
              >
                {log.expChange >= 0 ? '+' : ''}{log.expChange} EXP
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
