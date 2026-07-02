import { defineStore, acceptHMRUpdate } from 'pinia'
export interface JobModel {
  typ: string
  total_captures_to_take: number
  remaining_captures_to_take: number
  number_captures_taken: number
  duration: number
  present_mediaitem_id: string
  approval_id: string
  configuration_set: Record<string, unknown>
}

export const useStateStore = defineStore('state-store', {
  state: () => ({
    source: null as string | null,
    target: null as string | null,
    jobmodel: {
      typ: '',
      total_captures_to_take: 0,
      remaining_captures_to_take: 0,
      number_captures_taken: 0,
      duration: 0,
      present_mediaitem_id: '',
      approval_id: '',
      configuration_set: {},
    } as JobModel,
  }),
  actions: {},
  getters: {
    isStateIdle: state => (state.source === null && state.target === null) || state.target == 'finished',
    isStateCountdown: state => state.target == 'counting' && state.jobmodel && state.jobmodel.duration > 0,
    isStateRecording: state => state.target == 'capture' && state.jobmodel && state.jobmodel.typ == 'video',
    isStateProcessing: state => state.target == 'completed',
    isStateCapture: state => state.target == 'capture',
    isStateApproval: state => state.target == 'approval',
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStateStore, import.meta.hot))
}
