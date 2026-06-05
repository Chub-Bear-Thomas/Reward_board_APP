import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Quest, Adventurer } from '../types';
import { databaseService } from './database';

// 后台任务名称
const BACKGROUND_FETCH_TASK = 'DAILY_EXPIRY_CHECK';

// 配置通知行为
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 请求通知权限
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('通知权限未授予');
        return;
      }

      // 注册后台任务
      await this.registerBackgroundTask();

      this.isInitialized = true;
      console.log('通知服务初始化成功');
    } catch (error) {
      console.error('通知服务初始化失败:', error);
    }
  }

  // 注册后台任务
  private async registerBackgroundTask(): Promise<void> {
    try {
      // 定义后台任务
      TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
        try {
          await this.checkExpiredQuests();
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error) {
          console.error('后台任务执行失败:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      // 注册后台任务
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 24 * 60 * 60, // 24小时
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('后台任务注册成功');
    } catch (error) {
      console.error('后台任务注册失败:', error);
    }
  }

  // 检查逾期任务
  async checkExpiredQuests(): Promise<void> {
    try {
      const expiredQuests = await databaseService.getExpiredQuests();

      for (const quest of expiredQuests) {
        // 更新任务状态为失败
        await databaseService.updateQuest(quest.id, {
          status: 'failed',
          completedAt: new Date().toISOString()
        });

        // 发送逾期通知
        if (!quest.silentNotification) {
          await this.sendExpiredNotification(quest);
        }
      }

      console.log(`检查到 ${expiredQuests.length} 个逾期任务`);
    } catch (error) {
      console.error('检查逾期任务失败:', error);
    }
  }

  // 发送逾期通知
  private async sendExpiredNotification(quest: Quest): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '委托逾期失败',
          body: `委托【${quest.title}】已逾期失败`,
          data: { questId: quest.id },
        },
        trigger: null, // 立即发送
      });
    } catch (error) {
      console.error('发送逾期通知失败:', error);
    }
  }

  // 调度晨间提醒
  async scheduleMorningReminder(adventurer: Adventurer): Promise<void> {
    try {
      if (!adventurer.notificationEnabled) {
        await this.cancelAllNotifications();
        return;
      }

      // 取消现有的晨间提醒
      await this.cancelMorningReminder();

      // 解析时间
      const [hours, minutes] = adventurer.morningReminderTime.split(':').map(Number);

      // 计算下一次触发时间
      const now = new Date();
      const triggerTime = new Date();
      triggerTime.setHours(hours, minutes, 0, 0);

      // 如果今天的时间已过，设置为明天
      if (triggerTime <= now) {
        triggerTime.setDate(triggerTime.getDate() + 1);
      }

      // 获取今日任务数量
      const todayQuests = await databaseService.getTodayQuests();
      const todoCount = todayQuests.filter(q => q.status === 'todo').length;

      if (todoCount > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '早安冒险者！',
            body: `今日还有 ${todoCount} 项悬赏等待接受，别让公会失望。`,
            data: { type: 'morning_reminder' },
          },
          trigger: {
            date: triggerTime,
            repeats: true,
          },
        });

        console.log('晨间提醒已调度');
      }
    } catch (error) {
      console.error('调度晨间提醒失败:', error);
    }
  }

  // 取消晨间提醒
  async cancelMorningReminder(): Promise<void> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of notifications) {
        if (notification.content.data?.type === 'morning_reminder') {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('取消晨间提醒失败:', error);
    }
  }

  // 为任务调度截止预警
  async scheduleDeadlineWarnings(quest: Quest): Promise<void> {
    try {
      if (quest.silentNotification || quest.status !== 'in_progress') {
        return;
      }

      // 取消现有的预警
      await this.cancelDeadlineWarnings(quest.id);

      const deadline = new Date(quest.deadline);
      const now = new Date();

      // 计算三个预警时间点
      const warningTimes = [
        { minutes: 30, type: 'warning_30' as const },
        { minutes: 15, type: 'warning_15' as const },
        { minutes: 5, type: 'warning_5' as const },
      ];

      for (const warning of warningTimes) {
        const triggerTime = new Date(deadline.getTime() - warning.minutes * 60 * 1000);

        // 只调度未来的时间
        if (triggerTime > now) {
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: '委托即将失效',
              body: `【${quest.title}】委托将在${warning.minutes}分钟后失效，请尽快完成！`,
              data: { questId: quest.id, type: 'deadline_warning' },
            },
            trigger: {
              date: triggerTime,
            },
          });

          // 保存通知ID
          await databaseService.saveNotificationId({
            questId: quest.id,
            triggerType: warning.type,
            notificationId,
          });
        }
      }

      console.log(`已为任务 ${quest.id} 调度截止预警`);
    } catch (error) {
      console.error('调度截止预警失败:', error);
    }
  }

  // 取消任务的截止预警
  async cancelDeadlineWarnings(questId: string): Promise<void> {
    try {
      const notificationIds = await databaseService.getNotificationIds(questId);

      for (const record of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(record.notificationId);
      }

      await databaseService.deleteNotificationIds(questId);
      console.log(`已取消任务 ${questId} 的截止预警`);
    } catch (error) {
      console.error('取消截止预警失败:', error);
    }
  }

  // 取消所有通知
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('已取消所有通知');
    } catch (error) {
      console.error('取消所有通知失败:', error);
    }
  }

  // 发送任务完成通知
  async sendQuestCompletedNotification(quest: Quest): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '委托完成！',
          body: `恭喜完成【${quest.title}】，获得 ${quest.exp} 点经验值！`,
          data: { questId: quest.id, type: 'quest_completed' },
        },
        trigger: null, // 立即发送
      });
    } catch (error) {
      console.error('发送完成通知失败:', error);
    }
  }

  // 发送升级通知
  async sendLevelUpNotification(newLevel: number, newTitle: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '等级提升！',
          body: `恭喜晋升为 Lv.${newLevel} ${newTitle}！`,
          data: { type: 'level_up' },
        },
        trigger: null, // 立即发送
      });
    } catch (error) {
      console.error('发送升级通知失败:', error);
    }
  }

}

// 导出单例实例
export const notificationService = new NotificationService();