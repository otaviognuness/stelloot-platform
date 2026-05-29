@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title StelLoot - Iniciar apresentacao

set "ROOT=%CD%"
set "API_PORT=8080"
set "WEB_PORT=5173"
set "LAN_IP="

echo.
echo ==============================================
echo   StelLoot - modo apresentacao em rede local
echo ==============================================
echo.

call :find_ip
call :find_java
if errorlevel 1 goto :failed

call :check_port %API_PORT%
if errorlevel 1 (
  echo [ERRO] A porta %API_PORT% ja esta em uso.
  echo Feche o backend que estiver aberto e execute este arquivo novamente.
  goto :failed
)

call :check_port %WEB_PORT%
if errorlevel 1 (
  echo [ERRO] A porta %WEB_PORT% ja esta em uso.
  echo Feche o front-end que estiver aberto e execute este arquivo novamente.
  goto :failed
)

if not exist "%ROOT%\web\node_modules\.bin\vite.cmd" (
  echo Instalando dependencias do site pela primeira vez...
  pushd "%ROOT%\web"
  call npm.cmd install
  if errorlevel 1 (
    popd
    echo [ERRO] Nao foi possivel instalar as dependencias do front-end.
    goto :failed
  )
  popd
)

echo Iniciando backend...
start "StelLoot Backend - NAO FECHE" /D "%ROOT%\backend" cmd /k "set ""JAVA_HOME=%JAVA_HOME%"" && set ""PATH=%JAVA_HOME%\bin;%%PATH%%"" && .\mvnw.cmd spring-boot:run"

echo Aguardando a API ficar disponivel...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$end=(Get-Date).AddSeconds(75); while ((Get-Date) -lt $end) { try { $tcp=[System.Net.Sockets.TcpClient]::new('127.0.0.1', %API_PORT%); $tcp.Dispose(); exit 0 } catch { Start-Sleep -Seconds 1 } }; exit 1"
if errorlevel 1 (
  echo [ERRO] O backend nao iniciou em ate 75 segundos.
  echo Verifique a janela "StelLoot Backend - NAO FECHE".
  goto :failed
)

set "VITE_API_URL=http://%LAN_IP%:%API_PORT%/api"
echo Iniciando site web...
start "StelLoot Site - NAO FECHE" /D "%ROOT%\web" cmd /k "set ""VITE_API_URL=%VITE_API_URL%"" && npm.cmd run dev -- --host 0.0.0.0 --port %WEB_PORT%"

echo Aguardando o site ficar disponivel...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$end=(Get-Date).AddSeconds(45); while ((Get-Date) -lt $end) { try { $tcp=[System.Net.Sockets.TcpClient]::new('127.0.0.1', %WEB_PORT%); $tcp.Dispose(); exit 0 } catch { Start-Sleep -Seconds 1 } }; exit 1"
if errorlevel 1 (
  echo [ERRO] O site nao iniciou em ate 45 segundos.
  echo Verifique a janela "StelLoot Site - NAO FECHE".
  goto :failed
)

set "SHARE_URL=http://%LAN_IP%:%WEB_PORT%"
echo.
echo ==============================================
echo   SITE PRONTO
echo ==============================================
echo.
echo No seu computador e nos celulares da mesma rede, acesse:
echo.
echo   %SHARE_URL%
echo.
echo O navegador sera aberto agora no seu computador.
echo Se o Windows pedir permissao de firewall, permita em rede privada.
echo.
echo Para desligar depois, feche as duas janelas:
echo   StelLoot Backend - NAO FECHE
echo   StelLoot Site - NAO FECHE
echo.
start "" "%SHARE_URL%"
pause
exit /b 0

:find_ip
for /f "tokens=4" %%I in ('route print -4 ^| findstr /R /C:"^[ ]*0\.0\.0\.0[ ]*0\.0\.0\.0"') do if not defined LAN_IP set "LAN_IP=%%I"
if not defined LAN_IP set "LAN_IP=localhost"
echo Endereco detectado: %LAN_IP%
exit /b 0

:find_java
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" goto :java_ok
for /d %%J in ("C:\Program Files\Java\jdk-21*") do set "JAVA_HOME=%%~fJ"
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" goto :java_ok
echo [ERRO] Java 21 nao encontrado em C:\Program Files\Java.
echo Instale o JDK 21 ou configure JAVA_HOME antes de executar.
exit /b 1

:java_ok
echo Java detectado: %JAVA_HOME%
exit /b 0

:check_port
netstat -ano -p TCP | findstr /R /C:":%1 .*LISTENING" >nul
if not errorlevel 1 exit /b 1
exit /b 0

:failed
echo.
echo Nao foi possivel iniciar a apresentacao.
pause
exit /b 1
