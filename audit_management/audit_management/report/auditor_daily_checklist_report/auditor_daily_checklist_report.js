// Copyright (c) 2026, Sahayog and contributors
// For license information, please see license.txt

frappe.query_reports["Auditor Daily Checklist Report"] = {
	filters: [
		{
			fieldname: "zone",
			label: __("Zone"),
			fieldtype: "Select",
			options: "\nZONE-1\nZONE-2\nZONE-3\nZONE-4\nZONE-5\nZONE-6",
		},
		{
			fieldname: "branch",
			label: __("Branch"),
			fieldtype: "Link",
			options: "Branch",
		},
		{
			fieldname: "auditor",
			label: __("Auditor"),
			fieldtype: "Link",
			options: "User",
		},
		{
			fieldname: "month",
			label: __("Audit Period Month"),
			fieldtype: "Select",
			options: "\nJanuary\nFebruary\nMarch\nApril\nMay\nJune\nJuly\nAugust\nSeptember\nOctober\nNovember\nDecember",
		},
		{
			fieldname: "response",
			label: __("Response"),
			fieldtype: "Select",
			options: "\nYes\nNo\nPending (Empty)",
		},
		{
			fieldname: "section",
			label: __("Section"),
			fieldtype: "Select",
			options: "\nA. OPERATION VERIFICATION\nB. DATA ANALYSIS (Searching Transaction Report)\nC. REPORT PART\nD. OTHER OBSERVATIONS",
		},
		{
			fieldname: "from_date",
			label: __("From Date"),
			fieldtype: "Date",
		},
		{
			fieldname: "to_date",
			label: __("To Date"),
			fieldtype: "Date",
		},
	],
	formatter: function (value, row, column, data, default_formatter) {
		value = default_formatter(value, row, column, data);
		if (column.fieldname === "response" && data) {
			if (data.response === "Yes") {
				value = `<span style="color: #16a34a; font-weight: 700;">${value}</span>`;
			} else if (data.response === "No") {
				value = `<span style="color: #dc2626; font-weight: 700;">${value}</span>`;
			}
		}
		return value;
	},
};
