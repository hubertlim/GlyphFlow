import { prepare, layout, prepareWithSegments, layoutWithLines, walkLineRanges } from '@chenglou/pretext'

const FONT = '16px Inter'
const LINE_HEIGHT = 24

// --- Demo 1: Height measurement ---
function runDemo1() {
  const text = document.getElementById('d1text').value
  const maxWidth = +document.getElementById('d1width').value
  document.getElementById('d1widthVal').textContent = maxWidth

  const prepared = prepare(text, FONT)
  const { height, lineCount } = layout(prepared, maxWidth, LINE_HEIGHT)

  document.getElementById('d1height').textContent = height.toFixed(1)
  document.getElementById('d1lines').textContent = lineCount
}

document.getElementById('d1width').addEventListener('input', runDemo1)
document.getElementById('d1text').addEventListener('input', runDemo1)

// --- Demo 2: Canvas rendering ---
function runDemo2() {
  const text = document.getElementById('d2text').value
  const maxWidth = +document.getElementById('d2width').value
  document.getElementById('d2widthVal').textContent = maxWidth

  const canvas = document.getElementById('d2canvas')
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1

  const prepared = prepareWithSegments(text, FONT)
  const { lines } = layoutWithLines(prepared, maxWidth, LINE_HEIGHT)

  const canvasH = Math.max(lines.length * LINE_HEIGHT + 16, 80)
  canvas.width = canvas.clientWidth * dpr
  canvas.height = canvasH * dpr
  canvas.style.height = canvasH + 'px'
  ctx.scale(dpr, dpr)

  ctx.clearRect(0, 0, canvas.clientWidth, canvasH)
  ctx.font = FONT
  ctx.fillStyle = '#e2e8f0'

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i].text, 8, 20 + i * LINE_HEIGHT)
  }

  // Draw width boundary line
  ctx.strokeStyle = '#38bdf833'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(maxWidth + 8, 0)
  ctx.lineTo(maxWidth + 8, canvasH)
  ctx.stroke()
}

document.getElementById('d2width').addEventListener('input', runDemo2)
document.getElementById('d2text').addEventListener('input', runDemo2)

// --- Demo 3: Shrink-wrap ---
function runDemo3() {
  const text = document.getElementById('d3text').value
  const maxWidth = +document.getElementById('d3width').value
  document.getElementById('d3widthVal').textContent = maxWidth

  const prepared = prepareWithSegments(text, FONT)

  // Find the tightest width: walk lines and find the widest one
  let shrinkWidth = 0
  walkLineRanges(prepared, maxWidth, (line) => {
    if (line.width > shrinkWidth) shrinkWidth = line.width
  })

  const { lines } = layoutWithLines(prepared, maxWidth, LINE_HEIGHT)

  document.getElementById('d3shrink').textContent = shrinkWidth.toFixed(1)
  document.getElementById('d3lines').textContent = lines.length

  // Render with shrink-wrap boundary
  const canvas = document.getElementById('d3canvas')
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1

  const canvasH = Math.max(lines.length * LINE_HEIGHT + 16, 80)
  canvas.width = canvas.clientWidth * dpr
  canvas.height = canvasH * dpr
  canvas.style.height = canvasH + 'px'
  ctx.scale(dpr, dpr)

  ctx.clearRect(0, 0, canvas.clientWidth, canvasH)
  ctx.font = FONT
  ctx.fillStyle = '#e2e8f0'

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i].text, 8, 20 + i * LINE_HEIGHT)
  }

  // Shrink-wrap boundary (green)
  ctx.strokeStyle = '#4ade80'
  ctx.setLineDash([])
  ctx.lineWidth = 2
  ctx.strokeRect(4, 2, shrinkWidth + 8, lines.length * LINE_HEIGHT + 8)

  // Max-width boundary (blue, dashed)
  ctx.strokeStyle = '#38bdf833'
  ctx.setLineDash([4, 4])
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(maxWidth + 8, 0)
  ctx.lineTo(maxWidth + 8, canvasH)
  ctx.stroke()
}

document.getElementById('d3width').addEventListener('input', runDemo3)
document.getElementById('d3text').addEventListener('input', runDemo3)

// Wait for Inter font to load, then run all demos
document.fonts.ready.then(() => {
  runDemo1()
  runDemo2()
  runDemo3()
})
