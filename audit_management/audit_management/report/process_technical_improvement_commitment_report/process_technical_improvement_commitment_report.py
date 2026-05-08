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
			"label": _("Target Date"),
			"fieldname": "action_point_with_tat",
			"fieldtype": "Data",
			"width": 150
		},
		{
			"label": _("Implementation Status"),
			"fieldname": "status",
			"fieldtype": "Select",
			"options": "Draft\nPending\nClose",
			"width": 100
		},
		{
			"label": _("Aging of Commitment"),
			"fieldname": "aging_commitment",
			"fieldtype": "Int",
			"width": 150
		}
	]

def get_data(filters):
	query_filters = {}
	# Only track those with an RCA Category (Commitment)
	query_filters["rca_category"] = ["is", "set"]
	
	if filters.get("rca_category"):
		query_filters["rca_category"] = filters.get("rca_category")
	
	if filters.get("status"):
		query_filters["status"] = filters.get("status")

	audits = frappe.get_all("My Audits", 
		filters=query_filters, 
		fields=["name", "recommendations", "rca_category", "action_point_with_tat", "status", "modified"]
	)

	for audit in audits:
		# Aging of commitment: from when it was last modified (committed) until now
		# or if closed, maybe it's not aging anymore? 
		# Usually, aging of commitment continues until it's implemented (Close)
		start_date = getdate(audit.modified)
		end_date = getdate(nowdate())
		audit["aging_commitment"] = get_working_days(start_date, end_date)

	return audits
