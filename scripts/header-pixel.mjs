// Pixel check for examples/app-header against the top 72px of the Agents
// mockup. Same comparison as the portal gate: pixelmatch threshold 0.1,
// fail above 1% of pixels. The portal gate shoots a full 1440x960 route, so
// this crops the mockup and the shot to the header band.
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const mockupPath = process.argv[2] || join(root, '../statefs.ai-test-glob/docs/design/mockups/app-v2/8-Agents.png')
const out = join(root, 'examples/app-header/gate')
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const types = { '.html': 'text/html', '.woff': 'font/woff', '.woff2': 'font/woff2' }

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
try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 72 }, deviceScaleFactor: 1 })
    await page.goto(`http://127.0.0.1:${port}/examples/app-header/index.html`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const shot = await page.screenshot({ fullPage: false })
    const actual = PNG.sync.read(shot)
    const full = PNG.sync.read(readFileSync(mockupPath))
    const expected = new PNG({ width: 1440, height: 72 })
    for (let y = 0; y < 72; y++) {
        expected.data.set(full.data.subarray(y * full.width * 4, y * full.width * 4 + 1440 * 4), y * 1440 * 4)
    }
    const diff = new PNG({ width: 1440, height: 72 })
    const differing = pixelmatch(actual.data, expected.data, diff.data, 1440, 72, { threshold: 0.1 })
    const ratio = differing / (1440 * 72)
    mkdirSync(out, { recursive: true })
    writeFileSync(join(out, 'shot.png'), shot)
    writeFileSync(join(out, 'expected.png'), PNG.sync.write(expected))
    writeFileSync(join(out, 'diff.png'), PNG.sync.write(diff))
    const pct = (ratio * 100).toFixed(2)
    console.log(`${ratio <= 0.01 ? 'PASS' : 'FAIL'} ${pct}% of pixels differ (${differing} of ${1440 * 72})`)
    console.log(`shot ${join(out, 'shot.png')}`)
    console.log(`diff ${join(out, 'diff.png')}`)
    process.exitCode = ratio <= 0.01 ? 0 : 1
} finally {
    await browser.close()
    server.close()
}
