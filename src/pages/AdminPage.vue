<template>
  <q-page>
    <q-card>
      <q-tabs
        v-model="tab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="common" label="Common" />
        <q-tab name="personalize" label="Personalize" />
        <q-tab name="camera" label="Camera" />
        <q-tab name="fullconfig" label="Full Config" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="common">
          <div class="text-h6">Common Settings</div>
          debug:
          <q-btn label="on" @click="remoteProcedureCall('/cmd/debug/on')" />
          <q-btn label="off" @click="remoteProcedureCall('/cmd/debug/off')" />
          <br /><br />

          debug overlay:
          <q-btn
            label="on"
            @click="remoteProcedureCall('/cmd/debugoverlay/on')"
          />
          <q-btn
            label="off"
            @click="remoteProcedureCall('/cmd/debugoverlay/off')"
          />
          <br /><br />

          exposure_mode:
          <q-btn
            label="normal"
            @click="remoteProcedureCall('/cmd/exposuremode/normal')"
          />
          <q-btn
            label="short"
            @click="remoteProcedureCall('/cmd/exposuremode/short')"
          />
          <q-btn
            label="long"
            disable
            @click="remoteProcedureCall('/cmd/exposuremode/long')"
          />
          <q-btn
            label="custom"
            disable
            @click="remoteProcedureCall('/cmd/exposuremode/custom')"
          />
          <ul>
            <li :key="item" v-for="(item, key) in this.store.serverConfig">
              {{ key }}: {{ item }}
            </li>
          </ul>
        </q-tab-panel>

        <q-tab-panel name="personalize">
          <div class="text-h6">Personalize</div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </q-tab-panel>

        <q-tab-panel name="camera">
          <div class="text-h6">Camera</div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </q-tab-panel>

        <q-tab-panel name="fullconfig">
          <div class="text-h6">Complete Configuration currently active</div>
          <ul>
            <li :key="item" v-for="(item, key) in this.store.serverConfig">
              {{ key }}: {{ item }}
            </li>
          </ul>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
    <q-page-sticky position="bottom-right" :offset="[25, 25]">
      <div class="q-gutter-sm">
        <q-btn
          label="reset"
          @click="remoteProcedureCall('/cmd/config/reset')"
        />
        <q-btn label="load" @click="remoteProcedureCall('/cmd/config/load')" />
        <q-btn
          color="primary"
          label="save"
          @click="remoteProcedureCall('/cmd/config/save')"
        />
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useMainStore } from "../stores/main-store.js";
import { remoteProcedureCall } from "boot/axios";

export default defineComponent({
  name: "MainLayout",

  components: {},
  setup() {
    const store = useMainStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      tab: ref("common"),
      remoteProcedureCall,
    };
  },
});
</script>
