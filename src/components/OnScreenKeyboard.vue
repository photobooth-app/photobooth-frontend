<template>
  <div class="on-screen-keyboard" :class="`on-screen-keyboard--${mode}`">
    <div v-for="(row, rowIndex) in rows" :key="`${mode}-${layer}-${rowIndex}`" class="on-screen-keyboard__row">
      <q-btn
        v-for="key in row"
        :key="key.id"
        unelevated
        no-caps
        :color="key.kind === 'char' ? 'grey-3' : key.kind === 'enter' ? 'primary' : 'grey-5'"
        :text-color="key.kind === 'enter' ? 'white' : 'dark'"
        :icon="key.icon"
        :label="key.label"
        :aria-label="key.ariaLabel ?? key.label"
        class="on-screen-keyboard__key"
        :class="[`on-screen-keyboard__key--${key.kind}`, { 'on-screen-keyboard__key--active': key.active }]"
        :style="{ flexGrow: key.grow ?? 1 }"
        @mousedown.prevent
        @click="press(key)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Touch keyboard rendered inside the app.
 * Needed because system on-screen keyboards do not show up above a browser running in kiosk mode.
 * Keys do not take focus (mousedown.prevent), so a focused input stays focused while typing.
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

const model = defineModel<string | null>({ default: '' })
const mode = defineModel<KeyboardMode>('mode', { default: 'numeric' })

const { layout = 'qwerty' } = defineProps<{
  /** letter arrangement of the text keyboard */
  layout?: 'qwerty' | 'qwertz'
}>()

const emit = defineEmits<{
  enter: []
}>()

const shift = ref(false)
const layer = ref<'letters' | 'symbols'>('letters')

const charKeys = (chars: string): KeyDef[] => [...chars].map(c => ({ id: `char-${c}`, kind: 'char', label: c, value: c }))

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
      [enterKey],
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
      model.value = current + key.value
      if (shift.value) shift.value = false // one-shot shift like on phones
      break
    case 'backspace':
      model.value = current.slice(0, -1)
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
</script>

<style lang="scss">
.on-screen-keyboard {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  margin: 0 auto;
  user-select: none;
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
    flex-basis: 0;
    min-width: 0;
    min-height: 52px;
    font-size: 1.25rem;
    border-radius: 8px;
    padding: 0;
  }

  &--numeric &__key {
    min-height: 64px;
    font-size: 1.6rem;
  }

  &__key--mode,
  &__key--layer {
    font-size: 1rem;
  }

  &__key--active {
    outline: 2px solid var(--q-primary);
  }
}
</style>
