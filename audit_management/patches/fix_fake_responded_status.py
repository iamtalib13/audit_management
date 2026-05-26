import frappe


def execute():
    """
    Patch to fix incorrect 'Responded' status.

    Converts 'Responded' -> 'No Response' if:
    - Status is 'Responded'
    - Response is empty / blank / HTML empty
    - No attachment exists
    """

    # Mapping for legacy hardcoded fields
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

    # Fetch all My Audits docs
    audit_docs = frappe.get_all("My Audits", pluck="name")

    count = 0

    for docname in audit_docs:
        doc = frappe.get_doc("My Audits", docname)

        for row in doc.audit_stages:

            # Normalize response text
            response_text = (row.response or "").strip()

            # Detect fake / empty responses
            is_empty_response = (
                not response_text
                or response_text in [
                    "<p><br></p>",
                    "<div><br></div>",
                    "<p></p>",
                    "<div></div>",
                ]
            )

            # Check corruption condition
            if (
                row.status == "Responded"
                and is_empty_response
                and not row.attachment
            ):

                # -----------------------------------
                # 1. Update Child Table Directly
                # -----------------------------------
                frappe.db.set_value(
                    "Audit Items",
                    row.name,
                    {
                        "status": "No Response",
                        "response": None,
                    },
                    update_modified=False,
                )

                # -----------------------------------
                # 2. Sync Legacy Hardcoded Fields
                # -----------------------------------
                prefix = mapping.get(
                    (row.stage_name or "").strip().upper()
                )

                if prefix:
                    frappe.db.set_value(
                        "My Audits",
                        doc.name,
                        {
                            f"{prefix}_user_status": "No Response",
                            f"{prefix}_response_box": None,
                        },
                        update_modified=False,
                    )

                count += 1

                frappe.log_error(
                    title="Patch Fix: Fake Responded Corrected",
                    message=(
                        f"Audit: {docname}\n"
                        f"Stage: {row.stage_name}\n"
                        f"User: {row.user_id}\n"
                        f"Row ID: {row.name}"
                    ),
                )

    frappe.db.commit()

    frappe.logger().info(
        f"Patch complete. {count} audit stage records updated."
    )