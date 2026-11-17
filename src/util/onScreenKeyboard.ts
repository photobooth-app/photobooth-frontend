import { Platform } from 'quasar'
import { useLocalStorage } from '@vueuse/core'

/**
 * Whether the global in-app on-screen keyboard is enabled on this device.
 * Default: on for touch screens that are not phones/tablets (e.g. a booth touch display in kiosk mode),
 * because phones and tablets bring their own keyboard. The choice is stored per browser.
 */
export const useOnScreenKeyboardEnabled = () => useLocalStorage('onScreenKeyboardEnabled', Platform.has.touch && !Platform.is.mobile)
