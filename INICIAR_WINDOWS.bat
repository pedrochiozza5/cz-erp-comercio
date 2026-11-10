@echo off
setlocal
cd /d "%~dp0"
echo =====================================================
echo   CZ ERP COMERCIO - V1 LOCAL
 echo =====================================================
where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo ERROR: Instala Node.js 22 actualizado antes de continuar.
  echo https://nodejs.org/
  pause
  exit /b 1
)
if not exist node_modules\ (
  echo Instalando dependencias por primera vez...
  call npm.cmd install
  if errorlevel 1 (
    echo ERROR: No se pudieron instalar las dependencias.
    pause
    exit /b 1
  )
)
echo.
echo Abri en tu navegador: http://127.0.0.1:5173/
echo Para detener el servidor presiona Ctrl+C.
call npm.cmd run dev
pause
