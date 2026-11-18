// After `next build` (static export to ./out): publish each page's source as <page>.md (MDX converted to plain Markdown).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const SITE = process.env.SITE_URL || 'https://tridz-open.github.io/frappe-saaskit'
const logosMd = `Used by: [Tridz](https://tridz.com), [URY](https://ury.app), [Huf](https://huf.ai), [Franchise Media](https://www.thefranchisemedia.com/). See [Used by](${SITE}/used-by.md).`

function toPlain(src) {
  return src
    .replace(/^import .*\n/gm, '')
    .replace(/<Callout type="(\w+)">([\s\S]*?)<\/Callout>/g, (_, k, b) => `> **${k === 'warning' ? 'Warning' : 'Note'}:** ${b}`)
    .replace(/<Logos \/>/g, logosMd)
    .replace(/<Shot name="([^"]+)" alt="([^"]+)"[^>]*\/>/g, (_, n, a) => `![${a}](${SITE}/screens/${n}.webp)`)
    .replace(/<Gallery items=\{\[([\s\S]*?)\]\} \/>/g, (_, items) =>
      [...items.matchAll(/name:'([^']+)', alt:'([^']+)'/g)].map((m) => `![${m[2]}](${SITE}/screens/${m[1]}.webp)`).join('\n\n'))
    .replace(/\]\(\/([a-z-]+)\)/g, `](${SITE}/$1.md)`)
    .replace(/\n{3,}/g, '\n\n')
}

const lines = ['# Frappe SaaS', '', '> Documentation for Frappe SaaS: launch your Frappe app as SaaS on Frappe Cloud with three alpha repos (saas_core, fcctl, frappe-saaskit-starter). Alpha software; use at your own risk.', '', '## Pages', '']
for (const f of readdirSync('content').filter((f) => /\.mdx?$/.test(f)).sort()) {
  const name = f.replace(/\.mdx?$/, '')
  const plain = toPlain(readFileSync(`content/${f}`, 'utf8'))
  writeFileSync(`out/${name}.md`, plain)
  const title = (plain.match(/^# (.+)$/m) || [, name])[1]
  lines.push(`- [${title}](${SITE}/${name}.md)`)
}
writeFileSync('out/llms.txt', lines.join('\n') + '\n')
console.log('postbuild: wrote raw .md pages and llms.txt')
