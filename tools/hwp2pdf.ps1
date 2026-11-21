# 한글 2024로 HWP/HWPX를 PDF로 뽑는다 (hwpcore 정답 그림용)
# 사용자 원칙: 사용자가 쓰는 한글 창·문서·프로세스는 건드리지 않는다.
#   - 새 자동화 인스턴스를 띄우고(보이지 않게), 넘겨받은 사본 파일만 열고, 끝나면 그 인스턴스만 닫는다.
#   - 닫기 전에 이 인스턴스에 내가 연 문서 외의 문서가 붙어 있으면 닫지 않고 그대로 둔다.
# 사용: powershell -File hwp2pdf.ps1 -In <폴더 또는 파일> -Out <PDF 폴더> [-Test]
param([string]$In, [string]$Out, [switch]$Test)
$ErrorActionPreference = 'Stop'
$dll = Join-Path $PSScriptRoot '..\hancom-secmodule\files\FilePathCheckerModuleExample.dll' | Resolve-Path
$key = 'HKCU:\Software\HNC\HwpAutomation\Modules'
if (-not (Test-Path $key)) { New-Item -Path $key -Force | Out-Null }
Set-ItemProperty -Path $key -Name 'HwpcoreFilePathChecker' -Value $dll.Path
New-Item -ItemType Directory -Force $Out | Out-Null

$hwp = New-Object -ComObject 'HWPFrame.HwpObject'
try {
  [void]$hwp.RegisterModule('FilePathCheckDLL', 'HwpcoreFilePathChecker')
  $hwp.SetMessageBoxMode(0x00020021) | Out-Null   # 확인/예 창은 자동으로 "확인"
  try { $hwp.XHwpWindows.Item(0).Visible = $false } catch {}
  $base = 1; try { $base = $hwp.XHwpDocuments.Count } catch {}
  if ($Test) {
    $hwp.HAction.Run('FileNew') | Out-Null
    $hwp.HAction.GetDefault('InsertText', $hwp.HParameterSet.HInsertText.HSet) | Out-Null
    $hwp.HParameterSet.HInsertText.Text = 'hwpcore 시험: 한글 2024 PDF 뽑기'
    $hwp.HAction.Execute('InsertText', $hwp.HParameterSet.HInsertText.HSet) | Out-Null
    $pdf = Join-Path $Out 'test.pdf'
    $ok = $hwp.SaveAs($pdf, 'PDF', '')
    "시험 저장: $ok → $pdf"
    $hwp.Clear(1) | Out-Null; $base = 1
  } else {
    $files = if (Test-Path $In -PathType Leaf) { Get-Item $In } else { Get-ChildItem $In -Recurse -Include *.hwp, *.hwpx }
    foreach ($f in $files) {
      $pdf = Join-Path $Out ($f.BaseName + '.pdf')
      if (Test-Path $pdf) { continue }
      try {
        if (-not $hwp.Open($f.FullName, '', 'forceopen:true;suspendpassword:true')) { "열기 실패: $($f.Name)"; continue }
        $ok = $hwp.SaveAs($pdf, 'PDF', '')
        "$($f.Name): $ok"
      } catch { "오류: $($f.Name) $_" }
      $hwp.Clear(1) | Out-Null   # 저장 안 함으로 닫기
    }
  }
} finally {
  $n = 0; try { $n = $hwp.XHwpDocuments.Count } catch {}
  # 내가 띄운 인스턴스: 시작 때 문서 수($base) 이하면 내 것뿐이므로 닫는다
  if ($n -le [Math]::Max($base, 2)) { try { $hwp.Run('FileQuit') } catch {}; try { $hwp.Quit() } catch {} } else { "이 인스턴스에 다른 문서 $n개가 있어 닫지 않음" }
  # 연결을 완전히 놓아야 한글이 실제로 끝난다
  [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($hwp); $hwp = $null
  [GC]::Collect(); [GC]::WaitForPendingFinalizers(); [GC]::Collect()
}
