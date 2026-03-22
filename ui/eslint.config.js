import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import pluginVue from 'eslint-plugin-vue'
import vueA11y from 'eslint-plugin-vuejs-accessibility'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import designSystemPlugin from './eslint-rules/design-system.js'

/**
 * ESLint flat config
 *
 * Layers (applied in order, later rules win):
 *   1. TypeScript recommended  — .ts files + global TS rules
 *   2. Vue 3 recommended       — .vue files (sets up vue parser)
 *   3. Accessibility            — .vue files (a11y rules)
 *   4. Project overrides        — .vue files (TS in <script lang="ts">, design-system tokens)
 *   5. No explicit auto-imports — .vue + .ts (enforce Nuxt auto-import convention)
 *   6. JSDoc                   — composables/ + utils/ (require JSDoc on exported fns)
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

  // 4a. Nuxt pages use single-word filenames by convention — disable the rule there
  {
    name: 'project/pages-single-word',
    files: ['pages/**/*.vue', 'layouts/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

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

      /**
       * WARN: template blocks exceeding 80 lines of markup.
       *
       * A template over 80 lines is a signal that the component is doing too
       * much inline rendering. Extract sub-regions into presenter components.
       * Set to warn (not error) so existing violations migrate incrementally.
       *
       * See: docs/architecture/orchestration-presentation.md — Check 1
       */
      'vue/max-lines-per-block': [
        'warn',
        { template: 80, skipBlankLines: false },
      ],
    },
  },

  // 5. No explicit imports of Nuxt auto-imported symbols
  //
  // Nuxt auto-imports all exports from composables/ and utils/.
  // Explicit value imports bypass this and add noise. Type-only imports
  // (import type) are always required for TypeScript and are allowed.
  //
  // Wrong:   import { statusColor } from '~/utils/status'
  // Correct: just use statusColor — it's auto-imported
  // Correct: import type { MyType } from '~/composables/useMyComposable'
  //
  // See: docs/architecture/orchestration-presentation.md — Check 9
  {
    name: 'project/no-explicit-auto-imports',
    files: ['**/*.vue', '**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^~/composables/',
              allowTypeImports: true,
              message:
                'Do not import values from ~/composables/ directly — ' +
                'Nuxt auto-imports all exports. Use `import type` for types only.',
            },
            {
              regex: '^~/utils/',
              allowTypeImports: true,
              message:
                'Do not import values from ~/utils/ directly — ' +
                'Nuxt auto-imports all exports. Use `import type` for types only.',
            },
          ],
        },
      ],
    },
  },

  // 6. JSDoc required on exported composable and util functions
  //
  // Composables and utils are the public API of the data layer. Exported
  // functions should document their purpose and return shape so consumers
  // know what they get without reading the implementation.
  //
  // Set to warn so existing gaps migrate incrementally.
  //
  // See: docs/architecture/orchestration-presentation.md — Check 11
  {
    name: 'project/jsdoc-composables',
    files: ['composables/**/*.ts', 'utils/**/*.ts'],
    plugins: {
      jsdoc: jsdocPlugin,
    },
    rules: {
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: false,
            MethodDefinition: false,
            ClassDeclaration: false,
          },
        },
      ],
    },
  },
]
