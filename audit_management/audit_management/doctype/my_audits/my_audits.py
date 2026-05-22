# Copyright (c) 2024, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import now, time_diff_in_seconds, time_diff_in_hours, getdate, nowdate
from audit_management.audit_management.utils import get_working_days, update_audit_aging, get_user_allowed_divisions


class MyAudits(Document):
    def validate(self):
        update_audit_aging(self)
        if self.status == "Closed":
            self.validate_resolution_fields()
        
        # Enforce mandatory fields for new records
        if self.is_new():
            for field in ["query_type", "primary_nature", "department_alignment"]:
                if not self.get(field):
                    frappe.throw(_("{0} is mandatory for new records").format(self.meta.get_label(field)))

    # def before_insert(self):
    #     # Only populate the stages child table when the document is first created
    #     if not self.emp_branch or not self.emp_division:
    #         self.set("audit_stages", [])
    #         return

    #     # Find the Audit Level that matches BOTH branch and division
    #     # UPDATE: Changed 'branch' to 'emp_branch' to match your Audit Level Doctype columns
    #     audit_level_name = frappe.db.get_value(
    #         "Audit Level",
    #         {
    #             "emp_branch": self.emp_branch,  # <--- Changed this to emp_branch
    #             "division": self.emp_division
    #         },
    #         "name"
    #     )

    #     if not audit_level_name:
    #         self.set("audit_stages", [])
    #         frappe.throw(_("No active Audit Level found for Branch: <b>{0}</b> and Division: <b>{1}</b>. Please check master data.").format(
    #             self.emp_branch, self.emp_division))

    #     # Fetch the exact Audit Level document
    #     audit_level = frappe.get_doc("Audit Level", audit_level_name)
    #     self.set("audit_stages", [])

    #     # Loop through the master table and push it to the transaction document
    #     for row in audit_level.audit_stages:  # Assuming child table in Audit Level is named 'audit_stages'
    #         self.append("audit_stages", {
    #             "stage": row.stage,
    #             "stage_name": row.stage_name,
    #             "employee": row.employee,
    #             "user_id": row.user_id,
    #             "employee_name": row.employee_name,
    #             "email": row.email,
    #             "status": "Pending"  # Force status to Pending for new stages
    #         })

    # def before_insert(self):
    #     # Step 1: Get logged-in user and fetch their Employee record
    #     logged_in_user = frappe.session.user

    #     employee = frappe.db.get_value(
    #         "Employee",
    #         {"user_id": logged_in_user},
    #         ["name", "employee_name", "branch", "company_email",
    #             "designation", "custom_division"],
    #         as_dict=True
    #     )

    #     if not employee:
    #         frappe.throw(
    #             _("No Employee record found for logged-in user: <b>{0}</b>. Please check HR master data.").format(logged_in_user))

    #     # Step 2: Set emp_division on the document from the Employee's custom_division
    #     self.emp_division = employee.custom_division

    #     if not self.emp_division:
    #         frappe.throw(
    #             _("Division is not set for Employee: <b>{0}</b>. Please update HR master data.").format(employee.employee_name))

    #     # Step 3: Validate emp_branch is also filled
    #     if not self.emp_branch:
    #         frappe.throw(_("Branch is mandatory to create an Audit Query."))

    #     # Step 4: Find matching Audit Level using emp_branch AND division
    #     # audit_level_name = frappe.db.get_value(
    #     #     "Audit Level",
    #     #     {
    #     #         "emp_branch": self.emp_branch,
    #     #         "division": self.emp_division
    #     #     },
    #     #     "name"
    #     # )

    #      # ==========================================================
    #     # THIS IS WHERE IT GOES: Finding the correct Audit Level
    #     # ==========================================================
    #     audit_level_name = frappe.db.get_value(
    #         "Audit Level",
    #         {
    #             "emp_branch": self.emp_branch,
    #             "division": self.emp_division
    #         },
    #         "name"
    #     )

    #     # if not audit_level_name:
    #     #     frappe.throw(_("No active Audit Level found for Branch: <b>{0}</b> and Division: <b>{1}</b>. Please check master data.").format(
    #     #         self.emp_branch, self.emp_division))

    #     if not audit_level_name:
    #         frappe.throw(_("No active Audit Level found for Branch: <b>{0}</b> and Division: <b>{1}</b>. Please check master data.").format(
    #             self.emp_branch, self.emp_division))

    #     # Step 5: Fetch the Audit Level document and populate audit_stages
    #     audit_level = frappe.get_doc("Audit Level", audit_level_name)
    #     self.set("audit_stages", [])

    #     for row in audit_level.audit_stages:
    #         self.append("audit_stages", {
    #             "stage": row.stage,
    #             "stage_name": row.stage_name,
    #             "employee": row.employee,
    #             "user_id": row.user_id,
    #             "employee_name": row.employee_name,
    #             "email": row.email,
    #             "status": "Pending"
    #         })

    def before_insert(self):
        # 1. Force the status to Draft upon creation
        if not self.status:
            self.status = "Draft"
            
        # 2. Get logged-in user and fetch their Employee record
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

        # 3. SET GENERATOR DATA (Essential for 'respond' activity mails)
        self.query_generated_by_empid = employee.name
        self.query_generated_by_name = employee.employee_name
        self.query_generated_by_designation = employee.designation
        self.query_generated_by_branch = employee.branch
        self.query_generated_by_mail = employee.company_email

        # 4. Set emp_division on the document from the Employee's custom_division
        self.emp_division = employee.custom_division

        if not self.emp_division:
            frappe.throw(
                _("Division is not set for Employee: <b>{0}</b>. Please update HR master data.").format(employee.employee_name))

        if not self.emp_branch:
            frappe.throw(_("Branch is mandatory to create an Audit Query."))

        # ==========================================================
        # 5. Fetch the exact Audit Level document directly!
        # ==========================================================
        if not frappe.db.exists("Audit Level", self.emp_branch):
            frappe.throw(
                _("The selected Audit Level <b>{0}</b> does not exist.").format(self.emp_branch))

        audit_level = frappe.get_doc("Audit Level", self.emp_branch)

        # 6. Validate division
        if audit_level.division != self.emp_division:
            frappe.throw(_("Audit Level division mismatch: Expected {0}, found {1}.").format(
                self.emp_division, audit_level.division))

        # 7. Populate audit_stages
        self.set("audit_stages", [])

        for row in audit_level.audit_stages:
            self.append("audit_stages", {
                "stage": row.stage,
                "stage_name": row.stage_name,
                "employee": row.employee,
                "user_id": row.user_id,
                "employee_name": row.employee_name,
                "email": row.email,
                "status": "" # Start as empty, not Pending
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
                if self.status != "Draft" and old_status and row.status != old_status:
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
                self.set(f"{prefix}_mail", row.email)
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
def send_to_all_stages(docname):
    doc = frappe.get_doc("My Audits", docname)
    
    if doc.status != "Draft":
        frappe.throw("Only Draft requests can be sent to all stages.")

    if not doc.get("audit_stages"):
        frappe.throw("No stages found to assign.")

    for row in doc.get("audit_stages"):
        if row.user_id:
            row.status = "Pending"
            row.pending_time = frappe.utils.now()
            
            # Share document
            frappe.share.add(doc.doctype, doc.name, row.user_id, read=1, write=1, share=1, notify=0)
            
            # Send Notification
            send_stage_notification(doc, row, action="assign")
            
    doc.status = "Pending"
    doc.query_status = "Pending From All Stages"
    doc.save(ignore_permissions=True)
    
    return "Query sent to all stages successfully!"

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
        return

    # 1. Determine Recipients
    recipients = []
    if action == "assign":
        if stage_row and stage_row.email:
            recipients = [stage_row.email]
    else:
        # Response goes back to the person who created the query
        if doc.query_generated_by_mail:
            recipients = [doc.query_generated_by_mail]
        else:
            # FALLBACK: If generator email field is empty, use doc owner's email
            owner_email = frappe.db.get_value("User", doc.owner, "email")
            if owner_email:
                recipients = [owner_email]

    if not recipients:
        frappe.log_error(f"Audit Notification Failed: No recipients for {action} on {doc.name}", "Audit Management")
        return

    # 2. Collect CC Emails
    cc_list = []
    static_cc = settings.query_cc_emails if action == "assign" else settings.response_cc_emails

    if static_cc:
        try:
            # Try rendering as Jinja
            rendered_cc = frappe.render_template(static_cc, {"doc": doc})
        except:
            rendered_cc = static_cc
            
        import re
        # Split by comma, space, newline, or semicolon
        emails = re.split(r'[,\s\n;]+', rendered_cc)
        cc_list.extend([e.strip() for e in emails if e.strip() and "@" in e])

    # De-duplicate and remove recipients from CC list
    cc_list = list(set([e for e in cc_list if e and e not in recipients]))

    # 3. Render and Send
    try:
        from frappe.email.doctype.email_template.email_template import get_email_template

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
        # FORCE COMMIT: ensures email is sent immediately
        frappe.db.commit()
        
        frappe.msgprint(_("Email notification sent to {0}").format(", ".join(recipients)))

    except Exception:
        frappe.log_error(frappe.get_traceback(), "Audit Notification Failed")


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
            row.response = response_text
            row.attachment = attachment
            row.response_time = now()
            doc.query_status = f"Response From {row.stage_name}"
            found = True
            updated_row = row
            break

    if found:
        doc.flags.ignore_notifications = True
        doc.save(ignore_permissions=True)
        
        # Trigger notification AFTER successful save
        send_stage_notification(doc, updated_row, action="respond")
        
        return _("Response submitted successfully.")
    else:
        frappe.throw(
            _("You are not authorized to respond at this stage or the query is not pending for you."))


# @frappe.whitelist()
# def check_pending_tat():
#     """
#     Fully dynamic, metadata-driven TAT check and escalation.
#     Uses 'audit_stages' table as source of truth for flow.
#     """
#     now_time = frappe.utils.now()
#     pending_audits = frappe.get_all(
#         "My Audits", filters={"status": "Pending"}, fields=["name", "query_type"])

#     for audit in pending_audits:
#         doc = frappe.get_doc("My Audits", audit.name)
#         if not doc.query_type or not doc.audit_stages:
#             continue

#         tat_config_doc = frappe.get_cached_doc(
#             "Audit Query Type", doc.query_type)
#         tat_map = {row.stage: row.tat_days for row in tat_config_doc.tat_config}
#         default_tat = tat_config_doc.default_tat_days or 1

#         active_rows = [
#             row for row in doc.audit_stages if row.status == "Pending"]
#         if not active_rows:
#             continue

#         current_stage_level = active_rows[0].stage
#         exceeded = False
#         max_days_found = 0

#         for row in active_rows:
#             if not row.pending_time:
#                 continue

#             days = tat_map.get(row.stage_name, default_tat)
#             max_days_found = max(max_days_found, days)
#             tat_minutes = days * 24 * 60
#             time_diff_minutes = time_diff_in_seconds(
#                 now_time, row.pending_time) / 60

#             if time_diff_minutes >= tat_minutes:
#                 exceeded = True
#                 break

#         if exceeded:
#             doc.tat_day = f"{max_days_found} Day(s) TAT"
#             for row in doc.audit_stages:
#                 if row.stage == current_stage_level and row.status == "Pending":
#                     row.status = "No Response"

#             next_stage_level = str(int(current_stage_level) + 1)
#             next_rows = [
#                 row for row in doc.audit_stages if row.stage == next_stage_level]

#             if next_rows:
#                 stage_names = []
#                 for n_row in next_rows:
#                     n_row.status = "Pending"
#                     n_row.pending_time = now_time
#                     frappe.share.add(doc.doctype, doc.name,
#                                      n_row.user_id, read=1, write=1, notify=0)

#                     # Send Notification
#                     try:
#                         send_stage_notification(doc, n_row)
#                     except Exception:
#                         frappe.log_error(frappe.get_traceback(), _(
#                             "Escalation Email Failed"))

#                     if n_row.stage_name not in stage_names:
#                         stage_names.append(n_row.stage_name)
#                 doc.query_status = f"Pending From {', '.join(stage_names)}"
#             else:
#                 doc.status = "Closed"
#                 doc.query_status = "Completed"

#             doc.save(ignore_permissions=True)


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


# def get_permission_query_conditions(user=None):
#     if not user:
#         user = frappe.session.user

#     roles = frappe.get_roles(user)
#     if "Administrator" in roles or "System Manager" in roles:
#         return ""

#     allowed_divisions = get_user_allowed_divisions(user)
#     if not allowed_divisions:
#         return "1=0"

#     divisions_sql = ",".join([frappe.db.escape(d) for d in allowed_divisions])

#     # NEW LOGIC: Check if user is part of the core Audit Team
#     is_audit_team = "Audit Manager" in roles or "Audit Member" in roles

#     if is_audit_team:
#         # Audit team sees everything in their allowed divisions, including Drafts
#         return f"`tabMy Audits`.emp_division IN ({divisions_sql})"
#     else:
#         # Stage members (Branch users) ONLY see records if status is NOT Draft
#         return f"(`tabMy Audits`.status != 'Draft' AND `tabMy Audits`.emp_division IN ({divisions_sql}))"


# def has_permission(doc, ptype, user=None):
#     if not user:
#         user = frappe.session.user

#     roles = frappe.get_roles(user)
#     if "Administrator" in roles or "System Manager" in roles:
#         return True

#     is_audit_team = "Audit Manager" in roles or "Audit Member" in roles

#     # 1. First, check if the action is merely initializing the 'create' form
#     if ptype == "create":
#         # If they are an Audit Team member, they are globally allowed to click 'Add My Audits'
#         if is_audit_team:
#             return True
#         # If they are not Audit team, verify they have at least one allowed division
#         allowed_divisions = get_user_allowed_divisions(user)
#         return bool(allowed_divisions)

#     # 2. Block direct URL access to Drafts for non-audit team members (unless they created it)
#     if getattr(doc, "status", None) == "Draft" and not is_audit_team and doc.owner != user:
#         return False

#     # 3. Check division permissions for read/write/submit
#     allowed_divisions = get_user_allowed_divisions(user)
#     if not allowed_divisions:
#         return False

#     # Use doc.get("emp_division") to match the Python document object fieldname
#     doc_division = doc.get("emp_division")

#     # If the document hasn't been saved yet (no division set), and they passed the 'create' check, allow them to continue filling out the form
#     if not doc_division and doc.is_new():
#         return True

#     return doc_division in allowed_divisions


def get_user_allowed_sol_ids(user):
    """Fetches allowed SOL IDs from 'Report Preference' for a given user."""
    # First, try to get the record name. Report Preference uses field:user for naming.
    # We also check if it's enabled.
    pref_name = frappe.db.get_value("Report Preference", {"user": user, "enabled": 1}, "name")
    
    if not pref_name:
        # Fallback: check if a record exists with the user's ID as name directly
        if frappe.db.exists("Report Preference", user):
            pref_name = user
            # Still check if enabled
            if not frappe.db.get_value("Report Preference", pref_name, "enabled"):
                return []
        else:
            return []

    try:
        doc = frappe.get_doc("Report Preference", pref_name)
        sol_ids = []
        
        # The child table for SOL IDs is stored in the field 'sol_id'
        if doc.get("sol_id"):
            for row in doc.sol_id:
                # In Table MultiSelect, the value is usually in a field named after the target DocType or parent field
                # We check common variations: 'sol_id' (parent field) or 'sahayog_branch' (DocType name)
                # Or 'sol_items' if it follows child doctype name convention
                val = row.get("sol_id") or row.get("sahayog_branch") or row.get("sol_items")
                if val:
                    sol_ids.append(str(val))
                    
        return list(set(sol_ids))
    except Exception:
        return []

def has_permission(doc, ptype, user=None):
    if not user:
        user = frappe.session.user

    roles = frappe.get_roles(user)
    is_audit_manager = "Audit Manager" in roles or "Administrator" in roles or "System Manager" in roles
    
    # 1. Audit Manager / Admin can ALWAYS see and edit
    if is_audit_manager:
        return True

    # Handle DocType level permission check (when doc is a string)
    if isinstance(doc, str):
        # Allow report and read access at doctype level for Audit Members and Employees
        if ptype in ["read", "report"]:
            return "Audit Member" in roles or "Employee" in roles or bool(get_user_allowed_sol_ids(user))
        return True
    
    # 3. Draft Isolation: Only Creator/Manager
    if getattr(doc, "status", None) == "Draft":
        return doc.owner == user or is_audit_manager
    
    # NEW: Sol ID Check (Report Preference)
    allowed_sol_ids = get_user_allowed_sol_ids(user)
    if allowed_sol_ids and doc.get("emp_branch"):
        # Check if the doc's branch (Audit Level) links to an allowed Sahayog Branch (SOL ID)
        branch_sol_id = frappe.db.get_value("Audit Level", doc.emp_branch, "sahayog_branch")
        if branch_sol_id and str(branch_sol_id) in [str(s) for s in allowed_sol_ids]:
            return True

    # 2. Division Check (Essential for data sovereignty)
    allowed_divisions = get_user_allowed_divisions(user)
    doc_division = doc.get("emp_division")
    
    # If division doesn't match and it's not a bypass case, deny
    if doc_division and doc_division not in allowed_divisions:
        # Bypass for users who are currently pending (even if from another division)
        is_pending = False
        for row in (doc.get("audit_stages") or []):
            if row.status == "Pending" and (row.user_id == user or row.email == user):
                is_pending = True
                break
        if not is_pending:
            return False

   

    # 4. Access for Audit Members (Non-Managers)
   # Audit Member: only if NOT draft OR owner
    if "Audit Member" in roles:
        return doc.owner == user

    # 5. Access for Others (Owner or Current Assignee)
    if doc.owner == user:
        return True

   # ✅ Current Pending User
    for row in (doc.get("audit_stages") or []):
        if row.status == "Pending" and (row.user_id == user or row.email == user):
            return True

    # ✅ NEW: Allow users who already responded (history access)
    for row in (doc.get("audit_stages") or []):
        if row.status == "Responded" and (row.user_id == user or row.email == user):
            return True


def get_permission_query_conditions(user=None):
    if not user:
        user = frappe.session.user

    roles = frappe.get_roles(user)

    # =========================================================
    # ADMIN BYPASS
    # =========================================================
    if "Administrator" in roles or "System Manager" in roles:
        return ""

    # =========================================================
    # DIVISION ACCESS
    # =========================================================
    allowed_divisions = get_user_allowed_divisions(user)

    divisions_sql = ", ".join(
        [frappe.db.escape(d) for d in allowed_divisions]
    ) if allowed_divisions else "'None'"

    # =========================================================
    # AUDIT MANAGER
    # Full division access
    # =========================================================
    if "Audit Manager" in roles:
        return f"""
            `tabMy Audits`.emp_division IN ({divisions_sql})
        """

    # =========================================================
    # AUDIT MEMBER
    # Only created records
    # =========================================================
    if "Audit Member" in roles:
        return f"""
            `tabMy Audits`.owner = '{user}'
        """

    # =========================================================
    # SOL ID ACCESS
    # =========================================================
    allowed_sol_ids = get_user_allowed_sol_ids(user)

    sol_condition = "1=0"

    if allowed_sol_ids:
        sol_ids_sql = ", ".join(
            [frappe.db.escape(str(s)) for s in allowed_sol_ids]
        )

        sol_condition = f"""
            (
                `tabMy Audits`.status != 'Draft'
                AND
                `tabMy Audits`.emp_branch IN (
                    SELECT name
                    FROM `tabAudit Level`
                    WHERE sahayog_branch IN ({sol_ids_sql})
                )
            )
        """
    # =========================================================
    # STAGE ACCESS
    # =========================================================
    pending_condition = f"""
        EXISTS (
            SELECT name
            FROM `tabAudit Items`
            WHERE parent = `tabMy Audits`.name
            AND status = 'Pending'
            AND (
                user_id = '{user}'
                OR email = '{user}'
            )
        )
    """

    responded_condition = f"""
        EXISTS (
            SELECT name
            FROM `tabAudit Items`
            WHERE parent = `tabMy Audits`.name
            AND status = 'Responded'
            AND (
                user_id = '{user}'
                OR email = '{user}'
            )
        )
    """

    # =========================================================
    # FINAL CONDITIONS
    # =========================================================
    return f"""
        (

            -- Draft only owner
            (
                `tabMy Audits`.status = 'Draft'
                AND `tabMy Audits`.owner = '{user}'
            )

            OR

            -- SOL ID based access
            (
                {sol_condition}
            )

            OR

            -- Pending stage access
            (
                `tabMy Audits`.status != 'Draft'
                AND (
                    {pending_condition}
                    OR
                    {responded_condition}
                )
            )

            OR

            -- Owner access
            (
                `tabMy Audits`.owner = '{user}'
            )

        )
    """

from frappe.utils import now, time_diff_in_seconds, time_diff_in_hours, getdate, nowdate, format_datetime

from frappe.utils import now, time_diff_in_seconds, time_diff_in_hours, getdate, nowdate, format_datetime
import json

@frappe.whitelist()
def get_audit_history_summary(docname):
    doc = frappe.get_doc("My Audits", docname)
    
    def get_full_name(user_id):
        if not user_id: return ""
        if user_id == "System/Audit Team": return "System/Audit Team"
        return frappe.db.get_value("User", user_id, "full_name") or user_id

    history = []
    
    # 1. Capture Creation
    history.append({
        "event": "Query Created",
        "user": doc.query_generated_by_name or get_full_name(doc.owner),
        "date": format_datetime(doc.creation, "dd-MM-yyyy hh:mm a"),
        "status": "Created",
        "timestamp": doc.creation
    })
    
    # 2. Capture Stage Assignments and Responses from child table
    creator_name = doc.query_generated_by_name or get_full_name(doc.owner)
    for row in doc.audit_stages:
        if row.status or row.pending_time:
            history.append({
                "event": f"Assigned to {row.stage_name} ({row.employee_name})",
                "user": creator_name,
                "date": format_datetime(row.pending_time, "dd-MM-yyyy hh:mm a") if row.pending_time else "",
                "status": "Pending",
                "timestamp": row.pending_time if row.pending_time else doc.creation
            })
            if row.status == "Responded":
                history.append({
                    "event": f"Response from {row.stage_name}",
                    "user": row.employee_name,
                    "date": format_datetime(row.response_time, "dd-MM-yyyy hh:mm a") if row.response_time else "",
                    "status": "Responded",
                    "timestamp": row.response_time if row.response_time else doc.creation
                })

    # 3. Capture status transitions (Closed/Reopened) from Version history
    versions = frappe.get_all(
        "Version",
        filters={"ref_doctype": "My Audits", "docname": docname},
        fields=["data", "owner", "creation"],
        order_by="creation asc"
    )

    for version in versions:
        try:
            version_data = json.loads(version.data)
            # Some versions contain a list of changed fields in 'changed' key
            changed_fields = version_data.get("changed", [])
            
            for field in changed_fields:
                # field is usually a list: [fieldname, old_value, new_value]
                if len(field) == 3 and field[0] == "status":
                    old_val = field[1]
                    new_val = field[2]
                    
                    if new_val == "Closed":
                        history.append({
                            "event": "Query Closed",
                            "user": get_full_name(version.owner),
                            "date": format_datetime(version.creation, "dd-MM-yyyy hh:mm a"),
                            "status": "Closed",
                            "timestamp": version.creation
                        })
                    elif old_val == "Closed" and new_val != "Closed":
                        history.append({
                            "event": "Query Reopened",
                            "user": get_full_name(version.owner),
                            "date": format_datetime(version.creation, "dd-MM-yyyy hh:mm a"),
                            "status": "Reopened",
                            "timestamp": version.creation
                        })
        except Exception:
            pass

    # Sort history by timestamp
    history.sort(key=lambda x: x["timestamp"])
        
    return history



@frappe.whitelist()
def raise_multi_request(docname, stagenames):
    """Transition from Draft to Pending and assign to multiple selected stages."""
    if isinstance(stagenames, str):
        import json
        stagenames = json.loads(stagenames)
    
    doc = frappe.get_doc("My Audits", docname)

    if doc.status != "Draft":
        frappe.throw("Only Draft requests can be raised.")

    if not doc.get("audit_stages"):
        frappe.throw(
            "Please add stages in the operational tracking section first.")

    selected_rows = []
    found_stagenames = []

    for row in doc.get("audit_stages"):
        if row.stage_name in stagenames:
            row.status = "Pending"
            row.pending_time = frappe.utils.now()
            selected_rows.append(row)
            found_stagenames.append(row.stage_name)
            
            # Give access to the assigned member
            if row.user_id:
                frappe.share.add(doc.doctype, doc.name, row.user_id,
                                 read=1, write=1, share=1, notify=0)
        else:
            # We clear others if they were previously pending? 
            # Actually, if it was Draft, they should be empty anyway.
            # But just in case, we keep the original logic of clearing others if not in selection.
            if not row.status or row.status == "Pending":
                row.status = ""

    if not selected_rows:
        frappe.throw("No valid stages selected from the selection.")

    doc.status = "Pending"
    if len(stagenames) == len(doc.audit_stages):
        doc.query_status = "Pending From All Stages"
    else:
        doc.query_status = f"Pending From {', '.join(found_stagenames)}"
        
    doc.save(ignore_permissions=True)

    # Trigger custom notifications for each selected stage
    for row in selected_rows:
        send_stage_notification(doc, row, action="assign")

    return "Requests Raised Successfully!"


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
        # Fix: use stage_name and user_id (with underscores)
        if row.stage_name == stagename:
            row.status = "Pending"
            row.pending_time = frappe.utils.now()
            stage_found = True
            assigned_userid = row.user_id
        else:
            row.status = ""  # Clear others

    if not stage_found:
        frappe.throw(f"Stage {stagename} not found in the workflow.")

    doc.status = "Pending"
    doc.query_status = f"Pending From {stagename}"
    doc.save(ignore_permissions=True)

    # Give access and notify the assigned member
    if assigned_userid:
        # notify=0 prevents the redundant background queue email
        frappe.share.add(doc.doctype, doc.name, assigned_userid,
                         read=1, write=1, share=1, notify=0)
        
        # Trigger immediate custom notification
        target_row = None
        for row in doc.audit_stages:
            if row.status == "Pending":
                target_row = row
                break
        
        if target_row:
            send_stage_notification(doc, target_row, action="assign")

    return "Request Raised Successfully!"


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
                                     next_row.user_id, read=1, write=1, notify=1)
            else:
                doc.query_status = "Unresolved - Escalation Exhausted"

            doc.save(ignore_permissions=True)
