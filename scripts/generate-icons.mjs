import { Resvg } from '@resvg/resvg-js'
import { writeFileSync } from 'node:fs'

const createSvg = (size) => {
  const radius = Math.round(size * 0.22)
  const fontSize = Math.round(size * 0.46)
  const textY = Math.round(size * 0.72)
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="#0d0d14"/>
  <text
    x="${size / 2}"
    y="${textY}"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${fontSize}"
    font-weight="800"
    text-anchor="middle"
    fill="url(#grad)"
  >RK</text>
</svg>`
}

function renderPng(size) {
  const resvg = new Resvg(createSvg(size), {
    fitTo: { mode: 'width', value: size },
  })
  return resvg.render().asPng()
}

// Generate all sizes
const p16  = renderPng(16)
const p32  = renderPng(32)
const p180 = renderPng(180)
const p192 = renderPng(192)
const p512 = renderPng(512)

writeFileSync('public/favicon-16x16.png', p16)
writeFileSync('public/favicon-32x32.png', p32)
writeFileSync('public/apple-touch-icon.png', p180)
writeFileSync('public/android-chrome-192x192.png', p192)
writeFileSync('public/android-chrome-512x512.png', p512)

// Build a proper multi-size .ico (16 + 32) using embedded PNGs
function buildIco(entries) {
  const count = entries.length
  const headerSize = 6 + count * 16
  let dataOffset = headerSize

  const dirEntries = entries.map(({ size, buf }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2)
    e.writeUInt8(0, 3)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(buf.length, 8)
    e.writeUInt32LE(dataOffset, 12)
    dataOffset += buf.length
    return e
  })

  const iconDir = Buffer.alloc(6)
  iconDir.writeUInt16LE(0, 0)
  iconDir.writeUInt16LE(1, 2)
  iconDir.writeUInt16LE(count, 4)

  return Buffer.concat([iconDir, ...dirEntries, ...entries.map((e) => e.buf)])
}

writeFileSync(
  'public/favicon.ico',
  buildIco([
    { size: 16, buf: p16 },
    { size: 32, buf: p32 },
  ])
)

console.log('✓ favicon-16x16.png')
console.log('✓ favicon-32x32.png')
console.log('✓ apple-touch-icon.png (180x180)')
console.log('✓ android-chrome-192x192.png')
console.log('✓ android-chrome-512x512.png')
console.log('✓ favicon.ico (16+32)')
