# Copyright (c) 2024, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from audit_management.audit_management.utils import is_new_system_enabled

class AuditLevel(Document):
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
