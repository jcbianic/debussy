/**
 * ESLint plugin: design-system
 *
 * Enforces semantic design token usage in Vue templates.
 * Prevents bypassing the CSS-based theming layer defined in assets/css/main.css.
 *
 * Rules:
 *
 *   no-dark-color-variants  (error)
 *     dark: color variants must never appear in templates.
 *     The .dark{} CSS block in main.css handles dark mode automatically via
 *     CSS variable overrides — dark: class duplication is both redundant and wrong.
 *
 *   prefer-semantic-colors  (warn)
 *     Raw neutral utility classes (bg-neutral-*, text-neutral-*, border-neutral-*)
 *     should map to a semantic token from the design system's @theme inline block.
 *     Use bg-surface-*, text-content-*, or border-line-*.
 */

// Forbidden: dark: variants for neutral palette, white, and black
const DARK_FORBIDDEN_RE =
  /\bdark:(bg|text|border|fill|stroke|ring|outline|shadow)-(neutral-\d+|white|black)\b/

// Raw neutral primitive classes (without dark: prefix)
const RAW_NEUTRAL_RE =
  /\b(bg|text|border|fill|stroke|ring|outline)-(neutral)-(\d+)\b/

// Documented exceptions: raw neutral classes that have no semantic equivalent
const ALLOWED_RAW = new Set([
  // Sidebar lane strip active dot reuses the mid-gray `neutral-400` as a
  // deliberate mid-brightness indicator with no light/dark flip needed.
  'bg-neutral-400',
])

// Human-readable token suggestions per CSS property prefix
const SUGGESTIONS = {
  bg: 'bg-surface-page | bg-surface | bg-surface-elevated | bg-surface-sunken | bg-surface-tag | bg-surface-hover | bg-surface-hover-subtle | bg-surface-inverted | bg-status-active | bg-status-inactive',
  text: 'text-content | text-content-secondary | text-content-muted | text-content-subtle | text-content-faint | text-content-placeholder | text-content-inverted',
  border: 'border-line | border-line-subtle',
}

/** Walk a JS/TS expression AST and call fn(stringValue, literalNode) for every string literal. */
function traverseExpression(node, fn) {
  if (!node) return
  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'string') fn(node.value, node)
      break
    case 'TemplateLiteral':
      // Only check the static string parts (quasis); skip interpolations.
      node.quasis.forEach((q) => fn(q.value.cooked ?? '', q))
      break
    case 'ConditionalExpression':
      traverseExpression(node.consequent, fn)
      traverseExpression(node.alternate, fn)
      break
    case 'LogicalExpression':
      traverseExpression(node.left, fn)
      traverseExpression(node.right, fn)
      break
    case 'BinaryExpression':
      if (node.operator === '+') {
        traverseExpression(node.left, fn)
        traverseExpression(node.right, fn)
      }
      break
    case 'ArrayExpression':
      ;(node.elements ?? []).forEach((el) => traverseExpression(el, fn))
      break
    case 'ObjectExpression':
      // Handle { 'bg-neutral-50': condition } — keys are the class strings
      ;(node.properties ?? []).forEach((prop) => {
        if (
          prop.type === 'Property' &&
          prop.key?.type === 'Literal' &&
          typeof prop.key.value === 'string'
        ) {
          fn(prop.key.value, prop.key)
        }
      })
      break
    case 'CallExpression':
      // Handles cn('a', 'b'), clsx(...), etc.
      ;(node.arguments ?? []).forEach((arg) => traverseExpression(arg, fn))
      break
    // Identifiers, MemberExpressions, etc. are ignored — can't statically check
  }
}

/** Visit a VAttribute node and call a callback for each class-like string found. */
function visitClassAttr(node, cb) {
  // Static:  class="..."
  if (!node.directive && node.key.name === 'class' && node.value) {
    cb(node.value.value, node.value)
    return
  }
  // Dynamic: :class="..." or v-bind:class="..."
  if (node.directive && node.key.argument?.name === 'class' && node.value) {
    traverseExpression(node.value.expression, cb)
  }
}

/**
 * Returns a vue-eslint-parser template body visitor if available, or falls
 * back to a no-op so the rule degrades gracefully in non-Vue files.
 *
 * vue-eslint-parser does NOT expose template AST nodes via the standard ESLint
 * traversal. Template nodes are in a separate tree that must be accessed via
 * context.parserServices.defineTemplateBodyVisitor (same API used by
 * eslint-plugin-vue).
 */
function defineTemplateVisitor(context, visitor) {
  // ESLint 9: parserServices moved from context to context.sourceCode
  const services = context.sourceCode?.parserServices ?? context.parserServices
  if (!services?.defineTemplateBodyVisitor) return {}
  return services.defineTemplateBodyVisitor(visitor)
}

// ── Rule: no-dark-color-variants ────────────────────────────────────────────

const noDarkColorVariants = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow dark: color variants. The design system .dark{} CSS block overrides ' +
        'semantic tokens automatically — dark: class duplication is forbidden.',
    },
    messages: {
      found:
        '"{{ cls }}" — dark: color variants are not allowed. ' +
        'The .dark{} block in ui/assets/css/main.css handles dark mode via CSS variable overrides. ' +
        'Replace with a semantic token: {{ suggestion }}.',
    },
    schema: [],
  },

  create(context) {
    function check(classStr, reportNode) {
      for (const cls of classStr.split(/\s+/).filter(Boolean)) {
        const m = cls.match(DARK_FORBIDDEN_RE)
        if (m) {
          context.report({
            node: reportNode,
            messageId: 'found',
            data: {
              cls,
              suggestion: SUGGESTIONS[m[1]] ?? 'a semantic design token',
            },
          })
        }
      }
    }

    return defineTemplateVisitor(context, {
      VAttribute(node) {
        visitClassAttr(node, check)
      },
    })
  },
}

// ── Rule: prefer-semantic-colors ────────────────────────────────────────────

const preferSemanticColors = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer semantic design tokens over raw neutral Tailwind utilities. ' +
        'Map primitives to bg-surface-*, text-content-*, or border-line-*.',
    },
    messages: {
      found:
        '"{{ cls }}" is a raw primitive color utility. ' +
        'Prefer: {{ suggestion }}. ' +
        'If this is an intentional exception, add it to the ALLOWED_RAW set in eslint-rules/design-system.js.',
    },
    schema: [],
  },

  create(context) {
    function check(classStr, reportNode) {
      for (const cls of classStr.split(/\s+/).filter(Boolean)) {
        if (cls.startsWith('dark:')) continue // handled by no-dark-color-variants
        if (ALLOWED_RAW.has(cls)) continue
        const m = cls.match(RAW_NEUTRAL_RE)
        if (m) {
          context.report({
            node: reportNode,
            messageId: 'found',
            data: {
              cls,
              suggestion: SUGGESTIONS[m[1]] ?? 'a semantic design token',
            },
          })
        }
      }
    }

    return defineTemplateVisitor(context, {
      VAttribute(node) {
        visitClassAttr(node, check)
      },
    })
  },
}

// ── Plugin export ────────────────────────────────────────────────────────────

export default {
  meta: {
    name: 'design-system',
    version: '1.0.0',
  },
  rules: {
    'no-dark-color-variants': noDarkColorVariants,
    'prefer-semantic-colors': preferSemanticColors,
  },
}
