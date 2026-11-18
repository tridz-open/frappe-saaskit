import { cloneElement } from 'react'
import { Icon } from './Icon'

const TYPES = {
  note: { label: 'Note', icon: 'Info' },
  tip: { label: 'Tip', icon: 'Lightbulb' },
  important: { label: 'Important', icon: 'CircleAlert' },
  warning: { label: 'Warning', icon: 'TriangleAlert' },
  caution: { label: 'Caution', icon: 'OctagonAlert' }
}
const FROM_CALLOUT = { default: 'note', info: 'note', note: 'note', tip: 'tip', important: 'important', warning: 'warning', error: 'caution', caution: 'caution' }

// One callout for GitHub alert blockquotes (> [!NOTE]) and for <Callout type="..." title="...">.
export function Alert({ type = 'note', title, children }) {
  const t = TYPES[type] || TYPES.note
  return (
    <aside className={`alert alert--${type}`} aria-label={t.label}>
      <p className="alert-title">
        <Icon name={t.icon} size={16} />
        <span>{title || t.label}</span>
      </p>
      <div className="alert-body">{children}</div>
    </aside>
  )
}

export function Callout({ type = 'default', title, children }) {
  const kind = FROM_CALLOUT[type] || 'note'
  return (
    <Alert type={kind} title={title}>
      {children}
    </Alert>
  )
}

// Markdown blockquote: GitHub alert syntax (> [!NOTE] then text on the next line or after a blank line) becomes an Alert.
// Nextra's own withGitHubAlert only matches when the marker is alone in its paragraph, which GitHub itself does not require.
export function Blockquote(props) {
  const kids = Array.isArray(props.children) ? props.children : [props.children]
  const idx = kids.findIndex((k) => k && typeof k === 'object')
  const p = kids[idx]
  const pc = p?.props?.children
  const parts = Array.isArray(pc) ? pc : [pc]
  const m = typeof parts[0] === 'string' ? /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/i.exec(parts[0]) : null
  if (!m) return <blockquote {...props} />
  const rest = [parts[0].slice(m[0].length), ...parts.slice(1)].filter((x) => x !== '')
  return (
    <Alert type={m[1].toLowerCase()}>
      {rest.length ? cloneElement(p, { children: rest }) : null}
      {kids.slice(idx + 1)}
    </Alert>
  )
}
