import frappe

def execute():
    """
    Patch to fix incorrect 'Responded' status.
    Converts 'Responded' -> 'No Response' if:
    - Status is 'Responded'
    - Response is empty/blank
    - pending_time exists
    """
    
    # Mapping for legacy field synchronization
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
    
    # Fetch all My Audits documents
    audit_docs = frappe.get_all("My Audits", pluck="name")
    
    count = 0
    for docname in audit_docs:
        doc = frappe.get_doc("My Audits", docname)
        updated = False
        
        for row in doc.audit_stages:
            # Check conditions for corruption
            if (row.status == "Responded" and 
                (not row.response or not str(row.response).strip()) and 
                row.pending_time):
                
                # 1. Update child table
                row.status = "No Response"
                
                # 2. Sync to legacy hardcoded fields
                prefix = mapping.get((row.stage_name or "").strip().upper())
                if prefix:
                    doc.set(f"{prefix}_user_status", "No Response")
                    doc.set(f"{prefix}_response_box", None)
                    
                updated = True
                frappe.log_error(
                    title="Patch Fix: Status Corrected",
                    message=f"Audit: {docname}, Stage: {row.stage_name}, User: {row.user_id}, Row ID: {row.name}"
                )
        
        if updated:
            doc.flags.ignore_validate = True
            doc.flags.ignore_mandatory = True
            doc.flags.ignore_version = True
            doc.db_update()
            count += 1
            
    frappe.db.commit()
    frappe.logger().info(f"Patch complete. {count} audit records updated.")
