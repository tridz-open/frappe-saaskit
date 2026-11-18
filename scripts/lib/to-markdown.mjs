// MDX -> plain Markdown. Shared by scripts/postbuild.mjs (the .md copies, llms.txt) and app/[[...mdxPath]]/page.jsx
// (the "Copy page" button), so agents and humans get the same clean Markdown.
//
// Contract: every custom component must have a transform here. A component without one is LEFT AS RAW TEXT so that the
// guard in postbuild.mjs fails the build loudly instead of shipping JSX in a .md file.
import { versions } from '../../app/_data/versions.mjs'
import { statusRows } from '../../app/_data/status.mjs'

const ALERT = { default: 'NOTE', info: 'NOTE', note: 'NOTE', tip: 'TIP', important: 'IMPORTANT', warning: 'WARNING', error: 'CAUTION', caution: 'CAUTION' }
const STATUS_LABEL = { verified: 'Verified', experimental: 'Experimental', tested: 'Tested', untested: 'Untested', alpha: 'Alpha', removed: 'Removed', stub: 'Stub', released: 'Released' }

export const LOGOS_LINKS = '[Tridz](https://tridz.com), [URY](https://ury.app), [Huf](https://huf.ai), [Franchise Media](https://www.thefranchisemedia.com/)'

export function footerText(repo = 'saas_core') {
  return `**Use at your own risk.** Frappe SaaS is early alpha software, provided "as is" without warranty of any kind. We are not accepting pull requests or outside contributions. If you find a problem, [file an issue on ${repo}](https://github.com/tridz-open/${repo}/issues), or [on the docs repo](https://github.com/tridz-open/frappe-saaskit/issues) for mistakes in these pages. No analytics or cookies. Not affiliated with or endorsed by Frappe Technologies. "Frappe" and "Frappe Cloud" are their trademarks.`
}

// ---------- tag scanner ----------
const isCustom = (name) => /^[A-Z]/.test(name) || name === 'details' || name === 'summary'

function readAttrValue(src, i) {
  const c = src[i]
  if (c === '"' || c === "'") {
    const end = src.indexOf(c, i + 1)
    return { value: src.slice(i + 1, end), raw: false, next: end + 1 }
  }
  if (c === '{') {
    let depth = 0
    let j = i
    let q = null
    for (; j < src.length; j++) {
      const ch = src[j]
      if (q) {
        if (ch === '\\') j++
        else if (ch === q) q = null
      } else if (ch === '"' || ch === "'" || ch === '`') q = ch
      else if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) break
      }
    }
    return { value: src.slice(i + 1, j), raw: true, next: j + 1 }
  }
  return { value: '', raw: false, next: i }
}

// Returns { name, attrs, closing, selfClosing, end } or null when src[i] does not start a component/details tag.
function readTag(src, i) {
  const m = /^<(\/?)([A-Za-z][A-Za-z0-9.]*)/.exec(src.slice(i, i + 80))
  if (!m || !isCustom(m[2])) return null
  const closing = m[1] === '/'
  let j = i + m[0].length
  const attrs = {}
  while (j < src.length) {
    while (/\s/.test(src[j])) j++
    if (src[j] === '>') return { name: m[2], attrs, closing, selfClosing: false, end: j + 1 }
    if (src[j] === '/' && src[j + 1] === '>') return { name: m[2], attrs, closing, selfClosing: true, end: j + 2 }
    const am = /^[A-Za-z_][\w-]*/.exec(src.slice(j, j + 60))
    if (!am) return null
    j += am[0].length
    if (src[j] === '=') {
      const v = readAttrValue(src, j + 1)
      attrs[am[0]] = v
      j = v.next
    } else attrs[am[0]] = { value: true, raw: false }
  }
  return null
}

function parse(src) {
  const root = { name: '#root', children: [] }
  const stack = [root]
  let i = 0
  let textStart = 0
  const flush = (to) => {
    if (to > textStart) stack.at(-1).children.push({ text: src.slice(textStart, to) })
  }
  while (i < src.length) {
    if (src[i] === '<') {
      const tag = readTag(src, i)
      if (tag) {
        flush(i)
        if (tag.closing) {
          if (stack.length > 1 && stack.at(-1).name === tag.name) stack.pop()
          else stack.at(-1).children.push({ text: src.slice(i, tag.end) }) // stray closer: keep raw so the guard sees it
        } else {
          const node = { name: tag.name, attrs: tag.attrs, children: [], rawOpen: src.slice(i, tag.end) }
          stack.at(-1).children.push(node)
          if (!tag.selfClosing) stack.push(node)
        }
        i = tag.end
        textStart = i
        continue
      }
    }
    i++
  }
  flush(src.length)
  return root
}

const str = (n, k, d = '') => {
  const a = n.attrs?.[k]
  if (!a) return d
  return a.raw ? String(a.value).trim().replace(/^['"`]|['"`]$/g, '') : a.value
}
// eslint-disable-next-line no-new-func
const evalAttr = (n, k, d) => {
  const a = n.attrs?.[k]
  if (!a || !a.raw) return d
  try {
    return new Function(`return (${a.value})`)()
  } catch {
    return d
  }
}
const tidy = (s) => s.replace(/\n{3,}/g, '\n\n').trim()
const oneLine = (s) => tidy(s).replace(/\s*\n\s*/g, ' ')
const quote = (s) => tidy(s).split('\n').map((l) => (l ? `> ${l}` : '>')).join('\n')

export function renderTable(rows, headers) {
  const esc = (v) => String(v ?? '').replace(/\|/g, '\\|')
  return [`| ${headers.join(' | ')} |`, `|${headers.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.map(esc).join(' | ')} |`)].join('\n')
}

function dataTable(kind) {
  if (kind === 'status') {
    return renderTable(
      statusRows.map((r) => [r.area, `**[${STATUS_LABEL[r.status]}]**`, r.gate ? `\`${r.gate}\`` : '', r.note]),
      ['Area', 'Status', 'Flag', 'Notes']
    )
  }
  return renderTable(
    versions.map((v) => [v.piece, `\`${v.tag}\``, `**[${STATUS_LABEL[v.status] || v.status}]**`, v.note]),
    ['Piece', 'Tag', 'Status', 'Notes']
  )
}

function renderChildren(n, ctx) {
  return n.children.map((c) => render(c, ctx)).join('')
}

function render(n, ctx) {
  if (n.text !== undefined) return n.text
  const kids = () => renderChildren(n, ctx)
  switch (n.name) {
    case '#root':
      return kids()
    case 'Callout': {
      const t = ALERT[str(n, 'type', 'default')] || 'NOTE'
      const title = str(n, 'title')
      return `\n\n${quote(`[!${t}]\n${title ? `**${title}**\n\n` : ''}${kids()}`)}\n\n`
    }
    case 'Badge': {
      const kidsTxt = oneLine(kids())
      return `**[${kidsTxt || STATUS_LABEL[str(n, 'status')] || str(n, 'status')}]**`
    }
    case 'Screenshot':
    case 'Shot': {
      const cap = str(n, 'caption')
      return `\n\n![${str(n, 'alt')}](${ctx.site}/screens/${str(n, 'name')}.webp)${cap ? `\n\n*${cap}*` : ''}\n\n`
    }
    case 'Gallery': {
      const items = evalAttr(n, 'items', [])
      return `\n\n${items.map((i) => `![${i.alt}](${ctx.site}/screens/${i.name}.webp)${i.caption ? `\n\n*${i.caption}*` : ''}`).join('\n\n')}\n\n`
    }
    case 'Cards':
      return `\n\n${tidy(kids())}\n\n`
    case 'Cards.Card': {
      const body = oneLine(kids())
      return `\n- [${str(n, 'title')}](${str(n, 'href')})${body ? `: ${body}` : ''}\n`
    }
    case 'RepoCard': {
      const links = evalAttr(n, 'links', []).map((l) => `[${l.label}](${l.href})`).join(', ')
      return `\n- **[${str(n, 'name')}](${str(n, 'href')})**: ${str(n, 'description')} (${str(n, 'language')}; ${str(n, 'status')}; ${str(n, 'version')}). ${links}\n`
    }
    case 'FeatureGrid':
      return `\n\n${tidy(kids())}\n\n`
    case 'Feature':
      return `\n- **${str(n, 'title')}**: ${oneLine(kids())}\n`
    case 'Steps':
    case 'Bleed':
      return kids()
    case 'Tabs': {
      const items = evalAttr(n, 'items', [])
      const tabs = n.children.filter((c) => c.name === 'Tabs.Tab')
      return `\n\n${tabs.map((t, idx) => `#### ${items[idx] ?? `Option ${idx + 1}`}\n\n${tidy(renderChildren(t, ctx))}`).join('\n\n')}\n\n`
    }
    case 'Tabs.Tab':
      return kids()
    case 'Diagram': {
      const cap = str(n, 'caption')
      const desc = str(n, 'description')
      return `\n\n${tidy(kids())}\n\n${cap ? `*${cap}*\n\n` : ''}${desc ? `Text description: ${desc}\n\n` : ''}`
    }
    case 'VersionTable':
      return `\n\n${dataTable(str(n, 'data', 'versions'))}\n\n`
    case 'Logos':
      return `\n\nBuilt with Frappe SaaS: ${LOGOS_LINKS}. See [Used by](/used-by/).\n\n`
    case 'AlphaFooter':
      return `\n\n---\n\n${footerText(str(n, 'repo', 'saas_core'))}\n\n`
    case 'Hero': {
      const p = evalAttr(n, 'primary', null)
      const s = evalAttr(n, 'secondary', null)
      const eyebrow = str(n, 'eyebrow')
      const links = [p && `[${p.label}](${p.href})`, s && `[${s.label}](${s.href})`].filter(Boolean).join(' · ')
      return `\n\n# ${str(n, 'title')}\n\n${eyebrow ? `${eyebrow}\n\n` : ''}${str(n, 'sub')}\n\n${links}\n\n${str(n, 'note') ? `\`${str(n, 'note')}\`\n\n` : ''}${tidy(kids())}\n\n`
    }
    case 'Section': {
      const title = str(n, 'title')
      const sub = str(n, 'sub')
      return `\n\n${title ? `## ${title}\n\n` : ''}${sub ? `${sub}\n\n` : ''}${tidy(kids())}\n\n`
    }
    case 'Flow': {
      const steps = evalAttr(n, 'steps', [])
      return `\n\n${steps.map((s, i) => `${i + 1}. **${s.title}**: ${s.body}`).join('\n')}\n\n`
    }
    case 'FileTree':
    case 'FileTree.Folder':
    case 'FileTree.File': {
      const depth = ctx.depth ?? 0
      if (n.name === 'FileTree') return `\n\n${tidy(renderChildren(n, { ...ctx, depth: 0 }))}\n\n`
      const line = `${'  '.repeat(depth)}- ${str(n, 'name')}${n.name === 'FileTree.Folder' ? '/' : ''}\n`
      return line + (n.name === 'FileTree.Folder' ? renderChildren(n, { ...ctx, depth: depth + 1 }) : '')
    }
    case 'details':
      return `\n\n${kids()}\n\n`
    case 'summary':
      return `### ${oneLine(kids())}\n\n`
    default:
      // Unknown component: keep the raw tag so the postbuild guard fails the build and names the file and line.
      return /\/>$/.test(n.rawOpen) ? n.rawOpen : n.rawOpen + kids() + `</${n.name}>`
  }
}

export function parseFrontmatter(src) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src)
  const fm = {}
  if (m) {
    for (const line of m[1].split('\n')) {
      const kv = /^(\w+):\s*(.*)$/.exec(line)
      if (kv) fm[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
    }
  }
  return { fm, body: m ? src.slice(m[0].length) : src }
}

// Mask fenced and inline code so transforms and the guard never touch it.
function mask(body) {
  const store = []
  const put = (s) => {
    store.push(s)
    return `\u0000${store.length - 1}\u0000`
  }
  let out = body.replace(/^(`{3,})[^\n]*\n[\s\S]*?\n\1[ \t]*$/gm, put)
  out = out.replace(/`[^`\n]+`/g, put)
  return { out, unmask: (s) => s.replace(/\u0000(\d+)\u0000/g, (_, i) => store[Number(i)]) }
}

export function toMarkdown(src, { site = 'https://frappesaas.tridz.in' } = {}) {
  const { fm, body: raw } = parseFrontmatter(src)
  let body = raw.replace(/^import .*\n/gm, '').replace(/^export .*\n/gm, '')
  const { out, unmask } = mask(body)
  body = out
  // <p className="lede">…</p> -> plain paragraph
  body = body.replace(/<p className="lede">([\s\S]*?)<\/p>/g, (_, t) => `\n\n${t.trim()}\n\n`)
  body = render(parse(body), { site })
  // description under the H1
  if (fm.description) {
    const h1 = /^# .+$/m.exec(body)
    if (h1) body = `${body.slice(0, h1.index + h1[0].length)}\n\n> ${fm.description}${body.slice(h1.index + h1[0].length)}`
    else body = `# ${fm.title || ''}\n\n> ${fm.description}\n\n${body}`
  }
  // internal links -> absolute .md URLs. Paths with an extension (llms.txt, foo.md, images) keep their path.
  body = body.replace(/\]\((\/[^)\s#]*)(#[^)\s]*)?\)/g, (_, path, hash = '') => {
    if (path === '/') return `](${site}/index.md${hash})`
    if (/\.[a-z0-9]+$/i.test(path)) return `](${site}${path}${hash})`
    return `](${site}${path.replace(/\/$/, '')}.md${hash})`
  })
  return `${unmask(tidy(body))}\n`
}

// Lines (outside code) that still look like a JSX component tag. Used by the postbuild guard.
export function findLeftoverTags(md) {
  const { out } = mask(md)
  const hits = []
  out.split('\n').forEach((line, i) => {
    if (/<\/?[A-Z][A-Za-z.]*[\s/>]/.test(line)) hits.push({ line: i + 1, text: line.trim().slice(0, 120) })
  })
  return hits
}

export function h1Of(md) {
  const { out } = mask(md)
  return (/^# (.+)$/m.exec(out) || [])[1]
}
