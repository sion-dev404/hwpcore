// 패치 파일에서 깨진 한글 주석을 바로잡는다 (한 번만 쓰는 정리용)
import fs from 'node:fs';
const root = 'C:/Users/redsi/hwpcore/rhwp-src/';
const fixes = [
  ['src/document_core/commands/html_import.rs', [
    [/\/\/ CSS \? \?\?\?\(page-break-before \/ break-before\)[^\r\n]*/, '// CSS 쪽 나눔(page-break-before / break-before)이 있으면 이 문단 앞에서 쪽을 나눈다'],
  ]],
  ['src/document_core/commands/html_import/inline_content.rs', [
    [/\/\/ background-color \?[^\r\n]*/, '// background-color → 글자 음영(형광펜). 투명이면 넣지 않는다.'],
    [/\/\/ \(\?\? rgba\(\?,0\)[^\r\n]*/, '// (rgba(…,0)처럼 완전히 투명한 색은 음영으로 넣지 않음)'],
    [/\/\/ vertical-align \?[^\r\n]*/, '// vertical-align → 위 첨자·아래 첨자'],
  ]],
  ['src/document_core/html_table_import.rs', [
    [/\/\/ CSS padding \?[^\r\n]*/, '// CSS padding이 있으면 "셀 안쪽 여백 따로 지정"을 켠다.'],
    [/\/\/ \? \?\? \?\?\? \? padding[^\r\n]*/, '// 켜지 않으면 표 전체 기본 여백이 쓰여 붙여 넣은 칸 안쪽 여백이 사라진다.'],
  ]],
];
for (const [f, list] of fixes) {
  let t = fs.readFileSync(root + f, 'utf8');
  for (const [re, s] of list) { if (!re.test(t)) throw new Error(`${f}: 못 찾음 ${re}`); t = t.replace(re, s); }
  fs.writeFileSync(root + f, t);
}
console.log('주석 정리 완료');
