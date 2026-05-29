@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title StelLoot - iniciar aplicacao

set "ROOT=%CD%"
set "API_PORT=8080"
set "WEB_PORT=5173"
set "LAN_IP="
set "STELLOOT_JWT_SECRET=stelloot-local-dev-secret-change-me"

echo.
echo ==============================================
echo   StelLoot - iniciar aplicacao completa
echo ==============================================
echo.

call :find_ip
call :find_java
if errorlevel 1 goto :failed

call :find_node
if errorlevel 1 goto :failed

call :check_port %API_PORT%
if errorlevel 1 (
  echo [ERRO] A porta %API_PORT% ja esta em uso.
  echo Feche o backend aberto e execute este arquivo novamente.
  goto :failed
)

call :check_port %WEB_PORT%
if errorlevel 1 (
  echo [ERRO] A porta %WEB_PORT% ja esta em uso.
  echo Feche o site aberto e execute este arquivo novamente.
  goto :failed
)

if not exist "%ROOT%\web\node_modules\.bin\vite.cmd" (
  echo Instalando dependencias do site...
  pushd "%ROOT%\web"
  call npm.cmd install
  if errorlevel 1 (
    popd
    echo [ERRO] Nao foi possivel instalar as dependencias do site.
    goto :failed
  )
  popd
)

if not exist "%ROOT%\mobile\node_modules\.bin\expo.cmd" (
  echo Instalando dependencias do mobile...
  pushd "%ROOT%\mobile"
  call npm.cmd install
  if errorlevel 1 (
    popd
    echo [ERRO] Nao foi possivel instalar as dependencias do mobile.
    goto :failed
  )
  popd
)

set "VITE_API_URL=http://%LAN_IP%:%API_PORT%/api"
set "EXPO_PUBLIC_API_URL=http://%LAN_IP%:%API_PORT%/api"

echo Iniciando backend Spring Boot...
start "StelLoot Backend - NAO FECHE" /D "%ROOT%\backend" cmd /k "call mvnw.cmd spring-boot:run"

echo Aguardando backend na porta %API_PORT%...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$end=(Get-Date).AddSeconds(90); while ((Get-Date) -lt $end) { try { $tcp=[System.Net.Sockets.TcpClient]::new('127.0.0.1', %API_PORT%); $tcp.Dispose(); exit 0 } catch { Start-Sleep -Seconds 1 } }; exit 1"
if errorlevel 1 (
  echo [ERRO] O backend nao iniciou em ate 90 segundos.
  echo Veja a janela "StelLoot Backend - NAO FECHE".
  goto :failed
)

echo Iniciando site web...
start "StelLoot Web - NAO FECHE" /D "%ROOT%\web" cmd /k "npm.cmd run dev -- --host 0.0.0.0 --port %WEB_PORT%"

echo Iniciando app mobile Expo...
start "StelLoot Mobile Expo - NAO FECHE" /D "%ROOT%\mobile" cmd /k "npx.cmd expo start --lan"

echo Aguardando site na porta %WEB_PORT%...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$end=(Get-Date).AddSeconds(45); while ((Get-Date) -lt $end) { try { $tcp=[System.Net.Sockets.TcpClient]::new('127.0.0.1', %WEB_PORT%); $tcp.Dispose(); exit 0 } catch { Start-Sleep -Seconds 1 } }; exit 1"
if errorlevel 1 (
  echo [AVISO] O site ainda nao respondeu na porta %WEB_PORT%.
  echo Veja a janela "StelLoot Web - NAO FECHE".
) else (
  start "" "http://localhost:%WEB_PORT%"
)

echo.
echo ==============================================
echo   StelLoot iniciado
echo ==============================================
echo.
echo Site no computador:
echo   http://localhost:%WEB_PORT%
echo.
echo API:
echo   http://localhost:%API_PORT%/api
echo.
echo Mobile:
echo   Leia o QR Code na janela "StelLoot Mobile Expo - NAO FECHE"
echo   URL usada pelo app: %EXPO_PUBLIC_API_URL%
echo.
echo Para encerrar, feche as tres janelas:
echo   StelLoot Backend - NAO FECHE
echo   StelLoot Web - NAO FECHE
echo   StelLoot Mobile Expo - NAO FECHE
echo.
pause
exit /b 0

:find_ip
for /f "tokens=4" %%I in ('route print -4 ^| findstr /R /C:"^[ ]*0\.0\.0\.0[ ]*0\.0\.0\.0"') do if not defined LAN_IP set "LAN_IP=%%I"
if not defined LAN_IP set "LAN_IP=localhost"
echo Endereco de rede detectado: %LAN_IP%
exit /b 0

:find_java
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" goto :java_ok
for /d %%J in ("C:\Program Files\Java\jdk-21*") do set "JAVA_HOME=%%~fJ"
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" goto :java_ok
echo [ERRO] Java 21 nao encontrado.
echo Instale o JDK 21 ou configure JAVA_HOME.
exit /b 1

:java_ok
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo Java detectado: %JAVA_HOME%
exit /b 0

:find_node
where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js/npm nao encontrado.
  echo Instale o Node.js LTS e execute novamente.
  exit /b 1
)
echo Node/npm detectado.
exit /b 0

:check_port
netstat -ano -p TCP | findstr /R /C:":%1 .*LISTENING" >nul
if not errorlevel 1 exit /b 1
exit /b 0

:failed
echo.
echo Nao foi possivel iniciar tudo automaticamente.
pause
exit /b 1
