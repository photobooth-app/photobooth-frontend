<template>
  <q-layout id="admin-layout" view="hHh lpR fFf">
    <q-header class="bg-secondary text-white">
      <q-toolbar class="q-pa-none">
        <q-btn class="q-mx-sm" stack to="/" icon="arrow_back_ios_new" :label="$t('BTN_LABEL_BACK')" />
        <q-tabs mobile-arrows shrink stretch>
          <q-route-tab to="/admin" icon="dashboard" :label="$t('TAB_LABEL_DASHBOARD')" />

          <!--q-route-tab to="/admin/gallery" icon="photo_library" :label="$t('TAB_LABEL_GALLERY')" /-->
          <!-- name based so even if children are active, the config tab is highlighted -->
          <q-route-tab :to="{ name: 'config' }" icon="settings" :label="$t('TAB_LABEL_CONFIG')" />
          <q-route-tab to="/admin/files" icon="folder_shared" :label="$t('TAB_LABEL_FILES')" />
          <q-route-tab to="/admin/status" icon="insights" :label="$t('TAB_LABEL_STATUS')" />
          <q-btn-dropdown auto-close stretch flat label="">
            <q-list>
              <q-item to="/admin/1ststart">
                <q-item-section avatar> <q-icon name="info" /> </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('1st Start') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item to="/admin/logs">
                <q-item-section avatar> <q-icon name="list" /> </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('Logs') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/admin/help">
                <q-item-section avatar> <q-icon name="help" /> </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('TAB_LABEL_HELP') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item href="/api/doc" target="_blank">
                <q-item-section avatar> <q-icon name="api" /> </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('Rest-API documentation') }}</q-item-label>
                </q-item-section>
                <q-item-section side> <q-icon name="open_in_new" /> </q-item-section>
              </q-item>
              <q-item href="https://photobooth-app.org/" target="_blank">
                <q-item-section avatar> <q-icon name="link" /> </q-item-section>
                <q-item-section>
                  <!--eslint-disable-next-line @intlify/vue-i18n/no-raw-text-->
                  <q-item-label>photobooth-app.org</q-item-label>
                </q-item-section>
                <q-item-section side> <q-icon name="open_in_new" /> </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-tabs>

        <q-toolbar-title align="right" class="q-mr-lg">
          <span>{{ $t('TITLE_ADMIN_CENTER') }}</span>
        </q-toolbar-title>

        <div>
          <a href="https://photobooth-app.org/" target="_new" class="q-mr-lg">
            <img src="icons/logo-notext-white-transparent.png" style="max-height: 40px" />
          </a>
        </div>

        <div>
          <q-btn class="q-mx-sm" stack icon="logout" :label="$t('Sign out')" @click="click_logout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { logout } from '../util/auth';

export default {
  setup() {
    return {};
  },
  // name: 'LayoutName',
  methods: {
    click_logout() {
      logout();
      this.$router.push('/');
    },
  },
};
</script>
