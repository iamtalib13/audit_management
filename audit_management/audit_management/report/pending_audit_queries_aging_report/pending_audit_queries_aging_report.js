# Copyright (c) 2026, Sahayog and contributors
# For license information, please see license.txt

frappe.query_reports["Pending Audit Queries & Aging Report"] = {
	"filters": [
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
		}
	]
};
