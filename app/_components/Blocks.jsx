import { A, inline } from './Link'
import { Badge } from './Badge'
import { Icon } from './Icon'
import { versions, repos as repoData } from '../_data/versions.mjs'
import { statusRows } from '../_data/status.mjs'

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

export function Hero({ eyebrow, eyebrowLink, title, sub, primary, secondary, note, children }) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          {eyebrow ? (
            <p className="hero-eyebrow">
              <Badge status="alpha">{eyebrow}</Badge>
              {eyebrowLink ? <A href={eyebrowLink.href}>{eyebrowLink.label} →</A> : null}
            </p>
          ) : null}
          <h1 className="hero-title">{title}</h1>
          <p className="hero-sub">{sub}</p>
          <div className="hero-cta">
            {primary ? (
              <A href={primary.href} className="btn btn--primary">
                {primary.label}
                <Icon name="ArrowRight" size={16} />
              </A>
            ) : null}
            {secondary ? (
              <A href={secondary.href} className="btn btn--secondary">
                {secondary.icon ? <Icon name={secondary.icon} size={16} /> : null}
                {secondary.label}
              </A>
            ) : null}
          </div>
          {note ? <p className="hero-note">{note}</p> : null}
        </div>
        <div className="hero-visual">{children}</div>
      </div>
    </section>
  )
}

export function Section({ id, tone = 'default', title, sub, children }) {
  return (
    <section id={id} className={`section section--${tone}`}>
      <div className="section-inner">
        {title ? <h2 className="section-title">{title}</h2> : null}
        {sub ? <p className="section-sub">{sub}</p> : null}
        {children}
      </div>
    </section>
  )
}

export function Flow({ steps }) {
  return (
    <ol className="flow">
      {steps.map((s, i) => (
        <li key={s.title}>
          <span className="flow-icon">
            <Icon name={s.icon} size={20} />
          </span>
          <h3 className="flow-title">
            <span className="flow-n">{i + 1}.</span> {s.title}
          </h3>
          <p>{s.body}</p>
        </li>
      ))}
    </ol>
  )
}

export function FeatureGrid({ cols = 3, children }) {
  return (
    <ul className={`features features--${cols}`} role="list">
      {children}
    </ul>
  )
}

export function Feature({ icon, title, children }) {
  return (
    <li className="feature">
      {icon ? (
        <span className="card-icon">
          <Icon name={icon} />
        </span>
      ) : null}
      <h3 className="feature-title">{title}</h3>
      <div className="feature-body">{children}</div>
    </li>
  )
}

export function RepoCard({ name, href, description, language, status = 'alpha', version, links = [] }) {
  return (
    <article className="repo">
      <h3 className="repo-name">
        <Icon name="Github" size={18} />
        <a href={href} rel="noopener">
          {name}
        </a>
      </h3>
      <p className="repo-desc">{description}</p>
      <div className="repo-meta">
        <span className="repo-lang">
          <i aria-hidden="true" />
          {language}
        </span>
        <Badge status={status} />
        <code className="repo-version">{version}</code>
      </div>
      <ul className="repo-links" role="list">
        {links.map((l) => (
          <li key={l.label}>
            <A href={l.href}>{l.label}</A>
          </li>
        ))}
      </ul>
    </article>
  )
}

export function Repos() {
  return (
    <div className="cards cards--3">
      {repoData.map((r) => (
        <RepoCard key={r.name} {...r} />
      ))}
    </div>
  )
}

export function Diagram({ title, caption, description, children }) {
  return (
    <figure className="diagram" role="group" aria-label={title}>
      <div className="diagram-canvas">{children}</div>
      {caption ? <figcaption>{caption}</figcaption> : null}
      {description ? (
        <details className="diagram-desc">
          <summary>Text description</summary>
          <p>{description}</p>
        </details>
      ) : null}
    </figure>
  )
}

export function VersionTable({ data = 'versions' }) {
  if (data === 'status') {
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Area</th>
              <th>Status</th>
              <th>Flag</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {statusRows.map((r) => (
              <tr key={r.area}>
                <td>{inline(r.area)}</td>
                <td>
                  <Badge status={r.status} />
                </td>
                <td>{r.gate ? <code>{r.gate}</code> : null}</td>
                <td>{inline(r.note)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Piece</th>
            <th>Tag</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((v) => (
            <tr key={v.piece + v.tag}>
              <td>{inline(v.piece)}</td>
              <td>
                <code>{v.tag}</code>
              </td>
              <td>
                <Badge status={v.status} />
              </td>
              <td>{inline(v.note)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const clients = [
  { name: 'Tridz', href: 'https://tridz.com', logo: 'tridz.png' },
  { name: 'URY', href: 'https://ury.app', logo: 'ury.svg' },
  { name: 'Huf', href: 'https://huf.ai', logo: 'huf.svg' },
  { name: 'Franchise Media', href: 'https://www.thefranchisemedia.com/', logo: 'franchise-media.png' }
]

export function Logos() {
  return (
    <div className="logos">
      <p className="logos-title">
        Built with Frappe SaaS · <A href="/used-by/">see who</A>
      </p>
      <ul role="list">
        {clients.map((c) => (
          <li key={c.name}>
            <a href={c.href} aria-label={c.name} rel="noopener">
              <img src={`${base}/logos/${c.logo}`} alt={c.name} loading="lazy" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AlphaFooter({ repo = 'saas_core' }) {
  return (
    <div className="alpha-footer" role="note">
      <p>
        <strong>Use at your own risk.</strong> Frappe SaaS is early alpha software, provided &quot;as is&quot; without
        warranty of any kind. We are not accepting pull requests or outside contributions. If you find a problem,{' '}
        <a href={`https://github.com/tridz-open/${repo}/issues`} rel="noopener">
          file an issue on {repo}
        </a>
        , or{' '}
        <a href="https://github.com/tridz-open/frappe-saaskit/issues" rel="noopener">
          on the docs repo
        </a>{' '}
        for mistakes in these pages.
      </p>
      <p>
        Not affiliated with or endorsed by Frappe Technologies. &quot;Frappe&quot; and &quot;Frappe Cloud&quot; are
        their trademarks. No analytics or cookies.
      </p>
    </div>
  )
}
