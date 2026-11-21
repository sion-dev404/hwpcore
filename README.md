# hwpcore

[한글 편집기](https://github.com/sion-dev404/hangul-editor)의 문서 엔진 프로젝트입니다. 목표는 한글(HWP·HWPX) 문서를 **한글 2024와 똑같이, 깨지지 않게** 그리는 것입니다.

오픈소스 엔진 [rhwp](https://github.com/edwardkim/rhwp)(MIT)에서 출발했습니다. 한글 2024 출력과 쪽마다 비교해 점수가 낮은 곳부터 고쳐 나갑니다.

## 점수 (한글 2024 PDF와의 일치율)

시험 문서 68개(서울시 정보공개 공문서, 기본 서식, 실제 문서)를 한글 2024로 PDF로 만든 것을 정답으로 삼았습니다. 엔진이 그린 쪽과 비교한 평균값입니다.

| 엔진 | 평균 일치율 |
|---|---|
| rhwp 0.9.0 + 한글 편집기 수정 (한글 편집기 3.2.0) | 93.0% |
| rhwp 0.9.1 (원본) | 94.6% |
| **hwpcore (rhwp 0.9.1 + 수정, 한글 편집기 3.3.0)** | **94.6%** |

문서별 점수는 [점수표 페이지](https://sion-dev404.github.io/hwpcore/)에 있습니다.

## 구성

| 경로 | 내용 |
|---|---|
| `patches/` | rhwp에 얹는 hwpcore 수정 (git format-patch) |
| `tools/compare.cjs`, `tools/compare.html` | 정답 비교 장치 — 엔진 그림과 한글 PDF를 쪽마다 비교 |
| `tools/hwp2pdf.ps1` | 한글 2024로 HWP·HWPX를 PDF로 뽑기 (정답 만들기) |
| `build-engine.ps1` | 엔진을 WebAssembly로 빌드 |
| `docs/` | 점수표 페이지 (GitHub Pages) |

## 엔진 빌드

```powershell
git clone --depth 1 --branch v0.9.1 --filter=blob:none --sparse https://github.com/edwardkim/rhwp.git rhwp-src
cd rhwp-src
git sparse-checkout set src crates rhwp-studio rhwp-shared bindings vendor tools scripts assets data typescript saved ttfs mydocs
git am ..\patches\*.patch
cd ..
powershell -File build-engine.ps1     # → rhwp-src\pkg-new\rhwp.js, rhwp_bg.wasm
```

C 컴파일러가 없는 Windows에서 빌드하는 우회 방법(wasm-bindgen 대신 WASI 도구 사용)은 `build-engine.ps1`과 [한글 편집기 개발 기록](https://github.com/sion-dev404/hangul-editor/blob/main/CLAUDE.md)에 적혀 있습니다.

## 정답 비교

```powershell
cd tools; npm install; cd ..
# 1) 정답 PDF 만들기 (한글 2024 필요)
powershell -File tools\hwp2pdf.ps1 -In corpus\docs -Out corpus\ref
# 2) 비교
npx electron tools\compare.cjs --docs corpus\docs --ref corpus\ref --out runs\오늘 --glue rhwp-src\pkg-new\rhwp.js --wasm rhwp-src\pkg-new\rhwp_bg.wasm
```

결과는 `runs\오늘\report.html`에 나옵니다. 차이 그림에서 빨강은 한글에만 있는 것, 파랑은 우리 엔진에만 있는 것입니다.

**비교 방식**
- 엔진은 한글 편집기와 같은 Canvas 그리기에 **인쇄 프로필**을 씁니다. 그래서 빈 누름틀 안내문처럼 화면에만 보이는 표시는 빠집니다.
- 글자·선이 있는 칸(밝기 180 미만)을 2칸 넓혀 겹치는 정도를 셉니다.
- 한글이 PDF에서 종이 크기나 축소를 바꾼 경우에 대비해 세 가지로 맞춰 보고 가장 잘 맞는 쪽을 씁니다: 폭 맞춤, 실제 크기, 잉크 영역 맞춤.

**한글 2024 자동화**에는 한컴 공식 보안 승인 모듈이 필요합니다. 이 저장소에는 넣지 않았습니다. [hancom-io/devcenter-archive](https://github.com/hancom-io/devcenter-archive)의 `hwp-automation/보안모듈(Automation).zip`을 받아 `hancom-secmodule/files/`에 풀어 주세요.

## 라이선스

- 이 저장소의 도구와 패치: MIT ([LICENSE](LICENSE))
- rhwp: MIT, © Edward Kim 외 기여자
- "한글"·"한컴오피스"는 ㈜한글과컴퓨터의 상표입니다. 이 프로젝트는 한글과컴퓨터와 관계가 없습니다.
