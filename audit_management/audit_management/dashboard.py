import frappe
import json
from frappe import _

@frappe.whitelist()
def get_dashboard_stats(pending_start=0, recent_start=0, status=None, risk=None, item_stages=None, time_filter=None):
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

    # Handle item stages
    item_stage_list = []
    if item_stages:
        if isinstance(item_stages, str): item_stage_list = [s.strip() for s in item_stages.split(',') if s.strip()]
        elif isinstance(item_stages, list): item_stage_list = item_stages

    # Handle time filter
    time_filter_list = []
    if time_filter:
        if isinstance(time_filter, str): time_filter_list = [t.strip() for t in time_filter.split(',') if t.strip()]
        elif isinstance(time_filter, list): time_filter_list = time_filter

    try:
        # 🟢 FETCH PENDING FOR ME (Stage User)
        pending_items_query = "SELECT DISTINCT parent FROM `tabAudit Items` WHERE status = 'Pending' AND (user_id = %s OR email = %s)"
        responded_items_query = "SELECT DISTINCT parent FROM `tabAudit Items` WHERE status = 'Responded' AND (user_id = %s OR email = %s)"
        not_responded_items_query = "SELECT DISTINCT parent FROM `tabAudit Items` WHERE status = 'No Response' AND (user_id = %s OR email = %s)"

        pending_records = frappe.db.sql(pending_items_query, (user, user), as_dict=True)
        responded_records = frappe.db.sql(responded_items_query, (user, user), as_dict=True)
        not_responded_records = frappe.db.sql(not_responded_items_query, (user, user), as_dict=True)

        pending_for_me_count = len(pending_records)
        responded_by_me_count = len(responded_records)
        not_responded_count_me = len(not_responded_records)

        pending_for_me_list = []
        has_more_pending = False
        
        selected_parents_stage_user = []
        if 'Responded' in status_list: selected_parents_stage_user = [r.parent for r in responded_records]
        elif 'No Response' in status_list: selected_parents_stage_user = [r.parent for r in not_responded_records]
        elif 'Pending' in status_list: selected_parents_stage_user = [r.parent for r in pending_records]
        else:
            selected_parents_stage_user = list(set([r.parent for r in pending_records] + [r.parent for r in responded_records] + [r.parent for r in not_responded_records]))

        if selected_parents_stage_user:
            p_filters = {"name": ["in", selected_parents_stage_user]}
            if status_list:
                actual_statuses = [s for s in status_list if s in ['Draft', 'Pending', 'Closed']]
                if actual_statuses: p_filters["status"] = ["in", actual_statuses]
            if risk_list:
                if "Normal" in risk_list: p_filters["risk"] = ["in", risk_list + [None, ""]]
                else: p_filters["risk"] = ["in", risk_list]

            pending_for_me_list = frappe.get_all("My Audits", filters=p_filters, fields=["name", "audit_query_subject_box", "risk", "status", "emp_branch", "emp_division", "aging", "creation"], order_by="creation desc", limit_start=pending_start, limit_page_length=page_length + 1)
            if len(pending_for_me_list) > page_length:
                has_more_pending = True
                pending_for_me_list = pending_for_me_list[:page_length]
            for idx, item in enumerate(pending_for_me_list, start=pending_start + 1): item["sr_no"] = idx

        # 🔵 FETCH GLOBAL STATS
        from audit_management.audit_management.utils import get_user_allowed_divisions
        allowed_divisions = get_user_allowed_divisions(user)
        
        filters = {}
        if is_admin: pass
        elif is_manager: filters["emp_division"] = ["in", allowed_divisions] if allowed_divisions else "None"
        elif is_member: filters["owner"] = user
        else: filters["emp_division"] = ["in", allowed_divisions] if allowed_divisions else "None"

        total_pending = frappe.db.count("My Audits", {**filters, "status": "Pending"})
        closed_count = frappe.db.count("My Audits", {**filters, "status": "Closed"})
        draft_count = frappe.db.count("My Audits", {**filters, "status": "Draft"})
        
        manager_parents_responded = frappe.get_all("My Audits", filters={**filters}, fields=["name"], as_list=True)
        manager_parents_names = [p[0] for p in manager_parents_responded] if manager_parents_responded else []
        
        responded_count_manager = 0
        not_responded_count_manager = 0
        stage_counts = {}
        time_counts = {"Today": 0, "Yesterday": 0, "Last Week": 0, "All Time": 0}
        
        if manager_parents_names:
            resp_sql = "SELECT COUNT(DISTINCT parent) FROM `tabAudit Items` WHERE status = 'Responded' AND parent IN %s"
            nr_sql = "SELECT COUNT(DISTINCT parent) FROM `tabAudit Items` WHERE status = 'No Response' AND parent IN %s"
            responded_count_manager = frappe.db.sql(resp_sql, (tuple(manager_parents_names),))[0][0] or 0
            not_responded_count_manager = frappe.db.sql(nr_sql, (tuple(manager_parents_names),))[0][0] or 0

            child_status = 'Responded' if 'Responded' in status_list else ('No Response' if 'No Response' in status_list else None)
            if child_status:
                stg_sql = f"SELECT stage_name, COUNT(DISTINCT parent) as count FROM `tabAudit Items` WHERE status = %s AND parent IN %s GROUP BY stage_name"
                stg_data = frappe.db.sql(stg_sql, (child_status, tuple(manager_parents_names)), as_dict=True)
                stage_counts = {d.stage_name: d.count for d in stg_data}
                
                field = "response_time" if child_status == 'Responded' else "pending_time"
                time_counts["Today"] = frappe.db.sql(f"SELECT COUNT(DISTINCT parent) FROM `tabAudit Items` WHERE status = %s AND parent IN %s AND DATE({field}) = CURDATE()", (child_status, tuple(manager_parents_names)))[0][0] or 0
                time_counts["Yesterday"] = frappe.db.sql(f"SELECT COUNT(DISTINCT parent) FROM `tabAudit Items` WHERE status = %s AND parent IN %s AND DATE({field}) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)", (child_status, tuple(manager_parents_names)))[0][0] or 0
                time_counts["Last Week"] = frappe.db.sql(f"SELECT COUNT(DISTINCT parent) FROM `tabAudit Items` WHERE status = %s AND parent IN %s AND DATE({field}) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)", (child_status, tuple(manager_parents_names)))[0][0] or 0
                time_counts["All Time"] = (responded_count_manager if child_status == 'Responded' else not_responded_count_manager)

        recent_list = []
        has_more_recent = False
        if is_admin or is_manager or is_member:
            r_filters = filters.copy()
            # Only use child-item based filtering if status is Responded/NR OR if specific stages/times are selected
            has_child_filter = 'Responded' in status_list or 'No Response' in status_list or item_stage_list or (time_filter_list and "All Time" not in time_filter_list)

            if has_child_filter:
                child_conds = []
                params = []
                if 'Responded' in status_list: child_conds.append("status = 'Responded'")
                elif 'No Response' in status_list: child_conds.append("status = 'No Response'")
                elif 'Pending' in status_list: child_conds.append("status = 'Pending'")
                if item_stage_list:
                    child_conds.append("stage_name IN %s")
                    params.append(tuple(item_stage_list))
                if time_filter_list and "All Time" not in time_filter_list:
                    time_conds = []
                    for t in time_filter_list:
                        field = "response_time" if 'Responded' in status_list else "pending_time"
                        if t == "Today": time_conds.append(f"DATE({field}) = CURDATE()")
                        elif t == "Yesterday": time_conds.append(f"DATE({field}) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)")
                        elif t == "Last Week": time_conds.append(f"DATE({field}) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)")
                    if time_conds: child_conds.append("(" + " OR ".join(time_conds) + ")")

                if child_conds:
                    child_sql = f"SELECT DISTINCT parent FROM `tabAudit Items` WHERE {' AND '.join(child_conds)}"
                    child_records = frappe.db.sql(child_sql, tuple(params), as_dict=True)
                    child_parent_ids = [r.parent for r in child_records]
                    if child_parent_ids: r_filters["name"] = ["in", child_parent_ids]
                    else: r_filters["name"] = "None"

            if status_list and not ('Responded' in status_list or 'No Response' in status_list):

                actual_statuses = [s for s in status_list if s in ['Draft', 'Pending', 'Closed']]
                if actual_statuses: r_filters["status"] = ["in", actual_statuses]
            if risk_list:
                if "Normal" in risk_list: r_filters["risk"] = ["in", risk_list + [None, ""]]
                else: r_filters["risk"] = ["in", risk_list]

            recent_list = frappe.get_all("My Audits", filters=r_filters, fields=["name", "audit_query_subject_box", "risk", "status", "emp_branch", "emp_division", "aging", "creation"], order_by="creation desc", limit_start=recent_start, limit_page_length=page_length + 1)
            if len(recent_list) > page_length:
                has_more_recent = True
                recent_list = recent_list[:page_length]
            for idx, item in enumerate(recent_list, start=recent_start + 1): item["sr_no"] = idx

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
                                item.emp_branch = f"{details.get('name')} ({details.get('sol')})" if details.get('name') and details.get('sol') else (details.get('name') or details.get('sol') or s_branch_key)

        return {
            "role_type": "manager" if (is_manager or is_admin) else ("member" if is_member else "stage_user"),
            "pending_for_me": pending_for_me_count,
            "responded_by_me": responded_by_me_count if (is_member or is_manager or is_admin) == False else responded_count_manager,
            "not_responded_count": not_responded_count_me if (is_member or is_manager or is_admin) == False else not_responded_count_manager,
            "total_pending": total_pending,
            "closed_count": closed_count,
            "draft_count": draft_count,
            "stage_counts": stage_counts,
            "time_counts": time_counts,
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
def get_my_not_responded_records():
    user = frappe.session.user
    records = frappe.db.sql("SELECT DISTINCT parent FROM `tabAudit Items` WHERE status = 'No Response' AND (user_id = %s OR email = %s)", (user, user), as_dict=True)
    return [r.parent for r in records]

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
    doc = frappe.get_doc("Custom HTML Block", "Audit Management")
    pass
