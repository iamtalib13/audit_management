# Copyright (c) 2026, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute(filters=None):
	# Role-based restriction: Only Audit Team and System Manager / Admin can view
	allowed_roles = {"Audit Manager", "Audit Member", "System Manager", "Administrator"}
	user_roles = set(frappe.get_roles(frappe.session.user))
	if not user_roles.intersection(allowed_roles) and frappe.session.user != "Administrator":
		frappe.msgprint(_("You are not authorized to view this report."), alert=True)
		return [], [], None, None, []

	if not filters:
		filters = {}
	columns = get_columns()
	data = get_data(filters)
	report_summary = get_report_summary(data)
	return columns, data, None, None, report_summary


def get_columns():
	return [
		{
			"label": _("Audit Case"),
			"fieldname": "parent",
			"fieldtype": "Link",
			"options": "My Audits",
			"width": 200,
		},
		{
			"label": _("Zone"),
			"fieldname": "zone",
			"fieldtype": "Data",
			"width": 100,
		},
		{
			"label": _("Branch"),
			"fieldname": "branch",
			"fieldtype": "Link",
			"options": "Branch",
			"width": 140,
		},
		{
			"label": _("Auditor Name"),
			"fieldname": "auditor_name",
			"fieldtype": "Data",
			"width": 160,
		},
		{
			"label": _("Period Month"),
			"fieldname": "audit_period_month",
			"fieldtype": "Data",
			"width": 120,
		},
		{
			"label": _("Start Date"),
			"fieldname": "audit_start_date",
			"fieldtype": "Date",
			"width": 105,
		},
		{
			"label": _("End Date"),
			"fieldname": "audit_end_date",
			"fieldtype": "Date",
			"width": 105,
		},
		{
			"label": _("Total Qs"),
			"fieldname": "total_questions",
			"fieldtype": "Int",
			"width": 80,
		},
		{
			"label": _("Complied (Yes)"),
			"fieldname": "complied_yes",
			"fieldtype": "Int",
			"width": 110,
		},
		{
			"label": _("Discrepancies (No)"),
			"fieldname": "discrepancies",
			"fieldtype": "Int",
			"width": 130,
		},
		{
			"label": _("Pending"),
			"fieldname": "pending_count",
			"fieldtype": "Int",
			"width": 85,
		},
		{
			"label": _("Compliance %"),
			"fieldname": "compliance_score",
			"fieldtype": "Data",
			"width": 115,
		},
		{
			"label": _("Actions"),
			"fieldname": "view_details",
			"fieldtype": "Data",
			"width": 130,
		},
	]


def get_data(filters):
	conditions = []
	values = {}

	if filters.get("branch"):
		conditions.append("(chk.branch = %(branch)s OR ma.emp_branch = %(branch)s)")
		values["branch"] = filters.get("branch")

	if filters.get("auditor"):
		conditions.append("(ma.owner = %(auditor)s OR emp.user_id = %(auditor)s)")
		values["auditor"] = filters.get("auditor")

	if filters.get("month"):
		conditions.append("chk.audit_period_month = %(month)s")
		values["month"] = filters.get("month")

	if filters.get("from_date"):
		conditions.append("(chk.audit_start_date >= %(from_date)s OR DATE(ma.creation) >= %(from_date)s)")
		values["from_date"] = filters.get("from_date")

	if filters.get("to_date"):
		conditions.append("(chk.audit_end_date <= %(to_date)s OR DATE(ma.creation) <= %(to_date)s)")
		values["to_date"] = filters.get("to_date")

	if filters.get("zone"):
		conditions.append("emp.custom_zone = %(zone)s")
		values["zone"] = filters.get("zone")

	where_clause = " AND ".join(conditions)
	if where_clause:
		where_clause = "WHERE " + where_clause
	else:
		where_clause = ""

	query = f"""
		SELECT
			chk.parent,
			COALESCE(emp.custom_zone, '') AS zone,
			COALESCE(MAX(chk.branch), MAX(ma.emp_branch), '') AS branch,
			COALESCE(MAX(chk.auditor_name), MAX(ma.query_generated_by_name), '') AS auditor_name,
			COALESCE(MAX(chk.audit_period_month), '') AS audit_period_month,
			MAX(chk.audit_start_date) AS audit_start_date,
			MAX(chk.audit_end_date) AS audit_end_date,
			COUNT(chk.name) AS total_questions,
			SUM(CASE WHEN chk.response = 'Yes' THEN 1 ELSE 0 END) AS complied_yes,
			SUM(CASE WHEN chk.response = 'No' THEN 1 ELSE 0 END) AS discrepancies,
			SUM(CASE WHEN chk.response IS NULL OR chk.response = '' THEN 1 ELSE 0 END) AS pending_count
		FROM
			`tabAudit Checklist Item` chk
		INNER JOIN
			`tabMy Audits` ma ON ma.name = chk.parent
		LEFT JOIN
			`tabEmployee` emp ON emp.name = ma.query_generated_by_empid
		{where_clause}
		GROUP BY
			chk.parent, emp.custom_zone
		ORDER BY
			chk.parent DESC
	"""

	raw_data = frappe.db.sql(query, values, as_dict=True)

	for row in raw_data:
		total = row.get("total_questions") or 0
		yes = row.get("complied_yes") or 0
		if total > 0:
			score = round((yes / total) * 100, 1)
			row["compliance_score"] = score
		else:
			row["compliance_score"] = 0.0

		row["view_details"] = "🔍 View Checklist"

	return raw_data


def get_report_summary(data):
	if not data:
		return []

	total_audits = len(data)
	total_no = sum(d.get("discrepancies", 0) for d in data)
	total_pending = sum(d.get("pending_count", 0) for d in data)

	return [
		{
			"value": total_audits,
			"label": _("Total Audits Completed"),
			"datatype": "Int",
		},
		{
			"value": total_no,
			"label": _("Total Observations / No"),
			"datatype": "Int",
			"indicator": "Red",
		},
		{
			"value": total_pending,
			"label": _("Total Pending Questions"),
			"datatype": "Int",
			"indicator": "Orange",
		},
	]


@frappe.whitelist()
def get_audit_checklist_details(audit_name):
	"""Fetch all 113 checklist items on-demand only when user clicks 'View Checklist'."""
	if not audit_name:
		return []

	return frappe.get_all(
		"Audit Checklist Item",
		filters={"parent": audit_name},
		fields=["idx", "section", "category", "question", "response", "remarks"],
		order_by="idx asc",
	)
