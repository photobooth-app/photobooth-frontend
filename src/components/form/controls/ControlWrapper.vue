<template>
  <div v-if="visible" :id="id" :class="styles.control.root">
    <div class="control-wrapper row">
      <div class="col">
        <div class="control-label-wrapper">
          <label :for="id + '-input'" :class="[styles.control.label, required ? styles.control.required : '']">
            {{ label }}
          </label>
        </div>
        <div class="control-description-wrapper">
          <!--div :class="styles.control.description">{{ showDescription ? description : "" }}</div-->
          <div :class="styles.control.description">{{ description }}</div>
        </div>
      </div>
      <div class="control-field col">
        <div :class="styles.control.wrapper">
          <slot></slot>
        </div>
      </div>
    </div>
    <div :class="styles.control.description"></div>
  </div>
</template>

<script lang="ts">
import { isDescriptionHidden } from '@jsonforms/core';
import { defineComponent, PropType } from 'vue';
import { Styles } from '../styles';
import { Options } from '../util';

export default defineComponent({
  name: 'ControlWrapper',
  props: {
    id: {
      required: true,
      type: String,
    },
    description: {
      required: false as const,
      type: String,
      default: undefined,
    },
    errors: {
      required: false as const,
      type: String,
      default: undefined,
    },
    label: {
      required: false as const,
      type: String,
      default: undefined,
    },
    appliedOptions: {
      required: false as const,
      type: Object as PropType<Options>,
      default: undefined,
    },
    visible: {
      required: false as const,
      type: Boolean,
      default: true,
    },
    required: {
      required: false as const,
      type: Boolean,
      default: false,
    },
    isFocused: {
      required: false as const,
      type: Boolean,
      default: false,
    },
    styles: {
      required: true,
      type: Object as PropType<Styles>,
    },
  },
  computed: {
    showDescription(): boolean {
      return !isDescriptionHidden(this.visible, this.description, this.isFocused, !!this.appliedOptions?.showUnfocusedDescription);
    },
  },
});
</script>
