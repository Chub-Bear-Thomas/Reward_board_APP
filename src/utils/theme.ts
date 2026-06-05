import { DefaultTheme } from 'react-native-paper';

// 冒险者公会主题颜色
export const colors = {
  // 主色调
  woodDark: '#5a3e2b',      // 深木纹
  woodLight: '#8B6914',     // 浅木纹
  parchment: '#f5e6c8',     // 羊皮纸
  parchmentDark: '#e6d5b8', // 深羊皮纸

  // 强调色
  gold: '#b8860b',          // 暗金
  goldLight: '#d4a017',     // 亮金

  // 状态颜色
  success: '#2e7d32',       // 印章绿
  error: '#b71c1c',         // 印章红
  warning: '#f57c00',       // 警告橙
  info: '#1976d2',          // 信息蓝

  // 文本颜色
  textPrimary: '#2c1810',   // 深棕文本
  textSecondary: '#5a3e2b', // 次要文本
  textLight: '#f5e6c8',     // 浅色文本
  textOnDark: '#f5e6c8',    // 深色背景上的文本

  // 背景颜色
  background: '#f5e6c8',    // 主背景
  surface: '#ffffff',       // 表面
  card: '#f5e6c8',          // 卡片背景

  // 边框颜色
  border: '#d4a017',        // 金色边框
  borderLight: '#e6d5b8',   // 浅边框
};

// 字体配置
export const fonts = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700' as const,
  },
  light: {
    fontFamily: 'System',
    fontWeight: '300' as const,
  },
};

// 间距配置
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 圆角配置
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

// 阴影配置
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 6,
  },
};

// React Native Paper 主题
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.woodDark,
    accent: colors.gold,
    background: colors.background,
    surface: colors.surface,
    text: colors.textPrimary,
    error: colors.error,
    placeholder: colors.textSecondary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: fonts.regular,
    medium: fonts.medium,
    bold: fonts.bold,
    light: fonts.light,
  },
  roundness: borderRadius.md,
};

// 状态颜色映射
export const statusColors = {
  todo: colors.info,
  in_progress: colors.warning,
  done: colors.success,
  failed: colors.error,
};

// 状态文本映射
export const statusTexts = {
  todo: '待接取',
  in_progress: '进行中',
  done: '已完成',
  failed: '已失败',
};

// 等级称号颜色
export const levelColors = {
  1: '#8B4513',   // 见习 - 棕色
  2: '#A0522D',   // 新手 - 赭色
  3: '#CD853F',   // 初级 - 秘鲁色
  4: '#DAA520',   // 独当一面 - 金黄
  5: '#B8860B',   // 公会骨干 - 暗金
  6: '#FFD700',   // 精英 - 金色
  7: '#FFA500',   // 高阶 - 橙色
  8: '#FF8C00',   // 英雄 - 深橙
  9: '#FF4500',   // 传奇 - 橙红
  10: '#FF0000',  // 史诗Ⅰ - 红色
  11: '#DC143C',  // 史诗Ⅱ - 深红
  12: '#B22222',  // 史诗Ⅲ - 火砖红
  13: '#8B0000',  // 史诗Ⅳ - 暗红
  14: '#800000',  // 史诗Ⅴ - 栗色
  15: '#4B0082',  // 史诗Ⅵ - 靛蓝
  16: '#483D8B',  // 史诗Ⅶ - 暗蓝灰
  17: '#6A5ACD',  // 史诗Ⅷ - 板岩蓝
  18: '#7B68EE',  // 史诗Ⅸ - 中板岩蓝
  19: '#9370DB',  // 史诗Ⅹ - 中紫
  20: '#FFD700',  // MAX - 金色
};

// 获取等级颜色
export const getLevelColor = (level: number): string => {
  return levelColors[level as keyof typeof levelColors] || levelColors[20];
};

// 获取状态颜色
export const getStatusColor = (status: string): string => {
  return statusColors[status as keyof typeof statusColors] || colors.textSecondary;
};

// 获取状态文本
export const getStatusText = (status: string): string => {
  return statusTexts[status as keyof typeof statusTexts] || '未知';
};