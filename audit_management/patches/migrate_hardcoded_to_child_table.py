import frappe


def execute():
    """Migrate hardcoded My Audits stage data into audit_stages child table."""

    mapping = [
        {"prefix": "bm", "stage": "1", "stage_name": "BM"},
        {"prefix": "dh", "stage": "2", "stage_name": "DH"},
        {"prefix": "com", "stage": "2", "stage_name": "COM"},
        {"prefix": "rm", "stage": "3", "stage_name": "RM"},
        {"prefix": "rom", "stage": "3", "stage_name": "ROM"},
        {"prefix": "zm", "stage": "4", "stage_name": "ZM"},
        {"prefix": "zom", "stage": "4", "stage_name": "ZOM"},
        {"prefix": "gm", "stage": "5", "stage_name": "GM"},
        {"prefix": "hr", "stage": "6", "stage_name": "HR"},
        {"prefix": "coo", "stage": "8", "stage_name": "COO"},
        {"prefix": "ceo", "stage": "10", "stage_name": "CEO"},
    ]

    audit_names = frappe.get_all("My Audits", pluck="name")

    for audit_name in audit_names:
        doc = frappe.get_doc("My Audits", audit_name)
        updated = False

        for item in mapping:
            prefix = item["prefix"]
            user_id = doc.get(f"{prefix}_user_id")

            if not user_id:
                continue

            matching_row = next(
                (
                    row
                    for row in doc.audit_stages
                    if row.user_id == user_id
                    or (
                        str(row.stage) == str(item["stage"])
                        and row.stage_name in [item["stage_name"], doc.get(f"{prefix}_name")]
                    )
                ),
                None,
            )

            if not matching_row:
                matching_row = doc.append(
                    "audit_stages",
                    {
                        "stage": item["stage"],
                        "stage_name": item["stage_name"],
                        "employee": doc.get(f"{prefix}_empid"),
                        "user_id": user_id,
                        "employee_name": doc.get(f"{prefix}_name"),
                        "email": doc.get(f"{prefix}_mail"),
                    },
                )
                updated = True

            old_status = doc.get(f"{prefix}_user_status")
            old_response = doc.get(f"{prefix}_response_box")
            old_attachment = doc.get(f"{prefix}_attach_box")
            old_pending_time = doc.get(f"{prefix}_pending_time")
            old_response_time = doc.get(f"{prefix}_response_time")

            if old_status and matching_row.status != old_status:
                matching_row.status = old_status
                updated = True

            if old_response and matching_row.response != old_response:
                matching_row.response = old_response
                updated = True

            if old_attachment and matching_row.attachment != old_attachment:
                matching_row.attachment = old_attachment
                updated = True

            if old_pending_time and matching_row.pending_time != old_pending_time:
                matching_row.pending_time = old_pending_time
                updated = True

            if old_response_time and matching_row.response_time != old_response_time:
                matching_row.response_time = old_response_time
                updated = True

        if updated:
            doc.flags.ignore_validate = True
            doc.flags.ignore_mandatory = True
            doc.save(ignore_permissions=True)

    frappe.db.commit()
