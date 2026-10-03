// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { PNG } from 'pngjs'
// @ts-expect-error: a plain .mjs script
import { compare, crop, isComponent, page, parseClip, LIMIT } from './story-gate.mjs'

const png = (w: number, h: number, paint = (_x: number, _y: number) => [15, 14, 13]) => {
    const p = new PNG({ width: w, height: h })
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4
            const [r, g, b] = paint(x, y)
            p.data[i] = r
            p.data[i + 1] = g
            p.data[i + 2] = b
            p.data[i + 3] = 255
        }
    return p
}

describe('story gate', () => {
    it('is 1% of pixels, and the limit itself passes', () => {
        expect(LIMIT).toBe(0.01)
        const at = compare(png(100, 100, (_x, y) => (y === 0 ? [255, 255, 255] : [15, 14, 13])), png(100, 100))
        expect(at.differing).toBe(100)
        expect(at.pass).toBe(true)
        const over = compare(png(100, 100, (x, y) => (y === 0 || (y === 1 && x === 0) ? [255, 255, 255] : [15, 14, 13])), png(100, 100))
        expect(over.pass).toBe(false)
    })

    it('refuses a clip outside the 1440x960 page', () => {
        expect(parseClip('0,0,1440,72')).toEqual({ x: 0, y: 0, width: 1440, height: 72 })
        for (const bad of ['0,0,1441,72', '0,900,10,61', '0,0,0,10', '1,2,3', '-1,0,10,10', '0.5,0,1,1', '']) {
            expect(() => parseClip(bad), bad).toThrow(/clip/)
        }
    })

    it('cuts the mockup to the clip', () => {
        const m = png(10, 10, (x, y) => [x * 20, y * 20, 0])
        const c = crop(m, { x: 2, y: 3, width: 4, height: 2 })
        expect([c.width, c.height]).toEqual([4, 2])
        expect([...c.data.subarray(0, 3)]).toEqual([40, 60, 0])
    })

    it('mounts the story bundle at the clip corner: a page with no script would measure nothing', () => {
        const html = page({ x: 28, y: 213, width: 879, height: 526 })
        expect(html).toContain('<script src="/story.js"></script>')
        expect(html).toContain('left:28px;top:213px;width:879px')
        expect(html).toContain('IBM+Plex+Sans')
    })

    it('counts only library components as what a story mounts', () => {
        expect(isComponent('src/components/AppHeader.tsx')).toBe(true)
        expect(isComponent('/abs/tux/src/components/StatusDot.ts')).toBe(true)
        for (const not of ['examples/app-header/story.tsx', 'src/theme/studio.ts', 'node_modules/react/index.js', 'src/components/x/deep.tsx', 'notsrc/components/A.tsx']) {
            expect(isComponent(not), not).toBe(false)
        }
    })
})
