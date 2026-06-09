/**
 * 主题皮肤定义
 */

export interface ThemeSkin {
  id: string
  name: string
  description: string
  unlockLevel: number
  colors: {
    parchmentBg: string
    woodBg: string
    gold: string
    accent: string
    text: string
    textLight: string
  }
  cardStyle: string
}

export const THEME_SKINS: ThemeSkin[] = [
  {
    id: 'default',
    name: '经典公会',
    description: '初始主题，温暖的羊皮纸与木板风格',
    unlockLevel: 1,
    colors: {
      parchmentBg: '#f5ead4',
      woodBg: '#5e4427',
      gold: '#c9a84c',
      accent: '#8b2252',
      text: '#3a2b14',
      textLight: '#6e5428',
    },
    cardStyle: 'quest-card',
  },
  {
    id: 'dark-guild',
    name: '暗夜公会',
    description: '神秘的暗色调，适合夜间冒险者',
    unlockLevel: 10,
    colors: {
      parchmentBg: '#2a2a3a',
      woodBg: '#1a1a2e',
      gold: '#e0c068',
      accent: '#6b48ff',
      text: '#e0d8c8',
      textLight: '#a09888',
    },
    cardStyle: 'quest-card-dark',
  },
  {
    id: 'dragon-lair',
    name: '龙巢任务板',
    description: '火焰与龙鳞交织的炽热主题',
    unlockLevel: 20,
    colors: {
      parchmentBg: '#3a1a0a',
      woodBg: '#2a0a00',
      gold: '#ff8c00',
      accent: '#ff4500',
      text: '#ffd8b0',
      textLight: '#c09060',
    },
    cardStyle: 'quest-card-dragon',
  },
  {
    id: 'elven',
    name: '精灵森林',
    description: '优雅的精灵风格，自然与魔法的融合',
    unlockLevel: 30,
    colors: {
      parchmentBg: '#e8f0e0',
      woodBg: '#2d4a2d',
      gold: '#90c060',
      accent: '#4a8a4a',
      text: '#2a3a20',
      textLight: '#5a6a50',
    },
    cardStyle: 'quest-card-elven',
  },
]

/**
 * 获取当前可用的主题列表
 */
export function getAvailableThemes(level: number): ThemeSkin[] {
  return THEME_SKINS.filter((t) => level >= t.unlockLevel)
}

/**
 * 获取下一个可解锁的主题
 */
export function getNextUnlockTheme(level: number): ThemeSkin | null {
  return THEME_SKINS.find((t) => level < t.unlockLevel) || null
}
