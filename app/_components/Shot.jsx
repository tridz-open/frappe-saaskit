const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

export function Shot({ name, alt, caption }) {
  return (
    <figure className="shot">
      <img src={`${base}/screens/${name}.webp`} alt={alt} width="1440" height="900" loading="lazy" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

export function Gallery({ items }) {
  return (
    <div className="gallery">
      {items.map((i) => (
        <Shot key={i.name} {...i} />
      ))}
    </div>
  )
}
