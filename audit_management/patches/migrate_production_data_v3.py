import frappe


def execute():
    """
    PRODUCTION-GRADE MIGRATION PATCH (V3)
    Focus: Audit Level Setup with robust SOL-based branch mapping and division set.
    """
    print("\n================ PATCH V3 STARTED (Audit Level) ================\n")

    summary = {
        "total": 0,
        "success": 0,
        "failed": 0,
        "division_updated": 0,
        "branch_updated": 0,
        "stages_populated": 0
    }

    stages = [
        "BM", "DH", "COM", "RM", "ROM",
        "ZM", "ZOM", "GM", "HR", "CHRO", "COO", "CFO", "CEO"
    ]

    for s in stages:
        if not frappe.db.exists("Audit Stage", s):
            try:
                frappe.get_doc({"doctype": "Audit Stage", "name": s, "stage_name": s}).insert(ignore_permissions=True)
                print(f"Created Audit Stage: {s}")
            except Exception:
                frappe.log_error(title=f"Audit Stage Creation Failed - {s}")

    al_mapping = [
        {"stage": 1, "name": "BM", "prefix": "stage_1_bm"},
        {"stage": 2, "name": "DH", "prefix": "stage_2_dh"},
        {"stage": 2, "name": "COM", "prefix": "stage_2_com"},
        {"stage": 3, "name": "RM", "prefix": "stage_3_rm"},
        {"stage": 3, "name": "ROM", "prefix": "stage_3_rom"},
        {"stage": 4, "name": "ZM", "prefix": "stage_4_zm"},
        {"stage": 4, "name": "ZOM", "prefix": "stage_4_zom"},
        {"stage": 5, "name": "GM", "prefix": "stage_5_gm"},
        {"stage": 6, "name": "HR", "prefix": "stage_6_hr"},
        {"stage": 7, "name": "CHRO", "prefix": "stage_7_chro"},
        {"stage": 8, "name": "COO", "prefix": "stage_8_coo"},
        {"stage": 9, "name": "CFO", "prefix": "stage_9_cfo"},
        {"stage": 10, "name": "CEO", "prefix": "stage_10_ceo"},
    ]

    all_al = frappe.get_all("Audit Level", pluck="name")
    summary["total"] = len(all_al)

    processed = 0
    for al_name in all_al:
        processed += 1
        try:
            print(f"Processing Audit Level: {al_name}")
            doc = frappe.get_doc("Audit Level", al_name)
            updated = False

            # A. Set Division
            if not doc.division:
                frappe.db.set_value("Audit Level", al_name, "division", "Retail Branch Banking", update_modified=False)
                doc.reload()
                summary["division_updated"] += 1
                updated = True
                print(f"  [SET] Division: Retail Branch Banking")

            # B. Set Sahayog Branch (SOL Match -> Name Match)
            if not doc.sahayog_branch and doc.emp_branch:
                # Normalization
                branch_name = (doc.emp_branch or "").strip()
                
                # 1. Get SOL ID from old Branch Doctype
                sol_id = frappe.db.get_value("Branch", branch_name, "sol_id")
                
                # 2. Match using SOL ID
                if sol_id:
                    sb = frappe.db.get_value("Sahayog Branch", {"sol_id": sol_id}, "name")
                    if sb:
                        doc.sahayog_branch = sb
                        updated = True
                        summary["branch_updated"] += 1
                        print(f"  [SOL MATCH] {branch_name} -> {sb}")

                # 3. Name fallback
                if not doc.sahayog_branch:
                    sb = frappe.db.get_value("Sahayog Branch", {"branch": branch_name}, "name")
                    if not sb and frappe.db.exists("Sahayog Branch", branch_name):
                        sb = branch_name # Direct match
                        
                    if sb:
                        doc.sahayog_branch = sb
                        updated = True
                        summary["branch_updated"] += 1
                        print(f"  [NAME MATCH] {branch_name} -> {sb}")
                
                # Log failure
                if not doc.sahayog_branch:
                    print(f"  [MISSING] Sahayog Branch not found for {branch_name}")
                    frappe.log_error(
                        title="Missing Sahayog Branch Mapping",
                        message=f"Audit Level: {doc.name}\nBranch: {branch_name}\nSOL ID: {sol_id}"
                    )

            # C. Populate Audit Stages
            existing_stages = [d.stage_name for d in doc.audit_stages]
            stages_added = 0
            for m in al_mapping:
                if m["name"] in existing_stages: continue
                
                p = m["prefix"]
                emp_id = doc.get(f"{p}_emp_id") or (doc.get("stage_9_cfo_emp_id") if m["name"] == "CFO" else None)
                
                if emp_id:
                    doc.append("audit_stages", {
                        "stage": m["stage"],
                        "stage_name": m["name"],
                        "employee": emp_id,
                        "user_id": doc.get(f"{p}_user_id") or (doc.get("stage_9_user_id") if m["name"] == "CFO" else None),
                        "employee_name": doc.get(f"{p}_name") or (doc.get("stage_9_cfo_name") if m["name"] == "CFO" else None),
                        "email": doc.get(f"{p}_mail") or (doc.get("stage_9_cfo_mail") if m["name"] == "CFO" else None),
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
            print(f"  [FAILED] {al_name}: {str(e)}")
            frappe.log_error(title=f"Audit Level Migration Failed - {al_name}")

    frappe.db.commit() # Final commit
    print("\n================ MIGRATION SUMMARY (V3) ================")
    for key, val in summary.items(): print(f"{key.replace('_', ' ').title()}: {val}")
    print("========================================================\n")
