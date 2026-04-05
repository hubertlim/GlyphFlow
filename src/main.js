import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext'

// --- State ---
let playing = true
let time = 0
let lastFrame = 0

// --- DOM refs ---
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const fpsEl = document.getElementById('fps')
const playBtn = document.getElementById('playBtn')
const saveBtn = document.getElementById('saveBtn')
const textInput = document.getElementById('textInput')
const fontSelect = document.getElementById('fontSelect')
const fontSizeInput = document.getElementById('fontSize')
const shapeSelect = document.getElementById('shapeSelect')
const colorSelect = document.getElementById('colorSelect')
const speedInput = document.getElementById('speed')
const lhInput = document.getElementById('lineHeight')
const presetsEl = document.getElementById('presets')

// --- Presets ---
const PRESETS = [
  { name: 'Poetic', text: 'In the silence between keystrokes, algorithms dream of electric sheep and forgotten semicolons' },
  { name: 'Multilingual', text: 'Hello world. 春天到了、桜が咲いた。بدأت الرحلة الآن 🚀 Début du voyage ✨' },
  { name: 'Code', text: 'const flow = (text) => text.split("").map(ch => ch.charCodeAt(0)).reduce((a, b) => a ^ b, 0)' },
  { name: 'Zen', text: 'Breathe in clarity. Breathe out complexity. The code writes itself when the mind is still.' },
  { name: 'Glitch', text: 'ERR0R::cascade//overflow ██ fragments.lost ░░ rebui1ding.from" ashes ▓▓ signal::found' },
]

PRESETS.forEach(p => {
  const btn = document.createElement('button')
  btn.textContent = p.name
  btn.onclick = () => { textInput.value = p.text }
  presetsEl.appendChild(btn)
})

// --- Shape functions: return width for a given line index ---
function getLineWidth(shape, i, total, base, t) {
  const norm = total > 1 ? i / (total - 1) : 0.5
  switch (shape) {
    case 'sine': return base * (0.5 + 0.4 * Math.sin(norm * Math.PI * 2 + t))
    case 'funnel': return base * (0.3 + 0.7 * norm)
    case 'diamond': return base * (0.3 + 0.7 * (1 - Math.abs(norm * 2 - 1)))
    case 'heartbeat': return base * (0.4 + 0.5 * Math.abs(Math.sin(norm * Math.PI * 4 + t)))
    default: return base
  }
}

// --- Color functions ---
function hsl(h, s, l) { return `hsl(${h}, ${s}%, ${l}%)` }

function getLineColor(mode, i, total, widthRatio) {
  const norm = total > 1 ? i / (total - 1) : 0.5
  switch (mode) {
    case 'gradient': return hsl(260 + widthRatio * 60, 70, 50 + widthRatio * 30)
    case 'rainbow': return hsl(norm * 360, 80, 65)
    case 'thermal': return hsl(widthRatio * 60, 90, 40 + widthRatio * 30)
    case 'mono': return hsl(260, 10, 60 + widthRatio * 25)
    default: return '#e2e8f0'
  }
}

// --- Layout + Render ---
function render(timestamp) {
  if (!playing && lastFrame) {
    requestAnimationFrame(render)
    return
  }

  const dt = lastFrame ? (timestamp - lastFrame) / 1000 : 0
  lastFrame = timestamp
  const speed = parseFloat(speedInput.value)
  time += dt * speed

  const dpr = window.devicePixelRatio || 1
  const wrap = canvas.parentElement
  const W = wrap.clientWidth
  const H = wrap.clientHeight
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = W + 'px'
  canvas.style.height = H + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  ctx.clearRect(0, 0, W, H)

  const text = textInput.value
  const fontFamily = fontSelect.value
  const fontSize = parseInt(fontSizeInput.value) || 28
  const font = `${fontSize}px "${fontFamily}"`
  const lhMult = parseFloat(lhInput.value)
  const lineH = Math.round(fontSize * lhMult)
  const shape = shapeSelect.value
  const colorMode = colorSelect.value
  const baseWidth = W * 0.75

  let prepared
  try {
    prepared = prepareWithSegments(text, font)
  } catch { requestAnimationFrame(render); return }

  // First pass: collect all lines to know total count
  const lines = []
  let cursor = { segmentIndex: 0, graphemeIndex: 0 }
  // Estimate max lines to prevent infinite loop
  const maxLines = Math.ceil(H / lineH) + 5
  for (let i = 0; i < maxLines; i++) {
    const w = getLineWidth(shape, i, maxLines, baseWidth, time)
    const line = layoutNextLine(prepared, cursor, Math.max(w, 40))
    if (!line) break
    lines.push({ ...line, usedWidth: w })
    cursor = line.end
  }

  // Center vertically
  const totalH = lines.length * lineH
  const startY = Math.max((H - totalH) / 2, 20)

  // Draw
  ctx.textBaseline = 'top'
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const w = line.usedWidth
    const widthRatio = w / baseWidth
    const x = (W - w) / 2 // center each line

    ctx.font = font
    ctx.fillStyle = getLineColor(colorMode, i, lines.length, widthRatio)

    // Subtle glow for wider lines
    if (colorMode !== 'mono') {
      ctx.shadowColor = ctx.fillStyle
      ctx.shadowBlur = widthRatio * 8
    } else {
      ctx.shadowBlur = 0
    }

    ctx.fillText(line.text, x, startY + i * lineH)
  }
  ctx.shadowBlur = 0

  // Draw shape guide (subtle)
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.08)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let i = 0; i < lines.length; i++) {
    const w = getLineWidth(shape, i, lines.length, baseWidth, time)
    const xL = (W - w) / 2
    const y = startY + i * lineH + lineH / 2
    if (i === 0) { ctx.moveTo(xL, y) } else { ctx.lineTo(xL, y) }
  }
  ctx.stroke()
  ctx.beginPath()
  for (let i = 0; i < lines.length; i++) {
    const w = getLineWidth(shape, i, lines.length, baseWidth, time)
    const xR = (W + w) / 2
    const y = startY + i * lineH + lineH / 2
    if (i === 0) { ctx.moveTo(xR, y) } else { ctx.lineTo(xR, y) }
  }
  ctx.stroke()

  // FPS
  if (dt > 0) fpsEl.textContent = `${Math.round(1 / dt)} fps`

  requestAnimationFrame(render)
}

// --- Controls ---
playBtn.onclick = () => {
  playing = !playing
  playBtn.textContent = playing ? '⏸ Pause' : '▶ Play'
  playBtn.classList.toggle('paused', !playing)
}

saveBtn.onclick = () => {
  const link = document.createElement('a')
  link.download = 'glyphflow.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

speedInput.oninput = () => { document.getElementById('speedVal').textContent = parseFloat(speedInput.value).toFixed(1) }
lhInput.oninput = () => { document.getElementById('lhVal').textContent = parseFloat(lhInput.value).toFixed(1) }

// --- Start ---
document.fonts.ready.then(() => requestAnimationFrame(render))
