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

     // 1. Check if user has permission to edit the tracker
        let can_edit = frappe.user_roles.includes("Audit Manager") || frappe.user_roles.includes("Audit Member");

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
  },


  // refresh: function(frm) {
  //       // 1. Check if user has permission to edit the tracker
  //       let can_edit = frappe.user_roles.includes("Audit Manager") || frappe.user_roles.includes("Audit Member");

  //       // 2. Render the Interactive Tracker
  //       render_interactive_tracker(frm, can_edit);
  //   },

  new_system_refresh: function (frm) {
    // frm.trigger("render_status_tracker");
    frm.trigger("setup_dynamic_buttons");
    frm.trigger("handle_read_only_new");

    // ✅ ADD THIS HERE (Ensure it loads the new interactive one)
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

    // Ensure audit_stages is visible and well-formatted
    frm.toggle_display("audit_items_section", true);
    frm.toggle_display("audit_stages", true);
    frm.set_df_property(
      "audit_stages",
      "label",
      __("Audit Progress & Responses"),
    );

    const old_fields = [
      "bm_user_status",
      "bm_name",
      "dh_user_status",
      "dh_name",
      "com_user_status",
      "com_name",
      "rm_user_status",
      "rm_name",
      "rom_user_status",
      "rom_name",
      "zm_user_status",
      "zm_name",
      "zom_user_status",
      "zom_name",
      "gm_user_status",
      "gm_name",
      "hr_user_status",
      "hr_name",
      "coo_user_status",
      "coo_name",
      "ceo_user_status",
      "ceo_name",
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

    if (frm.doc.status === "Close") {
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
        const is_respondent = [
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
        ].includes(user);

        if (is_respondent) {
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
            (!frm.doc.dh_user_status ||
              !frm.doc.com_user_status ||
              frm.doc.dh_user_status === "No Response" ||
              frm.doc.com_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" ||
              frm.doc.bm_user_status === "Responded")
          ) {
            frm.trigger("show_sendToDhComWithClose_btn");
          }

          if (
            (!frm.doc.rm_user_status ||
              !frm.doc.rom_user_status ||
              frm.doc.rm_user_status === "No Response" ||
              frm.doc.rom_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" ||
              frm.doc.bm_user_status === "Responded")
          ) {
            frm.trigger("show_sendToRmRomWithClose_btn");
          }

          if (
            (!frm.doc.zm_user_status ||
              !frm.doc.zom_user_status ||
              frm.doc.zm_user_status === "No Response" ||
              frm.doc.zom_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" ||
              frm.doc.bm_user_status === "Responded")
          ) {
            frm.trigger("show_sendToZmZomWithClose_btn");
          }

          if (
            (!frm.doc.gm_user_status ||
              frm.doc.gm_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" ||
              frm.doc.bm_user_status === "Responded")
          ) {
            frm.trigger("show_sendToGm_withClose_btn");
          }

          if (
            (!frm.doc.hr_user_status ||
              frm.doc.hr_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" ||
              frm.doc.bm_user_status === "Responded")
          ) {
            frm.trigger("show_sendToHr_withClose_btn");
          }

          if (
            (!frm.doc.coo_user_status ||
              frm.doc.coo_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" ||
              frm.doc.bm_user_status === "Responded")
          ) {
            frm.trigger("show_sendToCOO_withClose_btn");
          }

          if (
            (!frm.doc.ceo_user_status ||
              frm.doc.ceo_user_status === "No Response") &&
            (frm.doc.query_type !== "Audit Report Compliance" ||
              frm.doc.bm_user_status === "Responded")
          ) {
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
            // Check again if it's already there to be absolutely sure
            if (frm.page.wrapper.find(".custom-status-tracker").length === 0) {
              frm.set_intro(
                `<div class="custom-status-tracker">${r.message}</div>`,
              );
            }
          } else {
            frm.is_intro_set = false;
          }
        },
      });
    }
  },

  // setup_dynamic_buttons: function (frm) {
  //   if (frm.is_new() || frm.doc.status === "Close") return;
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
  //   if (frm.is_new() || frm.doc.status === "Close") return;
    
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
//   if (frm.is_new() || frm.doc.status === "Close") return;

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
//     if (frm.is_new() || frm.doc.status === "Close") return;

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

setup_dynamic_buttons: function (frm) {
    // Return early if it's a completely new, unsaved document, or if it's closed.
    if (frm.is_new() || frm.doc.status === "Close") return;

    const is_audit_team = frappe.user.has_role("Audit Manager") || frappe.user.has_role("Audit Member");
    const current_user = frappe.session.user;

    // 🌟 FIX: Safely retrieve the child table regardless of whether it's named 'auditstages' or 'audit_stages'
    const audit_table = frm.doc.auditstages || frm.doc.audit_stages || [];

    // 1. DRAFT STATE: Only Audit Team can see "Raise Request" Action
    if (frm.doc.status === "Draft" && is_audit_team) {
        frm.add_custom_button(__('Raise Request'), function() {
            
            // 🌟 FIX: Safely extract the stage names and filter out any empty data
            let stages = audit_table
                .map(r => r.stagename || r.stage_name)
                .filter(Boolean); 
            
            if (stages.length === 0) {
                frappe.msgprint('<b>Please add stages in the operational tracking section first. Ensure you have saved the document.</b>');
                return;
            }

            // Prompt auditor to select who gets the ticket first
            frappe.prompt([
                {
                    label: 'Select Target Stage',
                    fieldname: 'stagename',
                    fieldtype: 'Select',
                    options: stages.join('\n'), // Renders options correctly
                    default: stages[0],         // Sets default to the first stage
                    reqd: 1,
                    description: 'Select the stage to send this request to.'
                }
            ], function(values) {
                frappe.call({
                    method: "audit_management.audit_management.doctype.my_audits.my_audits.raise_request",
                    args: {
                        docname: frm.doc.name,
                        stagename: values.stagename
                    },
                    freeze: true,
                    freeze_message: "Raising Request...",
                    callback: function(r) {
                        if (!r.exc) {
                            frappe.show_alert({message: __('Request Raised Successfully'), indicator: 'green'});
                            frm.reload_doc();
                        }
                    }
                });
            }, __('Raise Audit Request'), __('Raise Request'));
        }, __('Actions')).css({"background-color": "#007bff", "color": "white"});
    }

    // 2. PENDING STATE: Find the exact row that is currently pending
    // 🌟 FIX: Used the safe `audit_table` variable to prevent "Cannot read properties of undefined (reading 'find')" errors
    const pending_row = audit_table.find(
        (row) => row.status === "Pending" && (row.userid === current_user || row.email === current_user)
    );

    // Show Submit Response ONLY if the document is pending, and the logged-in user is the current active assignee
    if (pending_row && frm.doc.status === "Pending") {
        frm.add_custom_button(__("Submit Response"), function () {
            
            let d = new frappe.ui.Dialog({
                title: 'Submit Response',
                fields: [
                    {
                        label: 'Response',
                        fieldname: 'response_text',
                        fieldtype: 'Small Text',
                        reqd: 1,
                    },
                    {
                        label: 'Attachment',
                        fieldname: 'attachment',
                        fieldtype: 'Attach',
                    }
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
    if (frm.doc.status === "Pending" && is_audit_team) {
        
        // Add Close Query button
        frm.add_custom_button(__("Close Query"), function () {
            frm.trigger("handle_close_query");
        }, __("Actions")).css({ "background-color": "#dc3545", "color": "white" });

        // Add Manual Escalate/Re-assign button if needed
        // 🌟 FIX: Safely find the next row using `audit_table`
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

  //   if (frm.doc.status === "Close") {
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
    if (is_pending_for_me && !is_audit_team) {
      frm.disable_save();
    } else if (is_audit_team || frm.doc.status === "Draft") {
      frm.enable_save();
    }

    // 2. Audit Details Read-Only Logic
    if (!is_audit_team && frm.doc.status !== "Draft") {
      [
        "audit_query_box",
        "audit_query_subject_box",
        "emp_branch",
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

    // --- 4. NEW: HIDE RESOLUTION SECTION FOR NON-AUDIT TEAM ---
    const is_admin = frappe.user.has_role("Administrator");
    
    // If the user is NOT Audit Manager, NOT Audit Member, and NOT Administrator...
    if (!is_audit_team && !is_admin) {
        // Hide the entire resolution section
        frm.toggle_display("resolution_section", false);
    } else {
        // Ensure it stays visible for the Audit Team and Admins
        frm.toggle_display("resolution_section", true);
    }
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
      { status_field: "ceo_user_status", box_field: "ceo_response_box" }
    ];

    stages_mapping.forEach(stage => {
        if (frm.doc[stage.status_field] === "Responded") {
            frm.set_df_property(stage.box_field, "read_only", 1);
        }
    });

    // Hide old generic current_response_box since we moved to the Modal
    frm.set_df_property("current_response_box", "hidden", 1);
    frm.set_df_property("current_response_attach", "hidden", 1);
    frm.toggle_display("response_section", false);

    if (frm.doc.status === "Close") {
      frm.disable_form();
    }
  },
  
  handle_close_query: function (frm) {
    frappe.prompt(
      [
        {
          label: __("Closing Remark"),
          fieldname: "closing_remark",
          fieldtype: "Small Text",
          reqd: 1,
        },
      ],
      function (data) {
        frm.set_value("closing_remark", data.closing_remark);
        frm.set_value("status", "Close");
        frm.save(null, {
          callback: function (r) {
            if (!r.exc) {
              frappe.show_alert({
                message: __("Query Closed Successfully"),
                indicator: "green",
              });
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

  show_sendToBmWithClose_btn: function (frm) {
    frm
      .add_custom_button(
        __("Send to BM"),
        function () {
          frappe.confirm(
            `Do you want to send query to the Level 1 (BM)?`,
            () => {
              frappe.call({
                method: "frappe.share.add",
                args: {
                  doctype: frm.doctype,
                  name: frm.docname,
                  user: frm.doc.bm_user_id,
                  read: 1,
                  write: 1,
                  share: 1,
                  notify: 0,
                },
                callback: function () {
                  frm.set_value("status", "Pending");
                  frm.set_value("query_status", "Pending From BM");
                  frm.set_value("bm_user_status", "Pending");
                  frm.frappecalltopendingtimefunction(frm, frm.docname, "bm");
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

  close_query: function (frm) {
    if (frm.doc.status !== "Close") {
      frm
        .add_custom_button(__("Close Query"), function () {
          frappe.prompt(
            [
              {
                label: "Enter Closing Remark",
                fieldname: "closing_remark",
                fieldtype: "Data",
                reqd: 1,
              },
            ],
            function (data) {
              frm.set_value("closing_remark", data.closing_remark);
              frm.set_value("status", "Close");
              frm.save().then(() => {
                frappe.msgprint("<b>Audit query closed successfully!</b>");
                frm.disable_form();
              });
            },
            "Enter Closing Remark",
            "Close",
          );
        })
        .css({ "background-color": "#dc3545", color: "#ffffff" });
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
});


function render_interactive_tracker(frm, can_edit) {
    // 1. Inject the CSS globally into the document head (only once)
    if (!document.getElementById('custom-audit-tracker-style')) {
        let style = document.createElement('style');
        style.id = 'custom-audit-tracker-style';
        style.innerHTML = `
            /* Modern tracker styling */
            .modern-audit-tracker {
                font-family: inherit;
                padding: 4px 0;
            }
            .modern-pill {
                position: relative; /* Required for absolute tooltip positioning */
                display: inline-flex;
                align-items: center;
                padding: 4px 14px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                letter-spacing: 0.3px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                transition: all 0.2s ease;
                white-space: nowrap;
                // z-index: 999;

            }
            .sortable-item:hover .modern-pill {
                transform: translateY(-1px);
                box-shadow: 0 4px 6px rgba(0,0,0,0.08);
                z-index: 999;

            }
            
            /* Status Colors (Modern Banking Palette) */
            .pill-pending { background-color: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
            .pill-responded { background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
            .pill-skipped { background-color: #faf5ff; border: 1px solid #e9d5ff; color: #6b21a8; }
            .pill-default { background-color: #f3f4f6; border: 1px solid #e5e7eb; color: #374151; }
            .pill-audit-team { background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; }
            
            /* Hide the arrow on the very last stage pill dynamically */
            .stage-pill-container:last-child .modern-arrow {
                display: none !important;
            }
            /* Hide any empty message boxes Frappe creates */
            .form-message.blue:empty {
                display: none !important;
            }
            /* Hide default frappe close icon specifically for our tracker via modern CSS */
            .form-message:has(.modern-audit-tracker) .close-message {
                display: none !important;
            }

                        /* --- GORGEOUS CUSTOM CSS TOOLTIP --- */
            .modern-pill[data-tooltip]::after {
                content: attr(data-tooltip);
                position: absolute;
                top: calc(100% + 8px); /* Position below the pill */
                left: 50%;
                transform: translateX(-50%) translateY(-4px); /* Animate downwards */
                background: #1e293b; /* Sleek dark slate */
                color: #f8fafc;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 500;
                letter-spacing: 0.2px;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.2s ease-in-out;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                z-index: 999;
                pointer-events: none;
            }
            /* Tooltip Pointer Triangle (Flipped to point up) */
            .modern-pill[data-tooltip]::before {
                content: '';
                position: absolute;
                top: calc(100% + 3px); /* Position right below the pill border */
                left: 50%;
                transform: translateX(-50%);
                border-width: 5px;
                border-style: solid;
                border-color: transparent transparent #1e293b transparent; /* Points upward */
                opacity: 0;
                visibility: hidden;
                transition: all 0.2s ease-in-out;
                z-index: 999;
                pointer-events: none;
                
            }
            /* Show Tooltip on Hover */
            .modern-pill[data-tooltip]:hover::after {
                opacity: 1;
                visibility: visible;
                transform: translateX(-50%) translateY(0); /* Float down into place */
                z-index: 999;

            }
            .modern-pill[data-tooltip]:hover::before {
                opacity: 1;
                visibility: visible;
                z-index: 999;
            }
        `;
        document.head.appendChild(style);
    }

    if (!frm.doc.audit_stages || frm.doc.audit_stages.length === 0) {
        frm.set_intro(''); // Clear if no stages
        return;
    }

    // Modern SVG Chevron instead of -->
    const arrow_svg = `<svg class="modern-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 4px;"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

    // 2. Build the HTML wrapper
    let html = `
        <div class="custom-interactive-tracker-wrapper modern-audit-tracker" style="display: flex; align-items: center; gap: 4px; width: 100%;">
            
            <div class="modern-pill pill-audit-team" data-tooltip="Internal Audit Department">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                AUDIT TEAM
            </div>
            
            ${arrow_svg}
            
            <div id="draggable-stages" style="display: flex; align-items: center; flex-wrap: wrap; flex: 1; row-gap: 8px;">
    `;

    // Generate pills from the actual child table
    frm.doc.audit_stages.forEach((row, index) => {
        let pill_class = row.status === 'Pending' ? 'pill-pending' : 
                         row.status === 'Responded' ? 'pill-responded' : 
                         row.status === 'Skipped' ? 'pill-skipped' : 'pill-default';

        // Get the best available name for the tooltip
        let emp_name = row.employee_name || row.employee || row.user_id || 'Unassigned';

        html += `
            <div class="stage-pill-container sortable-item" style="display: flex; align-items: center; cursor: ${can_edit ? 'grab' : 'not-allowed'};">
                <div class="modern-pill ${pill_class}" data-tooltip="${emp_name}">
                    ${row.stage_name}
                </div>
                ${arrow_svg}
            </div>
        `;
    });

    html += `</div>`; // End draggable-stages

    // Add Settings Icon if user has permission
    if (can_edit) {
        html += `
            <div style="margin-left: auto; padding: 6px; border-radius: 50%; background: #eff6ff; cursor: pointer; color: #1d4ed8; transition: background 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" id="edit-tracker-settings" data-tooltip="Tracker Settings" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
        `;
    }

    html += `</div>`; // End wrapper

    // 3. Clear ALL existing intro messages before setting the new one
    frm.page.wrapper.find('.form-message-container').empty();
    
    // Set the intro natively via Frappe
    frm.set_intro(html, 'blue');

    // FORCE REMOVE the Close Button via Javascript as a secondary bulletproof measure
    setTimeout(() => {
        let wrapper = frm.page.wrapper.find('.custom-interactive-tracker-wrapper');
        if (wrapper.length > 0) {
            wrapper.closest('.form-message').find('.close-message').remove();
        }
    }, 50);

    // 4. Make it Draggable (if permitted)
    if (can_edit) {
        let el = document.getElementById('draggable-stages');
        
        if (typeof Sortable !== 'undefined') {
            new Sortable(el, {
                animation: 150,
                draggable: '.sortable-item', 
                ghostClass: 'sortable-ghost',
                onEnd: function (evt) {
                    let old_index = evt.oldIndex;
                    let new_index = evt.newIndex;

                    if (old_index === new_index) return;

                    let moved_item = frm.doc.audit_stages.splice(old_index, 1)[0];
                    frm.doc.audit_stages.splice(new_index, 0, moved_item);

                    frm.doc.audit_stages.forEach((row, i) => {
                        row.stage = i + 1;
                        row.idx = i + 1; 
                    });

                    frm.dirty();
                    frm.refresh_field('audit_stages');
                    
                    frm.save().then(() => {
                        frappe.show_alert({message: 'Stage order saved successfully', indicator: 'green'});
                    });
                }
            });
        }

        // Attach Settings Modal Click Event
        setTimeout(() => {
            let settings_icon = document.getElementById('edit-tracker-settings');
            if (settings_icon) {
                settings_icon.onclick = function() {
                    open_stages_modal(frm);
                };
            }
        }, 100);
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
        title: 'Edit Audit Stages',
        size: 'large',
        fields: [
            {
                fieldname: 'temp_stages',
                fieldtype: 'Table',
                label: 'Stages',
                cannot_add_rows: false,
                in_place_edit: true,
                data: [],
                fields: [
                    // Hidden field to permanently track the exact database ID
                    { fieldtype: 'Data', fieldname: 'stage_id', hidden: 1 }, 
                    
                    // Visible fields
                    { fieldtype: 'Link', fieldname: 'stage_name', options: 'Audit Stage', in_list_view: 1, label: 'Stage Name', reqd: 1 },
                    { fieldtype: 'Link', fieldname: 'employee', options: 'Employee', in_list_view: 1, label: 'Employee ID', reqd: 1 },
                    { fieldtype: 'Data', fieldname: 'employee_name', in_list_view: 1, label: 'Employee Name', read_only: 1 }
                ]
            }
        ],
        primary_action_label: 'Save Changes',
        primary_action: function() {
            // Force grid to commit any active edits
            if (document.activeElement) document.activeElement.blur();
            
            let grid_data = d.fields_dict.temp_stages.grid.get_data();
            
            // 1. Store EXACT references to existing memory objects so we don't lose responses!
            let old_rows_map = {};
            (frm.doc.audit_stages || []).forEach(r => {
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
                    target_row = frm.add_child('audit_stages');
                }
                
                // 4. Update the values from the modal safely
                target_row.stage_name = row.stage_name;
                target_row.employee = row.employee;
                target_row.employee_name = row.employee_name;
                target_row.stage = idx + 1;
                target_row.idx = idx + 1; // Required by Frappe for sequence tracking
                
                if (!target_row.status) {
                    target_row.status = 'Pending';
                }
            });
            
            frm.refresh_field('audit_stages');
            frm.dirty(); // Tell Frappe the document has unsaved changes
            
            // Save the document and refresh the UI tracker
            frm.save().then(() => {
                frappe.show_alert({message: 'Stages updated successfully', indicator: 'green'});
                render_interactive_tracker(frm, true);
                d.hide();
            });
        }
    });

    // Populate the modal with data, binding the exact Database ID to 'stage_id'
    let existing_data = (frm.doc.audit_stages || []).map(row => {
        return {
            stage_id: row.name, // Link to the original memory row
            stage_name: row.stage_name,
            employee: row.employee,
            employee_name: row.employee_name
        };
    });
    
    d.fields_dict.temp_stages.df.data = existing_data;
    d.fields_dict.temp_stages.grid.refresh();
    d.show();
    
    // --- ENABLE DRAG AND DROP IN THE MODAL ---
    setTimeout(() => {
        let grid_body = d.$wrapper.find('.grid-body .rows')[0];
        
        if (grid_body && typeof Sortable !== 'undefined') {
            d.$wrapper.find('.grid-row').css('cursor', 'grab');

            new Sortable(grid_body, {
                animation: 150,
                handle: '.grid-row', 
                ghostClass: 'sortable-ghost',
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
                    d.$wrapper.find('.grid-row').css('cursor', 'grab');
                }
            });
        }
    }, 300);
}