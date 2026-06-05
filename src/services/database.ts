import * as SQLite from 'expo-sqlite';
import { Quest, Adventurer, NotificationIdRecord, QuestStatus, DEFAULT_ADVENTURER } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('adventurer_guild.db');
      await this.createTables();
      await this.insertDefaultUser();
      console.log('数据库初始化成功');
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY,
        nickname TEXT DEFAULT '无名冒险者',
        avatar_id INTEGER DEFAULT 0,
        experience INTEGER DEFAULT 0,
        morning_reminder_time TEXT DEFAULT '08:00',
        notification_enabled INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS quest (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        deadline TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('todo','in_progress','done','failed')),
        rewards TEXT NOT NULL DEFAULT '[]',
        exp INTEGER NOT NULL,
        silent_notification INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        accepted_at TEXT,
        completed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS notification_ids (
        quest_id TEXT,
        trigger_type TEXT,
        notification_id TEXT,
        PRIMARY KEY (quest_id, trigger_type)
      );
    `);
  }

  private async insertDefaultUser(): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    const existingUser = await this.db.getFirstAsync<Adventurer>(
      'SELECT * FROM user WHERE id = 1'
    );

    if (!existingUser) {
      await this.db.runAsync(
        `INSERT INTO user (id, nickname, avatar_id, experience, morning_reminder_time, notification_enabled)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          DEFAULT_ADVENTURER.id,
          DEFAULT_ADVENTURER.nickname,
          DEFAULT_ADVENTURER.avatarId,
          DEFAULT_ADVENTURER.experience,
          DEFAULT_ADVENTURER.morningReminderTime,
          DEFAULT_ADVENTURER.notificationEnabled ? 1 : 0
        ]
      );
    }
  }

  // 用户相关操作
  async getUser(): Promise<Adventurer | null> {
    if (!this.db) throw new Error('数据库未初始化');

    const user = await this.db.getFirstAsync<any>(
      'SELECT * FROM user WHERE id = 1'
    );

    if (!user) return null;

    return {
      id: user.id,
      nickname: user.nickname,
      avatarId: user.avatar_id,
      experience: user.experience,
      morningReminderTime: user.morning_reminder_time,
      notificationEnabled: Boolean(user.notification_enabled)
    };
  }

  async updateUser(updates: Partial<Adventurer>): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.nickname !== undefined) {
      setClauses.push('nickname = ?');
      values.push(updates.nickname);
    }
    if (updates.avatarId !== undefined) {
      setClauses.push('avatar_id = ?');
      values.push(updates.avatarId);
    }
    if (updates.experience !== undefined) {
      setClauses.push('experience = ?');
      values.push(updates.experience);
    }
    if (updates.morningReminderTime !== undefined) {
      setClauses.push('morning_reminder_time = ?');
      values.push(updates.morningReminderTime);
    }
    if (updates.notificationEnabled !== undefined) {
      setClauses.push('notification_enabled = ?');
      values.push(updates.notificationEnabled ? 1 : 0);
    }

    if (setClauses.length === 0) return;

    values.push(1); // WHERE id = 1
    await this.db.runAsync(
      `UPDATE user SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
  }

  // 任务相关操作
  async getQuests(filter?: QuestStatus | 'all'): Promise<Quest[]> {
    if (!this.db) throw new Error('数据库未初始化');

    let query = 'SELECT * FROM quest';
    const params: any[] = [];

    if (filter && filter !== 'all') {
      query += ' WHERE status = ?';
      params.push(filter);
    }

    query += ' ORDER BY created_at DESC';

    const rows = await this.db.getAllAsync<any>(query, params);
    return rows.map(this.mapRowToQuest);
  }

  async getQuestById(id: string): Promise<Quest | null> {
    if (!this.db) throw new Error('数据库未初始化');

    const row = await this.db.getFirstAsync<any>(
      'SELECT * FROM quest WHERE id = ?',
      [id]
    );

    return row ? this.mapRowToQuest(row) : null;
  }

  async createQuest(quest: Quest): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    await this.db.runAsync(
      `INSERT INTO quest (id, title, description, deadline, status, rewards, exp, silent_notification, created_at, accepted_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quest.id,
        quest.title,
        quest.description || null,
        quest.deadline,
        quest.status,
        JSON.stringify(quest.rewards),
        quest.exp,
        quest.silentNotification ? 1 : 0,
        quest.createdAt,
        quest.acceptedAt || null,
        quest.completedAt || null
      ]
    );
  }

  async updateQuest(id: string, updates: Partial<Quest>): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      setClauses.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      values.push(updates.description);
    }
    if (updates.deadline !== undefined) {
      setClauses.push('deadline = ?');
      values.push(updates.deadline);
    }
    if (updates.status !== undefined) {
      setClauses.push('status = ?');
      values.push(updates.status);
    }
    if (updates.rewards !== undefined) {
      setClauses.push('rewards = ?');
      values.push(JSON.stringify(updates.rewards));
    }
    if (updates.exp !== undefined) {
      setClauses.push('exp = ?');
      values.push(updates.exp);
    }
    if (updates.silentNotification !== undefined) {
      setClauses.push('silent_notification = ?');
      values.push(updates.silentNotification ? 1 : 0);
    }
    if (updates.acceptedAt !== undefined) {
      setClauses.push('accepted_at = ?');
      values.push(updates.acceptedAt);
    }
    if (updates.completedAt !== undefined) {
      setClauses.push('completed_at = ?');
      values.push(updates.completedAt);
    }

    if (setClauses.length === 0) return;

    values.push(id);
    await this.db.runAsync(
      `UPDATE quest SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteQuest(id: string): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    await this.db.runAsync('DELETE FROM quest WHERE id = ?', [id]);
    await this.db.runAsync('DELETE FROM notification_ids WHERE quest_id = ?', [id]);
  }

  // 通知ID管理
  async saveNotificationId(record: NotificationIdRecord): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    await this.db.runAsync(
      `INSERT OR REPLACE INTO notification_ids (quest_id, trigger_type, notification_id)
       VALUES (?, ?, ?)`,
      [record.questId, record.triggerType, record.notificationId]
    );
  }

  async getNotificationIds(questId: string): Promise<NotificationIdRecord[]> {
    if (!this.db) throw new Error('数据库未初始化');

    const rows = await this.db.getAllAsync<any>(
      'SELECT * FROM notification_ids WHERE quest_id = ?',
      [questId]
    );

    return rows.map(row => ({
      questId: row.quest_id,
      triggerType: row.trigger_type,
      notificationId: row.notification_id
    }));
  }

  async deleteNotificationIds(questId: string): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    await this.db.runAsync('DELETE FROM notification_ids WHERE quest_id = ?', [questId]);
  }

  // 获取今日任务
  async getTodayQuests(): Promise<Quest[]> {
    if (!this.db) throw new Error('数据库未初始化');

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const rows = await this.db.getAllAsync<any>(
      `SELECT * FROM quest
       WHERE status IN ('todo', 'in_progress')
       AND deadline BETWEEN ? AND ?
       ORDER BY deadline ASC`,
      [startOfDay.toISOString(), endOfDay.toISOString()]
    );

    return rows.map(this.mapRowToQuest);
  }

  // 获取逾期任务
  async getExpiredQuests(): Promise<Quest[]> {
    if (!this.db) throw new Error('数据库未初始化');

    const now = new Date().toISOString();
    const rows = await this.db.getAllAsync<any>(
      `SELECT * FROM quest
       WHERE status IN ('todo', 'in_progress')
       AND deadline < ?`,
      [now]
    );

    return rows.map(this.mapRowToQuest);
  }

  // 批量更新任务状态
  async batchUpdateQuestStatus(ids: string[], status: QuestStatus): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    if (ids.length === 0) return;

    const placeholders = ids.map(() => '?').join(',');
    await this.db.runAsync(
      `UPDATE quest SET status = ? WHERE id IN (${placeholders})`,
      [status, ...ids]
    );
  }

  // 数据导出
  async exportData(): Promise<{ user: Adventurer; quests: Quest[] }> {
    if (!this.db) throw new Error('数据库未初始化');

    const user = await this.getUser();
    if (!user) throw new Error('用户数据不存在');

    const quests = await this.getQuests('all');
    return { user, quests };
  }

  // 数据导入
  async importData(data: { user: Adventurer; quests: Quest[] }): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    // 清空现有数据
    await this.db.execAsync('DELETE FROM quest');
    await this.db.execAsync('DELETE FROM notification_ids');

    // 更新用户数据
    await this.updateUser(data.user);

    // 插入任务数据
    for (const quest of data.quests) {
      await this.createQuest(quest);
    }
  }

  // 辅助方法：将数据库行转换为Quest对象
  private mapRowToQuest(row: any): Quest {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      deadline: row.deadline,
      status: row.status,
      rewards: JSON.parse(row.rewards),
      exp: row.exp,
      silentNotification: Boolean(row.silent_notification),
      createdAt: row.created_at,
      acceptedAt: row.accepted_at,
      completedAt: row.completed_at
    };
  }
}

// 导出单例实例
export const databaseService = new DatabaseService();