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

    def before_insert(self):
        # Step 1: Get logged-in user and fetch their Employee record
        logged_in_user = frappe.session.user

        employee = frappe.db.get_value(
            "Employee",
            {"user_id": logged_in_user},
            ["name", "employee_name", "branch", "company_email",
                "designation", "custom_division"],
            as_dict=True
        )

        if not employee:
            frappe.throw(
                _("No Employee record found for logged-in user: <b>{0}</b>. Please check HR master data.").format(logged_in_user))

        # Step 2: Set emp_division on the document from the Employee's custom_division
        self.emp_division = employee.custom_division

        if not self.emp_division:
            frappe.throw(
                _("Division is not set for Employee: <b>{0}</b>. Please update HR master data.").format(employee.employee_name))

        # Step 3: Validate emp_branch is also filled
        if not self.emp_branch:
            frappe.throw(_("Branch is mandatory to create an Audit Query."))

        # Step 4: Find matching Audit Level using emp_branch AND division
        audit_level_name = frappe.db.get_value(
            "Audit Level",
            {
                "emp_branch": self.emp_branch,
                "division": self.emp_division
            },
            "name"
        )

        if not audit_level_name:
            frappe.throw(_("No active Audit Level found for Branch: <b>{0}</b> and Division: <b>{1}</b>. Please check master data.").format(
                self.emp_branch, self.emp_division))

        # Step 5: Fetch the Audit Level document and populate audit_stages
        audit_level = frappe.get_doc("Audit Level", audit_level_name)
        self.set("audit_stages", [])

        for row in audit_level.audit_stages:
            self.append("audit_stages", {
                "stage": row.stage,
                "stage_name": row.stage_name,
                "employee": row.employee,
                "user_id": row.user_id,
                "employee_name": row.employee_name,
                "email": row.email,
                "status": "Pending"
            })

    def before_save(self):
        # 1. Sync Hardcoded Fields to Child Table (Priority for Legacy updates)
        self.sync_old_to_new()

        # 2. Sync Child Table to Hardcoded Fields (Priority for UI/Reporting)
        self.sync_new_to_old()

        # 3. Disable standard notifications if new system is active
        settings = frappe.get_single("Audit Management Settings")
        if settings.use_new_system:
            self.flags.ignore_notifications = True

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
            row = self.find_matching_row(
                user_id, m["stage"], m["label"], prefix)
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
                frappe.throw(_("Field '{0}' is mandatory for query resolution.").format(
                    self.meta.get_label(field)))


@frappe.whitelist()
def populate_audit_stages(doc):
    """Populates audit_stages from Audit Level. Can be called from client side."""
    if isinstance(doc, str):
        doc = frappe.get_doc("My Audits", doc)
    
    if not doc.emp_branch:
        return

    # Clear existing
    doc.set("audit_stages", [])

    # Fetch Audit Level master
    audit_level_name = frappe.db.get_value("Audit Level", {"emp_branch": doc.emp_branch, "division": doc.emp_division}, "name")
    if not audit_level_name:
        # Fallback if division mapping not found
        audit_level_name = doc.emp_branch

    if frappe.db.exists("Audit Level", audit_level_name):
        audit_level = frappe.get_doc("Audit Level", audit_level_name)
        for row in audit_level.audit_stages:
            doc.append("audit_stages", {
                "stage": row.stage,
                "stage_name": row.stage_name,
                "employee": row.employee,
                "user_id": row.user_id,
                "employee_name": row.employee_name,
                "email": row.email,
                "status": "Pending"
            })
        
        doc.flags.ignore_validate = True
        doc.flags.ignore_mandatory = True
        doc.save(ignore_permissions=True)
        return True
    return False


@frappe.whitelist()
def get_status_tracker_html(docname):
    audit_doc = frappe.get_doc("My Audits", docname)

    def create_status_box(text, color, title):
        return f"<div style='display:inline-block; padding: 2px 6px; border-radius: 10px; border: 2px solid {color}; color: {color}; cursor: pointer;' title='{title}'>{text}</div>"

    html_output = create_status_box(
        "AUDIT TEAM", '#1E6EB2', 'Stage 0 : Audit Query') + " <b>--></b> "

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
        frappe.share.add(doc.doctype, doc.name,
                         next_row.user_id, read=1, write=1, notify=0)

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
        frappe.msgprint(
            _("Default Email Template not set in Audit Management Settings."))
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
            import re
            # Render Jinja logic if present in CC fields
            rendered_cc = frappe.render_template(static_cc, {"doc": doc})
            # Split by comma, space, newline, or semicolon
            static_emails = re.split(r'[,\s\n;]+', rendered_cc)
            static_emails = [e.strip()
                             for e in static_emails if e.strip() and "@" in e]
            cc_list.extend(static_emails)
        except Exception:
            # Fallback if rendering fails
            import re
            static_emails = re.split(r'[,\s\n;]+', static_cc)
            static_emails = [e.strip()
                             for e in static_emails if e.strip() and "@" in e]

    # B. Add users from Audit Stages child table ONLY if NOT using new system
    # (In the new system, we rely purely on dynamic CC fields from settings)
    if not settings.use_new_system:
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
        frappe.msgprint(_("Email notification sent to {0}").format(
            ", ".join(recipients)))

    except Exception as e:
        frappe.log_error(frappe.get_traceback(),
                         _("Audit Notification Failed"))
        frappe.msgprint(
            _("Failed to send email notification. Check Error Log."))


@frappe.whitelist()
def submit_response(docname, response_text, attachment=None):
    doc = frappe.get_doc("My Audits", docname)
    current_user = frappe.session.user.lower()

    found = False

    for i, row in enumerate(doc.audit_stages):
        row_user = (row.user_id or "").lower()
        row_email = (row.email or "").lower()

        # Match by user_id or email
        if row.status == "Pending" and (row_user == current_user or row_email == current_user):
            row.status = "Responded"
            row_user_name = frappe.db.get_value("User", current_user, "full_name") or current_user
            row.response = response_text
            row.attachment = attachment
            row.response_time = now()
            doc.query_status = f"Response From {row.stage_name}"
            found = True

            # Send notification on response
            send_stage_notification(doc, row, action="respond")
            break

    if found:
        settings = frappe.get_single("Audit Management Settings")
        if settings.use_new_system:
            doc.flags.ignore_notifications = True

        doc.save(ignore_permissions=True)
        return _("Response submitted successfully.")
    else:
        frappe.throw(
            _("You are not authorized to respond at this stage or the query is not pending for you."))


@frappe.whitelist()
def check_pending_tat():
    """Scheduled job to check TAT and auto-escalate if exceeded."""
    nowtime = frappe.utils.now_datetime()
    pending_audits = frappe.get_all(
        "My Audits", filters={"status": "Pending"}, fields=["name", "query_type"])

    for audit in pending_audits:
        doc = frappe.get_doc("My Audits", audit.name)
        if not doc.query_type or not doc.get("audit_stages"):
            continue

        # Get TAT Configurations from Audit Query Type
        tat_config_doc = frappe.get_cached_doc(
            "Audit Query Type", doc.query_type)
        tat_map = {
            row.stage: row.tat_days for row in tat_config_doc.tat_config} if getattr(tat_config_doc, "tat_config", None) else {}
        default_tat = getattr(tat_config_doc, "default_tat_days", 1)

        # Find the current pending stage
        active_rows = [
            row for row in doc.get("audit_stages") if row.status == "Pending"]
        if not active_rows:
            continue

        current_row = active_rows[0]
        if not current_row.pending_time:
            continue

        # Calculate days elapsed (using stage_name with underscore)
        tat_days = tat_map.get(current_row.stage_name, default_tat)
        from frappe.utils import time_diff_in_hours
        elapsed_days = time_diff_in_hours(
            nowtime, current_row.pending_time) / 24.0

        if elapsed_days > tat_days:
            # TAT Breached -> Auto Escalate
            current_row.status = "No Response"

            # Find next stage in sequence
            next_row = None
            for idx, r in enumerate(doc.get("audit_stages")):
                if r.name == current_row.name and (idx + 1) < len(doc.get("audit_stages")):
                    next_row = doc.get("audit_stages")[idx + 1]
                    break

            if next_row:
                next_row.status = "Pending"
                next_row.pending_time = frappe.utils.now()
                # Fix: use stage_name (with underscore)
                doc.query_status = f"Pending From {next_row.stage_name}"

                # Notify next person
                if next_row.user_id:
                    frappe.share.add(doc.doctype, doc.name,
                                     next_row.user_id, read=1, write=1, share=1, notify=1)
            else:
                doc.query_status = "Unresolved - Escalation Exhausted"

            doc.save(ignore_permissions=True)


@frappe.whitelist()
def fetch_employee_data(employee_id):
    employee = frappe.db.get_value("Employee", employee_id, [
                                   "employee_name", "designation", "branch", "company_email"], as_dict=True)
    if not employee:
        employee = frappe.db.get_value("Employee", {"user_id": employee_id}, [
                                       "employee_name", "designation", "branch", "company_email"], as_dict=True)

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
    pending_audits = frappe.get_all(
        "My Audits", filters={"status": "Pending"}, fields=["name"])
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


def get_user_allowed_divisions(user):
    user_div = frappe.db.get_value(
        "Employee", {"user_id": user}, "custom_division")
    if not user_div:
        return []

    settings = frappe.get_single("Audit Management Settings")

    # Check if the attribute exists before trying to loop through it!
    if not hasattr(settings, "division_permissions") or not settings.division_permissions:
        # Fallback to just their own division if table is missing/empty
        return [user_div]

    allowed = [
        row.allowed_division for row in settings.division_permissions if row.source_division == user_div]

    # Always include their own division
    if user_div not in allowed:
        allowed.append(user_div)

    return allowed


def get_permission_query_conditions(user=None):
    if not user:
        user = frappe.session.user

    if user == "Administrator" or "System Manager" in frappe.get_roles(user):
        return ""

    user_esc = frappe.db.escape(user)
    allowed_divisions = get_user_allowed_divisions(user)
    
    # Multistate and Retail Banking can see each other if they have either
    cross_access_divisions = ["Multistate", "Retail Banking", "Retail Branch Banking"]
    if any(d in allowed_divisions for d in cross_access_divisions):
        for d in cross_access_divisions:
            if d not in allowed_divisions:
                allowed_divisions.append(d)

    if not allowed_divisions:
        # If no division, only show where they are specifically assigned or owner
        return f"""(`tabMy Audits`.owner = {user_esc} 
                   OR `tabMy Audits`.name IN (SELECT parent FROM `tabAudit Items` WHERE user_id={user_esc} OR email={user_esc}))"""

    divisions_sql = ", ".join([frappe.db.escape(d) for d in allowed_divisions])
    
    # Condition: (Division Match)
    return f"""(`tabMy Audits`.emp_division IN ({divisions_sql}))"""


def has_permission(doc, ptype, user=None):
    if not user:
        user = frappe.session.user

    if user == "Administrator" or "System Manager" in frappe.get_roles(user):
        return True

    # 1. Division Check (Mandatory Segregation)
    user_divisions = get_user_allowed_divisions(user)
    
    # Handle 'create' specifically since emp_division is not yet set
    if ptype == "create":
        if any(role in frappe.get_roles(user) for role in ["Audit Manager", "Audit Member"]):
            return bool(user_divisions)
        return False

    doc_division = doc.get("emp_division")
    
    # Multistate, Retail Banking, and Retail Branch Banking cross-access
    cross_access_divisions = ["Multistate", "Retail Banking", "Retail Branch Banking"]
    if any(d in user_divisions for d in cross_access_divisions):
        user_divisions.extend([d for d in cross_access_divisions if d not in user_divisions])
    
    # If user is JLL, they CANNOT see other divisions unless explicitly assigned in stages
    is_in_correct_division = (doc_division in user_divisions)
    is_assigned = (doc.owner == user or any(row.user_id == user or row.email == user for row in doc.get("audit_stages", [])))

    # Logic: 
    # - If assigned: Can access regardless of division (for cross-dept audits)
    if is_assigned:
        if ptype in ["read", "write"]: return True
    
    if is_in_correct_division:
        # Audit Team can CRUD their own division
        if any(role in frappe.get_roles(user) for role in ["Audit Manager", "Audit Member"]):
            return True
        # Others can only Read/Write if they match division
        if ptype in ["read", "write"]: return True

    return False

@frappe.whitelist()
def raise_request(docname, stagename):
    """Transition from Draft to Pending and assign to the selected starting stage."""
    doc = frappe.get_doc("My Audits", docname)

    if doc.status != "Draft":
        frappe.throw("Only Draft requests can be raised.")

    if not doc.get("audit_stages"):
        frappe.throw(
            "Please add stages in the operational tracking section first.")

    stage_found = False
    assigned_userid = None

    for row in doc.get("audit_stages"):
        if row.stage_name == stagename:
            row.status = "Pending"
            row.pending_time = frappe.utils.now()
            stage_found = True
            assigned_userid = row.user_id
        else:
            row.status = ""

    if not stage_found:
        frappe.throw(f"Stage {stagename} not found in the workflow.")

    doc.status = "Pending"
    doc.query_status = f"Pending From {stagename}"
    doc.save(ignore_permissions=True)

    if assigned_userid:
        frappe.share.add(doc.doctype, doc.name, assigned_userid,
                         read=1, write=1, share=1, notify=1)

    return "Request Raised Successfully!"
