《冒险者公会·每日悬赏任务栏》移动端离线应用需求规格说明书（v1.0）
1. 项目简介
1.1 产品定位
一款纯本地运行、无需网络权限的安卓游戏化每日待办工具。将用户每日未完成的事项设计为日式 RPG 冒险公会中的“悬赏委托”，通过创建任务、接受委托、完成确认、自定义奖励与经验升级闭环，以正向心理激励帮助用户管理日常事务。

1.2 核心故事
用户扮演一位“冒险者”，每日在公会布告栏上接取悬赏委托（待办事项）。委托有明确期限，逾期则失败。完成任务可获得自己设定的“奖励物品”（如一杯咖啡、一集动漫等）和“经验值”。经验值累积可提升冒险者等级，解锁更高称号，并逐步提高同时进行委托的数量上限。

1.3 设计原则
完全离线：所有资源（字体、图标、音效）打包在 APK 内，无任何网络请求。

正向激励：无惩罚性扣经验机制，失败仅标记不扣分。

沉浸式风格：视觉严格遵循做旧木板、羊皮纸、火漆印章等日式公会布告栏主题。

移动端优先：针对单手操作优化，使用手势（滑动完成/放弃）、触觉反馈等。

2. 技术实现约束（必读）
2.1 技术栈
框架：React Native + Expo (managed workflow 或 bare workflow，推荐 bare 以方便完全控制权限)

语言：TypeScript 严格模式

状态管理：Zustand 或 React Context（建议 Zustand 便于跨组件共享）

本地数据库：expo-sqlite (SQLite) 或 WatermelonDB（推荐 expo-sqlite，因项目数据规模极小，简单 ORM 即可）

本地通知：expo-notifications（仅使用本地通知触发器，不涉及 Firebase）

后台任务：expo-background-fetch + expo-task-manager 用于凌晨0点检测逾期任务；通知的闹钟触发依赖 expo-notifications 的 scheduleNotificationAsync 设定。

UI 组件：建议使用 react-native-paper 或 nativewind（Tailwind CSS for RN）；动画使用 react-native-reanimated + react-native-gesture-handler

图标：内置 emoji 数据集或 React Native 的 emoji-mart-native（完全本地）

音效：打包本地 .mp3/.ogg 文件，使用 expo-av 播放

打包：必须确保 AndroidManifest.xml 中 不声明 INTERNET 权限（<uses-permission android:name="android.permission.INTERNET" /> 需移除，或设置为 tools:node="remove"）

2.2 资源本地化要求
所有字体文件从 assets/fonts/ 加载，使用 expo-font 的 loadAsync 加载本地 require。

所有图片（背景纹理、印章等）使用 require 引入，不得远程 URI。

音效资源位于 assets/sounds/，用 Audio.Sound 播放。

emoji 列表使用一个本地 JSON 文件存储常用物品类 emoji 及其对应字符/图标，不要依赖网络 API。

3. 功能需求详细描述
3.1 冒险者身份模块
3.1.1 数据字段
昵称：string，用户可随时修改，默认“无名冒险者”

头像：预设头像 ID (number)，从内置的 8 张头像中选择，不支持自定义图片

当前经验值：number，初始0

等级：number，根据经验自动计算（见等级系统）

3.1.2 界面表现
顶栏或个人中心显示：圆形头像、昵称、等级称号（如“Lv.3 独当一面的冒险者”）

经验条：木纹填充槽样式，显示“当前经验/升级所需经验”

头像选择界面：网格展示 8 个手绘风格头像，点击即时更新

3.2 悬赏任务管理
3.2.1 任务数据模型
每个任务对象包含：

typescript
{
  id: string (uuid),
  title: string,
  description?: string,
  deadline: string (ISO 8601 格式，精确到分钟，如 "2026-06-05T23:59:00"),
  status: 'todo' | 'in_progress' | 'done' | 'failed',
  rewards: { name: string, emoji: string, quantity: number }[],
  exp: number,
  silentNotification: boolean, // 单任务静默开关
  createdAt: string,
  acceptedAt?: string,
  completedAt?: string
}
3.2.2 创建委托
表单字段：

标题（必填，最大40字符）

描述（选填，最大200字符）

截止日期与时刻（使用 DateTimePicker，精确到分钟；默认值：当前日期 23:59）

奖励物品（可选，最多3项）：

物品名称（自由文本，最大20字符）

图标（打开本地 emoji 选择器，选取一个 emoji）

数量（整数1~99）

经验值（必填，手动输入整数，范围1~9999；并提供快捷按钮：“微量50”、“适中200”、“丰厚500”）

静默通知开关（默认关闭，即默认会提醒）

创建后的默认状态：todo

校验：标题不能为空，经验值必须在范围内，期限不能是过去时间（允许创建过去时间但会直接标记为失败，最好阻止，弹出提示“截止时间已过，请重新设定”）

3.2.3 状态流转与操作
状态机：
todo → (点击“接受委托”) → in_progress
todo → (点击“完成”) → done (跳过进行中)
in_progress → (点击“完成”) → done
in_progress → (点击“放弃”) → failed (需二次确认)
todo 或 in_progress → (系统检测期限已过) → failed

操作按钮逻辑（详情页/卡片）：

todo 状态：显示【接受委托】【完成】

in_progress 状态：显示【完成委托】【放弃委托】

done 或 failed 状态：无操作按钮，仅查看详情

编辑任务：仅 todo 状态允许编辑。通过长按卡片或详情页编辑按钮触发编辑表单（与创建表单复用）。

3.2.4 逾期自动检测（离线后台任务）
触发时机：每日凌晨 0 点 0 分（手机本地时间）

实现：使用 expo-background-fetch 注册一个 Task，minimumInterval 设为 60*60*24 秒（每日一次），在回调中执行检测逻辑；同时配合应用前台时主动检测（以防后台任务未触发）。

检测逻辑：查询所有 status 为 todo 或 in_progress 的任务，比较 deadline 与当前时间，若 deadline < now，则将状态更新为 failed。

通知：每标记一个失败任务，发一条本地通知：“委托【任务标题】已逾期失败”。（可通过静默通知设置全局关闭）

3.3 每日未完成提醒
3.3.1 提醒类型
晨间集结提醒

用户可设置一个每日提醒时间（默认 08:00），以小时分钟形式存储。

触发时，检测今日所有处于 todo 状态的任务数量。若 >0，弹出通知。

通知文案模板：“早安冒险者！今日还有 ${n} 项悬赏等待接受，别让公会失望。”

使用 scheduleNotificationAsync 创建每日重复触发器（repeatType: 'daily' 或手动计算第二天同一时间再调度）。

截止预警

仅对 in_progress 状态的任务生效。

当任务被接受后，为其计算 deadline 前 30 分钟、15 分钟、5 分钟三个时间点，并调度对应本地通知。

通知文案：“【
任务标题】委托将在
任务标题】委托将在{分钟} 分钟后失效，请尽快完成！”

若任务在通知触发前已完成或放弃，调用 cancelScheduledNotificationAsync 取消对应的预警。

单任务在创建时若 silentNotification 为 true，则不调度任何截止预警（晨间通知不受此影响，仍会告知存在待接任务）。

3.3.2 通知管理
全局开关：在设置中提供一个总开关，关闭后所有通知不触发（取消所有已排程通知，并阻止新通知创建）。

单任务静默：创建/编辑任务时的“静默不提醒”开关。

3.3.3 通知点击行为
点击通知直接打开 App，并导航到对应任务详情页。

3.4 经验值与等级系统
3.4.1 经验获取
完成委托时，立即获得该委托设定的经验值，并显示获得动画。

没有其他获取途径，也没有付费加速。

3.4.2 等级计算
采用静态映射表，实现 1~20 级。

经验累计，不会因任何原因减少（包括任务失败）。

升级时弹出全屏特效：光芒扩散 + 号角音效，并展示新称号。

达到最高等级后经验继续累积但等级不增（可显示 MAX）。

映射表（部分示例，需在代码中完整定义至20级）：

text
等级1: 0
等级2: 150
等级3: 400
等级4: 800
等级5: 1500
等级6: 2500
等级7: 4000
等级8: 6000
等级9: 10000
等级10: 18000
等级11: 27000 (前一级*1.5)
... 以此类推至20级
称号映射：

text
1: 见习冒险者
2: 新手冒险者
3: 初级冒险者
4: 独当一面的冒险者
5: 公会骨干
6: 精英冒险者
7: 高阶冒险者
8: 英雄冒险者
9: 传奇冒险者
10~: 史诗冒险者Ⅰ、Ⅱ…… (用罗马数字)
3.4.3 等级增益
唯一增益：同时进行中的委托数量上限 = 3 + 等级数值。

当 in_progress 任务数达到上限时，其他待接任务的【接受委托】按钮变为灰色，并提示“并行委托已达上限 (当前上限${max})，请先完成或放弃部分任务”。

done / failed / todo 不计入此上限。

3.5 奖励物品处理（简化版）
奖励物品仅为成就展示，无独立背包系统。

完成任务后，在成功弹窗中列出获得的物品名称和图标动画。

不持久化存储物品集合（只要经验加了就行，物品只做心理激励）。如用户坚持保留记录，可将最近10条完成记录中的奖励显示在“冒险日志”中，但不做背包管理。本需求按极简处理：奖励仅展示，不存档。

3.6 历史记录与设置
3.6.1 冒险日志（简化）
以列表形式展示最近已完成和失败的任务，按时间倒序。

每个条目显示：任务标题、完成时间（或失败时间）、获得的经验值。

不实现复杂统计图表，维持轻量。

3.6.2 设置
通知总开关

晨间提醒时间设置

导出数据（生成 JSON 文件并调用系统分享/保存到本地）

导入数据（从文件选取器中读取 JSON，解析并替换数据库）

关于（版本号）

4. 界面与交互详细设计
4.1 主页面 – 悬赏公告栏
布局：顶部固定状态栏（可滚动隐藏），中间为任务卡片列表（使用 FlatList），底部固定导航栏。

顶部：

背景：深色木纹图片

左侧：公会徽章图案（本地 SVG）+ “冒险者公会·悬赏栏” 文字

右侧：迷你头像 + 昵称 + 等级称号 + 简短经验条（点击跳转个人中心）

卡片列表：

默认筛选“今日悬赏”：只显示 deadline 为今日日期（0:00~23:59）且状态为 todo 或 in_progress 的委托。已完成与失败的不显示在此视图。

任务卡片样式：羊皮纸背景（#f4e4c1 带轻微纹理），边缘内阴影模拟卷边，四角有小钉子装饰。

内容布局：

左上角：状态印记（todo 显示羽毛笔，in_progress 显示沙漏或动态倒计时）

中部：任务标题（大号衬线字体，黑色）

右下角：奖励 emoji 缩略排列

如果 deadline 是今天但非全部日期，显示“今天 18:00”字样；若非今日，显示完整日期。

倒计时文本组件（CountdownText）：实时更新，格式 剩余 3小时 24分，精确到分。当剩余<15分钟时文字变红脉冲。

筛选标签：位于列表上方或下方，提供“今日”、“全部”、“已完成”、“已失败”四个标签，点击切换数据源。

下拉刷新：手动触发逾期检测并刷新列表。

卡片手势：

向右滑动卡片：若状态为 in_progress，显示绿色背景和“完成”图标，触发完成操作。

向左滑动：若状态为 in_progress，显示红色背景和“放弃”图标，触发放弃（需确认对话框）。

长按卡片：若状态为 todo，进入编辑模式。

悬浮按钮：右下角“+”圆形按钮（木纹质感），点击跳转创建委托页。

4.2 任务详情页（全屏模态或页面）
顶部大号标题，背景羊皮纸。

信息区：

截止时间（带日历小图标）

经验值（水晶图标 + 数字）

奖励物品（列表：图标 + 名称×数量）

描述（如果有）

当前状态大印章（已完成显示绿色“COMPLETE”，失败显示红色“FAILED”，进行中显示脉动倒计时）

底部操作按钮区，根据状态显示可用按钮（见3.2.3）。

完成委托时：弹出庆祝动画（金币飞入，经验条增长），播放音效，然后显示获得的物品。

放弃委托：弹出确认对话框“确定要放弃此委托吗？放弃后将无法获得奖励。”

4.3 创建/编辑委托页
全屏页面，分段表单。

标题、描述输入框带有木质边框。

期限选择：日期选择器 + 时间选择器（Android 风格滚轮，不理想可降级为文本输入+验证，但推荐原生 DateTimePicker）。

奖励物品添加：

初始显示“添加奖励”按钮。

点击后新增一行：名称输入、打开 emoji 选择器（底部弹出网格），数量步进器。

最多3项，可删除。

经验值：数值输入框 + 三个快捷按钮。

静默通知开关 Switch 组件。

保存按钮：校验后存储，返回任务板并刷新。

4.4 个人中心
大头像、昵称（点击修改）

等级、当前经验条、下一级所需经验

称号展示

进行中委托数量 / 上限

设置入口：通知开关、晨间提醒时间、导出/导入

4.5 视觉风格全局定义
主色调：

木板深棕 #5a3e2b

羊皮纸 #f5e6c8

暗金 #b8860b

印章绿 #2e7d32

印章红 #b71c1c

字体：标题使用 "Cinzel" 或 "MedievalSharp"（英文可）结合中文字体（打包 Source Han Serif 或 Noto Serif CJK SC）。确保中英文混排时使用同一字体族回退。

背景纹理：木板和羊皮纸纹理使用 Image 组件加载本地 png，或使用 CSS/SVG 重复图案。建议用渐变+噪点模拟，减少图片体积。

动画：使用 react-native-reanimated 实现卡片弹性滚动、倒计时心跳、升级光效（使用 Lottie 或自定义动画）。

5. 数据持久化与离线策略
5.1 数据库表设计（SQLite）
使用 expo-sqlite 建表：

sql
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
  rewards TEXT NOT NULL DEFAULT '[]', -- JSON array of {name,emoji,quantity}
  exp INTEGER NOT NULL,
  silent_notification INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  accepted_at TEXT,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS notification_ids (
  quest_id TEXT,
  trigger_type TEXT, -- 'warning_30', 'warning_15', 'warning_5'
  notification_id TEXT,
  PRIMARY KEY (quest_id, trigger_type)
);
5.2 数据导入/导出
导出：读取 user 表和 quest 表，组合为 JSON 对象，使用 expo-file-system 和 expo-sharing 将 JSON 字符串保存为文件，供用户分享或存储。

导入：使用 expo-document-picker 选择 .json 文件，解析后先清空数据库再批量插入。

5.3 首次启动
检测数据库是否存在，不存在则建表并插入默认用户记录。

不显示引导页，直接进入空任务板。

6. 提醒与后台任务实现细节
6.1 使用 expo-notifications 设置本地通知
所有通知均使用 scheduleNotificationAsync，并存储返回的 notificationId 以便取消。

晨间通知：通过计算每日固定时间作为触发日期，重复调度（由于 Expo 的重复可能不可靠，可调度一次后，在通知点击或应用启动时重新调度第二天）。

截止预警：在任务变为 in_progress 时计算三个时间点，调度通知，并将 ID 存入 notification_ids 表；任务状态变更或删除时取消。

6.2 使用 expo-background-fetch 执行逾期检测
定义 Task：

ts
TaskManager.defineTask('DAILY_EXPIRY_CHECK', async () => {
  // 查询并更新逾期任务
  // 发送失败通知
  // 返回 BackgroundFetch.Result.NewData
});
注册：BackgroundFetch.registerTaskAsync('DAILY_EXPIRY_CHECK', { minimumInterval: 60*60*24, stopOnTerminate: false, startOnBoot: true })

此外，在 App.tsx 的 useEffect 中（前台启动时）主动执行一次检测，以确保万无一失。

6.3 权限
不需要 INTERNET 权限。

需要 RECEIVE_BOOT_COMPLETED（建议添加以支持重启后重新调度后台任务）、VIBRATE（触觉反馈）、POST_NOTIFICATIONS（Android 13+ 动态请求通知权限）。

7. 开发路线建议（供 Claude Code 分步生成）
项目初始化：配置 TypeScript，安装依赖，设置权限。

数据库层：定义数据模型，初始化数据库，编写 CRUD 方法。

状态管理：创建 Zustand store，提供用户、任务列表、筛选等全局状态。

冒险者身份 UI：个人中心页面，头像选择，昵称编辑。

任务卡片组件：样式、倒计时、状态印记、手势集成。

任务板页面：列表、筛选、下拉刷新、悬浮按钮。

创建/编辑委托页：表单、奖励添加器、emoji 选择器、日期时间选择。

任务详情页：操作按钮、状态流转逻辑、完成/放弃动画。

通知服务：晨间提醒、截止预警的调度与取消，后台逾期检测。

经验与等级系统：计算逻辑、升级动画、上限限制。

设置与数据导入导出。

整体主题打磨：字体、纹理、音效、动画细节。

8. 验收标准（简要）
APK 安装后完全断网，所有功能正常运行。

能创建任务、接受、完成、放弃，逾期自动标记失败。

晨间通知和截止预警能准确触发（修改系统时间测试）。

经验值计算正确，等级称号准确，并行任务上限有效。

导出/导入后数据一致。

界面风格符合公会布告栏主题，无明显违和。