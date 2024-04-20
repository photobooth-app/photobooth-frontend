<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <router-view />

      <!-- auto-start slideshow after timeout -->
      <RouteAfterTimeout
        v-if="uiSettingsStore.uiSettings.show_automatic_slideshow_timeout > 0"
        route="/slideshow/random"
        :timeout-ms="uiSettingsStore.uiSettings.show_automatic_slideshow_timeout * 1000"
        :warning-message="$t('MSG_WARN_BEFORE_AUTO_SLIDESHOW')"
      ></RouteAfterTimeout>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue';
import { useStateStore } from '../stores/state-store.js';
import { useUiSettingsStore } from '../stores/ui-settings-store.js';
import { useRouter } from 'vue-router';
import RouteAfterTimeout from 'src/components/RouteAfterTimeout.vue';

export default defineComponent({
  name: 'MainLayout',

  components: { RouteAfterTimeout },
  setup() {
    const stateStore = useStateStore();
    const uiSettingsStore = useUiSettingsStore();
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

    return {
      // you can return the whole store instance to use it in the template
      uiSettingsStore,
    };
  },
  computed: {},
});
</script>
