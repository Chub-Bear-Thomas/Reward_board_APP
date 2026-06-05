import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Title,
  Paragraph,
  Button,
  Card,
  Divider,
  IconButton,
  Chip,
  Avatar,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../stores/useStore';
import { QuestDetailScreenProps } from '../types/navigation';
import { colors, spacing, shadows, getStatusColor, getStatusText, getLevelColor } from '../utils/theme';
import { formatDateTime, formatTimeRemaining, isExpired, calculateLevel } from '../utils/helpers';
import { Quest } from '../types';

const QuestDetailScreen: React.FC<QuestDetailScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { questId } = route.params;
  const {
    quests,
    adventurer,
    loadQuests,
    acceptQuest,
    completeQuest,
    abandonQuest,
    deleteQuest,
    getCurrentLevel,
    getInProgressQuestCount,
    getMaxConcurrentQuests,
  } = useStore();

  const [quest, setQuest] = useState<Quest | null>(null);

  useEffect(() => {
    loadQuests();
  }, []);

  useEffect(() => {
    const foundQuest = quests.find(q => q.id === questId);
    if (foundQuest) {
      setQuest(foundQuest);
    }
  }, [quests, questId]);

  if (!quest) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor={colors.textLight}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>任务详情</Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  const expired = isExpired(quest.deadline);
  const timeRemaining = formatTimeRemaining(quest.deadline);
  const statusColor = getStatusColor(quest.status);
  const statusText = getStatusText(quest.status);
  const levelInfo = getCurrentLevel();
  const inProgressCount = getInProgressQuestCount();
  const maxConcurrent = getMaxConcurrentQuests();

  const canAccept = quest.status === 'todo' && inProgressCount < maxConcurrent;
  const canComplete = quest.status === 'in_progress';
  const canAbandon = quest.status === 'in_progress';
  const canEdit = quest.status === 'todo';
  const canDelete = quest.status === 'todo' || quest.status === 'failed';

  const handleAccept = async () => {
    if (!canAccept) {
      Alert.alert('无法接受', `并行委托已达上限 (当前上限${maxConcurrent})，请先完成或放弃部分任务`);
      return;
    }

    Alert.alert(
      '接受委托',
      `确定要接受委托【${quest.title}】吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '接受',
          onPress: async () => {
            await acceptQuest(quest.id);
            Alert.alert('成功', '委托已接受，请在截止时间前完成！');
          },
        },
      ]
    );
  };

  const handleComplete = async () => {
    Alert.alert(
      '完成委托',
      `确定要完成委托【${quest.title}】吗？将获得 ${quest.exp} 点经验值。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '完成',
          onPress: async () => {
            await completeQuest(quest.id);
            Alert.alert('🎉 恭喜！', `委托完成！获得 ${quest.exp} 点经验值！`);
          },
        },
      ]
    );
  };

  const handleAbandon = async () => {
    Alert.alert(
      '放弃委托',
      '确定要放弃此委托吗？放弃后将无法获得奖励。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '放弃',
          style: 'destructive',
          onPress: async () => {
            await abandonQuest(quest.id);
            Alert.alert('委托已放弃', '很遗憾，委托已标记为失败。');
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('CreateQuest', { questId: quest.id });
  };

  const handleDelete = async () => {
    Alert.alert(
      '删除委托',
      '确定要删除此委托吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await deleteQuest(quest.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={colors.textLight}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>委托详情</Text>
        {canEdit && (
          <IconButton
            icon="pencil"
            iconColor={colors.textLight}
            onPress={handleEdit}
          />
        )}
        {!canEdit && <View style={{ width: 48 }} />}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* 状态印章 */}
        <View style={[styles.statusStamp, { borderColor: statusColor }]}>
          <Text style={[styles.statusStampText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>

        {/* 任务标题 */}
        <Title style={styles.questTitle}>{quest.title}</Title>

        {/* 任务描述 */}
        {quest.description && (
          <Card style={styles.descriptionCard}>
            <Card.Content>
              <Paragraph style={styles.descriptionText}>{quest.description}</Paragraph>
            </Card.Content>
          </Card>
        )}

        {/* 任务信息 */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>截止时间</Text>
                <Text style={styles.infoValue}>{formatDateTime(quest.deadline)}</Text>
                {quest.status === 'in_progress' && (
                  <Text style={[styles.timeRemaining, expired && styles.timeExpired]}>
                    {timeRemaining}
                  </Text>
                )}
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>💎</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>经验值奖励</Text>
                <Text style={styles.infoValue}>{quest.exp} 点</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⏰</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>创建时间</Text>
                <Text style={styles.infoValue}>{formatDateTime(quest.createdAt)}</Text>
              </View>
            </View>

            {quest.acceptedAt && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>🚀</Text>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>接受时间</Text>
                    <Text style={styles.infoValue}>{formatDateTime(quest.acceptedAt)}</Text>
                  </View>
                </View>
              </>
            )}

            {quest.completedAt && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>
                    {quest.status === 'done' ? '✅' : '❌'}
                  </Text>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>
                      {quest.status === 'done' ? '完成时间' : '失败时间'}
                    </Text>
                    <Text style={styles.infoValue}>{formatDateTime(quest.completedAt)}</Text>
                  </View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* 奖励物品 */}
        {quest.rewards.length > 0 && (
          <Card style={styles.rewardsCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>🎁 奖励物品</Text>
              <View style={styles.rewardsList}>
                {quest.rewards.map((reward, index) => (
                  <View key={index} style={styles.rewardItem}>
                    <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
                    <View style={styles.rewardInfo}>
                      <Text style={styles.rewardName}>{reward.name}</Text>
                      <Text style={styles.rewardQuantity}>×{reward.quantity}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* 通知设置 */}
        <Card style={styles.notificationCard}>
          <Card.Content>
            <View style={styles.notificationRow}>
              <Text style={styles.notificationIcon}>🔔</Text>
              <Text style={styles.notificationText}>
                {quest.silentNotification ? '已静默（不提醒）' : '正常提醒'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* 任务ID（调试用） */}
        <Text style={styles.questId}>ID: {quest.id}</Text>
      </ScrollView>

      {/* 底部操作按钮 */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {quest.status === 'todo' && (
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={handleAccept}
              style={[styles.button, styles.acceptButton]}
              labelStyle={styles.buttonLabel}
              disabled={!canAccept}
            >
              接受委托
            </Button>
            <Button
              mode="contained"
              onPress={handleComplete}
              style={[styles.button, styles.completeButton]}
              labelStyle={styles.buttonLabel}
            >
              直接完成
            </Button>
          </View>
        )}

        {quest.status === 'in_progress' && (
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={handleComplete}
              style={[styles.button, styles.completeButton]}
              labelStyle={styles.buttonLabel}
            >
              完成委托
            </Button>
            <Button
              mode="outlined"
              onPress={handleAbandon}
              style={[styles.button, styles.abandonButton]}
              labelStyle={[styles.buttonLabel, styles.abandonButtonLabel]}
            >
              放弃委托
            </Button>
          </View>
        )}

        {(quest.status === 'done' || quest.status === 'failed') && canDelete && (
          <Button
            mode="outlined"
            onPress={handleDelete}
            style={[styles.button, styles.deleteButton]}
            labelStyle={[styles.buttonLabel, styles.deleteButtonLabel]}
          >
            删除委托
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.woodDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  statusStamp: {
    alignSelf: 'center',
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    transform: [{ rotate: '-5deg' }],
  },
  statusStampText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  questTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 36,
  },
  descriptionCard: {
    backgroundColor: colors.parchment,
    marginBottom: spacing.md,
    elevation: 2,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: colors.parchment,
    marginBottom: spacing.md,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  timeRemaining: {
    fontSize: 14,
    color: colors.warning,
    marginTop: 4,
    fontWeight: 'bold',
  },
  timeExpired: {
    color: colors.error,
  },
  divider: {
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  rewardsCard: {
    backgroundColor: colors.parchment,
    marginBottom: spacing.md,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  rewardsList: {
    gap: spacing.sm,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.parchmentDark,
    padding: spacing.sm,
    borderRadius: 8,
  },
  rewardEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  rewardInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardName: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  rewardQuantity: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  notificationCard: {
    backgroundColor: colors.parchment,
    marginBottom: spacing.md,
    elevation: 2,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  notificationText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  questId: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    opacity: 0.5,
  },
  footer: {
    backgroundColor: colors.parchment,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: colors.woodDark,
  },
  completeButton: {
    backgroundColor: colors.success,
  },
  abandonButton: {
    borderColor: colors.error,
  },
  abandonButtonLabel: {
    color: colors.error,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  deleteButtonLabel: {
    color: colors.error,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: spacing.xs,
  },
});

export default QuestDetailScreen;