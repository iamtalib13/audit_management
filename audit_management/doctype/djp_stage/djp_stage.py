import frappe
from frappe import _


def get_djp_stages_for_branch(branch):
    """Get DJP stages for a branch from settings"""
    settings = frappe.get_single("Audit Management Settings")
    stages = []
    
    for row in settings.get("djp_stages", []):
        if row.is_active and (not row.branch or row.branch == branch):
            stages.append({
                "stage": row.stage,
                "stage_name": row.stage_name,
                "dc_level": row.dc_level,
                "employee": row.employee,
                "user_id": row.user_id,
                "employee_name": row.employee_name,
                "email": row.email,
                "tat_days": row.tat_days
            })
    
    return stages