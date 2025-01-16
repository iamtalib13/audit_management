# Copyright (c) 2024, Sahayog and contributors
# For license information, please see license.txt
import re
import frappe
from frappe.model.document import Document
from frappe.utils import now, time_diff_in_hours ,time_diff_in_seconds

class MyAudits(Document):
    pass

@frappe.whitelist()
def get_status_tracker_html(docname):
    # Fetch the document instance
    audit_doc = frappe.get_doc("My Audits", docname)

    # Status mapping to map user IDs to their corresponding status fields
    status_mapping = {
        "bm_user_id": audit_doc.bm_user_status,
        "bm_name": audit_doc.bm_name,
        "dh_user_id": audit_doc.dh_user_status,
        "dh_name": audit_doc.dh_name,
        "com_user_id": audit_doc.com_user_status,
        "com_name": audit_doc.com_name,
        "rm_user_id": audit_doc.rm_user_status,
        "rm_name": audit_doc.rm_name,
        "rom_user_id": audit_doc.rom_user_status,
        "rom_name": audit_doc.rom_name,
        "zm_user_id": audit_doc.zm_user_status,
        "zm_name": audit_doc.zm_name,
        "zom_user_id": audit_doc.zom_user_status,
        "zom_name": audit_doc.zom_name,
        "gm_user_id": audit_doc.gm_user_status,
        "gm_name": audit_doc.gm_name,
        "hr_user_id": audit_doc.hr_user_status,
        "hr_name": audit_doc.hr_name,
        "coo_user_id": audit_doc.coo_user_status,
        "coo_name": audit_doc.coo_name,
        "ceo_user_id": audit_doc.ceo_user_status,
        "ceo_name": audit_doc.ceo_name,
        "branch_name":audit_doc.emp_branch,
    }


    # Function to create styled box with border and hover message
    def create_status_box(text, color, title):
        return f"<div style='display:inline-block; padding: 2px 6px; border-radius: 10px; border: 2px solid {color}; color: {color}; cursor: pointer;' title='{title}'>{text}</div>"

    # Initialize HTML output
    html_output = create_status_box("AUDIT TEAM", '#1E6EB2', 'Stage 0 : Audit Query') + " <b>--></b> "

    branch_name = status_mapping["branch_name"]

    # BM color logic
    bm_status = status_mapping["bm_user_id"]
    bm_name = status_mapping["bm_name"]
    if bm_status == "":
        bm_color = "grey"
        bm_title = f"Stage 1 : Not sent to BM - {bm_name}"
    elif bm_status == "No Response":
        bm_color = "#151515"
        bm_title = f"Stage 1 : No Response from BM - {bm_name}"
    elif bm_status == "Skipped":
        bm_color = "#ffbe0b"
        bm_title = f"Stage 1 : Skipped - No BM set for {branch_name}"
    else:
        bm_color = "green" if bm_status == "Responded" else "red"
        bm_title = f"Stage 1 : Response for BM - {bm_name}" if bm_color == "green" else f"Stage 1 : Pending From BM - {bm_name}"
    html_output += create_status_box("BM", bm_color, bm_title) + " <b>--></b> "

    # DH / COM logic
    dh_status = status_mapping["dh_user_id"]
    dh_name = status_mapping["dh_name"]
    com_status = status_mapping["com_user_id"]
    com_name = status_mapping["com_name"]

    # DH Logic
    if dh_status == "":
        dh_color = "grey"
        dh_title = f"Stage 2 : Not sent to DH - {dh_name}"
    elif dh_status == "No Response":
        dh_color = "#151515"
        dh_title = f"Stage 2 : No Response from DH - {dh_name}"
    elif dh_status == "Skipped":
        dh_color = "#ffbe0b"
        dh_title = f"Stage 2 : Skipped - No DH set for {branch_name}"
    else:
        dh_color = "red" if dh_status == "Pending" else "green"
        dh_title = f"Stage 2 : Response for DH - {dh_name}" if dh_color == "green" else f"Stage 2 : Pending From DH - {dh_name}"

    # COM Logic
    if com_status == "":
        com_color = "grey"
        com_title = f"Stage 2 : Not sent to COM - {com_name}"
    elif com_status == "No Response":
        com_color = "#151515"
        com_title = f"Stage 2 : No Response from COM - {com_name}"
    elif com_status == "Skipped":
        com_color = "#ffbe0b"
        com_title = f"Stage 2 : Skipped - No COM set for {branch_name}"
    else:
        com_color = "green" if com_status == "Responded" else "red"
        com_title = f"Stage 2 : Response for COM - {com_name}" if com_color == "green" else f"Stage 2 : Pending From COM - {com_name}"

    html_output += create_status_box("DH", dh_color, dh_title) + " <b>/</b> " + create_status_box("COM", com_color, com_title) + " <b>--></b> "

    # RM / ROM logic
    rm_status = status_mapping["rm_user_id"]
    rm_name = status_mapping["rm_name"]
    rom_status = status_mapping["rom_user_id"]
    rom_name = status_mapping["rom_name"]

    # RM Logic
    if rm_status == "":
        rm_color = "grey"
        rm_title = f"Stage 3 : Not sent to RM - {rm_name}"
    elif rm_status == "No Response":
        rm_color = "#151515"
        rm_title = f"Stage 3 : No Response from RM - {rm_name}"
    elif rm_status == "Skipped":
        rm_color = "#ffbe0b"
        rm_title = f"Stage 3 : Skipped - No RM set for {branch_name}"
    else:
        rm_color = "green" if rm_status == "Responded" else "red"
        rm_title = f"Stage 3 : Response for RM - {rm_name}" if rm_color == "green" else f"Stage 3 : Pending From RM - {rm_name}"

    # ROM Logic
    if rom_status == "":
        rom_color = "grey"
        rom_title = f"Stage 3 : Not sent to ROM - {rom_name}"
    elif rom_status == "No Response":
        rom_color = "#151515"
        rom_title = f"Stage 3 : No Response from ROM - {rom_name}"
    elif rom_status == "Skipped":
        rom_color = "#ffbe0b"
        rom_title = f"Stage 3 : Skipped - No ROM set for {branch_name}"
    else:
        rom_color = "red" if rom_status == "Pending" else "green"
        rom_title = f"Stage 3 : Response for ROM - {rom_name}" if rom_color == "green" else f"Stage 3 : Pending From ROM - {rom_name}"

    html_output += create_status_box("RM", rm_color, rm_title) + " <b>/</b> " + create_status_box("ROM", rom_color, rom_title) + " <b>--></b> "

    # ZM / ZOM logic
    zm_status = status_mapping["zm_user_id"]
    zm_name = status_mapping["zm_name"]
    zom_status = status_mapping["zom_user_id"]
    zom_name = status_mapping["zom_name"]

    # ZM Logic
    if zm_status == "":
        zm_color = "grey"
        zm_title = f"Stage 4 : Not sent to ZM - {zm_name}"
    elif zm_status == "No Response":
        zm_color = "#151515"
        zm_title = f"Stage 4 : No Response from ZM - {zm_name}"
    elif zm_status == "Skipped":
        zm_color = "#ffbe0b"
        zm_title = f"Stage 4 : Skipped - No ZM set for {branch_name}"
    else:
        zm_color = "green" if zm_status == "Responded" else "red"
        zm_title = f"Stage 4 : Response for ZM - {zm_name}" if zm_color == "green" else f"Stage 4 : Pending From ZM - {zm_name}"

    # ZOM Logic
    if zom_status == "":
        zom_color = "grey"
        zom_title = f"Stage 4 : Not sent to ZOM - {zom_name}"
    elif zom_status == "No Response":
        zom_color = "#151515"
        zom_title = f"Stage 4 : No Response from ZOM - {zom_name}"
    elif zom_status == "Skipped":
        zom_color = "#ffbe0b"
        zom_title = f"Stage 4 : Skipped - No ZOM set for {branch_name}"
    else:
        zom_color = "red" if zom_status == "Pending" else "green"
        zom_title = f"Stage 4 : Response for ZOM - {zom_name}" if zom_color == "green" else f"Stage 4 : Pending From ZOM - {zom_name}"

    html_output += create_status_box("ZM", zm_color, zm_title) + " <b>/</b> " + create_status_box("ZOM", zom_color, zom_title) + " <b>--></b> "

    # GM color logic
    gm_status = status_mapping["gm_user_id"]
    gm_name = status_mapping["gm_name"]
    if gm_status == "":
        gm_color = "grey"
        gm_title = f"Stage 5 : Not sent to GM - {gm_name}"
    elif gm_status == "No Response":
        gm_color = "#151515"
        gm_title = f"Stage 5 : No Response from GM - {gm_name}"
    elif gm_status == "Skipped":
        gm_color = "#ffbe0b"
        gm_title = f"Stage 5 : Skipped - No GM set for {branch_name}"
    else:
        gm_color = "green" if gm_status == "Responded" else "red"
        gm_title = f"Stage 5 : Response for GM - {gm_name}" if gm_color == "green" else f"Stage 5 : Pending From GM - {gm_name}"

    html_output += create_status_box("GM", gm_color, gm_title) + " <b>--></b> "

    # HR color logic
    hr_status = status_mapping["hr_user_id"]
    hr_name = status_mapping["hr_name"]
    if hr_status == "":
        hr_color = "grey"
        hr_title = f"Stage 5 : Not sent to HR - {hr_name}"
    elif hr_status == "No Response":
        hr_color = "#151515"
        hr_title = f"Stage 5 : No Response from HR - {hr_name}"
    elif hr_status == "Skipped":
        hr_color = "#ffbe0b"
        hr_title = f"Stage 5 : Skipped - No GM set for {branch_name}"
    else:
        hr_color = "green" if hr_status == "Responded" else "red"
        hr_title = f"Stage 5 : Response for HR - {hr_name}" if hr_color == "green" else f"Stage 5 : Pending From HR - {hr_name}"

    html_output += create_status_box("HR", hr_color, hr_title) + " <b>--></b> "

    # COO color logic
    coo_status = status_mapping["coo_user_id"]
    coo_name = status_mapping["coo_name"]
    if coo_status == "":
        coo_color = "grey"
        coo_title = f"Stage 6 : Not sent to COO - {coo_name}"
    elif coo_status == "No Response":
        coo_color = "#151515"
        coo_title = f"Stage 6 : No Response from COO - {coo_name}"
    elif coo_status == "Skipped":
        coo_color = "#ffbe0b"
        coo_title = f"Stage 6 : Skipped - No COO set for {branch_name}"
    else:
        coo_color = "green" if coo_status == "Responded" else "red"
        coo_title = f"Stage 6 : Response for COO - {coo_name}" if coo_color == "green" else f"Stage 6 : Pending From COO - {coo_name}"

    html_output += create_status_box("COO", coo_color, coo_title) + " <b>--></b> "

    # CEO color logic
    ceo_status = status_mapping["ceo_user_id"]
    ceo_name = status_mapping["ceo_name"]
    if ceo_status == "":
        ceo_color = "grey"
        ceo_title = f"Stage 7 : Not sent to CEO - {ceo_name}"
    elif ceo_status == "No Response":
        ceo_color = "#151515"
        ceo_title = f"Stage 7 : No Response from CEO - {ceo_name}"
    elif ceo_status == "Skipped":
        ceo_color = "#ffbe0b"
        ceo_title = f"Stage 7 : Skipped - No CEO set for {branch_name}"
    else:
        ceo_color = "green" if ceo_status == "Responded" else "red"
        ceo_title = f"Stage 7 : Response for CEO - {ceo_name}" if ceo_color == "green" else f"Stage 7 : Pending From CEO - {ceo_name}"

    html_output += create_status_box("CEO", ceo_color, ceo_title)

    return html_output


@frappe.whitelist()
def fetch_employee_data(employee_id):
    # Use parameterized query to prevent SQL injection
    sql_query = """SELECT employee_name, designation, branch, company_email FROM tabEmployee WHERE employee_id=%s"""
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

    elif stage == "hr":
        current_time = now()  # Get the current timestamp
        message = {
            "hr_timestamp": current_time,
            "message": f"hr_pending_time is set for record: {record}"
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
            "hr_timestamp": current_time,"coo_timestamp": current_time,
            "ceo_timestamp": current_time,
        }
    return message  # Return the message containing timestamps

import frappe
from frappe.utils import now, time_diff_in_seconds

@frappe.whitelist()
def check_pending_tat():
    """Check for pending statuses and trigger the next stage if the pending time exceeds the threshold."""

    def has_pending_exceeded(record, user_status_field, pending_time_field, now_time):
        """Helper function to check if the pending time has exceeded the set threshold."""
        status = getattr(record, user_status_field)
        pending_time = getattr(record, pending_time_field)
        query_type = getattr(record, "query_type", None)

        # Determine TAT based on conditions
        if user_status_field == "bm_user_status":
            if query_type == "Branch Compliance":
                tat_time = 15 * 24 * 60  # 15 days in minutes
                tat_day = "15 Days then 1 Day TAT"
            elif query_type == "Critical Compliance":
                tat_time = 1 * 24 * 60  # 1 day in minutes
                tat_day = "1 Day TAT"
            else:
                tat_time = 1 * 24 * 60  # Default (1 day)
                tat_day = "1 Day TAT"
        else:
            tat_time = 1 * 24 * 60  # Default (1 day)
            tat_day = "1 Day TAT"

        # Check if the pending time has exceeded the threshold
        if status == "Pending" and pending_time:
            time_diff_minutes = time_diff_in_seconds(now_time, pending_time) / 60  # Convert seconds to minutes
            if time_diff_minutes >= tat_time:
                frappe.db.set_value("My Audits", record.name, "tat_day", tat_day, update_modified=False)
                return True
        return False

    # Fetch current time
    now_time = now()

    # Fetch all records with any 'Pending' status
    pending_records = frappe.get_all(
        "My Audits",
        or_filters=[
            ["bm_user_status", "=", "Pending"],
            ["dh_user_status", "=", "Pending"],
            ["com_user_status", "=", "Pending"],
            ["rm_user_status", "=", "Pending"],
            ["rom_user_status", "=", "Pending"],
            ["zm_user_status", "=", "Pending"],
            ["zom_user_status", "=", "Pending"],
            ["gm_user_status", "=", "Pending"],
            ["hr_user_status", "=", "Pending"],
            ["coo_user_status", "=", "Pending"],
            ["ceo_user_status", "=", "Pending"],
        ],
        fields=[
            "name", "query_type", "bm_user_status", "bm_pending_time", "dh_user_status", "dh_pending_time",
            "com_user_status", "com_pending_time", "rm_user_status", "rm_pending_time",
            "rom_user_status", "rom_pending_time", "zm_user_status", "zm_pending_time",
            "zom_user_status", "zom_pending_time", "gm_user_status", "gm_pending_time",
            "hr_user_status", "hr_pending_time","coo_user_status", "coo_pending_time",
            "ceo_user_status", "ceo_pending_time"
        ],
    )

    updates = []  # Store updates for batch processing

    # Level transition definitions
    level_transitions = [
        # BM level (no prior level)
        ([("bm_user_status", "bm_pending_time")], 
         [("dh_user_status", "dh_pending_time"), ("com_user_status", "com_pending_time")]),

        # DH and COM level (depends on BM being completed)
        ([("dh_user_status", "dh_pending_time"), ("com_user_status", "com_pending_time")],
         [("rm_user_status", "rm_pending_time"), ("rom_user_status", "rom_pending_time")]),

        # RM and ROM level
        ([("rm_user_status", "rm_pending_time"), ("rom_user_status", "rom_pending_time")],
         [("zm_user_status", "zm_pending_time"), ("zom_user_status", "zom_pending_time")]),

        # ZM and ZOM level
        ([("zm_user_status", "zm_pending_time"), ("zom_user_status", "zom_pending_time")],
         [("gm_user_status", "gm_pending_time")]),

        # GM level
        ([("gm_user_status", "gm_pending_time")],
         [("hr_user_status", "hr_pending_time")]),

         # HR level
        ([("hr_user_status", "hr_pending_time")],
         [("coo_user_status", "coo_pending_time")]),

        # COO level
        ([("coo_user_status", "coo_pending_time")],
         [("ceo_user_status", "ceo_pending_time")]),

        # Last stage - CEO level (handle explicitly to set to "No Response" if TAT exceeded)
        ([("ceo_user_status", "ceo_pending_time")], [])
    ]

    for record in pending_records:
        for current_level, next_level in level_transitions:
            # Check if all current statuses are pending and have exceeded the TAT
            if all(
                has_pending_exceeded(record, status_field, time_field, now_time)
                for status_field, time_field in current_level
            ):
                # Set current statuses to "No Response"
                for status_field, _ in current_level:
                    updates.append({"name": record.name, "field": status_field, "value": "No Response"})

                # Set next statuses to "Pending" with updated pending time
                for next_status_field, next_pending_field in next_level:
                    updates.append({"name": record.name, "field": next_status_field, "value": "Pending"})
                    updates.append({"name": record.name, "field": next_pending_field, "value": now_time})

    # Apply updates to the database
    for update in updates:
        frappe.db.set_value("My Audits", update["name"], update["field"], update["value"], update_modified=False)

    frappe.db.commit()

#this was for testing
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
        ["hr_user_status", "=", "Pending"],
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

@frappe.whitelist()
def get_audit_counts(is_admin=None):
    # Adjust the SQL queries based on the is_admin flag
    counts = {}

    # Example SQL queries based on the value of is_admin
    if is_admin == "yes":
        # Query for Admin or Audit Manager (e.g., all records)
        counts["total_count"] = frappe.db.count("My Audits")
        counts["draft_count"] = frappe.db.count("My Audits", filters={"status": "Draft"})
        counts["pending_count"] = frappe.db.count("My Audits", filters={"status": "Pending"})
        counts["close_count"] = frappe.db.count("My Audits", filters={"status": "Close"})
        counts["bm_pending_count"] = frappe.db.count("My Audits", filters={"bm_user_status": "Pending"})
        counts["dh_pending_count"] = frappe.db.count("My Audits", filters={"dh_user_status": "Pending"})
        counts["com_pending_count"] = frappe.db.count("My Audits", filters={"com_user_status": "Pending"})
        counts["rm_pending_count"] = frappe.db.count("My Audits", filters={"rm_user_status": "Pending"})
        counts["rom_pending_count"] = frappe.db.count("My Audits", filters={"rom_user_status": "Pending"})
        counts["zm_pending_count"] = frappe.db.count("My Audits", filters={"zm_user_status": "Pending"})
        counts["zom_pending_count"] = frappe.db.count("My Audits", filters={"zom_user_status": "Pending"})
        counts["gm_pending_count"] = frappe.db.count("My Audits", filters={"gm_user_status": "Pending"})
        counts["hr_pending_count"] = frappe.db.count("My Audits", filters={"hr_user_status": "Pending"})
        counts["coo_pending_count"] = frappe.db.count("My Audits", filters={"coo_user_status": "Pending"})
        counts["ceo_pending_count"] = frappe.db.count("My Audits", filters={"ceo_user_status": "Pending"})
        counts["bm_response_count"] = frappe.db.count("My Audits", filters={"bm_user_status": "Responded"})
        counts["dh_response_count"] = frappe.db.count("My Audits", filters={"dh_user_status": "Responded"})
        counts["com_response_count"] = frappe.db.count("My Audits", filters={"com_user_status": "Responded"})
        counts["rm_response_count"] = frappe.db.count("My Audits", filters={"rm_user_status": "Responded"})
        counts["rom_response_count"] = frappe.db.count("My Audits", filters={"rom_user_status": "Responded"})
        counts["zm_response_count"] = frappe.db.count("My Audits", filters={"zm_user_status": "Responded"})
        counts["zom_response_count"] = frappe.db.count("My Audits", filters={"zom_user_status": "Responded"})
        counts["gm_response_count"] = frappe.db.count("My Audits", filters={"gm_user_status": "Responded"})
        counts["hr_response_count"] = frappe.db.count("My Audits", filters={"hr_user_status": "Responded"})
        counts["coo_response_count"] = frappe.db.count("My Audits", filters={"coo_user_status": "Responded"})
        counts["ceo_response_count"] = frappe.db.count("My Audits", filters={"ceo_user_status": "Responded"})

        # Add No Response counts
        counts["bm_no_response_count"] = frappe.db.count("My Audits", filters={"bm_user_status": "No Response"})
        counts["dh_no_response_count"] = frappe.db.count("My Audits", filters={"dh_user_status": "No Response"})
        counts["com_no_response_count"] = frappe.db.count("My Audits", filters={"com_user_status": "No Response"})
        counts["rm_no_response_count"] = frappe.db.count("My Audits", filters={"rm_user_status": "No Response"})
        counts["rom_no_response_count"] = frappe.db.count("My Audits", filters={"rom_user_status": "No Response"})
        counts["zm_no_response_count"] = frappe.db.count("My Audits", filters={"zm_user_status": "No Response"})
        counts["zom_no_response_count"] = frappe.db.count("My Audits", filters={"zom_user_status": "No Response"})
        counts["gm_no_response_count"] = frappe.db.count("My Audits", filters={"gm_user_status": "No Response"})
        counts["hr_no_response_count"] = frappe.db.count("My Audits", filters={"hr_user_status": "No Response"})
        counts["coo_no_response_count"] = frappe.db.count("My Audits", filters={"coo_user_status": "No Response"})
        counts["ceo_no_response_count"] = frappe.db.count("My Audits", filters={"ceo_user_status": "No Response"})

    elif is_admin == "no":
        # Query for Audit Manager (e.g., restricted records)
       	counts["total_count"] = frappe.db.count("My Audits",filters={"owner": frappe.session.user})
        counts["draft_count"] = frappe.db.count("My Audits", filters={"status": "Draft", "owner": frappe.session.user})
        counts["pending_count"] = frappe.db.count("My Audits", filters={"status": "Pending", "owner": frappe.session.user})
        counts["close_count"] = frappe.db.count("My Audits", filters={"status": "Close", "owner": frappe.session.user})
        counts["bm_pending_count"] = frappe.db.count("My Audits", filters={"bm_user_status": "Pending", "owner": frappe.session.user})
        counts["dh_pending_count"] = frappe.db.count("My Audits", filters={"dh_user_status": "Pending", "owner": frappe.session.user})
        counts["com_pending_count"] = frappe.db.count("My Audits", filters={"com_user_status": "Pending", "owner": frappe.session.user})
        counts["rm_pending_count"] = frappe.db.count("My Audits", filters={"rm_user_status": "Pending", "owner": frappe.session.user})
        counts["rom_pending_count"] = frappe.db.count("My Audits", filters={"rom_user_status": "Pending", "owner": frappe.session.user})
        counts["zm_pending_count"] = frappe.db.count("My Audits", filters={"zm_user_status": "Pending", "owner": frappe.session.user})
        counts["zom_pending_count"] = frappe.db.count("My Audits", filters={"zom_user_status": "Pending", "owner": frappe.session.user})
        counts["gm_pending_count"] = frappe.db.count("My Audits", filters={"gm_user_status": "Pending", "owner": frappe.session.user})
        counts["hr_pending_count"] = frappe.db.count("My Audits", filters={"hr_user_status": "Pending", "owner": frappe.session.user})
        counts["coo_pending_count"] = frappe.db.count("My Audits", filters={"coo_user_status": "Pending", "owner": frappe.session.user})
        counts["ceo_pending_count"] = frappe.db.count("My Audits", filters={"ceo_user_status": "Pending", "owner": frappe.session.user})
        counts["bm_response_count"] = frappe.db.count("My Audits", filters={"bm_user_status": "Responded", "owner": frappe.session.user})
        counts["dh_response_count"] = frappe.db.count("My Audits", filters={"dh_user_status": "Responded", "owner": frappe.session.user})
        counts["com_response_count"] = frappe.db.count("My Audits", filters={"com_user_status": "Responded", "owner": frappe.session.user})
        counts["rm_response_count"] = frappe.db.count("My Audits", filters={"rm_user_status": "Responded", "owner": frappe.session.user})
        counts["rom_response_count"] = frappe.db.count("My Audits", filters={"rom_user_status": "Responded", "owner": frappe.session.user})
        counts["zm_response_count"] = frappe.db.count("My Audits", filters={"zm_user_status": "Responded", "owner": frappe.session.user})
        counts["zom_response_count"] = frappe.db.count("My Audits", filters={"zom_user_status": "Responded", "owner": frappe.session.user})
        counts["gm_response_count"] = frappe.db.count("My Audits", filters={"gm_user_status": "Responded", "owner": frappe.session.user})
        counts["hr_response_count"] = frappe.db.count("My Audits", filters={"hr_user_status": "Responded", "owner": frappe.session.user})
        counts["coo_response_count"] = frappe.db.count("My Audits", filters={"coo_user_status": "Responded", "owner": frappe.session.user})
        counts["ceo_response_count"] = frappe.db.count("My Audits", filters={"ceo_user_status": "Responded", "owner": frappe.session.user})
           
        # Add No Response counts for restricted access
        counts["bm_no_response_count"] = frappe.db.count("My Audits", filters={"bm_user_status": "No Response", "owner": frappe.session.user})
        counts["dh_no_response_count"] = frappe.db.count("My Audits", filters={"dh_user_status": "No Response", "owner": frappe.session.user})
        counts["com_no_response_count"] = frappe.db.count("My Audits", filters={"com_user_status": "No Response", "owner": frappe.session.user})
        counts["rm_no_response_count"] = frappe.db.count("My Audits", filters={"rm_user_status": "No Response", "owner": frappe.session.user})
        counts["rom_no_response_count"] = frappe.db.count("My Audits", filters={"rom_user_status": "No Response", "owner": frappe.session.user})
        counts["zm_no_response_count"] = frappe.db.count("My Audits", filters={"zm_user_status": "No Response", "owner": frappe.session.user})
        counts["zom_no_response_count"] = frappe.db.count("My Audits", filters={"zom_user_status": "No Response", "owner": frappe.session.user})
        counts["gm_no_response_count"] = frappe.db.count("My Audits", filters={"gm_user_status": "No Response", "owner": frappe.session.user})
        counts["hr_no_response_count"] = frappe.db.count("My Audits", filters={"hr_user_status": "No Response", "owner": frappe.session.user})
        counts["coo_no_response_count"] = frappe.db.count("My Audits", filters={"coo_user_status": "No Response", "owner": frappe.session.user})
        counts["ceo_no_response_count"] = frappe.db.count("My Audits", filters={"ceo_user_status": "No Response", "owner": frappe.session.user})

    return counts

@frappe.whitelist(allow_guest=True)
def get_audit_level_for_user():
    # Get the current logged-in user
    user = frappe.session.user

    # Use or_filters to check if the user exists in any of the specified fields
    matches = frappe.get_all(
        'Audit Level',
        or_filters=[
            ['stage_1_bm_user_id', '=', user],
            ['stage_2_dh_user_id', '=', user],
            ['stage_2_com_user_id', '=', user],
            ['stage_3_rm_user_id', '=', user],
            ['stage_3_rom_user_id', '=', user],
            ['stage_4_zm_user_id', '=', user],
            ['stage_4_zom_user_id', '=', user],
            ['stage_5_gm_user_id', '=', user],
            ['stage_6_hr_user_id', '=', user],
            ['stage_7_coo_user_id', '=', user],
            ['stage_8_ceo_user_id', '=', user]
        ],
        fields=[
            'name', 'stage_1_bm_user_id', 'stage_2_dh_user_id', 'stage_2_com_user_id',
            'stage_3_rm_user_id', 'stage_3_rom_user_id', 'stage_4_zm_user_id',
            'stage_4_zom_user_id', 'stage_5_gm_user_id', 'stage_6_hr_user_id','stage_7_coo_user_id',
            'stage_8_ceo_user_id'
        ]
    )

    # If matches are found, determine user stages for each
    if matches:
        results = []
        stages = {
            'stage_1_bm_user_id': "bm_user_status",
            'stage_2_dh_user_id': "dh_user_status",
            'stage_2_com_user_id': "com_user_status",
            'stage_3_rm_user_id': "rm_user_status",
            'stage_3_rom_user_id': "rom_user_status",
            'stage_4_zm_user_id': "zm_user_status",
            'stage_4_zom_user_id': "zom_user_status",
            'stage_5_gm_user_id': "gm_user_status",
            'stage_6_hr_user_id': "hr_user_status",
            'stage_7_coo_user_id': "coo_user_status", 
            'stage_8_ceo_user_id': "ceo_user_status"
        }

        # Loop through each matching record and find the corresponding user stage
        for audit_level in matches:
            for stage_field, status_field in stages.items():
                if audit_level.get(stage_field) == user:
                    results.append({
                        "name": audit_level['name'],
                        "user_stage": status_field
                    })
        
        return {
            "flag": "LevelUser",
            "matches": results
        }

    # Check if the user has any of the specified roles (Audit Manager, Audit Member, etc.)
    user_roles = frappe.get_roles(user)
    audit_roles = {"Audit Manager", "Audit Member", "System Manager", "Administrator"}

    if audit_roles.intersection(user_roles):
        return {"flag": "AuditUser"}

    # If neither condition is met, return "OtherUser"
    return {"flag": "OtherUser"}
