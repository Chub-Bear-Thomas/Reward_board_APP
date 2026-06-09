import { useEffect, useRef } from 'react'
import { useGuildStore } from '../store/useGuildStore'
import { playLevelUpSound } from '../utils/sound'

/**
 * 升级检测 Hook
 * 当冒险者等级提升时播放升级音效
 */
export function useLevelUp() {
  const level = useGuildStore((s) => s.adventurer.level)
  const prevLevelRef = useRef(level)

  useEffect(() => {
    if (level > prevLevelRef.current) {
      playLevelUpSound()
    }
    prevLevelRef.current = level
  }, [level])
}
