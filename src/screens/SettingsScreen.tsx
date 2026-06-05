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
  Card,
  Button,
  IconButton,
  Divider,
  Switch,
  List,
  Modal,
  Portal,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useStore } from '../stores/useStore';
import { SettingsScreenProps } from '../types/navigation';
import { colors, spacing, shadows } from '../utils/theme';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    adventurer,
    updateAdventurer,
    exportData,
    importData,
    loadAdventurer,
  } = useStore();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadAdventurer();
  }, []);

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

  const handleMorningReminderTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      await updateAdventurer({ morningReminderTime: timeString });
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);

      const data = await exportData();
      const jsonString = JSON.stringify(data, null, 2);

      const fileName = `adventurer_guild_backup_${new Date().toISOString().slice(0, 10)}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: '导出冒险者公会数据',
        });
      } else {
        Alert.alert('导出成功', `数据已保存到：${filePath}`);
      }
    } catch (error) {
      console.error('导出数据失败:', error);
      Alert.alert('导出失败', '导出数据时发生错误，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      setIsImporting(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const jsonString = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const data = JSON.parse(jsonString);

      // 验证数据结构
      if (!data.user || !data.quests || !Array.isArray(data.quests)) {
        Alert.alert('导入失败', '文件格式不正确，请选择有效的备份文件');
        return;
      }

      Alert.alert(
        '确认导入',
        '导入将覆盖当前所有数据，确定要继续吗？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '确定导入',
            style: 'destructive',
            onPress: async () => {
              try {
                await importData(data);
                Alert.alert('导入成功', '数据已成功导入');
              } catch (error) {
                console.error('导入数据失败:', error);
                Alert.alert('导入失败', '导入数据时发生错误，请重试');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('导入数据失败:', error);
      Alert.alert('导入失败', '读取文件时发生错误，请重试');
    } finally {
      setIsImporting(false);
    }
  };

  const parseTimeString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
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
        <Text style={styles.headerTitle}>设置</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* 通知设置 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>通知设置</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🔔</Text>
                <View>
                  <Text style={styles.settingLabel}>通知总开关</Text>
                  <Text style={styles.settingDescription}>
                    关闭后所有通知不触发
                  </Text>
                </View>
              </View>
              <Switch
                value={adventurer?.notificationEnabled ?? true}
                onValueChange={handleNotificationToggle}
                color={colors.woodDark}
              />
            </View>

            <Divider style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>⏰</Text>
                <View>
                  <Text style={styles.settingLabel}>晨间提醒时间</Text>
                  <Text style={styles.settingDescription}>
                    每日提醒您接取委托
                  </Text>
                </View>
              </View>
              <Text style={styles.settingValue}>
                {adventurer?.morningReminderTime || '08:00'}
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* 数据管理 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>数据管理</Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleExportData}
              disabled={isExporting}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>📤</Text>
                <View>
                  <Text style={styles.settingLabel}>导出数据</Text>
                  <Text style={styles.settingDescription}>
                    {isExporting ? '正在导出...' : '导出所有数据为JSON文件'}
                  </Text>
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <Divider style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleImportData}
              disabled={isImporting}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>📥</Text>
                <View>
                  <Text style={styles.settingLabel}>导入数据</Text>
                  <Text style={styles.settingDescription}>
                    {isImporting ? '正在导入...' : '从JSON文件恢复数据'}
                  </Text>
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* 应用信息 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>关于</Text>

            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>应用名称</Text>
              <Text style={styles.aboutValue}>冒险者公会·每日悬赏任务栏</Text>
            </View>

            <Divider style={styles.settingDivider} />

            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>版本号</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>

            <Divider style={styles.settingDivider} />

            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>技术栈</Text>
              <Text style={styles.aboutValue}>React Native + Expo</Text>
            </View>

            <Divider style={styles.settingDivider} />

            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>数据存储</Text>
              <Text style={styles.aboutValue}>本地SQLite数据库</Text>
            </View>

            <Divider style={styles.settingDivider} />

            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>网络权限</Text>
              <Text style={styles.aboutValue}>无（完全离线）</Text>
            </View>
          </Card.Content>
        </Card>

        {/* 开发者信息 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>开发者信息</Text>
            <Text style={styles.developerText}>
              本应用为纯本地运行的离线应用，所有数据均存储在您的设备上。
              请定期备份重要数据，以防数据丢失。
            </Text>
            <Text style={styles.developerText}>
              如有任何问题或建议，请通过应用商店反馈。
            </Text>
          </Card.Content>
        </Card>

        {/* 版权信息 */}
        <Text style={styles.copyright}>
          © 2026 冒险者公会. All rights reserved.
        </Text>
      </ScrollView>

      {/* 时间选择器 */}
      {showTimePicker && (
        <DateTimePicker
          value={parseTimeString(adventurer?.morningReminderTime || '08:00')}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleMorningReminderTimeChange}
        />
      )}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
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
    lineHeight: 18,
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
    marginVertical: spacing.xs,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  aboutLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  aboutValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  developerText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  copyright: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    opacity: 0.7,
  },
});

export default SettingsScreen;