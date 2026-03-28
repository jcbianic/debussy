/**
 * Lightweight markdown to HTML renderer for review content.
 * Handles headings, bold, italic, inline code, code blocks, lists, and paragraphs.
 * Content is skill-generated (not user input), so XSS is not a concern.
 */
export function renderMarkdown(md: string): string {
  const lines = md.split('\n')
  const html: string[] = []
  let inCodeBlock = false
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        html.push('</code></pre>')
        inCodeBlock = false
      } else {
        if (inList) {
          html.push('</ul>')
          inList = false
        }
        html.push(
          '<pre class="bg-surface-page border-line-subtle mt-2 mb-2 overflow-auto rounded-md border p-3 font-mono text-xs leading-relaxed"><code>'
        )
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      html.push(escapeHtml(line))
      html.push('\n')
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/)
    if (headingMatch) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      const level = headingMatch[1]!.length
      const sizes: Record<number, string> = {
        1: 'text-base font-bold mt-4 mb-2',
        2: 'text-sm font-bold mt-3 mb-1.5',
        3: 'text-sm font-semibold mt-2 mb-1',
        4: 'text-xs font-semibold mt-2 mb-1 uppercase tracking-wide',
      }
      html.push(
        `<h${level} class="${sizes[level] ?? sizes[3]}">${inline(headingMatch[2]!)}</h${level}>`
      )
      continue
    }

    // Unordered list items
    if (line.match(/^\s*[-*]\s+/)) {
      if (!inList) {
        html.push('<ul class="list-disc pl-5 space-y-0.5 text-sm">')
        inList = true
      }
      html.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`)
      continue
    }

    // Ordered list items
    if (line.match(/^\s*\d+\.\s+/)) {
      if (!inList) {
        html.push('<ul class="list-decimal pl-5 space-y-0.5 text-sm">')
        inList = true
      }
      html.push(`<li>${inline(line.replace(/^\s*\d+\.\s+/, ''))}</li>`)
      continue
    }

    // Close list if we hit a non-list line
    if (inList) {
      html.push('</ul>')
      inList = false
    }

    // Blockquotes
    if (line.startsWith('>')) {
      html.push(
        `<blockquote class="border-l-2 border-blue-400/50 pl-3 text-sm italic text-content-subtle my-1">${inline(line.replace(/^>\s*/, ''))}</blockquote>`
      )
      continue
    }

    // Empty line
    if (!line.trim()) {
      continue
    }

    // Regular paragraph
    html.push(`<p class="text-sm leading-relaxed my-1">${inline(line)}</p>`)
  }

  if (inList) html.push('</ul>')
  if (inCodeBlock) html.push('</code></pre>')

  return html.join('\n')
}

/** Apply inline markdown: bold, italic, inline code, links */
function inline(text: string): string {
  return text
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-surface-sunken rounded px-1 py-0.5 font-mono text-xs">$1</code>'
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-500 underline" target="_blank">$1</a>'
    )
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Detect if content is likely markdown (vs plain text) */
export function isMarkdown(content: string): boolean {
  return /^#{1,4}\s|^\s*[-*]\s|\*\*|^>|\n```/m.test(content)
}
