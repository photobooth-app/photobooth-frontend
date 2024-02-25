import { useStyles } from '../styles';
import { computed, ref, ComputedRef } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { composePaths, computeLabel, getFirstPrimitiveProp, isDescriptionHidden, Resolve, findUISchema } from '@jsonforms/core';
import isPlainObject from 'lodash/isPlainObject';

export const useControlAppliedOptions = <I extends { control: any }>(input: I) => {
  return computed(() => merge({}, cloneDeep(input.control.value.config), cloneDeep(input.control.value.uischema.options)));
};

export const useComputedLabel = <I extends { control: any }>(input: I, appliedOptions: ComputedRef<any>) => {
  return computed((): string => {
    return computeLabel(input.control.value.label, input.control.value.required, !!appliedOptions.value?.hideRequiredAsterisk);
  });
};

/**
 * Adds styles, isFocused, appliedOptions and onChange
 */

export const useQuasarControl = <I extends { control: any; handleChange: any }>(
  input: I,
  adaptValue: (target: any) => any = (v) => v,
  debounceWait?: number
) => {
  const changeEmitter = typeof debounceWait === 'number' ? debounce(input.handleChange, debounceWait) : input.handleChange;

  const onChange = (value: any) => {
    changeEmitter(input.control.value.path, adaptValue(value));
  };

  const appliedOptions = useControlAppliedOptions(input);
  const isFocused = ref(false);

  const persistentHint = (): boolean => {
    return !isDescriptionHidden(
      input.control.value.visible,
      input.control.value.description,
      isFocused.value,
      !!appliedOptions.value?.showUnfocusedDescription
    );
  };

  const computedLabel = useComputedLabel(input, appliedOptions);

  const controlWrapper = computed(() => {
    const { id, description, errors, label, visible, required } = input.control.value;
    return { id, description, errors, label, visible, required };
  });

  const styles = useStyles(input.control.value.uischema);

  const vuetifyProps = (path: string) => {
    const props = get(appliedOptions.value?.vuetify, path);

    return props && isPlainObject(props) ? props : {};
  };

  return {
    ...input,
    styles,
    isFocused,
    appliedOptions,
    controlWrapper,
    onChange,
    vuetifyProps,
    persistentHint,
    computedLabel,
  };
};

/**
 * Adds styles and appliedOptions
 */
export const useQuasarLayout = <I extends { layout: any }>(input: I) => {
  const appliedOptions = computed(() => merge({}, cloneDeep(input.layout.value.config), cloneDeep(input.layout.value.uischema.options)));
  return {
    ...input,
    styles: useStyles(input.layout.value.uischema),
    appliedOptions,
  };
};

/**
 * Adds styles and appliedOptions
 */
export const useQuasarLabel = <I extends { label: any }>(input: I) => {
  const appliedOptions = computed(() => merge({}, cloneDeep(input.label.value.config), cloneDeep(input.label.value.uischema.options)));
  return {
    ...input,
    styles: useStyles(input.label.value.uischema),
    appliedOptions,
  };
};

/**
 * Adds styles, appliedOptions and childUiSchema
 */
export const useQuasarArrayControl = <I extends { control: any }>(input: I) => {
  const appliedOptions = computed(() => merge({}, cloneDeep(input.control.value.config), cloneDeep(input.control.value.uischema.options)));

  const childUiSchema = computed(() =>
    findUISchema(
      input.control.value.uischemas,
      input.control.value.schema,
      input.control.value.uischema.scope,
      input.control.value.path,
      undefined,
      input.control.value.uischema,
      input.control.value.rootSchema
    )
  );

  const childLabelForIndex = (index: number) => {
    const childLabelProp = input.control.value.uischema.options?.childLabelProp ?? getFirstPrimitiveProp(input.control.value.schema);
    if (!childLabelProp) {
      return `${index}`;
    }
    const labelValue = Resolve.data(input.control.value.data, composePaths(`${index}`, childLabelProp));
    if (labelValue === undefined || labelValue === null || Number.isNaN(labelValue)) {
      return '';
    }
    return `${labelValue}`;
  };
  return {
    ...input,
    styles: useStyles(input.control.value.uischema),
    appliedOptions,
    childUiSchema,
    childLabelForIndex,
  };
};
export const useQuasarBasicControl = <I extends { control: any }>(input: I) => {
  const appliedOptions = useControlAppliedOptions(input);

  const vuetifyProps = (path: string) => {
    const props = get(appliedOptions.value?.vuetify, path);

    return props && isPlainObject(props) ? props : {};
  };

  return {
    ...input,
    styles: useStyles(input.control.value.uischema),
    appliedOptions,
    vuetifyProps,
  };
};
