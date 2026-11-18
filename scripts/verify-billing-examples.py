"""Recompute the docs' billing worked examples with saas_core's real formulas.
Usage: python3 scripts/verify-billing-examples.py /path/to/saas_core
"""
import importlib.util, sys, datetime as dt
root = sys.argv[1] if len(sys.argv) > 1 else "../saas_core"
spec = importlib.util.spec_from_file_location("proration", f"{root}/saas_core/billing/proration.py")
m = importlib.util.module_from_spec(spec); sys.modules["proration"] = m; spec.loader.exec_module(m)
UTC, IST = dt.timezone.utc, m.IST
start, end = dt.datetime(2026, 3, 1, tzinfo=IST), dt.datetime(2026, 4, 1, tzinfo=IST)
now = dt.datetime(2026, 3, 10, 15, 0, tzinfo=IST)
c = m.cancel_quote(299900, start, end, now)
print("cancel", c.cycle_days, c.days_used, c.days_unused, c.refund_minor, c.charge_minor, c.stops_at.isoformat())
u = m.change_quote(99900, 299900, 99900, start, end, now)
print("upgrade", u.direction, u.effective_date, u.days_remaining, u.old_share_minor, u.new_share_minor, u.amount_due_minor)
d = m.change_quote(299900, 99900, 299900, start, end, now)
print("downgrade", d.direction, d.days_remaining, d.old_share_minor, d.new_share_minor, d.credit_minor)
last = dt.datetime(2026, 3, 31, 12, tzinfo=IST)
print("cancel last day", m.cancel_quote(299900, start, end, last).refund_minor)
l = m.change_quote(299900, 99900, 299900, start, end, last)
print("change last day", l.effective_date, l.days_remaining)
