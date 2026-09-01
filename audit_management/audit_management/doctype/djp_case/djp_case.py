# Copyright (c) 2026, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import now_datetime, add_days, getdate

def is_djp_module_enabled():
    """Check if DJP module is enabled in Audit Management Settings"""
    val = frappe.db.get_single_value("Audit Management Settings", "enable_djp_module")
    return val if val is not None else 1

def boot_session(bootinfo):
    """Filter out DJP DocTypes from bootinfo when DJP module is disabled for non-Administrator users"""
    user = frappe.session.user
    if user != "Administrator" and not is_djp_module_enabled():
        djp_doctypes = {"DJP Case", "DJP Stage", "DJP Stage Assignment", "DJP Additional Accused"}
        if hasattr(bootinfo, "user") and isinstance(bootinfo.user, dict):
            for key in ["can_read", "can_create", "can_write", "can_search", "can_get_doctypes", "single_doctypes"]:
                if key in bootinfo.user and isinstance(bootinfo.user[key], (list, set, tuple)):
                    bootinfo.user[key] = [dt for dt in bootinfo.user[key] if dt not in djp_doctypes]

# DJP Case Document Class
class DJPCase(Document):
    def autoname(self):
        """Generate custom nomenclature: DJP-{Branch}-{Year}-{Number} (e.g. DJP-MUM-2026-00001)"""
        branch = (self.emp_branch or "GEN").strip().upper()
        branch_code = "".join(e for e in branch if e.isalnum()) or "GEN"
        year = now_datetime().strftime("%Y")
        prefix = f"DJP-{branch_code}-{year}-"
        self.name = frappe.model.naming.make_autoname(f"{prefix}.#####")

    # Validation to prevent attachment removal by stage users and check module status
    def validate(self):
        user = frappe.session.user
        if user != "Administrator" and not is_djp_module_enabled():
            frappe.throw(_("DJP Module is currently disabled in Audit Management Settings."))
        self.validate_attachment_removal()


    #self.validate_final_decision_justification()
    def validate_attachment_removal(self):
        if self.is_new():
            return
        
        user = frappe.session.user
        is_admin_or_creator = (
            user == self.owner or 
            "System Manager" in frappe.get_roles(user) or 
            "Administrator" in frappe.get_roles(user) or 
            "Audit Manager" in frappe.get_roles(user) or 
            user == "Administrator"
        )
        if is_admin_or_creator:
            return

        old_doc = self.get_doc_before_save()
        if not old_doc:
            return

        if old_doc.case_attachment and not self.case_attachment:
            frappe.throw(frappe._("Stage users cannot remove attachments. Only Case Creator or Audit Managers can delete attachments."))

# Dynamically fetches valid Severity and Occurrence options from CMG Grid settings
@frappe.whitelist()
def get_cmg_options(misconduct_type=None, severity=None):
    """Fetch allowed severity and occurrence options from CMG Grid in Audit Management Settings"""
    settings = frappe.get_single("Audit Management Settings")
    grid = settings.get("cmg_grid", [])

    severities = set()
    occurrences = set()

    for row in grid:
        is_active = getattr(row, "is_active", 1)
        if is_active in [0, False]:
            continue

        if misconduct_type and row.misconduct_type == misconduct_type:
            if row.severity:
                severities.add(row.severity)
            if severity and row.severity == severity:
                if row.occurrence:
                    occurrences.add(row.occurrence)

    return {
        "severities": sorted(list(severities)),
        "occurrences": sorted(list(occurrences))
    }

# Fetches auto-populated CMG Code and Recommended Outcome based on Misconduct, Severity & Occurrence
@frappe.whitelist()
def get_cmg_mapping(misconduct_type, severity, occurrence):
    """Fetch CMG mapping from Audit Management Settings"""
    settings = frappe.get_single("Audit Management Settings")

    for row in settings.get("cmg_grid", []):
        is_active = getattr(row, "is_active", 1)
        if is_active in [0, False]:
            continue

        if row.misconduct_type == misconduct_type and row.severity == severity:
            if row.occurrence == occurrence or row.occurrence == "Any" or occurrence == "Any":
                return {
                    "cmg_code": row.cmg_code,
                    "cmg_recommended_outcome": row.cmg_recommended_outcome
                }

    return None

# Calculates and returns DJP Stage rows for auto-population based on CMG Code and Branch
@frappe.whitelist()
def fetch_auto_djp_stages(cmg_code, emp_branch=None, created_on=None, accused_employee=None):
    """Return DJP stage rows for UI auto-population"""
    if not cmg_code:
        return []

    dc_levels = get_dc_levels_for_cmg(cmg_code)
    settings = frappe.get_single("Audit Management Settings")
    dc_structure = settings.get("disciplinary_committee", [])

    base_time = getdate(created_on) if created_on else getdate(now_datetime())
    total_tat = get_total_tat_for_cmg(cmg_code)
    total_stages = len(dc_levels)

    stage_rows = []
    stage_sequence = 1

    for dc_level in dc_levels:
        committee = next((c for c in dc_structure if c.dc_level == dc_level and getattr(c, 'is_active', 1)), None)

        stage_doc = frappe.db.get_value("DJP Stage",
            {"dc_level": dc_level, "is_active": 1},
            ["name"], order_by="sequence asc")

        if total_stages == 1:
            stage_days = total_tat
        elif stage_sequence == 1:
            stage_days = max(1, int(total_tat * 0.4))
        else:
            rem_days = total_tat - max(1, int(total_tat * 0.4))
            stage_days = max(1, int(rem_days / (total_stages - 1)))

        tat_deadline = str(add_days(base_time, stage_days))

        emp_info = get_committee_employee(dc_level, emp_branch, committee, accused_employee) if committee else None

        stage_rows.append({
            "stage": stage_sequence,
            "stage_name": stage_doc or dc_level,
            "dc_level": dc_level,
            "employee": emp_info.name if emp_info else "",
            "user_id": emp_info.user_id if emp_info else "",
            "employee_name": emp_info.employee_name if emp_info else "",
            "designation": emp_info.designation if emp_info else "",
            "email": (emp_info.company_email or emp_info.prefered_email) if emp_info else "",
            "status": "Not Sent",
            "tat_deadline": tat_deadline
        })
        stage_sequence += 1

    return stage_rows

# Return max TAT days based on BRD rules for CMG Code
def get_total_tat_for_cmg(cmg_code):
    """Return max TAT days based on BRD rules"""
    tat_map = {
        "C0": 7,
        "C1": 7,
        "C2": 15,
        "C3": 15,
        "C4": 15,
        "C5": 45
    }
    return tat_map.get(cmg_code, 15)

# Populate stage reviewers from backend
@frappe.whitelist()
def populate_djp_stages(docname, cmg_code, emp_branch):
    """Populate DJP Case stages based on CMG Code and branch"""
    doc = frappe.get_doc("DJP Case", docname)

    if not cmg_code:
        frappe.throw(_("CMG Code is required to populate stages"))

    # Clear existing stages to allow re-populating/editing
    doc.set("djp_case_stages", [])

    dc_levels = get_dc_levels_for_cmg(cmg_code)

    settings = frappe.get_single("Audit Management Settings")
    dc_structure = settings.get("disciplinary_committee", [])

    stage_sequence = 1
    for dc_level in dc_levels:
        committee = next((c for c in dc_structure if c.dc_level == dc_level and getattr(c, 'is_active', 1)), None)
        if not committee:
            continue

        stage_doc = frappe.db.get_value("DJP Stage",
            {"dc_level": dc_level, "is_active": 1},
            ["name"], order_by="sequence asc")

        if not stage_doc:
            continue

        stage_tat = get_stage_tat(cmg_code, stage_sequence, len(dc_levels))
        tat_deadline = add_days(doc.created_on or now_datetime(), stage_tat)

        emp_info = get_committee_employee(dc_level, emp_branch or doc.emp_branch, committee, doc.employee)

        doc.append("djp_case_stages", {
            "stage": stage_sequence,
            "stage_name": stage_doc,
            "dc_level": dc_level,
            "employee": emp_info.name if emp_info else "",
            "user_id": emp_info.user_id if emp_info else "",
            "employee_name": emp_info.employee_name if emp_info else "",
            "designation": emp_info.designation if emp_info else "",
            "email": (emp_info.company_email or emp_info.prefered_email) if emp_info else "",
            "status": "Not Sent",
            "pending_time": None,
            "tat_deadline": tat_deadline
        })
        stage_sequence += 1

    doc.current_stage = 1
    doc.current_dc_level = dc_levels[0] if dc_levels else ""
    doc.status = "Draft"
    doc.flags.ignore_mandatory = True
    doc.save(ignore_permissions=True)

    return {"success": True}

# Return list of DC levels based on CMG Code
def get_dc_levels_for_cmg(cmg_code):
    """Return list of DC levels based on CMG Code"""
    if cmg_code in ["C0", "C1", "C2"]:
        return ["Zonal DC"]
    elif cmg_code in ["C3", "C4"]:
        return ["Zonal DC", "National DC"]
    elif cmg_code == "C5":
        return ["Zonal DC", "National DC", "Management Centre Core Committee"]
    return ["Zonal DC"]

# Get employee for committee level and branch, excluding accused employee
def get_committee_employee(dc_level, emp_branch, committee, accused_employee=None):
    """Get employee for committee level and branch, excluding accused employee"""
    roles = [r.strip() for r in committee.member_roles.split(",")] if hasattr(committee, 'member_roles') and committee.member_roles else []

    base_filters = {"branch": emp_branch, "status": "Active"}
    if accused_employee:
        base_filters["name"] = ["!=", accused_employee]

    for role in roles:
        role_filters = {**base_filters, "designation": ["like", f"%{role}%"]}
        employees = frappe.get_all("Employee",
            filters=role_filters,
            fields=["name", "employee_name", "designation", "user_id", "company_email", "prefered_email"],
            limit=1)
        if employees:
            return employees[0]

    fallback_filters = {**base_filters, "user_id": ["!=", ""]}
    employees = frappe.get_all("Employee",
        filters=fallback_filters,
        fields=["name", "employee_name", "designation", "user_id", "company_email", "prefered_email"],
        limit=1)
    return employees[0] if employees else None

# Calculate TAT for a specific stage based on CMG Code and stage number
def get_stage_tat(cmg_code, stage_num, total_stages):
    """Return full TAT for all stages without distributing"""
    return {"C0": 7, "C1": 7, "C2": 15, "C3": 15, "C4": 15, "C5": 45}.get(cmg_code, 15)

# Send notification to current stage reviewer and update stage status
@frappe.whitelist()
def send_to_current_stage(docname):
    """Send notification to current stage reviewer and update stage status"""
    doc = frappe.get_doc("DJP Case", docname)

    if doc.current_stage > len(doc.djp_case_stages):
        frappe.throw(_("No more stages to send"))

    current_stage_row = doc.djp_case_stages[doc.current_stage - 1]

    if current_stage_row.status not in ["Pending", "Draft"]:
        frappe.throw(_("Current stage is already sent or processed"))

    current_stage_row.status = "Sent"
    current_stage_row.pending_time = now_datetime()
    doc.status = "Under Review"
    doc.save()

    send_stage_notification(doc, current_stage_row, "assign")

    return {"success": True}

# Send notification and assign ToDo to ALL stage reviewers simultaneously with the same TAT
@frappe.whitelist()
def send_to_all_reviewers(docname):
    """Send notification and assign ToDo to ALL stage reviewers simultaneously with the same TAT"""
    doc = frappe.get_doc("DJP Case", docname)

    if not doc.djp_case_stages:
        frappe.throw(_("No stages to send"))

    now_dt = now_datetime()
    today_date = getdate(now_dt)
    
    total_tat_days = get_stage_tat(doc.cmg_code, 1, 1)
    tat_deadline_str = str(add_days(today_date, total_tat_days))
    
    from frappe.desk.form.assign_to import add as add_assignment

    for row in doc.djp_case_stages:
        if not row.employee:
            continue

        row.status = "Pending"
        row.pending_time = now_dt
        row.tat_deadline = tat_deadline_str

        if row.user_id:
            try:
                frappe.share.add("DJP Case", doc.name, row.user_id, read=1, write=1, share=0)
            except Exception:
                pass

            existing_todos = frappe.get_all("ToDo", filters={
                "reference_type": "DJP Case",
                "reference_name": doc.name,
                "allocated_to": row.user_id,
                "status": "Open"
            })
            for todo in existing_todos:
                frappe.db.set_value("ToDo", todo.name, "status", "Closed")

            try:
                add_assignment({
                    "assign_to": [row.user_id],
                    "doctype": "DJP Case",
                    "name": doc.name,
                    "description": f"DJP Case Review assigned for {doc.employee_name or doc.employee} ({row.dc_level or row.stage_name})",
                    "date": tat_deadline_str
                })
            except Exception as e:
                frappe.log_error(f"DJP Case assignment failed: {e}")

        send_stage_notification(doc, row, "assign")

    doc.tat_deadline = tat_deadline_str
    doc.status = "Under Review"
    doc.current_stage = 1  # Not really relevant sequentially anymore, but keep it at 1
    doc.save()

    return {"success": True, "message": _("Case successfully sent to all reviewers with TAT of {0} days").format(total_tat_days)}

# Submit response for active stage reviewer
@frappe.whitelist()
def submit_stage_response(docname, response, attachment=None):
    """Submit response for active stage reviewer"""
    doc = frappe.get_doc("DJP Case", docname)

    if doc.status in ["Closed", "Cessation"]:
        frappe.throw(_("Case is already closed"))

    if doc.current_stage < 1 or doc.current_stage > len(doc.djp_case_stages):
        frappe.throw(_("Invalid current stage"))

    current_row = doc.djp_case_stages[doc.current_stage - 1]

    current_row.response = response
    if attachment:
        # Force uploaded file to be public (is_private = 0) for seamless access
        file_name = frappe.db.get_value("File", {"file_url": attachment}, "name")
        if not file_name and attachment.startswith("/private/"):
            pub_url = attachment.replace("/private/", "/")
            file_name = frappe.db.get_value("File", {"file_url": pub_url}, "name")

        if file_name:
            file_doc = frappe.get_doc("File", file_name)
            if file_doc.is_private:
                file_doc.is_private = 0
                file_doc.save(ignore_permissions=True)
                attachment = file_doc.file_url

        current_row.attachment = attachment

    current_row.status = "Responded"
    current_row.response_time = now_datetime()

    doc.save()

    reviewer_name = current_row.employee_name or current_row.employee
    dc_title = current_row.dc_level or current_row.stage_name
    return {"success": True, "message": _("Response successfully submitted by {0} ({1})").format(reviewer_name, dc_title)}

# Send back the case to the creator for clarification or further action
@frappe.whitelist()
def send_back_case(docname, remark):
    """Send back the case to the creator for clarification or further action"""
    doc = frappe.get_doc("DJP Case", docname)

    if doc.status in ["Closed", "Cessation"]:
        frappe.throw(_("Case is already closed"))

    if doc.current_stage < 1 or doc.current_stage > len(doc.djp_case_stages):
        frappe.throw(_("Invalid current stage"))

    current_row = doc.djp_case_stages[doc.current_stage - 1]

    # Save the remark and mark the stage as Sent Back
    current_row.response = f"Sent Back Remark: {remark}"
    current_row.status = "Sent Back"
    current_row.response_time = now_datetime()

    # Revert main document to Draft so creator can edit
    doc.status = "Draft"
    doc.save()

    # Close existing open ToDo for this stage reviewer
    existing_todos = frappe.get_all("ToDo", filters={
        "reference_type": "DJP Case",
        "reference_name": doc.name,
        "allocated_to": current_row.user_id,
        "status": "Open"
    })
    for todo in existing_todos:
        frappe.db.set_value("ToDo", todo.name, "status", "Closed")

    reviewer_name = current_row.employee_name or current_row.employee
    dc_title = current_row.dc_level or current_row.stage_name
    return {"success": True, "message": _("Case sent back to creator by {0} ({1})").format(reviewer_name, dc_title)}

# Fetch DJP cases accessible by user for interactive dashboard table filtering
@frappe.whitelist()
def get_user_djp_cases(filter_type=None):
    """Fetch DJP cases accessible by user for interactive dashboard table filtering"""
    if not is_djp_module_enabled():
        return []

    user = frappe.session.user
    if not user or user == "Guest":
        return []

    is_admin_or_manager = user == "Administrator" or \
                          "System Manager" in frappe.get_roles(user) or \
                          "Audit Manager" in frappe.get_roles(user)

    if is_admin_or_manager:
        filters = {}
    else:
        shared_names = frappe.share.get_shared("DJP Case", user) or []
        stage_cases = frappe.get_all("DJP Case Stage", filters={"user_id": user}, pluck="parent") or []
        user_cases = frappe.get_all("DJP Case", filters={"owner": user}, pluck="name") or []
        all_allowed = list(set(shared_names + stage_cases + user_cases))
        if not all_allowed:
            return []
        filters = {"name": ["in", all_allowed]}

    cases = frappe.get_all("DJP Case",
        filters=filters,
        fields=["name", "employee", "employee_name", "designation", "emp_branch",
                "misconduct_type", "severity", "cmg_code", "cmg_recommended_outcome",
                "status", "current_stage", "current_dc_level", "tat_deadline", "creation"],
        order_by="creation desc")

    for c in cases:
        # Check user specific stage status
        stg_status = frappe.db.get_value("DJP Case Stage", {"parent": c.name, "user_id": user}, "status")
        c["user_stage_status"] = stg_status or "Not Sent"

    return cases

# Fetch DJP dashboard analytics for Case Creators, Admins & Stage Reviewers
@frappe.whitelist()
def get_djp_dashboard_data():
    """Return dashboard analytics for DJP Cases tailored for Case Creators, Admins & Stage Reviewers"""
    if not is_djp_module_enabled():
        return {"enabled": False, "total_count": 0, "draft_count": 0, "under_review_count": 0, "closed_count": 0}

    user = frappe.session.user
    if not user or user == "Guest":
        return {}

    user_roles = frappe.get_roles(user)
    is_admin_or_manager = user == "Administrator" or \
                          "System Manager" in user_roles or \
                          "Audit Manager" in user_roles or \
                          "Audit Member" in user_roles

    role_type = "manager" if is_admin_or_manager else "stage_user"

    if is_admin_or_manager:
        base_filters = {}
    else:
        shared_names = frappe.share.get_shared("DJP Case", user) or []
        stage_cases = frappe.get_all("DJP Case Stage", filters={"user_id": user}, pluck="parent") or []
        user_cases = frappe.get_all("DJP Case", filters={"owner": user}, pluck="name") or []
        all_allowed = list(set(shared_names + stage_cases + user_cases))
        base_filters = {"name": ["in", all_allowed]} if all_allowed else {"name": "NONE"}

    total_count = frappe.db.count("DJP Case", base_filters)
    draft_count = frappe.db.count("DJP Case", {**base_filters, "status": "Draft"})
    under_review_count = frappe.db.count("DJP Case", {**base_filters, "status": "Under Review"})
    closed_count = frappe.db.count("DJP Case", {**base_filters, "status": ["in", ["Closed", "Cessation"]]})

    pending_for_me_count = frappe.db.sql(
        "SELECT COUNT(DISTINCT parent) FROM `tabDJP Case Stage` WHERE user_id = %s AND status = 'Pending'", (user,)
    )[0][0]

    responded_by_me_count = frappe.db.sql(
        "SELECT COUNT(DISTINCT parent) FROM `tabDJP Case Stage` WHERE user_id = %s AND status = 'Responded'", (user,)
    )[0][0]

    no_response_by_me_count = frappe.db.sql(
        "SELECT COUNT(DISTINCT parent) FROM `tabDJP Case Stage` WHERE user_id = %s AND status = 'No Responded'", (user,)
    )[0][0]

    cmg_counts_data = frappe.db.get_all("DJP Case", filters=base_filters, fields=["cmg_code", "count(name) as count"], group_by="cmg_code")
    cmg_counts = {d.cmg_code or "Unassigned": d.count for d in cmg_counts_data}

    dc_counts_data = frappe.db.get_all("DJP Case", filters=base_filters, fields=["current_dc_level", "count(name) as count"], group_by="current_dc_level")
    dc_counts = {d.current_dc_level or "Unassigned": d.count for d in dc_counts_data}

    return {
        "total_count": total_count,
        "draft_count": draft_count,
        "under_review_count": under_review_count,
        "closed_count": closed_count,
        "pending_for_me_count": pending_for_me_count,
        "responded_by_me_count": responded_by_me_count,
        "no_response_by_me_count": no_response_by_me_count,
        "role_type": role_type,
        "cmg_counts": cmg_counts,
        "dc_counts": dc_counts,
        "is_admin": is_admin_or_manager,
        "enabled": True
    }

# Permission query condition for DJP Case list view & reports
def get_permission_query_conditions(user=None):
    """Permission query condition for DJP Case list view & reports."""
    if not user:
        user = frappe.session.user

    if user != "Administrator" and not is_djp_module_enabled():
        return "1=0"

    user_roles = frappe.get_roles(user)
    if user == "Administrator" or "System Manager" in user_roles or "Audit Manager" in user_roles or "Audit Member" in user_roles:
        return ""

    user_escaped = frappe.db.escape(user)

    conditions = f"""(
        `tabDJP Case`.`owner` = {user_escaped}
        OR `tabDJP Case`.`name` IN (
            SELECT share_name FROM `tabDocShare` 
            WHERE share_doctype = 'DJP Case' AND user = {user_escaped}
        )
        OR `tabDJP Case`.`name` IN (
            SELECT parent FROM `tabDJP Case Stage` 
            WHERE user_id = {user_escaped} AND status IN ('Pending', 'Responded', 'No Responded', 'Overdue')
        )
    )"""

    return conditions

# Document permission validation for DJP Case form view & API access
def has_permission(doc, ptype="read", user=None):
    """Document permission validation for DJP Case form view & API access"""
    if not user:
        user = frappe.session.user

    if user != "Administrator" and not is_djp_module_enabled():
        return False


    user_roles = frappe.get_roles(user)
    if user == "Administrator" or "System Manager" in user_roles or "Audit Manager" in user_roles or "Audit Member" in user_roles:
        return True

    doc_owner = doc.owner if hasattr(doc, "owner") else getattr(doc, "owner", None)
    if doc_owner == user:
        return True

    doc_name = doc.name if hasattr(doc, "name") else getattr(doc, "name", None)
    if not doc_name:
        return True

    if frappe.db.exists("DocShare", {"share_doctype": "DJP Case", "share_name": doc_name, "user": user}):
        return True

    active_stage = frappe.db.exists("DJP Case Stage", {
        "parent": doc_name,
        "user_id": user,
        "status": ["in", ["Pending", "Responded", "No Responded", "Overdue"]]
    })

    if active_stage:
        return True

    return False

# Send email notification for stage action
def send_stage_notification(doc, stage_row, action):
    """Send email notification for stage action"""
    try:
        template = frappe.db.get_value("Email Template",
            {"name": "DJP Case Stage Notification"}, "name")

        if not template:
            frappe.sendmail(
                recipients=[stage_row.email],
                subject=f"DJP Case {doc.name} - {action.title()} at {stage_row.dc_level}",
                message=f"""
                    <p>Dear {stage_row.employee_name},</p>
                    <p>A DJP Case has been {action}ed to you for review.</p>
                    <p><b>Case:</b> {doc.name}</p>
                    <p><b>Employee:</b> {doc.employee_name} ({doc.designation})</p>
                    <p><b>CMG Code:</b> {doc.cmg_code} - {doc.cmg_recommended_outcome}</p>
                    <p><b>TAT Deadline:</b> {stage_row.tat_deadline}</p>
                    <p>Please review and respond in the DJP Case Portal.</p>
                """
            )
        else:
            frappe.sendmail(
                recipients=[stage_row.email],
                template=template,
                args={
                    "doc": doc,
                    "stage": stage_row,
                    "action": action
                }
            )
    except Exception as e:
        frappe.log_error(f"DJP Case notification failed: {e}")

# Escalate case to next DC level with justification
@frappe.whitelist()
def escalate_case(docname, justification):
    """Escalate case to next DC level"""
    doc = frappe.get_doc("DJP Case", docname)

    if doc.current_stage >= len(doc.djp_case_stages):
        frappe.throw(_("Already at final stage"))

    current_row = doc.djp_case_stages[doc.current_stage - 1]
    current_row.status = "Escalated"
    current_row.escalation_justification = justification
    current_row.response_time = now_datetime()

    doc.current_stage += 1
    next_row = doc.djp_case_stages[doc.current_stage - 1]
    doc.current_dc_level = next_row.dc_level
    next_row.status = "Pending"
    next_row.pending_time = now_datetime()

    doc.escalation_count += 1
    doc.status = "Escalated"
    doc.save()

    send_stage_notification(doc, next_row, "assign")
    check_governance_rules(doc)

    return {"success": True}

# Close DJP case with restriction for authorized employee IDs and admin roles
@frappe.whitelist()
def close_case(docname, final_decision=None, justification=None, governance_notes=None, outcome=None):
    """Close case with final decision and required justification"""
    user = frappe.session.user
    roles = frappe.get_roles(user)
    is_admin = user == "Administrator" or "System Manager" in roles

    allowed_emp_ids = ["8751", "1754", "447"]
    emp = frappe.db.get_value("Employee", {"user_id": user}, ["name", "employee_number"], as_dict=True)
    emp_id = (emp.name if emp else None) or (emp.employee_number if emp else None)

    if not is_admin and (not emp_id or str(emp_id).strip() not in allowed_emp_ids):
        frappe.throw(_("Only authorized Employee ID 'Chandrkant Sir(447)' can close DJP Cases."))

    doc = frappe.get_doc("DJP Case", docname)

    decision = final_decision or outcome
    if not decision:
        frappe.throw(_("Final Decision / Outcome is required to close case"))

    if not justification or not str(justification).strip():
        frappe.throw(_("Justification is required to close case"))

    doc.final_decision = decision
    doc.final_justification = justification
    if governance_notes:
        doc.governance_notes = (doc.governance_notes or "") + "\n" + governance_notes
    doc.status = "Closed"

    for row in doc.djp_case_stages:
        if row.status == "Pending":
            row.status = "Skipped"

    doc.save()
    check_governance_rules(doc)

    return {"success": True}

# Check governance rules based on final decision and misconduct type, and update case status accordingly
def check_governance_rules(doc):
    """Check and apply governance rules"""
    notes = []

    if doc.final_decision and "Black Mark" in doc.final_decision:
        black_mark_count = get_employee_black_mark_count(doc.employee)
        notes.append(f"Employee Black Mark Count: {black_mark_count}")

        if black_mark_count >= 3:
            notes.append("⚠️ 3rd Black Mark - Cessation triggered per governance rules")
            doc.status = "Cessation"
            doc.save()

    if doc.final_decision and "C4" in doc.final_decision:
        notes.append("C4 - Ask to Go (Governance-led separation, non-punitive)")

    if doc.final_decision and "C5" in doc.final_decision:
        notes.append("C5 - Termination (Punitive separation)")

    if doc.misconduct_type in ["Fraud / Misrepresentation", "Governance breach"]:
        if not (doc.final_decision and "C5" in doc.final_decision):
            notes.append("⚠️ Policy requires C5 for Fraud/Governance Breach")

    if notes:
        existing = doc.governance_notes or ""
        doc.governance_notes = existing + "\n" + "\n".join(notes) if existing else "\n".join(notes)
        doc.save()

# Count Black Marks (C2, C3) for employee
def get_employee_black_mark_count(employee):
    """Count Black Marks (C2, C3) for employee"""
    count = frappe.db.count("DJP Case", {
        "employee": employee,
        "final_decision": ["like", "%Black Mark%"],
        "status": ["in", ["Closed", "Cessation"]]
    })
    return count

# Check and update overdue TAT for active DJP Case Stages
@frappe.whitelist()
def check_djp_pending_tat():
    """Check and update overdue TAT for active DJP Case Stages"""
    now = now_datetime()
    overdue_stages = frappe.get_all(
        "DJP Case Stage",
        filters={
            "status": "Pending",
            "tat_deadline": ["<", now]
        },
        fields=["name", "parent", "dc_level", "user_id", "employee_name", "tat_deadline"]
    )

    updated_count = 0
    for stage in overdue_stages:
        frappe.db.set_value("DJP Case Stage", stage.name, "status", "No Responded")
        updated_count += 1

    if updated_count > 0:
        frappe.db.commit()

    return {
        "checked_at": str(now),
        "overdue_count": len(overdue_stages),
        "updated_count": updated_count,
        "overdue_stages": overdue_stages
    }

# Reopen a closed case with justification
@frappe.whitelist()                                                                                                
def reopen_case(docname, reason):                                                                                  
        """Reopen a closed case with justification"""                                                                  
        doc = frappe.get_doc("DJP Case", docname)                                                                      
                                                                                                                       
        if doc.status != "Closed":                                                                                     
            frappe.throw(_("Only closed cases can be reopened."))                                                      
                                                                                                                       
        if not reason or not str(reason).strip():                                                                      
            frappe.throw(_("Reason is required to reopen the case"))                                                   
                                                                                                                       
        # Status wapas change karein                                                                                   
        doc.status = "Draft" # Ya agar aapne 'Reopened' jaisa koi status rakha hai toh wo use karein                   
        doc.final_decision = ""                                                                                        
        doc.final_justification = ""                                                                                   
                                                                                                                       
        # Audit trail (Governance Notes me log maintain karne ke liye)                                                 
        note = f"Case Reopened by {frappe.session.user} on {frappe.utils.now_datetime()}.\nReason: {reason}"           
        doc.governance_notes = (doc.governance_notes or "") + "\n\n" + note                                            
                                                                                                                       
        # Stages table update karein agar required ho                                                                  
        # (Optional: jaise 'Skipped' stages ko wapas 'Not Sent' ya 'Pending' karna)                                    
                                                                                                                       
        doc.save(ignore_permissions=True)                                                                              
        return {"message": "Case Reopened Successfully"}

@frappe.whitelist()
def custom_search_widget(txt, doctype=None, searchfield=None, start=0, page_len=50, filters=None, as_dict=False):
	import frappe.desk.search
	results = frappe.desk.search.search_widget(txt, doctype, searchfield, start, page_len, filters, as_dict)
	if not is_djp_module_enabled():
		filtered = []
		for r in results:
			val = str(r.get("value") if isinstance(r, dict) else r[0] if isinstance(r, (list, tuple)) else r)
			desc = str(r.get("description") if isinstance(r, dict) else (r[1] if isinstance(r, (list, tuple)) and len(r) > 1 else ""))
			if "DJP" in val.upper() or "DJP" in desc.upper():
				continue
			filtered.append(r)
		return filtered
	return results

@frappe.whitelist()
def custom_global_search(text, start=0, limit=20, doctype=None):
	import frappe.desk.search
	results = frappe.desk.search.global_search(text, start, limit, doctype)
	if not is_djp_module_enabled():
		filtered = []
		for r in results:
			dt = str(r.get("doctype", ""))
			txt_val = str(r.get("content", "")) or str(r.get("title", "")) or str(r.get("name", ""))
			if "DJP" in dt.upper() or "DJP" in txt_val.upper():
				continue
			filtered.append(r)
		return filtered
	return results