<template>
  <q-layout id="admin-layout" view="hHh lpR fFf">
    <q-header class="bg-green">
      <q-toolbar class="q-pa-none">
        <q-btn no-caps flat color="green-1" class="q-mx-sm" stack to="/" icon="sym_o_arrow_back_ios_new" :label="$t('BTN_LABEL_BACK')" />
        <q-separator vertical color="green-3"></q-separator>
        <q-tabs no-caps mobile-arrows shrink stretch active-color="white" class="text-green-1" indicator-color="green-3">
          <q-route-tab to="/admin" icon="sym_o_dashboard" :label="$t('TAB_LABEL_DASHBOARD')" />
          <!-- name based so even if children are active, the config tab is highlighted -->
          <q-route-tab :to="{ name: 'config' }" icon="sym_o_settings" :label="$t('TAB_LABEL_CONFIG')" />
          <q-route-tab to="/admin/files" icon="sym_o_folder_shared" :label="$t('TAB_LABEL_FILES')" />
          <!-- <q-route-tab to="/admin/multicam" icon="sym_o_burst_mode" :label="$t('TAB_MULTICAM')" /> -->
          <q-route-tab to="/admin/logs" icon="sym_o_list" :label="$t('Logs')" />
          <q-btn-dropdown auto-close stretch flat label="">
            <q-list class="bg-green-5">
              <q-item to="/admin/1ststart">
                <q-item-section avatar> <q-icon name="sym_o_info" /> </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('1st Start') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item to="/admin/help">
                <q-item-section avatar> <q-icon name="sym_o_help" /> </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('TAB_LABEL_HELP') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item href="/api/doc" target="_blank">
                <q-item-section avatar> <q-icon name="sym_o_api" /> </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('Rest-API documentation') }}</q-item-label>
                </q-item-section>
                <q-item-section side> <q-icon name="sym_o_open_in_new" /> </q-item-section>
              </q-item>
              <q-item href="https://photobooth-app.org/" target="_blank">
                <q-item-section avatar> <q-icon name="sym_o_link" /> </q-item-section>
                <q-item-section>
                  <!--eslint-disable-next-line @intlify/vue-i18n/no-raw-text-->
                  <q-item-label>photobooth-app.org</q-item-label>
                </q-item-section>
                <q-item-section side> <q-icon name="sym_o_open_in_new" /> </q-item-section>
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
          <q-btn flat no-caps color="green-1" class="q-mx-sm" stack icon="sym_o_logout" :label="$t('Sign out')" @click="click_logout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { logout } from '../util/auth'
import { useRouter } from 'vue-router'
const router = useRouter()

const click_logout = () => {
  logout()
  router.push('/')
}
</script>
