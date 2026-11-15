import type { InjectionKey } from 'vue'
import type { components } from '@/dto/api'

export type CollageProcessing = components['schemas']['CollageProcessing']
export type CollageMergeDefinition = components['schemas']['CollageMergeDefinition']
export type TextsConfig = components['schemas']['TextsConfig']

/** ui schema element type of the editor button inside the collage form */
export const COLLAGE_EDITOR_BUTTON = 'CollageEditorButton'
/** provided by the collage form renderer, opens its editor */
export const OPEN_COLLAGE_EDITOR: InjectionKey<() => void> = Symbol('openCollageEditor')

export type SampleSource = 'placeholder' | 'gallery'

/** default values of a new merge definition, same as the backend model */
export const newMergeDefinition = (): CollageMergeDefinition => ({
  description: '',
  pos_x: 50,
  pos_y: 50,
  pos_z: 0,
  width: 600,
  height: 600,
  rotate: 0,
  predefined_image: null,
  image_filter: 'original',
})

/** files in the config are relative to the backend working directory (userdata/...), the backend serves them at /userdata/... */
export const userfileUrl = (path: string | null | undefined): string | null => {
  if (!path) return null
  return `/${path.replace(/^\.?\/+/, '').replace(/\\/g, '/')}`
}

const PLACEHOLDER_COLORS = ['#1e88e5', '#e53935', '#43a047', '#fb8c00', '#8e24aa', '#00897b', '#6d4c41', '#3949ab']

/**
 * Sample photo shown instead of a real capture: a landscape picture (3:2, like most cameras) with the capture number,
 * so cropping (the backend fits images by covering the slot) is visible in the preview.
 */
export const placeholderImage = (captureNumber: number): string => {
  const color = PLACEHOLDER_COLORS[(captureNumber - 1) % PLACEHOLDER_COLORS.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1000" viewBox="0 0 1500 1000">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#212121"/></linearGradient></defs>
<rect width="1500" height="1000" fill="url(#g)"/>
<g fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="6"><rect x="250" y="0" width="1000" height="1000"/><line x1="750" y1="0" x2="750" y2="1000"/><line x1="0" y1="500" x2="1500" y2="500"/></g>
<circle cx="750" cy="390" r="150" fill="#ffffff" fill-opacity="0.85"/>
<path d="M480 1000c0-170 120-300 270-300s270 130 270 300z" fill="#ffffff" fill-opacity="0.85"/>
<text x="750" y="440" font-family="sans-serif" font-size="150" font-weight="700" text-anchor="middle" fill="${color}">${captureNumber}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** the backend expects whole, non negative numbers for positions and layers */
export const sanitizeDefinition = (def: CollageMergeDefinition): CollageMergeDefinition => ({
  ...def,
  pos_x: Math.max(0, Math.round(def.pos_x)),
  pos_y: Math.max(0, Math.round(def.pos_y)),
  pos_z: Math.max(0, Math.round(def.pos_z)),
  width: Math.max(1, Math.round(def.width)),
  height: Math.max(1, Math.round(def.height)),
  rotate: Math.round(def.rotate),
})

export const DEFAULT_FONT = 'userdata/demoassets/fonts/Roboto-Bold.ttf'

/** default values of a new text, same as the backend model */
export const newText = (): TextsConfig => ({
  text: '',
  pos_x: 50,
  pos_y: 50,
  rotate: 0,
  font_size: 40,
  font: DEFAULT_FONT,
  color: '#cd1c18',
})

export const sanitizeText = (text: TextsConfig): TextsConfig => ({
  ...text,
  pos_x: Math.max(0, Math.round(text.pos_x)),
  pos_y: Math.max(0, Math.round(text.pos_y)),
  rotate: Math.round(text.rotate),
  font_size: Math.max(1, Math.round(text.font_size)),
})
