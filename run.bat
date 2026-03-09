@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0"
if /i "%ROOT:~0,4%"=="\\?\" set "ROOT=%ROOT:~4%"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

set "LOCAL_NODE_DIR=%ROOT%\.tools\node-lts"
if exist "%LOCAL_NODE_DIR%\node.exe" set "PATH=%LOCAL_NODE_DIR%;%PATH%"

cd /d "%ROOT%"
set "API_DIR=%ROOT%\apps\api"
set "WEB_DIR=%ROOT%\apps\web"
set "PRISMA_CMD=%API_DIR%\node_modules\.bin\prisma.cmd"
set "PUBLIC_URL=http://localhost:5173"
set "ADMIN_URL=http://localhost:5173/admin/login"
set "API_HEALTH_URL=http://localhost:3000/api/health"
set "ADMIN_EMAIL=admin@koni-kabmalang.or.id"
set "ADMIN_PASSWORD=admin123"
set "NODE_SOURCE=system"
if exist "%LOCAL_NODE_DIR%\node.exe" set "NODE_SOURCE=local .tools\node-lts"

for /f %%v in ('node -v 2^>nul') do set "NODE_VERSION=%%v"
set "NODE_MAJOR="
if defined NODE_VERSION (
  set "NODE_MAJOR=%NODE_VERSION:v=%"
  for /f "tokens=1 delims=." %%m in ("%NODE_MAJOR%") do set "NODE_MAJOR=%%m"
)

title KONI-WEB Runner

:menu
cls
echo ===============================================
echo              KONI-WEB ROOT RUNNER
echo ===============================================
echo Root       : %ROOT%
if defined NODE_VERSION (
  echo Node       : %NODE_VERSION%
) else (
  echo Node       : not found
)
echo Node Source: %NODE_SOURCE%
echo Public URL : %PUBLIC_URL%
echo Admin URL  : %ADMIN_URL%
echo API Health : %API_HEALTH_URL%
if defined NODE_MAJOR if %NODE_MAJOR% GEQ 23 echo WARNING    : Node %NODE_VERSION% terlalu baru untuk Prisma 6.2.1. Gunakan Node 20/22 LTS.
echo.
echo Bootstrap
echo [1] Bootstrap from zero ^(install + prisma generate + migrate + seed + lint^)
echo [2] Bootstrap then start API + Web
echo.
echo Daily run
echo [3] Start API
echo [4] Start Web
echo [5] Start API + Web
echo [6] Open public + admin URLs
echo.
echo Database / verify
echo [7] Prisma generate ^(local workspace binary^)
echo [8] Prisma migrate deploy ^(local workspace binary^)
echo [9] DB seed
echo [10] API verification ^(requires API running on :3000^)
echo [11] Lint API + Web
echo.
echo Utility
echo [12] Check ports 3000 / 5173
echo [13] Kill ports 3000 / 5173
echo [14] Show admin credentials
echo [15] Exit
echo.
set /p choice=Choose [1-15]: 

if "%choice%"=="1" goto bootstrap_only
if "%choice%"=="2" goto bootstrap_and_start
if "%choice%"=="3" goto start_api
if "%choice%"=="4" goto start_web
if "%choice%"=="5" goto start_both
if "%choice%"=="6" goto open_urls
if "%choice%"=="7" goto prisma_generate
if "%choice%"=="8" goto prisma_migrate
if "%choice%"=="9" goto db_seed
if "%choice%"=="10" goto test_api
if "%choice%"=="11" goto lint_apps
if "%choice%"=="12" goto check_ports
if "%choice%"=="13" goto kill_ports
if "%choice%"=="14" goto show_credentials
if "%choice%"=="15" goto end

echo Invalid choice.
pause
goto menu

:bootstrap_only
call :run_bootstrap
goto menu

:bootstrap_and_start
call :run_bootstrap
if errorlevel 1 goto menu
call :start_api_window
timeout /t 2 /nobreak >nul
call :start_web_window
echo.
echo Bootstrap selesai. API dan Web dijalankan di terminal terpisah.
pause
goto menu

:start_api
call :start_api_window
echo.
echo API dijalankan di terminal baru.
pause
goto menu

:start_web
call :start_web_window
echo.
echo Web dijalankan di terminal baru.
pause
goto menu

:start_both
call :start_api_window
timeout /t 2 /nobreak >nul
call :start_web_window
echo.
echo API dan Web dijalankan di terminal terpisah.
pause
goto menu

:open_urls
echo Membuka public site, admin CMS, dan API health...
start "" "%PUBLIC_URL%"
start "" "%ADMIN_URL%"
start "" "%API_HEALTH_URL%"
pause
goto menu

:prisma_generate
call :run_prisma_generate
pause
goto menu

:prisma_migrate
call :run_prisma_migrate
pause
goto menu

:db_seed
call :run_db_seed
pause
goto menu

:test_api
call :ensure_api_running
if errorlevel 1 (
  echo.
  echo Jalankan API dulu ^([3] atau [5]^), lalu ulangi verifikasi.
  pause
  goto menu
)
echo Menjalankan verifikasi API...
call :run_from_root npm run test:api
pause
goto menu

:lint_apps
echo Menjalankan lint API...
call :run_from_root npm run lint -w @koni/api
echo.
echo Menjalankan lint Web...
call :run_from_root npm run lint -w @koni/web
pause
goto menu

:check_ports
echo Checking port 3000...
netstat -ano | findstr :3000
echo.
echo Checking port 5173...
netstat -ano | findstr :5173
pause
goto menu

:kill_ports
call :kill_port 3000
call :kill_port 5173
echo Done.
pause
goto menu

:show_credentials
echo ===============================================
echo Admin CMS Login
echo ===============================================
echo URL      : %ADMIN_URL%
echo Email    : %ADMIN_EMAIL%
echo Password : %ADMIN_PASSWORD%
echo.
echo Gunakan akun ini hanya untuk local/dev seed.
pause
goto menu

:run_bootstrap
echo ===============================================
echo Bootstrap KONI-WEB dimulai
echo ===============================================
echo [1/5] npm install
call :run_from_root npm install
if errorlevel 1 goto bootstrap_failed
echo.
echo [2/5] prisma generate
call :run_prisma_generate
if errorlevel 1 goto bootstrap_failed
echo.
echo [3/5] prisma migrate deploy
call :run_prisma_migrate
if errorlevel 1 goto bootstrap_failed
echo.
echo [4/5] db seed
call :run_db_seed
if errorlevel 1 goto bootstrap_failed
echo.
echo [5/5] lint API + Web
call :run_from_root npm run lint -w @koni/api
if errorlevel 1 goto bootstrap_failed
call :run_from_root npm run lint -w @koni/web
if errorlevel 1 goto bootstrap_failed
echo.
echo Bootstrap selesai.
exit /b 0

:bootstrap_failed
echo.
echo Bootstrap berhenti karena ada command yang gagal.
echo Pastikan local Node 22 aktif, dependency terpasang, dan Prisma binary workspace tersedia.
pause
exit /b 1

:run_prisma_generate
echo Menjalankan prisma generate dari apps\api...
if not exist "%PRISMA_CMD%" (
  echo Prisma CLI lokal belum ditemukan di %PRISMA_CMD%
  echo Jalankan npm install terlebih dahulu.
  exit /b 1
)
pushd "%API_DIR%"
call "%PRISMA_CMD%" generate
set "EXIT_CODE=%ERRORLEVEL%"
popd
if not "%EXIT_CODE%"=="0" (
  echo.
  echo prisma generate gagal.
  echo Jika error EPERM muncul di Codex sandbox, coba ulangi command yang sama di luar sandbox dengan local Node 22.
)
exit /b %EXIT_CODE%

:run_prisma_migrate
echo Menjalankan prisma migrate deploy dari apps\api...
if not exist "%PRISMA_CMD%" (
  echo Prisma CLI lokal belum ditemukan di %PRISMA_CMD%
  echo Jalankan npm install terlebih dahulu.
  exit /b 1
)
pushd "%API_DIR%"
call "%PRISMA_CMD%" migrate deploy
set "EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %EXIT_CODE%

:run_db_seed
echo Menjalankan db seed dari root workspace...
call :run_from_root npm run db:seed
exit /b %ERRORLEVEL%

:run_from_root
pushd "%ROOT%"
call %*
set "EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %EXIT_CODE%

:ensure_api_running
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing '%API_HEALTH_URL%' -TimeoutSec 3; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
exit /b %ERRORLEVEL%

:kill_port
set "TARGET_PORT=%~1"
echo Trying to kill process on port %TARGET_PORT%...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :%TARGET_PORT% ^| findstr LISTENING') do (
  echo taskkill /F /PID %%p
  taskkill /F /PID %%p >nul 2>&1
)
exit /b 0

:start_api_window
start "KONI API" cmd /k "cd /d "%ROOT%" && npm run dev:api"
exit /b 0

:start_web_window
start "KONI WEB" cmd /k "cd /d "%ROOT%" && npm run dev:web"
exit /b 0

:end
echo Bye.
endlocal
exit /b 0
