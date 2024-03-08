import { Options, Ajv } from 'ajv';
import { createAjv as createAjvCore } from '@jsonforms/core';

// https://jsonforms.discourse.group/t/how-to-register-a-new-field-type/426/2
export const createAjv = (options?: Options): Ajv => {
  const ajv = createAjvCore(options);
  ajv.addFormat('color', '/^#([A-F0-9]{3,4}|[A-F0-9]{6}|[A-F0-9]{8})$/i');
  return ajv;
};
