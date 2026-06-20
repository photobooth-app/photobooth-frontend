import { defineStore, acceptHMRUpdate } from 'pinia'

export const useStateStore = defineStore('state-store', {
  state: () => ({
    source: null as string | null,
    target: null as string | null,

    jobmodel: {
      typ: null as string | null,
      total_captures_to_take: null as number | null,
      remaining_captures_to_take: null as number | null,
      number_captures_taken: null as number | null,
      duration: 0 as number,
      present_mediaitem_id: null as string | null,
      approval_id: null as string | null,
      configuration_set: {},
    },
  }),
  actions: {},
  getters: {
    isStateIdle: state => (state.source === null && state.target === null) || state.target == 'finished',
    isStateCountdown: state => state.target == 'counting' && state.jobmodel.duration > 0,
    isStateRecording: state => state.target == 'capture' && state.jobmodel.typ == 'video',
    isStateProcessing: state => state.target == 'completed',
    isStateCapture: state => state.target == 'capture',
    isStateApproval: state => state.target == 'approval',
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStateStore, import.meta.hot))
}
