<template>
  <q-layout id="standalone-layout" view="hHh lpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'StandaloneLayout',
  components: {},
  computed: {},
});
</script>
