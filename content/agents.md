---
description: "Copy-paste prompt for a coding agent to set up Frappe SaaS locally in demo mode, plus how to point agents at these docs."
---
# Agents

## Point an agent at these docs

- Give it <https://frappesaas.tridz.in/llms.txt>.
- Every page is also raw Markdown: add `.md` to the page name, for example <https://frappesaas.tridz.in/architecture.md>.
- For SDK questions tell it to read `saas_core/sdk` and its releases, never the archived SDK repo.

## Setup prompt

Give everything below to a coding agent (Claude Code, Cursor, Codex, etc.). Steps marked [TESTED] were run during an audit; [UNTESTED] were not and may need adjusting.

````text
You are setting up a local, demo-mode stack of the Frappe SaaS Kit. It is alpha software. Work in a new empty directory called `saas-kit-demo`. Do not touch any other project on this machine.

## Safety rules (hard)
1. Never use live payment keys. Only Razorpay TEST keys (`rzp_test_*`) are allowed. If a key does not start with `rzp_test_`, stop.
2. Never run `fcctl` against a real Frappe Cloud account in this task. Do not run `fcctl auth login`, `fcctl init` with a real profile, any `fcctl site drop/rename`, `backup restore`, `app remove`, `task cancel`, or anything destructive or that writes to a real team. Use only the fake: `saas_core_fake_fcctl=1`. Read-only local commands (`fcctl --version`, `fcctl doctor`) are fine.
3. Never write secrets into git-tracked files or paste them into chat. Put them only in the site's `site_config` or an untracked `.env.local`.
4. Do not push, open PRs, or change the cloned repos' source. Read-only clones at the pinned tags.
5. Do not run `bench drop-site`, `bench reinstall`, or touch any existing bench or site; create a brand-new bench in `saas-kit-demo/bench`.
6. Stop and ask the user before: installing system packages (MariaDB, Redis, Node, Python), downloading anything not listed here, or opening any public tunnel.

## Pinned versions (tested together)
| Repo | URL | Tag |
|---|---|---|
| saas_core (includes the SDK in `sdk/`) | https://github.com/tridz-open/saas_core | v0.1.0-alpha.3 (released) |
| fcctl | https://github.com/tridz-open/fcctl | v0.1.0-alpha.4 |
| frappe-saaskit-starter | https://github.com/tridz-open/frappe-saaskit-starter | v0.1.0-alpha.2 (a newer tag matching saas_core alpha.3 may follow) |

The SDK is no longer a separate repo (`frappe-saaskit-sdk` is archived). It lives in `saas_core/sdk`; its packages (0.1.0-alpha.4) are tarballs attached to the saas_core v0.1.0-alpha.3 release (released; URL pattern `https://github.com/tridz-open/saas_core/releases/download/v0.1.0-alpha.3/frappe-saaskit-client-0.1.0-alpha.4.tgz`, same for `-react-` and `-mock-`). Check with `gh release view v0.1.0-alpha.3 -R tridz-open/saas_core` first (https://github.com/tridz-open/saas_core/releases/tag/v0.1.0-alpha.3).

## Ask the user for input at these points (and nowhere else)
- Before step 3: confirm MariaDB/Redis/Node 20.19+ or 22.12+/Python 3.11+ are installed, and get the MariaDB root password if needed.
- Step 6: whether to do the payment step now. If yes, ask the user for their Razorpay TEST key id, secret and webhook secret (they must paste them to you or set them in site_config themselves). If no, skip step 6; checkout will not complete.
- Step 7: if you need a tunnel for the webhook, ask for permission before starting it.
- Any time a command fails twice.

## Steps

### 1. Clone (read-only, pinned) [UNTESTED as a script, clones were tested]
```bash
mkdir saas-kit-demo && cd saas-kit-demo
git clone --branch v0.1.0-alpha.3 --depth 1 https://github.com/tridz-open/saas_core.git
git clone --branch v0.1.0-alpha.4 --depth 1 https://github.com/tridz-open/fcctl.git
git clone --branch v0.1.0-alpha.2 --depth 1 https://github.com/tridz-open/frappe-saaskit-starter.git
```
Checkpoint 1: `git -C <each repo> describe --tags` prints the tag in the table.

### 2. fcctl (library only) [TESTED]
```bash
python3 -m venv .venv-fcctl && . .venv-fcctl/bin/activate
pip install "git+https://github.com/tridz-open/fcctl@v0.1.0-alpha.4"
fcctl --version
python -c "from fcctl.testing import FakeFrappeCloud; print('fake ok')"
deactivate
```
Checkpoint 2: `fcctl --version` prints `fcctl 0.1.0a4` and the import prints `fake ok`. Do not run `fcctl init` or `fcctl auth login`.

### 3. Frappe v16 bench with saas_core [UNTESTED]
Ask the user the confirmation described above. Then:
```bash
bench init --frappe-branch version-16 --skip-redis-config-generation bench   # adjust flags to the user's setup
cd bench
bench new-site saas.localhost --admin-password <ask user or generate and tell them> --db-root-password <from user>
bench get-app https://github.com/tridz-open/saas_core --branch v0.1.0-alpha.3
bench --site saas.localhost install-app saas_core
bench --site saas.localhost migrate
```
`bench get-app` pulls fcctl v0.1.0-alpha.4 automatically (pinned in saas_core's pyproject). The exact bench init flags are not documented in saas_core; if they fail, adapt to the user's environment and note it.
Checkpoint 3: `bench --site saas.localhost list-apps` shows `saas_core`; roles `SaaS Admin`, `SaaS Customer`, `SaaS Platform Worker` exist; `bench --site saas.localhost console` can `import fcctl`.

### 4. Demo mode config (no real Frappe Cloud) [UNTESTED]
```bash
bench --site saas.localhost set-config saas_core_fake_fcctl 1
bench --site saas.localhost set-config saas_core_signup_mode open
bench --site saas.localhost set-config saas_core_site_domain localhost
```
Do NOT set `saas_core_local_bench`, `saas_core_fc_team`, `saas_core_fc_server` or `saas_core_session_key`.
Checkpoint 4: `bench --site saas.localhost start` (in another terminal, or `bench start`) and `curl -s http://saas.localhost:8000/api/method/ping` returns `{"message":"pong"}`; `curl -s http://saas.localhost:8000/api/method/saas_core.api.v1.config` returns JSON.

### 5. Plan and public template [UNTESTED, undocumented in saas_core]
Create (desk at http://saas.localhost:8000/app, or `bench console`) one Template (`slug=starter`, `is_public=1`, hooks ending with `core.scheduler_resume` then `core.maintenance_off`) and one Plan that references it. Field reference: `saas_core/docs/TEMPLATES.md`. Do not use `sync_plans` unless Razorpay keys are set (it pushes plans to Razorpay). If a required field is unclear, read the Plan DocType JSON in `saas_core/saas_core/saas_core/doctype/plan/` and ask the user rather than guessing.
Checkpoint 5: `curl -s "http://saas.localhost:8000/api/method/saas_core.api.v1.plans.list?currency=INR&interval=month"` lists the plan.

### 6. Payment test mode (optional, needs user input) [UNTESTED]
Ask the user for Razorpay TEST keys (must start `rzp_test_`). Then:
```bash
bench --site saas.localhost set-config saas_core_razorpay_key_id rzp_test_xxx
bench --site saas.localhost set-config saas_core_razorpay_key_secret <secret>
bench --site saas.localhost set-config saas_core_razorpay_webhook_secret <secret>
bench --site saas.localhost execute saas_core.gateways.bootstrap.from_site_config
bench --site saas.localhost set-config saas_core_razorpay_key_secret ""
bench --site saas.localhost set-config saas_core_razorpay_webhook_secret ""
```
Checkpoint 6: a Gateway Account exists with `gateway=razorpay`, `mode=test`, `enabled=1`, `checkout_mode=order`. If a key does not start with `rzp_test_`, abort and tell the user.

### 7. Webhook (optional) [UNTESTED]
Razorpay posts to `https://<public-url>/api/method/saas_core.webhooks.razorpay`. Local sites need a tunnel; ask the user before starting one. Without it checkout can start but payment confirmation by webhook will not arrive.

### 8. Starter, fixture mode first [TESTED]
```bash
cd ../frappe-saaskit-starter
npm ci
npx vite --port 5173   # or npm run dev
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/
npm run build
```
Checkpoint 8: HTTP 200 and the build succeeds. Stop the dev server after the check (`pkill -f vite`).

### 9. Starter in live mode against the bench [UNTESTED at runtime; build TESTED]
The starter at v0.1.0-alpha.2 vendors the old SDK alpha.3 tarballs (`vendor/saaskit/`), so it works with no SDK install. saas_core v0.1.0-alpha.3 is released; a newer starter tag should reference the saas_core release tarballs; do not edit package.json yourself, ask the user.
```bash
cp .env.example .env.local     # sets VITE_DATA_ADAPTER=saaskit
# ensure .env.local contains:
#   VITE_DATA_ADAPTER=saaskit
#   SAAS_BACKEND_URL=http://saas.localhost:8000
VITE_DATA_ADAPTER=saaskit npm run build     # TESTED: succeeds
npm run dev
```
Checkpoint 9: open http://localhost:5173, the pricing page shows the plan from step 5 (not the fixture plans), signup creates a user, and the browser network tab shows calls to `/api/method/saas_core.api.v1.*` (proxied). With step 6 done, checkout opens Razorpay test Checkout; pay with Razorpay's test card/UPI from their docs. Then provisioning progress should reach "active" via the fake backend (no real site is created; the tenant URL is a fake).

### 10. Report to the user
Print: the tags checked out, which checkpoints passed, which steps were skipped (6, 7?), where the sites run, and any step where you had to guess. Remind them: no real Frappe Cloud was contacted, only test-mode keys were used, and any keys placed in `site_config` should be rotated before sharing the machine.

SDK-related questions: look in `saas_core/sdk` and its releases, never the archived frappe-saaskit-sdk repo.
````


---

**Use at your own risk.** Frappe SaaS is early alpha software, provided "as is" without warranty of any kind. We are not accepting pull requests or outside contributions. If you find a problem, please [file an issue on saas_core](https://github.com/tridz-open/saas_core/issues), or [on the docs repo](https://github.com/tridz-open/frappe-saaskit/issues) for mistakes in these pages.
