@echo off
setlocal
cd /d "%~dp0"
set GIT_EXE="C:\Users\Acer\.gemini\antigravity\scratch\bin\git\cmd\git.exe"

echo ========================================================
echo  OPIVAMP - Push to GitHub
echo  Target: https://github.com/Opivamp/opivamp.git
echo ========================================================
echo.

%GIT_EXE% remote remove origin 2>nul
%GIT_EXE% remote add origin https://github.com/Opivamp/opivamp.git
%GIT_EXE% branch -M main

echo Options:
echo  1. Push normally (GitHub may prompt you for username and password/token)
echo  2. Push with a GitHub Personal Access Token (Instant)
echo.
set /p CHOICE="Choose option (1 or 2, default is 1): "

if "%CHOICE%"=="2" (
    echo.
    set /p GH_TOKEN="Paste your GitHub Personal Access Token: "
    if not "%GH_TOKEN%"=="" (
        echo.
        echo Pushing using Personal Access Token...
        %GIT_EXE% push -u https://%GH_TOKEN%@github.com/Opivamp/opivamp.git main
        goto end
    )
)

echo.
echo Pushing branch 'main' to https://github.com/Opivamp/opivamp.git...
echo NOTE: When prompted for password, GitHub requires a Personal Access Token (PAT).
echo       If Git opens a browser window or login prompt, complete the sign-in there.
echo.
%GIT_EXE% push -u origin main

:end
if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo  SUCCESS! Your project has been pushed to GitHub.
    echo  Repository: https://github.com/Opivamp/opivamp
    echo ========================================================
) else (
    echo.
    echo [ERROR] Push did not complete.
    echo If GitHub rejected your password, create a Personal Access Token:
    echo 1. Go to: https://github.com/settings/tokens
    echo 2. Click "Generate new token (classic)" -> check "repo" scope.
    echo 3. Copy the token and paste it as your password.
)

echo.
pause
