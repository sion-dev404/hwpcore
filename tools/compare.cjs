// hwpcore 정답 비교 도구 (Electron, 화면에 창을 띄우지 않음)
// 한글 2024가 만든 PDF(정답)와 hwpcore 엔진이 Canvas로 그린 쪽을 같은 크기 그림으로 놓고 비교한다.
// 사용:
//   electron compare.cjs --docs <문서 폴더> --ref <정답 PDF 폴더> --out <결과 폴더>
//                        [--glue <rhwp.js>] [--wasm <rhwp_bg.wasm>] [--width 1000] [--only 이름]
// 결과: <out>/results.json, <out>/report.html, 문서별 쪽 그림(우리/정답/차이)
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) { const k = a.slice(2); const v = process.argv[i + 1]; if (v && !v.startsWith('--')) { args[k] = v; i++; } else args[k] = true; }
}
const ED = 'C:/Users/redsi/hangul-editor';
const cfg = {
  docs: path.resolve(args.docs || 'docs'),
  ref: path.resolve(args.ref || 'ref'),
  out: path.resolve(args.out || 'out'),
  glue: path.resolve(args.glue || `${ED}/src/vendor/rhwp-core.js`),
  wasm: path.resolve(args.wasm || `${ED}/public/studio/assets/rhwp_bg.wasm`),
  width: Number(args.width || 1000),
  only: args.only || '',
  pdfjs: path.join(__dirname, 'node_modules/pdfjs-dist/build'),
};
fs.mkdirSync(cfg.out, { recursive: true });

app.whenReady().then(async () => {
  const w = new BrowserWindow({
    show: false, width: 1200, height: 900,
    webPreferences: { nodeIntegration: true, contextIsolation: false, webSecurity: false, backgroundThrottling: false },
  });
  w.webContents.on('console-message', (_e, _l, msg) => console.log(msg));
  w.webContents.on('render-process-gone', (_e, d) => { console.error('그리기 프로세스 종료:', d.reason); app.exit(2); });
  await w.loadURL(pathToFileURL(path.join(__dirname, 'compare.html')).href + '#' + encodeURIComponent(JSON.stringify(cfg)));
  const code = await w.webContents.executeJavaScript('window.__run()', true).catch((e) => { console.error(e); return 1; });
  app.exit(code || 0);
});
