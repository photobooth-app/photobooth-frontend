<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-secondary text-white">
      <q-toolbar>
        <q-tabs mobile-arrows shrink>
          <q-route-tab
            class="bg-primary"
            to="/"
            icon="arrow_back_ios_new"
            label="back"
          />
          <q-route-tab to="/admin" icon="dashboard" label="Dashboard" />

          <q-route-tab
            to="/admin/gallery"
            icon="photo_library"
            label="Gallery"
          />
          <q-route-tab to="/admin/config" icon="settings" label="Config" />
          <q-route-tab to="/admin/files" icon="folder_shared" label="Files" />
          <q-route-tab to="/admin/status" icon="insights" label="Status" />

          <!--<q-route-tab to="/admin/playground" icon="quiz" label="Playground" />-->
          <q-route-tab to="/admin/help" icon="help" label="Help" />
        </q-tabs>

        <q-space />

        <q-toolbar-title> Admin Center </q-toolbar-title>
        <a href="https://photobooth-app.org/" target="_new"
          ><img
            src="icons/logo-notext-white-transparent.png"
            style="max-height: 40px"
        /></a>
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
