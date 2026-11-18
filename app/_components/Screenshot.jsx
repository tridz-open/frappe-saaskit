import { Lightbox } from './Lightbox'

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

export function Screenshot({ name, alt, caption, frame = 'none', priority = false, overlay = false, width = 1440, height = 900 }) {
  return (
    <figure className={`shot${frame === 'browser' ? ' shot--browser' : ''}${overlay ? ' shot--overlay' : ''}`}>
      <div className="shot-frame">
        {frame === 'browser' ? (
          <div className="shot-bar" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        ) : null}
        <a
          className="lb"
          href={`${base}/screens/${name}.webp`}
          data-pswp-width={width}
          data-pswp-height={height}
          data-alt={alt}
          data-caption={caption || alt}
          aria-label={`${alt}. Open larger view`}
        >
          <img
            src={`${base}/screens/${name}.webp`}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            {...(priority ? { fetchPriority: 'high' } : {})}
          />
          <LbIcon />
        </a>
      </div>
      <Lightbox />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

export const Shot = Screenshot

function LbIcon() {
  return (
    <span className="lb-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
      </svg>
    </span>
  )
}

// `featured`: show only the first N in the grid; the rest stay in the page (hidden) so the lightbox pages through all of them.
export function Gallery({ items, cols = 3, featured }) {
  const shown = featured ? items.slice(0, featured) : items
  const rest = featured ? items.slice(featured) : []
  const link = (i) => (
    <a
      className="lb"
      href={`${base}/screens/${i.name}.webp`}
      data-pswp-width="1440"
      data-pswp-height="900"
      data-alt={i.alt}
      data-caption={i.caption || i.alt}
      aria-label={`${i.alt}. Open larger view`}
    >
      <img src={`${base}/screens/${i.name}.webp`} alt="" width="1440" height="900" loading="lazy" decoding="async" />
      <LbIcon />
    </a>
  )
  return (
    <>
      <ul className={`gallery gallery--${cols}`} role="list">
        {shown.map((i) => (
          <li key={i.name}>
            <figure className="shot">
              {link(i)}
              <figcaption>{i.caption || i.alt}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      {rest.length ? (
        <>
          <div hidden>
            {rest.map((i) => (
              <span key={i.name}>{link(i)}</span>
            ))}
          </div>
          <p className="gallery-more">
            <a className="btn-more" href={`${base}/screens/${items[0].name}.webp`} data-pswp-open-first>
              View all {items.length} screenshots
            </a>
          </p>
        </>
      ) : null}
      <Lightbox />
    </>
  )
}
