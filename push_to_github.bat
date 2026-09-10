@echo off
setlocal
cd /d "%~dp0"
set GIT_EXE="C:\Users\Acer\.gemini\antigravity\scratch\bin\git\cmd\git.exe"

echo ========================================================
echo  OPIVAMP - Push to GitHub
echo ========================================================
echo.

if "%~1"=="" (
    set /p REPO_URL="Enter your GitHub repository URL (e.g. https://github.com/username/repo.git): "
) else (
    set REPO_URL=%~1
)

if "%REPO_URL%"=="" (
    echo [ERROR] No repository URL provided. Aborting.
    pause
    exit /b 1
)

echo.
echo Setting remote origin to: %REPO_URL%
%GIT_EXE% remote remove origin 2>nul
%GIT_EXE% remote add origin %REPO_URL%
%GIT_EXE% branch -M main

echo.
echo Pushing branch 'main' to GitHub...
%GIT_EXE% push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo  SUCCESS! Your project has been pushed to GitHub.
    echo ========================================================
) else (
    echo.
    echo [NOTE] If authentication failed, ensure you use a GitHub Personal Access Token (PAT)
    echo        as your password, or configure your GitHub SSH key.
)

echo.
pause
