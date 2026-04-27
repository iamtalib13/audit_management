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
            self.update_employee_emails()
        else:
            self.sync_new_to_old_stages()

    def remove_blank_rows(self):
        cleaned_rows = []
        if hasattr(self, "audit_stages"):
            for row in self.audit_stages:
                if row.stage and row.stage_name and row.employee:
                    cleaned_rows.append(row)
            self.audit_stages = cleaned_rows

    def update_employee_emails(self):
        """If email is manually entered in Audit Stages, update it in Employee doctype."""
        if not hasattr(self, "audit_stages"):
            return

        for row in self.audit_stages:
            if row.employee and row.email:
                # Check if employee already has this email
                current_email = frappe.db.get_value(
                    "Employee", row.employee, "company_email")
                if not current_email and row.email:
                    # Update Employee doctype
                    frappe.db.set_value(
                        "Employee", row.employee, "company_email", row.email)
                    frappe.msgprint(
                        frappe._("Updated email for Employee {0}").format(row.employee))

    def sync_new_to_old_stages(self):
        """Syncs child table data to old hardcoded stage fields for backward compatibility."""
        if not hasattr(self, "audit_stages"):
            return

        # Mapping prefix to stage number
        mapping = {
            "1": "stage_1_bm", "2": ["stage_2_dh", "stage_2_com"], "3": ["stage_3_rm", "stage_3_rom"],
            "4": ["stage_4_zm", "stage_4_zom"], "5": "stage_5_gm", "6": "stage_6_hr",
            "7": "stage_7_chro", "8": "stage_8_coo", "9": "stage_9_cfo", "10": "stage_10_ceo"
        }

        for row in self.audit_stages:
            stage_num = str(row.stage)
            prefix_data = mapping.get(stage_num)
            if not prefix_data:
                continue

            prefixes = [prefix_data] if isinstance(
                prefix_data, str) else prefix_data

            # Find which prefix matches this stage name (e.g., DH vs COM)
            for p in prefixes:
                # If name matches or it's a single prefix stage
                if len(prefixes) == 1 or p.split("_")[-1].upper() in row.stage_name.upper():
                    self.set(f"{p}_emp_id", row.employee)
                    self.set(f"{p}_name", row.employee_name)
                    self.set(f"{p}_user_id", row.user_id)
                    self.set(f"{p}_mail", row.email)

                    # Also update employee email if manually typed in old system
                    if row.employee and row.email:
                        current_email = frappe.db.get_value(
                            "Employee", row.employee, "company_email")
                        if not current_email:
                            frappe.db.set_value(
                                "Employee", row.employee, "company_email", row.email)


@frappe.whitelist()
def fetch_employee(employee_id):
    """Fetch employee data safely using Frappe API instead of raw SQL."""
    employee = frappe.db.get_value("Employee", employee_id,
                                   ["employee_name", "user_id", "designation",
                                       "branch", "company_email"],
                                   as_dict=True
                                   )

    # Return as a list to maintain compatibility with the JS callback expectations
    return [employee] if employee else []


@frappe.whitelist()
def get_user_division(user=None):
    """Fetch division of user from Employee"""

    if not user:
        user = frappe.session.user

    # Get Employee linked to user
    employee = frappe.db.get_value(
        "Employee",
        {"user_id": user},
        ["custom_division", "department"],
        as_dict=True
    )

    if not employee:
        return None

    # Prefer custom_division, fallback to department
    return employee.custom_division or employee.department


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


def get_permission_query_conditions(user=None):
    # Returns an empty string so Frappe safely applies your standard Role Permissions for the List View
    return ""


def has_permission(doc, ptype, user=None):
    if not user:
        user = frappe.session.user

    # Always allow Administrator
    if user == "Administrator":
        return True

    roles = frappe.get_roles(user)

    # 🌟 STRICT LOGIC: Only allow "create" if the user has the correct role
    if ptype == "create":
        if "Audit Manager" in roles or "Audit Member" in roles:
            return True
        return False  # Explicitly block everyone else from creating

    # For other actions (read, write, delete), return None to let Frappe's standard Role Permissions Manager handle it
    return None
