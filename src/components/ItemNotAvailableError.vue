<template>
  <!-- usually not visible but if page is called with wrong id or the page was not closed after an item is deleted -->
  <div class="window-height window-width row justify-center items-center flex flex-center">
    <q-card class="q-pa-md no-shadow" bordered>
      <q-card-section>
        <div class="text-h5 text-weight-bold">🔎 oh no, item not found 🤷</div>
      </q-card-section>
      <q-card-section>
        <p>We have been looking everywhere but the item was not found. Maybe it was deleted?</p>
      </q-card-section>
      <q-card-section>
        <q-btn rounded color="accent" label="go back to home" class="full-width" to="/"></q-btn>
      </q-card-section>
      <q-card-section>
        <p>If this happens again, please report a bug.</p>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts"></script>
