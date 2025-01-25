import { defineStore, acceptHMRUpdate } from 'pinia'

export const useStateStore = defineStore('state-store', {
  state: () => ({
    state: null,
    typ: null,
    total_captures_to_take: null,
    remaining_captures_to_take: null,
    number_captures_taken: null,
    duration: 0,
    ask_user_for_approval: null,
    last_captured_mediaitem_id: null,
    configuration_set: {},
  }),
  actions: {},
  getters: {},
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStateStore, import.meta.hot))
}
