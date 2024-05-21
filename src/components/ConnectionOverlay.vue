<template>
  <q-card class="q-pa-sm">
    <q-card-section class="row items-center" style="flex-wrap: nowrap">
      <q-spinner color="negative" size="2em" />
      <span class="q-ml-sm">{{ $t('MSG_CONNECTING_TO_BACKEND') }}</span>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn v-close-popup :label="$t('BTN_LABEL_RELOAD_PAGE')" color="primary" @click="reloadPage" />
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
  // name: 'ComponentName',
  setup() {
    return {};
  },
  methods: {
    reloadPage() {
      window.location.reload();
    },
  },
};
</script>
