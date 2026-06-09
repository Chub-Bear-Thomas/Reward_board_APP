import { useEffect, useRef } from 'react'
import { useGuildStore } from '../store/useGuildStore'
import {
  requestNotificationPermission,
  sendMorningNotification,
  checkDeadlineWarnings,
} from '../utils/notification'

/**
 * 通知管理 Hook
 * - 首次加载时请求通知权限
 * - 每分钟检查截止预警
 * - 早间通知
 */
export function useNotifications() {
  const quests = useGuildStore((s) => s.quests)
  const settings = useGuildStore((s) => s.notificationSettings)
  const notifiedRef = useRef<Set<string>>(new Set())
  const morningSentRef = useRef(false)

  useEffect(() => {
    // 如果通知被禁用，不请求权限
    if (!settings.enabled) return

    // 请求通知权限
    requestNotificationPermission()

    // 每分钟检查
    const interval = setInterval(() => {
      if (!settings.enabled) return

      const now = new Date()

      // 早间通知检查
      if (
        settings.morningEnabled &&
        now.getHours() === settings.morningHour &&
        now.getMinutes() === 0 &&
        !morningSentRef.current
      ) {
        const pendingCount = quests.filter(
          (q) => q.status === 'pending' || q.status === 'in_progress'
        ).length
        sendMorningNotification(pendingCount)
        morningSentRef.current = true
      }
      if (now.getMinutes() > 1) {
        morningSentRef.current = false
      }

      // 截止预警检查（排除静音的任务）
      if (settings.deadlineEnabled) {
        const activeQuests = quests.filter(
          (q) => !settings.mutedQuestIds.includes(q.id)
        )
        notifiedRef.current = checkDeadlineWarnings(activeQuests, notifiedRef.current)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [quests, settings])
}
