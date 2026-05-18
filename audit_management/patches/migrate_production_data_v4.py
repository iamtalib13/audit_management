import frappe

def get_employee_from_mapping(uid=None, email=None, employee_name=None):
    emp = None

    # Priority 1 → user_id
    if uid:
        emp = frappe.db.get_value(
            "Employee",
            {"user_id": uid.strip()},
            "name"
        )

    # Priority 2 → company_email
    if not emp and email:
        emp = frappe.db.get_value(
            "Employee",
            {"company_email": email.strip().lower()},
            "name"
        )

    # Priority 3 → employee_name
    if not emp and employee_name:
        emp = frappe.db.get_value(
            "Employee",
            {"employee_name": employee_name.strip()},
            "name"
        )

    return emp

def get_division_from_user(user):
    """Helper to fetch division from Employee record linked to user."""
    if not user:
        return None
    
    emp = frappe.db.get_value(
        "Employee", 
        {"user_id": user}, 
        ["custom_division", "department"], 
        as_dict=True
    )
    
    if emp:
        return emp.custom_division or emp.department
    return None

def execute():
    """
    PRODUCTION-GRADE MIGRATION PATCH (V4)
    Focus: My Audits records migration with robust error handling and summaries.
    """
    print("\n================ PATCH V4 STARTED (My Audits) ================\n")

    summary = {
        "total": 0,
        "success": 0,
        "failed": 0,
        "division_updated": 0,
        "stages_populated": 0
    }

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
        {"prefix": "chro", "stage": 7, "label": "CHRO"},
        {"prefix": "coo", "stage": 8, "label": "COO"},
        {"prefix": "cfo", "stage": 9, "label": "CFO"},
        {"prefix": "ceo", "stage": 10, "label": "CEO"}
    ]

    all_records = frappe.get_all("My Audits", pluck="name")
    summary["total"] = len(all_records)
    processed = 0

    for ma_name in all_records:
        processed += 1
        try:
            doc = frappe.get_doc("My Audits", ma_name)
            
            if doc.docstatus == 2:
                summary["success"] += 1
                continue

            print(f"Processing My Audit: {ma_name}")
            updated = False

            # 1. Set emp_division from Owner if missing
            if not doc.emp_division:
                div = get_division_from_user(doc.owner)
                if div:
                    doc.emp_division = div
                    updated = True
                    summary["division_updated"] += 1
                    print(f"  [SET] Division: {div}")

            # 2. Populate audit_stages child table (Stage-wise check)
            existing_stages = [d.stage_name for d in doc.audit_stages]
            stages_added = 0

            # Pre-fetch Audit Level stages for fallback
            al_doc = None
            if doc.emp_branch:
                branch_name = (doc.emp_branch or "").strip()
                
                # First try direct name lookup
                if frappe.db.exists("Audit Level", branch_name):
                    al_doc = frappe.get_doc("Audit Level", branch_name)
                else:
                    # Try finding by Sahayog Branch mapping (populated in V3)
                    al_name = frappe.db.get_value("Audit Level", {"sahayog_branch": branch_name}, "name")
                    if al_name:
                        al_doc = frappe.get_doc("Audit Level", al_name)
            
            if not al_doc and doc.emp_branch:
                print(f"  [WARNING] Audit Level not found for branch: {doc.emp_branch}")
                frappe.log_error(
                    title="Audit Level Lookup Failed during My Audits Migration",
                    message=f"My Audit: {doc.name}\nBranch: {doc.emp_branch}"
                )

            al_stages = {}
            if al_doc:
                for s in al_doc.audit_stages:
                    al_stages[s.stage_name] = s

            for m in ma_mapping:
                if m["label"] in existing_stages:
                    continue

                prefix = m['prefix']
                uid = doc.get(f"{prefix}_user_id")
                email = doc.get(f"{prefix}_mail")
                emp_name = doc.get(f"{prefix}_name")
                
                # Robust employee resolution
                emp = get_employee_from_mapping(uid, email, emp_name)
                
                # Fallback to Audit Level if no specific user in transaction
                if not emp:
                    al_row = al_stages.get(m['label'])
                    if al_row:
                        emp = al_row.employee
                        uid = al_row.user_id
                        emp_name = al_row.employee_name
                        email = al_row.email
                
                if emp:
                    doc.append("audit_stages", {
                        "stage": m["stage"],
                        "stage_name": m["label"],
                        "user_id": uid,
                        "employee": emp,
                        "employee_name": emp_name,
                        "email": email,
                        "status": doc.get(f"{prefix}_user_status") or "Pending",
                        "response": doc.get(f"{prefix}_response_box"),
                        "attachment": doc.get(f"{prefix}_attach_box"),
                        "pending_time": doc.get(f"{prefix}_pending_time")
                    })
                    stages_added += 1
                    updated = True
            
            if stages_added > 0:
                summary["stages_populated"] += 1

            if updated:
                doc.flags.ignore_validate = True
                doc.flags.ignore_mandatory = True
                doc.flags.ignore_links = True
                doc.flags.ignore_version = True  # Added ignore_version
                doc.save(ignore_permissions=True)
                
                if processed % 50 == 0:
                    frappe.db.commit()

            summary["success"] += 1

        except Exception as e:
            frappe.db.rollback()
            summary["failed"] += 1
            print(f"  [FAILED] {ma_name}: {str(e)}")
            frappe.log_error(title=f"My Audits Migration Failed - {ma_name}")

    frappe.db.commit()
    print("\n================ MIGRATION SUMMARY (V4) ================")
    for key, val in summary.items(): print(f"{key.replace('_', ' ').title()}: {val}")
    print("========================================================\n")
