import React, { useState } from 'react';
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
  Card,
  Avatar,
  Button,
  IconButton,
  Divider,
  TextInput,
  Modal,
  Portal,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../stores/useStore';
import { ProfileScreenProps } from '../types/navigation';
import { colors, spacing, shadows, getLevelColor } from '../utils/theme';
import { formatExp } from '../utils/helpers';
import { AVATAR_IDS } from '../types';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    adventurer,
    quests,
    updateAdventurer,
    getCurrentLevel,
    getInProgressQuestCount,
    getMaxConcurrentQuests,
  } = useStore();

  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const levelInfo = getCurrentLevel();
  const inProgressCount = getInProgressQuestCount();
  const maxConcurrent = getMaxConcurrentQuests();

  const handleEditNickname = () => {
    setNewNickname(adventurer?.nickname || '');
    setIsEditingNickname(true);
  };

  const handleSaveNickname = async () => {
    if (newNickname.trim()) {
      await updateAdventurer({ nickname: newNickname.trim() });
      setIsEditingNickname(false);
    } else {
      Alert.alert('提示', '昵称不能为空');
    }
  };

  const handleSelectAvatar = async (avatarId: number) => {
    await updateAdventurer({ avatarId });
    setShowAvatarPicker(false);
  };

  const handleNotificationToggle = async () => {
    if (!adventurer) return;

    const newValue = !adventurer.notificationEnabled;
    await updateAdventurer({ notificationEnabled: newValue });

    if (newValue) {
      Alert.alert('通知已开启', '您将收到晨间提醒和截止预警通知');
    } else {
      Alert.alert('通知已关闭', '您将不再收到任何通知');
    }
  };

  const handleMorningReminderTimeChange = async (time: string) => {
    await updateAdventurer({ morningReminderTime: time });
  };

  const getAvatarLabel = (avatarId: number): string => {
    const avatarLabels = ['🧙', '⚔️', '🛡️', '🏹', '🗡️', '🎭', '👑', '🐉'];
    return avatarLabels[avatarId] || '🧙';
  };

  const getAvatarColor = (avatarId: number): string => {
    const avatarColors = [
      '#8B4513', '#A0522D', '#CD853F', '#DAA520',
      '#B8860B', '#FFD700', '#FFA500', '#FF8C00',
    ];
    return avatarColors[avatarId] || '#8B4513';
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
        <Text style={styles.headerTitle}>冒险者档案</Text>
        <IconButton
          icon="cog"
          iconColor={colors.textLight}
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* 头像和昵称 */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <TouchableOpacity onPress={() => setShowAvatarPicker(true)}>
              <Avatar.Text
                size={80}
                label={getAvatarLabel(adventurer?.avatarId || 0)}
                style={[
                  styles.avatar,
                  { backgroundColor: getAvatarColor(adventurer?.avatarId || 0) },
                ]}
              />
              <View style={styles.avatarEditBadge}>
                <Text style={styles.avatarEditText}>✏️</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              {isEditingNickname ? (
                <View style={styles.nicknameEditContainer}>
                  <TextInput
                    mode="outlined"
                    value={newNickname}
                    onChangeText={setNewNickname}
                    maxLength={20}
                    style={styles.nicknameInput}
                    outlineStyle={styles.nicknameInputOutline}
                    theme={{ colors: { primary: colors.woodDark } }}
                  />
                  <View style={styles.nicknameButtons}>
                    <Button
                      mode="text"
                      onPress={() => setIsEditingNickname(false)}
                      labelStyle={styles.nicknameButtonLabel}
                    >
                      取消
                    </Button>
                    <Button
                      mode="text"
                      onPress={handleSaveNickname}
                      labelStyle={[styles.nicknameButtonLabel, styles.nicknameSaveButton]}
                    >
                      保存
                    </Button>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={handleEditNickname}>
                  <View style={styles.nicknameContainer}>
                    <Text style={styles.nickname}>{adventurer?.nickname || '冒险者'}</Text>
                    <Text style={styles.editIcon}>✏️</Text>
                  </View>
                </TouchableOpacity>
              )}

              <Text style={styles.levelTitle}>
                Lv.{levelInfo.level} {levelInfo.title}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* 经验值信息 */}
        <Card style={styles.expCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>经验值</Text>
            <View style={styles.expContainer}>
              <View style={styles.expBarContainer}>
                <View style={styles.expBarBackground}>
                  <View
                    style={[
                      styles.expBarFill,
                      {
                        width: `${levelInfo.progress * 100}%`,
                        backgroundColor: getLevelColor(levelInfo.level),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.expText}>
                  {formatExp(levelInfo.currentExp)} / {formatExp(levelInfo.nextLevelExp)}
                </Text>
              </View>
            </View>

            <View style={styles.expDetails}>
              <View style={styles.expDetailItem}>
                <Text style={styles.expDetailLabel}>当前等级</Text>
                <Text style={styles.expDetailValue}>Lv.{levelInfo.level}</Text>
              </View>
              <View style={styles.expDetailDivider} />
              <View style={styles.expDetailItem}>
                <Text style={styles.expDetailLabel}>升级进度</Text>
                <Text style={styles.expDetailValue}>
                  {Math.round(levelInfo.progress * 100)}%
                </Text>
              </View>
              <View style={styles.expDetailDivider} />
              <View style={styles.expDetailItem}>
                <Text style={styles.expDetailLabel}>还需经验</Text>
                <Text style={styles.expDetailValue}>
                  {formatExp(levelInfo.nextLevelExp - levelInfo.currentExp)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 任务统计 */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>任务统计</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{inProgressCount}</Text>
                <Text style={styles.statLabel}>进行中</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{maxConcurrent}</Text>
                <Text style={styles.statLabel}>并行上限</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {quests.filter(q => q.status === 'done').length}
                </Text>
                <Text style={styles.statLabel}>已完成</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {quests.filter(q => q.status === 'failed').length}
                </Text>
                <Text style={styles.statLabel}>已失败</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 设置入口 */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>设置</Text>

            <TouchableOpacity style={styles.settingItem} onPress={handleNotificationToggle}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🔔</Text>
                <View>
                  <Text style={styles.settingLabel}>通知开关</Text>
                  <Text style={styles.settingDescription}>
                    {adventurer?.notificationEnabled ? '已开启' : '已关闭'}
                  </Text>
                </View>
              </View>
              <Text style={styles.settingValue}>
                {adventurer?.notificationEnabled ? '开' : '关'}
              </Text>
            </TouchableOpacity>

            <Divider style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>⏰</Text>
                <View>
                  <Text style={styles.settingLabel}>晨间提醒时间</Text>
                  <Text style={styles.settingDescription}>每日提醒接取委托</Text>
                </View>
              </View>
              <Text style={styles.settingValue}>{adventurer?.morningReminderTime || '08:00'}</Text>
            </TouchableOpacity>

            <Divider style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>📊</Text>
                <View>
                  <Text style={styles.settingLabel}>数据管理</Text>
                  <Text style={styles.settingDescription}>导出/导入数据</Text>
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* 等级称号列表 */}
        <Card style={styles.titlesCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>等级称号</Text>
            <View style={styles.titlesList}>
              {[
                { level: 1, title: '见习冒险者' },
                { level: 2, title: '新手冒险者' },
                { level: 3, title: '初级冒险者' },
                { level: 4, title: '独当一面的冒险者' },
                { level: 5, title: '公会骨干' },
                { level: 6, title: '精英冒险者' },
                { level: 7, title: '高阶冒险者' },
                { level: 8, title: '英雄冒险者' },
                { level: 9, title: '传奇冒险者' },
                { level: 10, title: '史诗冒险者Ⅰ' },
              ].map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.titleItem,
                    levelInfo.level >= item.level && styles.titleItemUnlocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.titleLevel,
                      levelInfo.level >= item.level && styles.titleLevelUnlocked,
                    ]}
                  >
                    Lv.{item.level}
                  </Text>
                  <Text
                    style={[
                      styles.titleText,
                      levelInfo.level >= item.level && styles.titleTextUnlocked,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {levelInfo.level >= item.level && (
                    <Text style={styles.titleCheck}>✓</Text>
                  )}
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* 头像选择模态框 */}
      <Portal>
        <Modal
          visible={showAvatarPicker}
          onDismiss={() => setShowAvatarPicker(false)}
          contentContainerStyle={styles.avatarModal}
        >
          <Text style={styles.avatarModalTitle}>选择头像</Text>
          <View style={styles.avatarGrid}>
            {AVATAR_IDS.map(avatarId => (
              <TouchableOpacity
                key={avatarId}
                style={[
                  styles.avatarItem,
                  adventurer?.avatarId === avatarId && styles.avatarItemSelected,
                ]}
                onPress={() => handleSelectAvatar(avatarId)}
              >
                <Avatar.Text
                  size={60}
                  label={getAvatarLabel(avatarId)}
                  style={{ backgroundColor: getAvatarColor(avatarId) }}
                />
                {adventurer?.avatarId === avatarId && (
                  <View style={styles.avatarSelectedBadge}>
                    <Text style={styles.avatarSelectedText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <Button
            mode="outlined"
            onPress={() => setShowAvatarPicker(false)}
            style={styles.avatarModalCloseButton}
          >
            取消
          </Button>
        </Modal>
      </Portal>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    backgroundColor: colors.parchment,
    marginBottom: spacing.md,
    elevation: 3,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: spacing.lg,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.woodDark,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditText: {
    fontSize: 10,
  },
  profileInfo: {
    flex: 1,
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  nickname: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  editIcon: {
    fontSize: 16,
  },
  nicknameEditContainer: {
    marginBottom: spacing.sm,
  },
  nicknameInput: {
    backgroundColor: colors.parchment,
    marginBottom: spacing.sm,
  },
  nicknameInputOutline: {
    borderColor: colors.borderLight,
    borderRadius: 8,
  },
  nicknameButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  nicknameButtonLabel: {
    fontSize: 14,
  },
  nicknameSaveButton: {
    color: colors.woodDark,
    fontWeight: 'bold',
  },
  levelTitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  expCard: {
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
  expContainer: {
    marginBottom: spacing.md,
  },
  expBarContainer: {
    marginBottom: spacing.sm,
  },
  expBarBackground: {
    height: 20,
    backgroundColor: colors.parchmentDark,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  expBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  expText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  expDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  expDetailItem: {
    alignItems: 'center',
  },
  expDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  expDetailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  expDetailDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.borderLight,
  },
  statsCard: {
    backgroundColor: colors.parchment,
    marginBottom: spacing.md,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.woodDark,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  settingsCard: {
    backgroundColor: colors.parchment,
    marginBottom: spacing.md,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  settingValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  settingArrow: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  settingDivider: {
    backgroundColor: colors.borderLight,
  },
  titlesCard: {
    backgroundColor: colors.parchment,
    marginBottom: spacing.md,
    elevation: 2,
  },
  titlesList: {
    gap: spacing.sm,
  },
  titleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.parchmentDark,
    borderRadius: 8,
    opacity: 0.5,
  },
  titleItemUnlocked: {
    backgroundColor: colors.parchment,
    opacity: 1,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  titleLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
    width: 50,
  },
  titleLevelUnlocked: {
    color: colors.woodDark,
  },
  titleText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
  },
  titleTextUnlocked: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  titleCheck: {
    fontSize: 18,
    color: colors.success,
    fontWeight: 'bold',
  },
  avatarModal: {
    backgroundColor: colors.parchment,
    margin: spacing.lg,
    borderRadius: 12,
    padding: spacing.md,
  },
  avatarModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  avatarItem: {
    position: 'relative',
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarItemSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.parchmentDark,
  },
  avatarSelectedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.success,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSelectedText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  avatarModalCloseButton: {
    marginTop: spacing.lg,
    borderColor: colors.woodDark,
  },
});

export default ProfileScreen;