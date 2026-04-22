# Copyright (c) 2024, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from audit_management.audit_management.utils import is_new_system_enabled

class AuditLevel(Document):
    def before_insert(self):
        if not self.division:
            self.division = get_user_division()

    def validate(self):
        if is_new_system_enabled():
            self.remove_blank_rows()

    def remove_blank_rows(self):
        cleaned_rows = []
        if hasattr(self, "audit_stages"):
            for row in self.audit_stages:
                if row.stage and row.stage_name and row.employee:
                    cleaned_rows.append(row)
            self.audit_stages = cleaned_rows

@frappe.whitelist()
def fetch_employee(employee_id):
    """Fetch employee data safely using Frappe API instead of raw SQL."""
    employee = frappe.db.get_value("Employee", employee_id, 
        ["employee_name", "user_id", "designation", "branch", "company_email"], 
        as_dict=True
    )
    
    # Return as a list to maintain compatibility with the JS callback expectations
    return [employee] if employee else []

@frappe.whitelist()
def get_user_division():
    """Fetch division of the current logged-in user from Employee doctype safely."""
    # Based on inspection, the field name is 'custom_division'
    if not frappe.db.has_column("Employee", "custom_division"):
        # If custom_division field is missing, try to get department as a fallback
        return frappe.db.get_value("Employee", {"user_id": frappe.session.user}, "department")
    
    employee = frappe.db.get_value("Employee", {"user_id": frappe.session.user}, "custom_division")
    return employee

@frappe.whitelist()
def branch_query(doctype, txt, searchfield, start, page_len, filters):
    """Query to display sol_id and branch in Link field."""
    return frappe.db.sql(f"""
        SELECT 
            name, 
            CONCAT(sol_id, '-', branch) as description
        FROM 
            `tabSahayog Branch`
        WHERE 
            (name LIKE %(txt)s OR sol_id LIKE %(txt)s OR branch LIKE %(txt)s)
        ORDER BY 
            name ASC
        LIMIT 
            %(start)s, %(page_len)s
    """, {
        "txt": f"%{txt}%",
        "start": start,
        "page_len": page_len
    })
