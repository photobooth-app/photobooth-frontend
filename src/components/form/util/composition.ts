import { useStyles } from '../styles';
import { computed, ref, ComputedRef, inject, provide } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import merge from 'lodash/merge';
import get from 'lodash/get';
import {
  composePaths,
  computeLabel,
  getFirstPrimitiveProp,
  isDescriptionHidden,
  Resolve,
  findUISchema,
  JsonFormsSubStates,
  extractAjv,
} from '@jsonforms/core';
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
 * Adds styles, isFocused, appliedOptions
 */
export const useQuasarBasicControl = <I extends { control: any }>(input: I) => {
  const appliedOptions = useControlAppliedOptions(input);
  const isFocused = ref(false);

  const persistentHint = (): boolean => {
    return !isDescriptionHidden(
      input.control.value.visible,
      input.control.value.description,
      isFocused.value,
      !!appliedOptions.value?.showUnfocusedDescription,
    );
  };

  const computedLabel = useComputedLabel(input, appliedOptions);

  const controlWrapper = computed(() => {
    const { id, description, errors, label, visible, required } = input.control.value;
    return { id, description, errors, label, visible, required };
  });

  const styles = useStyles(input.control.value.uischema);

  const quasarProps = (path: string) => {
    const props = get(appliedOptions.value?.vuetify, path);

    return props && isPlainObject(props) ? props : {};
  };

  return {
    ...input,
    styles,
    isFocused,
    appliedOptions,
    controlWrapper,
    quasarProps,
    persistentHint,
    computedLabel,
  };
};

/**
 * Adds adds onchange
 */
export const useQuasarControl = <I extends { control: any; handleChange: any }>(
  input: I,
  adaptValue: (target: any) => any = (v) => v,
  debounceWait?: number,
) => {
  const changeEmitter = typeof debounceWait === 'number' ? debounce(input.handleChange, debounceWait) : input.handleChange;

  const onChange = (value: any) => {
    changeEmitter(input.control.value.path, adaptValue(value));
  };

  const quasarBasicControl = useQuasarBasicControl(input);

  return {
    ...input,
    ...quasarBasicControl,
    onChange,
  };
};

/**
 * Adds styles and appliedOptions
 */
export const useQuasarLayout = <I extends { layout: any }>(input: I) => {
  const appliedOptions = computed(() => merge({}, cloneDeep(input.layout.value.config), cloneDeep(input.layout.value.uischema.options)));

  const quasarProps = (path: string) => {
    const props = get(appliedOptions.value?.quasar, path);

    return props && isPlainObject(props) ? props : {};
  };

  return {
    ...input,
    styles: useStyles(input.layout.value.uischema),
    appliedOptions,
    quasarProps,
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
      input.control.value.rootSchema,
    ),
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
/**
 * Extracts Ajv from JSON Forms
 */
export const useAjv = () => {
  const jsonforms = inject<JsonFormsSubStates>('jsonforms');

  if (!jsonforms) {
    throw new Error("'jsonforms' couldn't be injected. Are you within JSON Forms?");
  }
  if (jsonforms.core === undefined) {
    throw new Error("'jsonforms.core undefined'. Are you within JSON Forms?");
  }

  return extractAjv(jsonforms.core);
};

export interface NestedInfo {
  level: number;
  parentElement?: 'array' | 'object';
}
export const useNested = (element: false | 'array' | 'object'): NestedInfo => {
  const nestedInfo = inject<NestedInfo>('jsonforms.nestedInfo', { level: 0 });
  if (element) {
    provide('jsonforms.nestedInfo', {
      level: nestedInfo.level + 1,
      parentElement: element,
    });
  }
  return nestedInfo;
};
export const useTranslator = () => {
  const jsonforms = inject<JsonFormsSubStates>('jsonforms');

  if (!jsonforms) {
    throw new Error("'jsonforms couldn't be injected. Are you within JSON Forms?");
  }

  if (!jsonforms.i18n || !jsonforms.i18n.translate) {
    throw new Error("'jsonforms i18n couldn't be injected. Are you within JSON Forms?");
  }

  const translate = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return jsonforms.i18n!.translate!;
  });

  return translate;
};
