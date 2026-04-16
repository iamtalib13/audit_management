# Copyright (c) 2024, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import now, time_diff_in_seconds

class MyAudits(Document):
    def before_save(self):
        if self.is_new() or self.has_value_changed("emp_branch"):
            populate_audit_stages(self)

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

            # Next stage auto-escalation after response
            if i + 1 < len(doc.audit_stages):
                next_row = doc.audit_stages[i + 1]

                if not next_row.status:
                    next_row.status = "Pending"
                    next_row.pending_time = now()
                    doc.query_status = f"Pending From {next_row.stage_name}"

                    frappe.share.add(
                        doc.doctype,
                        doc.name,
                        next_row.user_id,
                        read=1,
                        write=1,
                        notify=1
                    )

                    send_stage_notification(doc, next_row)

            else:
                # Last stage responded
                doc.status = "Close"
                doc.query_status = "Completed"

            break

    if found:
        doc.save(ignore_permissions=True)
        return _("Response submitted successfully.")
    else:
        frappe.throw(_("You are not authorized to respond at this stage or the query is not pending for you."))
@frappe.whitelist()
def check_pending_tat():
    now_time = now()
    pending_audits = frappe.get_all("My Audits", filters={"status": "Pending"}, fields=["name"])
    
    for audit in pending_audits:
        doc = frappe.get_doc("My Audits", audit.name)
        updated = False
        
        for i, row in enumerate(doc.audit_stages):
            if row.status == "Pending" and row.pending_time:
                # Default 1 day TAT, special logic can be added here
                tat_days = 15 if doc.query_type == "Audit Report Compliance" and i == 0 else 1
                
                if time_diff_in_seconds(now_time, row.pending_time) > (tat_days * 24 * 3600):
                    row.status = "No Response"
                    updated = True
                    
                    # Move to next stage automatically if exists
                    if i + 1 < len(doc.audit_stages):
                        next_row = doc.audit_stages[i+1]
                        next_row.status = "Pending"
                        next_row.pending_time = now_time
                        doc.query_status = f"Pending From {next_row.stage_name} (Auto-escalated)"
                        
                        frappe.share.add(doc.doctype, doc.name, next_row.user_id, read=1, write=1, notify=1)
                        send_stage_notification(doc, next_row)
                    break 
        
        if updated:
            doc.save()

@frappe.whitelist()
def fetch_employee_data(employee_id):
    employee = frappe.db.get_value("Employee", employee_id, ["employee_name", "designation", "branch", "company_email"], as_dict=True)
    if not employee:
        # Fallback to searching by user_id if employee_id doesn't match
        employee = frappe.db.get_value("Employee", {"user_id": employee_id}, ["employee_name", "designation", "branch", "company_email"], as_dict=True)
    
    if not employee:
        frappe.throw(_("Employee for {0} not found").format(employee_id))
    return employee
