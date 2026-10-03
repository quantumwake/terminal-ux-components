// The pixel check for a library component against its part of an App v2
// board (champion @1846, rule 4). Unlike a static page, the story is the
// component itself: examples/<name>/story.tsx default-exports a React
// element, which is bundled from src/ and mounted, so the check measures the
// code that ships.
//
//   node scripts/story-gate.mjs --story examples/app-header/story.tsx \
//     --mockup <statefs.ai>/docs/design/mockups/app-v2/8-Agents.png \
//     --clip 0,0,1440,72 --out examples/app-header/gate
//
// The story is placed with its top-left at the clip's corner, on the studio
// ground, in a 1440x960 page with the mockups' fonts. The shot and the
// mockup are both cut to the clip, then compared as the portal gate does:
// pixelmatch threshold 0.1, fail above 1% of pixels. --mockup has no
// default (MOCKUPS_DIR names the directory, and --board the file in it), so
// no seat's own path is baked in.

import { createServer } from 'node:http'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

export const WIDTH = 1440
export const HEIGHT = 960
export const LIMIT = 0.01

export function parseClip(s) {
    const n = String(s ?? '').split(',').map((v) => Number(v.trim()))
    if (n.length !== 4 || n.some((v) => !Number.isInteger(v) || v < 0)) throw new Error(`clip ${s}: want x,y,w,h in whole pixels`)
    const [x, y, width, height] = n
    if (width === 0 || height === 0 || x + width > WIDTH || y + height > HEIGHT) throw new Error(`clip ${s}: outside the ${WIDTH}x${HEIGHT} page`)
    return { x, y, width, height }
}

export function crop(png, { x, y, width, height }) {
    const out = new PNG({ width, height })
    PNG.bitblt(png, out, x, y, width, height, 0, 0)
    return out
}

export function compare(actual, expected, limit = LIMIT) {
    if (actual.width !== expected.width || actual.height !== expected.height) {
        return { pass: false, ratio: 1, reason: `size ${actual.width}x${actual.height}, mockup ${expected.width}x${expected.height}` }
    }
    const diff = new PNG({ width: expected.width, height: expected.height })
    const differing = pixelmatch(actual.data, expected.data, diff.data, expected.width, expected.height, { threshold: 0.1 })
    const ratio = differing / (expected.width * expected.height)
    return { pass: ratio <= limit, ratio, differing, diff }
}

// page is the HTML the story mounts into: the mockups' fonts and ground, and
// a box at the clip's corner.
export function page(clip, ground = '#0f0e0d') {
    return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>body{margin:0;background:${ground}}button{font:inherit}</style></head>
<body><div id="story" style="position:absolute;left:${clip.x}px;top:${clip.y}px;width:${clip.width}px"></div>
<script src="/story.js"></script></body></html>`
}

async function bundle(story) {
    const entry = `import React from 'react'; import { createRoot } from 'react-dom/client'; import Story from ${JSON.stringify(resolve(story))};
createRoot(document.getElementById('story')).render(React.isValidElement(Story) ? Story : React.createElement(Story));`
    const out = await build({
        stdin: { contents: entry, resolveDir: process.cwd(), loader: 'tsx' },
        bundle: true,
        write: false,
        format: 'iife',
        jsx: 'automatic',
        define: { 'process.env.NODE_ENV': '"production"' },
        logLevel: 'silent',
    })
    return out.outputFiles[0].text
}

async function main() {
    const { values } = parseArgs({
        options: {
            story: { type: 'string' },
            mockup: { type: 'string' },
            board: { type: 'string' },
            clip: { type: 'string' },
            out: { type: 'string' },
            chrome: { type: 'string', default: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' },
        },
    })
    const mockup = values.mockup || (process.env.MOCKUPS_DIR && values.board ? join(process.env.MOCKUPS_DIR, values.board) : '')
    if (!values.story || !mockup || !values.clip || !values.out) {
        console.error('usage: story-gate.mjs --story STORY.tsx (--mockup PNG | --board N.png with MOCKUPS_DIR) --clip x,y,w,h --out DIR')
        process.exit(2)
    }
    const clip = parseClip(values.clip)
    const js = await bundle(values.story)
    const server = createServer((req, res) => {
        if (req.url === '/story.js') {
            res.writeHead(200, { 'content-type': 'text/javascript' })
            return res.end(js)
        }
        res.writeHead(200, { 'content-type': 'text/html' })
        res.end(page(clip))
    })
    await new Promise((r) => server.listen(0, '127.0.0.1', r))
    const browser = await chromium.launch({ executablePath: values.chrome, headless: true })
    try {
        const tab = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 })
        const errors = []
        tab.on('pageerror', (e) => errors.push(e.message))
        await tab.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' })
        await tab.evaluate(() => document.fonts.ready)
        if (errors.length) throw new Error(`the story threw: ${errors.join('; ')}`)
        if (!(await tab.evaluate(() => document.getElementById('story').childElementCount))) throw new Error('the story rendered nothing')
        const shot = PNG.sync.read(await tab.screenshot({ clip }))
        const expected = crop(PNG.sync.read(readFileSync(mockup)), clip)
        const result = compare(shot, expected)
        mkdirSync(values.out, { recursive: true })
        writeFileSync(join(values.out, 'shot.png'), PNG.sync.write(shot))
        writeFileSync(join(values.out, 'expected.png'), PNG.sync.write(expected))
        if (result.diff) writeFileSync(join(values.out, 'diff.png'), PNG.sync.write(result.diff))
        const total = clip.width * clip.height
        console.log(`${result.pass ? 'PASS' : 'FAIL'} ${(result.ratio * 100).toFixed(2)}% of pixels differ (${result.differing ?? total} of ${total})${result.reason ? `: ${result.reason}` : ''}`)
        process.exitCode = result.pass ? 0 : 1
    } finally {
        await browser.close()
        server.close()
    }
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(2) })
