import { defineStore, acceptHMRUpdate } from 'pinia'

export const useMainStore = defineStore('main-store', {
  state: () => ({
    logrecords: [] as object[],

    information: {
      /* system */
      cpu_percent: 0,
      memory: {
        total: 0,
        available: 0,
        percent: 0,
        used: 0,
        free: 0,
      },
      cma: {
        CmaTotal: 0,
        CmaFree: 0,
      },
      disk: {
        total: 0,
        used: 0,
        free: 0,
        percent: 0,
      },
      backends: {
        primary: {},
        secondary: {},
      },
      battery_percent: 0,
      temperatures: {},

      /* platform */
      version: 'unknown',
      platform_system: 'unknown',
      platform_release: 'unknown',
      platform_machine: 'unknown',
      platform_python_version: 'unknown',
      platform_node: 'unknown',
      platform_cpu_count: 'unknown',
      model: 'unknown',
      data_directory: 'unknown',
      python_executable: 'unknown',

      /* stats */
      stats_counter: {},

      /* limits */
      limits_counter: {},

      /* mediacollection */
      mediacollection: {},
    },
  }),
  actions: {},
  getters: {},
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot))
}
