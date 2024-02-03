<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-secondary text-white">
      <q-toolbar>
        <q-tabs mobile-arrows shrink>
          <q-route-tab class="bg-primary" to="/" icon="arrow_back_ios_new" label="back" />
          <q-route-tab to="/admin" icon="dashboard" label="Dashboard" />

          <q-route-tab to="/admin/gallery" icon="photo_library" label="Gallery" />
          <!-- name based so even if children are active, the config tab is highlighted -->
          <q-route-tab :to="{ name: 'config' }" icon="settings" label="Config" />
          <q-route-tab to="/admin/files" icon="folder_shared" label="Files" />
          <q-route-tab to="/admin/status" icon="insights" label="Status" />

          <!--<q-route-tab to="/admin/playground" icon="quiz" label="Playground" />-->
          <q-route-tab to="/admin/help" icon="help" label="Help" />
        </q-tabs>

        <q-space />

        <q-toolbar-title><span v-html="$t('TITLE_ADMIN_CENTER')"></span></q-toolbar-title>
        <language-switcher></language-switcher>
        <a href="https://photobooth-app.org/" target="_new"><img src="icons/logo-notext-white-transparent.png" style="max-height: 40px" /></a>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from "vue";
import LanguageSwitcher from "../components/LanguageSwitcher.vue";

export default {
  // name: 'LayoutName',
  components: { LanguageSwitcher },
  setup() {},
};
</script>
