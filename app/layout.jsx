import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import 'nextra-theme-docs/style.css'
import './globals.css'
import './components.css'

export const metadata = {
  title: { default: 'Frappe SaaS', template: '%s | Frappe SaaS' },
  description:
    'Launch your Frappe app as SaaS on Frappe Cloud. Documentation for Frappe SaaS: saas_core, fcctl and the starter app (alpha).'
}

const navbar = (
  <Navbar
    logo={<span className="wordmark">Frappe SaaS</span>}
    projectLink="https://github.com/tridz-open/frappe-saaskit"
  />
)
const footer = (
  <Footer>
    <span>
      Tridz Technologies, MIT license. No analytics or cookies.
    </span>
  </Footer>
)

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/tridz-open/frappe-saaskit/tree/main"
          editLink="Edit on GitHub"
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
