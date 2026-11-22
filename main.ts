// MIDNIGHT HEIST — entrypoint (Node 22, standard library only).
// Copies game/ and screenshots/ beside this file into the output
// directory and writes dossier.json with buildDossier from
// vendor/makefun-game.ts. Run it as:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader MAKEFUN_OUTPUT_DIR stands in for /output; with
// neither set it writes to /output. Both runs write identical bytes.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here);
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

// Start from a clean output so a stale file can never leak into a run.
if (existsSync(outputDir)) rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

// Copy game/ and screenshots/ in a fixed order, file by file.
for (const name of ['game', 'screenshots']) {
  const src = join(repoRoot, name);
  const dest = join(outputDir, name);
  if (!existsSync(src)) throw new Error(`main.ts: missing ${name}/ beside main.ts`);
  cpSync(src, dest, { recursive: true, dereference: false });
}

// The dossier needs 3-4 screenshots; fail early with a plain message
// instead of the library's error when they are not there yet.
const shotNames = readdirSync(join(repoRoot, 'screenshots'))
  .filter((n) => !n.startsWith('.'))
  .sort();
if (shotNames.length === 0) {
  throw new Error('main.ts: screenshots/ is empty — capture 1-play.jpg, 2-start.jpg, 3-alarm.jpg, 4-escape.jpg first');
}

// The dossier is built from the copied tree, exactly as the gate does.
const dossier = buildDossier(outputDir, dossierCaps);
writeFileSync(join(outputDir, 'dossier.json'), dossier);

const gameFiles = readdirSync(join(outputDir, 'game'), { recursive: true });
const shotFiles = readdirSync(join(outputDir, 'screenshots'), { recursive: true });
console.log(`MIDNIGHT HEIST: wrote ${outputDir}`);
console.log(`  game files: ${gameFiles.length}, screenshots: ${shotFiles.length}`);
console.log(`  dossier.json: ${dossier.length} bytes`);
