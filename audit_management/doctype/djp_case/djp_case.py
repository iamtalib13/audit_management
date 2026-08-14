import frappe
from frappe import _
from frappe.utils import now_datetime, add_days, getdate, date_diff
from datetime import datetime


@frappe.whitelist()
def get_cmg_mapping(misconduct_type, severity, occurrence):
    """Fetch CMG mapping from Audit Management Settings"""
    settings = frappe.get_single("Audit Management Settings")
    
    for row in settings.get("cmg_grid", []):
        if (row.misconduct_type == misconduct_type and 
            row.severity == severity and 
            row.occurrence == occurrence and
            row.is_active):
            return {
                "cmg_code": row.cmg_code,
                "cmg_recommended_outcome": row.cmg_recommended_outcome
            }
    
    return None


@frappe.whitelist()
def populate_djp_stages(docname, cmg_code, emp_branch):
    """Populate DJP Case stages based on CMG Code and branch"""
    doc = frappe.get_doc("DJP Case", docname)
    
    if doc.djp_case_stages:
        frappe.throw(_("Stages already populated"))
    
    if not cmg_code:
        frappe.throw(_("CMG Code is required to populate stages"))
    
    # Determine DC levels based on CMG Code
    dc_levels = get_dc_levels_for_cmg(cmg_code)
    
    # Get Disciplinary Committee structure from settings
    settings = frappe.get_single("Audit Management Settings")
    dc_structure = settings.get("disciplinary_committee", [])
    
    stage_sequence = 1
    for dc_level in dc_levels:
        # Find matching committee
        committee = next((c for c in dc_structure if c.dc_level == dc_level and c.is_active), None)
        if not committee:
            continue
        
        # Get stage name from DJP Stage master
        stage_doc = frappe.db.get_value("DJP Stage", 
            {"dc_level": dc_level, "is_active": 1}, 
            ["name"], order_by="sequence asc")
        
        if not stage_doc:
            continue
        
        # Get employee for this committee level and branch
        employee = get_committee_employee(dc_level, emp_branch, committee)
        if not employee:
            continue
        
        # Calculate TAT deadline for this stage
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
            "status": "Pending",
            "pending_time": now_datetime(),
            "tat_deadline": tat_deadline
        })
        stage_sequence += 1
    
    doc.current_stage = 1
    doc.current_dc_level = dc_levels[0] if dc_levels else ""
    doc.status = "Under Review"
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


def get_committee_employee(dc_level, emp_branch, committee):
    """Get employee for committee level and branch"""
    # Try to get from branch-specific mapping first
    # Fallback to role-based lookup
    roles = [r.strip() for r in committee.member_roles.split(",")] if committee.member_roles else []
    
    for role in roles:
        employees = frappe.get_all("Employee", 
            filters={"branch": emp_branch, "status": "Active", "designation": ["like", f"%{role}%"]},
            fields=["name", "employee_name", "designation", "user_id", "company_email", "prefered_email"],
            limit=1)
        if employees:
            return employees[0]
    
    # Fallback: any active employee in branch with user_id
    employees = frappe.get_all("Employee",
        filters={"branch": emp_branch, "status": "Active", "user_id": ["!=", ""]},
        fields=["name", "employee_name", "designation", "user_id", "company_email", "prefered_email"],
        limit=1)
    return employees[0] if employees else None


def get_stage_tat(cmg_code, stage_num, total_stages):
    """Distribute TAT across stages"""
    total_tat = {"C0": 7, "C1": 7, "C2": 15, "C3": 15, "C4": 15, "C5": 45}.get(cmg_code, 15)
    # First stage gets 40%, remaining distributed equally
    if stage_num == 1:
        return max(1, int(total_tat * 0.4))
    else:
        remaining = total_tat - max(1, int(total_tat * 0.4))
        return max(1, int(remaining / (total_stages - 1)))


@frappe.whitelist()
def send_to_current_stage(docname):
    """Send notification to current stage reviewer"""
    doc = frappe.get_doc("DJP Case", docname)
    
    if doc.current_stage > len(doc.djp_case_stages):
        frappe.throw(_("No more stages to send"))
    
    current_stage_row = doc.djp_case_stages[doc.current_stage - 1]
    
    if current_stage_row.status != "Pending":
        frappe.throw(_("Current stage is not in Pending status"))
    
    # Send email notification
    send_stage_notification(doc, current_stage_row, "assign")
    
    return {"success": True}


def send_stage_notification(doc, stage_row, action):
    """Send email notification for stage action"""
    try:
        # Use existing email template or create new one
        template = frappe.db.get_value("Email Template", 
            {"name": "DJP Case Stage Notification"}, "name")
        
        if not template:
            # Fallback to simple email
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
    
    # Mark current stage as escalated
    current_row = doc.djp_case_stages[doc.current_stage - 1]
    current_row.status = "Escalated"
    current_row.escalation_justification = justification
    current_row.response_time = now_datetime()
    
    # Move to next stage
    doc.current_stage += 1
    next_row = doc.djp_case_stages[doc.current_stage - 1]
    doc.current_dc_level = next_row.dc_level
    next_row.status = "Pending"
    next_row.pending_time = now_datetime()
    
    doc.escalation_count += 1
    doc.status = "Escalated"
    doc.save()
    
    # Send notification to next stage
    send_stage_notification(doc, next_row, "assign")
    
    # Check governance rules
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
    
    # Check if deviation from CMG
    cmg_code = final_decision.split(" - ")[0] if " - " in final_decision else final_decision
    if cmg_code != doc.cmg_code and not justification:
        frappe.throw(_("Justification required for deviation from CMG recommendation"))
    
    # Mark all pending stages as skipped
    for row in doc.djp_case_stages:
        if row.status == "Pending":
            row.status = "Skipped"
    
    doc.save()
    
    # Check governance rules for Black Mark etc.
    check_governance_rules(doc)
    
    return {"success": True}


def check_governance_rules(doc):
    """Check and apply governance rules"""
    notes = []
    
    # Check Black Mark count for employee
    if doc.final_decision and "Black Mark" in doc.final_decision:
        black_mark_count = get_employee_black_mark_count(doc.employee)
        notes.append(f"Employee Black Mark Count: {black_mark_count}")
        
        if black_mark_count >= 3:
            notes.append("⚠️ 3rd Black Mark - Cessation triggered per governance rules")
            doc.status = "Cessation"
            doc.save()
    
    # Check for C4 Ask to Go
    if doc.final_decision and "C4" in doc.final_decision:
        notes.append("C4 - Ask to Go (Governance-led separation, non-punitive)")
    
    # Check for C5 Termination
    if doc.final_decision and "C5" in doc.final_decision:
        notes.append("C5 - Termination (Punitive separation)")
    
    # Check mandatory C5 for Fraud/Governance Breach
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


# Scheduled job for TAT monitoring
def check_tat_breaches():
    """Daily scheduled job to check TAT breaches and auto-escalate"""
    cases = frappe.get_all("DJP Case", 
        filters={"status": ["in", ["Under Review", "Escalated"]]},
        fields=["name", "tat_deadline", "current_stage"])
    
    for case in cases:
        if case.tat_deadline and getdate(case.tat_deadline) < getdate(now_datetime()):
            doc = frappe.get_doc("DJP Case", case.name)
            current_row = doc.djp_case_stages[case.current_stage - 1] if case.current_stage <= len(doc.djp_case_stages) else None
            
            if current_row and current_row.status == "Pending":
                # Auto-escalate with system justification
                escalate_case(case.name, "Auto-escalated: TAT deadline breached")
                frappe.db.commit()