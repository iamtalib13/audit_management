// Copyright (c) 2026, Sahayog and contributors
// For license information, please see license.txt

frappe.query_reports["Pending Audit Queries Aging Report"] = {
	"filters": [
		{
			"fieldname": "from_date",
			"label": __("From Date"),
			"fieldtype": "Date"
		},
		{
			"fieldname": "to_date",
			"label": __("To Date"),
			"fieldtype": "Date"
		},
		{
			"fieldname": "department_alignment",
			"label": __("Department"),
			"fieldtype": "Link",
			"options": "Audit Department"
		},
		{
			"fieldname": "primary_nature",
			"label": __("Primary Category"),
			"fieldtype": "Link",
			"options": "Audit Primary Nature"
		},
		{
			"fieldname": "current_escalation_level",
			"label": __("Escalation Level"),
			"fieldtype": "Select",
			"options": "\nLevel 1\nLevel 2\nLevel 3"
		},
		{
			"fieldname": "emp_division",
			"label": __("Division"),
			"fieldtype": "Link",
			"options": "Division"
		}
	]
};
