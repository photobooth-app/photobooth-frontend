<template>
  <q-expansion-item expand-separator>
    <template #header>
      <q-item-section>
        <div class="">{{ label }}</div>
        <div class="">{{ description }}</div>
      </q-item-section>

      <q-item-section side>
        <div class="q-pa-xs q-gutter-xs">
          <q-btn size="sm" icon="move_up" flat :disabled="!moveUpEnabled" :class="styles.arrayList.itemMoveUp" @click="moveUpClicked" />
          <q-btn size="sm" icon="move_down" flat :disabled="!moveDownEnabled" :class="styles.arrayList.itemMoveDown" @click="moveDownClicked" />
          <q-btn size="sm" icon="delete" flat :disabled="!deleteEnabled" :class="styles.arrayList.itemDelete" @click="deleteClicked" />
        </div>
      </q-item-section>
    </template>

    <q-card-section>
      <slot></slot>
    </q-card-section>
  </q-expansion-item>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { classes, Styles } from '../styles';

const listItem = defineComponent({
  name: 'ArrayListElement',
  props: {
    label: {
      required: false,
      type: String,
      default: '',
    },
    description: {
      required: false,
      type: String,
      default: '',
    },
    moveUpEnabled: {
      required: false,
      type: Boolean,
      default: true,
    },
    moveDownEnabled: {
      required: false,
      type: Boolean,
      default: true,
    },
    moveUp: {
      required: false,
      type: Function,
      default: undefined,
    },
    moveDown: {
      required: false,
      type: Function,
      default: undefined,
    },
    deleteEnabled: {
      required: false,
      type: Boolean,
      default: true,
    },
    delete: {
      required: false,
      type: Function,
      default: undefined,
    },
    styles: {
      required: true,
      type: Object as PropType<Styles>,
    },
  },
  data() {
    return {};
  },
  computed: {},
  methods: {
    moveUpClicked(event: Event): void {
      event.stopPropagation();
      this.moveUp?.();
    },
    moveDownClicked(event: Event): void {
      event.stopPropagation();
      this.moveDown?.();
    },
    deleteClicked(event: Event): void {
      event.stopPropagation();
      this.delete?.();
    },
  },
});

export default listItem;
</script>
