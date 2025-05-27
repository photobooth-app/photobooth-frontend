<template>
  <q-layout id="standalone-layout" view="hHh lpR fFf">
    <q-page-container>
      <router-view />

      <!-- in main layout (main app) always show the back button-->
      <ReturnButton v-if="isSubPage" @trigger-return="$router.back()"></ReturnButton>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import ReturnButton from '../components/ReturnButton.vue'

const route = useRoute()
const isSubPage = computed(() => route.matched.length > 1 && route.matched[0].path != route.matched[1].path)
</script>
