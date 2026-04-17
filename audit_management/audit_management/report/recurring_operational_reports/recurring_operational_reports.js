# Copyright (c) 2026, Sahayog and contributors
# For license information, please see license.txt

frappe.query_reports["Recurring Operational Reports"] = {
	"filters": [
		{
			"fieldname": "report_type",
			"label": __("Report Type"),
			"fieldtype": "Select",
			"options": "\nCollateral Report\nInterest GL Monitoring\nFinal Closure Report",
			"default": "Final Closure Report",
			"reqd": 1
		}
	]
};
