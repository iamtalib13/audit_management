import frappe

def ensure_branch_exists(branch_name):
    if branch_name and not frappe.db.exists("Branch", branch_name):
        frappe.get_doc({"doctype": "Branch", "branch": branch_name}).insert(ignore_permissions=True)

def execute():
    # 1. Ensure Audit Stages exist
    stages = ["BM", "DH", "COM", "RM", "ROM", "ZM", "ZOM", "GM", "HR", "COO", "CEO"]
    for s in stages:
        if not frappe.db.exists("Audit Stage", s):
            try:
                frappe.get_doc({"doctype": "Audit Stage", "name": s, "stage_name": s}).insert(ignore_permissions=True)
            except Exception: pass

    # 2. Migrate Audit Level
    for al in frappe.get_all("Audit Level", pluck="name"):
        try:
            doc = frappe.get_doc("Audit Level", al)
            if doc.get("audit_stages"): continue
            
            mapping = [
                {"stage": 1, "name": "BM",  "user": doc.stage_1_bm_user_id,  "emp": doc.stage_1_bm_emp_id, "n": doc.stage_1_bm_name},
                {"stage": 2, "name": "DH",  "user": doc.stage_2_dh_user_id,  "emp": doc.stage_2_dh_emp_id, "n": doc.stage_2_dh_name},
                {"stage": 2, "name": "COM", "user": doc.stage_2_com_user_id, "emp": doc.stage_2_com_emp_id, "n": doc.stage_2_com_name},
                {"stage": 3, "name": "RM",  "user": doc.stage_3_rm_user_id,  "emp": doc.stage_3_rm_emp_id, "n": doc.stage_3_rm_name},
                {"stage": 3, "name": "ROM", "user": doc.stage_3_rom_user_id, "emp": doc.stage_3_rom_emp_id, "n": doc.stage_3_rom_name},
                {"stage": 4, "name": "ZM",  "user": doc.stage_4_zm_user_id,  "emp": doc.stage_4_zm_emp_id, "n": doc.stage_4_zm_name},
                {"stage": 4, "name": "ZOM", "user": doc.stage_4_zom_user_id, "emp": doc.stage_4_zom_emp_id, "n": doc.stage_4_zom_name},
                {"stage": 5, "name": "GM",  "user": doc.stage_5_gm_user_id,  "emp": doc.stage_5_gm_emp_id, "n": doc.stage_5_gm_name},
                {"stage": 6, "name": "HR",  "user": doc.stage_6_hr_user_id,  "emp": doc.stage_6_hr_emp_id, "n": doc.stage_6_hr_name},
                {"stage": 8, "name": "COO", "user": doc.stage_8_coo_user_id, "emp": doc.stage_8_coo_emp_id, "n": doc.stage_8_coo_name},
                {"stage": 10,"name": "CEO", "user": doc.stage_10_ceo_user_id,"emp": doc.stage_10_ceo_emp_id, "n": doc.stage_10_ceo_name},
            ]
            for s in mapping:
                if s.get("emp"):
                    doc.append("audit_stages", {"stage": s["stage"], "stage_name": s["name"], "employee": s["emp"], "user_id": s["user"], "employee_name": s["n"], "status": "Pending"})
            doc.flags.ignore_links = True
            doc.flags.ignore_mandatory = True
            doc.save(ignore_permissions=True)
            frappe.db.commit()
        except Exception:
            frappe.db.rollback()
            frappe.log_error(frappe.get_traceback(), f"Audit Level Migration Failed: {al}")

    # 3. Migrate My Audits (using the logic that worked for you)
    ma_mapping = [
        {"prefix": "bm", "stage": 1, "label": "BM"},
        {"prefix": "dh", "stage": 2, "label": "DH"},
        {"prefix": "com", "stage": 2, "label": "COM"},
        {"prefix": "rm", "stage": 3, "label": "RM"},
        {"prefix": "rom", "stage": 3, "label": "ROM"},
        {"prefix": "zm", "stage": 4, "label": "ZM"},
        {"prefix": "zom", "stage": 4, "label": "ZOM"},
        {"prefix": "gm", "stage": 5, "label": "GM"},
        {"prefix": "hr", "stage": 6, "label": "HR"},
        {"prefix": "coo", "stage": 7, "label": "COO"},
        {"prefix": "ceo", "stage": 8, "label": "CEO"}
    ]
    for ma in frappe.get_all("My Audits", pluck="name"):
        try:
            doc = frappe.get_doc("My Audits", ma)
            if doc.get("audit_stages"): continue
            ensure_branch_exists(doc.emp_branch)
            
            has_data = False
            for m in ma_mapping:
                uid = doc.get(f"{m['prefix']}_user_id")
                eml = doc.get(f"{m['prefix']}_mail")
                emp = None
                if uid: emp = frappe.db.get_value("Employee", {"user_id": uid}, "name")
                if not emp and eml: emp = frappe.db.get_value("Employee", {"company_email": eml}, "name")
                
                if emp:
                    doc.append("audit_stages", {
                        "stage": m["stage"], "stage_name": m["label"],
                        "employee": emp, "user_id": uid,
                        "employee_name": doc.get(f"{m['prefix']}_name"),
                        "email": eml,
                        "status": doc.get(f"{m['prefix']}_user_status") or "Pending",
                        "response": doc.get(f"{m['prefix']}_response_box"),
                        "attachment": doc.get(f"{m['prefix']}_attach_box"),
                        "pending_time": doc.get(f"{m['prefix']}_pending_time")
                    })
                    has_data = True
            
            if has_data:
                doc.flags.ignore_links = True
                doc.flags.ignore_mandatory = True
                doc.save(ignore_permissions=True)
                frappe.db.commit()
        except Exception:
            frappe.db.rollback()
            frappe.log_error(frappe.get_traceback(), f"My Audits Migration Failed: {ma}")
