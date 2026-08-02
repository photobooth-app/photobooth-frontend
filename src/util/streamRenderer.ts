type DrawStateOriginal = { mode: 'original' }
type DrawStateOverlay = { mode: 'overlay'; overlay: Overlay }
type DrawStateFixed = { mode: 'fixedSize'; fixedSize: Size2D }

type DrawStateUnion = DrawStateOriginal | DrawStateOverlay | DrawStateFixed

type WorkerMessageInit = {
  type: 'init'
  canvases: { stream: OffscreenCanvas; blurred: OffscreenCanvas }
  streamRendererImageDecoderMode: boolean
  enableMirrorEffectStream: boolean
  enableBlurredBackgroundStream: boolean
  blurredbackgroundHighFramerate: boolean
}
type WorkerMessageFrame = {
  type: 'frame'
  payload: Blob | ArrayBuffer
}
type WorkerMessageOverlay = {
  type: 'overlay'
  url: string
  mirror_effect: boolean
}
type WorkerMessageFixedSize = {
  type: 'fixedSize'
  fixedSize: Size2D
}
type WorkerMessageResetMode = {
  type: 'resetMode'
}
type WorkerMessageUnion = WorkerMessageInit | WorkerMessageFrame | WorkerMessageOverlay | WorkerMessageFixedSize | WorkerMessageResetMode

interface Vec2 {
  x: number
  y: number
}
interface Size2D {
  width: number
  height: number
}
interface Rect {
  x: number
  y: number
  width: number
  height: number
}
interface FitCoverResult {
  drawSize: Size2D
  offset: Vec2
}

interface Overlay {
  bitmap: ImageBitmap
  transparentBBox: Rect | null
  enableMirrorEffect: boolean
}

interface CanvasPair {
  canvas: OffscreenCanvas
  ctx: OffscreenCanvasRenderingContext2D
}

interface StreamConfig {
  enableBlurredBackgroundStream: boolean
  enableMirrorEffectStream: boolean
  blurInterval: number
  debugRectangleBbox: boolean
}

interface DrawState {
  isDrawing: boolean
  droppedFrameCount: number
  lastLog: number
  lastBlurUpdate: number
}

/* -------------------------
   Module-level helpers
   ------------------------- */

function fitCover(srcW: number, srcH: number, targetW: number, targetH: number): FitCoverResult {
  const scale = Math.max(targetW / srcW, targetH / srcH)
  const drawW = Math.round(srcW * scale)
  const drawH = Math.round(srcH * scale)

  const offsetX = Math.round((targetW - drawW) / 2)
  const offsetY = Math.round((targetH - drawH) / 2)

  return { drawSize: { width: drawW, height: drawH }, offset: { x: offsetX, y: offsetY } }
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

async function computeTransparentBoundingBox(bitmap: ImageBitmap, scale = 8): Promise<Rect> {
  // Coarse pass: scale down and detect transparent area
  // algorithm scales down the image and returns the coarse bounding box which is usually fine for preview and sufficiently fast in the 5-20ms range
  const dsWidth = Math.ceil(bitmap.width / scale)
  const dsHeight = Math.ceil(bitmap.height / scale)
  const computeCanvas = new OffscreenCanvas(dsWidth, dsHeight)
  // will not read frequently but will read at least once. if not set, the context is placed in the GPU and copy times are longer.
  const computeCtx = computeCanvas.getContext('2d', {
    willReadFrequently: true,
    alpha: true,
  })!

  computeCtx.drawImage(bitmap, 0, 0, dsWidth, dsHeight)
  const dsImage = computeCtx.getImageData(0, 0, dsWidth, dsHeight)

  const { minX, minY, maxX, maxY } = findBoundingBox(dsImage.data, dsWidth, dsHeight)

  // --- Step 2: Refine pass ---
  // We skip this pass because it is costly and not needed for the frontend. It will be okay if it is /scale exact for previews.

  return {
    x: minX * scale,
    y: minY * scale,
    width: (maxX - minX + 1) * scale,
    height: (maxY - minY + 1) * scale,
  }
}

function getDrawableSize(drawable: ImageBitmap | VideoFrame): Size2D {
  if ('codedWidth' in drawable) {
    // VideoFrame
    return {
      width: drawable.displayWidth ?? drawable.codedWidth,
      height: drawable.displayHeight ?? drawable.codedHeight,
    }
  } else {
    // ImageBitmap
    return { width: drawable.width, height: drawable.height }
  }
}

/* -------------------------
   Canvas update helpers
   ------------------------- */
function setCanvasSize(canvasPair: CanvasPair, canvasSize: Size2D) {
  if (canvasPair.canvas.width !== canvasSize.width || canvasPair.canvas.height !== canvasSize.height) {
    canvasPair.canvas.width = canvasSize.width
    canvasPair.canvas.height = canvasSize.height
    console.log(`set stream canvas size to ${canvasSize.width}x${canvasSize.height}`)
  }
}
function drawFrameModeOriginal(canvasPair: CanvasPair, img: ImageBitmap | VideoFrame, config: StreamConfig) {
  // stream image fills canvas if no overlay enabled
  const drawableSize = getDrawableSize(img)
  setCanvasSize(canvasPair, drawableSize)

  if (config.enableMirrorEffectStream) canvasPair.ctx.setTransform(-1, 0, 0, 1, canvasPair.canvas.width, 0)
  else canvasPair.ctx.resetTransform()

  canvasPair.ctx.drawImage(img, 0, 0)
}

function drawFrameModeFixedSize(canvasPair: CanvasPair, img: ImageBitmap | VideoFrame, fixedSize: Size2D, config: StreamConfig) {
  const drawableSize = getDrawableSize(img)
  setCanvasSize(canvasPair, fixedSize)

  const fitCoverRes = fitCover(drawableSize.width, drawableSize.height, fixedSize.width, fixedSize.height)

  if (config.enableMirrorEffectStream) canvasPair.ctx.setTransform(-1, 0, 0, 1, canvasPair.canvas.width, 0)
  else canvasPair.ctx.resetTransform()

  canvasPair.ctx.drawImage(img, fitCoverRes.offset.x, fitCoverRes.offset.y, fitCoverRes.drawSize.width, fitCoverRes.drawSize.height)
}

function drawFrameModeOverlay(canvasPair: CanvasPair, img: ImageBitmap | VideoFrame, overlay: Overlay, config: StreamConfig) {
  const ctx = canvasPair.ctx
  const canvas = canvasPair.canvas
  const overlayBitmapSize: Size2D = { width: overlay.bitmap.width, height: overlay.bitmap.height }

  setCanvasSize(canvasPair, overlayBitmapSize)

  if (!overlay.transparentBBox) {
    drawFrameModeOriginal(canvasPair, img, config)
    return
  }

  // 1) prepare coords, sizes, ...
  const drawableSize = getDrawableSize(img)
  const fit = fitCover(drawableSize.width, drawableSize.height, overlay.transparentBBox.width, overlay.transparentBBox.height)

  const baseX = overlay.transparentBBox.x + fit.offset.x
  const baseY = overlay.transparentBBox.y + fit.offset.y
  const drawW = fit.drawSize.width
  const drawH = fit.drawSize.height

  // 2) if overlay is mirrored, the stream position needs to be flipped also
  const streamPos: Vec2 = {
    x: overlay.enableMirrorEffect ? canvas.width - (baseX + drawW) : baseX,
    y: baseY,
  }

  // 3) draw stream (the draw position is already precomputed in 2) in case the overlay is flipped also)
  ctx.save()

  if (config.enableMirrorEffectStream) {
    // Spiegelung um die linke Kante des Stream-Bereichs
    ctx.translate(streamPos.x + drawW, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(img, 0, streamPos.y, drawW, drawH)
  } else {
    ctx.drawImage(img, streamPos.x, streamPos.y, drawW, drawH)
  }

  ctx.restore()

  // 4) draw overlay (flipped or not...)
  ctx.save()

  if (overlay.enableMirrorEffect) {
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
  }
  ctx.drawImage(overlay.bitmap, 0, 0)

  ctx.restore()

  // 6) debug rect only if enabled
  if (config.debugRectangleBbox) {
    ctx.save()
    ctx.resetTransform()

    // Stream-Bereich (grün)
    ctx.strokeStyle = 'green'
    ctx.lineWidth = 2
    ctx.strokeRect(streamPos.x, streamPos.y, drawW, drawH)

    ctx.restore()
  }
}

function updateCanvasLoresBlur(canvasPair: CanvasPair, img: ImageBitmap | VideoFrame, config: StreamConfig) {
  const drawableSize = getDrawableSize(img)
  const canvasSize: Size2D = { width: Math.ceil(drawableSize.width / 16), height: Math.ceil(drawableSize.height / 16) }

  setCanvasSize(canvasPair, canvasSize)

  canvasPair.ctx.save()

  if (config.enableMirrorEffectStream) {
    canvasPair.ctx.translate(canvasPair.canvas.width, 0)
    canvasPair.ctx.scale(-1, 1)
  }
  canvasPair.ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height)

  canvasPair.ctx.restore()
}

/* -------------------------
   StreamRenderer class
   ------------------------- */

class StreamRenderer {
  private streamCanvas: CanvasPair | null = null
  private blurredCanvas: CanvasPair | null = null
  private streamRendererImageDecoderMode: boolean = false
  private drawState: DrawStateUnion = { mode: 'original' }

  private config: StreamConfig = {
    enableBlurredBackgroundStream: false,
    enableMirrorEffectStream: false,
    blurInterval: 300,
    debugRectangleBbox: false,
  }

  private draw: DrawState = {
    isDrawing: false,
    droppedFrameCount: 0,
    lastLog: performance.now(),
    lastBlurUpdate: 0,
  }

  init(canvases: { stream: OffscreenCanvas; blurred: OffscreenCanvas }, streamRendererImageDecoderMode: boolean, opts: Partial<StreamConfig>) {
    this.streamCanvas = {
      canvas: canvases.stream,
      ctx: canvases.stream.getContext('2d', { alpha: false })!,
    }
    this.blurredCanvas = {
      canvas: canvases.blurred,
      ctx: canvases.blurred.getContext('2d', { alpha: false })!,
    }
    this.streamRendererImageDecoderMode = streamRendererImageDecoderMode
    Object.assign(this.config, opts)
    // ensure lastLog is fresh on init
    this.draw.lastLog = performance.now()
    this.draw.lastBlurUpdate = 0
    this.draw.droppedFrameCount = 0

    console.log('StreamRenderer initialized with config', this.config)
  }
  setDrawMode(state: DrawStateUnion) {
    // in case drawmode was overlay, we clear the bitmap first
    let oldImgbitmap: ImageBitmap | null = null

    if (this.drawState.mode == 'overlay') oldImgbitmap = this.drawState.overlay.bitmap

    this.drawState = state

    if (oldImgbitmap) {
      try {
        oldImgbitmap.close()
      } catch {
        /* empty */
      }
    }
  }

  async setOriginalMode() {
    this.setDrawMode({ mode: 'original' })
  }

  async setFixedSize(fixedSize: Size2D) {
    this.setDrawMode({ mode: 'fixedSize', fixedSize: fixedSize })
  }

  async setOverlay(url: string, mirrorEffect: boolean) {
    try {
      const t0 = performance.now()
      const resp = await fetch(url)
      if (!resp.ok) throw resp.statusText
      const blob = await resp.blob()
      const overlayBitmap = await createImageBitmap(blob)
      const overlayTransparentBBox = await computeTransparentBoundingBox(overlayBitmap)
      const te = performance.now()
      console.log('load overlay+calc transparency bbox took ', (te - t0).toFixed(1), 'ms, bbox is ', overlayTransparentBBox)

      const newOverlay: Overlay = { bitmap: overlayBitmap, transparentBBox: overlayTransparentBBox, enableMirrorEffect: mirrorEffect }

      this.setDrawMode({ mode: 'overlay', overlay: newOverlay })
    } catch (e) {
      console.error('updateOverlay error', e)
    }
  }

  async updateFrame(drawable: Blob | ArrayBuffer) {
    if (!this.streamCanvas) {
      console.warn('updateFrame called before init')
      return
    }

    //await new Promise((r) => setTimeout(r, 50)) // simulate slow rendering

    if (this.draw.isDrawing) {
      this.draw.droppedFrameCount++
      return
    }

    this.draw.isDrawing = true
    const ts = performance.now()
    let bitmap: ImageBitmap | VideoFrame | null = null

    try {
      if (this.streamRendererImageDecoderMode) {
        // Use ImageDecoder if supported (localhost and secure contexts only)
        const decoder = new ImageDecoder({
          data: drawable as ArrayBuffer,
          type: 'image/jpeg',
        })
        const result = await decoder.decode()
        bitmap = result.image
      } else {
        // Fallback to createImageBitmap
        bitmap = await createImageBitmap(drawable as Blob)
      }

      // update main canvas
      switch (this.drawState.mode) {
        case 'original':
          drawFrameModeOriginal(this.streamCanvas, bitmap, this.config)
          break

        case 'overlay':
          drawFrameModeOverlay(this.streamCanvas, bitmap, this.drawState.overlay, this.config)
          break

        case 'fixedSize':
          drawFrameModeFixedSize(this.streamCanvas, bitmap, this.drawState.fixedSize, this.config)
          break
      }

      // update blurred canvas if enabled and interval passed
      if (this.config.enableBlurredBackgroundStream && this.blurredCanvas) {
        const now = performance.now()

        if (now - this.draw.lastBlurUpdate >= this.config.blurInterval || this.draw.lastBlurUpdate == 0) {
          // check for lastBlurUpdate==0 because performance.now starts with the document load (start the worker)
          // so without the check the first blur update would delay until first time hitting the interval only.
          updateCanvasLoresBlur(this.blurredCanvas, bitmap, this.config)
          this.draw.lastBlurUpdate = now
        }
      }
    } catch (e) {
      console.error('updateFrame error', e)
    } finally {
      if (bitmap) {
        try {
          bitmap.close()
        } catch {
          // ignore
        }
      }
      this.draw.isDrawing = false
      const te = performance.now()
      const elapsed = te - ts

      if (te - this.draw.lastLog >= 2000 && this.draw.droppedFrameCount > 0) {
        console.log('updateFrame took', elapsed.toFixed(1), 'ms, droppedFrameCount is', this.draw.droppedFrameCount)
        this.draw.lastLog = te
        this.draw.droppedFrameCount = 0
      }
    }
  }

  // // Expose a small API for diagnostics if needed
  // getStats() {
  //   return {
  //     isDrawing: this.draw.isDrawing,
  //     droppedFrameCount: this.draw.droppedFrameCount,
  //     lastBlurUpdate: this.draw.lastBlurUpdate,
  //     lastLog: this.draw.lastLog,
  //   }
  // }
}

/* -------------------------
   Worker message handling
   ------------------------- */

const renderer = new StreamRenderer()

self.onmessage = async (ev: MessageEvent<WorkerMessageUnion>) => {
  const data = ev.data

  try {
    switch (data.type) {
      case 'init': {
        const opts: Partial<StreamConfig> = {
          enableMirrorEffectStream: data.enableMirrorEffectStream,
          enableBlurredBackgroundStream: data.enableBlurredBackgroundStream,
          blurInterval: data.blurredbackgroundHighFramerate ? 50 : 300,
        }

        renderer.init(data.canvases, data.streamRendererImageDecoderMode, opts)
        break
      }

      case 'frame': {
        await renderer.updateFrame(data.payload)
        break
      }

      case 'overlay': {
        console.log('setting overlay draw mode', data)
        await renderer.setOverlay(data.url, data.mirror_effect)
        break
      }

      case 'fixedSize': {
        console.log('setting fixedSize draw mode', data)
        await renderer.setFixedSize(data.fixedSize)
        break
      }

      case 'resetMode': {
        console.log('setting original draw mode')
        await renderer.setOriginalMode()
        break
      }

      default: {
        console.warn('unknown message', data)
        break
      }
    }

    // Always send ready after handling
    self.postMessage({ type: 'frame-finished' })
  } catch (e) {
    console.error('onmessage handler error', e)
  }
}

export type { Size2D }
