import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import pluginVue from 'eslint-plugin-vue'
import vueA11y from 'eslint-plugin-vuejs-accessibility'
import designSystemPlugin from './eslint-rules/design-system.js'

/**
 * ESLint flat config
 *
 * Layers (applied in order, later rules win):
 *   1. TypeScript recommended  — .ts files + global TS rules
 *   2. Vue 3 recommended       — .vue files (sets up vue parser)
 *   3. Accessibility            — .vue files (a11y rules)
 *   4. Project overrides        — .vue files (TS in <script lang="ts">, design-system tokens)
 *
 * Run:  pnpm lint
 * Fix:  pnpm lint --fix  (auto-fixable rules only; design-system violations need manual judgment)
 */

export default [
  // Skip generated and dependency directories
  {
    ignores: ['.nuxt/**', 'node_modules/**', '.output/**'],
  },

  // 1. TypeScript recommended (self-scoped to *.ts + global rules)
  ...tsPlugin.configs['flat/recommended'],

  // 2. Vue 3 recommended — includes vue-eslint-parser setup, targets *.vue
  ...pluginVue.configs['flat/recommended'],

  // 3. Accessibility rules — targets *.vue
  ...vueA11y.configs['flat/recommended'],

  // 4. Project overrides for .vue files
  {
    name: 'project/vue',
    files: ['**/*.vue'],

    languageOptions: {
      parserOptions: {
        // Parse <script lang="ts"> blocks with the TypeScript parser
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },

    plugins: {
      'design-system': designSystemPlugin,
    },

    rules: {
      /**
       * ERROR: dark: color variants are forbidden.
       *
       * The design system defines all dark-mode values in the .dark{} block in
       * ui/assets/css/main.css via CSS variable overrides. No dark: classes should
       * ever appear in templates — they bypass the semantic token layer.
       *
       * Wrong:   class="bg-neutral-50 dark:bg-neutral-950"
       * Correct: class="bg-surface-page"
       */
      'design-system/no-dark-color-variants': 'error',

      /**
       * WARN: raw neutral primitive classes — prefer semantic tokens.
       *
       * Semantic tokens are maintained in the @theme inline block and encode the
       * intent (surface, content, line) rather than the shade (neutral-100, etc.).
       * Using primitives directly makes light/dark mode harder to maintain.
       *
       * Wrong:   class="bg-neutral-100 text-neutral-500 border-neutral-200"
       * Correct: class="bg-surface-sunken text-content-subtle border-line"
       *
       * Exceptions are documented in eslint-rules/design-system.js ALLOWED_RAW.
       */
      'design-system/prefer-semantic-colors': 'warn',
    },
  },
]
