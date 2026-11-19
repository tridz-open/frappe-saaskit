// Generates the hand-built SVG diagrams in public/diagrams/*.svg (run: node scripts/gen-diagrams.mjs).
// Conventions: notched 8x8 arrowheads, arrows start 5px off the source and end 11px short of the target,
// colours are CSS variables (--k-*) so the site (light/dark) can theme them; standalone files fall back to prefers-color-scheme.
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = 'public/diagrams'
mkdirSync(OUT, { recursive: true })
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const STYLE = `
.dg{--k-ink:#18181b;--k-mut:#5b5b63;--k-line:#71717a;--k-bg:#ffffff;--k-box:#ffffff;--k-bs:#b9b9b3;--k-grp:#f4f4f2;--k-gs:#c4c4be;--k-acc:#eef2ff;--k-as:#4f46e5;--k-ok:#dcfce7;--k-os:#16a34a;--k-warn:#fef3c7;--k-ws:#d97706;--k-bad:#fef2f2;--k-bds:#dc2626}
@media (prefers-color-scheme:dark){.dg{--k-ink:#ededef;--k-mut:#a1a1aa;--k-line:#8b8b96;--k-bg:#18181b;--k-box:#202024;--k-bs:#52525b;--k-grp:#141417;--k-gs:#3f3f46;--k-acc:rgba(129,140,248,.14);--k-as:#818cf8;--k-ok:rgba(34,197,94,.14);--k-os:#4ade80;--k-warn:rgba(245,158,11,.14);--k-ws:#fbbf24;--k-bad:rgba(239,68,68,.14);--k-bds:#f87171}}
.dg text{font-family:var(--font-geist-sans),Geist,system-ui,-apple-system,'Segoe UI',sans-serif;fill:var(--k-ink);font-size:12.5px}
.dg .dg-p{font-weight:560}
.dg .dg-s{fill:var(--k-mut);font-size:11px}
.dg .dg-l{fill:var(--k-mut);font-size:11.5px}
.dg .dg-h{paint-order:stroke;stroke:var(--k-bg);stroke-width:5px;stroke-linejoin:round}
.dg .dg-n{fill:var(--k-as);font-weight:650}
.dg .dg-gt{fill:var(--k-mut);font-size:11px;font-weight:560;letter-spacing:.02em}
.dg .dg-box{fill:var(--k-box);stroke:var(--k-bs);stroke-width:1.2}
.dg .dg-acc{fill:var(--k-acc);stroke:var(--k-as)}
.dg .dg-ok{fill:var(--k-ok);stroke:var(--k-os)}
.dg .dg-warn{fill:var(--k-warn);stroke:var(--k-ws)}
.dg .dg-bad{fill:var(--k-bad);stroke:var(--k-bds)}
.dg .dg-grp{fill:var(--k-grp);stroke:var(--k-gs);stroke-width:1.2;stroke-dasharray:6 4}
.dg .dg-ln{fill:none;stroke:var(--k-line);stroke-width:1.3}
.dg .dg-dash{stroke-dasharray:6 4}
.dg .dg-life{stroke:var(--k-gs);stroke-width:1.2;stroke-dasharray:3 4}
.dg .dg-mk{fill:var(--k-line)}
.dg .dg-dot{fill:var(--k-line)}
.dg .dg-bar{stroke-width:1.2}
.dg .dg-tick{stroke:var(--k-line);stroke-width:1.2}
.dg .dg-guide{stroke:var(--k-gs);stroke-width:1.2;stroke-dasharray:3 4}
`.trim()

class D {
  constructor(id, W, H, title) {
    Object.assign(this, { id, W, H, title })
    this.bg = []
    this.ln = []
    this.fg = []
    this.top = []
  }
  group(x, y, w, h, title) {
    this.bg.push(`<rect class="dg-grp" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>`)
    this.bg.push(`<text class="dg-gt" x="${x + 12}" y="${y + 16}">${esc(title)}</text>`)
  }
  text(x, y, str, { cls = '', anchor = 'middle', halo = false } = {}) {
    const c = ['dg-l', cls, halo ? 'dg-h' : ''].filter(Boolean).join(' ')
    this.fg.push(`<text class="${c}" x="${x}" y="${y}" text-anchor="${anchor}">${str}</text>`)
  }
  // multi-line label, last line ends at baseline y (lines go upward) when up=true, else first line at y
  label(x, y, lines, { anchor = 'middle', up = false, halo = false, cls = '' } = {}) {
    const ls = Array.isArray(lines) ? lines : [lines]
    const y0 = up ? y - (ls.length - 1) * 13 : y
    ls.forEach((l, i) => this.text(x, y0 + i * 13, esc(l), { anchor, halo, cls }))
  }
  boxText(cx, cy, lines, anchor = 'middle') {
    const n = lines.length
    const y0 = cy - ((n - 1) * 15) / 2 + 4
    lines.forEach((l, i) => {
      const prim = i === 0 || l.startsWith('!')
      this.fg.push(`<text class="${prim ? 'dg-p' : 'dg-s'}" x="${cx}" y="${y0 + i * 15}" text-anchor="${anchor}">${esc(l.replace(/^!/, ''))}</text>`)
    })
  }
  box(x, y, w, h, lines, kind = 'box', rx = 7) {
    this.fg.push(`<!-- ${lines[0]}: x=${x} y=${y} right=${x + w} bottom=${y + h} -->`)
    this.fg.push(`<rect class="dg-${kind}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`)
    this.boxText(x + w / 2, y + h / 2, lines)
  }
  hex(x, y, w, h, lines, kind = 'warn', cut = 16) {
    const pts = [[x + cut, y], [x + w - cut, y], [x + w, y + h / 2], [x + w - cut, y + h], [x + cut, y + h], [x, y + h / 2]].map((p) => p.join(',')).join(' ')
    this.fg.push(`<polygon class="dg-${kind}" points="${pts}" stroke-linejoin="round"/>`)
    this.boxText(x + w / 2, y + h / 2, lines)
  }
  path(dd, dashed = false) {
    this.ln.push(`<path class="dg-ln${dashed ? ' dg-dash' : ''}" d="${dd}" marker-end="url(#ar-${this.id})"/>`)
  }
  // straight arrows between edges: sx/ex are the SOURCE edge and TARGET edge; 5px off the source, 11px short of the target
  h(sx, ex, y, dashed = false) {
    const s = ex > sx ? 1 : -1
    this.path(`M${sx + 5 * s},${y} L${ex - 11 * s},${y}`, dashed)
  }
  v(x, sy, ey, dashed = false) {
    const s = ey > sy ? 1 : -1
    this.path(`M${x},${sy + 5 * s} L${x},${ey - 11 * s}`, dashed)
  }
  render() {
    const defs = `<defs><marker id="ar-${this.id}" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path class="dg-mk" d="M0,0 L8,4 L0,8 L2,4 z"/></marker></defs>`
    return `<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 ${this.W} ${this.H}" width="${this.W}" role="img" aria-label="${esc(this.title)}">\n<title>${esc(this.title)}</title>\n<style>${STYLE}</style>\n${defs}\n${[...this.bg, ...this.ln, ...this.fg, ...this.top].join('\n')}\n</svg>\n`
  }
  save(name) {
    writeFileSync(`${OUT}/${name}.svg`, this.render())
    console.log('wrote', name, this.W, 'x', this.H)
  }
}

// ---------- sequence helper ----------
// parts: [{x, lines}] ; items: msg / note / frame
function seq(id, title, W, parts, items, { boxW = 130, startY = 20 } = {}) {
  const d = new D(id, W, 0, title)
  const X = parts.map((p) => p.x)
  const top = startY
  const boxH = parts.some((p) => p.lines.length > 1) ? 44 : 36
  let y = top + boxH + 18
  const frames = []
  let n = 0
  const body = []
  for (const it of items) {
    if (it.frame === 'start') { frames.push({ y0: y - 12, tag: it.tag, sub: it.sub, divs: [] }); y += 14; continue }
    if (it.divider) { y += 2; frames.at(-1).divs.push({ y: y, text: it.divider }); y += 18; continue }
    if (it.frame === 'end') { const f = frames.pop(); f.y1 = y - 4; body.push(f); y += 14; continue }
    if (it.note) {
      const ls = it.note
      const h = ls.length * 15 + 14
      const cx = it.cx ?? X[it.at]
      d.fg.push(`<rect class="dg-warn" x="${cx - it.w / 2}" y="${y}" width="${it.w}" height="${h}" rx="6"/>`)
      ls.forEach((l, i) => d.fg.push(`<text class="dg-s" style="fill:var(--k-ink)" x="${cx}" y="${y + 19 + i * 15}" text-anchor="middle">${esc(l)}</text>`))
      y += h + 20
      continue
    }
    // message
    n++
    const ls = it.lines
    const lab = ls.length * 13
    const ly = y + lab + 2
    const fromX = X[it.from], toX = X[it.to]
    const s = toX > fromX ? 1 : -1
    d.path(`M${fromX + 5 * s},${ly} L${toX - 11 * s},${ly}`, it.dashed)
    const cx = it.at ?? (fromX + toX) / 2
    ls.forEach((l, i) => {
      const t = i === 0 ? `<tspan class="dg-n">${n}</tspan>  ${esc(l)}` : esc(l)
      d.fg.push(`<text class="dg-l" x="${cx}" y="${y + 9 + i * 13}" text-anchor="middle" style="fill:var(--k-ink)">${t}</text>`)
    })
    y = ly + 24
  }
  const bottom = y - 4
  d.H = bottom + 20
  X.forEach((x) => d.bg.push(`<line class="dg-life" x1="${x}" y1="${top + boxH}" x2="${x}" y2="${bottom}"/>`))
  parts.forEach((p, i) => d.box(p.x - boxW / 2, top, boxW, boxH, p.lines, p.kind || 'box'))
  for (const f of body) {
    const x0 = Math.min(...X) - boxW / 2, w = Math.max(...X) + boxW / 2 - x0
    d.bg.push(`<rect class="dg-grp" x="${x0}" y="${f.y0}" width="${w}" height="${f.y1 - f.y0}" rx="8"/>`)
    d.bg.push(`<text class="dg-gt" x="${x0 + 12}" y="${f.y0 + 15}">${esc(f.tag)}  <tspan style="font-weight:400">${esc(f.sub)}</tspan></text>`)
    f.divs.forEach((dv) => {
      d.bg.push(`<line class="dg-guide" x1="${x0}" y1="${dv.y}" x2="${x0 + w}" y2="${dv.y}"/>`)
      d.bg.push(`<text class="dg-gt" x="${x0 + 12}" y="${dv.y + 14}">and  <tspan style="font-weight:400">${esc(dv.text)}</tspan></text>`)
    })
  }
  return d
}

// ===== D1 architecture =====
{
  const d = new D('arch', 810, 292, 'Frappe SaaS architecture')
  const R1 = 50, R2 = 126, R3 = 202, H = 48
  d.group(305, 20, 180, 252, 'Your server')
  d.group(590, 20, 200, 252, 'Frappe Cloud v2')
  d.box(20, R1, 160, H, ['Browser'])
  d.box(20, R2, 160, H, ['Starter', 'React + SDK'])
  d.box(20, R3, 160, H, ['Payment gateway', 'Razorpay · Stripe · yours'], 'warn')
  d.box(325, R1, 140, H, ['fcctl', 'CLI + library'], 'acc')
  d.box(325, R2, 140, 124, ['saas_core', 'control-plane site'], 'acc')
  d.box(610, R1, 160, H, ['Central', 'team · servers · buckets'])
  d.box(610, R2, 160, H, ['Pilot', 'sites · apps · backups'])
  d.box(610, R3, 66, H, ['Tenant', 'site A'], 'ok')
  d.box(704, R3, 66, H, ['Tenant', 'site B'], 'ok')
  d.v(100, R1 + H, R2); d.label(110, 117, 'visits', { anchor: 'start' })
  d.h(180, 325, 150); d.label(242, 135, ['HTTPS JSON', 'API 2.0.0-alpha.1'], { up: true })
  d.h(180, 325, 216); d.label(242, 204, 'webhooks')
  d.h(325, 180, 236); d.label(242, 254, 'checkout session')
  d.v(395, R2, R1 + H); d.label(405, 117, 'fcctl port', { anchor: 'start' })
  d.h(465, 610, 74); d.label(537, 62, 'Central API')
  d.path('M470,74 C 530,74 550,150 599,150'); d.label(537, 140, 'Pilot API')
  d.v(643, R2 + H, R3); d.v(737, R2 + H, R3); d.label(690, 193, 'hosts')
  d.save('architecture')
}

// ===== D2 request sequence =====
{
  const d = seq('req', 'Checkout request flow', 800, [
    { x: 85, lines: ['Browser'] },
    { x: 285, lines: ['Starter (SDK)'] },
    { x: 515, lines: ['saas_core'], kind: 'acc' },
    { x: 715, lines: ['Gateway'], kind: 'warn' }
  ], [
    { from: 0, to: 1, lines: ['Choose plan, sign up'] },
    { from: 1, to: 2, lines: ['signup, me (CSRF)'] },
    { from: 1, to: 2, lines: ['checkout.create_session', '(Idempotency-Key)'] },
    { note: ['Tenant = pending'], at: 2, w: 150 },
    { from: 2, to: 3, lines: ['create_checkout_session'] },
    { from: 3, to: 0, lines: ['Hosted checkout / Checkout.js'], dashed: true, at: 615 },
    { from: 0, to: 3, lines: ['Pay'], at: 615 },
    { frame: 'start', tag: 'par', sub: 'Browser proof' },
    { from: 0, to: 2, lines: ['checkout.verify_payment'], at: 400 },
    { divider: 'Server proof' },
    { from: 3, to: 2, lines: ['webhook (signed)'] },
    { frame: 'end' },
    { note: ['Payment Event gateway:event_id', 'first one wins'], at: 2, w: 250 },
    { from: 2, to: 1, lines: ['job updates (poll or SSE)'], dashed: true }
  ])
  d.save('request-flow')
}

// ===== D3 provisioning =====
{
  const d = seq('prov', 'Provisioning sequence', 830, [
    { x: 75, lines: ['Billing processor'] },
    { x: 245, lines: ['Provision Job'] },
    { x: 415, lines: ['fcctl workflow'] },
    { x: 585, lines: ['Frappe Cloud', '(Pilot)'] },
    { x: 755, lines: ['Owner'] }
  ], [
    { from: 0, to: 1, lines: ['enqueue provision', '(dedupe)'] },
    { from: 1, to: 2, lines: ['provision_site(spec,', 'workflow_id)'] },
    { from: 2, to: 3, lines: ['preflight, server,', 'bench_apps, create_site'] },
    { from: 2, to: 3, lines: ['isolate, restore template', 'backup, reisolate'] },
    { from: 2, to: 3, lines: ['hooks: recipe, then', 'core.scheduler_resume,', 'core.maintenance_off'] },
    { from: 2, to: 3, lines: ['config, health checks', '(12 x 10 s)'] },
    { from: 2, to: 1, lines: ['succeeded'], dashed: true },
    { from: 1, to: 4, lines: ['setup email (one-time', 'link, 24 h)'], at: 670 },
    { from: 4, to: 3, lines: ['set password,', 'finish setup'] },
    { from: 3, to: 1, lines: ['setup_complete'], dashed: true, at: 330 },
    { from: 1, to: 4, lines: ['welcome email'], at: 670 }
  ])
  d.save('provisioning')
}

// ===== D4 billing timeline =====
{
  const x0 = 50, s = 21, day = (n) => x0 + (n - 1) * s // x at start of day n (1 Mar = day 1)
  const end = x0 + 31 * s // 1 Apr
  const d = new D('bill', end + 50, 270, 'Billing timeline for the cancel example')
  const cancelX = day(11) // end of 10 Mar
  // guides (behind)
  d.bg.push(`<line class="dg-guide" x1="${cancelX}" y1="62" x2="${cancelX}" y2="204"/>`)
  d.bg.push(`<line class="dg-guide" x1="${end}" y1="62" x2="${end}" y2="204"/>`)
  // milestones
  const dia = (x, kind) => d.fg.push(`<path class="dg-${kind}" d="M${x},50 L${x + 8},58 L${x},66 L${x - 8},58 z" stroke-width="1.2"/>`)
  dia(cancelX, 'bad'); dia(end, 'box')
  d.label(cancelX, 28, ['Cancel on 10 Mar', 'site runs to midnight'], { up: true, cls: '' })
  d.label(end, 28, ['1 Apr', 'renewal not charged'], { up: true, anchor: 'end' })
  // bars
  d.box(x0, 92, end - x0, 40, ['Prepaid 1 Mar to 1 Apr: ₹2,999, 31 days'], 'acc')
  d.box(x0, 160, cancelX - x0, 40, ['Used 10 days', '₹967.42'], 'ok')
  d.box(cancelX, 160, end - cancelX, 40, ['Unused 11 to 31 Mar, 21 days', 'refund ₹2,031.58'], 'bad')
  // axis
  const ay = 224
  d.fg.push(`<line class="dg-tick" x1="${x0}" y1="${ay}" x2="${end}" y2="${ay}"/>`)
  for (const [n, t] of [[1, '1 Mar'], [6, '6 Mar'], [11, '11 Mar'], [16, '16 Mar'], [21, '21 Mar'], [26, '26 Mar'], [32, '1 Apr']]) {
    const x = day(n)
    d.fg.push(`<line class="dg-tick" x1="${x}" y1="${ay}" x2="${x}" y2="${ay + 5}"/>`)
    d.text(x, ay + 20, t, { cls: 'dg-s' })
  }
  d.save('billing-timeline')
}

// ===== D5 approval gate =====
{
  const d = new D('appr', 864, 430, 'Approval gate flow')
  const cx = 330, bw = 220, bx = cx - bw / 2
  d.box(bx, 20, bw, 48, ['Destructive op requested', 'drop · restore · terminate'])
  d.hex(bx, 96, bw, 52, ['Policy'], 'warn')
  d.hex(bx, 176, bw, 60, ['Site created by', 'this workflow?'], 'warn')
  d.box(bx, 264, bw, 54, ['File approval request', 'exit 7, expires 30 min'], 'box')
  d.hex(bx, 346, bw, 60, ['Second person approves?', 'approver ≠ requester'], 'warn')
  d.box(20, 100, 100, 44, ['Denied', 'exit 4'], 'bad')
  d.box(20, 350, 100, 52, ['Expired or', 'denied'], 'bad')
  d.box(560, 96, 84, 310, ['Execute'], 'ok')
  d.box(684, 176, 160, 54, ['Journal: dispatching', 'fsync first'], 'box')
  d.box(684, 258, 160, 48, ['Call Frappe Cloud'], 'box')
  d.box(684, 334, 160, 54, ['Hash-chained', 'audit entry'], 'box')
  d.v(cx, 68, 96)
  d.v(cx, 148, 176); d.label(cx + 10, 166, 'guarded', { anchor: 'start' })
  d.v(cx, 236, 264); d.label(cx + 10, 254, 'no', { anchor: 'start' })
  d.v(cx, 318, 346)
  d.h(bx, 120, 122); d.label(170, 106, ['read_only /', 'protected'], { up: true })
  d.h(bx + bw, 560, 122); d.label(500, 112, 'full')
  d.h(bx + bw, 560, 206); d.label(500, 188, ['yes (journal', 'proves it)'])
  d.h(bx + bw, 560, 376); d.label(500, 366, 'yes')
  d.h(bx, 120, 376); d.label(170, 366, ['no /', 'expired'], { up: true })
  d.h(644, 684, 203)
  d.v(764, 230, 258)
  d.v(764, 306, 334)
  d.save('approval-gate')
}

// ===== D6 gateway plugin =====
{
  const d = new D('gw', 902, 394, 'Gateway plugin flow')
  d.group(20, 20, 210, 170, 'Your Frappe app')
  d.box(40, 44, 170, 48, ['class MyGateway(Gateway)', 'name, supports'])
  d.box(40, 120, 170, 48, ['hooks.py', 'saas_core_gateways'])
  d.box(310, 76, 210, 62, ['registry.get_gateway(name)', 'experimental gate ·', 'Gateway Account'], 'acc')
  d.box(590, 81, 170, 52, ['checkout.create_session'])
  d.path('M215,68 C 260,68 270,96 299,96'); d.label(257, 58, 'implements', {})
  d.path('M215,144 C 260,144 270,118 299,118'); d.label(257, 170, 'registers')
  d.h(520, 590, 107)
  // webhook row
  const Y = 250
  d.box(20, Y, 160, 52, ['webhooks.receive', '?gateway=name'])
  d.hex(208, Y - 1, 150, 54, ['verify_webhook', 'raw bytes, HMAC'], 'warn')
  d.box(386, Y, 170, 52, ['parse_event →', 'NormalizedEvent'])
  d.box(584, Y, 130, 52, ['Payment Event', 'gateway:event_id'])
  d.box(742, Y, 130, 52, ['billing processor'], 'ok')
  d.h(180, 208, Y + 26)
  d.h(358, 386, Y + 26); d.label(372, Y + 14, 'true', {})
  d.h(556, 584, Y + 26)
  d.h(714, 742, Y + 26)
  d.box(238, 334, 70, 40, ['401'], 'bad')
  d.v(283, Y + 53, 334); d.label(293, 322, 'false', { anchor: 'start' })
  d.path('M807,245 C 807,205 415,215 415,149'); d.label(615, 190, 'refund (if supports)')
  d.save('gateway-plugin')
}

// ===== D7 tenant states =====
{
  const d = new D('state', 870, 312, 'Tenant states')
  const w = 104, h = 48, R1 = 64, R2 = 192
  const px = 64, vx = 298, ax = 532, tx = 746
  d.fg.push(`<circle class="dg-dot" cx="${px + w / 2}" cy="20" r="6"/>`)
  d.v(px + w / 2, 26, R1); d.label(px + w / 2 + 14, 24, 'checkout or admin', { anchor: 'start' })
  d.box(px, R1, w, h, ['pending'], 'box', 24)
  d.box(vx, R1, w, h, ['provisioning'], 'acc', 24)
  d.box(ax, R1, w, h, ['active'], 'ok', 24)
  d.box(vx, R2, w, h, ['failed'], 'bad', 24)
  d.box(ax, R2, w, h, ['suspended'], 'warn', 24)
  d.box(tx, R2, w, h, ['terminating'], 'warn', 24)
  // pending <-> provisioning
  d.h(px + w, vx, R1 + 14); d.label((px + w + vx) / 2, R1 + 2, ['provision job', 'starts'], { up: true })
  d.h(vx, px + w, R1 + 34); d.label((px + w + vx) / 2, R1 + 53, ['capacity', 'exhausted'])
  // provisioning -> active
  d.h(vx + w, ax, R1 + 24); d.label((vx + w + ax) / 2, R1 + 10, ['health ok,', 'setup mail'], { up: true })
  // provisioning <-> failed
  d.v(vx + w / 2 - 14, R1 + h, R2); d.label(vx + w / 2 - 24, R1 + h + 46, ['workflow or', 'template failed'], { anchor: 'end', up: true })
  d.v(vx + w / 2 + 14, R2, R1 + h); d.label(vx + w / 2 + 24, R1 + h + 46, ['operator', 'retries'], { anchor: 'start', up: true })
  // active <-> suspended
  d.v(ax + w / 2 - 14, R1 + h, R2); d.label(ax + w / 2 - 24, R1 + h + 46, ['dunning stage 3', '/ canceled'], { anchor: 'end', up: true })
  d.v(ax + w / 2 + 14, R2, R1 + h); d.label(ax + w / 2 + 24, R1 + h + 46, ['payment', 'succeeded'], { anchor: 'start', up: true })
  // delete approved
  d.h(ax + w, tx, R2 + 24); d.label((ax + w + tx) / 2, R2 + 12, ['delete', 'approved'], { up: true })
  d.path(`M${ax + w + 5},${R1 + 24} C 720,${R1 + 24} ${tx + w / 2},${R1 + 70} ${tx + w / 2},${R2 - 11}`); d.label(742, R1 + 14, 'delete approved', {})
  // end
  const ey = 284
  d.v(tx + w / 2, R2 + h, ey - 8); d.label(tx + w / 2 - 10, R2 + h + 26, ['site removed,', 'fc_site cleared'], { anchor: 'end', up: true })
  d.fg.push(`<circle cx="${tx + w / 2}" cy="${ey}" r="8" fill="none" stroke="var(--k-line)" stroke-width="1.3"/><circle class="dg-dot" cx="${tx + w / 2}" cy="${ey}" r="4.5"/>`)
  d.save('tenant-states')
}

// ===== D8 lifecycle =====
{
  const d = new D('life', 856, 180, 'Customer lifecycle')
  const y = 24, h = 48, w = 108, g = 30
  const xs = [20, 20 + (w + g), 20 + 2 * (w + g), 20 + 3 * (w + g), 20 + 4 * (w + g)]
  d.box(xs[0], y, w, h, ['Sign up'])
  d.box(xs[1], y, w, h, ['Checkout & pay'])
  d.box(xs[2], y, w, h, ['Provision'])
  d.box(xs[3], y, w, h, ['Active'], 'ok')
  d.box(xs[4], y, w, h, ['Cancel & refund'], 'warn')
  const hx = xs[4] + w + g
  d.box(hx, y, 124, h, ['Terminate', 'two-person approval'], 'bad')
  for (let i = 0; i < 4; i++) d.h(xs[i] + w, xs[i + 1], y + 24)
  d.h(xs[4] + w, hx, y + 24)
  // renew / change plan hang below Active
  const cxA = xs[3] + w / 2
  const ey = y + h + 40
  d.box(cxA - 70 - w / 2, ey, w, h, ['Renew monthly'])
  d.box(cxA + 70 - w / 2, ey, w, h, ['Change plan'])
  d.v(cxA - 46, y + h, ey); d.v(cxA - 24, ey, y + h)
  d.v(cxA + 24, y + h, ey); d.v(cxA + 46, ey, y + h)
  d.save('lifecycle')
}
