@echo off
echo Starting OPIVAMP local server...
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
