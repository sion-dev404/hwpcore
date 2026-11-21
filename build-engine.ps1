# rhwp 엔진을 WASM으로 빌드하고 웹용으로 묶는다
# 사용: powershell -File build-engine.ps1 [-Profile release-test|release]
param([string]$Profile = 'release-test')
$ErrorActionPreference = 'Continue'
$s = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
$root = (rustc +1.93.1 --print sysroot)
$bin = Join-Path $root 'lib\rustlib\x86_64-pc-windows-gnu\bin'
$env:Path = "$bin;$bin\self-contained;$env:Path"
$env:CARGO_TARGET_X86_64_PC_WINDOWS_GNU_RUSTFLAGS = "-C dlltool=$bin\llvm-dlltool.exe"
$env:CARGO_TERM_COLOR = 'never'
Set-Location "$s\rhwp-src"
$sw = [Diagnostics.Stopwatch]::StartNew()
cargo build --lib --target wasm32-unknown-unknown --profile $Profile --locked 2>&1 | Select-String -Pattern '^(error|warning: unused)|Finished|could not compile' -Context 0,12 | Select-Object -First 6 | ForEach-Object { $_.Line; $_.Context.PostContext }
if ($LASTEXITCODE -ne 0) { "빌드 실패"; exit 1 }
Remove-Item pkg-new -Recurse -Force -ErrorAction SilentlyContinue
node --no-warnings "$s\wb-wasi\bindgen.mjs" "target\wasm32-unknown-unknown\$Profile\rhwp.wasm" "pkg-new" | Select-Object -Last 1
"걸린 시간(초): " + [int]$sw.Elapsed.TotalSeconds
Get-ChildItem pkg-new\rhwp_bg.wasm | Select-Object Name, @{n='MB';e={[math]::Round($_.Length/1MB,1)}}
