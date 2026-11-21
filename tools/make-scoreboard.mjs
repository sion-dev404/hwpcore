// 비교 결과(runs/*/results.json)로 점수표 페이지(docs/index.html)를 만든다
// 사용: node tools/make-scoreboard.mjs 이름=runs/폴더 이름=runs/폴더 ...   (마지막이 현재 hwpcore)
import fs from 'node:fs';
const cols = process.argv.slice(2).map((a) => { const [n, p] = a.split('='); return { n, r: JSON.parse(fs.readFileSync(p + '/results.json', 'utf8')) }; });
const docs = cols.at(-1).r.results.map((r) => r.doc);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const get = (c, d) => c.r.results.find((r) => r.doc === d);
const cls = (v) => (v == null ? '' : v >= 98 ? 'a' : v >= 90 ? 'b' : v >= 70 ? 'c' : 'd');
const rows = docs.map((d) => {
  const vals = cols.map((c) => get(c, d)?.score);
  const r = get(cols.at(-1), d);
  return { d, vals, pages: r?.error ? r.error : `${r.oursPages}/${r.refPages}` };
}).sort((a, b) => (a.vals.at(-1) ?? 999) - (b.vals.at(-1) ?? 999));
const name = (d) => d.replace(/\.(hwp|hwpx)$/i, '').replace(/^hwpx__opengov__/, '공문서 · ').replace(/^basic__/, '서식 · ').replace(/_/g, ' ');
const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>hwpcore 점수표</title>
<style>
:root{--bg:#f5f7fa;--card:#fff;--ink:#1c2330;--sub:#5d6778;--line:#e2e6ec;--blue:#2f6fd6;--a:#1f8a4c;--b:#5b8f1f;--c:#b7791f;--d:#c0392b}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#12161d;--card:#1a202a;--ink:#e6e9ef;--sub:#a3acba;--line:#2a313d;--blue:#7aa7f0;--a:#4cc27f;--b:#a3c84a;--c:#e0a84a;--d:#ef6b5b}}
:root[data-theme="dark"]{--bg:#12161d;--card:#1a202a;--ink:#e6e9ef;--sub:#a3acba;--line:#2a313d;--blue:#7aa7f0;--a:#4cc27f;--b:#a3c84a;--c:#e0a84a;--d:#ef6b5b}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 "Malgun Gothic","Apple SD Gothic Neo",sans-serif;word-break:keep-all}
main{max-width:980px;margin:0 auto;padding:28px 16px 60px}
h1{font-size:26px;margin:0 0 4px}.sub{color:var(--sub);margin:0 0 20px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:0 0 22px}
.tile{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}.tile b{display:block;font-size:30px;font-variant-numeric:tabular-nums}.tile span{color:var(--sub);font-size:13px}
.tile.now{border-color:var(--blue)}.tile.now b{color:var(--blue)}
.wrap{overflow-x:auto;background:var(--card);border:1px solid var(--line);border-radius:12px}
table{border-collapse:collapse;width:100%;min-width:560px}th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
th{color:var(--sub);font-weight:700;font-size:13px;position:sticky;top:0;background:var(--card)}td:first-child,th:first-child{text-align:left;white-space:normal}
td.a{color:var(--a)}td.b{color:var(--b)}td.c{color:var(--c)}td.d{color:var(--d);font-weight:700}
.up{color:var(--a);font-size:12px;margin-left:4px}.down{color:var(--d);font-size:12px;margin-left:4px}
footer{color:var(--sub);font-size:13px;margin-top:18px}a{color:var(--blue)}
</style></head><body><main>
<h1>hwpcore 점수표</h1>
<p class="sub">한글 2024로 만든 PDF(정답)와 엔진이 그린 쪽의 일치율입니다. 시험 문서 ${docs.length}개, 낮은 점수부터 정렬했습니다. 측정: ${esc(cols.at(-1).r.when.slice(0, 10))}</p>
<div class="tiles">${cols.map((c, i) => `<div class="tile${i === cols.length - 1 ? ' now' : ''}"><b>${c.r.average}%</b><span>${esc(c.n)} · 평균</span></div>`).join('')}</div>
<div class="wrap"><table><thead><tr><th>문서</th>${cols.map((c) => `<th>${esc(c.n)}</th>`).join('')}<th>쪽 수(엔진/한글)</th></tr></thead><tbody>
${rows.map((x) => `<tr><td>${esc(name(x.d))}</td>${x.vals.map((v, i) => {
  const prev = i ? x.vals[i - 1] : null; const dlt = v != null && prev != null ? v - prev : 0;
  return `<td class="${cls(v)}">${v == null ? '–' : v + '%'}${Math.abs(dlt) >= 1 ? `<span class="${dlt > 0 ? 'up' : 'down'}">${dlt > 0 ? '▲' : '▼'}${Math.abs(dlt).toFixed(1)}</span>` : ''}</td>`;
}).join('')}<td>${esc(x.pages)}</td></tr>`).join('\n')}
</tbody></table></div>
<footer>비교 방식과 도구: <a href="https://github.com/sion-dev404/hwpcore">sion-dev404/hwpcore</a> · 엔진 출발점: <a href="https://github.com/edwardkim/rhwp">rhwp</a> (MIT) · 메모 칸을 함께 찍은 PDF(예: english)는 정답 자체가 줄어 있어 점수가 낮게 나옵니다. "한글"은 ㈜한글과컴퓨터의 상표이며 이 프로젝트는 한글과컴퓨터와 관계가 없습니다.</footer>
</main></body></html>`;
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/index.html', html);
console.log('docs/index.html', rows.length, '문서');
