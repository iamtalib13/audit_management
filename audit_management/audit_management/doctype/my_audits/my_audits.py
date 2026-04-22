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
        # 1. Sync Hardcoded Fields to Child Table (Priority for Legacy updates)
        self.sync_old_to_new()
        
        # 2. Sync Child Table to Hardcoded Fields (Priority for UI/Reporting)
        self.sync_new_to_old()
        
        # 3. Populate Stages from Audit Level only if needed
        if (self.is_new() or self.has_value_changed("emp_branch")) and not self.audit_stages:
            populate_audit_stages(self)

    def sync_old_to_new(self):
        """Syncs hardcoded fields to the child table."""
        if not self.audit_stages:
            return

        mapping = self.get_prefix_mapping()
        for m in mapping:
            prefix = m["prefix"]
            user_id = self.get(f"{prefix}_user_id")
            if not user_id:
                continue

            # Find matching row in child table
            row = self.find_matching_row(user_id, m["stage"], m["label"], prefix)
            if row:
                old_status = self.get(f"{prefix}_user_status")
                if old_status and row.status != old_status:
                    row.status = old_status
                
                old_resp = self.get(f"{prefix}_response_box")
                if old_resp and row.response != old_resp:
                    row.response = old_resp
                
                old_pend = self.get(f"{prefix}_pending_time")
                if old_pend and row.pending_time != old_pend:
                    row.pending_time = old_pend

    def sync_new_to_old(self):
        """Syncs child table data back to hardcoded fields and updates tracking."""
        if not self.audit_stages:
            return

        mapping = {m["label"]: m["prefix"] for m in self.get_prefix_mapping()}
        max_level = 0
        
        for row in self.audit_stages:
            prefix = mapping.get(row.stage_name)
            if prefix:
                self.set(f"{prefix}_user_status", row.status)
                self.set(f"{prefix}_response_box", row.response)
                self.set(f"{prefix}_attach_box", row.attachment)
                if row.pending_time:
                    self.set(f"{prefix}_pending_time", row.pending_time)

                if row.status in ["Pending", "Responded", "No Response"]:
                    try:
                        lvl = int(row.stage)
                        if lvl > max_level:
                            max_level = lvl
                    except:
                        pass
        
        # Update Operational Tracking Level
        if max_level > 0:
            if max_level <= 1:
                self.current_escalation_level = "Level 1"
            elif max_level <= 3:
                self.current_escalation_level = "Level 2"
            else:
                self.current_escalation_level = "Level 3"

    def find_matching_row(self, user_id, stage_num, stage_label, prefix):
        """Helper to find a row in audit_stages."""
        for row in self.audit_stages:
            if row.user_id == user_id:
                return row
            if str(row.stage) == str(stage_num) and row.stage_name in [stage_label, self.get(f"{prefix}_name")]:
                return row
        return None

    def get_prefix_mapping(self):
        """Standard mapping used for both sync and migration."""
        return [
            {"prefix": "bm", "stage": "1", "label": "BM"},
            {"prefix": "dh", "stage": "2", "label": "DH"},
            {"prefix": "com", "stage": "2", "label": "COM"},
            {"prefix": "rm", "stage": "3", "label": "RM"},
            {"prefix": "rom", "stage": "3", "label": "ROM"},
            {"prefix": "zm", "stage": "4", "label": "ZM"},
            {"prefix": "zom", "stage": "4", "label": "ZOM"},
            {"prefix": "gm", "stage": "5", "label": "GM"},
            {"prefix": "hr", "stage": "6", "label": "HR"},
            {"prefix": "coo", "stage": "8", "label": "COO"},
            {"prefix": "ceo", "stage": "10", "label": "CEO"}
        ]

    def validate_resolution_fields(self):
        """Mandatory fields for query resolution."""
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
        
        # Send Custom Email immediately (New System)
        send_stage_notification(doc, next_row, action="assign")
        return _("Query sent to {0}").format(next_row.stage_name)
    else:
        return _("No more stages to send to.")

def send_stage_notification(doc, stage_row, action="assign"):
    """
    Sends dynamic notification using Email Template.
    action: "assign" (when query is sent to a stage) or "respond" (when a stage responds)
    """
    settings = frappe.get_single("Audit Management Settings")
    template_name = settings.use_new_email_template
    
    if not template_name:
        frappe.msgprint(_("Default Email Template not set in Audit Management Settings."))
        return

    # 1. Determine Recipients
    recipients = []
    if action == "assign":
        recipients = [stage_row.email]
    else:
        # When someone responds, notification goes to the query generator
        recipients = [doc.query_generated_by_mail]

    if not any(recipients):
        return

    # 2. Collect CC Emails
    cc_list = []
    
    # A. Static CC from settings (Action specific)
    static_cc = ""
    if action == "assign":
        static_cc = settings.query_cc_emails
    elif action == "respond":
        static_cc = settings.response_cc_emails
    
    if static_cc:
        try:
            # Render Jinja logic if present in CC fields
            rendered_cc = frappe.render_template(static_cc, {"doc": doc})
            static_emails = [e.strip() for e in rendered_cc.split(",") if e.strip() and "@" in e]
            cc_list.extend(static_emails)
        except Exception:
            # Fallback if rendering fails
            static_emails = [e.strip() for e in static_cc.split(",") if e.strip() and "@" in e]
            cc_list.extend(static_emails)
        
    # B. All users from Audit Stages child table
    for row in doc.audit_stages:
        if row.email and row.email not in recipients:
            cc_list.append(row.email)
            
    # C. Add query generator to CC if it's an assignment mail
    if action == "assign" and doc.query_generated_by_mail:
        if doc.query_generated_by_mail not in recipients:
            cc_list.append(doc.query_generated_by_mail)

    # De-duplicate CC list
    cc_list = list(set(cc_list))

    # 3. Render and Send
    try:
        from frappe.email.doctype.email_template.email_template import get_email_template
        
        # We pass context to the template
        email_data = get_email_template(template_name, {
            "doc": doc,
            "stage": stage_row,
            "action": action
        })

        frappe.sendmail(
            recipients=recipients,
            cc=cc_list,
            subject=email_data.get("subject") or f"Audit Update: {doc.name}",
            message=email_data.get("message"),
            reference_doctype=doc.doctype,
            reference_name=doc.name,
            now=True
        )
        frappe.msgprint(_("Email notification sent to {0}").format(", ".join(recipients)))
        
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Audit Notification Failed"))
        frappe.msgprint(_("Failed to send email notification. Check Error Log."))

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
            
            # Send notification on response
            send_stage_notification(doc, row, action="respond")
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
    now_time = frappe.utils.now()
    pending_audits = frappe.get_all("My Audits", filters={"status": "Pending"}, fields=["name", "query_type"])
    
    for audit in pending_audits:
        doc = frappe.get_doc("My Audits", audit.name)
        if not doc.query_type or not doc.audit_stages:
            continue

        tat_config_doc = frappe.get_cached_doc("Audit Query Type", doc.query_type)
        tat_map = {row.stage: row.tat_days for row in tat_config_doc.tat_config}
        default_tat = tat_config_doc.default_tat_days or 1

        active_rows = [row for row in doc.audit_stages if row.status == "Pending"]
        if not active_rows:
            continue

        current_stage_level = active_rows[0].stage
        exceeded = False
        max_days_found = 0

        for row in active_rows:
            if not row.pending_time:
                continue
            
            days = tat_map.get(row.stage_name, default_tat)
            max_days_found = max(max_days_found, days)
            tat_minutes = days * 24 * 60
            time_diff_minutes = time_diff_in_seconds(now_time, row.pending_time) / 60
            
            if time_diff_minutes >= tat_minutes:
                exceeded = True
                break

        if exceeded:
            doc.tat_day = f"{max_days_found} Day(s) TAT"
            for row in doc.audit_stages:
                if row.stage == current_stage_level and row.status == "Pending":
                    row.status = "No Response"
            
            next_stage_level = str(int(current_stage_level) + 1)
            next_rows = [row for row in doc.audit_stages if row.stage == next_stage_level]
            
            if next_rows:
                stage_names = []
                for n_row in next_rows:
                    n_row.status = "Pending"
                    n_row.pending_time = now_time
                    frappe.share.add(doc.doctype, doc.name, n_row.user_id, read=1, write=1, notify=0)
                    
                    # Send Notification
                    try:
                        send_stage_notification(doc, n_row)
                    except Exception:
                        frappe.log_error(frappe.get_traceback(), _("Escalation Email Failed"))
                    
                    if n_row.stage_name not in stage_names:
                        stage_names.append(n_row.stage_name)
                doc.query_status = f"Pending From {', '.join(stage_names)}"
            else:
                doc.status = "Close"
                doc.query_status = "Completed"
            
            doc.save(ignore_permissions=True)

@frappe.whitelist()
def fetch_employee_data(employee_id):
    employee = frappe.db.get_value("Employee", employee_id, ["employee_name", "designation", "branch", "company_email"], as_dict=True)
    if not employee:
        employee = frappe.db.get_value("Employee", {"user_id": employee_id}, ["employee_name", "designation", "branch", "company_email"], as_dict=True)
    
    if not employee:
        frappe.throw(_("Employee for {0} not found").format(employee_id))
    return employee

def send_escalation_notification(doc, level):
    """Sends email when escalation level changes."""
    subject = f"Audit Escalation [{level}]: {doc.name}"
    message = f"Audit Query {doc.name} has been escalated to {level} due to inactivity ({doc.aging} working days)."
    
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
