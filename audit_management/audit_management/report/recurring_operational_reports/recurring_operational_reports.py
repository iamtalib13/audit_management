# Copyright (c) 2026, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from audit_management.audit_management.doctype.my_audits.my_audits import get_user_allowed_sol_ids

def execute(filters=None):
    if not filters: filters = {}
    report_type = filters.get("report_type")
    
    if report_type == "Collateral Report":
        return get_collateral_columns(), get_collateral_data(filters)
    elif report_type == "Interest GL Monitoring":
        return get_interest_gl_columns(), get_interest_gl_data(filters)
    else: # Final Closure Report
        return get_closure_columns(), get_closure_data(filters)

def get_perm_filters():
    user = frappe.session.user
    roles = frappe.get_roles(user)
    is_audit_manager = "Audit Manager" in roles or "Administrator" in roles or "System Manager" in roles
    
    if is_audit_manager:
        return {}
    
    allowed_sol_ids = get_user_allowed_sol_ids(user)
    if allowed_sol_ids:
        sol_list = [str(s) for s in allowed_sol_ids]
        allowed_branches = frappe.get_all("Audit Level", 
            filters={"sahayog_branch": ["in", sol_list]}, pluck="name")
        return {"emp_branch": ["in", allowed_branches]}
    
    return {"owner": user}

def get_collateral_columns():
    return [
        {"label": _("Query ID"), "fieldname": "name", "fieldtype": "Link", "options": "My Audits", "width": 150},
        {"label": _("Closure Date"), "fieldname": "closing_date", "fieldtype": "Date", "width": 100},
        {"label": _("Branch"), "fieldname": "emp_branch", "fieldtype": "Data", "width": 150},
        {"label": _("Collateral Details"), "fieldname": "audit_query_box", "fieldtype": "Small Text", "width": 300},
        {"label": _("Status"), "fieldname": "status", "fieldtype": "Data", "width": 100}
    ]

def get_collateral_data(filters):
    query_filters = get_perm_filters()
    query_filters.update({"primary_nature": ["like", "%Collateral%"]})
    return frappe.get_all("My Audits", 
        filters=query_filters,
        fields=["name", "closing_date", "emp_branch", "audit_query_box", "status"]
    )

def get_interest_gl_columns():
    return [
        {"label": _("Query ID"), "fieldname": "name", "fieldtype": "Link", "options": "My Audits", "width": 150},
        {"label": _("Closure Date"), "fieldname": "closing_date", "fieldtype": "Date", "width": 100},
        {"label": _("GL Details"), "fieldname": "audit_query_box", "fieldtype": "Small Text", "width": 300},
        {"label": _("Deviation"), "fieldname": "root_cause_analysis", "fieldtype": "Small Text", "width": 200},
        {"label": _("Status"), "fieldname": "status", "fieldtype": "Data", "width": 100}
    ]

def get_interest_gl_data(filters):
    query_filters = get_perm_filters()
    query_filters.update({"primary_nature": ["like", "%Interest GL%"]})
    return frappe.get_all("My Audits", 
        filters=query_filters,
        fields=["name", "closing_date", "audit_query_box", "root_cause_analysis", "status"]
    )

def get_closure_columns():
    return [
        {"label": _("Query ID"), "fieldname": "name", "fieldtype": "Link", "options": "My Audits", "width": 150},
        {"label": _("Aging"), "fieldname": "aging", "fieldtype": "Int", "width": 100},
        {"label": _("Status"), "fieldname": "status", "fieldtype": "Data", "width": 100},
        {"label": _("Closure Date"), "fieldname": "closing_date", "fieldtype": "Date", "width": 100}
    ]

def get_closure_data(filters):
    return frappe.get_all("My Audits", 
        filters=get_perm_filters(),
        fields=["name", "aging", "status", "closing_date"]
    )
