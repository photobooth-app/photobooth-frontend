interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

interface Overlay {
  bitmap: ImageBitmap | null
  transparent_bbox: BoundingBox | null
}

let canvasStream: HTMLCanvasElement, canvasBlurred: HTMLCanvasElement
let ctxStream: CanvasRenderingContext2D, ctxBlurred: CanvasRenderingContext2D
const offscreenComputeCanvas = { canvas: null as OffscreenCanvas | null, ctx: null as OffscreenCanvasRenderingContext2D | null }

let isDrawing = false
let overlay: Overlay | null = null
let enableBlurredBackgroundStream: boolean = false
let enableMirrorEffectStream: boolean = false
let enableMirrorEffectFrame: boolean = false
let droppedFrameCount: number = 0
let lastLog = performance.now()
let lastBlurUpdate = 0 // track last blurred update timestamp
let blurInterval = 300 // ms

self.onmessage = async (ev: MessageEvent) => {
  if (ev.data.type === 'init') {
    enableMirrorEffectStream = ev.data.enableMirrorEffectStream
    enableMirrorEffectFrame = ev.data.enableMirrorEffectFrame
    blurInterval = ev.data.blurredbackgroundHighFramerate ? 50 : 300

    canvasStream = ev.data.canvases.stream
    ctxStream = canvasStream.getContext('2d', { alpha: false })

    enableBlurredBackgroundStream = ev.data.enableBlurredBackgroundStream
    canvasBlurred = ev.data.canvases.blurred
    ctxBlurred = canvasBlurred.getContext('2d', { alpha: false })
  } else if (ev.data.type === 'frame') {
    if (isDrawing) {
      droppedFrameCount++
      return
    }

    drawCanvas(ev.data.payload)
  } else if (ev.data.type === 'overlay') {
    console.log('update overlay to:', ev.data.url)

    // Release previous overlay bitmap
    if (overlay?.bitmap) overlay.bitmap.close()

    if (ev.data.url) {
      overlay = await loadOverlay(ev.data.url)
    } else {
      overlay = null
    }
  }
}

const updateCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: ImageBitmap) => {
  const cW = overlay ? overlay.bitmap.width : img.width
  const cH = overlay ? overlay.bitmap.height : img.height

  if (canvas.width !== cW || canvas.height !== cH) {
    canvas.width = cW
    canvas.height = cH
    console.log(`set canvas size to ${cW}x${cH}`)
  }

  if (overlay) {
    const { drawW, drawH, offsetX, offsetY } = fitCover(img.width, img.height, overlay.transparent_bbox.width, overlay.transparent_bbox.height)

    // stream image at specific position if overlay enabled
    if (enableMirrorEffectStream) ctx.setTransform(-1, 0, 0, 1, canvas.width, 0)
    else ctx.resetTransform()
    ctx.drawImage(img, overlay.transparent_bbox.x + offsetX, overlay.transparent_bbox.y + offsetY, drawW, drawH)

    // overlay on top
    if (enableMirrorEffectFrame) ctx.setTransform(-1, 0, 0, 1, canvas.width, 0)
    else ctx.resetTransform()
    ctx.drawImage(overlay.bitmap, 0, 0)

    // Debug rectangle: outline the bounding box
    // ctx.strokeStyle = 'red'
    // ctx.lineWidth = 2
    // ctx.strokeRect(overlay.transparent_bbox.x, overlay.transparent_bbox.y, overlay.transparent_bbox.width, overlay.transparent_bbox.height)
  } else {
    // stream image fills canvas if no overlay enabled
    if (enableMirrorEffectStream) ctx.setTransform(-1, 0, 0, 1, canvas.width, 0)
    else ctx.resetTransform()
    ctx.drawImage(img, 0, 0)
  }
}

const updateCanvasLoresBlur = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: ImageBitmap) => {
  const cW = Math.ceil(img.width / 16)
  const cH = Math.ceil(img.height / 16)

  if (canvas.width !== cW || canvas.height !== cH) {
    canvas.width = cW
    canvas.height = cH
    console.log(`set canvas size to ${cW}x${cH}`)
  }

  if (enableMirrorEffectStream) ctx.setTransform(-1, 0, 0, 1, canvas.width, 0)
  else ctx.resetTransform()
  ctx.drawImage(img, 0, 0, cW, cH)
}

async function drawCanvas(buffer: ArrayBuffer) {
  isDrawing = true
  const buf = buffer
  const ts = performance.now()
  let bitmap
  // await new Promise((r) => setTimeout(r, 2000)) // emulate long processing - during the timeout, the frames should be dropped and afterwards just the latest img is presented.
  try {
    const blob = new Blob([buf], { type: 'image/jpeg' })
    bitmap = await createImageBitmap(blob)

    updateCanvas(canvasStream, ctxStream, bitmap)

    //only process if enabled to save cpu processing. the canvas is still passed on init for simplicity but hidden (not removed from DOM)
    if (enableBlurredBackgroundStream) {
      // only update blurred canvas if enough time has passed
      const now = performance.now()
      if (now - lastBlurUpdate >= blurInterval) {
        updateCanvasLoresBlur(canvasBlurred, ctxBlurred, bitmap)
        lastBlurUpdate = now
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    if (bitmap) bitmap.close()
    isDrawing = false
    const te = performance.now()
    const elapsed = te - ts

    // only log if at least 2000ms since last log
    if (te - lastLog >= 2000) {
      console.log('drawCanvas took', elapsed.toFixed(1), 'ms, droppedFrameCount is ', droppedFrameCount)
      lastLog = te
      droppedFrameCount = 0
    }
  }
}

async function loadOverlay(url: string): Promise<Overlay | null> {
  try {
    const t0 = performance.now()

    const resp = await fetch(url)
    const blob = await resp.blob()
    const overlayBitmap = await createImageBitmap(blob)
    const overlayTransparentBBox = await computeTransparentBoundingBox(overlayBitmap) // scaled down usually in the range of 5ms

    const te = performance.now()
    console.log('load overlay+calc transparency bbox took ', (te - t0).toFixed(1), 'ms, bbox is ', overlayTransparentBBox)

    return { bitmap: overlayBitmap, transparent_bbox: overlayTransparentBBox }
  } catch (e) {
    console.error('Overlay load error:', e)

    return null
  }
}

function fitCover(srcW: number, srcH: number, boxW: number, boxH: number) {
  const scale = Math.max(boxW / srcW, boxH / srcH)
  const drawW = srcW * scale
  const drawH = srcH * scale
  const offsetX = (boxW - drawW) / 2
  const offsetY = (boxH - drawH) / 2
  return { drawW, drawH, offsetX, offsetY }
}

function findBoundingBox(dsData: ImageDataArray, dsWidth: number, dsHeight: number) {
  let minX = dsWidth,
    minY = dsHeight,
    maxX = -1,
    maxY = -1

  // --- Scan top to find minY ---
  for (let y = 0; y < dsHeight; y++) {
    for (let x = 0; x < dsWidth; x++) {
      const alpha = dsData[(y * dsWidth + x) * 4 + 3]
      if (alpha < 255) {
        minY = y
        y = dsHeight // break outer loop
        break
      }
    }
  }

  // --- Scan bottom to find maxY ---
  for (let y = dsHeight - 1; y >= 0; y--) {
    for (let x = 0; x < dsWidth; x++) {
      const alpha = dsData[(y * dsWidth + x) * 4 + 3]
      if (alpha < 255) {
        maxY = y
        y = -1 // break outer loop
        break
      }
    }
  }

  // --- Scan left to find minX ---
  for (let x = 0; x < dsWidth; x++) {
    for (let y = minY; y <= maxY; y++) {
      const alpha = dsData[(y * dsWidth + x) * 4 + 3]
      if (alpha < 255) {
        minX = x
        x = dsWidth // break outer loop
        break
      }
    }
  }

  // --- Scan right to find maxX ---
  for (let x = dsWidth - 1; x >= 0; x--) {
    for (let y = minY; y <= maxY; y++) {
      const alpha = dsData[(y * dsWidth + x) * 4 + 3]
      if (alpha < 255) {
        maxX = x
        x = -1 // break outer loop
        break
      }
    }
  }

  return { minX, minY, maxX, maxY }
}

async function computeTransparentBoundingBox(bitmap: ImageBitmap, scale = 8): Promise<BoundingBox> {
  // algorithm scales down the image and returns the coarse bounding box which is usually fine for preview and sufficiently fast in the 5-20ms range

  // --- Step 1: Coarse pass ---
  const dsWidth = Math.ceil(bitmap.width / scale)
  const dsHeight = Math.ceil(bitmap.height / scale)

  const t1 = performance.now()

  // will not read frequently but will read at least once. if not set, the context is placed in the GPU and copy times are longer.

  if (!offscreenComputeCanvas.canvas) {
    offscreenComputeCanvas.canvas = new OffscreenCanvas(dsWidth, dsHeight)
    offscreenComputeCanvas.ctx = offscreenComputeCanvas.canvas.getContext('2d', { willReadFrequently: true, alpha: true })!
  } else if (offscreenComputeCanvas.canvas.width !== dsWidth || offscreenComputeCanvas.canvas.height !== dsHeight) {
    offscreenComputeCanvas.canvas.width = dsWidth
    offscreenComputeCanvas.canvas.height = dsHeight
  }

  // const dsCtx = new OffscreenCanvas(dsWidth, dsHeight).getContext('2d', { willReadFrequently: true, alpha: true })!
  offscreenComputeCanvas.ctx.drawImage(bitmap, 0, 0, dsWidth, dsHeight)
  const dsData = offscreenComputeCanvas.ctx.getImageData(0, 0, dsWidth, dsHeight).data

  const t2 = performance.now()

  const { minX, minY, maxX, maxY } = findBoundingBox(dsData, dsWidth, dsHeight)

  const t3 = performance.now()

  console.log('draw canvas for transparency detection took ', (t2 - t1).toFixed(1))
  console.log('detect transparent area took ', (t3 - t2).toFixed(1))

  // --- Step 2: Refine pass ---
  // We skip this pass because it is costly and not needed for the frontend. It will be okay if it is /scale exact for previews.

  return {
    x: minX * scale,
    y: minY * scale,
    width: (maxX - minX + 1) * scale,
    height: (maxY - minY + 1) * scale,
  }
}
