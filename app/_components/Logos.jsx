const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

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
        Used by · <a href={`${base}/used-by/`}>see who</a>
      </p>
      <ul>
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
