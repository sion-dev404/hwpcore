// 엔진으로 한 쪽을 SVG로 그려 이미지 요소를 확인하는 진단 도구
// 사용: node tools/svgpage.mjs <문서> <쪽(0부터)> [rhwp.js] [rhwp_bg.wasm]
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const [file, pageArg = '0', glue = 'rhwp-src/pkg-new/rhwp.js', wasm = 'rhwp-src/pkg-new/rhwp_bg.wasm'] = process.argv.slice(2);
globalThis.measureTextWidth = (font, text) => { const m = /([\d.]+)px/.exec(font); const px = m ? +m[1] : 16; let w = 0; for (const ch of text) w += ch.codePointAt(0) > 0x2e80 ? px : px * 0.55; return w; };
const mod = await import(pathToFileURL(path.resolve(glue)).href);
mod.initSync({ module: fs.readFileSync(wasm) });
const doc = new mod.HwpDocument(new Uint8Array(fs.readFileSync(file)));
const svg = doc.renderPageSvgWithProfile(+pageArg, 'print');
fs.writeFileSync('work/page.svg', svg);
const imgs = [...svg.matchAll(/<image\b[^>]*>/g)].map((m) => m[0].replace(/href="data:([^;,]+)[^"]{0,40}[^"]*"/, 'href="data:$1…"').slice(0, 220));
console.log('쪽 수', doc.pageCount(), '| 이미지', imgs.length);
imgs.forEach((s) => console.log(' ', s));
const odd = [...svg.matchAll(/<!--[^>]{0,200}-->/g)].map((m) => m[0]).filter((s) => /image|pic|그림|unsupported|fail/i.test(s));
odd.slice(0, 10).forEach((s) => console.log(' 주석', s));
