<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Photobooth Imageserver </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Links </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";

const linksList = [
  {
    title: "Photobooth",
    caption: "Main Program",
    icon: "home",
    link: "#",
  },
  {
    title: "Gallery",
    caption: "show all media",
    icon: "picture",
    link: "#gallery",
  },
  {
    title: "Admin",
    caption: "admin area",
    icon: "admin",
    link: "#admin",
  },
  {
    title: "Playground",
    caption: "used for testing",
    icon: "testing",
    link: "#playground",
  },
  {
    title: "API docs",
    caption: "fastapi automatic documentation",
    icon: "testing",
    link: "/docs",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: { EssentialLink },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
