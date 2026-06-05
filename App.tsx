import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';

import { useStore } from './src/stores/useStore';
import { RootStackParamList } from './src/types/navigation';

// 导入页面
import HomeScreen from './src/screens/HomeScreen';
import QuestDetailScreen from './src/screens/QuestDetailScreen';
import CreateQuestScreen from './src/screens/CreateQuestScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// 导入主题
import { theme } from './src/utils/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { initializeApp, checkExpiredQuests } = useStore();

  useEffect(() => {
    // 初始化应用
    initializeApp();

    // 设置通知响应处理
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.questId) {
        // 导航到任务详情页
        // 这里需要通过导航服务处理
        console.log('点击通知，任务ID:', data.questId);
      }
    });

    return () => subscription.remove();
  }, []);

  // 应用进入前台时检查逾期任务
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('收到通知:', notification);
    });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen
                name="QuestDetail"
                component={QuestDetailScreen}
                options={{
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="CreateQuest"
                component={CreateQuestScreen}
                options={{
                  presentation: 'modal',
                }}
              />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="light" />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}