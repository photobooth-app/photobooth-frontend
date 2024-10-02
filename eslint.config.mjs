import typescriptEslint from '@typescript-eslint/eslint-plugin';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      'dist',
      'src-capacitor',
      'src-cordova',
      '.quasar',
      'node_modules',
      '**/.eslintrc.js',
      '**/.eslintrc.cjs',
      '**/eslint.config.mjs',
      'src-ssr',
      'quasar.config.*.temporary.compiled*',
    ],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-strongly-recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
    'plugin:@intlify/vue-i18n/recommended',
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      vue,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...vue.environments['setup-compiler-macros']['setup-compiler-macros'],
        ga: 'readonly',
        cordova: 'readonly',
        __statics: 'readonly',
        __QUASAR_SSR__: 'readonly',
        __QUASAR_SSR_SERVER__: 'readonly',
        __QUASAR_SSR_CLIENT__: 'readonly',
        __QUASAR_SSR_PWA__: 'readonly',
        process: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly',
      },

      ecmaVersion: 5,
      sourceType: 'commonjs',

      parserOptions: {
        parser: 'D:\\dev\\photobooth\\photobooth-frontend\\node_modules\\@typescript-eslint\\parser\\dist\\index.js',
        extraFileExtensions: ['.vue'],
      },
    },

    settings: {
      'vue-i18n': {
        localeDir: './src/i18n/locales/*.json',
      },
    },

    rules: {
      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true,
        },
      ],
      'no-debugger': 'off',
    },
  },
  {
    files: ['**/src/components/form/**/*.{js,ts,mjs,cjs,vue}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
