# Copyright (c) 2026, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import getdate, nowdate
from audit_management.audit_management.utils import get_working_days

def execute(filters=None):
	columns = get_columns()
	data = get_data(filters)
	return columns, data

def get_columns():
	return [
		{
			"label": _("Query ID"),
			"fieldname": "name",
			"fieldtype": "Link",
			"options": "My Audits",
			"width": 150
		},
		{
			"label": _("Date Raised"),
			"fieldname": "creation",
			"fieldtype": "Date",
			"width": 100
		},
		{
			"label": _("Department"),
			"fieldname": "department_alignment",
			"fieldtype": "Link",
			"options": "Audit Department",
			"width": 150
		},
		{
			"label": _("Primary Category"),
			"fieldname": "primary_nature",
			"fieldtype": "Link",
			"options": "Audit Primary Nature",
			"width": 150
		},
		{
			"label": _("Current Owner"),
			"fieldname": "current_owner",
			"fieldtype": "Data",
			"width": 150
		},
		{
			"label": _("Aging (Days)"),
			"fieldname": "aging",
			"fieldtype": "Int",
			"width": 100
		},
		{
			"label": _("Current Escalation Level"),
			"fieldname": "current_escalation_level",
			"fieldtype": "Data",
			"width": 150
		}
	]

def get_data(filters):
	query_filters = {"status": "Pending"}
	
	if filters.get("from_date"):
		query_filters["creation"] = [">=", filters.get("from_date")]
	if filters.get("to_date"):
		if "creation" in query_filters:
			query_filters["creation"] = ["between", [filters.get("from_date"), filters.get("to_date")]]
		else:
			query_filters["creation"] = ["<=", filters.get("to_date")]

	if filters.get("department_alignment"):
		query_filters["department_alignment"] = filters.get("department_alignment")
	if filters.get("primary_nature"):
		query_filters["primary_nature"] = filters.get("primary_nature")
	if filters.get("current_escalation_level"):
		query_filters["current_escalation_level"] = filters.get("current_escalation_level")
	if filters.get("emp_division"):
		query_filters["emp_division"] = filters.get("emp_division")

	audits = frappe.get_all("My Audits", 
		filters=query_filters, 
		fields=["name", "creation", "department_alignment", "primary_nature", "current_escalation_level"]
	)

	for audit in audits:
		# Calculate Aging on the fly
		start_date = getdate(audit.creation)
		end_date = getdate(nowdate())
		audit["aging"] = get_working_days(start_date, end_date)

		# Find Current Owner
		pending_stage = frappe.db.get_value("Audit Items", 
			{"parent": audit.name, "status": "Pending"}, 
			["user_id", "employee_name"], as_dict=True)
		
		if pending_stage:
			audit["current_owner"] = pending_stage.employee_name or pending_stage.user_id
		else:
			audit["current_owner"] = "Unassigned"
            
	return audits
