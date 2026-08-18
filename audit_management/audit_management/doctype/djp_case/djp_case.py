# Copyright (c) 2026, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import now_datetime, add_days, getdate


class DJPCase(Document):
    pass


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

        employee = get_committee_employee(dc_level, emp_branch, committee, accused_employee=accused_employee) if (committee and emp_branch) else None

        if total_stages == 1:
            stage_days = total_tat
        elif stage_sequence == 1:
            stage_days = max(1, int(total_tat * 0.4))
        else:
            rem_days = total_tat - max(1, int(total_tat * 0.4))
            stage_days = max(1, int(rem_days / (total_stages - 1)))

        tat_deadline = str(add_days(base_time, stage_days))

        stage_rows.append({
            "stage": stage_sequence,
            "stage_name": stage_doc or dc_level,
            "dc_level": dc_level,
            "employee": employee.name if employee else "",
            "user_id": employee.user_id if employee else "",
            "employee_name": employee.employee_name if employee else "",
            "designation": employee.designation if employee else "",
            "email": (employee.company_email or employee.prefered_email) if employee else "",
            "status": "Not Sent",
            "tat_deadline": tat_deadline
        })
        stage_sequence += 1

    return stage_rows


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

        employee = get_committee_employee(dc_level, emp_branch, committee)
        if not employee:
            continue

        stage_tat = get_stage_tat(cmg_code, stage_sequence, len(dc_levels))
        tat_deadline = add_days(doc.created_on or now_datetime(), stage_tat)

        doc.append("djp_case_stages", {
            "stage": stage_sequence,
            "stage_name": stage_doc,
            "dc_level": dc_level,
            "employee": employee.employee,
            "user_id": employee.user_id,
            "employee_name": employee.employee_name,
            "designation": employee.designation,
            "email": employee.company_email or employee.prefered_email,
            "status": "Not Sent",
            "pending_time": None,
            "tat_deadline": tat_deadline
        })
        stage_sequence += 1

    doc.current_stage = 1
    doc.current_dc_level = dc_levels[0] if dc_levels else ""
    doc.status = "Draft"
    doc.save()

    return {"success": True}


def get_dc_levels_for_cmg(cmg_code):
    """Return list of DC levels based on CMG Code"""
    if cmg_code in ["C0", "C1", "C2"]:
        return ["Zonal DC"]
    elif cmg_code in ["C3", "C4"]:
        return ["Zonal DC", "National DC"]
    elif cmg_code == "C5":
        return ["Zonal DC", "National DC", "Management Centre Core Committee"]
    return ["Zonal DC"]


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


def get_stage_tat(cmg_code, stage_num, total_stages):
    """Distribute TAT across stages"""
    total_tat = {"C0": 7, "C1": 7, "C2": 15, "C3": 15, "C4": 15, "C5": 45}.get(cmg_code, 15)
    if stage_num == 1:
        return max(1, int(total_tat * 0.4))
    else:
        remaining = total_tat - max(1, int(total_tat * 0.4))
        return max(1, int(remaining / (total_stages - 1)))


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


@frappe.whitelist()
def send_to_selected_stage(docname, target_stage):
    """Send notification to user-selected stage reviewer"""
    doc = frappe.get_doc("DJP Case", docname)

    target_stage = int(target_stage)
    if target_stage < 1 or target_stage > len(doc.djp_case_stages):
        frappe.throw(_("Invalid stage selected"))

    # Mark previous unresponded stages as "No Responded"
    for idx, row in enumerate(doc.djp_case_stages):
        if idx < target_stage - 1:
            if row.status in ["Pending", "Overdue", "Not Sent"] and row.status != "Responded":
                row.status = "No Responded"

    selected_row = doc.djp_case_stages[target_stage - 1]

    if not selected_row.employee:
        frappe.throw(_("No reviewer assigned to selected stage '{0}'").format(selected_row.dc_level or selected_row.stage_name))

    now_dt = now_datetime()
    today_date = getdate(now_dt)

    selected_row.status = "Pending"
    selected_row.pending_time = now_dt

    # Dynamically calculate stage TAT deadline starting from send date
    total_stages = len(doc.djp_case_stages)
    stage_tat_days = get_stage_tat(doc.cmg_code, target_stage, total_stages)
    selected_row.tat_deadline = str(add_days(today_date, stage_tat_days))

    # Dynamically update overall case TAT deadline starting from send date
    total_tat_days = get_total_tat_for_cmg(doc.cmg_code)
    doc.tat_deadline = str(add_days(today_date, total_tat_days))

    doc.current_stage = target_stage
    doc.current_dc_level = selected_row.dc_level or selected_row.stage_name
    doc.status = "Under Review"
    doc.save()

    if selected_row.user_id:
        # Grant Read/Write share permission to Reviewer User
        try:
            frappe.share.add("DJP Case", doc.name, selected_row.user_id, read=1, write=1, share=0)
        except Exception as e:
            frappe.log_error(f"DJP Case share failed: {e}")

        # Add ToDo assignment for Reviewer User
        try:
            from frappe.desk.form.assign_to import add as add_assignment
            add_assignment({
                "assign_to": [selected_row.user_id],
                "doctype": "DJP Case",
                "name": doc.name,
                "description": f"DJP Case Review assigned for {doc.employee_name or doc.employee} ({selected_row.dc_level or selected_row.stage_name})",
                "date": selected_row.tat_deadline
            })
        except Exception as e:
            frappe.log_error(f"DJP Case assignment failed: {e}")

    send_stage_notification(doc, selected_row, "assign")

    reviewer_name = selected_row.employee_name or selected_row.employee
    dc_title = selected_row.dc_level or selected_row.stage_name
    return {"success": True, "message": _("Case successfully sent to {0} ({1})").format(reviewer_name, dc_title)}


@frappe.whitelist()
def get_user_djp_cases():
    """Fetch assigned DJP cases for current logged-in user to render in Custom HTML Block cards"""
    user = frappe.session.user
    if not user or user == "Guest":
        return []

    shared_names = frappe.share.get_shared("DJP Case", user)
    stage_cases = frappe.get_all("DJP Case Stage",
        filters={"user_id": user, "status": ["in", ["Pending", "Overdue"]]},
        pluck="parent")

    all_names = list(set((shared_names or []) + (stage_cases or [])))
    if not all_names:
        return []

    cases = frappe.get_all("DJP Case",
        filters={"name": ["in", all_names], "status": ["!=", "Closed"]},
        fields=["name", "employee", "employee_name", "designation", "emp_branch",
                "misconduct_type", "severity", "cmg_code", "cmg_recommended_outcome",
                "status", "current_stage", "current_dc_level", "tat_deadline", "creation"],
        order_by="creation desc")

    return cases


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


@frappe.whitelist()
def close_case(docname, final_decision, justification, governance_notes):
    """Close case with final decision"""
    doc = frappe.get_doc("DJP Case", docname)

    doc.final_decision = final_decision
    doc.final_justification = justification
    doc.governance_notes = governance_notes
    doc.status = "Closed"

    cmg_code = final_decision.split(" - ")[0] if " - " in final_decision else final_decision
    if cmg_code != doc.cmg_code and not justification:
        frappe.throw(_("Justification required for deviation from CMG recommendation"))

    for row in doc.djp_case_stages:
        if row.status == "Pending":
            row.status = "Skipped"

    doc.save()
    check_governance_rules(doc)

    return {"success": True}


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


def get_employee_black_mark_count(employee):
    """Count Black Marks (C2, C3) for employee"""
    count = frappe.db.count("DJP Case", {
        "employee": employee,
        "final_decision": ["like", "%Black Mark%"],
        "status": ["in", ["Closed", "Cessation"]]
    })
    return count
