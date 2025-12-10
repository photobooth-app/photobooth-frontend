import { useThrottleFn } from '@vueuse/core'
import { ref } from 'vue'

let canvasStream: HTMLCanvasElement, canvasBlurred: HTMLCanvasElement
let ctxStream: CanvasRenderingContext2D, ctxBlurred: CanvasRenderingContext2D
let pendingBuffer: ArrayBuffer = null // store received img in buffer
const blurredbackgroundTimeout = ref(500)

// Overlay PNG
let overlayUrl: string | null = null
let overlayBitmap: ImageBitmap | null = null
let overlayBox = null

// Stats
let framesStream = 0,
  framesBlurred = 0,
  framesDropped = 0
let lastReport = performance.now()
let decodeTimes: number[] = []

self.onmessage = async (ev: MessageEvent) => {
  if (ev.data.type === 'init') {
    canvasStream = ev.data.canvases.stream
    canvasBlurred = ev.data.canvases.blurred

    ctxStream = canvasStream.getContext('2d', { alpha: true })
    ctxBlurred = canvasBlurred.getContext('2d', { alpha: true })

    blurredbackgroundTimeout.value = ev.data.blurredbackgroundHighFramerate === true ? 50 : 300
  } else if (ev.data.type === 'frame') {
    if (pendingBuffer) framesDropped++
    pendingBuffer = ev.data.payload
    drawCanvas()
  } else if (ev.data.type === 'overlay') {
    // set overlay PNG URL
    overlayUrl = ev.data.url
    console.log(overlayUrl)
    if (overlayUrl) {
      loadOverlay(overlayUrl)
    } else {
      overlayBitmap = null
    }
  }
}

const updateCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: ImageBitmap) => {
  const cW = overlayBitmap ? overlayBitmap.width : img.width
  const cH = overlayBitmap ? overlayBitmap.height : img.height

  if (canvas.width !== cW || canvas.height !== cH) {
    canvas.width = cW
    canvas.height = cH
    console.log(`set canvas size to ${cW}x${cH}`)
  }

  if (overlayBitmap && overlayBox) {
    const { drawW, drawH, offsetX, offsetY } = fitCover(img.width, img.height, overlayBox.w, overlayBox.h)

    ctx.drawImage(img, overlayBox.x + offsetX, overlayBox.y + offsetY, drawW, drawH)
    ctx.drawImage(overlayBitmap, 0, 0) // overlay on top

    // Debug rectangle: outline the bounding box
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2
    ctx.strokeRect(overlayBox.x, overlayBox.y, overlayBox.w, overlayBox.h)
  } else {
    ctx.drawImage(img, 0, 0)
  }
}

const throttledUpdateCanvas = useThrottleFn((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: ImageBitmap) => {
  updateCanvas(canvas, ctx, img)
  framesBlurred++
}, blurredbackgroundTimeout)

async function drawCanvas() {
  if (!pendingBuffer) return

  // local copy because the throttledupdate might be inavail when the throttled function triggers.
  const buf = pendingBuffer

  try {
    const t0 = performance.now()
    // await new Promise((r) => setTimeout(r, 2000))

    const blob = new Blob([buf], { type: 'image/jpeg' })
    const bitmap = await createImageBitmap(blob)

    updateCanvas(canvasStream, ctxStream, bitmap)
    framesStream++

    throttledUpdateCanvas(canvasBlurred, ctxBlurred, bitmap)

    bitmap.close()

    const t1 = performance.now()
    decodeTimes.push(t1 - t0)
  } catch (e) {
    console.error(e)
    console.error('Decode error:', e)
  } finally {
    // reset pendingBuffer to null to signal ready for next frame
    pendingBuffer = null
    reportStats()
  }
}

async function loadOverlay(url: string) {
  const t0 = performance.now()
  let t1
  try {
    const resp = await fetch(url)
    const blob = await resp.blob()
    overlayBitmap = await createImageBitmap(blob)
    t1 = performance.now()
    overlayBox = await computeTransparentBoundingBox(overlayBitmap)
  } catch (e) {
    console.error('Overlay load error:', e)
    overlayBitmap = null
  }

  const te = performance.now()
  console.log('load overlay took ', (t1 - t0).toFixed(1), 'ms and calc transparency box ', overlayBox, ' took ', (te - t1).toFixed(1), 'ms')
}

function fitCover(srcW: number, srcH: number, boxW: number, boxH: number) {
  const scale = Math.max(boxW / srcW, boxH / srcH)
  const drawW = srcW * scale
  const drawH = srcH * scale
  const offsetX = (boxW - drawW) / 2
  const offsetY = (boxH - drawH) / 2
  return { drawW, drawH, offsetX, offsetY }
}

async function computeTransparentBoundingBox(bitmap: ImageBitmap, scale = 5): Promise<{ x: number; y: number; w: number; h: number }> {
  // algorithm scales down the image and returns the coarse bounding box which is usually fine for preview and sufficiently fast in the 5-20ms range

  // --- Step 1: Coarse pass ---
  const dsWidth = Math.ceil(bitmap.width / scale)
  const dsHeight = Math.ceil(bitmap.height / scale)

  // will not read frequently but will read at least once. if not set, the context is placed in the GPU and copy times are longer.
  const dsCtx = new OffscreenCanvas(dsWidth, dsHeight).getContext('2d', { willReadFrequently: true })!
  dsCtx.drawImage(bitmap, 0, 0, dsWidth, dsHeight)
  const dsData = dsCtx.getImageData(0, 0, dsWidth, dsHeight).data

  let minX = dsWidth,
    minY = dsHeight,
    maxX = -1,
    maxY = -1

  for (let y = 0; y < dsHeight; y++) {
    for (let x = 0; x < dsWidth; x++) {
      const alpha = dsData[(y * dsWidth + x) * 4 + 3]
      if (alpha < 128) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  // --- Step 2: Refine pass ---
  // We skip this pass because it is costly and not needed for the frontend. It will be okay if it is /scale exact for previews.

  return {
    x: minX * scale,
    y: minY * scale,
    w: (maxX - minX + 1) * scale,
    h: (maxY - minY + 1) * scale,
  }
}

function reportStats() {
  const now = performance.now()
  if (now - lastReport >= 1000) {
    const fpsPlain = framesStream
    const fpsAug = framesBlurred
    const avgDecode = decodeTimes.length ? decodeTimes.reduce((a, b) => a + b, 0) / decodeTimes.length : 0

    self.postMessage({
      type: 'stats',
      fpsPlain,
      fpsAug,
      dropped: framesDropped,
      avgDecode: avgDecode.toFixed(1),
    })

    framesStream = framesBlurred = framesDropped = 0
    decodeTimes = []
    lastReport = now
  }
}
