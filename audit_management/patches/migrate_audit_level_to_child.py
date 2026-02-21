import frappe

def execute():

    print("\n==============================")
    print("🚀 Starting Audit Level Migration Patch")
    print("==============================\n")

    frappe.logger().info("Starting Strong Audit Level Migration Patch")

    STAGE_MAP = [
    ("stage_1_bm_emp_id", "stage_1_bm_mail", "BM"),
    ("stage_2_dh_emp_id", "stage_2_dh_mail", "DH"),
    ("stage_2_com_emp_id", "stage_2_com_mail", "COM"),
    ("stage_3_rm_emp_id", "stage_3_rm_mail", "RM"),
    ("stage_3_rom_emp_id", "stage_3_rom_mail", "ROM"),
    ("stage_4_zm_emp_id", "stage_4_zm_mail", "ZM"),
    ("stage_4_zom_emp_id", "stage_4_zom_mail", "ZOM"),
    ("stage_5_gm_emp_id", "stage_5_gm_mail", "GM"),
    ("stage_6_hr_emp_id", "stage_6_hr_mail", "HR"),
    ("stage_7_coo_emp_id", "stage_7_coo_mail", "COO"),
    ("stage_8_ceo_emp_id", "stage_8_ceo_mail", "CEO"),
]

    audit_levels = frappe.get_all("Audit Level", fields=["name"])

    print(f"🔎 Total Audit Level Records Found: {len(audit_levels)}\n")

    for level in audit_levels:

        print(f"➡ Processing Audit Level: {level.name}")

        doc = frappe.get_doc("Audit Level", level.name)

        if not doc.audit_stages:
            doc.set("audit_stages", [])

        existing_employees = [d.employee for d in doc.audit_stages]

        updated = False

        for emp_field, mail_field, stage_name in STAGE_MAP:

            employee = doc.get(emp_field)
            email = doc.get(mail_field)

            if not employee:
                continue

            # If employee not present in child → add
            if employee not in existing_employees:

                print(f"   ➕ Adding missing child row for {stage_name} ({employee})")

                doc.append("audit_stages", {
                    "stage_name": stage_name,
                    "employee": employee,
                    "email": email
                })

                updated = True

            # If exists → update email if needed
            else:
                for row in doc.audit_stages:
                    if row.employee == employee and row.email != email:

                        print(f"   🔄 Updating email for {stage_name} ({employee})")

                        row.email = email
                        updated = True

        # Remove orphan child rows (static field removed)
        valid_employees = [
            doc.get(emp[0]) for emp in STAGE_MAP if doc.get(emp[0])
        ]

        original_count = len(doc.audit_stages)

        doc.audit_stages = [
            row for row in doc.audit_stages
            if row.employee in valid_employees
        ]

        if len(doc.audit_stages) != original_count:
            print("   🗑 Removed orphan child rows")
            updated = True

        if updated:
            doc.flags.ignore_mandatory = True
            doc.flags.ignore_validate = True
            doc.save(ignore_permissions=True)
            print("   ✅ Saved changes\n")
        else:
            print("   ⏩ No changes needed\n")

    frappe.db.commit()

    print("======================================")
    print("🎯 Audit Level Migration Patch Completed")
    print("======================================\n")

    frappe.logger().info("Strong Audit Level Migration Patch Completed")
    