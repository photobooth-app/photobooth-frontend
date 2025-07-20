import { defineStore, acceptHMRUpdate } from 'pinia'
import type { components } from '../dto/api'

function defaultOnetimeInformation(): components['schemas']['SseEventOnetimeInformationRecord'] {
  return {
    version: '',
    platform_system: '',
    platform_release: '',
    platform_machine: '',
    platform_python_version: '',
    platform_node: '',
    platform_cpu_count: null,
    model: '',
    data_directory: '',
    python_executable: '',
    disk: {},
    event: 'OnetimeInformationRecord',
  }
}

function defaultIntervalInformation(): components['schemas']['SseEventIntervalInformationRecord'] {
  return {
    cpu_percent: 0,
    memory: {},
    cma: {},
    backends: {},
    stats_counter: [],
    limits_counter: [],
    battery_percent: null,
    temperatures: {},
    mediacollection: {},
    plugins: null,
    event: 'IntervalInformationRecord',
  }
}

export const useMainStore = defineStore('main-store', {
  state: () => ({
    logrecords: [] as object[],

    information_onetime: defaultOnetimeInformation(),
    information_interval: defaultIntervalInformation(),

    //   /* plugins stats */
    //   plugins: {},
    // },
  }),
  actions: {},
  getters: {},
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot))
}
