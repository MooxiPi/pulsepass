import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    rules: {
      // PRD FE-011 / §16: sin any, sin React.FC, sin enum de TS.
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Usa uniones literales o z.enum, no enum de TS.',
        },
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'Prohibido dangerouslySetInnerHTML (PRD §12.5).',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react-router-dom', message: "Importa desde 'react-router' (v8)." },
            { name: 'axios', message: 'Usa fetch nativo encapsulado en lib/http.ts.' },
          ],
        },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'React', property: 'FC', message: 'No uses React.FC (PRD FE-011).' },
      ],
    },
  },
  {
    files: ['src/test/**', '**/*.test.{ts,tsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
