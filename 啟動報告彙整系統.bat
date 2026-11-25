@echo off
chcp 65001 >nul
title 班級報告彙整系統 (Classroom Presentation Hub)
cd /d "%~dp0"

echo ========================================================
echo   🎓 正在啟動「班級報告彙整中心」伺服器...
echo   啟動後將自動為您開啟瀏覽器畫面 (http://localhost:3000)
echo   請勿關閉此黑色視窗，報告結束後再關閉即可。
echo ========================================================
echo.

start "" "http://localhost:3000"
node server.js

pause
