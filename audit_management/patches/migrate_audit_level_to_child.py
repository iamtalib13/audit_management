import frappe

def execute():
    frappe.logger().info("Starting Audit Child Email Fix Patch")

    EMAIL_FIELD_MAP = [
        ("stage_1_bm_emp_id", "stage_1_bm_mail"),
        ("stage_2_dh_emp_id", "stage_2_dh_mail"),
        ("stage_2_com_emp_id", "stage_2_com_mail"),
        ("stage_3_rm_emp_id", "stage_3_rm_mail"),
        ("stage_3_rom_emp_id", "stage_3_rom_mail"),
        ("stage_4_zm_emp_id", "stage_4_zm_mail"),
        ("stage_4_zom_emp_id", "stage_4_zom_mail"),
        ("stage_5_gm_emp_id", "stage_5_gm_mail"),
        ("stage_6_hr_emp_id", "stage_6_hr_mail"),
        ("stage_7_coo_emp_id", "stage_7_coo_mail"),
        ("stage_8_ceo_emp_id", "stage_8_ceo_mail"),
    ]

    audit_levels = frappe.get_all("Audit Level", fields=["name"])

    for level in audit_levels:
        doc = frappe.get_doc("Audit Level", level.name)

        if not doc.audit_stages:
            continue

        for child in doc.audit_stages:
            if child.email:
                continue  # already has email

            for emp_field, mail_field in EMAIL_FIELD_MAP:
                if doc.get(emp_field) == child.employee:
                    parent_email = doc.get(mail_field)
                    if parent_email:
                        child.email = parent_email

        doc.save(ignore_permissions=True)
        frappe.db.commit()

    frappe.logger().info("Audit Child Email Fix Completed")
