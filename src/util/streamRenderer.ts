interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

interface Overlay {
  bitmap: ImageBitmap | null
  transparentBBox: BoundingBox | null
}

interface CanvasPair {
  canvas: OffscreenCanvas
  ctx: OffscreenCanvasRenderingContext2D
}

interface StreamConfig {
  enableBlurredBackgroundStream: boolean
  enableMirrorEffectStream: boolean
  enableMirrorEffectFrame: boolean
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
  // Coarse pass: scale down and detect transparent area
  // algorithm scales down the image and returns the coarse bounding box which is usually fine for preview and sufficiently fast in the 5-20ms range
  const dsWidth = Math.ceil(bitmap.width / scale)
  const dsHeight = Math.ceil(bitmap.height / scale)
  const computeCanvas = new OffscreenCanvas(dsWidth, dsHeight)
  // will not read frequently but will read at least once. if not set, the context is placed in the GPU and copy times are longer.
  const computeCtx = computeCanvas.getContext('2d', { willReadFrequently: true, alpha: true })!

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

async function loadOverlay(url: string): Promise<Overlay> {
  const t0 = performance.now()
  const resp = await fetch(url)
  const blob = await resp.blob()
  const overlayBitmap = await createImageBitmap(blob)
  const overlayTransparentBBox = await computeTransparentBoundingBox(overlayBitmap)
  const te = performance.now()
  console.log('load overlay+calc transparency bbox took ', (te - t0).toFixed(1), 'ms, bbox is ', overlayTransparentBBox)
  return { bitmap: overlayBitmap, transparentBBox: overlayTransparentBBox }
}
function getDrawableSize(drawable: ImageBitmap | VideoFrame) {
  if ('codedWidth' in drawable) {
    // VideoFrame
    return { width: drawable.displayWidth ?? drawable.codedWidth, height: drawable.displayHeight ?? drawable.codedHeight }
  } else {
    // ImageBitmap
    return { width: drawable.width, height: drawable.height }
  }
}

/* -------------------------
   Canvas update helpers
   ------------------------- */

function updateCanvas(canvasPair: CanvasPair, img: ImageBitmap | VideoFrame, overlay: Overlay | null, config: StreamConfig) {
  const drawableSize = getDrawableSize(img)
  const cW = overlay && overlay.bitmap ? overlay.bitmap.width : drawableSize.width
  const cH = overlay && overlay.bitmap ? overlay.bitmap.height : drawableSize.height

  if (canvasPair.canvas.width !== cW || canvasPair.canvas.height !== cH) {
    canvasPair.canvas.width = cW
    canvasPair.canvas.height = cH
    console.log(`set stream canvas size to ${cW}x${cH}`)
  }

  if (overlay && overlay.bitmap && overlay.transparentBBox) {
    const { drawW, drawH, offsetX, offsetY } = fitCover(
      drawableSize.width,
      drawableSize.height,
      overlay.transparentBBox.width,
      overlay.transparentBBox.height,
    )

    // draw stream image into transparent bbox area
    if (config.enableMirrorEffectStream) canvasPair.ctx.setTransform(-1, 0, 0, 1, canvasPair.canvas.width, 0)
    else canvasPair.ctx.resetTransform()

    canvasPair.ctx.drawImage(img, overlay.transparentBBox.x + offsetX, overlay.transparentBBox.y + offsetY, drawW, drawH)

    // overlay on top
    if (config.enableMirrorEffectFrame) canvasPair.ctx.setTransform(-1, 0, 0, 1, canvasPair.canvas.width, 0)
    else canvasPair.ctx.resetTransform()

    canvasPair.ctx.drawImage(overlay.bitmap, 0, 0)

    // Debug rectangle: outline the bounding box
    if (config.debugRectangleBbox) {
      canvasPair.ctx.strokeStyle = 'red'
      canvasPair.ctx.lineWidth = 2
      canvasPair.ctx.strokeRect(overlay.transparentBBox.x, overlay.transparentBBox.y, overlay.transparentBBox.width, overlay.transparentBBox.height)
    }
  } else {
    // stream image fills canvas if no overlay enabled
    if (config.enableMirrorEffectStream) canvasPair.ctx.setTransform(-1, 0, 0, 1, canvasPair.canvas.width, 0)
    else canvasPair.ctx.resetTransform()

    canvasPair.ctx.drawImage(img, 0, 0)
  }
}

function updateCanvasLoresBlur(canvasPair: CanvasPair, img: ImageBitmap | VideoFrame, config: StreamConfig) {
  const drawableSize = getDrawableSize(img)
  const cW = Math.ceil(drawableSize.width / 16)
  const cH = Math.ceil(drawableSize.height / 16)

  if (canvasPair.canvas.width !== cW || canvasPair.canvas.height !== cH) {
    canvasPair.canvas.width = cW
    canvasPair.canvas.height = cH
    console.log(`set blur canvas size to ${cW}x${cH}`)
  }

  if (config.enableMirrorEffectStream) canvasPair.ctx.setTransform(-1, 0, 0, 1, canvasPair.canvas.width, 0)
  else canvasPair.ctx.resetTransform()
  canvasPair.ctx.drawImage(img, 0, 0, cW, cH)
}

/* -------------------------
   StreamRenderer class
   ------------------------- */

class StreamRenderer {
  private stream: CanvasPair | null = null
  private blurred: CanvasPair | null = null
  private currentOverlay: Overlay | null = null
  private streamRendererImageDecoderMode: boolean = false

  private config: StreamConfig = {
    enableBlurredBackgroundStream: false,
    enableMirrorEffectStream: false,
    enableMirrorEffectFrame: false,
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
    this.stream = { canvas: canvases.stream, ctx: canvases.stream.getContext('2d', { alpha: false })! }
    this.blurred = { canvas: canvases.blurred, ctx: canvases.blurred.getContext('2d', { alpha: false })! }
    this.streamRendererImageDecoderMode = streamRendererImageDecoderMode
    Object.assign(this.config, opts)
    // ensure lastLog is fresh on init
    this.draw.lastLog = performance.now()
    this.draw.lastBlurUpdate = 0
    this.draw.droppedFrameCount = 0

    console.log('StreamRenderer initialized with config', this.config)
  }

  async updateOverlay(url: string | null) {
    let newOverlay = null

    try {
      // start loading into nextOverlay
      if (url) {
        newOverlay = await loadOverlay(url)
      }
    } catch (e) {
      console.error('updateOverlay error', e)
    } finally {
      // swap: promote newOverlay to currentOverlay even in case the fetch failed.
      const oldOverlay = this.currentOverlay
      this.currentOverlay = newOverlay

      if (oldOverlay?.bitmap) {
        try {
          oldOverlay.bitmap.close()
        } catch {
          /* empty */
        }
      }
    }
  }

  async drawFrame(drawable: Blob | ArrayBuffer) {
    if (!this.stream) {
      console.warn('drawFrame called before init')
      return
    }

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
        const decoder = new ImageDecoder({ data: drawable as ArrayBuffer, type: 'image/jpeg' })
        const result = await decoder.decode()
        bitmap = result.image
      } else {
        // Fallback to createImageBitmap
        bitmap = await createImageBitmap(drawable as Blob)
      }

      // update main canvas
      updateCanvas(this.stream, bitmap, this.currentOverlay, this.config)

      // update blurred canvas if enabled and interval passed
      if (this.config.enableBlurredBackgroundStream && this.blurred) {
        const now = performance.now()

        if (now - this.draw.lastBlurUpdate >= this.config.blurInterval || this.draw.lastBlurUpdate == 0) {
          // check for lastBlurUpdate==0 because performance.now starts with the document load (start the worker)
          // so without the check the first blur update would delay until first time hitting the interval only.
          updateCanvasLoresBlur(this.blurred, bitmap, this.config)
          this.draw.lastBlurUpdate = now
        }
      }
    } catch (e) {
      console.error('drawFrame error', e)
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
        console.log('drawFrame took', elapsed.toFixed(1), 'ms, droppedFrameCount is', this.draw.droppedFrameCount)
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

self.onmessage = async (ev: MessageEvent) => {
  const data = ev.data
  try {
    if (data.type === 'init') {
      const canvases = data.canvases as { stream: OffscreenCanvas; blurred: OffscreenCanvas }
      const opts: Partial<StreamConfig> = {
        enableMirrorEffectStream: !!data.enableMirrorEffectStream,
        enableMirrorEffectFrame: !!data.enableMirrorEffectFrame,
        enableBlurredBackgroundStream: !!data.enableBlurredBackgroundStream,
        blurInterval: data.blurredbackgroundHighFramerate ? 50 : 300,
      }

      renderer.init(canvases, data.streamRendererImageDecoderMode, opts)
    } else if (data.type === 'frame') {
      // payload is Blob/ArrayBuffer depending on the availablity of the ImageDecoder

      renderer.drawFrame(data.payload)
    } else if (data.type === 'overlay') {
      // data.url may be null to clear overlay
      await renderer.updateOverlay(data.url ?? null)
      console.log(`overlay updated to ${data.url}`)
      // } else if (data.type === 'getStats') {
      //   // optional: return stats
      //   const stats = renderer.getStats()
      //   // postMessage back to main thread
      //   self.postMessage({ type: 'stats', payload: stats })
    } else {
      console.warn('unknown message type', data.type)
    }
  } catch (e) {
    console.error('onmessage handler error', e)
  }
}
