import { defineStore } from 'pinia';
//https://stackoverflow.com/a/75060220

const STATES = {
  INIT: 0,
  DONE: 1,
  WIP: 2,
  ERROR: 3,
};

export const useMediacollectionStore = defineStore('mediacollection-store', {
  state: () => ({
    collection: [],

    mostRecentItemId: null,

    storeState: STATES.INIT,
  }),
  actions: {
    initStore(forceReload = false) {
      console.log('loading store');
      if (this.isLoaded && forceReload == false) {
        console.log('items loaded once already, skipping');
        return;
      }

      this.storeState = STATES.WIP;

      fetch('/api/mediacollection/getitems')
        .then((response) => response.json())
        .then((data) => {
          console.log('loadMediacollection finished successfully');
          console.log(data);

          this.collection = data;

          this.storeState = STATES.DONE;
        })
        .catch((e) => {
          console.log('loadMediacollection failed', e);
          console.log(e);
          this.storeState = STATES.ERROR;
        });
    },
    getIndexOfItemId(id) {
      return this.collection.findIndex((item) => item.id === id);
    },

    // add new item on first position to store
    addMediaitem(mediaitem) {
      this.collection.unshift(mediaitem);
    },

    // remove mediaitem from store
    removeMediaitem(mediaitem) {
      const removed_mediaitem = this.collection.splice(this.getIndexOfItemId(mediaitem.id), 1);
      if (removed_mediaitem.length == 0) console.log('no item removed from collection, maybe it was deleted by UI earlier already');
      else console.log(`${removed_mediaitem.length} mediaitem deleted`);
    },
  },
  getters: {
    isLoaded() {
      return this.storeState === STATES.DONE;
    },
    isLoading() {
      return this.storeState === STATES.WIP;
    },

    collection_number_of_items() {
      //return Object.keys(this.collection).length;
      return this.collection.length;
    },
  },
});
