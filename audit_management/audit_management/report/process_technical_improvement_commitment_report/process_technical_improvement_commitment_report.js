// Copyright (c) 2026, Sahayog and contributors
// For license information, please see license.txt

frappe.query_reports["Process Technical Improvement Commitment Report"] = {
	"filters": [
		{
			"fieldname": "rca_category",
			"label": __("Commitment Type"),
			"fieldtype": "Link",
			"options": "Audit RCA Category"
		},
		{
			"fieldname": "status",
			"label": __("Implementation Status"),
			"fieldtype": "Select",
			"options": "\nDraft\nPending\nClose"
		}
	]
};
