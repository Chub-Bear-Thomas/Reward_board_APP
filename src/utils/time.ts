import { format, differenceInSeconds, isToday, isBefore, startOfDay, addDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 格式化日期时间显示
 */
export function formatDateTime(isoString: string): string {
  return format(new Date(isoString), 'yyyy-MM-dd HH:mm', { locale: zhCN })
}

/**
 * 格式化日期显示
 */
export function formatDate(isoString: string): string {
  return format(new Date(isoString), 'yyyy-MM-dd', { locale: zhCN })
}

/**
 * 格式化时间显示
 */
export function formatTime(isoString: string): string {
  return format(new Date(isoString), 'HH:mm', { locale: zhCN })
}

/**
 * 获取今日 23:59 的 ISO 字符串
 */
export function getTodayEnd(): string {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  return end.toISOString()
}

/**
 * 获取今日 00:00 的 ISO 字符串
 */
export function getTodayStart(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  return start.toISOString()
}

/**
 * 计算剩余时间，返回格式化的倒计时字符串
 */
export function getCountdown(deadline: string): {
  text: string
  isExpired: boolean
  isUrgent: boolean
  totalSeconds: number
} {
  const now = new Date()
  const end = new Date(deadline)
  const diff = differenceInSeconds(end, now)

  if (diff <= 0) {
    return { text: '已逾期', isExpired: true, isUrgent: true, totalSeconds: 0 }
  }

  const hours = Math.floor(diff / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60

  let text = ''
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    text = `${days}天 ${hours % 24}小时`
  } else if (hours > 0) {
    text = `${hours}小时 ${minutes}分`
  } else if (minutes > 0) {
    text = `${minutes}分 ${seconds}秒`
  } else {
    text = `${seconds}秒`
  }

  return {
    text: `剩余 ${text}`,
    isExpired: false,
    isUrgent: diff < 1800, // 30分钟内算紧急
    totalSeconds: diff,
  }
}

/**
 * 判断截止日期是否是今天
 */
export function isDeadlineToday(deadline: string): boolean {
  return isToday(new Date(deadline))
}

/**
 * 判断任务是否已过期
 */
export function isExpired(deadline: string): boolean {
  return isBefore(new Date(deadline), new Date())
}

/**
 * 获取当前日期字符串 YYYY-MM-DD
 */
export function getCurrentDateStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * 获取昨天的日期字符串
 */
export function getYesterdayDateStr(): string {
  return format(addDays(new Date(), -1), 'yyyy-MM-dd')
}
