import frappe


def execute():
    """
    Patch:
    1. Set branch_name from linked Sahayog Branch.
    2. Clear old emp_branch field.
    """

    print("\n===== Updating Branch Name in Audit Level =====\n")

    updated = 0
    skipped = 0
    failed = 0

    audit_levels = frappe.get_all(
        "Audit Level",
        fields=["name", "sahayog_branch", "branch_name", "emp_branch"]
    )

    for row in audit_levels:
        try:
            if not row.sahayog_branch:
                skipped += 1
                continue

            branch_name = frappe.db.get_value(
                "Sahayog Branch",
                row.sahayog_branch,
                "branch"
            )

            if not branch_name:
                print(f"[SKIPPED] Branch not found for: {row.name}")
                skipped += 1
                continue

            update_dict = {}

            if row.branch_name != branch_name:
                update_dict["branch_name"] = branch_name

            if row.emp_branch:
                update_dict["emp_branch"] = None

            if update_dict:
                frappe.db.set_value(
                    "Audit Level",
                    row.name,
                    update_dict,
                    update_modified=False
                )

                updated += 1
                print(f"[UPDATED] {row.name} -> {branch_name}")

            else:
                skipped += 1

        except Exception:
            failed += 1
            frappe.log_error(
                frappe.get_traceback(),
                f"Audit Level Branch Migration Failed: {row.name}"
            )

    frappe.db.commit()

    print("\n===== PATCH SUMMARY =====")
    print(f"Updated: {updated}")
    print(f"Skipped: {skipped}")
    print(f"Failed : {failed}")
    print("=========================\n")