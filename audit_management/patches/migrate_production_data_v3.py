import frappe

def execute():
    # 1. Ensure Audit Stages exist
    stages = ["BM", "DH", "COM", "RM", "ROM", "ZM", "ZOM", "GM", "HR", "COO", "CEO"]
    for s in stages:
        if not frappe.db.exists("Audit Stage", s):
            try:
                frappe.get_doc({"doctype": "Audit Stage", "name": s, "stage_name": s}).insert(ignore_permissions=True)
            except Exception: pass

    # 2. Migrate My Audits
    ma_mapping = [
        {"prefix": "bm", "stage": "1", "label": "BM"},
        {"prefix": "dh", "stage": "2", "label": "DH"},
        {"prefix": "com", "stage": "2", "label": "COM"},
        {"prefix": "rm", "stage": "3", "label": "RM"},
        {"prefix": "rom", "stage": "3", "label": "ROM"},
        {"prefix": "zm", "stage": "4", "label": "ZM"},
        {"prefix": "zom", "stage": "4", "label": "ZOM"},
        {"prefix": "gm", "stage": "5", "label": "GM"},
        {"prefix": "hr", "stage": "6", "label": "HR"},
        {"prefix": "coo", "stage": "7", "label": "COO"},
        {"prefix": "ceo", "stage": "8", "label": "CEO"}
    ]

    for ma in frappe.get_all("My Audits", pluck="name"):
        try:
            doc = frappe.get_doc("My Audits", ma)
            if doc.get("audit_stages"): continue
            
            # Ensure Branch exists if missing
            branch = doc.get("emp_branch")
            if branch and not frappe.db.exists("Branch", branch):
                frappe.get_doc({"doctype": "Branch", "branch_name": branch}).insert(ignore_permissions=True)
            
            has_data = False
            for m in ma_mapping:
                user_id = doc.get(f"{m['prefix']}_user_id")
                email = doc.get(f"{m['prefix']}_mail")
                
                emp_id = None
                if user_id:
                    emp_id = frappe.db.get_value("Employee", {"user_id": user_id}, "name")
                if not emp_id and email:
                    emp_id = frappe.db.get_value("Employee", {"company_email": email}, "name")
                    
                if emp_id:
                    doc.append("audit_stages", {
                        "stage": m["stage"],
                        "stage_name": m["label"],
                        "employee": emp_id,
                        "user_id": user_id,
                        "employee_name": doc.get(f"{m['prefix']}_name"),
                        "email": email,
                        "status": doc.get(f"{m['prefix']}_user_status") or "Pending",
                        "response": doc.get(f"{m['prefix']}_response_box"),
                        "attachment": doc.get(f"{m['prefix']}_attach_box"),
                        "pending_time": doc.get(f"{m['prefix']}_pending_time")
                    })
                    has_data = True
            
            if has_data:
                doc.save(ignore_permissions=True)
                frappe.db.commit()
        except Exception:
            frappe.db.rollback()
            frappe.log_error(frappe.get_traceback(), f"My Audits Patch Failed: {ma}")
