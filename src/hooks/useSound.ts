import { useCallback } from 'react'
import {
  resumeAudio,
  playPaperSound,
  playCoinSound,
  playFanfareSound,
  playGlassSound,
  playLevelUpSound,
  playClickSound,
} from '../utils/sound'

/**
 * 音效管理 Hook
 */
export function useSound() {
  const init = useCallback(() => {
    resumeAudio()
  }, [])

  return {
    init,
    playPaper: playPaperSound,
    playCoin: playCoinSound,
    playFanfare: playFanfareSound,
    playGlass: playGlassSound,
    playLevelUp: playLevelUpSound,
    playClick: playClickSound,
  }
}
