import frappe
from frappe.utils import add_days, getdate, nowdate, date_diff

def is_new_system_enabled():
	return frappe.db.get_single_value("Audit Management Settings", "use_new_system")

def get_working_days(start_date, end_date):
    """
    Calculates working days between two dates, excluding weekends.
    Frappe has built-in holiday list support, but for simplicity here we exclude Sat/Sun.
    """
    if not start_date or not end_date:
        return 0
    
    start = getdate(start_date)
    end = getdate(end_date)
    
    count = 0
    curr = start
    while curr <= end:
        if curr.weekday() < 5: # 0-4 is Mon-Fri
            count += 1
        curr = add_days(curr, 1)
    return count

def update_audit_aging(doc):
    """Calculates aging from creation date to now (or closure date)."""
    start_date = getdate(doc.creation)
    end_date = getdate(doc.modified) if doc.status == "Close" else getdate(nowdate())
    
    doc.aging = get_working_days(start_date, end_date)

def get_user_allowed_divisions(user):
    """Fetch allowed divisions for a user based on Audit Management Settings."""
    user_div = frappe.db.get_value(
        "Employee", {"user_id": user}, "custom_division"
    )

    if not user_div:
        return []

    settings = frappe.get_single("Audit Management Settings")

    if not hasattr(settings, "division_permissions") or not settings.division_permissions:
        return [user_div]

    allowed = [
        row.allowed_division
        for row in settings.division_permissions
        if row.source_division == user_div
    ]

    if user_div not in allowed:
        allowed.append(user_div)

    return allowed
