<template>
  <q-page padding>
    <div class="fixed-center" align="center">
      <q-spinner-comment color="negative" size="10em" />

      <div align="right">
        <q-chip dense color="negative" text-color="white">Connecting...</q-chip>
      </div>
      <q-btn class="q-mt-xl" label="Reload" to="/" />
    </div>
    <div class="fixed-bottom q-ma-lg" align="center">
      Please wait. Try to reload, if the app does not continue. <br />Otherwise
      check server for errors in log and browser console.
    </div>
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
};
</script>
