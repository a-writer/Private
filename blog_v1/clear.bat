@echo off
rem 清理wp-content和wp-includes中的不常见前端文件和空目录
cd wp-content
rd /s /q wp-cloudflare-super-page-cache
call :delx
cd ..
cd wp-includes
call :delx
cd ..
pause
exit
rem 删除
:delx
del /f /s /q *.php
del /f /s /q *.crt
del /f /s /q *.po
del /f /s /q *.mo
del /f /s /q *.log
del /f /s /q *.orig
del /f /s /q *.pot
del /f /s /q *.pot
del /f /s /q *.json
del /f /s /q *Readme*.*
del /f /s /q *readme*.*
del /f /s /q *License*.*
del /f /s /q *license*.*
del /f /s /q nginx.conf
rem 清理空白子目录
for /f "tokens=*" %%a in ('dir /ad /b /s ^| sort /r') do rd "%%a" /q 2>nul
goto:eof
