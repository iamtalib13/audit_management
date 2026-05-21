import frappe
import json
from frappe import _

@frappe.whitelist()
def get_dashboard_stats(pending_start=0, recent_start=0, status=None, risk=None):
    user = frappe.session.user
    roles = frappe.get_roles(user)
    
    pending_start = int(pending_start)
    recent_start = int(recent_start)
    page_length = 10

    # Role flags
    is_admin = "Administrator" in roles or "System Manager" in roles
    is_manager = "Audit Manager" in roles
    is_member = "Audit Member" in roles

    # Handle multiple statuses
    status_list = []
    if status:
        if isinstance(status, str): status_list = [s.strip() for s in status.split(',') if s.strip()]
        elif isinstance(status, list): status_list = status

    # Handle multiple risks
    risk_list = []
    if risk:
        if isinstance(risk, str): risk_list = [r.strip() for r in risk.split(',') if r.strip()]
        elif isinstance(risk, list): risk_list = risk

    try:
        # 1. 🟢 FETCH PENDING FOR ME (From Child Table)
        pending_items_query = """
            SELECT DISTINCT parent
            FROM `tabAudit Items`
            WHERE status = 'Pending'
            AND (user_id = %s OR email = %s)
        """
        responded_items_query = """
            SELECT DISTINCT parent
            FROM `tabAudit Items`
            WHERE status = 'Responded'
            AND (user_id = %s OR email = %s)
        """

        pending_records = frappe.db.sql(pending_items_query, (user, user), as_dict=True)
        responded_records = frappe.db.sql(responded_items_query, (user, user), as_dict=True)

        pending_for_me_count = len(pending_records)
        responded_by_me_count = len(responded_records)

        pending_for_me_list = []
        has_more_pending = False
        
        # Use responded records if status contains 'Responded', otherwise use pending
        active_records = pending_records
        if 'Responded' in status_list:
            active_records = responded_records

        if active_records:
            parent_names = [r.parent for r in active_records]
            
            # Apply filters
            p_filters = {"name": ["in", parent_names]}
            
            if status_list:
                actual_statuses = [s for s in status_list if s != 'Responded']
                if actual_statuses:
                    p_filters["status"] = ["in", actual_statuses]
            
            if risk_list:
                if "Normal" in risk_list:
                    p_filters["risk"] = ["in", risk_list + [None, ""]]
                else:
                    p_filters["risk"] = ["in", risk_list]

            pending_for_me_list = frappe.get_all(
                "My Audits",
                filters=p_filters,
                fields=["name", "audit_query_subject_box", "risk", "status", "emp_branch", "emp_division", "aging", "creation"],
                limit_start=pending_start,
                limit_page_length=page_length + 1
            )
            
            if len(pending_for_me_list) > page_length:
                has_more_pending = True
                pending_for_me_list = pending_for_me_list[:page_length]

            # Add Sr. No.
            for idx, item in enumerate(pending_for_me_list, start=pending_start + 1):
                item["sr_no"] = idx

        # 2. 🔵 FETCH GLOBAL/ROLE STATS
        from audit_management.audit_management.utils import get_user_allowed_divisions
        allowed_divisions = get_user_allowed_divisions(user)
        
        filters = {}
        if is_admin:
            pass
        elif is_manager:
            if allowed_divisions:
                filters["emp_division"] = ["in", allowed_divisions]
            else:
                filters["emp_division"] = "None"
        elif is_member:
            filters["owner"] = user
        else:
            if allowed_divisions:
                filters["emp_division"] = ["in", allowed_divisions]
            else:
                filters["emp_division"] = "None"

        total_pending = frappe.db.count("My Audits", {**filters, "status": "Pending"})
        high_risk = frappe.db.count("My Audits", {**filters, "risk": "High"})
        closed_count = frappe.db.count("My Audits", {**filters, "status": "Closed"})
        draft_count = frappe.db.count("My Audits", {**filters, "status": "Draft"})

        recent_list = []
        has_more_recent = False
        if is_admin or is_manager or is_member:
            r_filters = filters.copy()
            if status_list:
                r_filters["status"] = ["in", status_list]
            if risk_list:
                if "Normal" in risk_list:
                    r_filters["risk"] = ["in", risk_list + [None, ""]]
                else:
                    r_filters["risk"] = ["in", risk_list]

            recent_list = frappe.get_all(
                "My Audits",
                filters=r_filters,
                fields=["name", "audit_query_subject_box", "risk", "status", "emp_branch", "emp_division", "aging", "creation"],
                order_by="creation desc",
                limit_start=recent_start,
                limit_page_length=page_length + 1
            )
            
            if len(recent_list) > page_length:
                has_more_recent = True
                recent_list = recent_list[:page_length]

            # Add Sr. No.
            for idx, item in enumerate(recent_list, start=recent_start + 1):
                item["sr_no"] = idx

        # 3. 🟣 ENHANCE BRANCH COLUMN
        all_lists = pending_for_me_list + recent_list
        if all_lists:
            audit_levels = list(set([i.emp_branch for i in all_lists if i.emp_branch]))
            if audit_levels:
                level_data = frappe.get_all("Audit Level", filters={"name": ["in", audit_levels]}, fields=["name", "emp_branch as sahayog_branch"])
                level_map = {d.name: d.sahayog_branch for d in level_data}
                
                sahayog_branches = list(set([d.sahayog_branch for d in level_data if d.sahayog_branch]))
                if sahayog_branches:
                    branch_data = frappe.get_all("Sahayog Branch", filters={"name": ["in", sahayog_branches]}, fields=["name", "branch", "sol_id"])
                    branch_details_map = {d.name: {"name": d.branch, "sol": d.sol_id} for d in branch_data}
                    
                    for item in all_lists:
                        s_branch_key = level_map.get(item.emp_branch)
                        if s_branch_key:
                            details = branch_details_map.get(s_branch_key)
                            if details:
                                b_name = details.get("name")
                                b_sol = details.get("sol")
                                item.emp_branch = f"{b_name} ({b_sol})" if b_name and b_sol else (b_name or b_sol or s_branch_key)

        return {
            "role_type": "manager" if (is_manager or is_admin) else ("member" if is_member else "stage_user"),
            "pending_for_me": pending_for_me_count,
            "responded_by_me": responded_by_me_count,
            "total_pending": total_pending,
            "closed_count": closed_count,
            "draft_count": draft_count,
            "pending_list": pending_for_me_list,
            "recent_list": recent_list,
            "has_more_pending": has_more_pending,
            "has_more_recent": has_more_recent,
            "success": True
        }

    except Exception:
        frappe.log_error(frappe.get_traceback(), "Dashboard Stats Error")
        return {"success": False}

@frappe.whitelist()
def get_my_responded_records():
    user = frappe.session.user
    records = frappe.db.sql("SELECT DISTINCT parent FROM `tabAudit Items` WHERE status = 'Responded' AND (user_id = %s OR email = %s)", (user, user), as_dict=True)
    return [r.parent for r in records]

@frappe.whitelist()
def get_my_pending_records():
    user = frappe.session.user
    records = frappe.db.sql("SELECT DISTINCT parent FROM `tabAudit Items` WHERE status = 'Pending' AND (user_id = %s OR email = %s)", (user, user), as_dict=True)
    return [r.parent for r in records]

def update_custom_block():
    # Helper to force update the Custom HTML Block from code
    doc = frappe.get_doc("Custom HTML Block", "Audit Management")
    # This function will be called manually or via patch if needed
    pass
