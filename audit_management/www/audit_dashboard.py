import frappe


AUDIT_OVERVIEW_ROLES = {
	"Audit Manager",
	"Audit Member",
	"System Manager",
	"Administrator",
}

AUDIT_CREATE_ROLES = {
	"Audit Manager",
	"Audit Member",
}


def get_context(context):
	context.no_cache = 1
	context.audit_dashboard_boot = {
		"number_cards": get_dashboard_number_cards(),
		"can_create_audit": can_create_audit(),
		"branch_options": get_branch_options(),
		"query_type_options": get_query_type_options(),
	}


@frappe.whitelist()
def get_dashboard_number_cards():
	"""Return dashboard number-card counts from My Audits."""
	filters = _get_dashboard_filters()

	total_count = frappe.db.count("My Audits", filters)
	draft_count = frappe.db.count("My Audits", {**filters, "status": "Draft"})
	pending_count = frappe.db.count("My Audits", {**filters, "status": "Pending"})
	completed_count = frappe.db.count("My Audits", {**filters, "status": "Close"})

	# The current model does not have a dedicated due-date field yet.
	# For now, we surface overdue as pending audits with aging recorded.
	overdue_count = frappe.db.count(
		"My Audits",
		{**filters, "status": "Pending", "aging": [">", 0]},
	)

	return {
		"source_doctype": "My Audits",
		"number_cards": [
			{"key": "total", "label": "Total", "value": total_count},
			{"key": "draft", "label": "Draft", "value": draft_count},
			{"key": "pending", "label": "Pending", "value": pending_count},
			{"key": "completed", "label": "Completed", "value": completed_count},
			{"key": "overdue", "label": "Overdue", "value": overdue_count},
		],
	}


@frappe.whitelist()
def get_dashboard_boot():
	return {
		"number_cards": get_dashboard_number_cards(),
		"can_create_audit": can_create_audit(),
		"branch_options": get_branch_options(),
		"query_type_options": get_query_type_options(),
	}


@frappe.whitelist()
def get_branch_configuration(branch):
	_ensure_create_role()

	if not branch:
		return {"branch": "", "stages": []}

	stages = frappe.get_all(
		"Audit Items",
		filters={
			"parent": branch,
			"parenttype": "Audit Level",
			"parentfield": "audit_stages",
		},
		fields=[
			"idx",
			"stage",
			"stage_name",
			"employee",
			"employee_name",
			"user_id",
			"email",
			"status",
			"response",
		],
		order_by="idx asc",
	)

	return {
		"branch": branch,
		"stages": stages,
	}


@frappe.whitelist()
def create_audit(emp_branch, query_type, audit_query_subject_box, audit_query_box=None, audit_attach_box=None):
	_ensure_create_role()

	doc = frappe.new_doc("My Audits")
	doc.emp_branch = emp_branch
	doc.query_type = query_type
	doc.audit_query_subject_box = audit_query_subject_box
	doc.audit_query_box = audit_query_box or ""
	doc.audit_attach_box = audit_attach_box or ""
	doc.status = "Draft"

	employee = frappe.db.get_value(
		"Employee",
		{"user_id": frappe.session.user},
		["name", "employee_name", "designation", "branch", "company_email"],
		as_dict=True,
	)
	if employee:
		doc.query_generated_by_empid = employee.name
		doc.query_generated_by_name = employee.employee_name
		doc.query_generated_by_designation = employee.designation
		doc.query_generated_by_branch = employee.branch
		doc.query_generated_by_mail = employee.company_email

	doc.insert()
	frappe.db.commit()

	return {
		"name": doc.name,
		"redirect_url": f"/app/my-audits/{frappe.utils.scrub(doc.name)}",
		"message": "Audit created successfully.",
	}


def can_create_audit():
	return bool(AUDIT_CREATE_ROLES.intersection(set(frappe.get_roles(frappe.session.user))))


def get_branch_options():
	return frappe.db.sql(
		"""
		SELECT
			al.name AS value,
			COALESCE(sb.sol_id, al.name) AS code,
			sb.branch AS branch_name
		FROM `tabAudit Level` al
		LEFT JOIN `tabSahayog Branch` sb ON sb.name = al.name
		ORDER BY al.name ASC
		""",
		as_dict=True,
	)


def get_query_type_options():
	return frappe.get_all("Audit Query Type", pluck="name", order_by="name asc")


def _get_dashboard_filters():
	user = frappe.session.user
	if user == "Guest":
		return {"owner": ""}

	user_roles = set(frappe.get_roles(user))
	if AUDIT_OVERVIEW_ROLES.intersection(user_roles):
		return {}

	return {"owner": user}


def _ensure_create_role():
	if not can_create_audit():
		frappe.throw("You are not allowed to create audits.", frappe.PermissionError)
