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

		if (column.fieldname === "discrepancies" && data) {
			if (data.discrepancies > 0) {
				value = `<span style="color: #dc2626; font-weight: 700; background: #fee2e2; padding: 2px 8px; border-radius: 4px;">${data.discrepancies}</span>`;
			} else {
				value = `<span style="color: #16a34a; font-weight: 600;">0</span>`;
			}
		}

		if (column.fieldname === "compliance_score" && data) {
			let score = parseFloat(data.compliance_score);
			let color = score >= 90 ? "#16a34a" : score >= 70 ? "#d97706" : "#dc2626";
			value = `<span style="color: ${color}; font-weight: 700;">${score}%</span>`;
		}

		if (column.fieldname === "view_details" && data && data.parent) {
			value = `<button type="button" class="btn btn-xs btn-default btn-view-checklist" data-audit="${data.parent}" style="font-size: 11px; padding: 2px 8px;">🔍 View Checklist</button>`;
		}

		return value;
	},
	onload: function (report) {
		// Add "Clear Filters" button in report toolbar
		report.page.add_inner_button(__("Clear Filters"), function () {
			report.filters.forEach(function (filter) {
				filter.set_input(filter.default || "");
			});
			report.refresh();
		});

		// Add "Download / Export" button in report toolbar
		report.page.add_inner_button(__("Download"), function () {
			frappe.tools.downloadify(report.data, null, report.report_name);
		});

		// Hide Frappe standard Actions dropdown button
		let hide_actions_interval = setInterval(() => {
			let $actions = report.page.wrapper.find('.actions-btn-group, [data-label="Actions"]');
			if ($actions.length) {
				$actions.attr('style', 'display: none !important');
			}
		}, 50);
		setTimeout(() => clearInterval(hide_actions_interval), 2000);

		// Delegate click event for On-Demand Checklist Modal
		$(report.wrapper).off("click.viewchk").on("click.viewchk", ".btn-view-checklist", function () {
			let audit_id = $(this).attr("data-audit");
			if (!audit_id) return;

			frappe.call({
				method: "audit_management.audit_management.report.auditor_daily_checklist_report.auditor_daily_checklist_report.get_audit_checklist_details",
				args: { audit_name: audit_id },
				callback: function (r) {
					if (r.message && r.message.length) {
						let items = r.message;
						let no_items_count = items.filter(i => i.response === "No").length;

						let dialog = new frappe.ui.Dialog({
							title: __(`Checklist Details: ${audit_id}`),
							size: "large",
							fields: [
								{
									fieldname: "filter_html",
									fieldtype: "HTML",
								},
								{
									fieldname: "items_table",
									fieldtype: "HTML",
								},
							],
						});

						const render_table = (filter_type) => {
							let filtered = items;
							if (filter_type === "No") {
								filtered = items.filter(i => i.response === "No");
							} else if (filter_type === "Yes") {
								filtered = items.filter(i => i.response === "Yes");
							}

							let rows_html = filtered.map((item, idx) => {
								let resp_badge = item.response === "Yes"
									? `<span style="color: #16a34a; font-weight: 700;">Yes</span>`
									: item.response === "No"
									? `<span style="color: #dc2626; font-weight: 700; background: #fee2e2; padding: 2px 6px; border-radius: 3px;">No</span>`
									: `<span style="color: #94a3b8;">Pending</span>`;

								return `
									<tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
										<td style="padding: 6px 8px; color: #64748b;">${idx + 1}</td>
										<td style="padding: 6px 8px; font-weight: 600; color: #334155;">${item.category || item.section || "—"}</td>
										<td style="padding: 6px 8px; color: #0f172a;">${item.question || ""}</td>
										<td style="padding: 6px 8px; text-align: center;">${resp_badge}</td>
										<td style="padding: 6px 8px; color: #475569;">${item.remarks || "—"}</td>
									</tr>
								`;
							}).join("");

							let table_html = `
								<div style="max-height: 450px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 4px;">
									<table class="table table-bordered table-condensed" style="margin: 0;">
										<thead style="background: #1e293b; color: #ffffff; font-size: 11px; position: sticky; top: 0;">
											<tr>
												<th style="width: 40px; color: #ffffff;">#</th>
												<th style="width: 160px; color: #ffffff;">Category</th>
												<th style="color: #ffffff;">Particulars / Question</th>
												<th style="width: 70px; text-align: center; color: #ffffff;">Response</th>
												<th style="width: 180px; color: #ffffff;">Remarks</th>
											</tr>
										</thead>
										<tbody>
											${rows_html || `<tr><td colspan="5" class="text-center text-muted" style="padding: 20px;">No records found for this filter</td></tr>`}
										</tbody>
									</table>
								</div>
							`;
							dialog.fields_dict.items_table.$wrapper.html(table_html);
						};

						// Render filter pills at top of modal
						let nav_html = `
							<div style="margin-bottom: 12px; display: flex; gap: 8px;">
								<button type="button" class="btn btn-xs btn-primary modal-filter-btn" data-type="ALL">All Questions (${items.length})</button>
								<button type="button" class="btn btn-xs btn-danger modal-filter-btn" data-type="No">Observations / No Only (${no_items_count})</button>
								<button type="button" class="btn btn-xs btn-default modal-filter-btn" data-type="Yes">Complied / Yes</button>
							</div>
						`;
						dialog.fields_dict.filter_html.$wrapper.html(nav_html);

						dialog.fields_dict.filter_html.$wrapper.find(".modal-filter-btn").on("click", function () {
							dialog.fields_dict.filter_html.$wrapper.find(".modal-filter-btn").removeClass("btn-primary").addClass("btn-default");
							$(this).removeClass("btn-default").addClass("btn-primary");
							render_table($(this).attr("data-type"));
						});

						render_table("ALL");
						dialog.show();
					} else {
						frappe.msgprint(__("No checklist items found for this audit case."));
					}
				},
			});
		});
	},
};
