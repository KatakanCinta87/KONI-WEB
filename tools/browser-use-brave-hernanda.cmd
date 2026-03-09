@echo off
setlocal
pushd "%~dp0.."
set "PYTHONIOENCODING=utf-8"
set "BROWSER_USE_CONFIG_DIR=%CD%\.browseruse"
set "PYTHONPATH=C:\Users\LENOVO\AppData\Roaming\uv\tools\browser-use\Lib\site-packages;%PYTHONPATH%"
python "%~dp0browser-use-brave-hernanda.py" %*
set "EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %EXIT_CODE%