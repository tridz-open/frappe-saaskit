import nextra from 'nextra'

const withNextra = nextra({ contentDirBasePath: '/' })
// Set NEXT_PUBLIC_BASE_PATH=/frappe-saaskit for GitHub Pages; leave unset for a custom domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default withNextra({
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined
})
