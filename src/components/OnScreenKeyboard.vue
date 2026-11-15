<template>
  <div class="on-screen-keyboard" :class="`on-screen-keyboard--${mode}`">
    <div v-for="(row, rowIndex) in rows" :key="`${mode}-${layer}-${rowIndex}`" class="on-screen-keyboard__row">
      <!-- plain buttons instead of q-btn: no ripple, no focus handling, much cheaper on a Raspberry Pi -->
      <button
        v-for="key in row"
        :key="key.id"
        type="button"
        tabindex="-1"
        class="on-screen-keyboard__key"
        :class="[
          `on-screen-keyboard__key--${key.kind}`,
          { 'on-screen-keyboard__key--active': key.active, 'on-screen-keyboard__key--pressed': pressedId === key.id },
        ]"
        :style="{ flexGrow: key.grow ?? 1 }"
        :aria-label="key.ariaLabel ?? key.label"
        @pointerdown.prevent="onPointerDown(key)"
        @pointerup="onPointerEnd"
        @pointercancel="onPointerEnd"
        @pointerleave="onPointerEnd"
        @mousedown.prevent
        @click="onClick(key, $event)"
      >
        <q-icon v-if="key.icon" :name="key.icon" />
        <template v-else>{{ key.label }}</template>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

/**
 * Touch keyboard rendered inside the app.
 * Needed because system on-screen keyboards do not show up above a browser running in kiosk mode.
 * Keys react on pointerdown (immediate, no lost taps when typing fast) and never take focus,
 * so a focused input stays focused while typing. Holding backspace repeats it.
 */

export type KeyboardMode = 'numeric' | 'text'

type KeyKind = 'char' | 'backspace' | 'enter' | 'shift' | 'layer' | 'mode' | 'space'

interface KeyDef {
  id: string
  kind: KeyKind
  label?: string
  icon?: string
  ariaLabel?: string
  value?: string
  grow?: number
  active?: boolean
}

const REPEAT_DELAY_MS = 450
const REPEAT_INTERVAL_MS = 70

const model = defineModel<string | null>({ default: '' })
const mode = defineModel<KeyboardMode>('mode', { default: 'numeric' })

const {
  layout = 'qwerty',
  decimal = false,
  external = false,
} = defineProps<{
  /** letter arrangement of the text keyboard */
  layout?: 'qwerty' | 'qwertz'
  /** add minus and decimal point keys to the numeric pad */
  decimal?: boolean
  /** do not edit v-model, only emit char/backspace so the parent can edit the target itself (e.g. at the caret) */
  external?: boolean
}>()

const emit = defineEmits<{
  enter: []
  char: [value: string]
  backspace: []
}>()

const shift = ref(false)
const layer = ref<'letters' | 'symbols'>('letters')
const pressedId = ref<string | null>(null)

// id based on the lowercase char, so toggling shift only relabels the keys instead of recreating them
const charKeys = (chars: string): KeyDef[] => [...chars].map(c => ({ id: `char-${c.toLowerCase()}`, kind: 'char', label: c, value: c }))

const backspaceKey: KeyDef = { id: 'backspace', kind: 'backspace', icon: 'sym_o_backspace', ariaLabel: 'Backspace', grow: 1.5 }
const enterKey: KeyDef = { id: 'enter', kind: 'enter', icon: 'sym_o_keyboard_return', ariaLabel: 'Enter', grow: 1.5 }

const letterRows = computed(() => (layout === 'qwertz' ? ['qwertzuiop', 'asdfghjkl', 'yxcvbnm'] : ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']))

const rows = computed<KeyDef[][]>(() => {
  if (mode.value === 'numeric') {
    return [
      charKeys('123'),
      charKeys('456'),
      charKeys('789'),
      [{ id: 'mode', kind: 'mode', label: 'ABC', ariaLabel: 'Letters' }, ...charKeys('0'), backspaceKey],
      decimal ? [...charKeys('-.'), { ...enterKey, grow: 1 }] : [enterKey],
    ]
  }

  const bottomRow: KeyDef[] = [
    { id: 'mode', kind: 'mode', label: '123', ariaLabel: 'Numbers', grow: 1.5 },
    {
      id: 'layer',
      kind: 'layer',
      label: layer.value === 'letters' ? '#+=' : 'abc',
      ariaLabel: layer.value === 'letters' ? 'Symbols' : 'Letters',
      grow: 1.5,
    },
    { id: 'space', kind: 'space', icon: 'sym_o_space_bar', ariaLabel: 'Space', value: ' ', grow: 5 },
    enterKey,
  ]

  if (layer.value === 'symbols') {
    return [charKeys('1234567890'), charKeys('!@#$%^&*()'), [...charKeys('-_=+.,:;?/'), backspaceKey], charKeys('\'"<>[]{}~\\|'), bottomRow]
  }

  const [top, middle, bottom] = letterRows.value.map(r => (shift.value ? r.toUpperCase() : r))
  return [
    charKeys('1234567890'),
    charKeys(top),
    charKeys(middle),
    [{ id: 'shift', kind: 'shift', icon: 'sym_o_shift', ariaLabel: 'Shift', grow: 1.5, active: shift.value }, ...charKeys(bottom), backspaceKey],
    bottomRow,
  ]
})

const press = (key: KeyDef) => {
  const current = model.value ?? ''

  switch (key.kind) {
    case 'char':
    case 'space':
      if (external) emit('char', key.value ?? '')
      else model.value = current + key.value
      if (shift.value) shift.value = false // one-shot shift like on phones
      break
    case 'backspace':
      if (external) emit('backspace')
      else model.value = current.slice(0, -1)
      break
    case 'enter':
      emit('enter')
      break
    case 'shift':
      shift.value = !shift.value
      break
    case 'layer':
      layer.value = layer.value === 'letters' ? 'symbols' : 'letters'
      break
    case 'mode':
      mode.value = mode.value === 'numeric' ? 'text' : 'numeric'
      break
  }
}

let repeatDelay: ReturnType<typeof setTimeout> | null = null
let repeatInterval: ReturnType<typeof setInterval> | null = null

const stopRepeat = () => {
  if (repeatDelay !== null) clearTimeout(repeatDelay)
  if (repeatInterval !== null) clearInterval(repeatInterval)
  repeatDelay = repeatInterval = null
}

const onPointerDown = (key: KeyDef) => {
  stopRepeat()
  pressedId.value = key.id
  press(key)
  if (key.kind === 'backspace') {
    repeatDelay = setTimeout(() => {
      repeatInterval = setInterval(() => press(key), REPEAT_INTERVAL_MS)
    }, REPEAT_DELAY_MS)
  }
}

const onPointerEnd = () => {
  stopRepeat()
  pressedId.value = null
}

// real mouse/touch presses are handled on pointerdown already (event.detail > 0);
// only clicks without a pointer (assistive technology, scripted) are handled here
const onClick = (key: KeyDef, evt: MouseEvent) => {
  if (evt.detail === 0) press(key)
}

onBeforeUnmount(stopRepeat)
</script>

<style lang="scss">
.on-screen-keyboard {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  margin: 0 auto;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;

  &--numeric {
    max-width: 320px;
  }

  &--text {
    max-width: 720px;
  }

  &__row {
    display: flex;
    gap: 6px;
  }

  &__key {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-basis: 0;
    min-width: 0;
    min-height: 52px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: #eeeeee;
    color: #1d1d1d;
    font: inherit;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    .q-icon {
      font-size: 1.5em;
    }
  }

  &--numeric &__key {
    min-height: 64px;
    font-size: 1.6rem;
  }

  &__key--backspace,
  &__key--shift,
  &__key--layer,
  &__key--mode {
    background: #bdbdbd;
  }

  &__key--enter {
    background: var(--q-primary);
    color: #ffffff;
  }

  &__key--mode,
  &__key--layer {
    font-size: 1rem;
  }

  &--numeric &__key--mode {
    font-size: 1.1rem;
  }

  &__key--active {
    outline: 2px solid var(--q-primary);
  }

  // instant feedback without animations, cheap to render
  &__key--pressed {
    background-image: linear-gradient(rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.18));
  }
}

body.body--dark .on-screen-keyboard__key {
  background: #424242;
  color: #f5f5f5;

  &--backspace,
  &--shift,
  &--layer,
  &--mode {
    background: #616161;
  }

  &--enter {
    background: var(--q-primary);
    color: #ffffff;
  }
}
</style>
