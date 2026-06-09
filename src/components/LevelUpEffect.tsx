import { useEffect, useState, useRef } from 'react'
import { useGuildStore } from '../store/useGuildStore'

/**
 * 升级光效动画组件
 * 当冒险者等级提升时显示全屏特效
 */
export function LevelUpEffect() {
  const level = useGuildStore((s) => s.adventurer.level)
  const title = useGuildStore((s) => s.adventurer.title)
  const prevLevelRef = useRef(level)
  const [show, setShow] = useState(false)
  const [displayLevel, setDisplayLevel] = useState(level)
  const [displayTitle, setDisplayTitle] = useState(title)

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setDisplayLevel(level)
      setDisplayTitle(title)
      setShow(true)
      const timer = setTimeout(() => setShow(false), 3000)
      prevLevelRef.current = level
      return () => clearTimeout(timer)
    }
    prevLevelRef.current = level
  }, [level, title])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      {/* 背景光效 */}
      <div className="absolute inset-0 animate-levelup-bg">
        <div className="absolute inset-0 bg-gradient-radial from-guild-gold/30 via-transparent to-transparent" />
      </div>

      {/* 光柱效果 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full animate-levelup-beam">
        <div className="w-full h-full bg-gradient-to-b from-guild-gold/60 via-guild-gold/20 to-transparent" />
      </div>

      {/* 光环扩散 */}
      <div className="absolute animate-levelup-ring">
        <div className="w-64 h-64 rounded-full border-4 border-guild-gold/40" />
      </div>
      <div className="absolute animate-levelup-ring" style={{ animationDelay: '0.3s' }}>
        <div className="w-48 h-48 rounded-full border-2 border-guild-gold/60" />
      </div>

      {/* 粒子效果 */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-levelup-particle"
          style={{
            animationDelay: `${i * 0.1}s`,
            transform: `rotate(${i * 30}deg)`,
          }}
        >
          <div
            className="w-2 h-2 bg-guild-gold rounded-full"
            style={{ transform: 'translateY(-80px)' }}
          />
        </div>
      ))}

      {/* 中心内容 */}
      <div className="relative z-10 text-center animate-levelup-content">
        <div className="text-6xl mb-4 animate-levelup-icon">⬆️</div>
        <div className="font-gothic text-4xl font-bold text-guild-gold mb-2 drop-shadow-lg">
          LEVEL UP!
        </div>
        <div className="text-2xl text-parchment-100 mb-1">
          Lv.{displayLevel}
        </div>
        <div className="text-lg text-guild-gold/80 font-serif">
          {displayTitle}
        </div>
      </div>
    </div>
  )
}
