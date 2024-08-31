@echo off
chcp 65001
:X
node index.js
ping 127.0.0.1 -n 15 > nul
goto X