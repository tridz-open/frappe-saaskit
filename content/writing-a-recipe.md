---
description: "How to make your Frappe app launchable as SaaS with Frappe SaaS: a recipe class plus a template, golden backup and hooks that saas_core provisions per customer."
---
# Writing a recipe

A **recipe** is the extension point that turns your Frappe app into something `saas_core` can provision for each customer. It has two parts.

## 1. The Template (data)

Says what a new tenant site is: apps, golden backup, hooks, health checks. Field reference and examples: [saas_core docs/TEMPLATES.md](https://github.com/tridz-open/saas_core/blob/main/docs/TEMPLATES.md).

- `backup_source`: a Frappe Cloud site backup or a sha256-verified backup in object storage; empty means a fresh site.
- `hooks`: ordered `{name, version, args}`. End every template with `core.scheduler_resume` and `core.maintenance_off`, or the site stays at 503.
- `is_public`: must be ticked for any template a public Plan uses.
- `site_admin`: tick it if your hooks need administrator access to the new site.
- `health_checks`: `{name, path, expect}` requested over HTTPS after provisioning.

## 2. The Recipe class (code, optional)

Registered through the Python entry-point group `saas_core.recipes`. The class has:

- `slug`
- `template_defaults()`
- `hooks()` returning a dict of `name@version` to callable
- `tenant_config(tenant, plan, fields)` returning a dict for the new site's config
- `signup_schema()` returning a dict of extra signup fields

Name the Template's `recipe` field after the recipe `slug`. Lookup is `saas_core.recipes.registry.get(slug)`.

> [!WARNING]
> There is no skeleton or `pyproject.toml` example upstream yet, and installing a recipe package into the bench environment is **untested** here. Read the contract in [saas_core ARCHITECTURE.md](https://github.com/tridz-open/saas_core/blob/main/ARCHITECTURE.md) and adapt.

---

**Use at your own risk.** Frappe SaaS is early alpha software, provided "as is" without warranty of any kind. We are not accepting pull requests or outside contributions. If you find a problem, please [file an issue on saas_core](https://github.com/tridz-open/saas_core/issues), or [on the docs repo](https://github.com/tridz-open/frappe-saaskit/issues) for mistakes in these pages.
