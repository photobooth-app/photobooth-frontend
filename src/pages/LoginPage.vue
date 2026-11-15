<template>
  <q-page id="login-page" class="flex flex-center">
    <q-card class="q-pa-md no-shadow login-card" :class="{ 'login-card--wide': showKeyboard && keyboardMode === 'text' }" flat>
      <q-btn flat color="grey" icon="sym_o_arrow_back_ios_new" @click="router.go(-1)" />
      <q-form ref="form" class="q-gutter-md" @submit="submit">
        <q-card-section class="text-center">
          <div class="text-h5 text-weight-bold">{{ $t('Sign in') }}</div>
          <div class="">{{ $t('Sign in below to access the admin dashboard.') }}</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="user.password"
            filled
            type="password"
            label="Password"
            :inputmode="showKeyboard ? 'none' : undefined"
            :autofocus="showKeyboard"
          >
            <template #append>
              <q-btn
                flat
                round
                dense
                :color="showKeyboard ? 'primary' : 'grey'"
                icon="sym_o_keyboard"
                :aria-label="$t('Toggle on-screen keyboard')"
                @mousedown.prevent
                @click="showKeyboard = !showKeyboard"
              />
            </template>
          </q-input>
        </q-card-section>
        <q-card-section v-if="showKeyboard">
          <on-screen-keyboard v-model="user.password" v-model:mode="keyboardMode" :layout="keyboardLayout" @enter="submit" />
        </q-card-section>
        <q-card-section>
          <q-btn rounded color="primary" label="Sign in" class="full-width" type="submit"></q-btn>
        </q-card-section>
        <q-card-section class="text-center">
          <div class="">
            {{ $t('Looking for the default password or issues signing in?') }}
            <a
              href="https://photobooth-app.org/setup/configuration/admincenter/"
              target="_blank"
              class="text-weight-bold"
              style="text-decoration: none"
            >
              {{ $t('Check the documentation.') }}
            </a>
          </div>
        </q-card-section>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useLocalStorage } from '@vueuse/core'
import { login } from '@/util/auth'
import { useRouter } from 'vue-router'
import OnScreenKeyboard, { type KeyboardMode } from '@/components/OnScreenKeyboard.vue'

const router = useRouter()
const $q = useQuasar()
const { locale } = useI18n()

const user = reactive({
  username: 'admin', // there are no usernames in our app, it's always admin...
  password: null,
})

// show the in-app keyboard by default on touch devices, because system keyboards do not appear in kiosk mode
const showKeyboard = useLocalStorage('loginShowOnScreenKeyboard', $q.platform.has.touch)
const keyboardMode = useLocalStorage<KeyboardMode>('loginOnScreenKeyboardMode', 'numeric')
const keyboardLayout = computed(() => (String(locale.value).startsWith('de') ? 'qwertz' : 'qwerty'))

const submit = async () => {
  try {
    await login(user)
    router.push('/admin')
  } catch (err) {
    console.error(err)
  }
}
</script>

<style lang="scss">
#login-page .login-card {
  width: 100%;
  max-width: 480px;

  &--wide {
    max-width: 760px;
  }
}
</style>
