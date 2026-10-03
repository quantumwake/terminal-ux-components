// Pixel-check one component story against a clip of its mockup.
// The page is the board at 1440x960; the clip is the component's box.
// Same comparison as portal/scripts/pixel-gate.mjs: threshold 0.1, fail above 1%.
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild'
import { chromium } from 'playwright-core'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const mockups = process.argv[2] || join(root, '../statefs.ai-test-glob/docs/design/mockups/app-v2')

const pieces = [
    { name: 'swim-lanes', page: 'examples/board/index.html', entry: 'examples/board/story.tsx', mockup: '6-Board.png', box: '#lanes > div' },
    { name: 'work-card', page: 'examples/board/index.html', entry: 'examples/board/story.tsx', mockup: '6-Board.png', box: '#lanes button[aria-pressed="true"]' },
    { name: 'workflow', page: 'examples/workflow/index.html', entry: 'examples/workflow/story.tsx', mockup: '7-Workflow.png', box: '#workflow > ol' },
    { name: 'milestone', page: 'examples/workflow/index.html', entry: 'examples/workflow/story.tsx', mockup: '7-Workflow.png', box: '#workflow li >> nth=0 >> div >> nth=0' },
    { name: 'channel', page: 'examples/channel/index.html', entry: 'examples/channel/story.tsx', mockup: '5-Channel.png', box: '#channels > nav' },
]

const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff': 'font/woff', '.woff2': 'font/woff2' }

await esbuild.build({
    entryPoints: [...new Set(pieces.map((p) => join(root, p.entry)))],
    bundle: true,
    format: 'iife',
    outdir: root,
    outbase: root,
    entryNames: '[dir]/story',
    jsx: 'automatic',
    platform: 'browser',
})

const server = createServer((req, res) => {
    const path = join(root, decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname))
    try {
        const body = readFileSync(path)
        res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' })
        res.end(body)
    } catch {
        res.writeHead(404)
        res.end('missing')
    }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const { port } = server.address()
const browser = await chromium.launch({ executablePath: chrome, headless: true })
let failed = 0
try {
    for (const piece of pieces) {
        const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 })
        await page.goto(`http://127.0.0.1:${port}/${piece.page}`, { waitUntil: 'networkidle' })
        await page.evaluate(() => document.fonts.ready)
        const box = await page.locator(piece.box).boundingBox()
        if (!box) throw new Error(`${piece.name}: no box for ${piece.box}`)
        const clip = {
            x: Math.round(box.x),
            y: Math.round(box.y),
            width: Math.round(box.width),
            height: Math.round(box.height),
        }
        const shot = await page.screenshot({ clip })
        const full = PNG.sync.read(readFileSync(join(mockups, piece.mockup)))
        const expected = new PNG({ width: clip.width, height: clip.height })
        PNG.bitblt(full, expected, clip.x, clip.y, clip.width, clip.height, 0, 0)
        const actual = PNG.sync.read(shot)
        const diff = new PNG({ width: clip.width, height: clip.height })
        const differing = pixelmatch(actual.data, expected.data, diff.data, clip.width, clip.height, { threshold: 0.1 })
        const ratio = differing / (clip.width * clip.height)
        const out = join(root, 'examples', piece.name, 'gate')
        mkdirSync(out, { recursive: true })
        writeFileSync(join(out, 'shot.png'), shot)
        writeFileSync(join(out, 'diff.png'), PNG.sync.write(diff))
        const pct = (ratio * 100).toFixed(2)
        const pass = ratio <= 0.01
        if (!pass) failed += 1
        console.log(`${pass ? 'PASS' : 'FAIL'} ${piece.name} ${pct}%  clip ${clip.x},${clip.y},${clip.width},${clip.height}`)
        await page.close()
    }
} finally {
    await browser.close()
    server.close()
}
process.exit(failed ? 1 : 0)
