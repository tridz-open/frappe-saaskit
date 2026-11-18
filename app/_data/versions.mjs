// Single source of truth for pinned versions. Used by <VersionTable>, <RepoCard> data and the Markdown export.
export const versions = [
  { piece: '`saas_core`', tag: 'v0.1.0-alpha.2', status: 'released', note: 'Used by the local demo.' },
  { piece: '`saas_core`', tag: 'v0.1.0-alpha.3', status: 'released', note: 'Includes the SDK tarballs.' },
  { piece: '`fcctl`', tag: 'v0.1.0-alpha.4', status: 'released', note: '' },
  { piece: '`frappe-saaskit-starter`', tag: 'v0.1.0-alpha.2', status: 'released', note: 'A newer tag matching saas_core alpha.3 may follow.' },
  { piece: 'SDK `@frappe-saaskit/client`, `react`, `mock`', tag: '0.1.0-alpha.4', status: 'released', note: 'Attached to the saas_core v0.1.0-alpha.3 release.' },
  { piece: 'HTTP API', tag: '2.0.0-alpha.1', status: 'alpha', note: 'Current.' }
]

export const repos = [
  {
    name: 'saas_core',
    href: 'https://github.com/tridz-open/saas_core',
    description:
      'The control plane. A Frappe v16 app for plans, signup, billing, provisioning and a versioned HTTP API. Hosts the TypeScript SDK.',
    language: 'Python · TypeScript (SDK)',
    status: 'alpha',
    version: 'v0.1.0-alpha.3 · API 2.0.0-alpha.1',
    links: [
      { label: 'GitHub', href: 'https://github.com/tridz-open/saas_core' },
      { label: 'Status', href: '/status/' },
      { label: 'Releases', href: 'https://github.com/tridz-open/saas_core/releases' }
    ]
  },
  {
    name: 'fcctl',
    href: 'https://github.com/tridz-open/fcctl',
    description:
      'The Frappe Cloud v2 driver. A CLI and Python library with policies, approvals, a journal and an audit log.',
    language: 'Python 3.11+',
    status: 'alpha',
    version: 'v0.1.0-alpha.4',
    links: [
      { label: 'GitHub', href: 'https://github.com/tridz-open/fcctl' },
      { label: 'Commands', href: 'https://github.com/tridz-open/fcctl/blob/main/docs/COMMANDS.md' },
      { label: 'Guide', href: '/guides/fcctl/' }
    ]
  },
  {
    name: 'frappe-saaskit-starter',
    href: 'https://github.com/tridz-open/frappe-saaskit-starter',
    description:
      'The customer front end. Landing, pricing, signup, checkout, provisioning progress and a console, built on the SDK.',
    language: 'TypeScript · React 19 · Vite',
    status: 'alpha',
    version: 'v0.1.0-alpha.2',
    links: [
      { label: 'GitHub', href: 'https://github.com/tridz-open/frappe-saaskit-starter' },
      { label: 'Screenshots', href: 'https://github.com/tridz-open/frappe-saaskit-starter/tree/main/docs/screenshots' },
      { label: 'Fixture demo', href: '/getting-started/' }
    ]
  }
]
