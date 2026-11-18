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
        <img
          src={`${base}/screens/${name}.webp`}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          {...(priority ? { fetchPriority: 'high' } : {})}
        />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

export const Shot = Screenshot

export function Gallery({ items, cols = 3 }) {
  return (
    <ul className={`gallery gallery--${cols}`} role="list">
      {items.map((i) => (
        <li key={i.name}>
          <figure className="shot">
            <a
              href={`${base}/screens/${i.name}.webp`}
              target="_blank"
              rel="noopener"
              aria-label={`${i.alt} (opens the full image in a new tab)`}
            >
              <img src={`${base}/screens/${i.name}.webp`} alt="" width="1440" height="900" loading="lazy" decoding="async" />
            </a>
            <figcaption>{i.caption || i.alt}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}
