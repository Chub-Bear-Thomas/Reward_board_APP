import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  FAB,
  Card,
  Title,
  Paragraph,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Searchbar,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../stores/useStore';
import { HomeScreenProps } from '../types/navigation';
import { colors, spacing, shadows, getStatusColor, getStatusText, getLevelColor } from '../utils/theme';
import { formatDateTime, formatTimeRemaining, isExpired } from '../utils/helpers';
import { Quest, FilterTag } from '../types';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    adventurer,
    quests,
    currentFilter,
    isLoading,
    error,
    loadQuests,
    setFilter,
    checkExpiredQuests,
    clearError,
    getCurrentLevel,
    getInProgressQuestCount,
    getMaxConcurrentQuests,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadQuests();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('错误', error, [{ text: '确定', onPress: clearError }]);
    }
  }, [error]);

  const onRefresh = async () => {
    setRefreshing(true);
    await checkExpiredQuests();
    await loadQuests();
    setRefreshing(false);
  };

  const handleFilterChange = (filter: FilterTag) => {
    setFilter(filter);
  };

  const handleQuestPress = (quest: Quest) => {
    navigation.navigate('QuestDetail', { questId: quest.id });
  };

  const handleCreateQuest = () => {
    navigation.navigate('CreateQuest');
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const filteredQuests = quests.filter(quest =>
    quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quest.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const levelInfo = getCurrentLevel();
  const inProgressCount = getInProgressQuestCount();
  const maxConcurrent = getMaxConcurrentQuests();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 顶部状态栏 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.guildTitle}>⚔️ 冒险者公会</Text>
          <Text style={styles.guildSubtitle}>悬赏公告栏</Text>
        </View>
        <TouchableOpacity style={styles.profileContainer} onPress={handleProfilePress}>
          <Avatar.Text
            size={40}
            label={`Lv.${levelInfo.level}`}
            style={[styles.avatar, { backgroundColor: getLevelColor(levelInfo.level) }]}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{adventurer?.nickname || '冒险者'}</Text>
            <Text style={styles.profileLevel}>{levelInfo.title}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 搜索栏 */}
      <Searchbar
        placeholder="搜索悬赏任务..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor={colors.woodDark}
      />

      {/* 筛选标签 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <Chip
          selected={currentFilter === 'today'}
          onPress={() => handleFilterChange('today')}
          style={[styles.filterChip, currentFilter === 'today' && styles.filterChipSelected]}
          textStyle={[styles.filterChipText, currentFilter === 'today' && styles.filterChipTextSelected]}
        >
          今日悬赏
        </Chip>
        <Chip
          selected={currentFilter === 'all'}
          onPress={() => handleFilterChange('all')}
          style={[styles.filterChip, currentFilter === 'all' && styles.filterChipSelected]}
          textStyle={[styles.filterChipText, currentFilter === 'all' && styles.filterChipTextSelected]}
        >
          全部委托
        </Chip>
        <Chip
          selected={currentFilter === 'done'}
          onPress={() => handleFilterChange('done')}
          style={[styles.filterChip, currentFilter === 'done' && styles.filterChipSelected]}
          textStyle={[styles.filterChipText, currentFilter === 'done' && styles.filterChipTextSelected]}
        >
          已完成
        </Chip>
        <Chip
          selected={currentFilter === 'failed'}
          onPress={() => handleFilterChange('failed')}
          style={[styles.filterChip, currentFilter === 'failed' && styles.filterChipSelected]}
          textStyle={[styles.filterChipText, currentFilter === 'failed' && styles.filterChipTextSelected]}
        >
          已失败
        </Chip>
      </ScrollView>

      {/* 任务统计 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{inProgressCount}</Text>
          <Text style={styles.statLabel}>进行中</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{maxConcurrent}</Text>
          <Text style={styles.statLabel}>上限</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{quests.filter(q => q.status === 'todo').length}</Text>
          <Text style={styles.statLabel}>待接取</Text>
        </View>
      </View>

      {/* 任务列表 */}
      <ScrollView
        style={styles.questList}
        contentContainerStyle={styles.questListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredQuests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyTitle}>暂无悬赏委托</Text>
            <Text style={styles.emptySubtitle}>
              {currentFilter === 'today'
                ? '今日没有待处理的委托'
                : '没有找到匹配的委托'}
            </Text>
          </View>
        ) : (
          filteredQuests.map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onPress={() => handleQuestPress(quest)}
            />
          ))
        )}
      </ScrollView>

      {/* 悬浮按钮 */}
      <FAB
        icon="plus"
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={handleCreateQuest}
        color={colors.textLight}
      />
    </View>
  );
};

// 任务卡片组件
interface QuestCardProps {
  quest: Quest;
  onPress: () => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onPress }) => {
  const expired = isExpired(quest.deadline);
  const timeRemaining = formatTimeRemaining(quest.deadline);
  const statusColor = getStatusColor(quest.status);
  const statusText = getStatusText(quest.status);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.questCard, expired && styles.questCardExpired]}>
        <Card.Content>
          <View style={styles.questHeader}>
            <View style={styles.questStatus}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
            <Text style={styles.questTime}>
              {quest.status === 'in_progress' ? timeRemaining : formatDateTime(quest.deadline)}
            </Text>
          </View>

          <Title style={styles.questTitle} numberOfLines={2}>
            {quest.title}
          </Title>

          {quest.description && (
            <Paragraph style={styles.questDescription} numberOfLines={2}>
              {quest.description}
            </Paragraph>
          )}

          <View style={styles.questFooter}>
            <View style={styles.questRewards}>
              {quest.rewards.slice(0, 3).map((reward, index) => (
                <Text key={index} style={styles.rewardEmoji}>
                  {reward.emoji}
                </Text>
              ))}
            </View>
            <View style={styles.questExp}>
              <Text style={styles.expIcon}>💎</Text>
              <Text style={styles.expText}>{quest.exp}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.woodDark,
  },
  headerLeft: {
    flex: 1,
  },
  guildTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  guildSubtitle: {
    fontSize: 14,
    color: colors.goldLight,
    marginTop: 2,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: spacing.sm,
  },
  profileInfo: {
    alignItems: 'flex-end',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  profileLevel: {
    fontSize: 12,
    color: colors.goldLight,
    marginTop: 2,
  },
  searchBar: {
    margin: spacing.md,
    backgroundColor: colors.parchment,
    borderRadius: 8,
    elevation: 2,
  },
  searchInput: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterChip: {
    marginRight: spacing.sm,
    backgroundColor: colors.parchmentDark,
    borderRadius: 20,
  },
  filterChipSelected: {
    backgroundColor: colors.woodDark,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  filterChipTextSelected: {
    color: colors.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.parchment,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.woodDark,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.borderLight,
  },
  questList: {
    flex: 1,
  },
  questListContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  questCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.parchment,
    borderRadius: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
  },
  questCardExpired: {
    borderLeftColor: colors.error,
    opacity: 0.7,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  questStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  questTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  questDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  questRewards: {
    flexDirection: 'row',
  },
  rewardEmoji: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  questExp: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  expText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: colors.woodDark,
    borderRadius: 28,
  },
});

export default HomeScreen;