// rhwp 소스(src, crates)가 include_bytes!/include_str!로 읽는 파일 중 sparse 체크아웃에 없는 것을 모두 받는다
// 사용: node tools/fetch-includes.mjs   (rhwp-src 기준)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root = path.resolve('rhwp-src');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? (e.name === 'target' ? [] : walk(p)) : p.endsWith('.rs') ? [p] : [];
});
const files = [...walk(path.join(root, 'src')), ...walk(path.join(root, 'crates'))];
const want = new Set();
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  // 1) include_bytes!("상대경로")  2) include_*!(concat!(env!("CARGO_MANIFEST_DIR"), "/경로"))
  for (const m of t.matchAll(/include_(?:bytes|str)!\(\s*"([^"]+)"\s*\)/g)) want.add(path.resolve(path.dirname(f), m[1]));
  for (const m of t.matchAll(/include_(?:bytes|str)!\(\s*concat!\(\s*env!\("CARGO_MANIFEST_DIR"\)\s*,\s*"([^"]+)"/g)) {
    let dir = path.dirname(f); while (!fs.existsSync(path.join(dir, 'Cargo.toml'))) dir = path.dirname(dir);
    want.add(path.resolve(dir, m[1].replace(/^\//, '')));
  }
}
let got = 0, miss = [];
for (const abs of want) {
  if (fs.existsSync(abs)) continue;
  const rel = path.relative(root, abs).split(path.sep).join('/');
  if (rel.startsWith('..')) continue;
  try {
    const buf = execFileSync('git', ['-C', root, 'show', `HEAD:${rel}`], { maxBuffer: 1 << 30 });
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, buf); got++;
  } catch { miss.push(rel); }
}
console.log(`참조 ${want.size}개, 새로 받음 ${got}개, 저장소에도 없음 ${miss.length}개`);
miss.slice(0, 10).forEach((m) => console.log('  없음', m));
