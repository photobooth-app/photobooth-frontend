<template>
  <q-layout id="slideshow-layout" view="hHh lpR fFf">
    <q-page-container class="fullscreen">
      <router-view />

      <q-page-sticky position="top-left" :offset="[25, 25]" style="/*z-index: 10000*/">
        <q-btn id="slideshow-button-to-frontpage" color="primary" rounded no-caps to="/" class="action-button">
          <q-icon left name="arrow_back_ios_new" />
          <div>{{ $t('BTN_LABEL_BACK') }}</div>
        </q-btn>
      </q-page-sticky>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue';
import { useStateStore } from '../stores/state-store.js';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'SlideshowLayout',

  components: {},
  setup() {
    const stateStore = useStateStore();
    const router = useRouter();

    // watch state to force router to "/" if a capture is triggered
    stateStore.$subscribe((mutation, state) => {
      if (state.state == 'counting' && router.path != '/') {
        // quick fix: receive "counting" state but not on indexpage, push router to index
        console.log('counting state received, pushing to index page to countdown');

        router.push('/');
      }
      if (state.state == 'present_capture') {
        router.push({ path: '/itempresenter' });
      }
      if (state.state == 'approve_capture' && state.ask_user_for_approval) {
        router.push({ path: '/itemapproval' });
      }
    });
  },
  computed: {},
});
</script>
