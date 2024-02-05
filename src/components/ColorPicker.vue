<template>
  <q-color v-model="color"></q-color>

  <!-- preferred solution, but I can't seem to get the q-input to update from the q-color child: -->

  <!--
    <q-input filled v-model="color" :rules="['anyColor']">
      <template v-slot:append>
        <q-icon name="colorize" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-color v-model="color"></q-color>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  -->
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    return {
      color: ref("#196cb0"),
    };
  },
};
</script>
