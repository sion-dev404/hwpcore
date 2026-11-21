# hwpcore — 한글 편집기의 자체 문서 엔진

한글 편집기(`C:\Users\redsi\hangul-editor`)의 최우선 목표. rhwp v0.9.0(MIT)에서 출발해 "한글 2024와 똑같이, 깨지지 않게" 그리는 엔진으로 단계적으로 키운다. (처음 이름 swpro → 사용자가 hwpcore로 확정)

## 폴더
- `rhwp-src/` — 엔진 소스(자체 git, 갈래 `hwpcore`). 원본 저장소는 9GB라 **sparse로 소스만** 받았다(`git sparse-checkout add <폴더>`로 더 받음). 빌드에 필요한 내장 파일 폴더: saved, ttfs, mydocs, samples/hml, samples/hwpx/ref, tests/fixtures.
- `build-engine.ps1` — 엔진 WASM 빌드(→ `rhwp-src/pkg-new/`), `wb-wasi/` — wasm-bindgen 대체 도구. 자세한 우회 방법은 hangul-editor의 CLAUDE.md "rhwp 엔진을 고쳐서 다시 빌드하기".
- `tools/` — 정답 비교 장치
  - `hwp2pdf.ps1` — 한글 2024로 HWP/HWPX → PDF(정답). 한컴 공식 보안 승인 모듈(`hancom-secmodule/`, hancom-io/devcenter-archive)을 HKCU `Software\HNC\HwpAutomation\Modules\HwpcoreFilePathChecker`에 등록해 허용 창 없이 동작(사용자 허락 2026-11-21).
  - `compare.cjs` + `compare.html` — Electron 숨은 창에서 엔진 Canvas 그림 ↔ 정답 PDF(pdf.js) 쪽별 비교. 잉크(밝기<180) 마스크를 2칸 넓혀 겹침 비교, 일치율 %. 결과 `results.json`, `report.html`, 쪽별 우리/한글/차이 그림.
    - 실행: `npx --prefix C:\Users\redsi\hangul-editor electron tools/compare.cjs --docs <문서> --ref <PDF> --out <결과> [--glue rhwp.js --wasm rhwp_bg.wasm]` (기본은 편집기에 들어 있는 엔진)
- `corpus/` — 시험 문서(docs)와 정답 PDF(ref). `runs/` — 비교 결과(날짜별).

## 한글 2024 사용 원칙 (사용자 지시)
- 사용자가 평소 쓰는 프로그램이다. 사용자 창·문서·프로세스는 절대 건드리지 않는다(강제 종료 금지). 자동화는 새 인스턴스에서 사본만 열고, 끝나면 그 인스턴스만 `Quit` + COM 연결 완전 해제.

## 일하는 순서
1. 시험 문서 묶음 → 정답 PDF → 기준 점수(runs/기준).
2. 점수 낮은 문서·쪽의 차이 그림으로 원인 분류(표, 줄 배치, 그림 위치, 글꼴 폭 …).
3. 엔진 수정 → 빌드 → 전체 다시 비교. 평균이 오르고 어떤 문서도 떨어지지 않을 때만 채택.
4. 채택한 엔진을 편집기(`public/studio/assets/rhwp_bg.wasm` + 글루)에 넣고 배포.
