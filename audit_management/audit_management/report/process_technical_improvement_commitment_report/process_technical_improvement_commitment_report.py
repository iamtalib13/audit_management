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
			"label": _("Observation Ref"),
			"fieldname": "name",
			"fieldtype": "Link",
			"options": "My Audits",
			"width": 150
		},
		{
			"label": _("Recommended Action"),
			"fieldname": "recommendations",
			"fieldtype": "Small Text",
			"width": 250
		},
		{
			"label": _("Commitment Type"),
			"fieldname": "rca_category",
			"fieldtype": "Link",
			"options": "Audit RCA Category",
			"width": 150
		},
		{
			"label": _("Target Date / TAT"),
			"fieldname": "action_point_with_tat",
			"fieldtype": "Data",
			"width": 150
		},
		{
			"label": _("Implementation Status"),
			"fieldname": "status",
			"fieldtype": "Data",
			"width": 100
		}
	]

def get_data(filters):
	return frappe.get_all("My Audits", 
		fields=["name", "recommendations", "rca_category", "action_point_with_tat", "status"]
	)
