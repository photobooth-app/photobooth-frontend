import { defineStore } from 'pinia';

export const useStateStore = defineStore('state-store', {
  state: () => ({
    state: null,
    typ: null,
    total_captures_to_take: null,
    remaining_captures_to_take: null,
    number_captures_taken: null,
    duration: null,
    last_captured_mediaitems: [],
    ask_user_for_approval: null,
  }),
  actions: {},
  getters: {},
});
