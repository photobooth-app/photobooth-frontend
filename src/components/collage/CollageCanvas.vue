<template>
  <div ref="host" class="collage-canvas">
    <div
      ref="stage"
      class="collage-canvas__stage"
      :style="{ width: `${canvasWidth * scale}px`, height: `${canvasHeight * scale}px` }"
      @pointerdown="onStagePointerDown"
    >
      <div
        class="collage-canvas__paper"
        :style="{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          transform: `scale(${scale})`,
          backgroundColor: config.canvas_fill_background_enable ? config.canvas_fill_background_color : undefined,
          '--inv-scale': 1 / scale,
        }"
        :class="{ 'collage-canvas__paper--transparent': !config.canvas_fill_background_enable }"
      >
        <img v-if="backgroundUrl" class="collage-canvas__cover" :src="backgroundUrl" alt="" draggable="false" />

        <!-- photos, stacked like the backend does: sorted by layer (pos_z), same layer in order of definition -->
        <div
          v-for="slot in slots"
          :key="slot.index"
          class="collage-canvas__slot"
          :style="{
            left: `${slot.def.pos_x}px`,
            top: `${slot.def.pos_y}px`,
            width: `${slot.def.width}px`,
            height: `${slot.def.height}px`,
            transform: `rotate(${-slot.def.rotate}deg)`,
            zIndex: slot.zIndex,
          }"
        >
          <img class="collage-canvas__cover" :src="slot.image" alt="" draggable="false" />
        </div>

        <img v-if="frontUrl" class="collage-canvas__cover collage-canvas__front" :src="frontUrl" alt="" draggable="false" />

        <!-- texts and images, drawn above the overlay in the order of the list -->
        <template v-if="showElements && config.canvas_elements_enable">
          <template v-for="(element, index) in elements" :key="`element-${index}`">
            <div
              v-if="isImageElement(element)"
              class="collage-canvas__element collage-canvas__image"
              :class="elementClasses(index, !element.image)"
              :style="{
                left: `${element.pos_x}px`,
                top: `${element.pos_y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                transform: `rotate(${-element.rotate}deg)`,
                zIndex: elementZIndex(index),
              }"
              :data-index="editable ? index : undefined"
              :data-target="editable ? 'element' : undefined"
              :data-action="editable ? 'move' : undefined"
            >
              <img
                v-if="element.image"
                class="collage-canvas__contain"
                :src="userfileUrl(element.image)!"
                :style="{ opacity: element.opacity }"
                alt=""
                draggable="false"
              />
              <template v-if="editable && index === selectedElement">
                <span
                  v-for="handle in HANDLES"
                  :key="handle.name"
                  class="collage-canvas__handle"
                  :class="`collage-canvas__handle--${handle.name}`"
                  :data-index="index"
                  data-target="element"
                  data-action="resize"
                  :data-sx="handle.sx"
                  :data-sy="handle.sy"
                />
                <span class="collage-canvas__rotate-line" />
                <span class="collage-canvas__handle collage-canvas__handle--rotate" :data-index="index" data-target="element" data-action="rotate" />
              </template>
            </div>
            <span
              v-else
              class="collage-canvas__element collage-canvas__text"
              :class="elementClasses(index, !element.text)"
              :data-index="editable ? index : undefined"
              :data-target="editable ? 'element' : undefined"
              :data-action="editable ? 'move' : undefined"
              :style="{
                left: `${element.pos_x}px`,
                top: `${element.pos_y}px`,
                fontSize: `${element.font_size}px`,
                color: element.color,
                fontFamily: fontFamilies[element.font ?? ''] ?? 'sans-serif',
                transform: `rotate(${-element.rotate}deg)`,
                zIndex: elementZIndex(index),
              }"
              >{{ formatText(element.text) || (editable ? '…' : '') }}</span
            >
          </template>
        </template>

        <!-- editing helpers, drawn above everything -->
        <template v-if="editable">
          <div
            v-for="slot in slots"
            :key="`frame-${slot.index}`"
            class="collage-canvas__frame"
            :class="{
              'collage-canvas__frame--selected': slot.index === selected,
              'collage-canvas__frame--hidden': !showOutlines && slot.index !== selected,
            }"
            :style="{
              left: `${slot.def.pos_x}px`,
              top: `${slot.def.pos_y}px`,
              width: `${slot.def.width}px`,
              height: `${slot.def.height}px`,
              transform: `rotate(${-slot.def.rotate}deg)`,
              zIndex: slot.index === selected ? 1000 : 900 + slot.zIndex,
            }"
            :data-index="slot.index"
            data-target="slot"
            data-action="move"
          >
            <span class="collage-canvas__badge">{{ slot.label }}</span>
            <template v-if="slot.index === selected">
              <span
                v-for="handle in HANDLES"
                :key="handle.name"
                class="collage-canvas__handle"
                :class="`collage-canvas__handle--${handle.name}`"
                :data-index="slot.index"
                data-target="slot"
                data-action="resize"
                :data-sx="handle.sx"
                :data-sy="handle.sy"
              />
              <span class="collage-canvas__rotate-line" />
              <span class="collage-canvas__handle collage-canvas__handle--rotate" :data-index="slot.index" data-target="slot" data-action="rotate" />
            </template>
          </div>
          <div
            v-for="(guide, i) in guides"
            :key="`guide-${i}`"
            class="collage-canvas__guide"
            :class="`collage-canvas__guide--${guide.axis}`"
            :style="guide.style"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'
import {
  type CollageMergeDefinition,
  type CollageProcessing,
  type CanvasElement,
  isImageElement,
  placeholderImage,
  sanitizeElement,
  sanitizeDefinition,
  userfileUrl,
} from './collage'

/**
 * Renders a collage like the backend (photobooth MergeCollageStep + background/overlay/text steps) does, with sample images.
 * - images are fit by covering the slot (like PIL ImageOps.fit), centered
 * - rotation is around the slot's center, positive values counterclockwise
 * - texts and images (canvas elements) are drawn above the overlay in list order, positioned by their top-left corner and
 *   rotated around their own center. Images are fit into their box keeping the aspect ratio (like PIL ImageOps.contain).
 * When editable, slots and image elements can be moved, resized and rotated with mouse or touch, texts can be moved.
 */

const HANDLES = [
  { name: 'nw', sx: -1, sy: -1 },
  { name: 'ne', sx: 1, sy: -1 },
  { name: 'sw', sx: -1, sy: 1 },
  { name: 'se', sx: 1, sy: 1 },
] as const

const SNAP_SCREEN_PX = 8
const MIN_SIZE = 20

const definitions = defineModel<CollageMergeDefinition[]>('definitions', { required: true })
const selected = defineModel<number | null>('selected', { default: null })
const elements = defineModel<CanvasElement[]>('elements', { default: () => [] })
const selectedElement = defineModel<number | null>('selectedElement', { default: null })

const {
  config,
  sampleImages = [],
  editable = false,
  showOutlines = true,
  showFront = true,
  showElements = true,
  snap = true,
  keepAspect = false,
} = defineProps<{
  /** processing config, used for canvas size, backgrounds, overlay and canvas elements */
  config: CollageProcessing
  /** images used for captures, in capture order. Placeholders are used if empty. */
  sampleImages?: string[]
  editable?: boolean
  showOutlines?: boolean
  showFront?: boolean
  showElements?: boolean
  snap?: boolean
  keepAspect?: boolean
}>()

const host = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const { width: hostWidth, height: hostHeight } = useElementSize(host)

const canvasWidth = computed(() => Math.max(1, config.canvas_width || 1))
const canvasHeight = computed(() => Math.max(1, config.canvas_height || 1))
const scale = computed(() => {
  if (!hostWidth.value || !hostHeight.value) return 0.1
  return Math.min(hostWidth.value / canvasWidth.value, hostHeight.value / canvasHeight.value)
})

const backgroundUrl = computed(() => (config.canvas_img_background_enable ? userfileUrl(config.canvas_img_background_file) : null))
const frontUrl = computed(() => (showFront && config.canvas_img_front_enable ? userfileUrl(config.canvas_img_front_file) : null))

const slots = computed(() => {
  let captureNumber = 0
  const list = definitions.value.map((def, index) => {
    const predefined = userfileUrl(def.predefined_image)
    let image: string
    let label: string
    if (predefined) {
      image = predefined
      label = `${index + 1} ★`
    } else {
      captureNumber += 1
      image = sampleImages.length ? sampleImages[(captureNumber - 1) % sampleImages.length]! : placeholderImage(captureNumber)
      label = `${index + 1}`
    }
    return { index, def, image, label, zIndex: 0 }
  })
  // stable sort like python's sorted(): same layer keeps definition order
  ;[...list].sort((a, b) => a.def.pos_z - b.def.pos_z).forEach((slot, rank) => (slot.zIndex = rank + 1))
  return list
})

// fonts from the backend's userdata folder, loaded once per file
const fontFamilies = ref<Record<string, string>>({})
watch(
  () => (config.canvas_elements_enable ? elements.value.flatMap(element => (isImageElement(element) ? [] : [element.font ?? ''])) : []),
  fonts => {
    for (const font of new Set(fonts)) {
      const url = userfileUrl(font)
      if (!url || fontFamilies.value[font]) continue
      const family = `collage-font-${Object.keys(fontFamilies.value).length}`
      new FontFace(family, `url("${url}")`)
        .load()
        .then(face => {
          document.fonts.add(face)
          fontFamilies.value = { ...fontFamilies.value, [font]: family }
        })
        .catch(err => console.warn('collage preview: cannot load font', font, err))
    }
  },
  { immediate: true }
)

// above the overlay (500), when editable above the outlines of unselected slots (900+) so elements can be picked
const elementZIndex = (index: number) => {
  if (!editable) return 600 + index
  return index === selectedElement.value ? 1050 : 960 + index
}

const elementClasses = (index: number, empty: boolean) => ({
  'collage-canvas__element--editable': editable,
  'collage-canvas__element--selected': editable && index === selectedElement.value,
  'collage-canvas__element--empty': editable && empty,
})

const formatText = (text: string) => {
  const now = new Date()
  return text.replace(/\{date\}/g, now.toLocaleDateString()).replace(/\{time\}/g, now.toLocaleTimeString())
}

// ---------- interaction ----------

interface Guide {
  axis: 'x' | 'y'
  style: Record<string, string>
}
const guides = ref<Guide[]>([])

/** position, size and rotation shared by slots and image elements */
interface Box {
  pos_x: number
  pos_y: number
  width: number
  height: number
  rotate: number
}

interface DragState {
  pointerId: number
  target: 'slot' | 'element'
  action: 'move' | 'resize' | 'rotate'
  index: number
  startX: number
  startY: number
  start: CollageMergeDefinition | CanvasElement
  sx: number
  sy: number
}
let drag: DragState | null = null
let pendingEvent: PointerEvent | null = null
let frame = 0

const toCanvas = (evt: PointerEvent) => {
  const rect = stage.value!.getBoundingClientRect()
  return { x: (evt.clientX - rect.left) / scale.value, y: (evt.clientY - rect.top) / scale.value }
}

const onStagePointerDown = (evt: PointerEvent) => {
  if (!editable || evt.button > 0) return
  const el = (evt.target as HTMLElement).closest<HTMLElement>('[data-action]')
  if (!el) {
    selected.value = null
    selectedElement.value = null
    return
  }
  evt.preventDefault()
  const index = Number(el.dataset.index)
  const target = el.dataset.target === 'element' ? 'element' : 'slot'
  selected.value = target === 'slot' ? index : null
  selectedElement.value = target === 'element' ? index : null
  const start = toCanvas(evt)
  drag = {
    pointerId: evt.pointerId,
    target,
    action: el.dataset.action as DragState['action'],
    index,
    startX: start.x,
    startY: start.y,
    start: target === 'slot' ? { ...definitions.value[index]! } : { ...elements.value[index]! },
    sx: Number(el.dataset.sx ?? 0),
    sy: Number(el.dataset.sy ?? 0),
  }
  stage.value?.setPointerCapture(evt.pointerId)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

// coalesce pointer moves to one update per frame, keeps dragging smooth on slow devices
const onPointerMove = (evt: PointerEvent) => {
  if (!drag || evt.pointerId !== drag.pointerId) return
  pendingEvent = evt
  if (!frame) frame = requestAnimationFrame(applyPendingMove)
}

const applyPendingMove = () => {
  frame = 0
  if (!drag || !pendingEvent) return
  const p = toCanvas(pendingEvent)
  const shift = pendingEvent.shiftKey
  pendingEvent = null
  const dx = p.x - drag.startX
  const dy = p.y - drag.startY

  if (drag.target === 'element') {
    const start = drag.start as CanvasElement
    let next: CanvasElement
    if (!isImageElement(start)) next = { ...start, pos_x: start.pos_x + dx, pos_y: start.pos_y + dy }
    else next = transformBox(start, drag, p, dx, dy, shift)
    const list = [...elements.value]
    list[drag.index] = sanitizeElement(next)
    elements.value = list
    return
  }

  const list = [...definitions.value]
  list[drag.index] = sanitizeDefinition(transformBox(drag.start as CollageMergeDefinition, drag, p, dx, dy, shift))
  definitions.value = list
}

const transformBox = <T extends Box>(s: T, d: DragState, p: { x: number; y: number }, dx: number, dy: number, shift: boolean): T => {
  if (d.action === 'move') return snapMove({ ...s, pos_x: s.pos_x + dx, pos_y: s.pos_y + dy }, d)
  if (d.action === 'resize') return resize(s, dx, dy, d.sx, d.sy, keepAspect !== shift) // shift temporarily inverts the setting

  const cx = s.pos_x + s.width / 2
  const cy = s.pos_y + s.height / 2
  // handle sits above the box: pointing straight up means no rotation. CSS angles are clockwise, the backend's counterclockwise.
  let angle = -((Math.atan2(p.y - cy, p.x - cx) * 180) / Math.PI + 90)
  angle = ((((angle + 180) % 360) + 360) % 360) - 180
  if (!shift) {
    const nearest = Math.round(angle / 45) * 45
    if (Math.abs(angle - nearest) < 4) angle = nearest
  }
  return { ...s, rotate: angle === -180 ? 180 : angle }
}

const resize = <T extends Box>(s: T, dx: number, dy: number, sx: number, sy: number, aspect: boolean): T => {
  // pointer movement in the box's own (rotated) axes
  const rad = (-s.rotate * Math.PI) / 180 // CSS rotation of the box
  const lx = dx * Math.cos(rad) + dy * Math.sin(rad)
  const ly = -dx * Math.sin(rad) + dy * Math.cos(rad)
  let width = Math.max(MIN_SIZE, s.width + sx * lx)
  let height = Math.max(MIN_SIZE, s.height + sy * ly)
  if (aspect) {
    const ratio = s.width / s.height
    if (width / s.width > height / s.height) height = width / ratio
    else width = height * ratio
  }
  // keep the opposite corner in place: shift the center by half the growth, rotated back into canvas axes
  const gx = (sx * (width - s.width)) / 2
  const gy = (sy * (height - s.height)) / 2
  const cx = s.pos_x + s.width / 2 + gx * Math.cos(rad) - gy * Math.sin(rad)
  const cy = s.pos_y + s.height / 2 + gx * Math.sin(rad) + gy * Math.cos(rad)
  return { ...s, width, height, pos_x: cx - width / 2, pos_y: cy - height / 2 }
}

/** snaps edges and center of an unrotated box to the canvas and to other unrotated slots and image elements */
const snapMove = <T extends Box>(def: T, d: DragState): T => {
  guides.value = []
  if (!snap || def.rotate !== 0) return def
  const threshold = SNAP_SCREEN_PX / scale.value
  const targetsX = [0, canvasWidth.value / 2, canvasWidth.value]
  const targetsY = [0, canvasHeight.value / 2, canvasHeight.value]
  const others: Box[] = [
    ...definitions.value.filter((_, i) => d.target !== 'slot' || i !== d.index),
    ...elements.value.filter((element, i) => isImageElement(element) && (d.target !== 'element' || i !== d.index)),
  ] as Box[]
  others.forEach(other => {
    if (other.rotate !== 0) return
    targetsX.push(other.pos_x, other.pos_x + other.width / 2, other.pos_x + other.width)
    targetsY.push(other.pos_y, other.pos_y + other.height / 2, other.pos_y + other.height)
  })

  const best = (edges: number[], targets: number[]) => {
    let result: { delta: number; line: number } | null = null
    for (const edge of edges)
      for (const target of targets) {
        const delta = target - edge
        if (Math.abs(delta) <= threshold && (!result || Math.abs(delta) < Math.abs(result.delta))) result = { delta, line: target }
      }
    return result
  }

  const result = { ...def }
  const bx = best([def.pos_x, def.pos_x + def.width / 2, def.pos_x + def.width], targetsX)
  const by = best([def.pos_y, def.pos_y + def.height / 2, def.pos_y + def.height], targetsY)
  if (bx) {
    result.pos_x += bx.delta
    guides.value.push({ axis: 'x', style: { left: `${bx.line}px` } })
  }
  if (by) {
    result.pos_y += by.delta
    guides.value.push({ axis: 'y', style: { top: `${by.line}px` } })
  }
  return result
}

const onPointerUp = (evt: PointerEvent) => {
  if (drag && evt.pointerId !== drag.pointerId) return
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  applyPendingMove() // the last position before releasing
  drag = null
  guides.value = []
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  if (frame) cancelAnimationFrame(frame)
})
</script>

<style lang="scss">
.collage-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &__stage {
    position: relative;
    flex: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  &__paper {
    position: absolute;
    left: 0;
    top: 0;
    transform-origin: 0 0;
    overflow: hidden;

    // transparent canvas areas end up black in the final jpg
    &--transparent {
      background: #000000;
    }
  }

  &__cover {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }

  &__slot {
    position: absolute;
    overflow: hidden;
    pointer-events: none;
  }

  &__front {
    z-index: 500;
  }

  &__contain {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
  }

  &__element {
    position: absolute;
    pointer-events: none;

    &--editable {
      pointer-events: auto;
      cursor: move;
      outline: calc(1px * var(--inv-scale)) dashed rgba(255, 255, 255, 0.7);
    }

    &--selected {
      outline: calc(2px * var(--inv-scale)) solid var(--q-primary);
    }
  }

  &__text.collage-canvas__element--empty {
    opacity: 0.5;
  }

  &__image.collage-canvas__element--empty {
    background: repeating-conic-gradient(rgba(255, 255, 255, 0.5) 0 25%, rgba(0, 0, 0, 0.3) 0 50%) 0 0 / calc(20px * var(--inv-scale))
      calc(20px * var(--inv-scale));
  }

  &__text {
    white-space: pre;
    line-height: normal;
  }

  &__frame {
    position: absolute;
    box-sizing: border-box;
    border: calc(2px * var(--inv-scale)) dashed rgba(255, 255, 255, 0.9);
    outline: calc(1px * var(--inv-scale)) solid rgba(0, 0, 0, 0.6);
    cursor: move;

    &--selected {
      border-style: solid;
      border-color: var(--q-primary);
      background: rgba(255, 255, 255, 0.08);
    }

    &--hidden {
      border-color: transparent;
      outline-color: transparent;

      .collage-canvas__badge {
        display: none;
      }
    }
  }

  &__badge {
    position: absolute;
    left: 0;
    top: 0;
    padding: 0 calc(6px * var(--inv-scale));
    font-size: calc(14px * var(--inv-scale));
    line-height: 1.5;
    color: #ffffff;
    background: rgba(0, 0, 0, 0.65);
    pointer-events: none;
  }

  &__frame--selected &__badge {
    background: var(--q-primary);
  }

  &__handle {
    position: absolute;
    width: calc(22px * var(--inv-scale));
    height: calc(22px * var(--inv-scale));
    margin: calc(-11px * var(--inv-scale));
    border: calc(2px * var(--inv-scale)) solid var(--q-primary);
    border-radius: 50%;
    background: #ffffff;

    &--nw {
      left: 0;
      top: 0;
      cursor: nwse-resize;
    }
    &--se {
      left: 100%;
      top: 100%;
      cursor: nwse-resize;
    }
    &--ne {
      left: 100%;
      top: 0;
      cursor: nesw-resize;
    }
    &--sw {
      left: 0;
      top: 100%;
      cursor: nesw-resize;
    }
    &--rotate {
      left: 50%;
      top: calc(-40px * var(--inv-scale));
      cursor: grab;
      background: var(--q-primary);
    }
  }

  &__rotate-line {
    position: absolute;
    left: 50%;
    top: calc(-40px * var(--inv-scale));
    height: calc(40px * var(--inv-scale));
    border-left: calc(2px * var(--inv-scale)) solid var(--q-primary);
    pointer-events: none;
  }

  &__guide {
    position: absolute;
    z-index: 1100;
    pointer-events: none;
    border: 0 dashed #ff00ff;

    &--x {
      top: 0;
      bottom: 0;
      border-left-width: calc(1px * var(--inv-scale));
    }

    &--y {
      left: 0;
      right: 0;
      border-top-width: calc(1px * var(--inv-scale));
    }
  }
}
</style>
