<template>
  <q-layout view="hHh lpR fFf" class="bg-image">
    <q-header elevated class="bg-secondary text-white">
      <q-toolbar>
        <q-tabs>
          <img src="stream.mjpg" style="height: 90px" />
          <q-route-tab to="/" icon="arrow_back_ios_new" label="Booth" />
          <q-route-tab to="/admin" icon="dashboard" label="Dashboard" />
          <q-route-tab
            to="/admin/gallery"
            icon="photo_library"
            label="Gallery"
          />
          <q-route-tab to="/admin/status" icon="insights" label="Status" />
          <q-route-tab to="/admin/playground" icon="quiz" label="Playground" />
          <q-route-tab to="/admin/config" icon="quiz" label="Config" />
        </q-tabs>

        <q-space />

        <q-toolbar-title shrink> qPhotobooth Admin </q-toolbar-title>

        <q-space />

        <q-btn
          shrink
          stretch
          flat
          href="/docs"
          target="_blank"
          icon="description"
          label="API Docs"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from "vue";

export default {
  // name: 'LayoutName',

  setup() {},
};
</script>
