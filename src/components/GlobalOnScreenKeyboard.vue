<template>
  <transition name="global-osk">
    <div v-if="enabled && target" ref="panel" class="global-osk" @mousedown.prevent>
      <div class="global-osk__bar">
        <q-btn flat round dense color="grey-8" icon="sym_o_keyboard_hide" :aria-label="$t('Toggle on-screen keyboard')" @click="close" />
      </div>
      <on-screen-keyboard
        v-model:mode="mode"
        external
        :decimal="isNumberInput"
        :layout="keyboardLayout"
        @char="insert"
        @backspace="backspace"
        @enter="enter"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import OnScreenKeyboard, { type KeyboardMode } from '@/components/OnScreenKeyboard.vue'
import { useOnScreenKeyboardEnabled } from '@/util/onScreenKeyboard'

/**
 * App-wide on-screen keyboard: appears whenever a text-like field gets focus and types into that field.
 * Works for any input without touching the input components, so admin config forms, dialogs and share forms are covered.
 * Fields with inputmode="none" are skipped, they bring their own keyboard (e.g. the login page).
 */

type EditableElement = HTMLInputElement | HTMLTextAreaElement

const TEXT_INPUT_TYPES = ['text', 'password', 'email', 'number', 'search', 'url', 'tel', '']

const enabled = useOnScreenKeyboardEnabled()
const { locale } = useI18n()

const target = ref<EditableElement | null>(null)
const mode = ref<KeyboardMode>('text')
const panel = ref<HTMLElement | null>(null)
// number inputs drop intermediate values like "1." or "-", so their text is kept here while typing
const numberBuffer = ref('')

const keyboardLayout = computed(() => (String(locale.value).startsWith('de') ? 'qwertz' : 'qwerty'))
const isNumberInput = computed(() => target.value instanceof HTMLInputElement && target.value.type === 'number')

const isEditable = (el: EventTarget | null): el is EditableElement => {
  if (el instanceof HTMLTextAreaElement) return !el.readOnly && !el.disabled && el.inputMode !== 'none'
  if (el instanceof HTMLInputElement) return TEXT_INPUT_TYPES.includes(el.type) && !el.readOnly && !el.disabled && el.inputMode !== 'none'
  return false
}

const onFocusIn = (evt: FocusEvent) => {
  if (!isEditable(evt.target)) return
  const el = evt.target
  if (el !== target.value) {
    const numeric = (el instanceof HTMLInputElement && el.type === 'number') || ['numeric', 'decimal'].includes(el.inputMode)
    mode.value = numeric ? 'numeric' : 'text'
    numberBuffer.value = el.value
  }
  target.value = el
}

const onFocusOut = () => {
  setTimeout(() => {
    const active = document.activeElement
    // on touch, QBtn moves focus to its internal focus helper when the finger lifts (mouse presses are already
    // prevented via mousedown.prevent). Focus inside the keyboard is never a reason to close: give it back to the field.
    if (target.value && active && panel.value?.contains(active)) {
      target.value.focus({ preventScroll: true })
      return
    }
    // focus may move directly to another field; only hide if nothing editable is focused afterwards
    if (!isEditable(active)) target.value = null
  }, 0)
}

const supportsSelection = (el: EditableElement) => {
  try {
    return el.selectionStart !== null
  } catch {
    return false // e.g. type=email/number throw or return null
  }
}

const emitInput = (el: EditableElement) => el.dispatchEvent(new Event('input', { bubbles: true }))

const setNumberValue = (el: HTMLInputElement, text: string) => {
  numberBuffer.value = text
  el.value = text
  // only report complete numbers, an incomplete one like "1." would reset the bound model
  if (el.value === text) emitInput(el)
}

const insert = (text: string) => {
  const el = target.value
  if (!el) return
  if (el instanceof HTMLInputElement && el.type === 'number') return setNumberValue(el, numberBuffer.value + text)
  if (supportsSelection(el)) {
    el.setRangeText(text, el.selectionStart ?? el.value.length, el.selectionEnd ?? el.value.length, 'end')
  } else {
    el.value += text
  }
  emitInput(el)
}

const backspace = () => {
  const el = target.value
  if (!el) return
  if (el instanceof HTMLInputElement && el.type === 'number') return setNumberValue(el, numberBuffer.value.slice(0, -1))
  if (supportsSelection(el)) {
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length
    if (start === end && start === 0) return
    el.setRangeText('', start === end ? start - 1 : start, end, 'end')
  } else {
    el.value = el.value.slice(0, -1)
  }
  emitInput(el)
}

const enter = () => {
  const el = target.value
  if (!el) return
  if (el instanceof HTMLTextAreaElement) return insert('\n')

  // behave like a hardware Enter: let @keydown/@keyup.enter handlers run, otherwise submit the form
  const init = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true }
  const notHandled = el.dispatchEvent(new KeyboardEvent('keydown', init))
  el.dispatchEvent(new KeyboardEvent('keyup', init))
  if (notHandled && el.form) el.form.requestSubmit()
  else if (notHandled) close()
}

const close = () => {
  target.value?.blur()
  target.value = null
}

// keep the focused field visible above the keyboard
watch([target, enabled], async ([el, isEnabled]) => {
  await nextTick()
  const height = el && isEnabled && panel.value ? panel.value.offsetHeight : 0
  document.documentElement.style.setProperty('--global-osk-height', `${height}px`)
  document.body.classList.toggle('global-osk-open', height > 0)
  if (el && height > 0) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
})

onMounted(() => {
  document.addEventListener('focusin', onFocusIn)
  document.addEventListener('focusout', onFocusOut)
  // a field may already be focused (autofocus) before this component mounted
  if (isEditable(document.activeElement)) onFocusIn({ target: document.activeElement } as unknown as FocusEvent)
})

onBeforeUnmount(() => {
  document.removeEventListener('focusin', onFocusIn)
  document.removeEventListener('focusout', onFocusOut)
  document.body.classList.remove('global-osk-open')
})
</script>

<style lang="scss">
.global-osk {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9000; // above dialogs (6000) and menus
  padding: 4px 8px 10px;
  background: rgba(245, 245, 245, 0.97);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.15);

  &__bar {
    display: flex;
    justify-content: flex-end;
    max-width: 720px;
    margin: 0 auto;
  }
}

body.body--dark .global-osk {
  background: rgba(30, 30, 30, 0.97);
}

// make room so content and dialogs can scroll above the keyboard
body.global-osk-open {
  padding-bottom: var(--global-osk-height, 0px);

  .q-dialog__inner {
    padding-bottom: calc(var(--global-osk-height, 0px) + 8px);
  }
}

.global-osk-enter-active,
.global-osk-leave-active {
  transition: transform 0.15s ease-out;
}

.global-osk-enter-from,
.global-osk-leave-to {
  transform: translateY(100%);
}
</style>
