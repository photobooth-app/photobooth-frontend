import { defineStore, acceptHMRUpdate } from 'pinia'
import { type MediaItem } from '../dto/dto'
import { remoteProcedureCall } from '../util/fetch_api'
const STATES = {
  //https://stackoverflow.com/a/75060220
  INIT: 0,
  DONE: 1,
  WIP: 2,
  ERROR: 3,
}

export const useMediacollectionStore = defineStore('mediacollection-store', {
  state: () => ({
    collection: [] as MediaItem[],

    storeState: STATES.INIT,
  }),
  actions: {
    initStore(forceReload = false) {
      console.log('loading store')
      if (this.isLoaded && forceReload == false) {
        console.log('items loaded once already, skipping')
        return
      }

      this.storeState = STATES.WIP

      fetch('/api/mediacollection/')
        .then((response) => response.json())
        .then((data) => {
          console.log('loadMediacollection finished successfully')
          console.log(data)

          this.collection = data

          this.storeState = STATES.DONE
        })
        .catch((e) => {
          console.log('loadMediacollection failed', e)
          console.log(e)
          this.storeState = STATES.ERROR
        })
    },
    getIndexOfItemId(id: string) {
      return this.collection.findIndex((item) => item.id == id)
    },
    getMediaitemById(id: string) {
      return this.collection.find((mediaitem) => mediaitem.id == id)
    },
    // add new item on first position to store
    addMediaitem(mediaitem: MediaItem) {
      this.collection.unshift(mediaitem)
    },

    // remove mediaitem from store
    removeMediaitem(mediaitem: MediaItem) {
      const removed_mediaitem = this.collection.splice(this.getIndexOfItemId(mediaitem.id), 1)
      if (removed_mediaitem.length == 0) console.log('no item removed from collection, maybe it was deleted by UI earlier already')
      else console.log(`${removed_mediaitem.length} mediaitem deleted`)
    },
    deleteItem(id: string) {
      remoteProcedureCall(`/api/mediacollection/${id}`, 'DELETE')
    },
    // remove mediaitem from store
    deleteAllItems() {
      remoteProcedureCall('/api/mediacollection/', 'DELETE')

      this.initStore(true)
      // updated store only on the device invoking the action.
      // other devices still have the old DB - since we consider this as admin function only it is ok for now.
    },
  },
  getters: {
    isLoaded() {
      return this.storeState === STATES.DONE
    },
    isLoading() {
      return this.storeState === STATES.WIP
    },

    collection_number_of_items() {
      //return Object.keys(this.collection).length;
      console.log(this.collection.length)
      return this.collection.length
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMediacollectionStore, import.meta.hot))
}