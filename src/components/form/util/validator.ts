// import Ajv from 'ajv';
// import type { Options } from 'ajv'; // ajv from which dep? need it from jsonforms dependency core!
import { createAjv as createAjvCore } from '@jsonforms/core';

// https://jsonforms.discourse.group/t/how-to-register-a-new-field-type/426/2
export const createAjv = (options?: Parameters<typeof createAjvCore>[0]) => {
  // export const createAjv = (...args: Parameters<typeof createAjvCore>) => {
  // export const createAjv = (options?) => {
  //is Options from jsonforms core ajv anywhere exported? otherwise cannot use?
  const ajv = createAjvCore(options);
  ajv.addFormat('color', '/^#([A-F0-9]{3,4}|[A-F0-9]{6}|[A-F0-9]{8})$/i');
  return ajv as typeof ajv;
};
