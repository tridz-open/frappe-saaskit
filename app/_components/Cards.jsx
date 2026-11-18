import { A } from './Link'

export function Cards({ num = 3, children }) {
  return <div className={`cards cards--${num}`}>{children}</div>
}

function Card({ title, href, icon, arrow, children }) {
  const body = (
    <>
      {icon ? <span className="card-icon">{icon}</span> : null}
      <span className="card-title">
        {title}
        {href && arrow !== false ? <span className="card-arrow" aria-hidden="true"> →</span> : null}
      </span>
      {children ? <span className="card-body">{children}</span> : null}
    </>
  )
  return href ? (
    <A href={href} className="card card--link">
      {body}
    </A>
  ) : (
    <div className="card">{body}</div>
  )
}
Cards.Card = Card
