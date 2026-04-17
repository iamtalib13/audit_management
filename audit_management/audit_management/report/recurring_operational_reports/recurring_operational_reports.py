# Copyright (c) 2026, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe import _

def execute(filters=None):
    if not filters: filters = {}
    report_type = filters.get("report_type")
    
    if report_type == "Collateral Report":
        return get_collateral_columns(), get_collateral_data(filters)
    elif report_type == "Interest GL Monitoring":
        return get_interest_gl_columns(), get_interest_gl_data(filters)
    else: # Final Closure Report
        return get_closure_columns(), get_closure_data(filters)

def get_collateral_columns():
    return [
        {"label": _("Query ID"), "fieldname": "name", "fieldtype": "Link", "options": "My Audits", "width": 150},
        {"label": _("Branch"), "fieldname": "emp_branch", "fieldtype": "Data", "width": 150},
        {"label": _("Collateral Details"), "fieldname": "audit_query_box", "fieldtype": "Small Text", "width": 300},
        {"label": _("Status"), "fieldname": "status", "fieldtype": "Data", "width": 100}
    ]

def get_collateral_data(filters):
    return frappe.get_all("My Audits", 
        filters={"primary_nature": ["like", "%Collateral%"]},
        fields=["name", "emp_branch", "audit_query_box", "status"]
    )

def get_interest_gl_columns():
    return [
        {"label": _("Query ID"), "fieldname": "name", "fieldtype": "Link", "options": "My Audits", "width": 150},
        {"label": _("GL Details"), "fieldname": "audit_query_box", "fieldtype": "Small Text", "width": 300},
        {"label": _("Deviation"), "fieldname": "root_cause_analysis", "fieldtype": "Small Text", "width": 200},
        {"label": _("Status"), "fieldname": "status", "fieldtype": "Data", "width": 100}
    ]

def get_interest_gl_data(filters):
    return frappe.get_all("My Audits", 
        filters={"primary_nature": ["like", "%Interest GL%"]},
        fields=["name", "audit_query_box", "root_cause_analysis", "status"]
    )

def get_closure_columns():
    return [
        {"label": _("Query ID"), "fieldname": "name", "fieldtype": "Link", "options": "My Audits", "width": 150},
        {"label": _("Aging"), "fieldname": "aging", "fieldtype": "Int", "width": 100},
        {"label": _("Status"), "fieldname": "status", "fieldtype": "Data", "width": 100},
        {"label": _("Closure Date"), "fieldname": "modified", "fieldtype": "Date", "width": 100}
    ]

def get_closure_data(filters):
    return frappe.get_all("My Audits", 
        fields=["name", "aging", "status", "modified"]
    )
