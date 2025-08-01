@echo off
echo =====================================================
echo   Installing Required Python Packages
echo =====================================================
echo.

echo Installing required packages from requirements.txt...
pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo Error installing packages! Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo Packages installed successfully!
echo.
echo You can now run the dashboard by typing: .\run_dashboard.bat
echo.
pause
