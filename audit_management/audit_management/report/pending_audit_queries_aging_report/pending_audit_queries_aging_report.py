# Copyright (c) 2026, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe import _

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
			"fieldname": "query_status",
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
	return frappe.get_all("My Audits", 
		filters={"status": "Pending"}, 
		fields=["name", "creation", "department_alignment", "primary_nature", "query_status", "aging", "current_escalation_level"]
	)
