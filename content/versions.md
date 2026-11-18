---
description: "Compatible release tags for Frappe SaaS (saas_core, fcctl, frappe-saaskit-starter, SDK and HTTP API) to pin when launching your Frappe app as SaaS."
---
# Versions

Alpha: pin exact tags. Use a set that is listed together.

| Piece | Tag | Status |
|---|---|---|
| `saas_core` | `v0.1.0-alpha.2` | Released |
| `saas_core` | `v0.1.0-alpha.3` | Released, includes the SDK tarballs |
| `fcctl` | `v0.1.0-alpha.4` | Released |
| `frappe-saaskit-starter` | `v0.1.0-alpha.2` | Released (a newer tag matching saas_core alpha.3 may follow) |
| SDK `@frappe-saaskit/client`, `react`, `mock` | `0.1.0-alpha.4` | Released, attached to the saas_core `v0.1.0-alpha.3` release |
| HTTP API | `2.0.0-alpha.1` | Current |

SDK tarballs and `SHA256SUMS`: [saas_core release v0.1.0-alpha.3](https://github.com/tridz-open/saas_core/releases/tag/v0.1.0-alpha.3). The SDK source is in [`saas_core/sdk`](https://github.com/tridz-open/saas_core/tree/main/sdk). Its old repository `frappe-saaskit-sdk` is archived: do not use it.

Starter `v0.1.0-alpha.2` vendors SDK `0.1.0-alpha.3` tarballs, so it needs no separate SDK install.

---

**Use at your own risk.** Frappe SaaS is early alpha software, provided "as is" without warranty of any kind. We are not accepting pull requests or outside contributions. If you find a problem, please [file an issue on saas_core](https://github.com/tridz-open/saas_core/issues), or [on the docs repo](https://github.com/tridz-open/frappe-saaskit/issues) for mistakes in these pages.
