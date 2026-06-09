import { LEVEL_CONFIGS, LevelConfig } from '../types'

/**
 * 计算指定等级所需的累计经验值
 * 公式: 100 × level² - 50 × level + 200
 */
export function getRequiredExp(level: number): number {
  if (level <= 1) return 0
  // 使用预设配置（如果有），否则用公式
  const preset = LEVEL_CONFIGS.find(c => c.level === level)
  if (preset) return preset.requiredExp
  return 100 * level * level - 50 * level + 200
}

/**
 * 根据当前经验值计算等级
 */
export function calculateLevel(exp: number): number {
  let level = 1
  while (true) {
    const nextLevelReq = getRequiredExp(level + 1)
    if (exp < nextLevelReq) break
    level++
    if (level > 999) break // 安全上限
  }
  return level
}

/**
 * 获取当前等级的称号
 */
export function getTitle(level: number): string {
  // 从高到低匹配
  const sorted = [...LEVEL_CONFIGS].sort((a, b) => b.level - a.level)
  for (const config of sorted) {
    if (level >= config.level) return config.title
  }
  return '见习冒险者'
}

/**
 * 计算当前经验进度（0~1）
 */
export function getExpProgress(exp: number, level: number): number {
  const currentLevelExp = getRequiredExp(level)
  const nextLevelExp = getRequiredExp(level + 1)
  const needed = nextLevelExp - currentLevelExp
  if (needed <= 0) return 1
  return Math.min(1, (exp - currentLevelExp) / needed)
}

/**
 * 获取升级到下一级还需要的经验
 */
export function getExpToNextLevel(exp: number, level: number): number {
  const nextLevelExp = getRequiredExp(level + 1)
  return Math.max(0, nextLevelExp - exp)
}

/**
 * 计算惩罚扣除的经验值（基础经验的 20%）
 */
export function getPenaltyExp(baseExp: number): number {
  return Math.floor(baseExp * 0.2)
}
