@echo off
echo Starting the dashboard using a simple HTTP server...
echo.

cd dashboard
echo Access the dashboard at: http://localhost:8000
echo Press Ctrl+C to stop the server when done.
echo.
start http://localhost:8000
python -m http.server

echo.
echo Server stopped.
pause
