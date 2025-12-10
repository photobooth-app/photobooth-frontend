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
  let t1, t2, t3, t4, t5, t6

  try {
    const resp = await fetch(url)
    const blob = await resp.blob()
    overlayBitmap = await createImageBitmap(blob)
    t1 = performance.now()
    const overlayBox1 = await computeTransparentBoundingBoxSimple(overlayBitmap)
    t2 = performance.now()
    const overlayBox2 = await computeTransparentBoundingBoxU32(overlayBitmap)
    t3 = performance.now()
    const overlayBox3 = await computeTransparentBoundingBoxScaleRefine(overlayBitmap)
    t4 = performance.now()
    const overlayBox4 = await computeTransparentBoundingBoxScaleRefine2(overlayBitmap)
    t5 = performance.now()
    const overlayBox5 = await computeTransparentBoundingBoxScaleNorefine(overlayBitmap)
    t6 = performance.now()

    console.warn('computeTransparentBoundingBoxSimple area', overlayBox1, 'took ', (t2 - t1).toFixed(1))
    console.warn('computeTransparentBoundingBoxU32 area', overlayBox2, 'took ', (t3 - t2).toFixed(1))
    console.warn('computeTransparentBoundingBoxScaleRefine area', overlayBox3, 'took ', (t4 - t3).toFixed(1))
    console.warn('computeTransparentBoundingBoxScaleRefine2 area', overlayBox4, 'took ', (t5 - t4).toFixed(1))
    console.warn('computeTransparentBoundingBoxScaleNorefine area', overlayBox5, 'took ', (t6 - t5).toFixed(1))

    overlayBox = overlayBox5
  } catch (e) {
    console.error('Overlay load error:', e)
    overlayBitmap = null
  }

  const te = performance.now()
  console.log('load overlay took ', (t1 - t0).toFixed(1), 'ms and calc transparency took ', (te - t1).toFixed(1), 'ms')
}

function fitCover(srcW: number, srcH: number, boxW: number, boxH: number) {
  const scale = Math.max(boxW / srcW, boxH / srcH)
  const drawW = srcW * scale
  const drawH = srcH * scale
  const offsetX = (boxW - drawW) / 2
  const offsetY = (boxH - drawH) / 2
  return { drawW, drawH, offsetX, offsetY }
}

async function computeTransparentBoundingBoxSimple(bitmap: ImageBitmap): Promise<{ x: number; y: number; w: number; h: number }> {
  // 300ms, ~50ms is creating the canvas, rest the algo
  const tmpCanvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const tmpCtx = tmpCanvas.getContext('2d', { willReadFrequently: true })!
  tmpCtx.drawImage(bitmap, 0, 0)
  const imgData = tmpCtx.getImageData(0, 0, bitmap.width, bitmap.height).data

  let minX = bitmap.width,
    minY = bitmap.height,
    maxX = 0,
    maxY = 0
  for (let y = 0; y < bitmap.height; y++) {
    for (let x = 0; x < bitmap.width; x++) {
      const alpha = imgData[(y * bitmap.width + x) * 4 + 3]
      if (alpha < 128) {
        // transparent pixel
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
}

async function computeTransparentBoundingBoxU32(bitmap: ImageBitmap) {
  // ~50ms, most of it is just creating  the canvas.
  const { width, height } = bitmap
  const tmpCanvas = new OffscreenCanvas(width, height)
  const tmpCtx = tmpCanvas.getContext('2d', { willReadFrequently: true })!
  tmpCtx.drawImage(bitmap, 0, 0)
  const imgData = tmpCtx.getImageData(0, 0, width, height).data
  const u32 = new Uint32Array(imgData.buffer)

  let minX = width,
    minY = height,
    maxX = -1,
    maxY = -1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = (u32[y * width + x] >>> 24) & 0xff
      if (alpha < 128) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
}

async function computeTransparentBoundingBoxScaleRefine(bitmap: ImageBitmap, scale = 4, margin = 10) {
  const { width, height } = bitmap

  // --- Step 1: Coarse pass ---
  const dsWidth = Math.ceil(width / scale)
  const dsHeight = Math.ceil(height / scale)

  const dsCanvas = new OffscreenCanvas(dsWidth, dsHeight)
  const dsCtx = dsCanvas.getContext('2d', { willReadFrequently: true })!
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

  // Scale coarse box back to original coords
  const coarseX = minX * scale
  const coarseY = minY * scale
  const coarseW = (maxX - minX + 1) * scale
  const coarseH = (maxY - minY + 1) * scale

  // --- Step 2: Refine strips ---
  const ctx = new OffscreenCanvas(width, height).getContext('2d', { willReadFrequently: true })!
  // const ctx = new OffscreenCanvas(width, height).getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)

  function refineEdge(x: number, y: number, w: number, h: number, edge: 'top' | 'bottom' | 'left' | 'right') {
    const data = ctx.getImageData(x, y, w, h).data
    let refined = edge === 'top' || edge === 'left' ? Infinity : -Infinity

    if (edge === 'top' || edge === 'bottom') {
      for (let yy = 0; yy < h; yy++) {
        for (let xx = 0; xx < w; xx++) {
          const alpha = data[(yy * w + xx) * 4 + 3]
          if (alpha < 128) {
            const globalY = y + yy
            if (edge === 'top') refined = Math.min(refined, globalY)
            else refined = Math.max(refined, globalY)
          }
        }
      }
    } else {
      for (let yy = 0; yy < h; yy++) {
        for (let xx = 0; xx < w; xx++) {
          const alpha = data[(yy * w + xx) * 4 + 3]
          if (alpha < 128) {
            const globalX = x + xx
            if (edge === 'left') refined = Math.min(refined, globalX)
            else refined = Math.max(refined, globalX)
          }
        }
      }
    }
    return refined === Infinity || refined === -Infinity ? null : refined
  }

  const top = refineEdge(coarseX, Math.max(0, coarseY - margin), coarseW, margin * 2, 'top')
  const bottom = refineEdge(coarseX, Math.min(height - margin, coarseY + coarseH - margin), coarseW, margin * 2, 'bottom')
  const left = refineEdge(Math.max(0, coarseX - margin), coarseY, margin * 2, coarseH, 'left')
  const right = refineEdge(Math.min(width - margin, coarseX + coarseW - margin), coarseY, margin * 2, coarseH, 'right')

  return {
    x: left ?? coarseX,
    y: top ?? coarseY,
    w: (right ?? coarseX + coarseW) - (left ?? coarseX) + 1,
    h: (bottom ?? coarseY + coarseH) - (top ?? coarseY) + 1,
  }
}
async function computeTransparentBoundingBoxScaleRefine2(
  bitmap: ImageBitmap,
  scale = 8,
  margin = 50,
): Promise<{ x: number; y: number; w: number; h: number }> {
  const { width, height } = bitmap

  // --- Step 1: Coarse pass ---
  const dsWidth = Math.ceil(width / scale)
  const dsHeight = Math.ceil(height / scale)

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

  // Scale coarse box back to original coords
  const coarseX = minX * scale
  const coarseY = minY * scale
  const coarseW = (maxX - minX + 1) * scale
  const coarseH = (maxY - minY + 1) * scale

  // --- Step 2: Refine strips ---
  const ctx = new OffscreenCanvas(width, height).getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(bitmap, 0, 0)

  function refineEdge(x: number, y: number, w: number, h: number, axis: 'x' | 'y', mode: 'min' | 'max') {
    const data = ctx.getImageData(x, y, w, h).data
    let result = mode === 'min' ? Infinity : -Infinity

    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const alpha = data[(yy * w + xx) * 4 + 3]
        if (alpha < 128) {
          const globalCoord = axis === 'y' ? y + yy : x + xx
          result = mode === 'min' ? Math.min(result, globalCoord) : Math.max(result, globalCoord)
        }
      }
    }
    return result === Infinity || result === -Infinity ? null : result
  }

  const top = refineEdge(coarseX, Math.max(0, coarseY - margin), coarseW, margin * 2, 'y', 'min')
  const bottom = refineEdge(coarseX, Math.min(height - margin, coarseY + coarseH - margin), coarseW, margin * 2, 'y', 'max')
  const left = refineEdge(Math.max(0, coarseX - margin), coarseY, margin * 2, coarseH, 'x', 'min')
  const right = refineEdge(Math.min(width - margin, coarseX + coarseW - margin), coarseY, margin * 2, coarseH, 'x', 'max')

  return {
    x: left ?? coarseX,
    y: top ?? coarseY,
    w: (right ?? coarseX + coarseW) - (left ?? coarseX) + 1,
    h: (bottom ?? coarseY + coarseH) - (top ?? coarseY) + 1,
  }
}

async function computeTransparentBoundingBoxScaleNorefine(bitmap: ImageBitmap, scale = 4): Promise<{ x: number; y: number; w: number; h: number }> {
  const { width, height } = bitmap

  // --- Step 1: Coarse pass ---
  const dsWidth = Math.ceil(width / scale)
  const dsHeight = Math.ceil(height / scale)

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

  // Scale coarse box back to original coords
  const coarseX = minX * scale
  const coarseY = minY * scale
  const coarseW = (maxX - minX + 1) * scale
  const coarseH = (maxY - minY + 1) * scale

  // --- Step 2: Refine pass ---
  // We skip this pass because it is costly and not needed for the frontend. It will be okay if it is /scale exact for previews.

  return {
    x: coarseX,
    y: coarseY,
    w: coarseW,
    h: coarseH,
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
