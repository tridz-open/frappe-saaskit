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

// Rendered by nextra's withGitHubAlert: children = [<b>Warning</b>, ...paragraphs]
export function AlertFromBlockquote({ type, children }) {
  const kids = Array.isArray(children) ? children : [children]
  return <Alert type={type}>{kids.slice(1)}</Alert>
}
