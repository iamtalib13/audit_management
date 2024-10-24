# Copyright (c) 2024, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now, time_diff_in_hours

class MyAudits(Document):
    pass

@frappe.whitelist()
def get_status_tracker_html(docname):
    # Fetch the document instance
    audit_doc = frappe.get_doc("My Audits", docname)

    # Status mapping to map user IDs to their corresponding status fields
    status_mapping = {
        "bm_user_id": audit_doc.bm_user_status,
        "dh_user_id": audit_doc.dh_user_status,
        "com_user_id": audit_doc.com_user_status,
        "rm_user_id": audit_doc.rm_user_status,
        "rom_user_id": audit_doc.rom_user_status,
        "zm_user_id": audit_doc.zm_user_status,
        "zom_user_id": audit_doc.zom_user_status,
        "gm_user_id": audit_doc.gm_user_status,
        "coo_user_id": audit_doc.coo_user_status,
        "ceo_user_id": audit_doc.ceo_user_status,
    }

    # Function to create styled box with border and hover message
    def create_status_box(text, color, title):
        return f"<div style='display:inline-block; padding: 2px 6px; border-radius: 10px; border: 2px solid {color}; color: {color};cursor: pointer;' title='{title}'>{text}</div>"

    # Initialize HTML output
    html_output = create_status_box("AUDIT TEAM", '#1E6EB2', 'Stage 0 : Audit Query') + " <b>--></b> "

    # BM color logic
    bm_status = status_mapping["bm_user_id"]
    if bm_status == "": 
        bm_color = "grey"  # Set color to grey if status is blank
        bm_title = "Stage 1 : Not sent to BM"
    else:
        bm_color = "green" if bm_status == "Responded" else "red"
        bm_title = "Stage 1 : Response for BM" if bm_color == "green" else "Stage 1 : Pending From BM"
    html_output += create_status_box("BM", bm_color, bm_title) + " <b>--></b> "

    # DH / COM logic
    dh_status = status_mapping["dh_user_id"]
    com_status = status_mapping["com_user_id"]

    if dh_status == "":
        dh_color = "grey"  # Set color to grey if status is blank
        dh_title = "Stage 2 : Not sent to DH"
    else:
        dh_color = "red" if dh_status == "Pending" else "green"
        dh_title = "Stage 2 : Response for DH" if dh_color == "green" else "Stage 2 : Pending From DH"

    if com_status == "":
        com_color = "grey"  # Set color to grey if status is blank
        com_title = "Stage 2 : Not sent to COM"
    else:
        com_color = "green" if com_status == "Responded" else "red"
        com_title = "Stage 2 : Response for COM" if com_color == "green" else "Stage 2 : Pending From COM"

    html_output += create_status_box("DH", dh_color, dh_title) + " <b>/</b> " + create_status_box("COM", com_color, com_title) + " <b>--></b> "

    # RM / ROM logic
    rm_status = status_mapping["rm_user_id"]
    rom_status = status_mapping["rom_user_id"]

    if rm_status == "":
        rm_color = "grey"  # Set color to grey if status is blank
        rm_title = "Stage 3 : Not sent to RM"
    else:
        rm_color = "green" if rm_status == "Responded" else "red"
        rm_title = "Stage 3 : Response for RM" if rm_color == "green" else "Stage 3 : Pending From RM"

    if rom_status == "":
        rom_color = "grey"  # Set color to grey if status is blank
        rom_title = "Stage 3 : Not sent to ROM"
    else:
        rom_color = "red" if rom_status == "Pending" else "green"
        rom_title = "Stage 3 : Response for ROM" if rom_color == "green" else "Stage 3 : Pending From ROM"

    html_output += create_status_box("RM", rm_color, rm_title) + " <b>/</b> " + create_status_box("ROM", rom_color, rom_title) + " <b>--></b> "

    # ZM / ZOM logic
    zm_status = status_mapping["zm_user_id"]
    zom_status = status_mapping["zom_user_id"]

    if zm_status == "":
        zm_color = "grey"  # Set color to grey if status is blank
        zm_title = "Stage 4 : Not sent to ZM"
    else:
        zm_color = "green" if zm_status == "Responded" else "red"
        zm_title = "Stage 4 : Response for ZM" if zm_color == "green" else "Stage 4 : Pending From ZM"

    if zom_status == "":
        zom_color = "grey"  # Set color to grey if status is blank
        zom_title = "Stage 4 : Not sent to ZOM"
    else:
        zom_color = "red" if zom_status == "Pending" else "green"
        zom_title = "Stage 4 : Response for ZOM" if zom_color == "green" else "Stage 4 : Pending From ZOM"

    html_output += create_status_box("ZM", zm_color, zm_title) + " <b>/</b> " + create_status_box("ZOM", zom_color, zom_title) + " <b>--></b> "

    # GM color logic
    gm_status = status_mapping["gm_user_id"]
    if gm_status == "":
        gm_color = "grey"  # Set color to grey if status is blank
        gm_title = "Stage 5 : Not sent to GM"
    else:
        gm_color = "green" if gm_status == "Responded" else "red"
        gm_title = "Stage 5 : Response for GM" if gm_color == "green" else "Stage 5 : Pending From GM"

    html_output += create_status_box("GM", gm_color, gm_title) + " <b>--></b> "

    # COO color logic
    coo_status = status_mapping["coo_user_id"]
    if coo_status == "":
        coo_color = "grey"  # Set color to grey if status is blank
        coo_title = "Stage 6 : Not sent to COO"
    else:
        coo_color = "green" if coo_status == "Responded" else "red"
        coo_title = "Stage 6 : Response for COO" if coo_color == "green" else "Stage 6 : Pending From COO"

    html_output += create_status_box("COO", coo_color, coo_title) + " <b>--></b> "

    # CEO color logic
    ceo_status = status_mapping["ceo_user_id"]
    if ceo_status == "":
        ceo_color = "grey"  # Set color to grey if status is blank
        ceo_title = "Stage 7 : Not sent to CEO"
    else:
        ceo_color = "green" if ceo_status == "Responded" else "red"
        ceo_title = "Stage 7 : Response for CEO" if ceo_color == "green" else "Stage 7 : Pending From CEO"

    html_output += create_status_box("CEO", ceo_color, ceo_title)

    return html_output

@frappe.whitelist()
def fetch_employee_data(employee_id):
    # Use parameterized query to prevent SQL injection
    sql_query = """SELECT employee_name, designation, branch FROM tabEmployee WHERE employee_id=%s"""
    # Execute the query with the provided employee_id
    result = frappe.db.sql(sql_query, (employee_id,), as_dict=True)

    return result

@frappe.whitelist()
def send_to_specific_stage(record, stage):
    """Send query to a specific stage and set the user statuses to Pending if not already set."""
    
    # Initialize a message variable to capture feedback
    message = {}

    if stage == "bm":
        current_time = now()  # Get the current timestamp
        message = {
            "bm_timestamp": current_time,
            "message": f"bm_pending_time is set for record: {record}"
        }

    elif stage == "dh_com":
        current_time = now()  # Get the current timestamp for both
        # Prepare a message with both timestamps
        message = {
            "dh_timestamp": current_time,
            "com_timestamp": current_time,
            "message": f"dh_pending_time and com_pending_time are set for record: {record}"
        }

    elif stage == "rm_rom":
        current_time = now()  # Get the current timestamp for both
        message = {
            "rm_timestamp": current_time,
            "rom_timestamp": current_time,
            "message": f"rm_pending_time and rom_pending_time are set for record: {record}"
        }

    elif stage == "zm_zom":
        current_time = now()  # Get the current timestamp for both
        message = {
            "zm_timestamp": current_time,
            "zom_timestamp": current_time,
            "message": f"zm_pending_time and zom_pending_time are set for record: {record}"
        }

    elif stage == "gm":
        current_time = now()  # Get the current timestamp
        message = {
            "gm_timestamp": current_time,
            "message": f"gm_pending_time is set for record: {record}"
        }

    elif stage == "coo":
        current_time = now()  # Get the current timestamp
        message = {
            "coo_timestamp": current_time,
            "message": f"coo_pending_time is set for record: {record}"
        }

    elif stage == "ceo":
        current_time = now()  # Get the current timestamp
        message = {
            "ceo_timestamp": current_time,
            "message": f"ceo_pending_time is set for record: {record}"
        }

    return message  # Return the message containing timestamps



@frappe.whitelist()
def send_to_all(record):
    """Send query to all stages and set their user statuses to Pending."""
    current_time = now()  # Get the current timestamp
    message = {
            "bm_timestamp": current_time, "dh_timestamp": current_time,
            "com_timestamp": current_time,"rm_timestamp": current_time,
            "rom_timestamp": current_time, "zm_timestamp": current_time,
            "zom_timestamp": current_time,"gm_timestamp": current_time,
            "coo_timestamp": current_time,"ceo_timestamp": current_time,
        }
    return message  # Return the message containing timestamps

@frappe.whitelist()
def check_pending_tat():
    """Check for pending statuses and trigger the next stage if 1 minute has passed for debugging."""
    
    def has_pending_exceeded(record, user_status_field, pending_time_field):
        """Helper function to check if the pending time has exceeded 1 minute."""
        status = getattr(record, user_status_field)
        pending_time = getattr(record, pending_time_field)
        return status == "Pending" and pending_time and time_diff_in_hours(now_time, pending_time) >= 24
    
    # Fetch all records where any stage is still 'Pending'
    pending_records = frappe.get_all("My Audits", or_filters=[
        ["bm_user_status", "=", "Pending"],
        ["dh_user_status", "=", "Pending"],
        ["com_user_status", "=", "Pending"],
        ["rm_user_status", "=", "Pending"],
        ["rom_user_status", "=", "Pending"],
        ["zm_user_status", "=", "Pending"],
        ["zom_user_status", "=", "Pending"],
        ["gm_user_status", "=", "Pending"],
        ["coo_user_status", "=", "Pending"],
        ["ceo_user_status", "=", "Pending"]
    ], fields=["name", "bm_user_status", "bm_pending_time", "dh_user_status", "dh_pending_time",
                "com_user_status", "com_pending_time", "rm_user_status", "rm_pending_time", 
                "rom_user_status", "rom_pending_time", "zm_user_status", "zm_pending_time",
                "zom_user_status", "zom_pending_time", "gm_user_status", "gm_pending_time",
                "coo_user_status", "coo_pending_time", "ceo_user_status", "ceo_pending_time"])

    now_time = now()
    updates = []  # Store updates to be made to the database

    for record in pending_records:
        # Check BM status
        if has_pending_exceeded(record, "bm_user_status", "bm_pending_time"):
            # Check if dh_user_status and com_user_status are empty
            if not record.dh_user_status:
                updates.append({"name": record.name, "field": "dh_user_status", "value": "Pending"})
                updates.append({"name": record.name, "field": "dh_pending_time", "value": now_time})

            if not record.com_user_status:
                updates.append({"name": record.name, "field": "com_user_status", "value": "Pending"})
                updates.append({"name": record.name, "field": "com_pending_time", "value": now_time})

        # Check DH/COM status
        if (has_pending_exceeded(record, "dh_user_status", "dh_pending_time") or 
            has_pending_exceeded(record, "com_user_status", "com_pending_time")):
            if not record.rm_user_status:
                updates.append({"name": record.name, "field": "rm_user_status", "value": "Pending"})
                updates.append({"name": record.name, "field": "rm_pending_time", "value": now_time})
            if not record.rom_user_status:
                updates.append({"name": record.name, "field": "rom_user_status", "value": "Pending"})
                updates.append({"name": record.name, "field": "rom_pending_time", "value": now_time})

        # Check RM/ROM status
        if (has_pending_exceeded(record, "rm_user_status", "rm_pending_time") or 
            has_pending_exceeded(record, "rom_user_status", "rom_pending_time")):
            if not record.zm_user_status:
                updates.append({"name": record.name, "field": "zm_user_status", "value": "Pending"})
                updates.append({"name": record.name, "field": "zm_pending_time", "value": now_time})

            if not record.zom_user_status:
                updates.append({"name": record.name, "field": "zom_user_status", "value": "Pending"})
                updates.append({"name": record.name, "field": "zom_pending_time", "value": now_time})


        # Check ZM/ZOM status
        if (has_pending_exceeded(record, "zm_user_status", "zm_pending_time") or 
            has_pending_exceeded(record, "zom_user_status", "zom_pending_time")):
            if not record.gm_user_status:
                updates.append({"name": record.name, "field": "gm_user_status", "value": "Pending"})
                updates.append({"name": record.name, "field": "gm_pending_time", "value": now_time})

        # Check GM status
        if has_pending_exceeded(record, "gm_user_status", "gm_pending_time"):
            if not record.coo_user_status:
                updates.append({"name": record.name, "field": "coo_user_status", "value": "Pending"})
                updates.append({"name": record.name, "field": "coo_pending_time", "value": now_time})


        # Check COO status
        if has_pending_exceeded(record, "coo_user_status", "coo_pending_time"):
            if not record.ceo_user_status:
                updates.append({"name": record.name, "field": "ceo_user_status", "value": "Pending"})
                updates.append({"name": record.name, "field": "ceo_pending_time", "value": now_time})


    # Execute all updates in one go
    for update in updates:
        frappe.db.set_value("My Audits", update['name'], update['field'], update['value'], update_modified=False)

    frappe.db.commit()


@frappe.whitelist()
def printing_all_records():
    """Fetch and print all records where any stage is still 'Pending'."""
    # Fetch all records where any stage is 'Pending'
    pending_records = frappe.get_all("My Audits", or_filters=[
        ["bm_user_status", "=", "Pending"],
        ["dh_user_status", "=", "Pending"],
        ["com_user_status", "=", "Pending"],
        ["rm_user_status", "=", "Pending"],
        ["rom_user_status", "=", "Pending"],
        ["zm_user_status", "=", "Pending"],
        ["zom_user_status", "=", "Pending"],
        ["gm_user_status", "=", "Pending"],
        ["coo_user_status", "=", "Pending"],
        ["ceo_user_status", "=", "Pending"]
    ], fields=["name", "bm_user_status", "bm_pending_time", "dh_user_status", "dh_pending_time",
               "com_user_status", "com_pending_time", "rm_user_status", "rm_pending_time", 
               "rom_user_status", "rom_pending_time", "zm_user_status", "zm_pending_time",
               "zom_user_status", "zom_pending_time", "gm_user_status", "gm_pending_time",
               "coo_user_status", "coo_pending_time", "ceo_user_status", "ceo_pending_time"])

    # Log and print the fetched records
    for record in pending_records:
        record_str = str(record)[:140]  # Truncate the record string to 140 characters
        frappe.log_error(record_str, "Pending Audit Record")  # Log for debugging
        print(record)
