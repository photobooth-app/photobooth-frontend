<template>
  <q-layout view="hHh lpR fFf" class="bg-image">
    <q-page-container>
      <router-view />
      <q-page-sticky
        v-show="isSubPageDisplayHomebutton"
        position="top-left"
        :offset="[25, 25]"
      >
        <div class="q-gutter-sm">
          <q-btn color="primary" no-caps to="/">
            <q-icon left size="5em" name="arrow_back_ios_new" />
            <div>Start</div>
          </q-btn>
        </div>
      </q-page-sticky>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "MainLayout",

  components: {},
  computed: {
    isSubPageDisplayHomebutton() {
      return this.$route.path != "/" ? true : false;
    },
  },
  setup() {},
});
</script>
