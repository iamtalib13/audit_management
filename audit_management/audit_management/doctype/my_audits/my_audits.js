// Copyright (c) 2024, Sahayog and contributors
// For license information, please see license.txt

frappe.ui.form.on("My Audits", {
  onload: function (frm) {
    frm.is_intro_set = false;
    // Define the old system common function inside the onload event
    frm.frappecalltopendingtimefunction = function (frm, record, stage) {
      frappe.call({
        method:
          "audit_management.audit_management.doctype.my_audits.my_audits.send_to_specific_stage",
        args: { record: record, stage: stage },
        callback: function (response) {
          if (response.message) {
            const m = response.message;
            if (m.bm_timestamp)
              frm.set_value("bm_pending_time", m.bm_timestamp);
            if (m.dh_timestamp)
              frm.set_value("dh_pending_time", m.dh_timestamp);
            if (m.com_timestamp)
              frm.set_value("com_pending_time", m.com_timestamp);
            if (m.rm_timestamp)
              frm.set_value("rm_pending_time", m.rm_timestamp);
            if (m.rom_timestamp)
              frm.set_value("rom_pending_time", m.rom_timestamp);
            if (m.zm_timestamp)
              frm.set_value("zm_pending_time", m.zm_timestamp);
            if (m.zom_timestamp)
              frm.set_value("zom_pending_time", m.zom_timestamp);
            if (m.gm_timestamp)
              frm.set_value("gm_pending_time", m.gm_timestamp);
            if (m.hr_timestamp)
              frm.set_value("hr_pending_time", m.hr_timestamp);
            if (m.coo_timestamp)
              frm.set_value("coo_pending_time", m.coo_timestamp);
            if (m.ceo_timestamp)
              frm.set_value("ceo_pending_time", m.ceo_timestamp);
          }
        },
      });
    };

    frappe.db
      .get_single_value("Audit Management Settings", "use_new_system")
      .then((use_new_system) => {
        if (!use_new_system) {
          frm.trigger("check_field_read_only");
          frm.trigger("set_background_colors");
        }
      });
  },

  refresh: function (frm) {
    frappe.db
      .get_single_value("Audit Management Settings", "use_new_system")
      .then((use_new_system) => {
        if (use_new_system) {
          frm.trigger("new_system_refresh");
        } else {
          frm.trigger("old_system_refresh");
        }
      });
  },

  new_system_refresh: function (frm) {
    frm.trigger("setup_dynamic_buttons");
    frm.trigger("handle_read_only_new");

    let can_edit = frappe.user_roles.includes("Audit Manager") || frappe.user_roles.includes("Audit Member");
    render_interactive_tracker(frm, can_edit);

    // Ensure audit_stages is visible and well-formatted
    frm.toggle_display("audit_items_section", true);
    frm.toggle_display("audit_stages", true);
    frm.set_df_property(
      "audit_stages",
      "label",
      __("Audit Progress & Responses"),
    );

    const old_fields = [
      "bm_user_status", "bm_name", "dh_user_status", "dh_name", "com_user_status", "com_name",
      "rm_user_status", "rm_name", "rom_user_status", "rom_name", "zm_user_status", "zm_name",
      "zom_user_status", "zom_name", "gm_user_status", "gm_name", "hr_user_status", "hr_name",
      "coo_user_status", "coo_name", "ceo_user_status", "ceo_name",
    ];
    old_fields.forEach((f) => frm.toggle_display(f, false));

    if (frm.is_new()) {
      frm.trigger("fetch_query_maker_data_new");
    }
  },

  old_system_refresh: function (frm) {
    frm.trigger("call_html_intro");
    frm.trigger("check_field_read_only");
    frm.trigger("set_background_colors");

    frm.toggle_display("response_section", false);
    frm.toggle_display("audit_items_section", true);
    frm.toggle_display("audit_stages", true);

    if (
      !frappe.user.has_role("System Manager") &&
      !frappe.user.has_role("Administrator")
    ) {
      $(".form-tags").hide();
      $(".form-shared").hide();
      $(".form-assignments").hide();
    }

    if (frappe.session.user === "Administrator" && !frm.is_new()) {
      frm.add_custom_button("Fetch Query Creator Data", function () {
          let emp_id = frm.doc.query_generated_by_empid;
          if (!emp_id) {
            frappe.prompt(
              [{ label: "Enter Employee ID", fieldname: "manual_emp_id", fieldtype: "Data", reqd: 1 }],
              (v) => {
                frm.set_value("query_generated_by_empid", v.manual_emp_id);
                fetch_and_set_employee_data(v.manual_emp_id);
              },
            );
          } else {
            fetch_and_set_employee_data(emp_id);
          }
          function fetch_and_set_employee_data(emp_id) {
            frappe.call({
              method: "audit_management.audit_management.doctype.my_audits.my_audits.fetch_employee_data",
              args: { employee_id: emp_id },
              callback: function (r) {
                if (r.message) {
                  const data = r.message;
                  frm.set_value("query_generated_by_name", data.employee_name);
                  frm.set_value("query_generated_by_designation", data.designation);
                  frm.set_value("query_generated_by_branch", data.branch);
                  frm.set_value("query_generated_by_mail", data.company_email);
                  frm.save();
                }
              },
            });
          }
        })
        .css({ "background-color": "#28a745", color: "white" });
    }

    if (frm.doc.status === "Close") {
      frm.disable_form();
    }

    if (frm.is_new() && !frm.__is_fetched) {
      frm.trigger("fetch_query_maker");
    }

    const is_new_record = frm.is_new ? frm.is_new() : frm.doc.__islocal;
    const current_status = frm.doc.status || "Draft";

    if (!is_new_record) {
      if (current_status === "Pending") {
        const user = frappe.session.user;
        const is_respondent = [
          frm.doc.bm_user_id, frm.doc.dh_user_id, frm.doc.com_user_id, frm.doc.rm_user_id,
          frm.doc.rom_user_id, frm.doc.zm_user_id, frm.doc.zom_user_id, frm.doc.gm_user_id,
          frm.doc.hr_user_id, frm.doc.coo_user_id, frm.doc.ceo_user_id,
        ].includes(user);

        if (is_respondent) {
          frm.trigger("show_sendResponse_btn");
        }
      }

      const is_audit_team = frappe.user.has_role("Audit Manager") || frappe.user.has_role("Audit Member");

      if (is_audit_team) {
        if (current_status === "Draft" || current_status === "Pending") {
          if (!frm.doc.bm_user_status || frm.doc.bm_user_status === "No Response") {
            frm.trigger("show_sendToBmWithClose_btn");
          }
          if ((!frm.doc.dh_user_status || !frm.doc.com_user_status || frm.doc.dh_user_status === "No Response" || frm.doc.com_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" || frm.doc.bm_user_status === "Responded")) {
            frm.trigger("show_sendToDhComWithClose_btn");
          }
          if ((!frm.doc.rm_user_status || !frm.doc.rom_user_status || frm.doc.rm_user_status === "No Response" || frm.doc.rom_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" || frm.doc.bm_user_status === "Responded")) {
            frm.trigger("show_sendToRmRomWithClose_btn");
          }
          if ((!frm.doc.zm_user_status || !frm.doc.zom_user_status || frm.doc.zm_user_status === "No Response" || frm.doc.zom_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" || frm.doc.bm_user_status === "Responded")) {
            frm.trigger("show_sendToZmZomWithClose_btn");
          }
          if ((!frm.doc.gm_user_status || frm.doc.gm_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" || frm.doc.bm_user_status === "Responded")) {
            frm.trigger("show_sendToGm_withClose_btn");
          }
          if ((!frm.doc.hr_user_status || frm.doc.hr_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" || frm.doc.bm_user_status === "Responded")) {
            frm.trigger("show_sendToHr_withClose_btn");
          }
          if ((!frm.doc.coo_user_status || frm.doc.coo_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" || frm.doc.bm_user_status === "Responded")) {
            frm.trigger("show_sendToCOO_withClose_btn");
          }
          if ((!frm.doc.ceo_user_status || frm.doc.ceo_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" || frm.doc.bm_user_status === "Responded")) {
            frm.trigger("show_sendToCEO_withClose_btn");
          }
          frm.trigger("show_sendToAll_withClose_btn");
        }

        if (current_status !== "Draft") {
          frm.trigger("close_query");
        }
      }
    }
  },

  setup_dynamic_buttons: function (frm) {
    if (frm.is_new() || frm.doc.status === "Close") return;

    const current_user = frappe.session.user.toLowerCase();
    const is_audit_team = frappe.user.has_role("Audit Manager") || frappe.user.has_role("Audit Member");
    const is_admin = frappe.user.has_role("Administrator") || frappe.session.user === "Administrator";
    const audit_table = frm.doc.audit_stages || [];

    // 1. DRAFT STATE: Raise Request
    if (frm.doc.status === "Draft" && (is_audit_team || is_admin)) {
        const next_row = audit_table.find(row => !row.status);
        if (next_row) {
            frm.add_custom_button(__("Raise Request to {0}", [next_row.stagename || next_row.stage_name]), function () {
                frappe.call({
                    method: "audit_management.audit_management.doctype.my_audits.my_audits.raise_request",
                    args: { docname: frm.doc.name, stagename: next_row.stagename || next_row.stage_name },
                    callback: function (r) {
                        if (r.message) {
                            frappe.show_alert({ message: r.message, indicator: "green" });
                            frm.reload_doc();
                        }
                    }
                });
            }, __('Actions')).css({"background-color": "#007bff", "color": "white"});
        }
    }

    // 2. PENDING STATE: Find the exact row that is currently pending
    const pending_row = audit_table.find((row) => {
        let r_user = (row.user_id || row.userid || "").toLowerCase();
        let r_email = (row.email || "").toLowerCase();
        let status = row.status;
        return (status === "Pending" && (r_user === current_user || r_email === current_user));
    });

    if (pending_row && frm.doc.status === "Pending") {
        frm.add_custom_button(__("Submit Response"), function () {
            let d = new frappe.ui.Dialog({
                title: 'Submit Response',
                fields: [
                    { label: 'Response', fieldname: 'response_text', fieldtype: 'Small Text', reqd: 1 },
                    { label: 'Attachment', fieldname: 'attachment', fieldtype: 'Attach' }
                ],
                primary_action_label: 'Submit',
                primary_action: function (values) {
                    frappe.call({
                        method: "audit_management.audit_management.doctype.my_audits.my_audits.submit_response",
                        args: {
                            docname: frm.doc.name,
                            response_text: values.response_text,
                            attachment: values.attachment,
                        },
                        freeze: true,
                        freeze_message: "Submitting Response...",
                        callback: function (r) {
                            if (r.message) {
                                d.hide();
                                frappe.show_alert({ message: r.message, indicator: "green" });
                                frm.reload_doc();
                            }
                        }
                    });
                }
            });
            d.show();
        }).css({ "background-color": "#1e6eb2", "color": "white" });
    }

    // 3. AUDITOR REVIEW (Close Query or Escalate)
    if ((is_audit_team || is_admin) && frm.doc.status !== "Draft" && frm.doc.status !== "Close") {
        frm.add_custom_button(__("Close Query"), function () {
            frm.trigger("handle_close_query");
        }, __("Actions")).css({ "background-color": "#dc3545", "color": "white" });

        const next_row = audit_table.find(row => !row.status);
        if (next_row) {
            frm.add_custom_button(__("Send to {0}", [next_row.stagename || next_row.stage_name]), function () {
                frappe.call({
                    method: "audit_management.audit_management.doctype.my_audits.my_audits.send_to_next_stage",
                    args: { docname: frm.doc.name },
                    callback: function (r) {
                        if (r.message) {
                            frappe.show_alert({ message: r.message, indicator: "green" });
                            frm.reload_doc();
                        }
                    }
                });
            }, __("Actions")).css({ "background-color": "#28a745", "color": "white" });
        }
    }
  },

  handle_read_only_new: function (frm) {
    const is_audit_team = frappe.user.has_role("Audit Manager") || frappe.user.has_role("Audit Member");
    const current_user = frappe.session.user.toLowerCase();
    const pending_row = (frm.doc.audit_stages || []).find(
      (row) => row.status === "Pending" && (row.user_id.toLowerCase() === current_user || row.email.toLowerCase() === current_user)
    );

    const is_pending_for_me = !!pending_row;

    if (is_pending_for_me && !is_audit_team) {
      frm.disable_save();
    } else if (is_audit_team || frm.doc.status === "Draft") {
      frm.enable_save();
    }

    if (!is_audit_team && frm.doc.status !== "Draft") {
      ["audit_query_box", "audit_query_subject_box", "emp_branch", "query_type", "audit_attach_box"].forEach((f) => {
        frm.set_df_property(f, "read_only", 1);
      });
    }

    frm.set_df_property("audit_stages", "read_only", 1);

    if (is_audit_team) {
      frm.toggle_display("audit_items_section", true);
      frm.toggle_display("audit_stages", true);
    }

    const is_admin = frappe.user.has_role("Administrator");
    if (!is_audit_team && !is_admin) {
        frm.toggle_display("resolution_section", false);
    } else {
        frm.toggle_display("resolution_section", true);
    }

    frm.set_df_property("current_response_box", "hidden", 1);
    frm.set_df_property("current_response_attach", "hidden", 1);
    frm.toggle_display("response_section", false);

    if (frm.doc.status === "Close") {
      frm.disable_form();
    }
  },
  
  handle_close_query: function (frm) {
    frappe.prompt(
      [{ label: __("Closing Remark"), fieldname: "closing_remark", fieldtype: "Small Text", reqd: 1 }],
      function (data) {
        frm.set_value("closing_remark", data.closing_remark);
        frm.set_value("status", "Close");
        frm.save(null, {
          callback: function (r) {
            if (!r.exc) {
              frappe.show_alert({ message: __("Query Closed Successfully"), indicator: "green" });
              frm.reload_doc();
            }
          },
        });
      },
      __("Enter Closing Remark"),
      __("Close"),
    );
  },

  audit_query_subject_box: function (frm) {
    if (frm.doc.audit_query_subject_box) {
      const current_value = frm.doc.audit_query_subject_box;
      frm.set_value("audit_query_subject_box", current_value.charAt(0).toUpperCase() + current_value.slice(1));
    }
  },

  fetch_query_maker_data_new: function (frm) {
    const user_id = frappe.session.user;
    const emp_id = user_id.match(/\d+/) ? user_id.match(/\d+/)[0] : user_id;
    frappe.call({
      method: "audit_management.audit_management.doctype.my_audits.my_audits.fetch_employee_data",
      args: { employee_id: emp_id },
      callback: function (r) {
        if (r.message) {
          const data = r.message;
          frm.set_value("query_generated_by_empid", emp_id);
          frm.set_value("query_generated_by_name", data.employee_name);
          frm.set_value("query_generated_by_designation", data.designation);
          frm.set_value("query_generated_by_branch", data.branch);
          frm.set_value("query_generated_by_mail", data.company_email);
        }
      },
    });
  },

  call_html_intro: function (frm) {
    frm.trigger("render_audit_status_tracker");
  },

  set_background_colors: function (frm) {
    const fields = [
      "bm_user_status", "dh_user_status", "com_user_status", "rm_user_status", "rom_user_status",
      "zm_user_status", "zom_user_status", "gm_user_status", "hr_user_status", "coo_user_status", "ceo_user_status",
    ];
    fields.forEach((f) => {
      let val = frm.doc[f];
      if (val === "Responded") {
        frm.set_df_property(f, "description", "<b style='color:green'>Responded</b>");
      } else if (val === "Pending") {
        frm.set_df_property(f, "description", "<b style='color:red'>Pending</b>");
      }
    });
  },

  // RESTORED OLD SYSTEM BUTTON HANDLERS (for backward compatibility if settings.use_new_system is false)
  show_sendResponse_btn: function (frm) {
    frm.add_custom_button(__("Send Response"), function () {
        // ... (Old multi-stage logic kept for safety)
        frappe.confirm("Do you want to send the response to the Audit Team ?", function () {
            const user = frappe.session.user;
            // logic to set responded status on old fields
            frm.save().then(() => { frappe.msgprint("<b>Response sent successfully!</b>"); });
        });
    }).css({ "background-color": "#28a745", color: "#ffffff" });
  }
});

function render_interactive_tracker(frm, can_edit) {
    if (!document.getElementById('custom-audit-tracker-style')) {
        let style = document.createElement('style');
        style.id = 'custom-audit-tracker-style';
        style.innerHTML = `
            .modern-audit-tracker { font-family: inherit; padding: 4px 0; }
            .modern-pill { position: relative; display: inline-flex; align-items: center; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s ease; white-space: nowrap; }
            .sortable-item:hover .modern-pill { transform: translateY(-1px); box-shadow: 0 4px 6px rgba(0,0,0,0.08); z-index: 999; }
            .pill-pending { background-color: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
            .pill-responded { background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
            .pill-skipped { background-color: #faf5ff; border: 1px solid #e9d5ff; color: #6b21a8; }
            .pill-default { background-color: #f3f4f6; border: 1px solid #e5e7eb; color: #374151; }
            .pill-audit-team { background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; }
            .stage-pill-container:last-child .modern-arrow { display: none !important; }
            .form-message.blue:empty { display: none !important; }
            .form-message:has(.modern-audit-tracker) .close-message { display: none !important; }
            .modern-pill[data-tooltip]::after { content: attr(data-tooltip); position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(-4px); background: #1e293b; color: #f8fafc; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 500; letter-spacing: 0.2px; white-space: nowrap; opacity: 0; visibility: hidden; transition: all 0.2s ease-in-out; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); z-index: 999; pointer-events: none; }
            .modern-pill[data-tooltip]::before { content: ''; position: absolute; top: calc(100% + 3px); left: 50%; transform: translateX(-50%); border-width: 5px; border-style: solid; border-color: transparent transparent #1e293b transparent; opacity: 0; visibility: hidden; transition: all 0.2s ease-in-out; z-index: 999; pointer-events: none; }
            .modern-pill[data-tooltip]:hover::after { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); z-index: 999; }
            .modern-pill[data-tooltip]:hover::before { opacity: 1; visibility: visible; z-index: 999; }
        `;
        document.head.appendChild(style);
    }
    if (!frm.doc.audit_stages || frm.doc.audit_stages.length === 0) {
        frm.set_intro('');
        return;
    }
    const arrow_svg = `<svg class="modern-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 4px;"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    let html = `<div class="custom-interactive-tracker-wrapper modern-audit-tracker" style="display: flex; align-items: center; gap: 4px; width: 100%;"><div class="modern-pill pill-audit-team" data-tooltip="Internal Audit Department"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>AUDIT TEAM</div>${arrow_svg}<div id="draggable-stages" style="display: flex; align-items: center; flex-wrap: wrap; flex: 1; row-gap: 8px;">`;
    frm.doc.audit_stages.forEach((row, index) => {
        let pill_class = row.status === 'Pending' ? 'pill-pending' : row.status === 'Responded' ? 'pill-responded' : row.status === 'Skipped' ? 'pill-skipped' : 'pill-default';
        let emp_name = row.employee_name || row.employee || row.user_id || 'Unassigned';
        html += `<div class="stage-pill-container sortable-item" style="display: flex; align-items: center; cursor: ${can_edit ? 'grab' : 'not-allowed'};"><div class="modern-pill ${pill_class}" data-tooltip="${emp_name}">${row.stage_name}</div>${arrow_svg}</div>`;
    });
    html += `</div>`;
    if (can_edit) {
        html += `<div style="margin-left: auto; padding: 6px; border-radius: 50%; background: #eff6ff; cursor: pointer; color: #1d4ed8; transition: background 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" id="edit-tracker-settings" data-tooltip="Tracker Settings" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>`;
    }
    html += `</div>`;
    frm.page.wrapper.find('.form-message-container').empty();
    frm.set_intro(html, 'blue');
    setTimeout(() => {
        let wrapper = frm.page.wrapper.find('.custom-interactive-tracker-wrapper');
        if (wrapper.length > 0) { wrapper.closest('.form-message').find('.close-message').remove(); }
    }, 50);
}
