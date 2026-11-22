@echo off
call "C:\Program Files\Microsoft Visual Studio\18\Community\VC\Auxiliary\Build\vcvars64.bat" >nul
set PATH=%USERPROFILE%\.cargo\bin;%PATH%
cd /d C:\Users\redsi\hwpcore\rhwp-src
cargo +1.93.1-x86_64-pc-windows-msvc %*
