import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Text,
  Title,
  TextInput,
  Button,
  Card,
  Switch,
  IconButton,
  Divider,
  Chip,
  Modal,
  Portal,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from '../stores/useStore';
import { CreateQuestScreenProps } from '../types/navigation';
import { colors, spacing, shadows } from '../utils/theme';
import { validateQuestForm, formatDateTime } from '../utils/helpers';
import { QuestFormData, RewardItem, Quest } from '../types';

// 本地emoji数据集
const EMOJI_LIST = [
  '☕', '🍵', '🥤', '🍺', '🍷', '🥂', '🍰', '🎂', '🍩', '🍪',
  '🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎵',
  '📚', '📖', '📝', '✏️', '📐', '📏', '🖍️', '🖌️', '🖊️', '🖋️',
  '🏃', '⚽', '🏀', '🎾', '🎱', '🏓', '🏸', '🥊', '🥋', '🏄',
  '🎬', '📺', '📻', '📷', '📹', '🎥', '📽️', '🎞️', '🎙️', '🎚️',
  '🎁', '🎀', '🎊', '🎉', '🎈', '🎄', '🎃', '🎗️', '🎟️', '🎫',
  '💎', '💍', '👑', '🏅', '🥇', '🥈', '🥉', '🏆', '🎖️', '🏵️',
  '🌟', '⭐', '✨', '💫', '🔥', '💥', '⚡', '🌈', '☀️', '🌙',
];

const CreateQuestScreen: React.FC<CreateQuestScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { createQuest, updateQuest, quests } = useStore();
  const questId = route.params?.questId;
  const isEditing = !!questId;

  const [formData, setFormData] = useState<QuestFormData>({
    title: '',
    description: '',
    deadline: new Date(new Date().setHours(23, 59, 0, 0)),
    rewards: [],
    exp: 200,
    silentNotification: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentRewardIndex, setCurrentRewardIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isEditing) {
      const existingQuest = quests.find(q => q.id === questId);
      if (existingQuest) {
        setFormData({
          title: existingQuest.title,
          description: existingQuest.description || '',
          deadline: new Date(existingQuest.deadline),
          rewards: existingQuest.rewards,
          exp: existingQuest.exp,
          silentNotification: existingQuest.silentNotification,
        });
      }
    }
  }, [isEditing, questId, quests]);

  const updateFormField = <K extends keyof QuestFormData>(
    field: K,
    value: QuestFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除相关错误
    setErrors(prev => prev.filter(e => !e.includes(field === 'title' ? '标题' : '经验值')));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = formData.deadline;
      const newDate = new Date(selectedDate);
      newDate.setHours(currentDate.getHours(), currentDate.getMinutes());
      updateFormField('deadline', newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = formData.deadline;
      const newDate = new Date(currentDate);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      updateFormField('deadline', newDate);
    }
  };

  const addReward = () => {
    if (formData.rewards.length >= 3) {
      Alert.alert('提示', '最多只能添加3个奖励物品');
      return;
    }

    const newReward: RewardItem = {
      name: '',
      emoji: '🎁',
      quantity: 1,
    };

    updateFormField('rewards', [...formData.rewards, newReward]);
  };

  const removeReward = (index: number) => {
    const newRewards = formData.rewards.filter((_, i) => i !== index);
    updateFormField('rewards', newRewards);
  };

  const updateReward = (index: number, field: keyof RewardItem, value: any) => {
    const newRewards = [...formData.rewards];
    newRewards[index] = { ...newRewards[index], [field]: value };
    updateFormField('rewards', newRewards);
  };

  const openEmojiPicker = (index: number) => {
    setCurrentRewardIndex(index);
    setShowEmojiPicker(true);
  };

  const selectEmoji = (emoji: string) => {
    if (currentRewardIndex !== null) {
      updateReward(currentRewardIndex, 'emoji', emoji);
    }
    setShowEmojiPicker(false);
    setCurrentRewardIndex(null);
  };

  const setQuickExp = (exp: number) => {
    updateFormField('exp', exp);
  };

  const validateForm = (): boolean => {
    const validation = validateQuestForm({
      title: formData.title,
      deadline: formData.deadline,
      exp: formData.exp,
    });

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        await updateQuest(questId!, {
          title: formData.title,
          description: formData.description || undefined,
          deadline: formData.deadline.toISOString(),
          rewards: formData.rewards,
          exp: formData.exp,
          silentNotification: formData.silentNotification,
        });
        Alert.alert('成功', '委托已更新', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createQuest(formData);
        Alert.alert('成功', '委托已创建', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('错误', '保存委托失败，请重试');
    }
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
        <Text style={styles.headerTitle}>
          {isEditing ? '编辑委托' : '创建新委托'}
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* 标题输入 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>委托标题 *</Text>
            <TextInput
              mode="outlined"
              value={formData.title}
              onChangeText={text => updateFormField('title', text)}
              placeholder="输入委托标题（最多40字）"
              maxLength={40}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              theme={{ colors: { primary: colors.woodDark } }}
            />
            {errors.some(e => e.includes('标题')) && (
              <Text style={styles.errorText}>请输入委托标题</Text>
            )}
          </Card.Content>
        </Card>

        {/* 描述输入 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>委托描述</Text>
            <TextInput
              mode="outlined"
              value={formData.description}
              onChangeText={text => updateFormField('description', text)}
              placeholder="输入委托描述（可选，最多200字）"
              maxLength={200}
              multiline
              numberOfLines={3}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              theme={{ colors: { primary: colors.woodDark } }}
            />
          </Card.Content>
        </Card>

        {/* 截止时间 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>截止时间 *</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateTimeIcon}>📅</Text>
                <Text style={styles.dateTimeText}>
                  {formData.deadline.toLocaleDateString('zh-CN')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateTimeIcon}>⏰</Text>
                <Text style={styles.dateTimeText}>
                  {formData.deadline.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {errors.some(e => e.includes('截止时间')) && (
              <Text style={styles.errorText}>截止时间已过，请重新设定</Text>
            )}
          </Card.Content>
        </Card>

        {/* 经验值 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>经验值奖励 *</Text>
            <TextInput
              mode="outlined"
              value={formData.exp.toString()}
              onChangeText={text => {
                const exp = parseInt(text) || 0;
                updateFormField('exp', exp);
              }}
              placeholder="输入经验值（1-9999）"
              keyboardType="numeric"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              theme={{ colors: { primary: colors.woodDark } }}
            />

            <View style={styles.quickExpContainer}>
              <Text style={styles.quickExpLabel}>快捷选择：</Text>
              <Chip
                selected={formData.exp === 50}
                onPress={() => setQuickExp(50)}
                style={styles.quickExpChip}
                textStyle={styles.quickExpChipText}
              >
                微量 50
              </Chip>
              <Chip
                selected={formData.exp === 200}
                onPress={() => setQuickExp(200)}
                style={styles.quickExpChip}
                textStyle={styles.quickExpChipText}
              >
                适中 200
              </Chip>
              <Chip
                selected={formData.exp === 500}
                onPress={() => setQuickExp(500)}
                style={styles.quickExpChip}
                textStyle={styles.quickExpChipText}
              >
                丰厚 500
              </Chip>
            </View>

            {errors.some(e => e.includes('经验值')) && (
              <Text style={styles.errorText}>经验值必须在1-9999之间</Text>
            )}
          </Card.Content>
        </Card>

        {/* 奖励物品 */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>奖励物品</Text>
              <Text style={styles.sectionSubtitle}>最多3项</Text>
            </View>

            {formData.rewards.map((reward, index) => (
              <View key={index} style={styles.rewardItem}>
                <TouchableOpacity
                  style={styles.emojiButton}
                  onPress={() => openEmojiPicker(index)}
                >
                  <Text style={styles.emojiText}>{reward.emoji}</Text>
                </TouchableOpacity>

                <TextInput
                  mode="outlined"
                  value={reward.name}
                  onChangeText={text => updateReward(index, 'name', text)}
                  placeholder="物品名称"
                  maxLength={20}
                  style={[styles.input, styles.rewardNameInput]}
                  outlineStyle={styles.inputOutline}
                  theme={{ colors: { primary: colors.woodDark } }}
                />

                <TextInput
                  mode="outlined"
                  value={reward.quantity.toString()}
                  onChangeText={text => {
                    const quantity = parseInt(text) || 1;
                    updateReward(index, 'quantity', Math.min(99, Math.max(1, quantity)));
                  }}
                  placeholder="数量"
                  keyboardType="numeric"
                  style={[styles.input, styles.rewardQuantityInput]}
                  outlineStyle={styles.inputOutline}
                  theme={{ colors: { primary: colors.woodDark } }}
                />

                <IconButton
                  icon="close"
                  iconColor={colors.error}
                  size={20}
                  onPress={() => removeReward(index)}
                />
              </View>
            ))}

            {formData.rewards.length < 3 && (
              <Button
                mode="outlined"
                onPress={addReward}
                style={styles.addRewardButton}
                labelStyle={styles.addRewardButtonLabel}
                icon="plus"
              >
                添加奖励
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* 通知设置 */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>静默通知</Text>
                <Text style={styles.switchDescription}>
                  开启后不会收到此委托的截止预警提醒
                </Text>
              </View>
              <Switch
                value={formData.silentNotification}
                onValueChange={value => updateFormField('silentNotification', value)}
                color={colors.woodDark}
              />
            </View>
          </Card.Content>
        </Card>

        {/* 提交按钮 */}
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.submitButton}
          labelStyle={styles.submitButtonLabel}
          icon={isEditing ? 'content-save' : 'plus'}
        >
          {isEditing ? '保存修改' : '创建委托'}
        </Button>
      </ScrollView>

      {/* 日期选择器 */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.deadline}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* 时间选择器 */}
      {showTimePicker && (
        <DateTimePicker
          value={formData.deadline}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}

      {/* Emoji选择器模态框 */}
      <Portal>
        <Modal
          visible={showEmojiPicker}
          onDismiss={() => setShowEmojiPicker(false)}
          contentContainerStyle={styles.emojiModal}
        >
          <Text style={styles.emojiModalTitle}>选择图标</Text>
          <ScrollView style={styles.emojiGrid}>
            <View style={styles.emojiContainer}>
              {EMOJI_LIST.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiItem}
                  onPress={() => selectEmoji(emoji)}
                >
                  <Text style={styles.emojiItemText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Button
            mode="outlined"
            onPress={() => setShowEmojiPicker(false)}
            style={styles.emojiModalCloseButton}
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
  card: {
    backgroundColor: colors.parchment,
    marginBottom: spacing.md,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.parchment,
    marginBottom: spacing.sm,
  },
  inputOutline: {
    borderColor: colors.borderLight,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.parchmentDark,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dateTimeIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  quickExpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  quickExpLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  quickExpChip: {
    backgroundColor: colors.parchmentDark,
  },
  quickExpChipText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  emojiButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.parchmentDark,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emojiText: {
    fontSize: 24,
  },
  rewardNameInput: {
    flex: 1,
    marginBottom: 0,
  },
  rewardQuantityInput: {
    width: 70,
    marginBottom: 0,
  },
  addRewardButton: {
    borderColor: colors.woodDark,
    borderStyle: 'dashed',
    marginTop: spacing.sm,
  },
  addRewardButtonLabel: {
    color: colors.woodDark,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  switchDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: colors.woodDark,
    borderRadius: 8,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  submitButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: spacing.xs,
  },
  emojiModal: {
    backgroundColor: colors.parchment,
    margin: spacing.lg,
    borderRadius: 12,
    padding: spacing.md,
    maxHeight: '80%',
  },
  emojiModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emojiGrid: {
    maxHeight: 400,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  emojiItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.parchmentDark,
  },
  emojiItemText: {
    fontSize: 28,
  },
  emojiModalCloseButton: {
    marginTop: spacing.md,
    borderColor: colors.woodDark,
  },
});

export default CreateQuestScreen;