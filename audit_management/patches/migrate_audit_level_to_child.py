import frappe

def execute():

    print("\n==============================")
    print("🚀 Starting Audit Level Migration Patch")
    print("==============================\n")

    STAGE_MAP = [
        ("stage_1_bm_emp_id", "stage_1_bm_mail", 1, "BM"),
        ("stage_2_dh_emp_id", "stage_2_dh_mail", 2, "DH"),
        ("stage_2_com_emp_id", "stage_2_com_mail", 2, "COM"),
        ("stage_3_rm_emp_id", "stage_3_rm_mail", 3, "RM"),
        ("stage_3_rom_emp_id", "stage_3_rom_mail", 3, "ROM"),
        ("stage_4_zm_emp_id", "stage_4_zm_mail", 4, "ZM"),
        ("stage_4_zom_emp_id", "stage_4_zom_mail", 4, "ZOM"),
        ("stage_5_gm_emp_id", "stage_5_gm_mail", 5, "GM"),
        ("stage_6_hr_emp_id", "stage_6_hr_mail", 6, "HR"),
        ("stage_7_coo_emp_id", "stage_7_coo_mail", 7, "COO"),
        ("stage_8_ceo_emp_id", "stage_8_ceo_mail", 8, "CEO"),
    ]

    audit_levels = frappe.get_all("Audit Level", fields=["name"])
    print(f"🔎 Total Audit Level Records Found: {len(audit_levels)}\n")

    for level in audit_levels:

        print(f"➡ Processing Audit Level: {level.name}")
        doc = frappe.get_doc("Audit Level", level.name)

        doc.set("audit_stages", [])  # Reset child table completely

        # ----------------------------------
        # REBUILD CHILD TABLE CLEAN
        # ----------------------------------
        for emp_field, mail_field, stage_number, stage_name in STAGE_MAP:

            employee = doc.get(emp_field)
            email = doc.get(mail_field)

            if not employee:
                continue

            doc.append("audit_stages", {
                "stage": stage_number,
                "stage_name": stage_name,
                "employee": employee,
                "email": email
            })

        # ----------------------------------
        # SORT PROPERLY
        # ----------------------------------
        doc.audit_stages = sorted(
            doc.audit_stages,
            key=lambda x: (int(x.stage), x.stage_name)
        )

        # ----------------------------------
        # FIX IDX (VERY IMPORTANT)
        # ----------------------------------
        for i, row in enumerate(doc.audit_stages, start=1):
            row.idx = i

        doc.flags.ignore_mandatory = True
        doc.flags.ignore_validate = True
        doc.save(ignore_permissions=True)

        print("   ✅ Rebuilt & Sorted Correctly\n")

    frappe.db.commit()

    print("======================================")
    print("🎯 Audit Level Migration Patch Completed")
    print("======================================\n")