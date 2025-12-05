import { useThrottleFn } from '@vueuse/core'
import { ref } from 'vue'
let canvasPlain: HTMLCanvasElement, canvasAug: HTMLCanvasElement
let ctxPlain: CanvasRenderingContext2D, ctxAug: CanvasRenderingContext2D
let pendingBuffer: ArrayBuffer = null
let decoding: boolean = false
const blurredbackgroundTimeout = ref(500)

// Stats
let framesPlain = 0,
  framesAug = 0,
  dropped = 0
let lastReport = performance.now()
let decodeTimes = [] // ms per frame

self.onmessage = async (ev: MessageEvent) => {
  if (ev.data.type === 'init') {
    canvasPlain = ev.data.canvases.plain
    canvasAug = ev.data.canvases.aug

    ctxPlain = canvasPlain.getContext('2d', { alpha: false })
    ctxAug = canvasAug.getContext('2d', { alpha: false })

    blurredbackgroundTimeout.value = ev.data.blurredbackgroundHighFramerate === true ? 50 : 300
  } else if (ev.data.type === 'frame') {
    if (pendingBuffer) dropped++

    pendingBuffer = ev.data.payload

    pump()
  }
}

const updateCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: ImageBitmap) => {
  if (canvas.width != img.width || canvas.height != img.height) {
    canvas.width = img.width
    canvas.height = img.height
  }

  ctx.drawImage(img, 0, 0)
}

const throttledUpdateCanvas = useThrottleFn((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: ImageBitmap) => {
  updateCanvas(canvas, ctx, img)
}, blurredbackgroundTimeout)

async function pump() {
  if (decoding || !pendingBuffer) return

  const buf = pendingBuffer
  pendingBuffer = null
  decoding = true

  try {
    const blob = new Blob([buf], { type: 'image/jpeg' })

    const t0 = performance.now()
    const bitmap = await createImageBitmap(blob)
    const t1 = performance.now()
    decodeTimes.push(t1 - t0)

    updateCanvas(canvasPlain, ctxPlain, bitmap)
    framesPlain++
    throttledUpdateCanvas(canvasAug, ctxAug, bitmap)
    framesAug++

    bitmap.close()
  } catch (e) {
    console.error('Decode error:', e)
  } finally {
    decoding = false
    reportStats()
  }
}

function reportStats() {
  const now = performance.now()
  if (now - lastReport >= 1000) {
    // once per second
    const fpsPlain = framesPlain
    const fpsAug = framesAug
    const avgDecode = decodeTimes.length ? decodeTimes.reduce((a, b) => a + b, 0) / decodeTimes.length : 0

    self.postMessage({
      type: 'stats',
      fpsPlain,
      fpsAug,
      dropped,
      avgDecode: avgDecode.toFixed(1), // ms
    })

    framesPlain = framesAug = dropped = 0
    decodeTimes = []
    lastReport = now
  }
}
