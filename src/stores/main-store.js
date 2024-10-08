import { defineStore } from 'pinia';

export const useMainStore = defineStore('main-store', {
  state: () => ({
    logrecords: [],

    information: {
      /* system */
      cpu1_5_15: [null, null, null],
      memory: {
        total: null,
        available: null,
        percent: null,
        used: null,
        free: null,
      },
      cma: {
        CmaTotal: null,
        CmaFree: null,
      },
      disk: {
        total: null,
        used: null,
        free: null,
        percent: null,
      },
      backends: {
        primary: {},
        secondary: {},
      },
      battery_percent: null,
      temperatures: {},

      /* platform */
      version: null,
      platform_system: null,
      platform_release: null,
      platform_machine: null,
      platform_python_version: null,
      platform_node: null,
      platform_cpu_count: null,
      data_directory: null,
      python_executable: null,

      /* stats */
      stats_counter: {},
    },

    lastHeartbeat: null,
  }),
  actions: {},
  getters: {},
});
