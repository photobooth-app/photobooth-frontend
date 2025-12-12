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
let pendingBuffer: ArrayBuffer | null = null // store received img in buffer
let overlay: Overlay | null = null
let enableMirrorEffectStream: boolean = false
let enableMirrorEffectFrame: boolean = false
let lastLog = performance.now()

self.onmessage = async (ev: MessageEvent) => {
  if (ev.data.type === 'init') {
    canvasStream = ev.data.canvases.stream
    canvasBlurred = ev.data.canvases.blurred

    enableMirrorEffectStream = ev.data.enableMirrorEffectStream
    enableMirrorEffectFrame = ev.data.enableMirrorEffectFrame

    ctxStream = canvasStream.getContext('2d', { alpha: true })
    ctxBlurred = canvasBlurred.getContext('2d', { alpha: true })
  } else if (ev.data.type === 'frame') {
    if (pendingBuffer) console.log('frame dropped')
    pendingBuffer = ev.data.payload
    drawCanvas()
  } else if (ev.data.type === 'overlay') {
    // set overlay PNG URL
    console.log(ev.data.url)
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
  const cW = Math.ceil(img.width / 32)
  const cH = Math.ceil(img.height / 32)

  if (canvas.width !== cW || canvas.height !== cH) {
    canvas.width = cW
    canvas.height = cH
    console.log(`set canvas size to ${cW}x${cH}`)
  }

  if (enableMirrorEffectStream) ctx.setTransform(-1, 0, 0, 1, canvas.width, 0)
  else ctx.resetTransform()
  ctx.drawImage(img, 0, 0, cW, cH)
}

async function drawCanvas() {
  const buf = pendingBuffer
  pendingBuffer = null
  if (!buf) return
  const ts = performance.now()
  try {
    // await new Promise((r) => setTimeout(r, 2000))

    const blob = new Blob([buf], { type: 'image/jpeg' })
    const bitmap = await createImageBitmap(blob)

    updateCanvas(canvasStream, ctxStream, bitmap)
    updateCanvasLoresBlur(canvasBlurred, ctxBlurred, bitmap)

    bitmap.close()
  } catch (e) {
    console.error(e)
  } finally {
    const te = performance.now()
    const elapsed = te - ts

    // only log if at least 2000ms since last log
    if (te - lastLog >= 2000) {
      console.log('drawCanvas took', elapsed.toFixed(1), 'ms')
      lastLog = te
    }
  }
}

async function loadOverlay(url: string): Promise<Overlay> {
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

async function computeTransparentBoundingBox(bitmap: ImageBitmap, scale = 5): Promise<BoundingBox> {
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
    width: (maxX - minX + 1) * scale,
    height: (maxY - minY + 1) * scale,
  }
}
