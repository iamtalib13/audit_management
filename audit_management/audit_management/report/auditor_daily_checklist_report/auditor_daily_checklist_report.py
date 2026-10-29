# Copyright (c) 2026, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute(filters=None):
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
			"width": 190,
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
			"label": _("Audit Period Month"),
			"fieldname": "audit_period_month",
			"fieldtype": "Data",
			"width": 140,
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
			"label": _("Section"),
			"fieldname": "section",
			"fieldtype": "Data",
			"width": 200,
		},
		{
			"label": _("Category"),
			"fieldname": "category",
			"fieldtype": "Data",
			"width": 180,
		},
		{
			"label": _("Particulars / Question"),
			"fieldname": "question",
			"fieldtype": "Data",
			"width": 320,
		},
		{
			"label": _("Response"),
			"fieldname": "response",
			"fieldtype": "Data",
			"width": 90,
		},
		{
			"label": _("Remarks"),
			"fieldname": "remarks",
			"fieldtype": "Data",
			"width": 220,
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

	if filters.get("response"):
		resp = filters.get("response")
		if resp == "Pending (Empty)":
			conditions.append("(chk.response IS NULL OR chk.response = '')")
		else:
			conditions.append("chk.response = %(response)s")
			values["response"] = resp

	if filters.get("section"):
		conditions.append("chk.section = %(section)s")
		values["section"] = filters.get("section")

	if filters.get("from_date"):
		conditions.append("DATE(ma.creation) >= %(from_date)s")
		values["from_date"] = filters.get("from_date")

	if filters.get("to_date"):
		conditions.append("DATE(ma.creation) <= %(to_date)s")
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
			chk.name,
			chk.parent,
			COALESCE(emp.custom_zone, '') AS zone,
			COALESCE(chk.branch, ma.emp_branch, '') AS branch,
			COALESCE(chk.auditor_name, ma.query_generated_by_name, '') AS auditor_name,
			COALESCE(chk.audit_period_month, '') AS audit_period_month,
			chk.audit_start_date,
			chk.audit_end_date,
			chk.section,
			chk.category,
			chk.question,
			chk.response,
			chk.remarks
		FROM
			`tabAudit Checklist Item` chk
		INNER JOIN
			`tabMy Audits` ma ON ma.name = chk.parent
		LEFT JOIN
			`tabEmployee` emp ON emp.name = ma.query_generated_by_empid
		{where_clause}
		ORDER BY
			chk.parent DESC, chk.idx ASC
	"""

	return frappe.db.sql(query, values, as_dict=True)


def get_report_summary(data):
	if not data:
		return []

	total = len(data)
	yes_count = sum(1 for d in data if d.get("response") == "Yes")
	no_count = sum(1 for d in data if d.get("response") == "No")
	pending_count = sum(1 for d in data if not d.get("response"))

	return [
		{
			"value": total,
			"label": _("Total Questions"),
			"datatype": "Int",
		},
		{
			"value": yes_count,
			"label": _("Complied (Yes)"),
			"datatype": "Int",
			"indicator": "Green",
		},
		{
			"value": no_count,
			"label": _("Discrepancies / Observations (No)"),
			"datatype": "Int",
			"indicator": "Red",
		},
		{
			"value": pending_count,
			"label": _("Pending Responses"),
			"datatype": "Int",
			"indicator": "Orange",
		},
	]
