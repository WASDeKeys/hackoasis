@echo off
echo. Starting Simple Backend Server...
echo.
node simple_backend.js

echo. Starting React Frontend Server...
start cmd /k "cd frontend && npm start"
pause
