import frappe

def execute():
    """
    Migrates stage information from linked Audit Level documents into the
    'audit_stages' child table of My Audits documents.
    Ensures idempotency and proper sorting.
    """



    # Define the mapping from Audit Level fields to Audit Items child table fields
    # Format: (emp_id_field, mail_field, stage_number, stage_name_label)
    STAGE_MAP = [
        ("stage_1_bm_emp_id", "stage_1_bm_mail", 1, "BM"),
        ("stage_2_dh_emp_id", "stage_2_dh_mail", 2, "DH"),
        ("stage_2_com_emp_id", "stage_2_com_mail", 2, "COM"), # Assuming COM is also stage 2
        ("stage_3_rm_emp_id", "stage_3_rm_mail", 3, "RM"),
        ("stage_3_rom_emp_id", "stage_3_rom_mail", 3, "ROM"), # Assuming ROM is also stage 3
        ("stage_4_zm_emp_id", "stage_4_zm_mail", 4, "ZM"),
        ("stage_4_zom_emp_id", "stage_4_zom_mail", 4, "ZOM"), # Assuming ZOM is also stage 4
        ("stage_5_gm_emp_id", "stage_5_gm_mail", 5, "GM"),
        ("stage_6_hr_emp_id", "stage_6_hr_mail", 6, "HR"),
        ("stage_7_coo_emp_id", "stage_7_coo_mail", 7, "COO"),
        ("stage_8_ceo_emp_id", "stage_8_ceo_mail", 8, "CEO"),
    ]

    # Get all My Audits documents that have an emp_branch linked to an Audit Level
    my_audits_list = frappe.get_all(
        "My Audits",
        filters={"emp_branch": ["is", "set"]},
        fields=["name", "emp_branch"]
    )

    for my_audit_data in my_audits_list:
        my_audit_name = my_audit_data.name
        audit_level_name = my_audit_data.emp_branch

        try:
            # Load the My Audits document
            my_audit_doc = frappe.get_doc("My Audits", my_audit_name)

            # Check if the linked Audit Level document exists
            if not frappe.db.exists("Audit Level", audit_level_name):
                frappe.log_error(f"Audit Level document '{audit_level_name}' linked in 'My Audits' '{my_audit_name}' not found. Skipping.",
                                 "Audit Level to My Audits Migration")
                continue # Skip to the next My Audits document

            audit_level_doc = frappe.get_doc("Audit Level", audit_level_name)

            # Clear existing child table entries for idempotency
            my_audit_doc.set("audit_stages", [])

            new_audit_stages_entries = []

            for emp_field_id, mail_field, stage_number, stage_name_label in STAGE_MAP:
                employee_id = audit_level_doc.get(emp_field_id)
                employee_mail = audit_level_doc.get(mail_field)

                if employee_id:
                    # Deriving user_id and employee_name from the Audit Level doc
                    # based on the fetch_from definitions in audit_level.json
                    emp_user_id_field = emp_field_id.replace("_emp_id", "_user_id")
                    emp_name_field = emp_field_id.replace("_emp_id", "_name")

                    employee_user_id = audit_level_doc.get(emp_user_id_field)
                    employee_name = audit_level_doc.get(emp_name_field)

                    # Create a new entry for the child table
                    new_audit_stages_entries.append({
                        "doctype": "Audit Items", # Child DocType name
                        "stage": stage_number,
                        # Link to Audit Stage if exists, otherwise just the label.
                        # Assuming Audit Stage DocTypes exist with these names.
                        "stage_name": frappe.db.get_value("Audit Stage", {"name": stage_name_label}, "name") or stage_name_label,
                        "employee": employee_id,
                        "user_id": employee_user_id,
                        "employee_name": employee_name,
                        "email": employee_mail
                    })

            # Sort the entries by stage number
            new_audit_stages_entries = sorted(
                new_audit_stages_entries,
                key=lambda x: int(x.get("stage", 0))
            )

            # Append sorted entries to the child table and fix idx
            for i, row_data in enumerate(new_audit_stages_entries, start=1):
                row = my_audit_doc.append("audit_stages", row_data)
                row.idx = i

            # Save the My Audits document, ignoring validations for migration
            my_audit_doc.flags.ignore_mandatory = True
            my_audit_doc.flags.ignore_validate = True
            my_audit_doc.save(ignore_permissions=True)

        except Exception as e:
            frappe.log_error(f"Error migrating 'My Audits' {my_audit_name}: {e}", "Audit Level to My Audits Migration")
            frappe.db.rollback() # Rollback changes for this document on error

    frappe.db.commit() # Final commit for all successful operations