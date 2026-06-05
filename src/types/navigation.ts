import { NativeStackScreenProps } from '@react-navigation/native-stack';

// 根导航栈参数列表
export type RootStackParamList = {
  Home: undefined;
  QuestDetail: { questId: string };
  CreateQuest: { questId?: string }; // 可选，用于编辑模式
  Profile: undefined;
  Settings: undefined;
};

// 页面属性类型
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type QuestDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'QuestDetail'>;
export type CreateQuestScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateQuest'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;