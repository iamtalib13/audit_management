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
	context.audit_dashboard_boot = get_dashboard_boot()


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
def get_audits(start=0, limit=20, filters=None):
	"""Return paginated audit records."""
	if filters and isinstance(filters, str):
		import json
		filters = json.loads(filters)
	
	base_filters = _get_dashboard_filters()
	if filters:
		base_filters.update(filters)
	
	audits = frappe.get_all(
		"My Audits",
		filters=base_filters,
		fields=[
			"name as id",
			"query_type as type",
			"emp_branch as branch",
			"query_generated_by_name as auditor",
			"status",
			"creation",
			"aging"
		],
		order_by="creation desc",
		start=start,
		page_length=limit
	)
	
	# Add metadata for UI
	for audit in audits:
		audit.statusClass = "progress" if audit.status == "Pending" else "completed" if audit.status == "Close" else "overdue"
		audit.risk = "High" # Mock risk as it's not in doctype yet
		audit.riskClass = "high"
		audit.dueDate = frappe.utils.formatdate(audit.creation) # Mock due date
		audit.dueMeta = f"{audit.aging} days" if audit.aging else "Due soon"
		
		# Assign dateGroup for grouping logic
		creation_date = frappe.utils.get_datetime(audit.creation).date()
		today = frappe.utils.get_datetime(frappe.utils.now()).date()
		yesterday = today - frappe.utils.relativedelta(days=1)
		
		if creation_date == today:
			audit.dateGroup = "Today"
		elif creation_date == yesterday:
			audit.dateGroup = "Yesterday"
		else:
			audit.dateGroup = "This Week" # Simplified logic for mock
			
	return audits


@frappe.whitelist()
def get_dashboard_boot():
	return {
		"number_cards": get_dashboard_number_cards(),
		"can_create_audit": can_create_audit(),
		"branch_options": get_branch_options(),
		"query_type_options": get_query_type_options(),
		"department_options": frappe.get_all("Audit Department", pluck="department_name", order_by="department_name asc"),
		"primary_nature_options": frappe.get_all("Audit Primary Nature", pluck="primary_nature", order_by="primary_nature asc"),
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
