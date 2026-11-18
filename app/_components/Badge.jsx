const LABEL = { verified: 'Verified', experimental: 'Experimental', tested: 'Tested', untested: 'Untested', alpha: 'Alpha', removed: 'Removed', stub: 'Stub', released: 'Released' }

// Status pill. Text is always present, so colour is never the only signal.
export function Badge({ status = 'alpha', children }) {
  return <span className={`badge badge--${status}`}>{children ?? LABEL[status] ?? status}</span>
}
