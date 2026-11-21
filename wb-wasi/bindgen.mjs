import { WASI } from 'node:wasi';
import fs from 'node:fs';
import path from 'node:path';
const [input, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const wasi = new WASI({ version: 'preview1', args: ['wb', '/in/' + path.basename(input), '/out'], preopens: { '/in': path.dirname(path.resolve(input)), '/out': path.resolve(outDir), '/tmp': path.resolve(outDir) }, env: { TMPDIR: '/tmp' } });
const mod = await WebAssembly.compile(fs.readFileSync(new URL('./target/wasm32-wasip1/release/wb-wasi.wasm', import.meta.url)));
const inst = await WebAssembly.instantiate(mod, wasi.getImportObject());
process.exitCode = wasi.start(inst);
