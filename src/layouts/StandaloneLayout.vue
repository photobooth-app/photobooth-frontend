<template>
  <q-layout view="hHh lpR fFf" class="bg-image">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "StandaloneLayout",
  components: {},
  computed: {},
  setup () { },
});
</script>
