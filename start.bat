@echo off
echo ========================================
echo 冒险者公会·每日悬赏任务栏 - 启动脚本
echo ========================================
echo.

echo [1/4] 检查Node.js安装...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：未找到Node.js，请先安装Node.js 18+
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js 已安装

echo.
echo [2/4] 检查Expo CLI安装...
expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 正在安装Expo CLI...
    npm install -g expo-cli
)
echo Expo CLI 已安装

echo.
echo [3/4] 安装项目依赖...
echo 这可能需要几分钟时间...
npm install
if %errorlevel% neq 0 (
    echo 错误：依赖安装失败
    pause
    exit /b 1
)
echo 依赖安装完成

echo.
echo [4/4] 启动开发服务器...
echo.
echo 启动后，请使用以下方式运行应用：
echo   - Android：按 a 键
echo   - iOS：按 i 键
echo   - Web：按 w 键
echo.
echo 或者扫描二维码使用Expo Go应用运行
echo.
pause

npm start