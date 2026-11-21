<template>
  <q-card class="collage-editor column no-wrap">
    <q-bar class="collage-editor__bar bg-primary text-white">
      <q-icon name="sym_o_dashboard_customize" />
      <div class="text-weight-medium">{{ $t('Collage editor') }}</div>
      <q-space />
      <q-btn dense flat no-caps icon="sym_o_close" :label="$t('BTN_LABEL_CANCEL')" @click="emit('cancel')" />
      <q-btn
        dense
        unelevated
        no-caps
        color="white"
        text-color="primary"
        icon="sym_o_check"
        class="q-ml-sm q-px-sm"
        :label="$t('Apply')"
        @click="apply"
      />
    </q-bar>

    <div class="collage-editor__toolbar row items-center q-gutter-x-md q-px-md">
      <q-toggle v-model="previewOnly" dense :label="$t('Preview only')" />
      <q-toggle v-model="showOutlines" dense :disable="previewOnly" :label="$t('Outlines')" />
      <q-toggle v-model="showFront" dense :disable="!draft.canvas_img_front_enable" :label="$t('Overlay')" />
      <q-toggle v-model="showElements" dense :disable="!draft.canvas_elements_enable" :label="$t('Elements')" />
      <q-toggle v-model="snap" dense :disable="previewOnly" :label="$t('Snap')" />
      <q-toggle v-model="keepAspect" dense :disable="previewOnly" :label="$t('Keep aspect ratio')" />
      <q-space />
      <span class="text-caption text-grey-7">{{
        $t('Drag to move, corners to resize, the round handle to rotate. Arrow keys move by 1 px (Shift: 10 px).')
      }}</span>
    </div>

    <div class="collage-editor__body row no-wrap col">
      <div class="collage-editor__stage col">
        <collage-canvas
          v-model:definitions="draft.merge_definition"
          v-model:selected="selected"
          v-model:elements="draft.canvas_elements"
          v-model:selected-element="selectedElement"
          :config="draft"
          :sample-images="sampleImages"
          :editable="!previewOnly"
          :show-outlines="showOutlines"
          :show-front="showFront"
          :show-elements="showElements"
          :snap="snap"
          :keep-aspect="keepAspect"
        />
      </div>

      <div class="collage-editor__panel column no-wrap">
        <q-tabs v-model="tab" dense no-caps align="justify" active-color="primary" indicator-color="primary" class="text-grey-8">
          <q-tab name="images" icon="sym_o_photo_library" :label="$t('Images')" />
          <q-tab name="canvas" icon="sym_o_wallpaper" :label="$t('Canvas')" />
          <q-tab name="elements" icon="sym_o_text_fields" :label="$t('Elements')" />
        </q-tabs>
        <q-separator />

        <q-scroll-area class="col">
          <q-tab-panels v-model="tab" animated class="bg-transparent">
            <!-- ================= images ================= -->
            <q-tab-panel name="images" class="q-gutter-y-md">
              <div>
                <div class="text-subtitle2">{{ $t('Sample images') }}</div>
                <q-btn-toggle
                  v-model="sampleSource"
                  spread
                  no-caps
                  dense
                  unelevated
                  toggle-color="primary"
                  :options="[
                    { label: $t('Placeholders'), value: 'placeholder' },
                    { label: $t('From gallery'), value: 'gallery', disable: galleryImages.length === 0 },
                  ]"
                />
                <div v-if="galleryImages.length === 0" class="text-caption text-grey-7">{{
                  $t('Take some photos to use them as sample images.')
                }}</div>
              </div>

              <div>
                <div class="row items-center">
                  <div class="text-subtitle2 col">{{ $t('Images') }}</div>
                  <q-btn flat round dense icon="sym_o_add" :aria-label="$t('Add image')" @click="addSlot">
                    <q-tooltip>{{ $t('Add image') }}</q-tooltip>
                  </q-btn>
                </div>
                <q-list bordered separator dense class="rounded-borders">
                  <q-item
                    v-for="(def, index) in draft.merge_definition"
                    :key="index"
                    clickable
                    :active="index === selected"
                    @click="selectSlot(index)"
                  >
                    <q-item-section avatar>
                      <q-avatar size="28px" :color="index === selected ? 'primary' : 'grey-5'" text-color="white">{{ index + 1 }}</q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label lines="1">{{ slotTitle(index) }}</q-item-label>
                      <q-item-label caption lines="1"
                        >{{ def.width }}×{{ def.height }} @ {{ def.pos_x }},{{ def.pos_y }}{{ def.rotate ? ` ⟲${def.rotate}°` : '' }}</q-item-label
                      >
                    </q-item-section>
                  </q-item>
                  <q-item v-if="draft.merge_definition.length === 0">
                    <q-item-section class="text-grey-7">{{ $t('No images yet.') }}</q-item-section>
                  </q-item>
                </q-list>
              </div>

              <div v-if="current">
                <div class="row items-center">
                  <div class="text-subtitle2 col">{{ $t('Image {number}', { number: (selected ?? 0) + 1 }) }}</div>
                  <q-btn flat round dense icon="sym_o_arrow_upward" :disable="selected === 0" :aria-label="$t('Move up')" @click="moveSlot(-1)">
                    <q-tooltip>{{ $t('Move up') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="sym_o_arrow_downward"
                    :disable="selected === draft.merge_definition.length - 1"
                    :aria-label="$t('Move down')"
                    @click="moveSlot(1)"
                  >
                    <q-tooltip>{{ $t('Move down') }}</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense icon="sym_o_content_copy" :aria-label="$t('Duplicate')" @click="duplicateSlot">
                    <q-tooltip>{{ $t('Duplicate') }}</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense color="negative" icon="sym_o_delete" :aria-label="$t('Remove')" @click="removeSlot">
                    <q-tooltip>{{ $t('Remove') }}</q-tooltip>
                  </q-btn>
                </div>
                <div class="text-caption text-grey-7 q-mb-sm">{{ $t('The order defines which capture goes into which image.') }}</div>

                <q-input
                  dense
                  outlined
                  :label="$t('Description')"
                  :model-value="current.description"
                  @update:model-value="v => update({ description: String(v ?? '') })"
                />

                <div class="row q-col-gutter-sm q-mt-none">
                  <q-input
                    v-for="field in SLOT_FIELDS"
                    :key="field.key"
                    class="col-6"
                    dense
                    outlined
                    type="number"
                    :label="$t(field.label)"
                    :suffix="field.suffix"
                    :model-value="current[field.key]"
                    @update:model-value="v => update({ [field.key]: toInt(v, field.min) })"
                  />
                </div>

                <div class="row q-gutter-sm q-mt-xs">
                  <q-btn
                    outline
                    dense
                    no-caps
                    size="sm"
                    icon="sym_o_align_horizontal_center"
                    :label="$t('Center horizontally')"
                    @click="center('x')"
                  />
                  <q-btn outline dense no-caps size="sm" icon="sym_o_align_vertical_center" :label="$t('Center vertically')" @click="center('y')" />
                  <q-btn
                    outline
                    dense
                    no-caps
                    size="sm"
                    icon="sym_o_rotate_left"
                    :label="$t('No rotation')"
                    :disable="!current.rotate"
                    @click="update({ rotate: 0 })"
                  />
                </div>

                <userfile-select
                  class="q-mt-md"
                  kind="image"
                  :label="$t('Predefined image')"
                  :hint="$t('Use a fixed image instead of a capture.')"
                  :model-value="current.predefined_image"
                  @update:model-value="v => update({ predefined_image: v || null })"
                />
              </div>
              <div v-else class="text-caption text-grey-7">{{ $t('Select an image in the preview or the list to edit it.') }}</div>
            </q-tab-panel>

            <!-- ================= canvas ================= -->
            <q-tab-panel name="canvas" class="q-gutter-y-md">
              <div>
                <div class="text-subtitle2">{{ $t('Size') }}</div>
                <div class="row q-col-gutter-sm">
                  <q-input
                    class="col-6"
                    dense
                    outlined
                    type="number"
                    :label="$t('Width')"
                    suffix="px"
                    :model-value="draft.canvas_width"
                    @update:model-value="v => (draft.canvas_width = toInt(v, 1))"
                  />
                  <q-input
                    class="col-6"
                    dense
                    outlined
                    type="number"
                    :label="$t('Height')"
                    suffix="px"
                    :model-value="draft.canvas_height"
                    @update:model-value="v => (draft.canvas_height = toInt(v, 1))"
                  />
                </div>
              </div>

              <div>
                <q-toggle v-model="draft.canvas_fill_background_enable" :label="$t('Background color')" />
                <color-input v-model="draft.canvas_fill_background_color" :label="$t('Color')" :disable="!draft.canvas_fill_background_enable" />
              </div>

              <div>
                <q-toggle v-model="draft.canvas_img_background_enable" :label="$t('Background image')" />
                <userfile-select
                  v-model="draft.canvas_img_background_file"
                  kind="image"
                  :label="$t('Image file')"
                  :hint="$t('Fills the canvas behind the photos.')"
                  :disable="!draft.canvas_img_background_enable"
                />
                <div v-if="draft.canvas_img_background_enable && !draft.canvas_img_background_file" class="text-caption text-negative">
                  {{ $t('Choose a file, otherwise creating the collage fails.') }}
                </div>
              </div>

              <div>
                <q-toggle v-model="draft.canvas_img_front_enable" :label="$t('Overlay image (frame)')" />
                <userfile-select
                  v-model="draft.canvas_img_front_file"
                  kind="image"
                  :label="$t('Image file')"
                  :hint="$t('Placed on top of the photos. Photos show through transparent areas, so use a PNG.')"
                  :disable="!draft.canvas_img_front_enable"
                />
                <div v-if="draft.canvas_img_front_enable && !draft.canvas_img_front_file" class="text-caption text-negative">
                  {{ $t('Choose a file, otherwise creating the collage fails.') }}
                </div>
              </div>

              <div v-if="!draft.canvas_fill_background_enable && !draft.canvas_img_background_enable" class="text-caption text-grey-7">
                {{ $t('Without background, uncovered areas of the collage turn black.') }}
              </div>
            </q-tab-panel>

            <!-- ================= texts and images ================= -->
            <q-tab-panel name="elements" class="q-gutter-y-md">
              <q-toggle v-model="draft.canvas_elements_enable" :label="$t('Apply texts and images')" />

              <div>
                <div class="row items-center">
                  <div class="text-subtitle2 col">{{ $t('Elements') }}</div>
                  <q-btn flat round dense icon="sym_o_title" :aria-label="$t('Add text')" @click="addText">
                    <q-tooltip>{{ $t('Add text') }}</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense icon="sym_o_add_photo_alternate" :aria-label="$t('Add image')" @click="addImageElement">
                    <q-tooltip>{{ $t('Add image') }}</q-tooltip>
                  </q-btn>
                </div>
                <q-list bordered separator dense class="rounded-borders" :class="{ 'collage-editor__list--disabled': !draft.canvas_elements_enable }">
                  <q-item
                    v-for="(element, index) in draft.canvas_elements"
                    :key="index"
                    clickable
                    :active="index === selectedElement"
                    @click="selectElement(index)"
                  >
                    <q-item-section avatar>
                      <q-avatar v-if="isImageElement(element)" size="28px" color="grey-6" text-color="white" icon="sym_o_image" />
                      <q-avatar v-else size="28px" :style="{ background: element.color }" text-color="white" icon="sym_o_title" />
                    </q-item-section>
                    <q-item-section v-if="isImageElement(element)">
                      <q-item-label lines="1">{{ element.image ? fileName(element.image) : $t('(no image)') }}</q-item-label>
                      <q-item-label caption lines="1"
                        >{{ element.width }}×{{ element.height }} px @ {{ element.pos_x }},{{ element.pos_y
                        }}{{ element.rotate ? ` ⟲${element.rotate}°` : '' }}</q-item-label
                      >
                    </q-item-section>
                    <q-item-section v-else>
                      <q-item-label lines="1">{{ element.text || $t('(empty)') }}</q-item-label>
                      <q-item-label caption lines="1"
                        >{{ element.font_size }} px @ {{ element.pos_x }},{{ element.pos_y
                        }}{{ element.rotate ? ` ⟲${element.rotate}°` : '' }}</q-item-label
                      >
                    </q-item-section>
                  </q-item>
                  <q-item v-if="draft.canvas_elements.length === 0">
                    <q-item-section class="text-grey-7">{{ $t('No texts or images yet.') }}</q-item-section>
                  </q-item>
                </q-list>
                <div class="text-caption text-grey-7 q-mt-xs">{{ $t('Drawn above the overlay, later elements on top.') }}</div>
              </div>

              <div v-if="currentElement">
                <div class="row items-center">
                  <div class="text-subtitle2 col">
                    {{
                      isImageElement(currentElement)
                        ? $t('Image element {number}', { number: (selectedElement ?? 0) + 1 })
                        : $t('Text {number}', { number: (selectedElement ?? 0) + 1 })
                    }}
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="sym_o_arrow_upward"
                    :disable="selectedElement === 0"
                    :aria-label="$t('Move up')"
                    @click="moveElement(-1)"
                  >
                    <q-tooltip>{{ $t('Move up') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="sym_o_arrow_downward"
                    :disable="selectedElement === draft.canvas_elements.length - 1"
                    :aria-label="$t('Move down')"
                    @click="moveElement(1)"
                  >
                    <q-tooltip>{{ $t('Move down') }}</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense icon="sym_o_content_copy" :aria-label="$t('Duplicate')" @click="duplicateElement">
                    <q-tooltip>{{ $t('Duplicate') }}</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense color="negative" icon="sym_o_delete" :aria-label="$t('Remove')" @click="removeElement">
                    <q-tooltip>{{ $t('Remove') }}</q-tooltip>
                  </q-btn>
                </div>

                <template v-if="isImageElement(currentElement)">
                  <userfile-select
                    kind="image"
                    :label="$t('Image file')"
                    :hint="$t('Fit into the box keeping its aspect ratio. Use a PNG for transparency.')"
                    :model-value="currentElement.image"
                    @update:model-value="v => updateElement({ image: v || null })"
                  />
                  <div v-if="!currentElement.image" class="text-caption text-negative">
                    {{ $t('Choose a file, otherwise creating the collage fails.') }}
                  </div>

                  <div class="row q-col-gutter-sm q-mt-xs">
                    <q-input
                      v-for="field in IMAGE_ELEMENT_FIELDS"
                      :key="field.key"
                      class="col-6"
                      dense
                      outlined
                      type="number"
                      :label="$t(field.label)"
                      :suffix="field.suffix"
                      :model-value="currentElement[field.key]"
                      @update:model-value="v => updateElement({ [field.key]: toInt(v, field.min) })"
                    />
                  </div>

                  <div class="q-mt-md">
                    <div class="text-caption text-grey-8">{{ $t('Opacity') }}: {{ Math.round(currentElement.opacity * 100) }} %</div>
                    <q-slider
                      :min="0"
                      :max="1"
                      :step="0.05"
                      :model-value="currentElement.opacity"
                      @update:model-value="v => updateElement({ opacity: v ?? 1 })"
                    />
                  </div>
                </template>

                <template v-else>
                  <q-input
                    dense
                    outlined
                    autogrow
                    type="textarea"
                    :label="$t('Text')"
                    :hint="$t('Placeholders: {date} and {time}', { date: '{date}', time: '{time}' })"
                    :model-value="currentElement.text"
                    @update:model-value="v => updateElement({ text: String(v ?? '') })"
                  />

                  <div class="row q-col-gutter-sm q-mt-xs">
                    <q-input
                      v-for="field in TEXT_FIELDS"
                      :key="field.key"
                      class="col-6"
                      dense
                      outlined
                      type="number"
                      :label="$t(field.label)"
                      :suffix="field.suffix"
                      :model-value="currentElement[field.key]"
                      @update:model-value="v => updateElement({ [field.key]: toInt(v, field.min) })"
                    />
                  </div>

                  <userfile-select
                    class="q-mt-md"
                    kind="font"
                    :label="$t('Font')"
                    :model-value="currentElement.font"
                    @update:model-value="v => updateElement({ font: v || null })"
                  />
                  <div v-if="!currentElement.font && currentElement.text" class="text-caption text-negative">
                    {{ $t('Choose a font, otherwise creating the collage fails.') }}
                  </div>

                  <color-input
                    class="q-mt-md"
                    :label="$t('Color')"
                    :model-value="currentElement.color"
                    @update:model-value="v => updateElement({ color: v ?? '' })"
                  />
                </template>
                <div class="text-caption text-grey-7 q-mt-xs">{{
                  $t('Position is the top-left corner. Elements rotate around their own center.')
                }}</div>
              </div>
              <div v-else class="text-caption text-grey-7">{{ $t('Select a text or image in the preview or the list to edit it.') }}</div>
            </q-tab-panel>
          </q-tab-panels>
        </q-scroll-area>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { useLocalStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useMediacollectionStore } from '@/stores/mediacollection-store'
import CollageCanvas from './CollageCanvas.vue'
import ColorInput from './ColorInput.vue'
import UserfileSelect from './UserfileSelect.vue'
import {
  type CollageMergeDefinition,
  type CollageProcessing,
  type SampleSource,
  type CanvasElement,
  type ImageElementConfig,
  type TextElementConfig,
  isImageElement,
  newImageElement,
  newMergeDefinition,
  newText,
  sanitizeDefinition,
  sanitizeElement,
} from './collage'

/**
 * Edit the collage layout visually, with a live preview using sample images:
 * position, size and rotation of the images, canvas size, background, overlay, texts and images on top.
 * Works on a copy; "apply" hands the result back to the config form, which is saved as usual.
 */

type SlotNumberKey = 'pos_x' | 'pos_y' | 'width' | 'height' | 'rotate' | 'pos_z'
type TextNumberKey = 'pos_x' | 'pos_y' | 'font_size' | 'rotate'
type ImageElementNumberKey = 'pos_x' | 'pos_y' | 'width' | 'height' | 'rotate'

// labels are translation keys
const SLOT_FIELDS: { key: SlotNumberKey; label: string; suffix?: string; min?: number }[] = [
  { key: 'pos_x', label: 'Position X', suffix: 'px', min: 0 },
  { key: 'pos_y', label: 'Position Y', suffix: 'px', min: 0 },
  { key: 'width', label: 'Width', suffix: 'px', min: 1 },
  { key: 'height', label: 'Height', suffix: 'px', min: 1 },
  { key: 'rotate', label: 'Rotation', suffix: '°' },
  { key: 'pos_z', label: 'Layer', min: 0 },
]
const TEXT_FIELDS: { key: TextNumberKey; label: string; suffix?: string; min?: number }[] = [
  { key: 'pos_x', label: 'Position X', suffix: 'px', min: 0 },
  { key: 'pos_y', label: 'Position Y', suffix: 'px', min: 0 },
  { key: 'font_size', label: 'Font size', suffix: 'px', min: 1 },
  { key: 'rotate', label: 'Rotation', suffix: '°' },
]
const IMAGE_ELEMENT_FIELDS: { key: ImageElementNumberKey; label: string; suffix?: string; min?: number }[] = [
  { key: 'pos_x', label: 'Position X', suffix: 'px', min: 0 },
  { key: 'pos_y', label: 'Position Y', suffix: 'px', min: 0 },
  { key: 'width', label: 'Width', suffix: 'px', min: 1 },
  { key: 'height', label: 'Height', suffix: 'px', min: 1 },
  { key: 'rotate', label: 'Rotation', suffix: '°' },
]

const { config } = defineProps<{ config: CollageProcessing }>()
const emit = defineEmits<{ apply: [config: CollageProcessing]; cancel: [] }>()

const { t } = useI18n()
const mediacollectionStore = useMediacollectionStore()

type EditableCollageProcessing = CollageProcessing & Required<Pick<CollageProcessing, 'canvas_width' | 'canvas_height' | 'canvas_elements'>>

const draft = ref<EditableCollageProcessing>(
  cloneDeep({
    ...config,
    canvas_width: config.canvas_width ?? 1920,
    canvas_height: config.canvas_height ?? 1280,
    merge_definition: config.merge_definition ?? [],
    canvas_elements: config.canvas_elements ?? [],
  })
)
const selected = ref<number | null>(draft.value.merge_definition.length ? 0 : null)
const selectedElement = ref<number | null>(null)
const tab = ref<'images' | 'canvas' | 'elements'>('images')

const previewOnly = ref(false)
const showOutlines = useLocalStorage('collageEditorShowOutlines', true)
const showFront = ref(true)
const showElements = ref(true)
const snap = useLocalStorage('collageEditorSnap', true)
const keepAspect = useLocalStorage('collageEditorKeepAspect', true)
const sampleSource = useLocalStorage<SampleSource>('collageEditorSampleSource', 'placeholder')

const galleryImages = computed(() =>
  mediacollectionStore.collection.filter(item => item.media_type === 'image').map(item => `/media/preview/${item.id}?${item.revision}`)
)
const sampleImages = computed(() => (sampleSource.value === 'gallery' ? galleryImages.value : []))

// ---------- images ----------

const current = computed(() => (selected.value === null ? null : (draft.value.merge_definition[selected.value] ?? null)))

const selectSlot = (index: number) => {
  selected.value = index
  selectedElement.value = null
}

const slotTitle = (index: number) => {
  const def = draft.value.merge_definition[index]!
  if (def.description) return def.description
  if (def.predefined_image) return `${t('Predefined image')}: ${def.predefined_image.split(/[\\/]/).pop()}`
  const captureNumber = draft.value.merge_definition.slice(0, index + 1).filter(d => !d.predefined_image).length
  return t('Capture {number}', { number: captureNumber })
}

const toInt = (value: string | number | null, min?: number) => {
  const n = Math.round(Number(value) || 0)
  return min === undefined ? n : Math.max(min, n)
}

const update = (patch: Partial<CollageMergeDefinition>) => {
  if (selected.value === null || !current.value) return
  draft.value.merge_definition[selected.value] = sanitizeDefinition({ ...current.value, ...patch })
}

const center = (axis: 'x' | 'y') => {
  if (!current.value) return
  if (axis === 'x') update({ pos_x: (draft.value.canvas_width - current.value.width) / 2 })
  else update({ pos_y: (draft.value.canvas_height - current.value.height) / 2 })
}

const addSlot = () => {
  const list = draft.value.merge_definition
  const last = list[list.length - 1]
  const def = last ? { ...newMergeDefinition(), width: last.width, height: last.height, pos_z: last.pos_z } : newMergeDefinition()
  def.pos_x = Math.max(0, Math.round((draft.value.canvas_width - def.width) / 2))
  def.pos_y = Math.max(0, Math.round((draft.value.canvas_height - def.height) / 2))
  list.push(def)
  selectSlot(list.length - 1)
}

const duplicateSlot = () => {
  if (selected.value === null || !current.value) return
  const copy = sanitizeDefinition({ ...cloneDeep(current.value), pos_x: current.value.pos_x + 40, pos_y: current.value.pos_y + 40 })
  draft.value.merge_definition.splice(selected.value + 1, 0, copy)
  selected.value += 1
}

const removeSlot = () => {
  if (selected.value === null) return
  const list = draft.value.merge_definition
  list.splice(selected.value, 1)
  selected.value = list.length ? Math.min(selected.value, list.length - 1) : null
}

const moveSlot = (direction: -1 | 1) => {
  if (selected.value === null) return
  const list = draft.value.merge_definition
  const target = selected.value + direction
  if (target < 0 || target >= list.length) return
  ;[list[selected.value], list[target]] = [list[target]!, list[selected.value]!]
  selected.value = target
}

// ---------- texts and images ----------

const currentElement = computed(() => (selectedElement.value === null ? null : (draft.value.canvas_elements[selectedElement.value] ?? null)))

const fileName = (path: string) => path.split(/[\\/]/).pop() ?? path

const selectElement = (index: number) => {
  selectedElement.value = index
  selected.value = null
}

const updateElement = (patch: Partial<TextElementConfig> | Partial<ImageElementConfig>) => {
  if (selectedElement.value === null || !currentElement.value) return
  draft.value.canvas_elements[selectedElement.value] = sanitizeElement({ ...currentElement.value, ...patch } as CanvasElement)
}

const pushElement = (element: CanvasElement) => {
  draft.value.canvas_elements.push(element)
  draft.value.canvas_elements_enable = true
  showElements.value = true
  selectElement(draft.value.canvas_elements.length - 1)
}

const addText = () => {
  pushElement({
    ...newText(),
    text: t('Your text'),
    pos_x: Math.round(draft.value.canvas_width / 2 - 100),
    pos_y: Math.round(draft.value.canvas_height / 2),
  })
}

const addImageElement = () => {
  const element = newImageElement()
  pushElement({
    ...element,
    pos_x: Math.max(0, Math.round((draft.value.canvas_width - element.width) / 2)),
    pos_y: Math.max(0, Math.round((draft.value.canvas_height - element.height) / 2)),
  })
}

const duplicateElement = () => {
  if (selectedElement.value === null || !currentElement.value) return
  const source = currentElement.value
  const offset = isImageElement(source) ? { pos_x: source.pos_x + 40, pos_y: source.pos_y + 40 } : { pos_y: source.pos_y + source.font_size * 1.5 }
  draft.value.canvas_elements.splice(selectedElement.value + 1, 0, sanitizeElement({ ...cloneDeep(source), ...offset }))
  selectedElement.value += 1
}

const removeElement = () => {
  if (selectedElement.value === null) return
  const list = draft.value.canvas_elements
  list.splice(selectedElement.value, 1)
  selectedElement.value = list.length ? Math.min(selectedElement.value, list.length - 1) : null
}

// the order of the list is the drawing order
const moveElement = (direction: -1 | 1) => {
  if (selectedElement.value === null) return
  const list = draft.value.canvas_elements
  const target = selectedElement.value + direction
  if (target < 0 || target >= list.length) return
  ;[list[selectedElement.value], list[target]] = [list[target]!, list[selectedElement.value]!]
  selectedElement.value = target
}

// selecting something in the preview shows its settings
watch(selected, value => {
  if (value !== null) tab.value = 'images'
})
watch(selectedElement, value => {
  if (value !== null) tab.value = 'elements'
})

// ---------- keyboard ----------

// arrow keys nudge the selected image, text or image element, unless typing in a field
const onKeydown = (evt: KeyboardEvent) => {
  if (previewOnly.value) return
  const el = evt.target as HTMLElement | null
  if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return
  const step = evt.shiftKey ? 10 : 1
  const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
  const move = moves[evt.key]
  if (!move) return
  if (current.value) {
    evt.preventDefault()
    update({ pos_x: current.value.pos_x + move[0], pos_y: current.value.pos_y + move[1] })
  } else if (currentElement.value) {
    evt.preventDefault()
    updateElement({ pos_x: currentElement.value.pos_x + move[0], pos_y: currentElement.value.pos_y + move[1] })
  }
}

watch(previewOnly, value => {
  if (value) {
    selected.value = null
    selectedElement.value = null
  }
})

const apply = () => {
  emit('apply', {
    ...draft.value,
    merge_definition: draft.value.merge_definition.map(sanitizeDefinition),
    canvas_elements: draft.value.canvas_elements.map(sanitizeElement),
  })
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  mediacollectionStore.initStore()
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style lang="scss">
.collage-editor {
  width: 100vw;
  height: 100vh;
  max-width: 100vw !important;
  max-height: 100vh !important;
  border-radius: 0 !important;

  &__bar {
    height: 44px;
  }

  &__toolbar {
    min-height: 44px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  &__body {
    min-height: 0;
  }

  &__stage {
    min-width: 0;
    padding: 16px;
    background: repeating-conic-gradient(#d6d6d6 0% 25%, #ececec 0% 50%) 50% / 24px 24px;
  }

  &__panel {
    width: 380px;
    flex: none;
    border-left: 1px solid rgba(0, 0, 0, 0.12);

    // long labels like file names are cut instead of widening the panel
    .q-scrollarea__content {
      width: 100%;
    }
  }

  &__list--disabled {
    opacity: 0.6;
  }
}

body.body--dark .collage-editor__stage {
  background: repeating-conic-gradient(#2a2a2a 0% 25%, #333333 0% 50%) 50% / 24px 24px;
}

@media (max-width: 900px) {
  .collage-editor__body {
    flex-direction: column;
  }

  .collage-editor__stage {
    flex: 1 1 55%;
  }

  .collage-editor__panel {
    width: 100%;
    flex: 1 1 45%;
    border-left: none;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }
}
</style>
