import frappe

def execute():
    # Allow the patch to run regardless of the 'use_new_system' setting.
    
    # 1. Ensure Audit Stages exist
    stages = ["BM", "DH", "COM", "RM", "ROM", "ZM", "ZOM", "GM", "HR", "COO", "CEO"]
    for s in stages:
        if not frappe.db.exists("Audit Stage", s):
            try:
                frappe.get_doc({
                    "doctype": "Audit Stage",
                    "name": s,
                    "stage_name": s
                }).insert(ignore_permissions=True)
            except Exception:
                pass

    # 2. Migrate Audit Level
    al_mapping = [
        {"prefix": "stage_1_bm", "stage": "1", "label": "BM"},
        {"prefix": "stage_2_dh", "stage": "2", "label": "DH"},
        {"prefix": "stage_2_com", "stage": "2", "label": "COM"},
        {"prefix": "stage_3_rm", "stage": "3", "label": "RM"},
        {"prefix": "stage_3_rom", "stage": "3", "label": "ROM"},
        {"prefix": "stage_4_zm", "stage": "4", "label": "ZM"},
        {"prefix": "stage_4_zom", "stage": "4", "label": "ZOM"},
        {"prefix": "stage_5_gm", "stage": "5", "label": "GM"},
        {"prefix": "stage_6_hr", "stage": "6", "label": "HR"},
        {"prefix": "stage_7_coo", "stage": "7", "label": "COO"},
        {"prefix": "stage_8_ceo", "stage": "8", "label": "CEO"}
    ]

    for al in frappe.get_all("Audit Level"):
        doc = frappe.get_doc("Audit Level", al.name)
        if doc.get("audit_stages"):
            continue
            
        has_data = False
        for m in al_mapping:
            emp_id = doc.get(f"{m['prefix']}_emp_id")
            if emp_id and frappe.db.exists("Employee", emp_id):
                doc.append("audit_stages", {
                    "stage": m["stage"],
                    "stage_name": m["label"],
                    "employee": emp_id,
                    "user_id": doc.get(f"{m['prefix']}_user_id"),
                    "employee_name": doc.get(f"{m['prefix']}_name"),
                    "email": doc.get(f"{m['prefix']}_mail"),
                    "status": "Pending"
                })
                has_data = True
        
        if has_data:
            doc.save(ignore_permissions=True)

    # 3. Migrate My Audits
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

    for ma in frappe.get_all("My Audits"):
        doc = frappe.get_doc("My Audits", ma.name)
        if doc.get("audit_stages"):
            continue
            
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
            try:
                # Bypass link validation if Branch is missing
                if doc.get("emp_branch") and not frappe.db.exists("Branch", doc.emp_branch):
                    frappe.logger().error(f"Migration: Branch {doc.emp_branch} not found for {doc.name}. Clearing to bypass validation.")
                    doc.emp_branch = None
                
                doc.save(ignore_permissions=True)
            except Exception as e:
                frappe.logger().error(f"Migration: Failed to save {doc.name}: {str(e)}")
                pass

