// Genera dist/<ciudad>/index.html por cada ruta de LOCATIONS
// para que GitHub Pages responda HTTP 200 en enlaces directos.
import { readFileSync, mkdirSync, copyFileSync } from 'node:fs'

const src = readFileSync('src/data/locations.ts', 'utf8')
const ids = [...src.matchAll(/^\s{2}'([a-z-]+)':\s*\{/gm)].map(m => m[1])

if (ids.length === 0) {
  console.error('postbuild: no se encontraron rutas en src/data/locations.ts')
  process.exit(1)
}

for (const id of ids) {
  mkdirSync(`dist/${id}`, { recursive: true })
  copyFileSync('dist/index.html', `dist/${id}/index.html`)
  console.log(`postbuild: dist/${id}/index.html creado`)
}
