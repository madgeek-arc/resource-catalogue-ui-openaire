// ESLint 10 flat config. It replaces .eslintrc.json with the same rules.
// None of the enabled rules need type information, so there is no parserOptions.project (linting is much faster).
// If a type-aware rule is turned on later, add languageOptions.parserOptions.projectService to the TypeScript block.
import {defineConfig} from 'eslint/config';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {ignores: ['projects/**/*', 'dist/**/*', '.angular/**/*']},

  // All TypeScript files. Inline templates are linted with the template rules below.
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended, angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/dot-notation': 'off',
      '@typescript-eslint/explicit-member-accessibility': ['off', {accessibility: 'explicit'}],
      'id-blacklist': 'off',
      'id-match': 'off',
      'no-underscore-dangle': 'off',
      '@typescript-eslint/member-ordering': 'off',
      'max-len': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      radix: 'off',
      eqeqeq: ['warn', 'always', {null: 'ignore'}],
      '@typescript-eslint/no-use-before-define': 'off',
      'guard-for-in': 'off',
      '@angular-eslint/component-selector': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-console': ['warn', {allow: ['warn', 'error']}],
      'brace-style': 'off',
      curly: 'off',
      'arrow-body-style': 'off',
      '@angular-eslint/use-lifecycle-interface': 'off',
      '@angular-eslint/no-output-native': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@angular-eslint/no-output-rename': 'off',
      '@angular-eslint/contextual-lifecycle': 'off',
      '@angular-eslint/component-class-suffix': 'off',
      // Modernization rules: warnings behind the lint:ci ratchet (package.json), which only goes down.
      '@angular-eslint/prefer-standalone': 'warn',
      '@angular-eslint/prefer-inject': 'warn',
      '@angular-eslint/prefer-signals': 'warn',
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
      '@angular-eslint/prefer-host-metadata-property': 'warn',
    },
  },

  // All templates.
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended],
    rules: {
      '@angular-eslint/template/eqeqeq': 'off',
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'warn',
      '@angular-eslint/template/prefer-class-binding': 'warn',
      // The dynamic form applies the styles its model defines, so binding to style stays allowed.
      '@angular-eslint/template/no-inline-styles': ['warn', {allowBindToStyle: true}],
    },
  },
]);
