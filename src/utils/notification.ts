/**
 * 桌面通知工具
 */

import { Quest } from '../types'
import { getCountdown } from './time'

/**
 * 请求通知权限
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('浏览器不支持通知')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

/**
 * 发送通知
 */
export function sendNotification(title: string, body: string, icon?: string): void {
  if (Notification.permission !== 'granted') return

  new Notification(title, {
    body,
    icon: icon || '⚔️',
    tag: 'guild-quest',
  })
}

/**
 * 早间集结通知
 */
export function sendMorningNotification(questCount: number): void {
  if (questCount === 0) {
    sendNotification(
      '🏛️ 冒险者公会',
      '今日暂无悬赏委托，冒险者可以休息一下~'
    )
  } else {
    sendNotification(
      '🏛️ 冒险者公会',
      `公会布告栏已更新，今日还有 ${questCount} 个委托等待冒险者！`
    )
  }
}

/**
 * 截止预警通知
 */
export function sendDeadlineWarning(quest: Quest, minutesLeft: number): void {
  const messages: Record<number, string> = {
    30: `委托【${quest.title}】将在 30 分钟后失效！冒险者请抓紧时间！`,
    15: `委托【${quest.title}】将在 15 分钟后失效！紧急！`,
    5: `委托【${quest.title}】将在 5 分钟后失效！最后冲刺！`,
  }

  const body = messages[minutesLeft]
  if (body) {
    sendNotification('⚠️ 委托预警', body)
  }
}

/**
 * 检查任务截止预警并发送通知
 * 返回已通知的 {questId, minutes} 列表，避免重复通知
 */
export function checkDeadlineWarnings(
  quests: Quest[],
  notifiedSet: Set<string>
): Set<string> {
  const newNotified = new Set(notifiedSet)

  quests
    .filter((q) => q.status === 'in_progress')
    .forEach((quest) => {
      const { totalSeconds } = getCountdown(quest.deadline)
      const minutesLeft = Math.floor(totalSeconds / 60)

      // 检查 30、15、5 分钟预警
      ;[30, 15, 5].forEach((threshold) => {
        const key = `${quest.id}-${threshold}`
        if (
          minutesLeft <= threshold &&
          minutesLeft > threshold - 2 && // 2分钟窗口
          !notifiedSet.has(key)
        ) {
          sendDeadlineWarning(quest, threshold)
          newNotified.add(key)
        }
      })
    })

  return newNotified
}
