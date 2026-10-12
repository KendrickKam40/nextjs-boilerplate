// Builds design-system/dist from the site components for Claude Design:
//   dist/index.js   ESM; react, react-dom, framer-motion and lucide-react stay external
//   dist/index.css  site.css + every CSS module, hashed class names baked in
//   dist/types/     declarations from tsc, with '@/' imports made relative
// Images: next/image becomes a plain <img>. Every image path the components
// name is embedded as a downsized WebP (needs python3 + Pillow), so cards and
// designs never depend on the network; any other root-relative path loads from
// the repo's public/ on GitHub at the current commit.
// Run from the repo root: node design-system/build.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const dist = join(here, 'dist');
const require = createRequire(join(root, '.ds-sync', 'package.json'));
const { build } = require('esbuild');

const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const assetBase = `https://raw.githubusercontent.com/KendrickKam40/nextjs-boilerplate/${sha}/public`;

rmSync(dist, { recursive: true, force: true });

// Image paths the site components actually use -> embedded WebP data URLs.
// FOOD_IMAGES entries count only when a component or site-content names them.
const read = (f) => readFileSync(resolve(root, f), 'utf8');
const users = [...walkSrc(join(root, 'components/site')), join(root, 'components/display/StoreDisplay.tsx'), 'lib/site-content.ts'];
const usedKeys = new Set(users.flatMap((f) => [...read(f).matchAll(/FOOD_IMAGES\.(\w+)/g)].map((m) => m[1])));
const imagery = read('lib/site-imagery.ts');
const consts = Object.fromEntries([...imagery.matchAll(/const (\w+) = \{\s*src: '([^']+)'/g)].map((m) => [m[1], m[2]]));
const imageryPaths = [
  ...[...imagery.matchAll(/^  (\w+): \{\s*src: '([^']+)'/gm)].filter((m) => usedKeys.has(m[1])).map((m) => m[2]),
  ...[...imagery.matchAll(/^  (\w+): (\w+),$/gm)].filter((m) => usedKeys.has(m[1]) && consts[m[2]]).map((m) => consts[m[2]]),
];
const directPaths = users.flatMap((f) => [...read(f).matchAll(/['"](\/[\w./-]+\.(?:png|jpe?g|webp))['"]/g)].map((m) => m[1]));
const paths = [...new Set([...imageryPaths, ...directPaths])].sort();
const encoded = JSON.parse(
  execFileSync('python3', [join(here, 'encode-images.py'), join(root, 'public'), ...paths], { encoding: 'utf8', maxBuffer: 64 << 20 }),
);
const assetsModule = `export default ${JSON.stringify(encoded)};`;

await build({
  entryPoints: [join(here, 'src/index.ts')],
  outfile: join(dist, 'index.js'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  tsconfig: join(root, 'tsconfig.json'),
  external: ['react', 'react-dom', 'react/*', 'react-dom/*', 'framer-motion', 'lucide-react'],
  define: { __ASSET_BASE__: JSON.stringify(assetBase) },
  plugins: [
    {
      name: 'next-image-shim',
      setup(b) {
        b.onResolve({ filter: /^next\/image$/ }, () => ({ path: join(here, 'src/shims/next-image.tsx') }));
        b.onResolve({ filter: /^balibu:assets$/ }, () => ({ path: 'assets', namespace: 'balibu' }));
        b.onLoad({ filter: /.*/, namespace: 'balibu' }, () => ({ contents: assetsModule, loader: 'js' }));
      },
    },
  ],
  logLevel: 'warning',
});

execFileSync(join(root, 'node_modules/.bin/tsc'), ['-p', join(here, 'tsconfig.json')], { stdio: 'inherit' });

// tsc keeps '@/...' specifiers; make them relative so the tree stands alone.
const typesRoot = join(dist, 'types');
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
for (const file of walk(typesRoot).filter((f) => f.endsWith('.d.ts'))) {
  const text = readFileSync(file, 'utf8').replace(/(['"])@\/([^'"]+)\1/g, (_, q, p) => {
    let rel = relative(dirname(file), join(typesRoot, p)).replaceAll('\\', '/');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return `${q}${rel}${q}`;
  });
  writeFileSync(file, text);
}
console.log(`design-system: built dist/ (${Object.keys(encoded).length} images embedded, fallback base ${sha.slice(0, 7)})`);

function walkSrc(d) {
  return readdirSync(d).filter((n) => n.endsWith('.tsx')).map((n) => join(d, n));
}
