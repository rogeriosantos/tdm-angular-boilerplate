@echo off
echo ========================================
echo    Angular Project - IIS Deployment
echo ========================================
echo.

REM Build the project for production
echo Building Angular project for production...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo.

REM Copy web.config to dist folder (in case it was overwritten)
echo Copying web.config for IIS...
copy "web.config.template" "dist\angular-project\browser\web.config" /Y > nul
if exist "dist\angular-project\browser\web.config" (
    echo web.config copied successfully!
) else (
    echo Warning: web.config not found in template. Creating basic one...
    echo ^<?xml version="1.0" encoding="utf-8"?^> > "dist\angular-project\browser\web.config"
    echo ^<configuration^> >> "dist\angular-project\browser\web.config"
    echo   ^<system.webServer^> >> "dist\angular-project\browser\web.config"
    echo     ^<rewrite^> >> "dist\angular-project\browser\web.config"
    echo       ^<rules^> >> "dist\angular-project\browser\web.config"
    echo         ^<rule name="Angular Routes" stopProcessing="true"^> >> "dist\angular-project\browser\web.config"
    echo           ^<match url=".*" /^> >> "dist\angular-project\browser\web.config"
    echo           ^<conditions logicalGrouping="MatchAll"^> >> "dist\angular-project\browser\web.config"
    echo             ^<add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" /^> >> "dist\angular-project\browser\web.config"
    echo             ^<add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" /^> >> "dist\angular-project\browser\web.config"
    echo           ^</conditions^> >> "dist\angular-project\browser\web.config"
    echo           ^<action type="Rewrite" url="./index.html" /^> >> "dist\angular-project\browser\web.config"
    echo         ^</rule^> >> "dist\angular-project\browser\web.config"
    echo       ^</rules^> >> "dist\angular-project\browser\web.config"
    echo     ^</rewrite^> >> "dist\angular-project\browser\web.config"
    echo   ^</system.webServer^> >> "dist\angular-project\browser\web.config"
    echo ^</configuration^> >> "dist\angular-project\browser\web.config"
)

echo.
echo ========================================
echo    Deployment files ready!
echo ========================================
echo.
echo The deployment files are located in:
echo   %CD%\dist\angular-project\browser\
echo.
echo To deploy to IIS:
echo 1. Copy all files from the 'browser' folder to your IIS website directory
echo 2. Make sure the IIS application pool is set to "No Managed Code"
echo 3. Ensure URL Rewrite module is installed on IIS
echo 4. Restart the application pool
echo.
echo Files to copy:
dir "dist\angular-project\browser\" /B
echo.
pause
