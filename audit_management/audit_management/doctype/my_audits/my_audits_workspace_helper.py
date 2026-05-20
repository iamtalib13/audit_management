import frappe
from audit_management.audit_management.utils import is_new_system_enabled

@frappe.whitelist()
def get_audit_counts(is_admin=None):
    counts = {}
    is_new = is_new_system_enabled()
    user = frappe.session.user
    
    filters = {}
    if is_admin == "no":
        filters["owner"] = user

    counts["total_count"] = frappe.db.count("My Audits", filters)
    counts["draft_count"] = frappe.db.count("My Audits", {**filters, "status": "Draft"})
    counts["pending_count"] = frappe.db.count("My Audits", {**filters, "status": "Pending"})
    counts["close_count"] = frappe.db.count("My Audits", {**filters, "status": "Closed"})

    if is_new:
        child_filters = ""
        params = []
        if is_admin == "no":
            child_filters = " AND parent IN (SELECT name FROM `tabMy Audits` WHERE owner=%s)"
            params.append(user)

        child_counts = frappe.db.sql(f"""
            SELECT status, COUNT(*) as count 
            FROM `tabAudit Items` 
            WHERE 1=1 {child_filters}
            GROUP BY status
        """, tuple(params), as_dict=1)

        status_map = {row.status: row.count for row in child_counts}
        
        counts["bm_pending_count"] = status_map.get("Pending", 0)
        counts["bm_response_count"] = status_map.get("Responded", 0)
        counts["bm_no_response_count"] = status_map.get("No Response", 0)
        
        for key in ["dh", "com", "rm", "rom", "zm", "zom", "gm", "hr", "coo", "ceo"]:
            counts[f"{key}_pending_count"] = 0
            counts[f"{key}_response_count"] = 0
            counts[f"{key}_no_response_count"] = 0
    else:
        static_fields = ["bm", "dh", "com", "rm", "rom", "zm", "zom", "gm", "hr", "coo", "ceo"]
        for field in static_fields:
            counts[f"{field}_pending_count"] = frappe.db.count("My Audits", {**filters, f"{field}_user_status": "Pending"})
            counts[f"{field}_response_count"] = frappe.db.count("My Audits", {**filters, f"{field}_user_status": "Responded"})
            counts[f"{field}_no_response_count"] = frappe.db.count("My Audits", {**filters, f"{field}_user_status": "No Response"})

    return counts

@frappe.whitelist(allow_guest=True)
def get_audit_level_for_user():
    user = frappe.session.user
    matches = frappe.get_all(
        'Audit Level',
        or_filters=[
            ['stage_1_bm_user_id', '=', user],
            ['stage_2_dh_user_id', '=', user],
            ['stage_2_com_user_id', '=', user],
            ['stage_3_rm_user_id', '=', user],
            ['stage_3_rom_user_id', '=', user],
            ['stage_4_zm_user_id', '=', user],
            ['stage_4_zom_user_id', '=', user],
            ['stage_5_gm_user_id', '=', user],
            ['stage_6_hr_user_id', '=', user],
            ['stage_7_coo_user_id', '=', user],
            ['stage_8_ceo_user_id', '=', user]
        ],
        fields=['name', 'stage_1_bm_user_id', 'stage_2_dh_user_id', 'stage_2_com_user_id',
            'stage_3_rm_user_id', 'stage_3_rom_user_id', 'stage_4_zm_user_id',
            'stage_4_zom_user_id', 'stage_5_gm_user_id', 'stage_6_hr_user_id','stage_7_coo_user_id',
            'stage_8_ceo_user_id']
    )

    if matches:
        results = []
        stages = {
            'stage_1_bm_user_id': "bm_user_status",
            'stage_2_dh_user_id': "dh_user_status",
            'stage_2_com_user_id': "com_user_status",
            'stage_3_rm_user_id': "rm_user_status",
            'stage_3_rom_user_id': "rom_user_status",
            'stage_4_zm_user_id': "zm_user_status",
            'stage_4_zom_user_id': "zom_user_status",
            'stage_5_gm_user_id': "gm_user_status",
            'stage_6_hr_user_id': "hr_user_status",
            'stage_7_coo_user_id': "coo_user_status", 
            'stage_8_ceo_user_id': "ceo_user_status"
        }

        for audit_level in matches:
            for stage_field, status_field in stages.items():
                if audit_level.get(stage_field) == user:
                    results.append({"name": audit_level['name'], "user_stage": status_field})
        return {"flag": "LevelUser", "matches": results}

    user_roles = frappe.get_roles(user)
    audit_roles = {"Audit Manager", "Audit Member", "System Manager", "Administrator"}

    if audit_roles.intersection(user_roles):
        return {"flag": "AuditUser"}

    return {"flag": "OtherUser"}
