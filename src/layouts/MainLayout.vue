<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import { useStateStore } from "../stores/state-store.js";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "MainLayout",

  components: {},
  computed: {},
  setup() {
    const stateStore = useStateStore();
    const router = useRouter();

    // watch state to force router to "/" if a capture is triggered
    stateStore.$subscribe((mutation, state) => {
      if (state.state == "counting" && router.path != "/") {
        // quick fix: receive "counting" state but not on indexpage, push router to index
        console.log("counting state received, pushing to index page to countdown");

        router.push("/");
      }
      if (state.state == "present_capture") {
        router.push({ path: `/itempresenter` });
      }
      if (state.state == "approve_capture" && state.ask_user_for_approval) {
        router.push({ path: `/itemapproval` });
      }
    });
  },
});
</script>
