# Copyright (c) 2024, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import now, time_diff_in_seconds, getdate, nowdate
from audit_management.audit_management.utils import get_working_days, update_audit_aging

class MyAudits(Document):
    def validate(self):
        update_audit_aging(self)
        if self.status == "Close":
            self.validate_resolution_fields()

    def before_save(self):
        if self.is_new() or self.has_value_changed("emp_branch"):
            populate_audit_stages(self)

    def validate_resolution_fields(self):
        """Mandatory for Requirement 4: RCA, Recommendations, etc."""
        mandatory_fields = [
            "root_cause_analysis",
            "rca_category",
            "recommendations",
            "action_point_with_tat"
        ]
        for field in mandatory_fields:
            if not self.get(field):
                frappe.throw(_("Field '{0}' is mandatory for query resolution.").format(self.meta.get_label(field)))

def populate_audit_stages(doc):
    """Populates audit_stages from Audit Level."""
    if not doc.emp_branch:
        doc.set("audit_stages", [])
        return

    audit_level = frappe.get_doc("Audit Level", doc.emp_branch)
    doc.set("audit_stages", [])
    
    for row in audit_level.audit_stages:
        doc.append("audit_stages", {
            "stage": row.stage,
            "stage_name": row.stage_name,
            "employee": row.employee,
            "user_id": row.user_id,
            "employee_name": row.employee_name,
            "email": row.email,
            "status": ""
        })

@frappe.whitelist()
def get_status_tracker_html(docname):
    audit_doc = frappe.get_doc("My Audits", docname)
    
    def create_status_box(text, color, title):
        return f"<div style='display:inline-block; padding: 2px 6px; border-radius: 10px; border: 2px solid {color}; color: {color}; cursor: pointer;' title='{title}'>{text}</div>"

    html_output = create_status_box("AUDIT TEAM", '#1E6EB2', 'Stage 0 : Audit Query') + " <b>--></b> "
    
    for i, row in enumerate(audit_doc.audit_stages):
        color = "grey"
        title = f"Stage {row.stage} : {row.stage_name} - {row.status or 'Waiting'}"
        
        if row.status == "Pending":
            color = "red"
        elif row.status == "Responded":
            color = "green"
        elif row.status == "No Response":
            color = "#4b0a7d"
        elif row.status == "Skipped":
            color = "#ffbe0b"
            
        html_output += create_status_box(row.stage_name, color, title)
        if i < len(audit_doc.audit_stages) - 1:
            html_output += " <b>--></b> "
            
    return html_output

@frappe.whitelist()
def send_to_next_stage(docname):
    doc = frappe.get_doc("My Audits", docname)
    next_row = None
    
    # Find first row that is not responded/skipped and not pending
    for row in doc.audit_stages:
        if not row.status:
            next_row = row
            break
            
    if next_row:
        next_row.status = "Pending"
        next_row.pending_time = now()
        doc.query_status = f"Pending From {next_row.stage_name}"
        doc.status = "Pending"
        
        # Share document with the user (notify=0 to prevent redundant background queue emails)
        frappe.share.add(doc.doctype, doc.name, next_row.user_id, read=1, write=1, notify=0)
        
        doc.save()
        
        # Send Custom Email immediately
        send_stage_notification(doc, next_row)
        return _("Query sent to {0}").format(next_row.stage_name)
    else:
        return _("No more stages to send to.")

def send_stage_notification(doc, stage_row):
    if not stage_row.email:
        frappe.msgprint(_("Notification email not sent: No email address found for {0}").format(stage_row.employee_name))
        return
        
    subject = f"Audit Query Pending: {doc.audit_query_subject_box}"
    
    query_creator = f"""
        <p>Name: {doc.query_generated_by_name or 'N/A'}</p>
        <p>Designation: {doc.query_generated_by_designation or 'N/A'}</p>
        <p>Branch: {doc.query_generated_by_branch or 'N/A'}</p>
    """
    
    message = frappe.render_template("audit_management/templates/emails/audit_query.html", {
        "doc": doc,
        "stage": stage_row,
        "dear_line": f"Dear {stage_row.employee_name},<br><br>",
        "query_creator": query_creator
    })
    
    frappe.sendmail(
        recipients=[stage_row.email],
        subject=subject,
        message=message,
        reference_doctype=doc.doctype,
        reference_name=doc.name,
        now=True
    )
    frappe.msgprint(_("Email notification sent to {0} ({1})").format(stage_row.employee_name, stage_row.email))

@frappe.whitelist()
def submit_response(docname, response_text, attachment=None):
    doc = frappe.get_doc("My Audits", docname)
    current_user = frappe.session.user

    found = False

    for i, row in enumerate(doc.audit_stages):
        if row.status == "Pending" and row.user_id == current_user:
            row.status = "Responded"
            row.response = response_text
            row.attachment = attachment
            row.response_time = now()
            doc.query_status = f"Response From {row.stage_name}"
            found = True
            break

    if found:
        doc.save(ignore_permissions=True)
        return _("Response submitted successfully.")
    else:
        frappe.throw(_("You are not authorized to respond at this stage or the query is not pending for you."))
@frappe.whitelist()
def check_pending_tat():
    """
    Fully dynamic, metadata-driven TAT check and escalation.
    Uses 'audit_stages' table as source of truth for flow.
    """
    print("Checking pending TAT (Dynamic Mode)...")
    now_time = frappe.utils.now()
    
    # Fetch all audits that are currently Pending
    pending_audits = frappe.get_all("My Audits", filters={"status": "Pending"}, fields=["name", "query_type"])
    
    for audit in pending_audits:
        doc = frappe.get_doc("My Audits", audit.name)
        if not doc.query_type or not doc.audit_stages:
            continue

        # Fetch TAT configuration for this Query Type
        tat_config_doc = frappe.get_cached_doc("Audit Query Type", doc.query_type)
        tat_map = {row.stage: row.tat_days for row in tat_config_doc.tat_config}
        default_tat = tat_config_doc.default_tat_days or 1

        # Find currently active rows in the child table
        active_rows = [row for row in doc.audit_stages if row.status == "Pending"]
        if not active_rows:
            continue

        # Get current stage level (e.g., '1', '2')
        current_stage_level = active_rows[0].stage
        exceeded = False
        max_days_found = 0

        for row in active_rows:
            if not row.pending_time:
                continue
            
            # Map TAT using stage_name (Link to Audit Stage)
            days = tat_map.get(row.stage_name, default_tat)
            max_days_found = max(max_days_found, days)
            tat_minutes = days * 24 * 60
            
            time_diff_minutes = time_diff_in_seconds(now_time, row.pending_time) / 60
            
            print(f"Record {doc.name}, Stage {row.stage_name}: Diff {time_diff_minutes}m, TAT {tat_minutes}m")
            
            if time_diff_minutes >= tat_minutes:
                exceeded = True
                break

        if exceeded:
            print(f"TAT Exceeded for {doc.name} at Level {current_stage_level}. Escalating...")
            
            # Update tat_day label in main doc
            doc.tat_day = f"{max_days_found} Day(s) TAT"
            
            # 1. Mark current pending rows as 'No Response'
            for row in doc.audit_stages:
                if row.stage == current_stage_level and row.status == "Pending":
                    row.status = "No Response"
            
            # 2. Find rows for the next level (current + 1)
            next_stage_level = str(int(current_stage_level) + 1)
            next_rows = [row for row in doc.audit_stages if row.stage == next_stage_level]
            
            if next_rows:
                stage_names = []
                for n_row in next_rows:
                    n_row.status = "Pending"
                    n_row.pending_time = now_time
                    
                    # Share doc with next users
                    frappe.share.add(doc.doctype, doc.name, n_row.user_id, read=1, write=1, notify=0)
                    
                    # Send Notification
                    send_stage_notification(doc, n_row)
                    
                    if n_row.stage_name not in stage_names:
                        stage_names.append(n_row.stage_name)
                
                doc.query_status = f"Pending From {', '.join(stage_names)}"
            else:
                # No more stages found, close or complete
                doc.status = "Close"
                doc.query_status = "Completed"
            
            doc.save(ignore_permissions=True)
            print(f"Escalation complete for {doc.name}")

def send_escalation_notification(doc, level):
    """Sends email when escalation level changes."""
    # Logic to find relevant recipient based on level (Dept Head for L2, Senior Mgmt for L3)
    # For now, we use the standard stage notification or a dedicated escalation template
    subject = f"Audit Escalation [{level}]: {doc.name}"
    message = f"Audit Query {doc.name} has been escalated to {level} due to inactivity ({doc.aging} working days)."
    
    # Send to active pending user
    for row in doc.audit_stages:
        if row.status == "Pending" and row.email:
            frappe.sendmail(
                recipients=[row.email],
                subject=subject,
                message=message,
                reference_doctype=doc.doctype,
                reference_name=doc.name
            )

@frappe.whitelist()
def send_daily_reminders():
    """Sends daily follow-up emails for all pending queries."""
    pending_audits = frappe.get_all("My Audits", filters={"status": "Pending"}, fields=["name"])
    for audit in pending_audits:
        doc = frappe.get_doc("My Audits", audit.name)
        for row in doc.audit_stages:
            if row.status == "Pending" and row.email:
                subject = f"REMINDER: Audit Query Pending - {doc.name}"
                message = f"This is a daily reminder for pending audit query: {doc.name}. Please address it soon."
                frappe.sendmail(
                    recipients=[row.email],
                    subject=subject,
                    message=message,
                    reference_doctype=doc.doctype,
                    reference_name=doc.name
                )

@frappe.whitelist()
def fetch_employee_data(employee_id):
    employee = frappe.db.get_value("Employee", employee_id, ["employee_name", "designation", "branch", "company_email"], as_dict=True)
    if not employee:
        # Fallback to searching by user_id if employee_id doesn't match
        employee = frappe.db.get_value("Employee", {"user_id": employee_id}, ["employee_name", "designation", "branch", "company_email"], as_dict=True)
    
    if not employee:
        frappe.throw(_("Employee for {0} not found").format(employee_id))
    return employee
