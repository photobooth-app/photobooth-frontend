// use this for now, need to improve REST api to clean DTOs, then use the automatic code generation using hey-api
export interface MediaItem {
  id: string
  job_identifier: string
  media_type: string
  created_at: string
  unprocessed: string
  pipeline_config: object
  processed: string
  show_in_gallery: boolean
}
