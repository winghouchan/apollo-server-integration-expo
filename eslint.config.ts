import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import json from '@eslint/json'
import markdown from '@eslint/markdown'
import { defineConfig } from 'eslint/config'
import prettier from 'eslint-config-prettier/flat'
import importExport from 'eslint-plugin-import'
import { glob } from 'fs/promises'
import globals from 'globals'
import { resolve } from 'path'
import * as tseslint from 'typescript-eslint'

const gitignores = await Array.fromAsync(
  glob(['.gitignore', './**/.gitignore'], { exclude: ['node_modules'] }),
  (gitignore) => includeIgnoreFile(resolve(gitignore), gitignore),
)

export default defineConfig([
  ...gitignores,
  importExport.flatConfigs.recommended,
  importExport.flatConfigs.typescript,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    rules: {
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          groups: [
            ['builtin', 'external'],
            'internal',
            'parent',
            'sibling',
            'index',
          ],
        },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['{js,ts}config.json'],
        },
      },
    },
  },
  {
    extends: [tseslint.configs.recommended],
    files: ['**/*.{ts,mts,cts}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.json'],
    ignores: ['package-lock.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.jsonc'],
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.json5'],
    plugins: { json },
    language: 'json/json5',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    extends: ['markdown/recommended'],
  },
  {
    ignores: ['build/*', 'dist/*'],
  },
  prettier,
])
