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
    // 1. Inject Creation/Closing Date & Aging into Header
    if (!frm.is_new() && frm.doc.creation) {
      setTimeout(() => {
        let header_status = frm.page.wrapper.find(".indicator-pill").first();

        // Remove existing date-tag if it exists to allow re-injection on status change
        frm.page.wrapper.find(".date-tag").remove();

        if (header_status.length > 0) {
          const created_date = frappe.datetime.str_to_user(
            frm.doc.creation.split(" ")[0],
          );

          let date_html = `<span class="date-tag" style="margin-left: 12px; font-size: 11px; display: inline-flex; align-items: center; gap: 8px; color: #475569;">`;

          // Helper for icon + text
          const item = (label, val) =>
            `<span style="display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 3px 10px; border-radius: 4px; white-space: nowrap;"><span style="color: #64748b; font-weight: 600;">${label}:</span> <span style="color: #1e293b;">${val}</span></span>`;

          date_html += item("Created", created_date);

          if (frm.doc.status === "Closed" && frm.doc.closing_date) {
            const closed_date = frappe.datetime.str_to_user(
              frm.doc.closing_date,
            );
            date_html += item("Closed", closed_date);
          }

          if (frm.doc.creation) {
            const created_date = frappe.datetime.str_to_user(
              frm.doc.creation.split(" ")[0],
            );

            // Calculate dynamic aging: today - creation date
            const creation_date_obj = frappe.datetime.str_to_obj(
              frm.doc.creation,
            );
            const today = new Date();
            const time_diff = today - creation_date_obj;
            const dynamic_aging = Math.floor(time_diff / (1000 * 60 * 60 * 24));

            date_html += item("Aging", `${dynamic_aging} Days`);
          }

          date_html += `</span>`;
          header_status.after(date_html);
        }

        // Correct status label text from 'Close' to 'Closed'
        let status_pill = frm.page.wrapper.find(".indicator-pill").first();
        if (status_pill.text().trim() === "Closed") {
          status_pill.text("Closed");
        }
      }, 500);
    }

    // Filter branch (Audit Level) based on the current user's division
    frm.set_query("emp_branch", function () {
      return {
        filters: {
          division: frm.doc.emp_division,
        },
      };
    });

    if (frm.is_new()) {
      // Fetch current user employee details for UI immediate display
      frappe.db.get_value(
        "Employee",
        { user_id: frappe.session.user },
        [
          "name",
          "employee_name",
          "company_email",
          "designation",
          "branch",
          "custom_division",
        ],
        (employee) => {
          if (employee) {
            frm.set_value("query_generated_by_empid", employee.name);
            frm.set_value("query_generated_by_name", employee.employee_name);
            frm.set_value("query_generated_by_mail", employee.company_email);
            frm.set_value(
              "query_generated_by_designation",
              employee.designation,
            );
            frm.set_value("query_generated_by_branch", employee.branch);
            frm.set_value("emp_division", employee.custom_division);
          }
        },
      );
    }

    // 1. Check if user has permission to edit the tracker
    let can_edit =
      frappe.user_roles.includes("Audit Manager") ||
      frappe.user_roles.includes("Audit Member");

    // 2. Render the Interactive Tracker
    // render_interactive_tracker(frm, can_edit);

    // let logged_in_user = frappe.session.user;
    //     console.log("Logged In User ID:", logged_in_user);

    //     frappe.db.get_value(
    //         'Employee',
    //         { user_id: logged_in_user },
    //         ['name', 'employee_name', 'user_id', 'company_email', 'designation', 'branch', 'department', 'custom_division'], // ✅ added custom_division
    //         function(employee) {
    //             if (employee && employee.name) {
    //                 // console.log("Employee Details:", employee);
    //                 console.log("Custom Division:", employee.custom_division); // ✅ correct key
    //                 // frm.set_df_property('custom_division', 'read_only', 1);

    //                 // ✅ Set emp_division field on the form
    //                 frm.set_value('emp_division', employee.custom_division);

    //             } else {
    //                 console.warn("No Employee found for:", logged_in_user);
    //             }
    //         }
    //     );

    // frm.is_intro_set = false;
    // frm.set_intro("");

    // frm.page.wrapper.find(".form-message-container").empty();
    // frm.page.wrapper.find(".custom-status-tracker").remove();
    // frm.page.wrapper.find(".alert.alert-info").remove();

    frappe.db
      .get_single_value("Audit Management Settings", "use_new_system")
      .then((use_new_system) => {
        if (use_new_system) {
          frm.trigger("new_system_refresh");
        } else {
          frm.trigger("old_system_refresh");
        }
      });
    // 🌟 FINAL FIX: KEEP STATUS AS "DRAFT", SHOW SAVE ONLY ON MODIFY 🌟
    if (!frm.is_new()) {
      // Wait for background scripts (like employee data fetches) to finish
      setTimeout(() => {
        // 1. Tell Frappe the form is "clean" (Not modified)
        frm.doc.__unsaved = 0;

        // 2. Hide the Save button manually without touching the "Draft" header status!
        frm.page.wrapper.find('.primary-action[data-label="Save"]').hide();
      }, 800);

      // 3. Optional: Add a real-time listener.
      // If Frappe ever forces it back on, this ensures it only stays visible if the form is actually modified.
      setInterval(() => {
        if (!frm.is_dirty()) {
          frm.page.wrapper.find('.primary-action[data-label="Save"]').hide();
        } else {
          frm.page.wrapper.find('.primary-action[data-label="Save"]').show();
        }
      }, 1000);
    }
  },

  // refresh: function(frm) {
  //       // 1. Check if user has permission to edit the tracker
  //       let can_edit = frappe.user_roles.includes("Audit Manager") || frappe.user_roles.includes("Audit Member");

  //       // 2. Render the Interactive Tracker
  //       render_interactive_tracker(frm, can_edit);
  //   },

  new_system_refresh: function (frm) {
    console.log("-> new_system_refresh triggered");
    // frm.trigger("render_status_tracker");
    frm.trigger("setup_dynamic_buttons");
    frm.trigger("handle_read_only_new");

    // ✅ ADD THIS HERE (Ensure it loads the new interactive one)
    let can_edit =
      frappe.user_roles.includes("Audit Manager") ||
      frappe.user_roles.includes("Audit Member");
    
    console.log("-> Calling render_interactive_tracker. can_edit:", can_edit);
    render_interactive_tracker(frm, can_edit);

    // Ensure audit_stages is visible and well-formatted
    frm.toggle_display("audit_items_section", true);
    frm.toggle_display("audit_stages", true);
    frm.set_df_property(
      "audit_stages",
      "label",
      __("Audit Progress & Responses"),
    );

    // Ensure audit_stages is visible and well-formatted
    frm.toggle_display("audit_items_section", true);
    frm.toggle_display("audit_stages", true);
    frm.set_df_property(
      "audit_stages",
      "label",
      __("Audit Progress & Responses"),
    );

    const old_fields = [
      "bm_user_status", "bm_name", "bm_pending_time", "bm_user_id", "bm_mail", "bm_response_box", "bm_attach_box",
      "dh_user_status", "dh_name", "dh_pending_time", "dh_user_id", "dh_mail", "dh_response_box", "dh_attach_box",
      "com_user_status", "com_name", "com_pending_time", "com_user_id", "com_mail", "com_response_box", "com_attach_box",
      "rm_user_status", "rm_name", "rm_pending_time", "rm_user_id", "rm_mail", "rm_response_box", "rm_attach_box",
      "rom_user_status", "rom_name", "rom_pending_time", "rom_user_id", "rom_mail", "rom_response_box", "rom_attach_box",
      "zm_user_status", "zm_name", "zm_pending_time", "zm_user_id", "zm_mail", "zm_response_box", "zm_attach_box",
      "zom_user_status", "zom_name", "zom_pending_time", "zom_user_id", "zom_mail", "zom_response_box", "zom_attach_box",
      "gm_user_status", "gm_name", "gm_pending_time", "gm_user_id", "gm_mail", "gm_response_box", "gm_attach_box",
      "hr_user_status", "hr_name", "hr_pending_time", "hr_user_id", "hr_mail", "hr_response_box", "hr_attach_box",
      "coo_user_status", "coo_name", "coo_pending_time", "coo_user_id", "coo_mail", "coo_response_box", "coo_attach_box",
      "ceo_user_status", "ceo_name", "ceo_pending_time", "ceo_user_id", "ceo_mail", "ceo_response_box", "ceo_attach_box",
      "stage_1_bm_section", "stage_2_dh_section", "stage_2_com_section", "stage_2_rom_section", "stage_4_zom_section",
      "stage_5_gm_section", "stage_6_hr_section", "stage_7_coo_section", "stage_8_ceo_section", "column_break_nhcaj", "column_break_pcphc",
      "bm_response", "dh_com_response_section", "rm_rom_response_section", "zm_zom_response_section", "gm_response_section",
      "hr_response_section", "coo_response_section", "ceo_response_section"
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

    // Administrator Button
    if (frappe.session.user === "Administrator" && !frm.is_new()) {
      frm
        .add_custom_button("Fetch Query Creator Data", function () {
          // [Old fetch logic from my_audits_old]
          let emp_id = frm.doc.query_generated_by_empid;
          if (!emp_id) {
            frappe.prompt(
              [
                {
                  label: "Enter Employee ID",
                  fieldname: "manual_emp_id",
                  fieldtype: "Data",
                  reqd: 1,
                },
              ],
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
              method:
                "audit_management.audit_management.doctype.my_audits.my_audits.fetch_employee_data",
              args: { employee_id: emp_id },
              callback: function (r) {
                if (r.message) {
                  const data = r.message;
                  frm.set_value("query_generated_by_name", data.employee_name);
                  frm.set_value(
                    "query_generated_by_designation",
                    data.designation,
                  );
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

    if (frm.doc.status === "Closed") {
      frm.disable_form();
    }

    if (frm.is_new() && !frm.__is_fetched) {
      frm.trigger("fetch_query_maker");
    }

    const is_new_record = frm.is_new ? frm.is_new() : frm.doc.__islocal;
    const current_status = frm.doc.status || "Draft";

    // Buttons should show for existing records (already saved at least once)
    if (!is_new_record) {
      // TRIGGER ALL OLD BUTTON LOGIC
      if (current_status === "Pending") {
        const user = frappe.session.user;

        // CHECK CHILD TABLE FOR RESPONDENT (Modern way)
        let is_active_respondent = (frm.doc.audit_stages || []).some(
          (row) =>
            row.user_id === user &&
            (row.status === "Pending" || row.status === "No Response"),
        );

        if (is_active_respondent) {
          frm.trigger("show_sendResponse_btn");
        }
      }

      const is_audit_team =
        frappe.user.has_role("Audit Manager") ||
        frappe.user.has_role("Audit Member");

      if (is_audit_team) {
        if (current_status === "Draft" || current_status === "Pending") {
          if (
            !frm.doc.bm_user_status ||
            frm.doc.bm_user_status === "No Response"
          ) {
            frm.trigger("show_sendToBmWithClose_btn");
          }

          if (
            !frm.doc.dh_user_status ||
            !frm.doc.com_user_status ||
            frm.doc.dh_user_status === "No Response" ||
            frm.doc.com_user_status === "No Response"
          ) {
            frm.trigger("show_sendToDhComWithClose_btn");
          }

          if (
            !frm.doc.rm_user_status ||
            !frm.doc.rom_user_status ||
            frm.doc.rm_user_status === "No Response" ||
            frm.doc.rom_user_status === "No Response"
          ) {
            frm.trigger("show_sendToRmRomWithClose_btn");
          }

          if (
            !frm.doc.zm_user_status ||
            !frm.doc.zom_user_status ||
            frm.doc.zm_user_status === "No Response" ||
            frm.doc.zom_user_status === "No Response"
          ) {
            frm.trigger("show_sendToZmZomWithClose_btn");
          }

          if (
            !frm.doc.gm_user_status ||
            frm.doc.gm_user_status === "No Response"
          ) {
            frm.trigger("show_sendToGm_withClose_btn");
          }

          if (
            !frm.doc.hr_user_status ||
            frm.doc.hr_user_status === "No Response"
          ) {
            frm.trigger("show_sendToHr_withClose_btn");
          }

          if (
            !frm.doc.coo_user_status ||
            frm.doc.coo_user_status === "No Response"
          ) {
            frm.trigger("show_sendToCOO_withClose_btn");
          }

          if (
            !frm.doc.ceo_user_status ||
            frm.doc.ceo_user_status === "No Response"
          ) {
            frm.trigger("show_sendToCEO_withClose_btn");
          }

          frm.trigger("show_sendToAll_withClose_btn");
        }
        if (current_status !== "Draft") {
          frm.trigger("close_query");
          frm.trigger("reopen_query");
        }
      }
    }
  },

  render_status_tracker: function (frm) {
    frm.trigger("render_audit_status_tracker");
  },

  render_audit_status_tracker: function (frm) {
    if (!frm.is_new() && !frm.is_intro_set) {
      frm.is_intro_set = true;

      // Clear all existing message containers
      frm.set_intro("");
      frm.page.wrapper.find(".form-message-container").empty();
      frm.page.wrapper.find(".custom-status-tracker").remove();

      frappe.call({
        method:
          "audit_management.audit_management.doctype.my_audits.my_audits.get_status_tracker_html",
        args: { docname: frm.doc.name },
        callback: function (r) {
          if (r.message) {
            if (frm.page.wrapper.find(".custom-status-tracker").length === 0) {
              frm.set_intro(
                `<div class="custom-status-tracker">${r.message}</div>`,
              );
              // Initialize Bootstrap tooltips
              setTimeout(() => {
                frm.page.wrapper.find('[data-toggle="tooltip"]').tooltip();
              }, 300);
            }
          } else {
            frm.is_intro_set = false;
          }
        },
      });
    }
  },
  show_action_banner: function (frm, args) {
    const my_row = args ? args.row : null;

    if (my_row) {
      setTimeout(() => {
        let title = "";
        let message = "";
        let color = "";
        let bg_color = "";
        let fa_icon = "";
        let show_btn = false;

        if (my_row.status === "Pending") {
          title = "Action Required";
          message =
            "The response is pending from you. Please submit your response.";
          color = "#4f46e5"; // Indigo
          bg_color = "#f5f3ff"; // Indigo 50
          fa_icon = "fa fa-exclamation-circle";
          show_btn = true;
        } else if (my_row.status === "No Response") {
          title = "TAT Breached";
          message = `Time has passed for <b>${my_row.stage_name}</b>. You can still submit your response.`;
          color = "#d97706"; // Amber
          bg_color = "#fffbeb"; // Amber 50
          fa_icon = "fa fa-exclamation-triangle";
          show_btn = true;
        }

        // Button styled to stick close to text
        const btn_html = show_btn
          ? `<button class="btn btn-xs btn-primary btn-banner-action" 
                     style="background-color: ${color}; border: none; margin-left: 15px; font-weight: 500; padding: 4px 12px; font-size: 11px; border-radius: 4px; cursor: pointer; white-space: nowrap; height: 24px; display: inline-flex; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
               Submit Now
             </button>`
          : "";

        const banner_html = `
          <div class="action-guidance-banner" style="
            background-color: ${bg_color};
            border: 1px solid ${color}40;
            border-left: 4px solid ${color};
            padding: 10px 16px;
            margin-top: 5px;
            margin-bottom: 15px;
            border-radius: 6px;
            display: flex; /* Dobara full width karne ke liye width expand hogi */
            align-items: center;
            justify-content: flex-start;
            font-size: 13px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            width: 100%; /* Pure screen width lega */
          ">
            <i class="${fa_icon}" style="color: ${color}; font-size: 15px; margin-right: 12px; display: flex; align-items: center;"></i>
            
            <div style="color: #24292f; display: flex; align-items: center; flex-wrap: wrap;">
              <strong style="color: ${color}; margin-right: 6px; white-space: nowrap;">${title}:</strong>
              <span style="color: #3b424a;">${message}</span>
              ${btn_html} </div>
          </div>
        `;

        // Clear existing banner
        frm.page.wrapper.find(".action-guidance-banner").remove();

        // Inject above introduction area
        const $form_message_area = frm.page.wrapper.find(".form-message-area");
        const $page_form = frm.page.wrapper.find(".page-form");

        if ($form_message_area.length > 0) {
          $(banner_html).insertBefore($form_message_area);
        } else if ($page_form.length > 0) {
          $(banner_html).insertBefore($page_form);
        } else {
          const $target = frm.page.wrapper.find(".page-body");
          if ($target.length > 0) $(banner_html).prependTo($target);
        }

        // Click Event Handler
        frm.page.wrapper
          .find(".btn-banner-action")
          .off("click")
          .on("click", function () {
            const $main_btn = frm.page.wrapper.find(
              '.page-actions button:contains("Submit Response")',
            );
            if ($main_btn.length > 0) {
              $main_btn.click();
            }
          });
      }, 1000);
    } else {
      frm.page.wrapper.find(".action-guidance-banner").remove();
    }
  },

  // setup_dynamic_buttons: function (frm) {
  //   if (frm.is_new() || frm.doc.status === "Closed") return;
  //   const is_audit_team =
  //     frappe.user.has_role("Audit Manager") ||
  //     frappe.user.has_role("Audit Member");
  //   const current_user = frappe.session.user;

  //   if (is_audit_team) {
  //     const next_row = (frm.doc.audit_stages || []).find((row) => !row.status);
  //     if (next_row) {
  //       frm
  //         .add_custom_button(
  //           __("Send to {0}", [next_row.stage_name]),
  //           function () {
  //             frappe.call({
  //               method:
  //                 "audit_management.audit_management.doctype.my_audits.my_audits.send_to_next_stage",
  //               args: { docname: frm.doc.name },
  //               callback: function (r) {
  //                 if (r.message) {
  //                   frappe.show_alert({
  //                     message: r.message,
  //                     indicator: "green",
  //                   });
  //                   frm.reload_doc();
  //                 }
  //               },
  //             });
  //           },
  //           __("Actions"),
  //         )
  //         .css({ "background-color": "#28a745", color: "white" });
  //     }
  //     frm
  //       .add_custom_button(
  //         __("Close Query"),
  //         function () {
  //           frm.trigger("handle_close_query");
  //         },
  //         __("Actions"),
  //       )
  //       .css({ "background-color": "#dc3545", color: "white" });
  //   }

  //   const pending_row = (frm.doc.audit_stages || []).find(
  //     (row) => row.status === "Pending" && row.user_id === current_user,
  //   );
  //   if (pending_row) {
  //     frm
  //       .add_custom_button(__("Submit Response"), function () {
  //         if (!frm.doc.current_response_box) {
  //           frappe.msgprint(__("Please enter your response first."));
  //           return;
  //         }
  //         frappe.call({
  //           method:
  //             "audit_management.audit_management.doctype.my_audits.my_audits.submit_response",
  //           args: {
  //             docname: frm.doc.name,
  //             response_text: frm.doc.current_response_box,
  //             attachment: frm.doc.current_response_attach,
  //           },
  //           freeze: true,
  //           freeze_message: __("Submitting Response..."),
  //           callback: function (r) {
  //             if (r.message) {
  //               frappe.show_alert({ message: r.message, indicator: "green" });
  //               frm.reload_doc();
  //             }
  //           },
  //         });
  //       })
  //       .css({ "background-color": "#1e6eb2", color: "white" });
  //   }
  // },

  //   setup_dynamic_buttons: function (frm) {
  //   if (frm.is_new() || frm.doc.status === "Closed") return;

  //   const is_audit_team =
  //     frappe.user.has_role("Audit Manager") ||
  //     frappe.user.has_role("Audit Member");
  //   const current_user = frappe.session.user;

  //   if (is_audit_team) {
  //     const next_row = (frm.doc.audit_stages || []).find((row) => !row.status);
  //     if (next_row) {
  //       frm
  //         .add_custom_button(
  //           __("Send to {0}", [next_row.stage_name]),
  //           function () {
  //             frappe.call({
  //               method:
  //                 "audit_management.audit_management.doctype.my_audits.my_audits.send_to_next_stage",
  //               args: { docname: frm.doc.name },
  //               callback: function (r) {
  //                 if (r.message) {
  //                   frappe.show_alert({
  //                     message: r.message,
  //                     indicator: "green",
  //                   });
  //                   frm.reload_doc();
  //                 }
  //               },
  //             });
  //           },
  //           __("Actions"),
  //         )
  //         .css({ "background-color": "#28a745", color: "white" });
  //     }
  //     frm
  //       .add_custom_button(
  //         __("Close Query"),
  //         function () {
  //           frm.trigger("handle_close_query");
  //         },
  //         __("Actions"),
  //       )
  //       .css({ "background-color": "#dc3545", color: "white" });
  //   }

  //   // --- NEW MODAL LOGIC FOR SUBMIT RESPONSE ---
  //   const pending_row = (frm.doc.audit_stages || []).find(
  //     (row) => row.status === "Pending" && row.user_id === current_user,
  //   );

  //   if (pending_row) {
  //     frm
  //       .add_custom_button(__("Submit Response"), function () {

  //         // Create the Modal Dialog
  //         let d = new frappe.ui.Dialog({
  //           title: __("Submit Audit Response"),
  //           fields: [
  //               {
  //                   label: __("Your Response"),
  //                   fieldname: "response_text",
  //                   fieldtype: "Small Text", // Uses rich text for better formatting
  //                   reqd: 1, // Makes it mandatory
  //                   default: frm.doc.current_response_box || "" // Pre-fill if they typed something before clicking
  //               },
  //               {
  //                   label: __("Attachment (Optional)"),
  //                   fieldname: "attachment",
  //                   fieldtype: "Attach",
  //                   default: frm.doc.current_response_attach || ""
  //               }
  //           ],
  //           primary_action_label: __("Submit"),
  //           primary_action(values) {
  //               // When the user clicks Submit inside the modal
  //               frappe.call({
  //                 method: "audit_management.audit_management.doctype.my_audits.my_audits.submit_response",
  //                 args: {
  //                   docname: frm.doc.name,
  //                   response_text: values.response_text,
  //                   attachment: values.attachment || "",
  //                 },
  //                 freeze: true,
  //                 freeze_message: __("Submitting Response..."),
  //                 callback: function (r) {
  //                   if (r.message) {
  //                     frappe.show_alert({ message: r.message, indicator: "green" });
  //                     d.hide(); // Close the modal
  //                     frm.reload_doc(); // Reload page to show updated status
  //                   }
  //                 },
  //               });
  //           }
  //         });

  //         d.show(); // Display the modal to the user

  //       })
  //       .css({ "background-color": "#1e6eb2", color: "white" });
  //   }
  // },

  // current working
  //   setup_dynamic_buttons: function (frm) {
  //   if (frm.is_new() || frm.doc.status === "Closed") return;

  //   const current_user = frappe.session.user;

  //   const has_action_access =
  //     frappe.user.has_role("Audit Manager") ||
  //     frappe.user.has_role("Audit Member") ||
  //     frappe.user.has_role("Administrator") ||
  //     current_user === "Administrator";

  //   if (has_action_access) {
  //     const next_row = (frm.doc.audit_stages || []).find((row) => !row.status);

  //     if (next_row) {
  //       frm.add_custom_button(
  //         __("Send to {0}", [next_row.stage_name]),
  //         function () {
  //           frappe.call({
  //             method: "audit_management.audit_management.doctype.my_audits.my_audits.send_to_next_stage",
  //             args: { docname: frm.doc.name },
  //             callback: function (r) {
  //               if (r.message) {
  //                 frappe.show_alert({ message: r.message, indicator: "green" });
  //                 frm.reload_doc();
  //               }
  //             },
  //           });
  //         },
  //         __("Actions")
  //       ).css({ "background-color": "#28a745", color: "white" });
  //     }

  //     frm.add_custom_button(
  //       __("Close Query"),
  //       function () {
  //         frm.trigger("handle_close_query");
  //       },
  //       __("Actions")
  //     ).css({ "background-color": "#dc3545", color: "white" });
  //   }

  //   const pending_row = (frm.doc.audit_stages || []).find(
  //     (row) => row.status === "Pending" && row.user_id === current_user
  //   );

  //   if (pending_row) {
  //     frm.add_custom_button(__("Submit Response"), function () {
  //       let d = new frappe.ui.Dialog({
  //         title: __("Submit Response"),
  //         fields: [
  //           {
  //             label: __("Response"),
  //             fieldname: "response_text",
  //             fieldtype: "Small Text",
  //             reqd: 1,
  //           },
  //           {
  //             label: __("Attachment"),
  //             fieldname: "attachment",
  //             fieldtype: "Attach",
  //           },
  //         ],
  //         primary_action_label: __("Submit"),
  //         primary_action(values) {
  //           frappe.call({
  //             method: "audit_management.audit_management.doctype.my_audits.my_audits.submit_response",
  //             args: {
  //               docname: frm.doc.name,
  //               response_text: values.response_text,
  //               attachment: values.attachment,
  //             },
  //             freeze: true,
  //             freeze_message: __("Submitting Response..."),
  //             callback: function (r) {
  //               if (r.message) {
  //                 d.hide();
  //                 frappe.show_alert({
  //                   message: r.message,
  //                   indicator: "green",
  //                 });
  //                 frm.reload_doc();
  //               }
  //             },
  //           });
  //         },
  //       });

  //       d.show();
  //     }).css({ "background-color": "#1e6eb2", color: "white" });
  //   }
  // },

  // my current working
  // setup_dynamic_buttons: function (frm) {
  //     if (frm.is_new() || frm.doc.status === "Closed") return;

  //     const is_audit_team = frappe.user.has_role("Audit Manager") || frappe.user.has_role("Audit Member");
  //     const current_user = frappe.session.user;

  //     // 1. DRAFT STATE: Only Audit Team can see "Raise Request" Action
  //     // if (frm.doc.status === "Draft" && is_audit_team) {
  //     //     frm.add_custom_button(__("Raise Request"), function () {

  //     //         // Get available stages from the child table
  //     //         let stages = (frm.doc.audit_stages || []).map(r => r.stagename);
  //     //         if (!stages.length) {
  //     //             frappe.msgprint("<b>Please add stages in the operational tracking section first.</b>");
  //     //             return;
  //     //         }

  //     //         // Prompt auditor to select who gets the ticket first
  //     //         frappe.prompt([
  //     //             {
  //     //                 label: 'Select Target Stage',
  //     //                 fieldname: 'stagename',
  //     //                 fieldtype: 'Select',
  //     //                 options: stages.join('\n'),
  //     //                 reqd: 1,
  //     //                 description: "Select the stage to send this request to."
  //     //             }
  //     //         ], function(values) {
  //     //             frappe.call({
  //     //                 method: "auditmanagement.auditmanagement.doctype.myaudits.myaudits.raise_request",
  //     //                 args: {
  //     //                     docname: frm.doc.name,
  //     //                     stagename: values.stagename
  //     //                 },
  //     //                 freeze: true,
  //     //                 freeze_message: "Raising Request...",
  //     //                 callback: function(r) {
  //     //                     if (!r.exc) {
  //     //                         frappe.show_alert({message: "Request Raised Successfully", indicator: "green"});
  //     //                         frm.reload_doc();
  //     //                     }
  //     //                 }
  //     //             });
  //     //         }, __('Raise Audit Request'), __('Raise Request'));

  //     //     }, __("Actions")).css({ "background-color": "#007bff", "color": "white" });
  //     // }

  //     		// 1. DRAFT STATE: Only Audit Team can see "Raise Request" Action
  // 		if (frm.doc.status === "Draft" && is_audit_team) {
  // 			frm.add_custom_button(__('Raise Request'), function() {
  // 				// FIX 1: Use frm.doc.auditstages (no underscore) to match your Python/Doctype schema
  // 				let stages = (frm.doc.auditstages || []).map(r => r.stagename);

  // 				if (!stages.length) {
  // 					frappe.msgprint('<b>Please add stages in the operational tracking section first. Ensure you have saved the document.</b>');
  // 					return;
  // 				}

  // 				// Prompt auditor to select who gets the ticket first
  // 				frappe.prompt([
  // 					{
  // 						label: 'Select Target Stage',
  // 						fieldname: 'stagename',
  // 						fieldtype: 'Select',
  // 						options: stages.join('\n'), // FIX 2: Creates the newline separated options list
  // 						default: stages[0],         // FIX 3: Automatically selects the first stage
  // 						reqd: 1,
  // 						description: 'Select the stage to send this request to.'
  // 					}
  // 				], function(values) {
  // 					frappe.call({
  // 						method: "auditmanagement.auditmanagement.doctype.myaudits.myaudits.raise_request",
  // 						args: {
  // 							docname: frm.doc.name,
  // 							stagename: values.stagename
  // 						},
  // 						freeze: true,
  // 						freeze_message: "Raising Request...",
  // 						callback: function(r) {
  // 							if (!r.exc) {
  // 								frappe.show_alert({message: __('Request Raised Successfully'), indicator: 'green'});
  // 								frm.reload_doc();
  // 							}
  // 						}
  // 					});
  // 				}, __('Raise Audit Request'), __('Raise Request'));
  // 			}, __('Actions')).css({"background-color": "#007bff", "color": "white"});
  // 		}

  //     // 2. PENDING STATE: Find the exact row that is currently pending
  //     const pending_row = (frm.doc.audit_stages || []).find(
  //         (row) => row.status === "Pending" && (row.userid === current_user || row.email === current_user)
  //     );

  //     // Show Submit Response ONLY if the document is pending, and the logged-in user is the current active assignee
  //     if (pending_row && frm.doc.status === "Pending") {
  //         frm.add_custom_button(__("Submit Response"), function () {

  //             let d = new frappe.ui.Dialog({
  //                 title: 'Submit Response',
  //                 fields: [
  //                     {
  //                         label: 'Response',
  //                         fieldname: 'response_text',
  //                         fieldtype: 'Small Text',
  //                         reqd: 1,
  //                     },
  //                     {
  //                         label: 'Attachment',
  //                         fieldname: 'attachment',
  //                         fieldtype: 'Attach',
  //                     }
  //                 ],
  //                 primary_action_label: 'Submit',
  //                 primary_action: function (values) {
  //                     frappe.call({
  //                         method: "auditmanagement.auditmanagement.doctype.myaudits.myaudits.submit_response",
  //                         args: {
  //                             docname: frm.doc.name,
  //                             response_text: values.response_text,
  //                             attachment: values.attachment,
  //                         },
  //                         freeze: true,
  //                         freeze_message: "Submitting Response...",
  //                         callback: function (r) {
  //                             if (r.message) {
  //                                 d.hide();
  //                                 frappe.show_alert({ message: r.message, indicator: "green" });
  //                                 frm.reload_doc();
  //                             }
  //                         }
  //                     });
  //                 }
  //             });
  //             d.show();
  //         }).css({ "background-color": "#1e6eb2", "color": "white" });
  //     }

  //     // 3. AUDITOR REVIEW (Close Query or Escalate)
  //     if (frm.doc.status === "Pending" && is_audit_team) {

  //         // Add Close Query button
  //         frm.add_custom_button(__("Close Query"), function () {
  //             frm.trigger("handle_close_query");
  //         }, __("Actions")).css({ "background-color": "#dc3545", "color": "white" });

  //         // Add Manual Escalate/Re-assign button if needed
  //         const next_row = frm.doc.audit_stages.find(row => !row.status);
  //         if (next_row) {
  //             frm.add_custom_button(__("Send to {0}", [next_row.stagename]), function () {
  //                 frappe.call({
  //                     method: "auditmanagement.auditmanagement.doctype.myaudits.myaudits.send_to_next_stage",
  //                     args: { docname: frm.doc.name },
  //                     callback: function (r) {
  //                         if (r.message) {
  //                             frappe.show_alert({ message: r.message, indicator: "green" });
  //                             frm.reload_doc();
  //                         }
  //                     }
  //                 });
  //             }, __("Actions")).css({ "background-color": "#28a745", "color": "white" });
  //         }
  //     }
  // },

  // setup_dynamic_buttons: function (frm) {
  //     // Return early if it's a completely new, unsaved document, or if it's closed.
  //     if (frm.is_new() || frm.doc.status === "Closed") return;

  //     const is_audit_team = frappe.user.has_role("Audit Manager") || frappe.user.has_role("Audit Member");
  //     const current_user = frappe.session.user;

  //     // 🌟 FIX: Safely retrieve the child table regardless of whether it's named 'auditstages' or 'audit_stages'
  //     const audit_table = frm.doc.auditstages || frm.doc.audit_stages || [];

  //     // 1. DRAFT STATE: Only Audit Team can see "Raise Request" Action
  //     if (frm.doc.status === "Draft" && is_audit_team) {
  //         frm.add_custom_button(__('Raise Request'), function() {

  //             // 🌟 FIX: Safely extract the stage names and filter out any empty data
  //             let stages = audit_table
  //                 .map(r => r.stagename || r.stage_name)
  //                 .filter(Boolean);

  //             if (stages.length === 0) {
  //                 frappe.msgprint('<b>Please add stages in the operational tracking section first. Ensure you have saved the document.</b>');
  //                 return;
  //             }

  //             // Prompt auditor to select who gets the ticket first
  //             frappe.prompt([
  //                 {
  //                     label: 'Select Target Stage',
  //                     fieldname: 'stagename',
  //                     fieldtype: 'Select',
  //                     options: stages.join('\n'), // Renders options correctly
  //                     default: stages[0],         // Sets default to the first stage
  //                     reqd: 1,
  //                     description: 'Select the stage to send this request to.'
  //                 }
  //             ], function(values) {
  //                 frappe.call({
  //                     method: "audit_management.audit_management.doctype.my_audits.my_audits.raise_request",
  //                     args: {
  //                         docname: frm.doc.name,
  //                         stagename: values.stagename
  //                     },
  //                     freeze: true,
  //                     freeze_message: "Raising Request...",
  //                     callback: function(r) {
  //                         if (!r.exc) {
  //                             frappe.show_alert({message: __('Request Raised Successfully'), indicator: 'green'});
  //                             frm.reload_doc();
  //                         }
  //                     }
  //                 });
  //             }, __('Raise Audit Request'), __('Raise Request'));
  //         }, __('Actions')).css({"background-color": "#007bff", "color": "white"});
  //     }

  //     // 2. PENDING STATE: Find the exact row that is currently pending
  //     // 🌟 FIX: Used the safe `audit_table` variable to prevent "Cannot read properties of undefined (reading 'find')" errors
  //     const pending_row = audit_table.find(
  //         (row) => row.status === "Pending" && (row.userid === current_user || row.email === current_user)
  //     );

  //     // Show Submit Response ONLY if the document is pending, and the logged-in user is the current active assignee
  //     if (pending_row && frm.doc.status === "Pending") {
  //         frm.add_custom_button(__("Submit Response"), function () {

  //             let d = new frappe.ui.Dialog({
  //                 title: 'Submit Response',
  //                 fields: [
  //                     {
  //                         label: 'Response',
  //                         fieldname: 'response_text',
  //                         fieldtype: 'Small Text',
  //                         reqd: 1,
  //                     },
  //                     {
  //                         label: 'Attachment',
  //                         fieldname: 'attachment',
  //                         fieldtype: 'Attach',
  //                     }
  //                 ],
  //                 primary_action_label: 'Submit',
  //                 primary_action: function (values) {
  //                     frappe.call({
  //                         method: "audit_management.audit_management.doctype.my_audits.my_audits.submit_response",
  //                         args: {
  //                             docname: frm.doc.name,
  //                             response_text: values.response_text,
  //                             attachment: values.attachment,
  //                         },
  //                         freeze: true,
  //                         freeze_message: "Submitting Response...",
  //                         callback: function (r) {
  //                             if (r.message) {
  //                                 d.hide();
  //                                 frappe.show_alert({ message: r.message, indicator: "green" });
  //                                 frm.reload_doc();
  //                             }
  //                         }
  //                     });
  //                 }
  //             });
  //             d.show();
  //         }).css({ "background-color": "#1e6eb2", "color": "white" });
  //     }

  //     // 3. AUDITOR REVIEW (Close Query or Escalate)
  //     if (frm.doc.status === "Pending" && is_audit_team) {

  //         // Add Close Query button
  //         frm.add_custom_button(__("Close Query"), function () {
  //             frm.trigger("handle_close_query");
  //         }, __("Actions")).css({ "background-color": "#dc3545", "color": "white" });

  //         // Add Manual Escalate/Re-assign button if needed
  //         // 🌟 FIX: Safely find the next row using `audit_table`
  //         const next_row = audit_table.find(row => !row.status);
  //         if (next_row) {
  //             frm.add_custom_button(__("Send to {0}", [next_row.stagename || next_row.stage_name]), function () {
  //                 frappe.call({
  //                     method: "audit_management.audit_management.doctype.my_audits.my_audits.send_to_next_stage",
  //                     args: { docname: frm.doc.name },
  //                     callback: function (r) {
  //                         if (r.message) {
  //                             frappe.show_alert({ message: r.message, indicator: "green" });
  //                             frm.reload_doc();
  //                         }
  //                     }
  //                 });
  //             }, __("Actions")).css({ "background-color": "#28a745", "color": "white" });
  //         }
  //     }
  // },

  setup_dynamic_buttons: function (frm) {
    if (frm.is_new()) return;

    const is_audit_team =
      frappe.user.has_role("Audit Manager") ||
      frappe.user.has_role("Audit Member");
    const current_user = (frappe.session.user || "").toLowerCase();
    const audit_table = frm.doc.auditstages || frm.doc.audit_stages || [];

    // View Audit History Button (Prominent)
    if (!frm.is_new()) {
      frm
        .add_custom_button(__("Audit History"), function () {
          frappe.call({
            method:
              "audit_management.audit_management.doctype.my_audits.my_audits.get_audit_history_summary",
            args: { docname: frm.doc.name },
            callback: function (r) {
              let rows = r.message;
              let html = `<table class='table table-bordered table-striped' id='audit-history-table'>
                        <thead><tr><th>Sr.</th><th>Event</th><th>User</th><th>Date/Time</th><th>Status</th></tr></thead>
                        <tbody>`;
              rows.forEach((row, index) => {
                html += `<tr><td>${index + 1}</td><td>${row.event}</td><td>${row.user}</td><td>${row.date}</td><td>${row.status}</td></tr>`;
              });
              html += `</tbody></table>`;

              let d = new frappe.ui.Dialog({
                title: __("Audit History"),
                size: "extra-large",
              });

              // Add Export button to header
              d.header.append(
                `<button class="btn btn-sm btn-primary" style="margin-right: 40px;">Export to CSV</button>`,
              );
              d.header.find(".btn-primary").on("click", () => {
                frappe.tools.downloadify(
                  rows,
                  ["event", "user", "date", "status"],
                  "AuditHistory",
                );
              });

              d.show();
              $(d.body).html(html);
            },
          });
        })
        .css({ "background-color": "#4a90e2", color: "white" });
    }

    // 0. REOPEN LOGIC: Only Audit Team can reopen a Closed query
    frm.trigger("reopen_query");

    if (frm.doc.status === "Closed") return;

    // 1. DRAFT STATE: Only Audit Team can see "Raise Request" Action
    if (is_audit_team) {
      frm
        .add_custom_button(__("Send"), function () {
          let stages = audit_table
            .filter((r) => r.stage_name)
            .map((r) => {
              return {
                name: r.stage_name,
                employee_name: r.employee_name || "Unassigned",
                status: r.status,
                is_sent: !!r.status,
              };
            });

          if (stages.length === 0) {
            frappe.msgprint(
              "<b>Please add stages in the operational tracking section first. Ensure you have saved the document.</b>",
            );
            return;
          }

          let html_content = `
                <div style="padding: 10px;">
                    <div style="border-bottom: 1px solid #d1d8dd; padding-bottom: 10px; margin-bottom: 15px;">
                        <label class="checkbox-inline" style="font-weight: bold; cursor: pointer; display: flex; align-items: center;">
                            <input type="checkbox" id="select-all-stages" style="margin-right: 10px; width: 18px; height: 18px;"> 
                            <span style="font-size: 14px;">${__("Select All Stages")}</span>
                        </label>
                    </div>
                    <div style="max-height: 450px; overflow-y: auto;">
                        <table class="table table-bordered table-hover" style="font-size: 13px;">
                            <thead style="background-color: #f8f9fa;">
                                <tr>
                                    <th style="width: 40px; text-align: center;">#</th>
                                    <th style="width: 150px;">${__("Stage Name")}</th>
                                    <th style="width: 200px;">${__("User Name")}</th>
                                    <th style="width: 180px;">${__("Status / Action")}</th>
                                </tr>
                            </thead>
                            <tbody id="stage-table-body">
                                ${stages
                                  .map(
                                    (s) => `
                                    <tr>
                                        <td style="text-align: center; vertical-align: middle;">
                                            <input type="checkbox" class="stage-checkbox" value="${s.name}" 
                                                ${s.is_sent ? "checked disabled" : ""} 
                                                style="width: 16px; height: 16px;">
                                        </td>
                                        <td style="vertical-align: middle; font-weight: 500;">${s.name}</td>
                                        <td style="vertical-align: middle;">${s.employee_name}</td>
                                        <td style="vertical-align: middle;">
                                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                                <span style="color: ${s.is_sent ? "#28a745" : "#6c757d"}; font-weight: ${s.is_sent ? "bold" : "normal"};">
                                                    ${s.is_sent ? s.status : __("Not Sent")}
                                                </span>
                                                ${
                                                  [
                                                    "Pending",
                                                    "No Response",
                                                  ].includes(s.status)
                                                    ? `
                                                    <span class="rollback-btn text-danger" data-stage="${s.name}" title="Rollback Stage" style="cursor: pointer; font-weight: bold; font-size: 22px; line-height: 1; margin-left: 10px;">
                                                        &times;
                                                    </span>
                                                `
                                                    : ""
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                `,
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

          let d = new frappe.ui.Dialog({
            title: __("Send Audit Query"),
            size: "extra-large",
            fields: [
              {
                fieldname: "stagename_html",
                fieldtype: "HTML",
                options: html_content,
              },
            ],
            primary_action_label: __("Submit"),
            primary_action: function () {
              let selected_stages = [];
              d.$wrapper
                .find(".stage-checkbox:checked:not(:disabled)")
                .each(function () {
                  selected_stages.push($(this).val());
                });

              if (selected_stages.length === 0) {
                frappe.msgprint(__("Please select at least one new stage."));
                return;
              }

              frappe.call({
                method:
                  "audit_management.audit_management.doctype.my_audits.my_audits.raise_multi_request",
                args: {
                  docname: frm.doc.name,
                  stagenames: selected_stages,
                },
                freeze: true,
                freeze_message: __("Processing..."),
                callback: function (r) {
                  if (!r.exc) {
                    frappe.show_alert({
                      message: __("Stages Assigned Successfully"),
                      indicator: "green",
                    });
                    frm.reload_doc();
                    d.hide();
                  }
                },
              });
            },
          });

          d.show();

          // Rollback Logic
          d.$wrapper.find(".rollback-btn").on("click", function () {
            let stagename = $(this).data("stage");
            // Find the row object corresponding to the stage to get its unique name
            let row = audit_table.find(
              (r) => (r.stage_name || r.stagename) === stagename,
            );
            let row_name = row ? row.name : null;

            frappe.confirm(
              `Are you sure you want to rollback <b>${stagename}</b> stage?`,
              () => {
                frappe.call({
                  method:
                    "audit_management.audit_management.doctype.my_audits.my_audits.rollback_stage",
                  args: {
                    docname: frm.doc.name,
                    stagename: stagename,
                    row_name: row_name,
                  },
                  callback: function (r) {
                    if (r.message) {
                      frappe.show_alert({
                        message: __("Stage rolled back successfully"),
                        indicator: "green",
                      });
                      d.hide();
                      frm.reload_doc();
                    }
                  },
                  error: function (err) {
                    console.error("Rollback Stage Error:", err);
                    frappe.msgprint(
                      __("An error occurred while rolling back the stage."),
                    );
                  },
                });
              },
            );
          });

          // Select All logic
          d.$wrapper.find("#select-all-stages").on("change", function () {
            let checked = $(this).prop("checked");
            // Only affect non-disabled checkboxes
            d.$wrapper
              .find(".stage-checkbox:not(:disabled)")
              .prop("checked", checked);
          });

          // Individual checkbox logic
          d.$wrapper
            .find(".stage-checkbox:not(:disabled)")
            .on("change", function () {
              let all_checkables = d.$wrapper.find(
                ".stage-checkbox:not(:disabled)",
              );
              let all_checked =
                all_checkables.filter(":checked").length ===
                all_checkables.length;
              d.$wrapper
                .find("#select-all-stages")
                .prop("checked", all_checked);
            });
        })
        .css({ "background-color": "#007bff", color: "white" });
    }

    // 2. PENDING STATE: Find the exact row that is currently pending
    const pending_row = audit_table.find((row) => {
      // 🌟 FIX: Look for 'user_id' instead of 'userid' based on your schema
      let r_user = (row.user_id || row.userid || "").toLowerCase();
      let status = row.status;

      let is_match =
        (status === "Pending" || status === "No Response") &&
        r_user === current_user;

      console.log(
        `-> Current User: ${current_user} | Row Stage: ${row.stagename || row.stage_name} | Status: ${status} | Row UserID: ${r_user} | Matches? ${is_match}`,
      );

      return is_match;
    });

    // 🌟 DYNAMIC GUIDANCE BANNER 🌟
    if (pending_row) {
      console.log(
        "-> [DEBUG] pending_row found. Calling show_action_banner via frm.events...",
      );
      if (frm.events && frm.events.show_action_banner) {
        frm.events.show_action_banner(frm, { row: pending_row });
      } else {
        console.error("-> [DEBUG] show_action_banner not found in frm.events!");
        // Direct call fallback if trigger is also weird
        frm.trigger("show_action_banner", { row: pending_row });
      }
    } else {
      console.log("-> [DEBUG] No pending_row found. Removing banner.");
      if (frm.dashboard) frm.dashboard.clear_headline();
    }

    // Show Submit Response ONLY if the document is pending, and the logged-in user is the current active assignee
    if (pending_row && frm.doc.status === "Pending") {
      frm
        .add_custom_button(__("Submit Response"), function () {
          let d = new frappe.ui.Dialog({
            title: "Submit Response",
            fields: [
              {
                label: "Response",
                fieldname: "response_text",
                fieldtype: "Small Text",
                reqd: 1,
              },
              {
                label: "Attachment",
                fieldname: "attachment",
                fieldtype: "Attach",
              },
            ],
            primary_action_label: "Submit",
            primary_action: function (values) {
              frappe.call({
                method:
                  "audit_management.audit_management.doctype.my_audits.my_audits.submit_response",
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
                    frappe.show_alert({
                      message: r.message,
                      indicator: "green",
                    });
                    frm.reload_doc();
                  }
                },
                error: function (err) {
                  console.error("Submit Response Error:", err);
                  frappe.msgprint(
                    __(
                      "An error occurred while submitting your response. Please check your network connection or contact IT support.",
                    ),
                  );
                },
              });
            },
          });
          d.show();
        })
        .css({ "background-color": "#1e6eb2", color: "white" });
    }

    // 3. AUDITOR REVIEW (Close Query or Escalate)
    if (is_audit_team) {
      // Permanent Close Query Button
      frm
        .add_custom_button(__("Close Query"), function () {
          frm.trigger("handle_close_query");
        })
        .css({ "background-color": "#dc3545", color: "white" });

      // const next_row = audit_table.find((row) => !row.status);
      // if (next_row) {
      //   frm
      //     .add_custom_button(
      //       __("Send to {0}", [next_row.stagename || next_row.stage_name]),
      //       function () {
      //         frappe.call({
      //           method:
      //             "audit_management.audit_management.doctype.my_audits.my_audits.send_to_next_stage",
      //           args: { docname: frm.doc.name },
      //           callback: function (r) {
      //             if (r.message) {
      //               frappe.show_alert({
      //                 message: r.message,
      //                 indicator: "green",
      //               });
      //               frm.reload_doc();
      //             }
      //           },
      //         });
      //       }
      //     )
      //     .css({ "background-color": "#28a745", color: "white" });
      // }
    }
  },

  // handle_read_only_new: function (frm) {
  //   const is_audit_team =
  //     frappe.user.has_role("Audit Manager") ||
  //     frappe.user.has_role("Audit Member");

  //   const current_user = frappe.session.user;

  //   const pending_row = (frm.doc.audit_stages || []).find(
  //     (row) => row.status === "Pending" && row.user_id === current_user,
  //   );

  //   const is_pending_for_me = !!pending_row;

  //   // Hide Save button if pending for me (to show only Submit Response)
  //   // But keep it for Audit Team who might need to save resolution details
  //   if (is_pending_for_me && !is_audit_team) {
  //     frm.disable_save();
  //   } else if (is_audit_team || frm.doc.status === "Draft") {
  //     frm.enable_save();
  //   }

  //   if (!is_audit_team && frm.doc.status !== "Draft") {
  //     [
  //       "audit_query_box",
  //       "audit_query_subject_box",
  //       "emp_branch",
  //       "query_type",
  //       "audit_attach_box",
  //     ].forEach((f) => {
  //       frm.set_df_property(f, "read_only", 1);
  //     });
  //   }

  //   frm.set_df_property("audit_stages", "read_only", 1);

  //   if (is_audit_team) {
  //     frm.toggle_display("audit_items_section", true);
  //     frm.toggle_display("audit_stages", true);
  //   }

  //   // Show response section only for current pending stage user
  //   frm.toggle_display("response_section", is_pending_for_me);

  //   // IMPORTANT: hidden fields ko runtime par unhide karo
  //   frm.set_df_property("current_response_box", "hidden", !is_pending_for_me);

  //   frm.set_df_property(
  //     "current_response_attach",
  //     "hidden",
  //     !is_pending_for_me,
  //   );

  //   // Optional: existing response populate kar do
  //   if (pending_row) {
  //     frm.set_value("current_response_box", pending_row.response || "");
  //     frm.set_value("current_response_attach", pending_row.attachment || "");
  //   } else {
  //     frm.set_value("current_response_box", "");
  //     frm.set_value("current_response_attach", "");
  //   }

  //   frm.refresh_field("current_response_box");
  //   frm.refresh_field("current_response_attach");

  //   if (frm.doc.status === "Closed") {
  //     frm.disable_form();
  //   }
  // },

  handle_read_only_new: function (frm) {
    const is_audit_team =
      frappe.user.has_role("Audit Manager") ||
      frappe.user.has_role("Audit Member");

    const current_user = frappe.session.user;

    const pending_row = (frm.doc.audit_stages || []).find(
      (row) => row.status === "Pending" && row.user_id === current_user,
    );

    const is_pending_for_me = !!pending_row;

    // 1. Save Button Logic
    // if (is_pending_for_me && !is_audit_team) {
    //   frm.disable_save();
    // } else if (is_audit_team || frm.doc.status === "Draft") {
    //   frm.enable_save();
    // }
    // 1. Strict Save Button Logic
    if (!frm.is_new() && frm.doc.status !== "Draft") {
      frm.disable_save(); // Completely hides the Save button for everyone
    } else {
      frm.enable_save(); // Shows it only during New / Draft states
    }

    // 2. Audit Details Read-Only Logic
    if (!is_audit_team && frm.doc.status !== "Draft") {
      [
        "audit_query_box",
        "audit_query_subject_box",
        "emp_branch",
        "risk",
        "query_type",
        "audit_attach_box",
      ].forEach((f) => {
        frm.set_df_property(f, "read_only", 1);
      });
    }

    frm.set_df_property("audit_stages", "read_only", 1);

    // 3. Section Visibility
    if (is_audit_team) {
      frm.toggle_display("audit_items_section", true);
      frm.toggle_display("audit_stages", true);
    }

    // Show the resolution section ONLY when the query is closed
    frm.toggle_display("resolution_section", frm.doc.status === "Closed");
    // ---------------------------------------------------------

    // 5. Freeze Completed Stage Response Boxes
    const stages_mapping = [
      { status_field: "bm_user_status", box_field: "bm_response_box" },
      { status_field: "dh_user_status", box_field: "dh_response_box" },
      { status_field: "com_user_status", box_field: "com_response_box" },
      { status_field: "rm_user_status", box_field: "rm_response_box" },
      { status_field: "rom_user_status", box_field: "rom_response_box" },
      { status_field: "zm_user_status", box_field: "zm_response_box" },
      { status_field: "zom_user_status", box_field: "zom_response_box" },
      { status_field: "gm_user_status", box_field: "gm_response_box" },
      { status_field: "hr_user_status", box_field: "hr_response_box" },
      { status_field: "coo_user_status", box_field: "coo_response_box" },
      { status_field: "ceo_user_status", box_field: "ceo_response_box" },
    ];

    stages_mapping.forEach((stage) => {
      if (frm.doc[stage.status_field] === "Responded") {
        frm.set_df_property(stage.box_field, "read_only", 1);
      }
    });

    // Hide old generic current_response_box since we moved to the Modal
    frm.set_df_property("current_response_box", "hidden", 1);
    frm.set_df_property("current_response_attach", "hidden", 1);
    frm.toggle_display("response_section", false);

    if (frm.doc.status === "Closed") {
      frm.disable_form();
    }
  },

  handle_close_query: function (frm) {
    let d = new frappe.ui.Dialog({
      title: __("Enter Resolution Details"),
      fields: [
        {
          label: __("RCA Category"),
          fieldname: "rca_category",
          fieldtype: "Link",
          options: "Audit RCA Category",
          reqd: 1,
          default: frm.doc.rca_category,
          onchange: function () {
            let val = this.get_value();
            if (val) {
              frappe.db.get_value(
                "Audit RCA Category",
                val,
                "root_cause_analysis",
                (r) => {
                  if (r && r.root_cause_analysis) {
                    d.set_value("root_cause_analysis", r.root_cause_analysis);
                  }
                },
              );
            }
          },
        },
        {
          fieldtype: "HTML",
          fieldname: "rca_help",
          options: `<div class="small text-muted" style="margin-top: -10px; margin-bottom: 10px;">
            If the category is not present, use Create New in the link above.
          </div>`,
        },
        {
          label: __("Root Cause Analysis (RCA)"),
          fieldname: "root_cause_analysis",
          fieldtype: "Text Editor",
          default: frm.doc.root_cause_analysis,
        },
        {
          label: __("Action Point with TAT and Closure"),
          fieldname: "action_point_with_tat",
          fieldtype: "Small Text",
          default: frm.doc.action_point_with_tat,
        },
        {
          label: __("Recommendations"),
          fieldname: "recommendations",
          fieldtype: "Small Text",
          default: frm.doc.recommendations,
        },
        {
          label: __("Closing Remark"),
          fieldname: "closing_remark",
          fieldtype: "Small Text",
          reqd: 1,
          default: frm.doc.closing_remark,
        },
      ],
      primary_action_label: __("Close Query"),
      primary_action(data) {
        d.hide();
        frm.set_value("rca_category", data.rca_category);
        frm.set_value("root_cause_analysis", data.root_cause_analysis);
        frm.set_value("action_point_with_tat", data.action_point_with_tat);
        frm.set_value("recommendations", data.recommendations);
        frm.set_value("closing_remark", data.closing_remark);
        frm.set_value("closing_date", frappe.datetime.nowdate());
        frm.set_value("status", "Closed");
        frm.save().then((r) => {
          if (!r.exc) {
            frappe.show_alert({
              message: __("Query Closed Successfully"),
              indicator: "green",
            });
            frm.reload_doc();
          }
        });
      },
    });
    d.show();
  },

  audit_query_subject_box: function (frm) {
    if (frm.doc.audit_query_subject_box) {
      const current_value = frm.doc.audit_query_subject_box;
      frm.set_value(
        "audit_query_subject_box",
        current_value.charAt(0).toUpperCase() + current_value.slice(1),
      );
    }
  },

  fetch_query_maker_data_new: function (frm) {
    const user_id = frappe.session.user;
    const emp_id = user_id.match(/\d+/) ? user_id.match(/\d+/)[0] : user_id;
    frappe.call({
      method:
        "audit_management.audit_management.doctype.my_audits.my_audits.fetch_employee_data",
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

  emp_branch: function (frm) {
    if (!frm.doc.emp_branch) return;
    frappe.db
      .get_single_value("Audit Management Settings", "use_new_system")
      .then((use_new_system) => {
        if (use_new_system) {
          frm.db
            .get_doc("Audit Level", frm.doc.emp_branch)
            .then((audit_level) => {
              const mapping = {
                bm: "stage_1_bm",
                dh: "stage_2_dh",
                com: "stage_2_com",
                rm: "stage_3_rm",
                rom: "stage_3_rom",
                zm: "stage_4_zm",
                zom: "stage_4_zom",
                gm: "stage_5_gm",
                hr: "stage_6_hr",
                coo: "stage_8_coo",
                ceo: "stage_10_ceo",
              };
              for (let key in mapping) {
                let prefix = mapping[key];
                frm.set_value(key + "_name", audit_level[prefix + "_name"]);
                frm.set_value(key + "_mail", audit_level[prefix + "_mail"]);
                // Special handling for user_id field names if they vary
                let user_id_field =
                  key === "cfo" && !audit_level.stage_9_cfo_user_id
                    ? "stage_9_user_id"
                    : prefix + "_user_id";
                frm.set_value(key + "_user_id", audit_level[user_id_field]);
              }
            });
        }
      });
  },

  check_field_read_only: function (frm) {
    if (
      frappe.user.has_role("Audit Manager") ||
      frappe.user.has_role("Audit Member")
    ) {
      // No restriction
    } else {
      if (frm.doc.status !== "Draft") {
        frm.set_df_property("audit_query_box", "read_only", 1);
        frm.set_df_property("audit_query_subject_box", "read_only", 1);
        frm.set_df_property("emp_branch", "read_only", 1);
        frm.set_df_property("query_type", "read_only", 1);
        frm.set_df_property("audit_attach_box", "read_only", 1);
      }
    }
  },

  call_html_intro: function (frm) {
    frm.trigger("render_audit_status_tracker");
  },

  set_background_colors: function (frm) {
    const fields = [
      "bm_user_status",
      "dh_user_status",
      "com_user_status",
      "rm_user_status",
      "rom_user_status",
      "zm_user_status",
      "zom_user_status",
      "gm_user_status",
      "hr_user_status",
      "coo_user_status",
      "ceo_user_status",
    ];
    fields.forEach((f) => {
      let val = frm.doc[f];
      if (val === "Responded") {
        frm.set_df_property(
          f,
          "description",
          "<b style='color:green'>Responded</b>",
        );
      } else if (val === "Pending") {
        frm.set_df_property(
          f,
          "description",
          "<b style='color:red'>Pending</b>",
        );
      }
    });
  },

  // RESTORED OLD SYSTEM BUTTON HANDLERS
  show_sendResponse_btn: function (frm) {
    frm
      .add_custom_button(__("Send Response"), function () {
        if (
          (frappe.session.user == frm.doc.bm_user_id &&
            !frm.doc.bm_response_box) ||
          (frappe.session.user == frm.doc.dh_user_id &&
            !frm.doc.dh_response_box) ||
          (frappe.session.user == frm.doc.com_user_id &&
            !frm.doc.com_response_box) ||
          (frappe.session.user == frm.doc.rm_user_id &&
            !frm.doc.rm_response_box) ||
          (frappe.session.user == frm.doc.rom_user_id &&
            !frm.doc.rom_response_box) ||
          (frappe.session.user == frm.doc.zm_user_id &&
            !frm.doc.zm_response_box) ||
          (frappe.session.user == frm.doc.zom_user_id &&
            !frm.doc.zom_response_box) ||
          (frappe.session.user == frm.doc.gm_user_id &&
            !frm.doc.gm_response_box) ||
          (frappe.session.user == frm.doc.hr_user_id &&
            !frm.doc.hr_response_box) ||
          (frappe.session.user == frm.doc.coo_user_id &&
            !frm.doc.coo_response_box) ||
          (frappe.session.user == frm.doc.ceo_user_id &&
            !frm.doc.ceo_response_box)
        ) {
          frappe.msgprint(
            "<b>Before Sending Response, First input your response in the response box.</b>",
          );
          return;
        }
        frappe.confirm(
          "Do you want to send the response to the Audit Team ?",
          function () {
            if (
              frm.doc.bm_user_status === "Pending" ||
              frm.doc.bm_user_status === "No Response"
            ) {
              frm.set_value("query_status", "Response From BM");
              frm.set_value("bm_user_status", "Responded");
            }
            // ... [The rest of the complex multi-stage logic from my_audits_old]
            // For brevity, using the core logic recovered earlier
            const user = frappe.session.user;
            if (user == frm.doc.dh_user_id) {
              frm.set_value("dh_user_status", "Responded");
              frm.set_value("query_status", "Response From DH");
            } else if (user == frm.doc.com_user_id) {
              frm.set_value("com_user_status", "Responded");
              frm.set_value("query_status", "Response From COM");
            } else if (user == frm.doc.rm_user_id) {
              frm.set_value("rm_user_status", "Responded");
              frm.set_value("query_status", "Response From RM");
            } else if (user == frm.doc.rom_user_id) {
              frm.set_value("rom_user_status", "Responded");
              frm.set_value("query_status", "Response From ROM");
            } else if (user == frm.doc.zm_user_id) {
              frm.set_value("zm_user_status", "Responded");
              frm.set_value("query_status", "Response From ZM");
            } else if (user == frm.doc.zom_user_id) {
              frm.set_value("zom_user_status", "Responded");
              frm.set_value("query_status", "Response From ZOM");
            } else if (user == frm.doc.gm_user_id) {
              frm.set_value("gm_user_status", "Responded");
              frm.set_value("query_status", "Response From GM");
            } else if (user == frm.doc.hr_user_id) {
              frm.set_value("hr_user_status", "Responded");
              frm.set_value("query_status", "Response From HR");
            } else if (user == frm.doc.coo_user_id) {
              frm.set_value("coo_user_status", "Responded");
              frm.set_value("query_status", "Response From COO");
            } else if (user == frm.doc.ceo_user_id) {
              frm.set_value("ceo_user_status", "Responded");
              frm.set_value("query_status", "Response From CEO");
            }

            frm.save().then(() => {
              frappe.msgprint("<b>Response sent successfully!</b>");
            });
          },
        );
      })
      .css({ "background-color": "#28a745", color: "#ffffff" });
  },

  // show_sendToBmWithClose_btn: function (frm) {
  //   frm
  //     .add_custom_button(
  //       __("Send to BM"),
  //       function () {
  //         frappe.confirm(
  //           `Do you want to send query to the Level 1 (BM)?`,
  //           () => {
  //             frappe.call({
  //               method: "frappe.share.add",
  //               args: {
  //                 doctype: frm.doctype,
  //                 name: frm.docname,
  //                 user: frm.doc.bm_user_id,
  //                 read: 1,
  //                 write: 1,
  //                 share: 1,
  //                 notify: 0,
  //               },
  //               callback: function () {
  //                 frm.set_value("status", "Pending");
  //                 frm.set_value("query_status", "Pending From BM");
  //                 frm.set_value("bm_user_status", "Pending");
  //                 frm.frappecalltopendingtimefunction(frm, frm.docname, "bm");
  //                 frm.save();
  //               },
  //             });
  //           },
  //         );
  //       },
  //       "Send to",
  //     )
  //     .css({ "background-color": "#28a745", color: "#ffffff" });
  // },

  // // Commented out other sendTo buttons similarly ...
  // // I will comment out the rest for you.

  show_sendToDhComWithClose_btn: function (frm) {
    frm
      .add_custom_button(
        __("Send to DH/COM"),
        function () {
          frappe.confirm(
            `Do you want to send the query to the Level 2 (DH & COM)?`,
            () => {
              Promise.all([
                frappe.call({
                  method: "frappe.share.add",
                  args: {
                    doctype: frm.doctype,
                    name: frm.docname,
                    user: frm.doc.dh_user_id,
                    read: 1,
                    write: 1,
                    share: 1,
                    notify: 0,
                  },
                }),
                frappe.call({
                  method: "frappe.share.add",
                  args: {
                    doctype: frm.doctype,
                    name: frm.docname,
                    user: frm.doc.com_user_id,
                    read: 1,
                    write: 1,
                    share: 1,
                    notify: 0,
                  },
                }),
              ]).then(() => {
                frm.set_value("status", "Pending");
                frm.set_value("query_status", "Pending From DH & COM");
                frm.set_value("dh_user_status", "Pending");
                frm.set_value("com_user_status", "Pending");
                frm.frappecalltopendingtimefunction(frm, frm.docname, "dh_com");
                frm.save();
              });
            },
          );
        },
        "Send to",
      )
      .css({ "background-color": "#28a745", color: "#ffffff" });
  },

  show_sendToRmRomWithClose_btn: function (frm) {
    frm
      .add_custom_button(
        __("Send to RM/ROM"),
        function () {
          frappe.confirm(
            `Do you want to send the query to the Level 3 (RM & ROM)?`,
            () => {
              Promise.all([
                frappe.call({
                  method: "frappe.share.add",
                  args: {
                    doctype: frm.doctype,
                    name: frm.docname,
                    user: frm.doc.rm_user_id,
                    read: 1,
                    write: 1,
                    share: 1,
                    notify: 0,
                  },
                }),
                frappe.call({
                  method: "frappe.share.add",
                  args: {
                    doctype: frm.doctype,
                    name: frm.docname,
                    user: frm.doc.rom_user_id,
                    read: 1,
                    write: 1,
                    share: 1,
                    notify: 0,
                  },
                }),
              ]).then(() => {
                frm.set_value("status", "Pending");
                frm.set_value("query_status", "Pending From RM & ROM");
                frm.set_value("rm_user_status", "Pending");
                frm.set_value("rom_user_status", "Pending");
                frm.frappecalltopendingtimefunction(frm, frm.docname, "rm_rom");
                frm.save();
              });
            },
          );
        },
        "Send to",
      )
      .css({ "background-color": "#28a745", color: "#ffffff" });
  },

  show_sendToZmZomWithClose_btn: function (frm) {
    frm
      .add_custom_button(
        __("Send to ZM/ZOM"),
        function () {
          frappe.confirm(
            `Do you want to send the query to the Level 4 (ZM & ZOM)?`,
            () => {
              Promise.all([
                frappe.call({
                  method: "frappe.share.add",
                  args: {
                    doctype: frm.doctype,
                    name: frm.docname,
                    user: frm.doc.zm_user_id,
                    read: 1,
                    write: 1,
                    share: 1,
                    notify: 0,
                  },
                }),
                frappe.call({
                  method: "frappe.share.add",
                  args: {
                    doctype: frm.doctype,
                    name: frm.docname,
                    user: frm.doc.zom_user_id,
                    read: 1,
                    write: 1,
                    share: 1,
                    notify: 0,
                  },
                }),
              ]).then(() => {
                frm.set_value("status", "Pending");
                frm.set_value("query_status", "Pending From ZM & ZOM");
                frm.set_value("zm_user_status", "Pending");
                frm.set_value("zom_user_status", "Pending");
                frm.frappecalltopendingtimefunction(frm, frm.docname, "zm_zom");
                frm.save();
              });
            },
          );
        },
        "Send to",
      )
      .css({ "background-color": "#28a745", color: "#ffffff" });
  },

  show_sendToGm_withClose_btn: function (frm) {
    frm
      .add_custom_button(
        __("Send to GM"),
        function () {
          frappe.confirm(
            `Do you want to send the query to the Level 5 (GM)?`,
            () => {
              frappe.call({
                method: "frappe.share.add",
                args: {
                  doctype: frm.doctype,
                  name: frm.docname,
                  user: frm.doc.gm_user_id,
                  read: 1,
                  write: 1,
                  share: 1,
                  notify: 0,
                },
                callback: function () {
                  frm.set_value("status", "Pending");
                  frm.set_value("query_status", "Pending From GM");
                  frm.set_value("gm_user_status", "Pending");
                  frm.frappecalltopendingtimefunction(frm, frm.docname, "gm");
                  frm.save();
                },
              });
            },
          );
        },
        "Send to",
      )
      .css({ "background-color": "#28a745", color: "#ffffff" });
  },

  show_sendToHr_withClose_btn: function (frm) {
    frm
      .add_custom_button(
        __("Send to HR"),
        function () {
          frappe.confirm(`Do you want to send the query to the HR?`, () => {
            frappe.call({
              method: "frappe.share.add",
              args: {
                doctype: frm.doctype,
                name: frm.docname,
                user: frm.doc.hr_user_id,
                read: 1,
                write: 1,
                share: 1,
                notify: 1,
              },
              callback: function () {
                frm.set_value("status", "Pending");
                frm.set_value("query_status", "Pending From HR");
                frm.set_value("hr_user_status", "Pending");
                frm.frappecalltopendingtimefunction(frm, frm.docname, "hr");
                frm.save();
              },
            });
          });
        },
        "Send to",
      )
      .css({ "background-color": "#28a745", color: "#ffffff" });
  },

  show_sendToCOO_withClose_btn: function (frm) {
    frm
      .add_custom_button(
        __("Send to COO"),
        function () {
          frappe.confirm(`Do you want to send the query to the COO?`, () => {
            frappe.call({
              method: "frappe.share.add",
              args: {
                doctype: frm.doctype,
                name: frm.docname,
                user: frm.doc.coo_user_id,
                read: 1,
                write: 1,
                share: 1,
                notify: 1,
              },
              callback: function () {
                frm.set_value("status", "Pending");
                frm.set_value("query_status", "Pending From COO");
                frm.set_value("coo_user_status", "Pending");
                frm.frappecalltopendingtimefunction(frm, frm.docname, "coo");
                frm.save();
              },
            });
          });
        },
        "Send to",
      )
      .css({ "background-color": "#28a745", color: "#ffffff" });
  },

  show_sendToCEO_withClose_btn: function (frm) {
    frm
      .add_custom_button(
        __("Send to CEO"),
        function () {
          frappe.confirm(`Do you want to send the query to the CEO?`, () => {
            frappe.call({
              method: "frappe.share.add",
              args: {
                doctype: frm.doctype,
                name: frm.docname,
                user: frm.doc.ceo_user_id,
                read: 1,
                write: 1,
                share: 1,
                notify: 1,
              },
              callback: function () {
                frm.set_value("status", "Pending");
                frm.set_value("query_status", "Pending From CEO");
                frm.set_value("ceo_user_status", "Pending");
                frm.frappecalltopendingtimefunction(frm, frm.docname, "ceo");
                frm.save();
              },
            });
          });
        },
        "Send to",
      )
      .css({ "background-color": "#28a745", color: "#ffffff" });
  },

  show_sendToAll_withClose_btn: function (frm) {
    frm
      .add_custom_button(
        __("Send to ALL"),
        function () {
          frappe.confirm(
            "Do you want to send the query to all stages?",
            async () => {
              const users = [
                frm.doc.bm_user_id,
                frm.doc.dh_user_id,
                frm.doc.com_user_id,
                frm.doc.rm_user_id,
                frm.doc.rom_user_id,
                frm.doc.zm_user_id,
                frm.doc.zom_user_id,
                frm.doc.gm_user_id,
                frm.doc.hr_user_id,
                frm.doc.coo_user_id,
                frm.doc.ceo_user_id,
              ];
              for (let u of users) {
                if (u)
                  await frappe.call({
                    method: "frappe.share.add",
                    args: {
                      doctype: frm.doctype,
                      name: frm.docname,
                      user: u,
                      read: 1,
                      write: 1,
                      share: 1,
                      notify: 0,
                    },
                  });
              }
              const res = await frappe.call({
                method:
                  "audit_management.audit_management.doctype.my_audits.my_audits.send_to_all",
                args: { record: frm.docname },
              });
              if (res.message) {
                const m = res.message;
                const fields = [
                  "bm",
                  "dh",
                  "com",
                  "rm",
                  "rom",
                  "zm",
                  "zom",
                  "gm",
                  "hr",
                  "coo",
                  "ceo",
                ];
                fields.forEach((f) => {
                  if (m[f + "_timestamp"])
                    frm.set_value(f + "_pending_time", m[f + "_timestamp"]);
                  frm.set_value(f + "_user_status", "Pending");
                });
                frm.set_value("status", "Pending");
                frm.set_value("query_status", "Pending From ALL");
                frm.save();
              }
            },
          );
        },
        "Send to",
      )
      .css({ "background-color": "#28a745", color: "#ffffff" });
  },

  // close_query: function (frm) {
  //   if (frm.doc.status !== "Closed") {
  //     frm
  //       .add_custom_button(__("Close Query"), function () {
  //         frm.trigger("handle_close_query");
  //       })
  //       .css({ "background-color": "#dc3545", color: "#ffffff" });
  //   }
  // },

  reopen_query: function (frm) {
    if (frm.doc.status === "Closed") {
      const is_audit_team =
        frappe.user.has_role("Audit Manager") ||
        frappe.user.has_role("Audit Member");
      if (is_audit_team) {
        frm.add_custom_button(__("Reopen Query"), function () {
          frappe.confirm(
            __("Are you sure you want to reopen this query?"),
            () => {
              // Mark reopen checkbox
              frm.set_value("reopen", 1);

              // Update status
              frm.set_value("status", "Pending");

              // Clear closing details for fresh closure
              frm.set_value("closing_remark", "");
              frm.set_value("closing_date", "");

              frm.save().then((r) => {
                if (!r.exc) {
                  frappe.show_alert({
                    message: __("Query Reopened Successfully"),
                    indicator: "green",
                  });

                  frm.reload_doc();
                }
              });
            },
            () => {
              // No Action
            },
          );
        });
      }
    }
  },

  fetch_query_maker: function (frm) {
    let auditor_user = frappe.session.user;
    let auditor_user_emp_id = auditor_user.match(/\d+/)
      ? auditor_user.match(/\d+/)[0]
      : auditor_user;
    frappe.call({
      method:
        "audit_management.audit_management.doctype.my_audits.my_audits.fetch_employee_data",
      args: { employee_id: auditor_user_emp_id },
      callback: function (r) {
        if (r.message) {
          const d = r.message;
          frm.set_value("query_generated_by_empid", auditor_user_emp_id);
          frm.set_value("query_generated_by_name", d.employee_name);
          frm.set_value("query_generated_by_designation", d.designation);
          frm.set_value("query_generated_by_branch", d.branch);
          frm.set_value("query_generated_by_mail", d.company_email);
        }
      },
    });
  },

  query_type: function (frm) {
    frm.tat_config_loaded = false;
    let can_edit =
      frappe.user_roles.includes("Audit Manager") ||
      frappe.user_roles.includes("Audit Member");
    render_interactive_tracker(frm, can_edit);
  },
});
function render_interactive_tracker(frm, can_edit) {
  console.log("-> render_interactive_tracker entered. query_type:", frm.doc.query_type, "tat_config_loaded:", frm.tat_config_loaded);
  // 0. Fetch TAT Config if not already loaded
  if (frm.doc.query_type && !frm.tat_config_loaded) {
    console.log("-> Fetching TAT config for:", frm.doc.query_type);
    frappe.db.get_doc("Audit Query Type", frm.doc.query_type).then((qt) => {
      frm.tat_config = {};
      frm.default_tat = qt.default_tat_days || 0;
      if (qt.tat_config) {
        qt.tat_config.forEach((row) => {
          frm.tat_config[row.stage] = row.tat_days;
        });
      }
      frm.tat_config_loaded = true;
      console.log("-> TAT config loaded. Re-calling render_interactive_tracker.");
      render_interactive_tracker(frm, can_edit);
    });
    return;
  }

  // 1. Inject Compact & Spacing Optimized CSS Structure (With Flex-Shrink Fixed)
  if (!document.getElementById("custom-audit-tracker-style")) {
    console.log("-> Injecting tracker styles.");
    let style = document.createElement("style");
    style.id = "custom-audit-tracker-style";
    style.innerHTML = `
            .modern-audit-tracker {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                padding: 12px 14px;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.01);
                width: 100%;
                position: relative;
            }

            .tracker-flow-container {
                display: flex;
                align-items: flex-start;
                gap: 0px;
                width: 100%;
                overflow-x: auto !important; /* Forces scrollbar container visibility */
                white-space: nowrap;
                padding-top: 6px;
                padding-bottom: 8px;
            }

            /* FIXED: Added flex-shrink: 0 to enforce independent scrolling without compression */
            .workflow-node {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100px; 
                min-width: 100px;
                flex-shrink: 0 !important; /* Stays fixed, forces layout to overflow cleanly */
                position: relative;
            }

            .node-status-top {
                font-size: 10px;
                font-weight: 700;
                margin-bottom: 5px;
                height: 14px;
                text-transform: capitalize;
                white-space: nowrap;
            }
            .top-completed { color: #22c55e; }
            .top-progress { color: #2563eb; }
            .top-no-response { color: #f97316; }
            .top-overdue { color: #ef4444; }
            .top-pending { color: #64748b; }
            .top-blank { color: transparent; }

            .modern-pill {
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100px;
                height: 32px;
                border-radius: 16px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.3px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                transition: all 0.2s ease;
                background: #ffffff;
                border: 1px solid #cbd5e1;
                color: #334155;
            }

            .pill-audit-team {
                background-color: #eff6ff !important;
                border: 1.5px solid #bfdbfe !important;
                color: #1d4ed8 !important;
            }
            .pill-responded {
                background-color: #f0fdf4 !important;
                border: 1.5px solid #22c55e !important;
                color: #166534 !important;
            }
            .pill-progress {
                background-color: #2563eb !important;
                border: 1.5px solid #1e40af !important;
                color: #ffffff !important;
                box-shadow: 0 3px 8px rgba(37, 99, 235, 0.2);
            }
            .pill-no-response {
                background-color: #ffedd5 !important;
                border: 1.5px solid #fed7aa !important;
                color: #ea580c !important;
            }
            .pill-overdue {
                background-color: #fef2f2 !important;
                border: 1.5px solid #ef4444 !important;
                color: #991b1b !important;
                box-shadow: 0 3px 8px rgba(239, 68, 68, 0.15);
            }
            .pill-future {
                background-color: #f8fafc !important;
                border: 1px solid #e2e8f0 !important;
                color: #64748b !important;
            }

            /* FIXED: Connector line shrinks cleanly, but node boxes don't */
            .node-connector {
                flex-grow: 1;
                margin-top: 35px; 
                min-width: 24px; 
                height: 2px;
                border-top: 2px dashed #cbd5e1;
                position: relative;
                flex-shrink: 1;
            }
            .connector-solid {
                border-top-style: solid !important;
                border-top-color: #22c55e !important;
            }
            .connector-blue-dashed {
                border-top-color: #2563eb !important;
            }
            .connector-red-dashed {
                border-top-color: #ef4444 !important;
            }

            .node-meta-bottom {
                margin-top: 6px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1px;
                text-align: center;
                min-height: 40px;
            }
            .meta-tat {
                font-size: 10px;
                font-weight: 600;
                color: #64748b;
                white-space: nowrap;
            }
            .meta-highlight {
                font-size: 10px;
                font-weight: 700;
                white-space: nowrap;
            }
            .text-blue-highlight { color: #2563eb; }
            .text-orange-highlight { color: #ea580c; }
            .meta-date {
                font-size: 9.5px;
                color: #94a3b8;
                font-weight: 500;
                white-space: nowrap;
            }

            .form-message.blue:empty { display: none !important; }
            .form-message:has(.modern-audit-tracker) .close-message { display: none !important; }
        `;
    document.head.appendChild(style);
  }

  if (!frm.doc.audit_stages || frm.doc.audit_stages.length === 0) {
    frm.set_intro("");
    return;
  }

  const get_aging_days = (timestamp) => {
    if (!timestamp) return 0;
    return frappe.datetime.get_diff(frappe.datetime.now_datetime(), timestamp);
  };

  // 2. Build HTML Structure
  let html = `
        <div class="custom-interactive-tracker-wrapper modern-audit-tracker" style="display: flex; align-items: center; width: 100%;">
            <div class="tracker-flow-container" id="draggable-stages">
            
            <div class="workflow-node">
                <div class="node-status-top top-completed">Raised</div>
                <div class="modern-pill pill-audit-team" title="Internal Audit Department&#10;Created: ${frappe.datetime.str_to_user(frm.doc.creation.split(" ")[0])}">
                    AUDIT TEAM
                </div>
                <div class="node-meta-bottom">
                    <div class="meta-tat">Initial Stage</div>
                    <div class="meta-date">${frappe.datetime.str_to_user(frm.doc.creation.split(" ")[0])}</div>
                </div>
            </div>
            <div class="node-connector connector-solid"></div>
    `;

  let live_running_index = -1;
  for (let i = 0; i < frm.doc.audit_stages.length; i++) {
    if (
      frm.doc.audit_stages[i].status === "Pending" &&
      frm.doc.audit_stages[i].pending_time
    ) {
      live_running_index = i;
      break;
    }
  }

  frm.doc.audit_stages.forEach((row, index) => {
    let top_status = "";
    let pill_class = "pill-future";
    let top_label_class = "top-blank";
    let bottom_highlight = "";
    let calculated_date_view = "";

    let stage_tat = frm.default_tat || 0;
    if (frm.tat_config && frm.tat_config[row.stage_name]) {
      stage_tat = frm.tat_config[row.stage_name];
    }

    let base_tat_label = stage_tat === 1 ? "1 Day" : `${stage_tat} Days`;

    if (row.status === "Responded") {
      top_status = "Responded";
      pill_class = "pill-responded";
      top_label_class = "top-completed";
    } else if (row.status === "No Response") {
      top_status = "No Response";
      pill_class = "pill-no-response";
      top_label_class = "top-no-response";
    } else if (row.status === "Pending") {
      if (index === live_running_index) {
        let current_elapsed = get_aging_days(row.pending_time);
        let days_left = stage_tat - current_elapsed;

        if (days_left < 0) {
          top_status = "Overdue";
          pill_class = "pill-overdue";
          top_label_class = "top-overdue";
        } else {
          top_status = "In Progress";
          pill_class = "pill-progress";
          top_label_class = "top-progress";
        }
      } else {
        top_status = "Pending";
        pill_class = "pill-future";
        top_label_class = "top-pending";
      }
    }

    if (row.status === "Responded" && row.response_time) {
      let days_taken =
        get_aging_days(row.pending_time) - get_aging_days(row.response_time);
      bottom_highlight = `<div class="meta-tat">${days_taken <= 1 ? "1 Day" : days_taken + " Days"}</div>`;
      calculated_date_view = frappe.datetime.str_to_user(
        row.response_time.split(" ")[0],
      );
    } else if (
      (index === live_running_index || row.status === "No Response") &&
      row.pending_time
    ) {
      let current_elapsed = get_aging_days(row.pending_time);
      let days_left = stage_tat - current_elapsed;

      bottom_highlight = `<div class="meta-tat">${base_tat_label}</div>`;
      if (days_left >= 0) {
        let color_class =
          row.status === "No Response"
            ? "text-orange-highlight"
            : "text-blue-highlight";
        let left_label =
          days_left === 1 ? "1 Day Left" : `${days_left} Days Left`;
        bottom_highlight += `<div class="meta-highlight ${color_class}">${left_label}</div>`;
      } else {
        let overdue_days_abs = Math.abs(days_left);
        let overdue_label =
          overdue_days_abs === 1
            ? "1 Day Overdue"
            : `${overdue_days_abs} Days Overdue`;
        bottom_highlight += `<div class="meta-highlight" style="color: #ef4444;">${overdue_label}</div>`;
      }
      let target_due = frappe.datetime.add_days(
        row.pending_time.split(" ")[0],
        stage_tat,
      );
      calculated_date_view = `Due ${frappe.datetime.str_to_user(target_due)}`;
    } else {
      bottom_highlight = `<div class="meta-tat">${base_tat_label}</div>`;
      if (row.pending_time && row.status === "Pending") {
        let target_due = frappe.datetime.add_days(
          row.pending_time.split(" ")[0],
          stage_tat,
        );
        calculated_date_view = `Due ${frappe.datetime.str_to_user(target_due)}`;
      } else {
        calculated_date_view = "";
      }
    }

    let emp_name =
      row.employee_name || row.employee || row.user_id || "Unassigned";

    let tooltip_str = `Assignee: ${emp_name}&#10;Status: ${row.status || "Not Started"}`;
    if (row.pending_time)
      tooltip_str += `&#10;Started: ${frappe.datetime.str_to_user(row.pending_time.split(" ")[0])}`;

    html += `
            <div class="workflow-node sortable-item" style="cursor: ${can_edit ? "grab" : "not-allowed"};">
                <div class="node-status-top ${top_label_class}">${top_status || "&nbsp;"}</div>
                <div class="modern-pill ${pill_class}" title="${tooltip_str}">
                    ${row.stage_name}
                </div>
                <div class="node-meta-bottom">
                    ${bottom_highlight}
                    <div class="meta-date">${calculated_date_view}</div>
                </div>
            </div>
        `;

    if (index !== frm.doc.audit_stages.length - 1) {
      let line_class = "connector-grey-dashed";
      if (row.status === "Responded") {
        line_class = "connector-solid";
      } else if (index === live_running_index || row.status === "No Response") {
        line_class = "connector-blue-dashed";
      } else if (top_status === "Overdue") {
        line_class = "connector-red-dashed";
      }
      html += `<div class="node-connector ${line_class}"></div>`;
    }
  });

  if (can_edit) {
    html += `
            <div style="position: absolute; top: 2px; right: 5px; padding: 6px; border-radius: 50%; background: #eff6ff; cursor: pointer; color: #1d4ed8; z-index: 10;" id="edit-tracker-settings" title="Edit Workflow Stages">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
        `;
  }

  html += `</div></div>`;

  setTimeout(() => {
    if (frm.page.wrapper.find(".custom-interactive-tracker-wrapper").length === 0) {
      frm.page.wrapper.find(".form-message-container").empty();
      frm.set_intro(html, "blue");

      // Remove the close button from the message box to make it persistent
      let wrapper = frm.page.wrapper.find(".custom-interactive-tracker-wrapper");
      if (wrapper.length > 0) {
        wrapper.closest(".form-message").find(".close-message").remove();
      }

      // Initialize tooltips
      frm.page.wrapper.find('[data-toggle="tooltip"]').tooltip();

      // Ensure settings button click works
      let settings_icon = document.getElementById("edit-tracker-settings");
      if (settings_icon) {
        settings_icon.onclick = function () {
          if (typeof open_stages_modal === "function") {
            open_stages_modal(frm);
          } else {
            frm.trigger("open_stages_modal");
          }
        };
      }
    }
  }, 600);

  // 4. Sortable Engine
  if (can_edit && typeof Sortable !== "undefined") {
    let el = document.getElementById("draggable-stages");
    new Sortable(el, {
      animation: 150,
      draggable: ".sortable-item",
      ghostClass: "sortable-ghost",
      onEnd: function (evt) {
        let old_index = evt.oldIndex - 1;
        let new_index = evt.newIndex - 1;

        if (old_index < 0 || new_index < 0 || old_index === new_index) return;

        let moved_item = frm.doc.audit_stages.splice(old_index, 1)[0];
        frm.doc.audit_stages.splice(new_index, 0, moved_item);

        frm.doc.audit_stages.forEach((row, i) => {
          row.stage = i + 1;
          row.idx = i + 1;
        });

        frm.dirty();
        frm.refresh_field("audit_stages");
        frm.save().then(() => {
          frappe.show_alert({
            message: "Stage sequence updated",
            indicator: "green",
          });
        });
      },
    });
  }
}

// function open_stages_modal(frm) {
//     let d = new frappe.ui.Dialog({
//         title: 'Edit Audit Stages for this Document',
//         size: 'large',
//         fields: [
//             {
//                 fieldname: 'temp_stages',
//                 fieldtype: 'Table',
//                 label: 'Stages',
//                 cannot_add_rows: false,
//                 in_place_edit: true,
//                 data: [],
//                 fields: [
//                     { fieldtype: 'Link', fieldname: 'stage_name', options: 'Audit Stage', in_list_view: 1, label: 'Stage Name', reqd: 1 },
//                     { fieldtype: 'Link', fieldname: 'employee', options: 'Employee', in_list_view: 1, label: 'Employee ID', reqd: 1 },
//                     { fieldtype: 'Data', fieldname: 'employee_name', in_list_view: 1, label: 'Employee Name', read_only: 1 }
//                 ]
//             }
//         ],
//         primary_action_label: 'Save Changes',
//         primary_action: function() {
//             let values = d.get_values();

//             // Clear current form table
//             frm.clear_table('audit_stages');

//             // Push new rows from the modal back into the form
//             values.temp_stages.forEach((row, idx) => {
//                 let new_row = frm.add_child('audit_stages');
//                 new_row.stage = idx + 1; // Auto-sequence 1, 2, 3...
//                 new_row.stage_name = row.stage_name;
//                 new_row.employee = row.employee;
//                 new_row.employee_name = row.employee_name;
//                 new_row.status = 'Pending'; // Default status for new additions
//             });

//             frm.refresh_field('audit_stages');
//             frm.save().then(() => {
//                 frappe.show_alert({message: 'Stages updated for this document', indicator: 'green'});
//                 render_interactive_tracker(frm, true);
//                 d.hide();
//             });
//         }
//     });

//     // Populate the modal with the current stages from the document
//     let existing_data = frm.doc.audit_stages.map(row => {
//         return {
//             stage_name: row.stage_name,
//             employee: row.employee,
//             employee_name: row.employee_name
//         };
//     });

//     d.fields_dict.temp_stages.df.data = existing_data;
//     d.fields_dict.temp_stages.grid.refresh();

//     d.show();
// }

function open_stages_modal(frm) {
  let d = new frappe.ui.Dialog({
    title: "Edit Audit Stages",
    size: "large",
    fields: [
      {
        fieldname: "temp_stages",
        fieldtype: "Table",
        label: "Stages",
        cannot_add_rows: false,
        in_place_edit: true,
        data: [],
        fields: [
          // Hidden field to permanently track the exact database ID
          { fieldtype: "Data", fieldname: "stage_id", hidden: 1 },

          // Visible fields
          {
            fieldtype: "Link",
            fieldname: "stage_name",
            options: "Audit Stage",
            in_list_view: 1,
            label: "Stage Name",
            reqd: 1,
          },
          {
            fieldtype: "Link",
            fieldname: "employee",
            options: "Employee",
            in_list_view: 1,
            label: "Employee ID",
            reqd: 1,
          },
          {
            fieldtype: "Data",
            fieldname: "employee_name",
            in_list_view: 1,
            label: "Employee Name",
            read_only: 1,
          },
          {
            fieldtype: "Data",
            fieldname: "email",
            in_list_view: 1,
            label: "Email",
          },
        ],
      },
    ],
    primary_action_label: "Save Changes",
    primary_action: function () {
      // Force grid to commit any active edits
      if (document.activeElement) document.activeElement.blur();

      let grid_data = d.fields_dict.temp_stages.grid.get_data();

      // 1. Store EXACT references to existing memory objects so we don't lose responses!
      let old_rows_map = {};
      (frm.doc.audit_stages || []).forEach((r) => {
        old_rows_map[r.name] = r;
      });

      // 2. Empty the array WITHOUT deleting from frappe.locals memory
      // This completely prevents the "Missing Fields" framework error
      frm.doc.audit_stages = [];

      // 3. Rebuild the child table perfectly
      grid_data.forEach((row, idx) => {
        let target_row;

        if (row.stage_id && old_rows_map[row.stage_id]) {
          // Re-use the existing Frappe object (retains responses, attachments, status)
          target_row = old_rows_map[row.stage_id];
          // Push it manually back into the form array
          frm.doc.audit_stages.push(target_row);
        } else {
          // It's a completely new row added via the modal
          // This automatically creates it in memory and pushes it to doc.audit_stages
          target_row = frm.add_child("audit_stages");
        }

        // 4. Update the values from the modal safely
        target_row.stage_name = row.stage_name;
        target_row.employee = row.employee;
        target_row.employee_name = row.employee_name;
        target_row.email = row.email;
        target_row.stage = idx + 1;
        target_row.idx = idx + 1; // Required by Frappe for sequence tracking

        if (!target_row.status) {
          // target_row.status = 'Pending';
          target_row.status = "";
        }
      });

      frm.refresh_field("audit_stages");
      frm.dirty(); // Tell Frappe the document has unsaved changes

      // Save the document and refresh the UI tracker
      frm.save().then(() => {
        frappe.show_alert({
          message: "Stages updated successfully",
          indicator: "green",
        });
        render_interactive_tracker(frm, true);
        d.hide();
      });
    },
  });

  // Fetch logic for employee field in the modal
  d.fields_dict.temp_stages.grid.get_field("employee").get_query = function () {
    return {
      filters: {
        status: "Active",
      },
    };
  };

  // 🌟 FIX: Fetch Email and Employee Name when Employee is selected in the modal
  d.fields_dict.temp_stages.grid.on_row_add = function (doc, cdt, cdn) {
    let row = locals[cdt][cdn];
  };

  // We use the grid's change trigger
  d.fields_dict.temp_stages.grid.on_row_add = function (doc, cdt, cdn) {
    // Optional: logic on row add
  };

  // Use model events if doctype is set, or grid events
  // Since temp_stages doesn't have a doctype, we use the grid's control events
  let grid = d.fields_dict.temp_stages.grid;
  grid.wrapper.on("change", 'input[data-fieldname="employee"]', function (e) {
    let $input = $(e.currentTarget);
    let name = $input.closest(".grid-row").attr("data-name");
    let row = grid.get_row(name).doc;

    if (row.employee) {
      frappe.call({
        method:
          "audit_management.audit_management.doctype.my_audits.my_audits.fetch_employee_data",
        args: { employee_id: row.employee },
        callback: function (r) {
          if (r.message) {
            row.employee_name = r.message.employee_name;
            row.email = r.message.company_email;
            grid.refresh();
          }
        },
      });
    }
  });

  // Populate the modal with data, binding the exact Database ID to 'stage_id'
  let existing_data = (frm.doc.audit_stages || []).map((row) => {
    return {
      stage_id: row.name, // Link to the original memory row
      stage_name: row.stage_name,
      employee: row.employee,
      employee_name: row.employee_name,
      email: row.email,
    };
  });

  d.fields_dict.temp_stages.df.data = existing_data;
  d.fields_dict.temp_stages.grid.refresh();
  d.show();

  // --- ENABLE DRAG AND DROP IN THE MODAL ---
  setTimeout(() => {
    let grid_body = d.$wrapper.find(".grid-body .rows")[0];

    if (grid_body && typeof Sortable !== "undefined") {
      d.$wrapper.find(".grid-row").css("cursor", "grab");

      new Sortable(grid_body, {
        animation: 150,
        handle: ".grid-row",
        ghostClass: "sortable-ghost",
        onEnd: function (evt) {
          let old_index = evt.oldIndex;
          let new_index = evt.newIndex;

          if (old_index === new_index) return;

          let data_array = d.fields_dict.temp_stages.grid.data;
          let moved_item = data_array.splice(old_index, 1)[0];
          data_array.splice(new_index, 0, moved_item);

          data_array.forEach((row, i) => {
            row.idx = i + 1;
            row._idx = i + 1;
          });

          d.fields_dict.temp_stages.grid.refresh();
          d.$wrapper.find(".grid-row").css("cursor", "grab");
        },
      });
    }
  }, 300);
}
