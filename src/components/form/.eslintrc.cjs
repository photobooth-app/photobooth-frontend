/*
Align eslint to jsonforms, mainly to avoid type any errors.
https://github.com/eclipsesource/jsonforms/blob/master/packages/vue-vanilla/.eslintrc.js
*/

https: module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: false,

  // add your custom rules here
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
