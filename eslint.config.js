import pluginVue from 'eslint-plugin-vue'

export default [
  // Vue recommended rules
  ...pluginVue.configs['flat/recommended'],

  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest', // Use latest ECMAScript features
        sourceType: 'module',
      },
    },
    rules: {
      // Vue-specific rules
      'vue/no-unused-vars': 'warn',
      'vue/no-multiple-template-root': 'off', // Required for Vue 3 with `<script setup>`
      'vue/require-default-prop': 'off',
      'vue/no-deprecated-slot-attribute': 'off',

      // JavaScript best practices
      'no-debugger': 'error',

      // Code style improvements
      'indent': ['error', 2], // Enforce consistent indentation
      'quotes': ['error', 'single'], // Enforce single quotes
      'semi': ['error', 'never'], // Remove unnecessary semicolons
    },
  },
]
