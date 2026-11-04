import frappe

def execute():
    """
    Fixes My Audits records where branch_name is missing or name starts with '-'
    due to previous before_insert naming bug.
    Renames documents cleanly using frappe.rename_doc so linked docs and child tables stay intact.
    """
    records = frappe.db.sql(
        """
        SELECT name, emp_branch, branch_name
        FROM `tabMy Audits`
        WHERE name LIKE '-%' OR branch_name IS NULL OR branch_name = ''
        """,
        as_dict=True
    )

    if not records:
        return

    for doc_data in records:
        old_name = doc_data.name
        emp_branch = doc_data.emp_branch

        if not emp_branch:
            continue

        branch_name = frappe.db.get_value("Audit Level", emp_branch, "branch_name")
        if not branch_name:
            continue

        # 1. Update branch_name field if missing
        if not doc_data.branch_name or doc_data.branch_name != branch_name:
            frappe.db.set_value("My Audits", old_name, "branch_name", branch_name, update_modified=False)

        # 2. Rename document if name starts with '-'
        if old_name.startswith("-"):
            new_name = f"{branch_name}{old_name}"
            try:
                if not frappe.db.exists("My Audits", new_name):
                    frappe.rename_doc(
                        doctype="My Audits",
                        old=old_name,
                        new=new_name,
                        force=True,
                        show_alert=False
                    )
            except Exception as e:
                frappe.log_error(f"Error renaming My Audits {old_name} to {new_name}: {e}", "Fix My Audits Naming Patch")

    frappe.db.commit()
