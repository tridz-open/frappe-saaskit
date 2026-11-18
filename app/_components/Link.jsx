import NextLink from 'next/link'

// Internal paths use next/link (basePath aware); everything else is a plain external link.
export function A({ href, children, ...props }) {
  if (href && href.startsWith('/') && !/\.[a-z0-9]+$/i.test(href)) {
    return <NextLink href={href} {...props}>{children}</NextLink>
  }
  const external = /^https?:/.test(href || '')
  return (
    <a href={href} {...(external ? { rel: 'noopener' } : {})} {...props}>
      {children}
    </a>
  )
}

// `code` inline markers in data strings -> <code>
export function inline(text) {
  return String(text)
    .split(/(`[^`]+`)/)
    .map((part, i) => (part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part))
}
