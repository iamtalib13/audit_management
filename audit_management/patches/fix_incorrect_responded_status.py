import frappe


def execute():
    """
    Patch to fix incorrect Pending / No Response statuses.

    Converts:
    - Pending -> Responded if valid response exists.

    """

    mapping = {
        "BM": "bm",
        "DH": "dh",
        "COM": "com",
        "RM": "rm",
        "ROM": "rom",
        "ZM": "zm",
        "ZOM": "zom",
        "GM": "gm",
        "HR": "hr",
        "CHRO": "chro",
        "COO": "coo",
        "CFO": "cfo",
        "CEO": "ceo",
    }

    audit_docs = frappe.get_all(
        "My Audits",
        pluck="name"
    )

    count = 0

    for docname in audit_docs:

        try:
            doc = frappe.get_doc("My Audits", docname)

            for row in doc.audit_stages:

                response_text = (row.response or "").strip()

                is_valid_response = (
                    response_text
                    and response_text not in [
                        "<p><br></p>",
                        "<div><br></div>",
                        "<p></p>",
                        "<div></div>",
                    ]
                )

                if (
                        row.status == "Pending"
                        and is_valid_response
                    ):

                    # -----------------------------
                    # Update Child Table
                    # -----------------------------
                    frappe.db.set_value(
                        "Audit Items",
                        row.name,
                        {
                            "status": "Responded",
                        },
                        update_modified=False,
                    )

                    # -----------------------------
                    # Sync Legacy Fields
                    # -----------------------------
                    prefix = mapping.get(
                        (row.stage_name or "").strip().upper()
                    )

                    if prefix:
                        frappe.db.set_value(
                            "My Audits",
                            doc.name,
                            {
                                f"{prefix}_user_status": "Responded",
                            },
                            update_modified=False,
                        )

                    count += 1

                    frappe.log_error(
                        title="Patch Fix: Pending To Responded",
                        message=(
                            f"Audit: {docname}\n"
                            f"Stage: {row.stage_name}\n"
                            f"User: {row.user_id}\n"
                            f"Row ID: {row.name}"
                        ),
                    )

        except Exception:
            frappe.log_error(
                frappe.get_traceback(),
                f"Patch Failed For Audit: {docname}"
            )

    frappe.db.commit()

    frappe.logger().info(
        f"Patch complete. {count} audit stage records updated."
    )