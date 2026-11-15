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
      <q-toggle v-model="showTexts" dense :disable="!draft.canvas_texts_enable" :label="$t('Texts')" />
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
          v-model:texts="draft.canvas_texts"
          v-model:selected-text="selectedText"
          :config="draft"
          :sample-images="sampleImages"
          :editable="!previewOnly"
          :show-outlines="showOutlines"
          :show-front="showFront"
          :show-texts="showTexts"
          :snap="snap"
          :keep-aspect="keepAspect"
        />
      </div>

      <div class="collage-editor__panel column no-wrap">
        <q-tabs v-model="tab" dense no-caps align="justify" active-color="primary" indicator-color="primary" class="text-grey-8">
          <q-tab name="images" icon="sym_o_photo_library" :label="$t('Images')" />
          <q-tab name="canvas" icon="sym_o_wallpaper" :label="$t('Canvas')" />
          <q-tab name="texts" icon="sym_o_text_fields" :label="$t('Texts')" />
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

            <!-- ================= texts ================= -->
            <q-tab-panel name="texts" class="q-gutter-y-md">
              <q-toggle v-model="draft.canvas_texts_enable" :label="$t('Apply texts')" />

              <div>
                <div class="row items-center">
                  <div class="text-subtitle2 col">{{ $t('Texts') }}</div>
                  <q-btn flat round dense icon="sym_o_add" :aria-label="$t('Add text')" @click="addText">
                    <q-tooltip>{{ $t('Add text') }}</q-tooltip>
                  </q-btn>
                </div>
                <q-list bordered separator dense class="rounded-borders" :class="{ 'collage-editor__list--disabled': !draft.canvas_texts_enable }">
                  <q-item
                    v-for="(text, index) in draft.canvas_texts"
                    :key="index"
                    clickable
                    :active="index === selectedText"
                    @click="selectText(index)"
                  >
                    <q-item-section avatar>
                      <q-avatar size="28px" :style="{ background: text.color }" text-color="white" icon="sym_o_title" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label lines="1">{{ text.text || $t('(empty)') }}</q-item-label>
                      <q-item-label caption lines="1"
                        >{{ text.font_size }} px @ {{ text.pos_x }},{{ text.pos_y }}{{ text.rotate ? ` ⟲${text.rotate}°` : '' }}</q-item-label
                      >
                    </q-item-section>
                  </q-item>
                  <q-item v-if="draft.canvas_texts.length === 0">
                    <q-item-section class="text-grey-7">{{ $t('No texts yet.') }}</q-item-section>
                  </q-item>
                </q-list>
              </div>

              <div v-if="currentText">
                <div class="row items-center">
                  <div class="text-subtitle2 col">{{ $t('Text {number}', { number: (selectedText ?? 0) + 1 }) }}</div>
                  <q-btn flat round dense icon="sym_o_content_copy" :aria-label="$t('Duplicate')" @click="duplicateText">
                    <q-tooltip>{{ $t('Duplicate') }}</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense color="negative" icon="sym_o_delete" :aria-label="$t('Remove')" @click="removeText">
                    <q-tooltip>{{ $t('Remove') }}</q-tooltip>
                  </q-btn>
                </div>

                <q-input
                  dense
                  outlined
                  autogrow
                  type="textarea"
                  :label="$t('Text')"
                  :hint="$t('Placeholders: {date} and {time}', { date: '{date}', time: '{time}' })"
                  :model-value="currentText.text"
                  @update:model-value="v => updateText({ text: String(v ?? '') })"
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
                    :model-value="currentText[field.key]"
                    @update:model-value="v => updateText({ [field.key]: toInt(v, field.min) })"
                  />
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">{{
                  $t('Texts rotate around the center of the canvas, like in the final collage.')
                }}</div>

                <userfile-select
                  class="q-mt-md"
                  kind="font"
                  :label="$t('Font')"
                  :model-value="currentText.font"
                  @update:model-value="v => updateText({ font: v || null })"
                />
                <div v-if="!currentText.font && currentText.text" class="text-caption text-negative">
                  {{ $t('Choose a font, otherwise creating the collage fails.') }}
                </div>

                <color-input
                  class="q-mt-md"
                  :label="$t('Color')"
                  :model-value="currentText.color"
                  @update:model-value="v => updateText({ color: v ?? '' })"
                />
              </div>
              <div v-else class="text-caption text-grey-7">{{ $t('Select a text in the preview or the list to edit it.') }}</div>
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
  type TextsConfig,
  newMergeDefinition,
  newText,
  sanitizeDefinition,
  sanitizeText,
} from './collage'

/**
 * Edit the collage layout visually, with a live preview using sample images:
 * position, size and rotation of the images, canvas size, background, overlay and texts.
 * Works on a copy; "apply" hands the result back to the config form, which is saved as usual.
 */

type SlotNumberKey = 'pos_x' | 'pos_y' | 'width' | 'height' | 'rotate' | 'pos_z'
type TextNumberKey = 'pos_x' | 'pos_y' | 'font_size' | 'rotate'

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

const { config } = defineProps<{ config: CollageProcessing }>()
const emit = defineEmits<{ apply: [config: CollageProcessing]; cancel: [] }>()

const { t } = useI18n()
const mediacollectionStore = useMediacollectionStore()

const draft = ref<CollageProcessing>(
  cloneDeep({ ...config, merge_definition: config.merge_definition ?? [], canvas_texts: config.canvas_texts ?? [] })
)
const selected = ref<number | null>(draft.value.merge_definition.length ? 0 : null)
const selectedText = ref<number | null>(null)
const tab = ref<'images' | 'canvas' | 'texts'>('images')

const previewOnly = ref(false)
const showOutlines = useLocalStorage('collageEditorShowOutlines', true)
const showFront = ref(true)
const showTexts = ref(true)
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
  selectedText.value = null
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

// ---------- texts ----------

const currentText = computed(() => (selectedText.value === null ? null : (draft.value.canvas_texts[selectedText.value] ?? null)))

const selectText = (index: number) => {
  selectedText.value = index
  selected.value = null
}

const updateText = (patch: Partial<TextsConfig>) => {
  if (selectedText.value === null || !currentText.value) return
  draft.value.canvas_texts[selectedText.value] = sanitizeText({ ...currentText.value, ...patch })
}

const addText = () => {
  const text = {
    ...newText(),
    text: t('Your text'),
    pos_x: Math.round(draft.value.canvas_width / 2 - 100),
    pos_y: Math.round(draft.value.canvas_height / 2),
  }
  draft.value.canvas_texts.push(text)
  draft.value.canvas_texts_enable = true
  showTexts.value = true
  selectText(draft.value.canvas_texts.length - 1)
}

const duplicateText = () => {
  if (selectedText.value === null || !currentText.value) return
  const copy = sanitizeText({ ...cloneDeep(currentText.value), pos_y: currentText.value.pos_y + currentText.value.font_size * 1.5 })
  draft.value.canvas_texts.splice(selectedText.value + 1, 0, copy)
  selectedText.value += 1
}

const removeText = () => {
  if (selectedText.value === null) return
  const list = draft.value.canvas_texts
  list.splice(selectedText.value, 1)
  selectedText.value = list.length ? Math.min(selectedText.value, list.length - 1) : null
}

// selecting something in the preview shows its settings
watch(selected, value => {
  if (value !== null) tab.value = 'images'
})
watch(selectedText, value => {
  if (value !== null) tab.value = 'texts'
})

// ---------- keyboard ----------

// arrow keys nudge the selected image or text, unless typing in a field
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
  } else if (currentText.value) {
    evt.preventDefault()
    updateText({ pos_x: currentText.value.pos_x + move[0], pos_y: currentText.value.pos_y + move[1] })
  }
}

watch(previewOnly, value => {
  if (value) {
    selected.value = null
    selectedText.value = null
  }
})

const apply = () => {
  emit('apply', {
    ...draft.value,
    merge_definition: draft.value.merge_definition.map(sanitizeDefinition),
    canvas_texts: draft.value.canvas_texts.map(sanitizeText),
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
