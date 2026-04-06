import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext'

// --- State ---
let playing = true
let time = 0
let lastFrame = 0
let currentShape = null
let prevShapeWidths = null
let shapeTransitionStart = 0
const SHAPE_TRANSITION_MS = 500

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
const themesEl = document.getElementById('themes')

// --- Themes (preset combinations) ---
const THEMES = [
  { name: 'Midnight', shape: 'sine', color: 'ocean', font: 'Inter', size: 28, speed: 0.8, lh: 1.4, text: 'Drifting through the deep blue silence where light bends and time dissolves into the current' },
  { name: 'Cyberpunk', shape: 'zigzag', color: 'cyberpunk', font: 'JetBrains Mono', size: 22, speed: 1.5, lh: 1.3, text: 'ERR0R::cascade//overflow ██ fragments.lost ░░ rebui1ding.from" ashes ▓▓ signal::found' },
  { name: 'Sunset', shape: 'diamond', color: 'sunset', font: 'Playfair Display', size: 32, speed: 0.6, lh: 1.5, text: 'The horizon burns amber and gold as the last light paints the clouds in fire and memory' },
  { name: 'Matrix', shape: 'collapse', color: 'forest', font: 'JetBrains Mono', size: 20, speed: 1.2, lh: 1.2, text: 'const reality = decode(stream).filter(signal => signal.truth > threshold).map(awaken)' },
  { name: 'Neon City', shape: 'heartbeat', color: 'neon', font: 'Inter', size: 26, speed: 1.8, lh: 1.4, text: 'Neon signs flicker above rain-slicked streets where every shadow hides a story waiting to be told' },
  { name: 'Zen Garden', shape: 'spiral', color: 'mono', font: 'Playfair Display', size: 30, speed: 0.4, lh: 1.6, text: 'Breathe in clarity. Breathe out complexity. The code writes itself when the mind is still.' },
  { name: 'Retro Wave', shape: 'staircase', color: 'thermal', font: 'Inter', size: 24, speed: 1.0, lh: 1.3, text: 'Synthesizers hum beneath a grid of infinite purple horizons where the bass never drops' },
  { name: 'Polyglot', shape: 'hourglass', color: 'rainbow', font: 'Inter', size: 26, speed: 0.7, lh: 1.4, text: 'Hello world. 春天到了、桜が咲いた。بدأت الرحلة الآن 🚀 Début du voyage ✨' },
]

function applyTheme(t) {
  textInput.value = t.text
  fontSelect.value = t.font
  fontSizeInput.value = t.size
  shapeSelect.value = t.shape
  colorSelect.value = t.color
  speedInput.value = t.speed
  lhInput.value = t.lh
  document.getElementById('speedVal').textContent = t.speed.toFixed(1)
  document.getElementById('lhVal').textContent = t.lh.toFixed(1)
}

THEMES.forEach(t => {
  const btn = document.createElement('button')
  btn.textContent = t.name
  btn.onclick = () => applyTheme(t)
  themesEl.appendChild(btn)
})

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
    case 'zigzag': return base * (0.4 + 0.5 * (i % 2 === 0 ? norm : 1 - norm))
    case 'spiral': return base * (0.3 + 0.6 * (0.5 + 0.5 * Math.sin(norm * Math.PI * 6 + t)) * norm)
    case 'collapse': {
      const wave = Math.sin(norm * Math.PI * 3 + t * 2)
      const decay = 1 - norm * 0.6
      return base * (0.3 + 0.6 * (0.5 + 0.5 * wave) * decay)
    }
    case 'hourglass': {
      const mid = Math.abs(norm - 0.5) * 2 // 1 at edges, 0 at center
      return base * (0.3 + 0.65 * mid)
    }
    case 'staircase': {
      const steps = 5
      const step = Math.floor(norm * steps) / steps
      const bounce = 0.5 + 0.5 * Math.sin(t + step * Math.PI * 2)
      return base * (0.35 + 0.55 * bounce)
    }
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
    case 'ocean': return hsl(190 + norm * 40, 70, 35 + widthRatio * 35)
    case 'neon': {
      const colors = [320, 280, 180, 60, 320] // pink → purple → cyan → yellow → pink
      const idx = norm * (colors.length - 1)
      const lo = Math.floor(idx), hi = Math.min(lo + 1, colors.length - 1)
      const frac = idx - lo
      return hsl(colors[lo] + (colors[hi] - colors[lo]) * frac, 100, 55 + widthRatio * 15)
    }
    case 'sunset': return hsl(20 + norm * 30, 85, 45 + widthRatio * 25)
    case 'forest': return hsl(100 + norm * 60, 60, 30 + widthRatio * 35)
    case 'cyberpunk': {
      const flicker = Math.sin(i * 2.5) > 0 ? 300 : 180 // magenta / cyan alternation
      return hsl(flicker, 100, 50 + widthRatio * 20)
    }
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
  const colorMode = colorSelect.value
  const breathe = 1 + 0.06 * Math.sin(time * 0.8) // breathing pulse
  const baseWidth = W * 0.75 * breathe

  let prepared
  try {
    prepared = prepareWithSegments(text, font)
  } catch { requestAnimationFrame(render); return }

  // Detect shape change for smooth transition
  const shape = shapeSelect.value
  if (shape !== currentShape) {
    // Capture current widths as prev before switching
    if (currentShape !== null) {
      prevShapeWidths = []
      const maxEst = Math.ceil(H / lineH) + 5
      for (let i = 0; i < maxEst; i++) {
        prevShapeWidths.push(getLineWidth(currentShape, i, maxEst, baseWidth, time))
      }
      shapeTransitionStart = timestamp
    }
    currentShape = shape
  }

  const transitionProgress = Math.min(1, (timestamp - shapeTransitionStart) / SHAPE_TRANSITION_MS)
  const eased = transitionProgress < 1 ? transitionProgress * (2 - transitionProgress) : 1 // ease-out

  // First pass: collect all lines to know total count
  const lines = []
  let cursor = { segmentIndex: 0, graphemeIndex: 0 }
  const maxLines = Math.ceil(H / lineH) + 5
  for (let i = 0; i < maxLines; i++) {
    let w = getLineWidth(shape, i, maxLines, baseWidth, time)
    // Smooth transition from previous shape
    if (prevShapeWidths && eased < 1 && i < prevShapeWidths.length) {
      w = prevShapeWidths[i] + (w - prevShapeWidths[i]) * eased
    }
    const line = layoutNextLine(prepared, cursor, Math.max(w, 40))
    if (!line) break
    lines.push({ ...line, usedWidth: w })
    cursor = line.end
  }

  // Clear transition state when done
  if (eased >= 1) prevShapeWidths = null

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

    // Depth opacity — narrower lines fade slightly
    ctx.globalAlpha = 0.45 + 0.55 * widthRatio

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
  ctx.globalAlpha = 1

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
  playBtn.querySelector('span').textContent = playing ? 'Pause' : 'Play'
  playBtn.querySelector('svg').innerHTML = playing
    ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
    : '<polygon points="5,3 19,12 5,21"/>'
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
