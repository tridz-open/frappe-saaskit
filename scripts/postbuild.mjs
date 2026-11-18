// After `next build` (static export to ./out):
//  1. walk content/ recursively and publish every page as plain Markdown (<route>.md),
//  2. write llms.txt (grouped by sidebar section) and llms-full.txt,
//  3. write static redirect stubs for moved URLs,
//  4. FAIL the build if any .md still contains a raw component tag (new components must add a transform in
//     scripts/lib/to-markdown.mjs).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { findLeftoverTags, h1Of, parseFrontmatter, toMarkdown } from './lib/to-markdown.mjs'
import { REDIRECTS } from './redirects.mjs'

const SITE = (process.env.SITE_URL || 'https://frappesaas.tridz.in').replace(/\/$/, '')
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''
const OUT = 'out'

const write = (file, text) => {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
}

async function loadMeta(dir) {
  const f = join('content', dir, '_meta.js')
  if (!existsSync(f)) return {}
  const code = readFileSync(f, 'utf8')
  return (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).default
}

// ---------- discover pages ----------
const files = readdirSync('content', { recursive: true })
  .map((f) => String(f).replaceAll('\\', '/'))
  .filter((f) => /\.mdx?$/.test(f) && !f.split('/').some((p) => p.startsWith('_')))

const pages = new Map() // route ('' | 'a' | 'a/b') -> { route, file, title, description, md }
for (const f of files) {
  const route = f.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '')
  const src = readFileSync(join('content', f), 'utf8')
  const md = toMarkdown(src, { site: SITE })
  const { fm } = parseFrontmatter(src)
  const title = h1Of(md) || fm.title || route
  pages.set(route, { route, file: f, title, description: fm.description || '', md })
}

// ---------- guard ----------
let failed = false
for (const p of pages.values()) {
  for (const h of findLeftoverTags(p.md)) {
    failed = true
    console.error(`postbuild: raw component tag in content/${p.file} (output line ${h.line}): ${h.text}`)
  }
}
if (failed) {
  console.error('postbuild: FAILED. Add a transform for the component in scripts/lib/to-markdown.mjs (or remove it).')
  process.exit(1)
}

// ---------- write .md copies ----------
const mdPath = (route) => (route === '' ? 'index.md' : `${route}.md`)
for (const p of pages.values()) {
  write(join(OUT, mdPath(p.route)), p.md)
  const isIndex = /(^|\/)index\.mdx?$/.test(p.file)
  if (isIndex && p.route !== '') write(join(OUT, p.route, 'index.md'), p.md)
}
for (const [oldRoute, newRoute] of process.env.SKIP_REDIRECTS ? [] : Object.entries(REDIRECTS)) {
  const target = pages.get(newRoute)
  if (!target) throw new Error(`redirect target missing for ${oldRoute} -> ${newRoute}`)
  write(join(OUT, mdPath(oldRoute)), target.md)
  const to = `${BASE}/${newRoute}/`
  write(
    join(OUT, oldRoute, 'index.html'),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved | Frappe SaaS</title><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${SITE}/${newRoute}/"><meta name="robots" content="noindex"></head><body><p>This page moved to <a href="${to}">${SITE}/${newRoute}/</a>.</p></body></html>\n`
  )
}

// ---------- llms.txt ----------
const url = (route) => `${SITE}/${mdPath(route)}`
const line = (p) => `- [${p.title}](${url(p.route)})${p.description ? `: ${p.description}` : ''}`
const order = [] // route order, nav order
const groups = [] // { heading|null, routes[] }
let current = { heading: null, routes: [] }
groups.push(current)
const rootMeta = await loadMeta('')
const folderRoutes = async (key) => {
  const meta = await loadMeta(key)
  const routes = []
  const seen = new Set()
  for (const k of Object.keys(meta)) {
    const r = k === 'index' ? key : `${key}/${k}`
    if (pages.has(r)) {
      routes.push(r)
      seen.add(r)
    }
  }
  for (const r of [...pages.keys()].filter((r) => r.startsWith(`${key}/`) || r === key).sort()) if (!seen.has(r)) routes.push(r)
  return routes
}
for (const [key, val] of Object.entries(rootMeta)) {
  if (val && typeof val === 'object' && val.type === 'separator') {
    current = { heading: val.title, routes: [] }
    groups.push(current)
    continue
  }
  if (key === 'index') continue
  if (existsSync(join('content', key))) current.routes.push(...(await folderRoutes(key)))
  else if (pages.has(key)) current.routes.push(key)
}
const listed = new Set(groups.flatMap((g) => g.routes))
const unlisted = [...pages.keys()].filter((r) => r !== '' && !listed.has(r)).sort()
if (unlisted.length) groups.push({ heading: 'More', routes: unlisted })

const out = [
  '# Frappe SaaS',
  '',
  '> Documentation for Frappe SaaS: launch your Frappe app as SaaS on Frappe Cloud with three alpha repos (saas_core, fcctl, frappe-saaskit-starter). Alpha software; use at your own risk. Every page is also available as plain Markdown at the same URL with a .md extension; llms-full.txt concatenates them all.',
  ''
]
for (const g of groups) {
  const rs = [...(g === groups[0] && pages.has('') ? [''] : []), ...g.routes]
  if (!rs.length) continue
  out.push(g.heading ? `## ${g.heading}` : '## Start', '')
  for (const r of rs) {
    out.push(line(pages.get(r)))
    order.push(r)
  }
  out.push('')
}
write(join(OUT, 'llms.txt'), out.join('\n').replace(/\n+$/, '\n'))
write(
  join(OUT, 'llms-full.txt'),
  order.map((r) => `<!-- ${url(r)} -->\n\n${pages.get(r).md}`).join('\n---\n\n')
)
console.log(`postbuild: ${pages.size} pages -> .md, llms.txt (${order.length} entries), llms-full.txt, ${Object.keys(REDIRECTS).length} redirect stubs`)
