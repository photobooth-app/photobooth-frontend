// use this for now, need to improve REST api to clean DTOs, then use the automatic code generation using hey-api
export interface MediaItem {
  caption: string
  datetime: number
  filename: string
  full: string
  hide: boolean
  id: string
  media_type: string
  original: string
  preview: string
  share_url: string
  thumbnail: string
}
