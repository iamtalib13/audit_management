// Copyright (c) 2024, Sahayog and contributors
// For license information, please see license.txt

frappe.ui.form.on("My Audits", {
  onload: function (frm) {
    frm.trigger("check_field_read_only");
    frm.trigger("set_background_colors");
  },
  check_field_read_only: function (frm) {
    if (
      !frappe.user.has_role("Audit Manager") &&
      frm.doc.status === "Pending"
    ) {
      console.log("Disabling Save button");
      frm.disable_save();
      frm.set_df_property("audit_query_box", "read_only", true);
      frm.set_df_property("emp_branch", "read_only", true);
      frm.set_df_property("employee_id", "read_only", true);
    }
    if (frappe.user.has_role("Audit Manager") && frm.doc.status === "Pending") {
      frm.disable_form();
    }
    if (
      frm.doc.query_status !== "Pending From BM" &&
      frm.doc.bm_user_status === "Responded"
    ) {
      frm.set_df_property("bm_response_box", "read_only", true);
      frm.set_df_property("bm_attach_box", "read_only", true);
    }
    // making read_only to DH&COM response box
    if (frm.doc.query_status !== "Pending From DH & COM") {
      if (frm.doc.dh_user_status === "Responded") {
        frm.set_df_property("dh_response_box", "read_only", 1);
        frm.set_df_property("dh_attach_box", "read_only", true);
      }
      if (frm.doc.com_user_status === "Responded") {
        frm.set_df_property("com_response_box", "read_only", 1);
        frm.set_df_property("com_attach_box", "read_only", true);
      }
      frm.refresh_field("dh_response_box");
      frm.refresh_field("dh_attach_box");
      frm.refresh_field("com_response_box");
      frm.refresh_field("com_attach_box");
    }
    // making read_only to RM&ROM response box
    if (frm.doc.query_status !== "Pending From RM & ROM") {
      if (frm.doc.rm_user_status === "Responded") {
        frm.set_df_property("rm_response_box", "read_only", 1);
        frm.set_df_property("rm_attach_box", "read_only", true);
      }
      if (frm.doc.rom_user_status === "Responded") {
        frm.set_df_property("rom_response_box", "read_only", 1);
        frm.set_df_property("rom_attach_box", "read_only", true);
      }
      frm.refresh_field("dh_response_box");
      frm.refresh_field("com_response_box");
      frm.refresh_field("rm_attach_box");
      frm.refresh_field("rom_attach_box");
    }
    // making read_only to ZM&ZOM response box
    if (frm.doc.query_status !== "Pending From ZM & ZOM") {
      if (frm.doc.zm_user_status === "Responded") {
        frm.set_df_property("zm_response_box", "read_only", 1);
        frm.set_df_property("zm_attach_box", "read_only", true);
      }
      if (frm.doc.zom_user_status === "Responded") {
        frm.set_df_property("zom_response_box", "read_only", 1);
        frm.set_df_property("zom_attach_box", "read_only", true);
      }
      frm.refresh_field("zm_response_box");
      frm.refresh_field("zom_response_box");
      frm.refresh_field("zm_attach_box");
      frm.refresh_field("zom_attach_box");
    }

    // making read_only to COO response box
    if (frm.doc.query_status !== "Pending From COO") {
      if (frm.doc.coo_user_status === "Responded") {
        frm.set_df_property("coo_response_box", "read_only", 1);
        frm.set_df_property("coo_attach_box", "read_only", true);
      }
      frm.refresh_field("coo_response_box");
      frm.refresh_field("coo_attach_box");
    }

    // making read_only to GM response box
    if (frm.doc.query_status !== "Pending From GM") {
      if (frm.doc.gm_user_status === "Responded") {
        frm.set_df_property("gm_response_box", "read_only", 1);
        frm.set_df_property("gm_attach_box", "read_only", true);
      }
      frm.refresh_field("gm_response_box");
      frm.refresh_field("gm_attach_box");
    }

    // making read_only to CEO response box
    if (frm.doc.query_status !== "Pending From CEO") {
      if (frm.doc.ceo_user_status === "Responded") {
        frm.set_df_property("ceo_response_box", "read_only", 1);
        frm.set_df_property("ceo_attach_box", "read_only", true);
      }
      frm.refresh_field("ceo_response_box");
      frm.refresh_field("ceo_attach_box");
    }
  },
  employee_id: function (frm) {
    frm.trigger("fetch_employee_id");
  },
  audit_query_box: function (frm) {
    // Check if audit_query_box has a value before converting to uppercase
    if (frm.doc.audit_query_box) {
      frm.set_value("audit_query_box", frm.doc.audit_query_box.toUpperCase());
      frm.refresh_field("audit_query_box");
    }
  },
  bm_response_box: function (frm) {
    // Check if bm_response_box has a value before converting to uppercase
    if (frm.doc.bm_response_box) {
      frm.set_value("bm_response_box", frm.doc.bm_response_box.toUpperCase());
      frm.refresh_field("bm_response_box");
    }
  },
  dh_response_box: function (frm) {
    // Check if dh_response_box has a value before converting to uppercase
    if (frm.doc.dh_response_box) {
      frm.set_value("dh_response_box", frm.doc.dh_response_box.toUpperCase());
      frm.refresh_field("dh_response_box");
    }
  },
  com_response_box: function (frm) {
    // Check if com_response_box has a value before converting to uppercase
    if (frm.doc.com_response_box) {
      frm.set_value("com_response_box", frm.doc.com_response_box.toUpperCase());
      frm.refresh_field("com_response_box");
    }
  },
  rm_response_box: function (frm) {
    // Check if com_response_box has a value before converting to uppercase
    if (frm.doc.rm_response_box) {
      frm.set_value("rm_response_box", frm.doc.rm_response_box.toUpperCase());
      frm.refresh_field("rm_response_box");
    }
  },
  rom_response_box: function (frm) {
    // Check if com_response_box has a value before converting to uppercase
    if (frm.doc.rom_response_box) {
      frm.set_value("rom_response_box", frm.doc.rom_response_box.toUpperCase());
      frm.refresh_field("rom_response_box");
    }
  },
  zm_response_box: function (frm) {
    // Check if com_response_box has a value before converting to uppercase
    if (frm.doc.zm_response_box) {
      frm.set_value("zm_response_box", frm.doc.zm_response_box.toUpperCase());
      frm.refresh_field("zm_response_box");
    }
  },
  zom_response_box: function (frm) {
    // Check if com_response_box has a value before converting to uppercase
    if (frm.doc.zom_response_box) {
      frm.set_value("zom_response_box", frm.doc.zom_response_box.toUpperCase());
      frm.refresh_field("zom_response_box");
    }
  },
  gm_response_box: function (frm) {
    // Check if com_response_box has a value before converting to uppercase
    if (frm.doc.gm_response_box) {
      frm.set_value("gm_response_box", frm.doc.gm_response_box.toUpperCase());
      frm.refresh_field("gm_response_box");
    }
  },
  coo_response_box: function (frm) {
    // Check if com_response_box has a value before converting to uppercase
    if (frm.doc.coo_response_box) {
      frm.set_value("coo_response_box", frm.doc.coo_response_box.toUpperCase());
      frm.refresh_field("coo_response_box");
    }
  },
  ceo_response_box: function (frm) {
    // Check if com_response_box has a value before converting to uppercase
    if (frm.doc.ceo_response_box) {
      frm.set_value("ceo_response_box", frm.doc.ceo_response_box.toUpperCase());
      frm.refresh_field("ceo_response_box");
    }
  },
  before_save: function (frm) {
    // If the status is blank, set it to "Draft" before saving
    if (!frm.doc.status) {
      frm.set_value("status", "Draft");
      frm.refresh_field("status");
    }

    // Check if branch and employee_details are not empty before saving
    // if (!frm.doc.emp_branch || !frm.doc.employee_id) {
    //   frappe.msgprint(
    //     "<b>Before saving, First input Branch and select Employee.</b>"
    //   );
    //   frappe.validated = false;
    //   return;
    // }

    // Check if query_box is not empty before saving
    if (!frm.doc.audit_query_box) {
      frappe.msgprint(
        "<b>Before saving, First input your queries in the Query Box.</b>"
      );
      frappe.validated = false;
      return;
    }
  },
  emp_branch: function (frm) {
    // Get the selected branch value
    var selected_branch = frm.doc.emp_branch;
    console.log("selected branch : " + selected_branch);
    // Apply filter to employee_details field based on the selected branch
    frm.set_query("employee_id", function () {
      return {
        filters: {
          branch: selected_branch,
        },
      };
    });
    // Clear the employee_details field if branch is changed
    frm.set_value("employee_id", null);
  },
  // Function to call the Python method and set intro HTML
  call_html_intro: function (frm) {
    if (!frm.is_new()) {
      frappe.call({
        method:
          "audit_management.audit_management.doctype.my_audits.my_audits.get_status_tracker_html",
        args: {
          docname: frm.doc.name, // Pass the document name here
        },
        callback: function (r) {
          if (r.message && !frm.is_intro_set) {
            // Set the HTML output as the intro
            frm.set_intro(r.message, true);
            // Set the flag to ensure this doesn't run again
            frm.is_intro_set = true;
          }
        },
      });
    }
  },
  refresh: function (frm) {
    // Reset the flag on refresh to allow intro to be set again when required
    frm.is_intro_set = false;
    frm.trigger("call_html_intro");
    frm.trigger("check_field_read_only");
    frm.trigger("set_background_colors");

    // Call intro only if in draft status and intro has not been set yet
    // if (
    //   ((frm.doc.status === "Draft" ||
    //     frm.doc.status === "Pending" ||
    //     frm.doc.status === "Close") &&
    //     !frm.is_intro_set)) {
    //   frappe.after_ajax(function () {
    //     frm.trigger("call_html_intro");
    //   });
    // }
    // const statusFields = [
    //   "bm_user_status",
    //   "dh_user_status",
    //   "com_user_status",
    //   "rm_user_status",
    //   "rom_user_status",
    //   "zm_user_status",
    //   "zom_user_status",
    //   "gm_user_status",// Add all relevant fields here
    //   "coo_user_status",
    //   "ceo_user_status",
    // ];

    // statusFields.forEach((field) => {
    //   frm.fields_dict[field].df.on_change = function () {
    //     frm.is_intro_set = false; // Reset the intro set flag when the status changes
    //     frm.trigger("call_html_intro");
    //   };
    // });
    if (frm.doc.status === "Close") {
      frm.disable_form();
    }
    if (frappe.user.has_role("Audit Manager") && frm.doc.status === "Pending") {
      frm.disable_form();
    }
    if (frm.is_new()) {
      console.log("new");
      frm.trigger("fetch_query_maker");
      frm.trigger("fetch_employee_id");
    } else if (!frm.is_new()) {
      console.log("not new");
      frm.trigger("fetch_query_maker");
      frm.trigger("fetch_employee_id");
      if (
        frm.doc.status === "Pending" &&
        ((frappe.session.user == frm.doc.bm_user_id &&
          frm.doc.bm_user_status === "Pending") ||
          (frappe.session.user == frm.doc.gm_user_id &&
            frm.doc.gm_user_status === "Pending") ||
          (frappe.session.user == frm.doc.coo_user_id &&
            frm.doc.coo_user_status === "Pending") ||
          (frappe.session.user == frm.doc.ceo_user_id &&
            frm.doc.ceo_user_status === "Pending"))
      ) {
        frm.trigger("show_sendResponse_btn");
      }

      // jab DH||COM aur RM||ROM aur ZM||ZOM mese koi bhi reply na kre to dono ko sendTOresponse ki button dikhane
      if (
        frm.doc.status === "Pending" &&
        ((frappe.session.user == frm.doc.dh_user_id &&
          frm.doc.dh_user_status === "Pending") ||
          (frappe.session.user == frm.doc.com_user_id &&
            frm.doc.com_user_status === "Pending") ||
          (frappe.session.user == frm.doc.rm_user_id &&
            frm.doc.rm_user_status === "Pending") ||
          (frappe.session.user == frm.doc.rom_user_id &&
            frm.doc.rom_user_status === "Pending") ||
          (frappe.session.user == frm.doc.zm_user_id &&
            frm.doc.zm_user_status === "Pending") ||
          (frappe.session.user == frm.doc.zom_user_id &&
            frm.doc.zom_user_status === "Pending"))
      ) {
        frm.trigger("show_sendResponse_btn");
      }

      // jab DH||COM aur RM||ROM aur ZM||ZOM mese koi ek reply kre to dusre ko sendTOresponse ki button dikhane
      if (
        (frappe.session.user == frm.doc.dh_user_id &&
          frm.doc.dh_user_status === "Pending" &&
          frm.doc.com_user_status === "Responded") ||
        (frappe.session.user == frm.doc.com_user_id &&
          frm.doc.com_user_status === "Pending" &&
          frm.doc.dh_user_status === "Responded") ||
        (frappe.session.user == frm.doc.rm_user_id &&
          frm.doc.rm_user_status === "Pending" &&
          frm.doc.rom_user_status === "Responded") ||
        (frappe.session.user == frm.doc.rom_user_id &&
          frm.doc.rom_user_status === "Pending" &&
          frm.doc.rm_user_status === "Responded") ||
        (frappe.session.user == frm.doc.zm_user_id &&
          frm.doc.zm_user_status === "Pending" &&
          frm.doc.zom_user_status === "Responded") ||
        (frappe.session.user == frm.doc.zom_user_id &&
          frm.doc.zom_user_status === "Pending" &&
          frm.doc.zm_user_status === "Responded")
      ) {
        frm.trigger("show_sendResponse_btn");
      }
      // if (
      //   frappe.user.has_role("Audit Manager") &&
      //   frm.doc.status === "Pending" &&
      //   (frm.doc.bm_user_status === "" ||
      //     frm.doc.dh_user_status === "" ||
      //     frm.doc.com_user_status === "" ||
      //     frm.doc.rm_user_status === "" ||
      //     frm.doc.rom_user_status === "" ||
      //     frm.doc.zm_user_status === "" ||
      //     frm.doc.zom_user_status === "" ||
      //     frm.doc.gm_user_status === "" ||
      //     frm.doc.coo_user_status === "" ||
      //     frm.doc.ceo_user_status === "")
      // ) {
      // }

      if (
        frappe.user.has_role("Audit Manager") &&
        (frm.doc.status === "Draft" || frm.doc.status === "Pending")
      ) {
        if (frm.doc.bm_user_status === "") {
          frm.trigger("show_sendToBmWithClose_btn");
        }
        if (frm.doc.dh_user_status === "" || frm.doc.com_user_status === "") {
          frm.trigger("show_sendToDhComWithClose_btn");
        }
        if (frm.doc.rm_user_status === "" || frm.doc.rom_user_status === "") {
          frm.trigger("show_sendToRmRomWithClose_btn");
        }
        if (frm.doc.zm_user_status === "" || frm.doc.zom_user_status === "") {
          frm.trigger("show_sendToZmZomWithClose_btn");
        }
        if (frm.doc.gm_user_status === "") {
          frm.trigger("show_sendToGm_withClose_btn");
        }
        if (frm.doc.coo_user_status === "") {
          frm.trigger("show_sendToCOO_withClose_btn");
        }
        if (frm.doc.ceo_user_status === "") {
          frm.trigger("show_sendToCEO_withClose_btn");
        }
        if (
          !frm.doc.bm_user_status ||
          !frm.doc.dh_user_status ||
          !frm.doc.com_user_status ||
          !frm.doc.rm_user_status ||
          !frm.doc.rom_user_status ||
          !frm.doc.zm_user_status ||
          !frm.doc.zom_user_status ||
          !frm.doc.gm_user_status ||
          !frm.doc.coo_user_status ||
          !frm.doc.ceo_user_status
        ) {
          frm.trigger("show_sendToAll_withClose_btn");
        }
      }
      if (frm.doc.status !== "Draft" && frappe.user.has_role("Audit Manager")) {
        frm.trigger("close_query");
      }

      // if (
      //   frappe.user.has_role("Audit Manager") &&
      //   frm.doc.status === "Pending" &&
      //   frm.doc.query_status === "Response From BM" &&
      //   frm.doc.bm_user_status === "Responded"
      // ) {
      //   frm.trigger("show_sendToDhComWithClose_btn");
      // }

      // if (
      //   frappe.user.has_role("Audit Manager") &&
      //   frm.doc.status === "Pending" &&
      //   frm.doc.query_status === "Response From DH & COM" &&
      //   frm.doc.dh_user_status === "Responded" &&
      //   frm.doc.com_user_status === "Responded"
      // ) {
      //   frm.trigger("show_sendToRmRomWithClose_btn");
      // }
      // if (
      //   frappe.user.has_role("Audit Manager") &&
      //   frm.doc.status === "Pending" &&
      //   frm.doc.query_status === "Response From RM & ROM" &&
      //   frm.doc.rm_user_status === "Responded" &&
      //   frm.doc.rom_user_status === "Responded"
      // ) {
      //   frm.trigger("show_sendToZmZomWithClose_btn");
      // }
      // if (
      //   frappe.user.has_role("Audit Manager") &&
      //   frm.doc.status === "Pending" &&
      //   frm.doc.query_status === "Response From ZM & ZOM" &&
      //   frm.doc.zm_user_status === "Responded" &&
      //   frm.doc.zom_user_status === "Responded"
      // ) {
      //   frm.trigger("show_sendtoCOOorGm_withClose_btn");
      // }
    }
    // // Define the status messages
    // let statusMessages = {
    //   pending: "Pending",
    //   responded: "Responded",
    // };

    // // Define colors
    // let colors = {
    //   green: "#28a745",
    //   red: "#dc3545",
    // };

    // // Initialize the intro message
    // let introMessage = "";

    // // Check the current status and set the intro message
    // if (frm.doc.status === "Pending") {
    //   if (
    //     frm.doc.query_status === "Pending From BM" &&
    //     frm.doc.bm_user_status === "Pending"
    //   ) {
    //     introMessage = `
    // 			<p><span style="color: ${colors.green}">Audit Manager</span> &#8658;
    // 			<span style="color: ${colors.red}">BM</span></p>
    // 		`;
    //   } else if (
    //     frm.doc.query_status === "Response From BM" &&
    //     frm.doc.bm_user_status === "Responded"
    //   ) {
    //     introMessage = `
    // 			<p><span style="color: ${colors.green}">Audit Manager</span> &#8658;
    // 			<span style="color: ${colors.green}">BM</span></p>
    // 		`;
    //   } else if (
    //     frm.doc.query_status === "Pending From DH & COM" &&
    //     frm.doc.dh_user_status === "Pending" &&
    //     frm.doc.com_user_status === "Pending"
    //   ) {
    //     introMessage = `
    //      <table>
    //         <tr>
    //             <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
    //             <td>&#8663;</td>
    //             <td style="color: ${colors.red};"> DH</td>
    //         </tr>
    //         <tr>
    //             <td>&#8664;</td>
    //             <td style="color: ${colors.red};"> COM</td>
    //         </tr>
    //     </table>`;
    //   } else if (
    //     frm.doc.query_status === "Response From DH" &&
    //     frm.doc.dh_user_status === "Responded" &&
    //     frm.doc.com_user_status === "Pending"
    //   ) {
    //     introMessage = `
    //      <table>
    //         <tr>
    //             <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
    //             <td>&#8663;</td>
    //             <td style="color: ${colors.green};"> DH</td>
    //         </tr>
    //         <tr>
    //             <td>&#8664;</td>
    //             <td style="color: ${colors.red};"> COM</td>
    //         </tr>
    //     </table>`;
    //   } else if (
    //     frm.doc.query_status === "Response From COM" &&
    //     frm.doc.dh_user_status === "Pending" &&
    //     frm.doc.com_user_status === "Responded"
    //   ) {
    //     introMessage = `
    //      <table>
    //         <tr>
    //             <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
    //             <td>&#8663;</td>
    //             <td style="color: ${colors.red};"> DH</td>
    //         </tr>
    //         <tr>
    //             <td>&#8664;</td>
    //             <td style="color: ${colors.green};"> COM</td>
    //         </tr>
    //     </table>`;
    //   } else if (
    //     frm.doc.query_status === "Response From DH & COM" &&
    //     frm.doc.dh_user_status === "Responded" &&
    //     frm.doc.com_user_status === "Responded"
    //   ) {
    //     introMessage = `
    //      <table>
    //         <tr>
    //             <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
    //             <td>&#8663;</td>
    //             <td style="color: ${colors.green};"> DH</td>
    //         </tr>
    //         <tr>
    //             <td>&#8664;</td>
    //             <td style="color: ${colors.green};"> COM</td>
    //         </tr>
    //     </table>`;
    //   } else if (
    //     frm.doc.query_status === "Pending From RM & ROM" &&
    //     frm.doc.rm_user_status === "Pending" &&
    //     frm.doc.rom_user_status === "Pending" &&
    //     frm.doc.dh_user_status === "Responded" &&
    //     frm.doc.com_user_status === "Responded"
    //   ) {
    //     introMessage = `
    //       <table>
    //          <tr>
    //              <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
    //              <td>&#8663;</td>
    //              <td style="color: ${colors.green};"> DH</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.red};"> RM</td>
    //          </tr>
    //          <tr>
    //              <td>&#8664;</td>
    //              <td style="color: ${colors.green};"> COM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.red};"> ROM</td>
    //          </tr>
    //      </table>`;
    //   } else if (
    //     frm.doc.query_status === "Response From ROM" &&
    //     frm.doc.rm_user_status === "Pending" &&
    //     frm.doc.rom_user_status === "Responded" &&
    //     frm.doc.dh_user_status === "Responded" &&
    //     frm.doc.com_user_status === "Responded"
    //   ) {
    //     introMessage = `
    //       <table>
    //          <tr>
    //              <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
    //              <td>&#8663;</td>
    //              <td style="color: ${colors.green};"> DH</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.red};"> RM</td>
    //          </tr>
    //          <tr>
    //              <td>&#8664;</td>
    //              <td style="color: ${colors.green};"> COM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> ROM</td>
    //          </tr>
    //      </table>`;
    //   } else if (
    //     frm.doc.query_status === "Response From RM" &&
    //     frm.doc.rm_user_status === "Responded" &&
    //     frm.doc.rom_user_status === "Pending" &&
    //     frm.doc.dh_user_status === "Responded" &&
    //     frm.doc.com_user_status === "Responded"
    //   ) {
    //     introMessage = `
    //       <table>
    //          <tr>
    //              <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
    //              <td>&#8663;</td>
    //              <td style="color: ${colors.green};"> DH</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> RM</td>
    //          </tr>
    //          <tr>
    //              <td>&#8664;</td>
    //              <td style="color: ${colors.green};"> COM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.red};"> ROM</td>
    //          </tr>
    //      </table>`;
    //   } else if (
    //     frm.doc.query_status === "Response From RM & ROM" &&
    //     frm.doc.rm_user_status === "Responded" &&
    //     frm.doc.rom_user_status === "Responded" &&
    //     frm.doc.dh_user_status === "Responded" &&
    //     frm.doc.com_user_status === "Responded"
    //   ) {
    //     introMessage = `
    //       <table>
    //          <tr>
    //              <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
    //              <td>&#8663;</td>
    //              <td style="color: ${colors.green};"> DH</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> RM</td>
    //          </tr>
    //          <tr>
    //              <td>&#8664;</td>
    //              <td style="color: ${colors.green};"> COM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> ROM</td>
    //          </tr>
    //      </table>`;
    //   }
    //   // for zm & zom
    //   else if (
    //     frm.doc.query_status === "Pending From ZM & ZOM" &&
    //     frm.doc.zm_user_status === "Pending" &&
    //     frm.doc.zom_user_status === "Pending" &&
    //     frm.doc.rm_user_status === "Responded" &&
    //     frm.doc.rom_user_status === "Responded"
    //   ) {
    //     introMessage = `
    //       <table>
    //          <tr>
    //              <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
    //              <td>&#8663;</td>
    //              <td style="color: ${colors.green};"> DH</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> RM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.red};"> ZM</td>
    //          </tr>
    //          <tr>
    //              <td>&#8664;</td>
    //              <td style="color: ${colors.green};"> COM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> ROM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.red};"> ZOM</td>
    //          </tr>
    //      </table>`;
    //   } else if (
    //     frm.doc.query_status === "Response From ZOM" &&
    //     frm.doc.zm_user_status === "Pending" &&
    //     frm.doc.zom_user_status === "Responded" &&
    //     frm.doc.rm_user_status === "Responded" &&
    //     frm.doc.rom_user_status === "Responded"
    //   ) {
    //     introMessage = `
    //       <table>
    //          <tr>
    //              <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
    //              <td>&#8663;</td>
    //              <td style="color: ${colors.green};"> DH</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> RM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.red};"> ZM</td>
    //          </tr>
    //          <tr>
    //              <td>&#8664;</td>
    //              <td style="color: ${colors.green};"> COM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> ROM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> ZOM</td>
    //          </tr>
    //      </table>`;
    //   } else if (
    //     frm.doc.query_status === "Response From ZM" &&
    //     frm.doc.zm_user_status === "Responded" &&
    //     frm.doc.zom_user_status === "Pending" &&
    //     frm.doc.rm_user_status === "Responded" &&
    //     frm.doc.rom_user_status === "Responded"
    //   ) {
    //     introMessage = `
    //       <table>
    //          <tr>
    //              <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
    //              <td>&#8663;</td>
    //              <td style="color: ${colors.green};"> DH</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> RM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> ZM</td>
    //          </tr>
    //          <tr>
    //              <td>&#8664;</td>
    //              <td style="color: ${colors.green};"> COM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> ROM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.red};"> ZOM</td>
    //          </tr>
    //      </table>`;
    //   } else if (
    //     frm.doc.query_status === "Response From ZM & ZOM" &&
    //     frm.doc.zm_user_status === "Responded" &&
    //     frm.doc.zom_user_status === "Responded" &&
    //     frm.doc.rm_user_status === "Responded" &&
    //     frm.doc.rom_user_status === "Responded"
    //   ) {
    //     introMessage = `
    //       <table>
    //          <tr>
    //              <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
    //              <td>&#8663;</td>
    //              <td style="color: ${colors.green};"> DH</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> RM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> ZM</td>
    //          </tr>
    //          <tr>
    //              <td>&#8664;</td>
    //              <td style="color: ${colors.green};"> COM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> ROM</td>
    //              <td>&#8658;</td>
    //              <td style="color: ${colors.green};"> ZOM</td>
    //          </tr>
    //      </table>`;
    //   }

    //   // Add similar checks for other levels...
    // }

    // // Set the intro message
    // frm.set_intro(introMessage, true);
  },
  // fetch_employee_id: function (frm) {
  //   if (frm.doc.employee_id) {
  //     frappe.call({
  //       method:
  //         "audit_management.audit_management.doctype.audit_level.audit_level.fetch_employee",
  //       args: {
  //         employee_id: frm.doc.employee_id,
  //       },
  //       callback: function (r) {
  //         if (!r.exc) {
  //           if (Array.isArray(r.message) && r.message.length > 0) {
  //             const employeeData = r.message[0]; // Accessing the first element of the array
  //             console.log("Employee Data:", employeeData);

  //             // Safeguard against potential HTML injection
  //             const escapeHtml = (unsafe) => {
  //               return unsafe
  //                 .replace(/&/g, "&amp;")
  //                 .replace(/</g, "&lt;")
  //                 .replace(/>/g, "&gt;")
  //                 .replace(/"/g, "&quot;")
  //                 .replace(/'/g, "&#039;");
  //             };

  //             // Directly set the response data in HTML with inline CSS
  //             let html = `
  // 								  <style>
  // 									  .myemployee-grid {
  // 										  display: grid;
  // 										  grid-template-columns: repeat(3, 1fr); /* Creates 3 equal columns */
  // 										  gap: 10px; /* Adds space between items */
  // 									  }
  // 									  .myemployee-grid p {
  // 										  border-radius: 5px;
  // 										  padding: 7px;
  // 										  margin: 5px;
  // 										  background: #f4f5f6;
  // 									  }
  // 									  .mylabel {
  // 										  margin: 8px;
  // 										  font-size: var(--text-sm);
  // 									  }
  // 								  </style>
  // 								  <div class="employee-details">
  // 									  <div class="myemployee-grid">
  // 										  <div>
  // 											  <span class="mylabel">Employee Name</span>
  // 											  <p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
  // 											  <span class="mylabel">Employee ID</span>
  // 											  <p id="employee_id">${escapeHtml(frm.doc.employee_id || "- - -")}</p>
  // 											  <span class="mylabel">Designation</span>
  // 											  <p id="employee_designation">${escapeHtml(
  //                           employeeData.designation || "- - -"
  //                         )}</p><hr>
  // 										  </div>
  // 										  <div>
  // 											  <span class="mylabel">Phone</span>
  // 											  <p id="employee_phone">${escapeHtml(employeeData.cell_number || "- - -")}</p>
  // 											  <span class="mylabel">Region</span>
  // 											  <p id="employee_region">${escapeHtml(employeeData.region || "- - -")}</p>
  // 											  <span class="mylabel">Division</span>
  // 											  <p id="employee_division">${escapeHtml(
  //                           employeeData.division || "- - -"
  //                         )}</p><hr>
  // 										  </div>
  // 										  <div>
  // 											  <span class="mylabel">District</span>
  // 											  <p id="employee_district">${escapeHtml(employeeData.district || "- - -")}</p>
  // 											  <span class="mylabel">Branch</span>
  // 											  <p id="employee_branch">${escapeHtml(employeeData.branch || "- - -")}</p>
  // 											  <span class="mylabel">Department</span>
  // 											  <p id="employee_department">${escapeHtml(
  //                           employeeData.department || "- - -"
  //                         )}</p><hr>
  // 										  </div>
  // 									  </div>
  // 								  </div>
  // 							  `;

  //             // Set the above `html` as Summary HTML
  //             frm.set_df_property("employee_html", "options", html);

  //             // Setting user_id in the form field
  //             // frm.set_value("stage_1_bm_user_id", employeeData.user_id || "- - -");
  //           } else {
  //             console.error("Unexpected response format or empty data.");
  //           }
  //         } else {
  //           console.error("Error in API call:", r.exc);
  //         }
  //       },
  //     });
  //   }
  // },
  set_background_colors: function (frm) {
    // frm.fields_dict["enter_branch_section"].wrapper.css({
    //   "background-color": "#f29996",
    // });
    // frm.fields_dict["audit_query_section"].wrapper.css({
    //   "background-color": "#eb9c9e", // Gradient
    // });
    // frm.fields_dict["bm_response_section"].wrapper.css({
    //   "background-color": "#e49ea6",
    // });
  },
  fetch_query_maker: function (frm) {
    console.log("new");
    // When form is new
    // Setting Employee ID
    let auditor_user = frm.doc.owner;
    let auditor_user_emp_id = auditor_user.match(/\d+/)[0];
    console.log("Employee ID:", auditor_user_emp_id);

    frm.call({
      method: "fetch_employee_data",
      args: {
        employee_id: auditor_user_emp_id,
      },
      callback: function (r) {
        if (!r.exc) {
          // Accessing response data
          const employeeData = r.message[0]; // Accessing the first element of the array
          console.log("Employee Data:", employeeData);

          // Set emp_full_name field with employee's name
          frm.set_value("query_generated_by_name", employeeData.employee_name);
          console.log(frm.doc.query_generated_by_name);
          frm.refresh_field("query_generated_by_name");

          frm.set_value(
            "query_generated_by_designation",
            employeeData.designation
          );
          console.log(frm.doc.query_generated_by_designation);
          frm.refresh_field("query_generated_by_designation");

          frm.set_value("query_generated_by_branch", employeeData.branch);
          console.log(frm.doc.query_generated_by_branch);
          frm.refresh_field("query_generated_by_branch");
        } else {
          console.error("Error fetching employee data", r.exc);
        }
      },
      error: function (err) {
        console.error("Failed to fetch employee data", err);
      },
    });
  },
  show_sendToBmWithClose_btn: function (frm) {
    console.log("audit work kar raha hai");
    if (
      frappe.user.has_role("Audit Manager") &&
      (frm.doc.status === "Draft" || frm.doc.status === "Pending")
    ) {
      console.log("Condition met: User is Audit Manager and status is Draft.");
      console.log("User roles:", frappe.user.roles); // Log user roles
      console.log("Document status:", frm.doc.status); // Log the document status

      // Make fields read-only and add custom button
      frm.set_df_property("audit_query_box", "read_only", true);
      frm.set_df_property("emp_branch", "read_only", true);
      frm.set_df_property("employee_id", "read_only", true);

      frm
        .add_custom_button(
          __("Send to BM"),
          function () {
            // Fallback if emp_branch is not available
            let emp_branch = frm.doc.emp_branch || "the employee's branch";

            frappe.confirm(
              `<i><b>Do you want to send query to the Level 1 (BM of ${emp_branch}) i.e "${frm.doc.bm_name}"?</b></i>`,
              () => {
                frappe.call({
                  method: "frappe.share.add",
                  freeze: true,
                  freeze_message: "Internet Not Stable, Please Wait...",
                  args: {
                    doctype: frm.doctype,
                    name: frm.docname,
                    user: frm.doc.bm_user_id,
                    read: 1,
                    write: 1,
                    submit: 0,
                    share: 1,
                    notify: 1,
                    send_email: 0,
                  },
                  callback: function (response) {
                    frappe.show_alert({
                      message: "Your Query Request Sent Successfully",
                      indicator: "green",
                    });
                    frm.set_value("status", "Pending");
                    frm.set_value("query_status", "Pending From BM");
                    frm.set_value("bm_user_status", "Pending");
                    frm.refresh_field("status");
                    frm.refresh_field("query_status");
                    frm.refresh_field("bm_user_status");
                    // Call the common function to set pending time for BM
                    frm.frappecalltopendingtimefunction(frm, frm.docname, "bm");
                    frm.save();
                  },
                });
              }
            );
          },
          "Send to"
        )
        .css({
          "background-color": "#28a745",
          color: "#ffffff",
          margin: "1px",
        });
      // Add styling to the button using its class
      $('.btn.btn-default.ellipsis:contains("Send to")').css({
        "background-color": "#28a745", // Custom green background color
        color: "#ffffff", // White text color
        margin: "1px",
        width: "100px",
      });
    } else {
      console.log("Condition not met.");
    }
    if (frm.doc.status !== "Draft") {
      frm.trigger("close_query");
    }
  },
  show_sendToDhComWithClose_btn: function (frm) {
    // Add the first button - "Send Response"
    if (
      frappe.user.has_role("Audit Manager") &&
      (frm.doc.status === "Draft" || frm.doc.status === "Pending")
    ) {
      frm
        .add_custom_button(
          __("Send to DH/COM"),
          function () {
            // Fallback if emp_branch is not available
            let emp_branch = frm.doc.emp_branch || "the employee's branch";

            frappe.confirm(
              `<i><b>Do you want to send the query to the Level 2 (DH & COM of ${emp_branch}) i.e "${frm.doc.dh_name}" & "${frm.doc.com_name}"?</b></i>`,
              () => {
                // Send the document to both DH and COM users
                Promise.all([
                  frappe.call({
                    method: "frappe.share.add",
                    freeze: true,
                    freeze_message: "Internet Not Stable, Please Wait...",
                    args: {
                      doctype: frm.doctype,
                      name: frm.docname,
                      user: frm.doc.dh_user_id, // Send to DH user
                      read: 1,
                      write: 1,
                      submit: 0,
                      share: 1,
                      notify: 1,
                      send_email: 0,
                    },
                  }),
                  frappe.call({
                    method: "frappe.share.add",
                    freeze: true,
                    freeze_message: "Internet Not Stable, Please Wait...",
                    args: {
                      doctype: frm.doctype,
                      name: frm.docname,
                      user: frm.doc.com_user_id, // Send to COM user
                      read: 1,
                      write: 1,
                      submit: 0,
                      share: 1,
                      notify: 1,
                      send_email: 0,
                    },
                  }),
                ])
                  .then(() => {
                    // Both calls are successful
                    console.log("send to DH and COM");
                    frappe.show_alert({
                      message:
                        "Your Approval Request Sent to DH and COM Successfully",
                      indicator: "green",
                    });
                    frm.set_value("status", "Pending");
                    frm.set_value("query_status", "Pending From DH & COM");
                    frm.set_value("dh_user_status", "Pending");
                    frm.set_value("com_user_status", "Pending");
                    frm.refresh_field("query_status");
                    frm.refresh_field("status");
                    frm.refresh_field("dh_user_status");
                    frm.refresh_field("com_user_status");
                    // Call the common function to set pending time for DH & COM
                    frm.frappecalltopendingtimefunction(
                      frm,
                      frm.docname,
                      "dh_com"
                    );
                    frm.save();
                  })
                  .catch(() => {
                    // Handle failure
                    frappe.msgprint(
                      "An error occurred while sending the request to DH/COM."
                    );
                  });
              }
            );
          },
          "Send to"
        )
        .css({
          "background-color": "#28a745",
          color: "#ffffff",
          margin: "1px",
        });
      // Add styling to the button using its class
      $('.btn.btn-default.ellipsis:contains("Send to")').css({
        "background-color": "#28a745", // Custom green background color
        color: "#ffffff", // White text color
        margin: "1px",
        width: "100px",
      });
      if (frm.doc.status !== "Draft") {
        frm.trigger("close_query");
      }
    }
  },
  show_sendToRmRomWithClose_btn: function (frm) {
    // Add the first button - "Send Response"
    if (
      frappe.user.has_role("Audit Manager") &&
      (frm.doc.status === "Draft" || frm.doc.status === "Pending")
    ) {
      frm
        .add_custom_button(
          __("Send to RM/ROM"),
          function () {
            // Fallback if emp_branch is not available
            let emp_branch = frm.doc.emp_branch || "the employee's branch";

            frappe.confirm(
              `<i><b>Do you want to send the query to the Level 3 (RM & ROM of ${emp_branch}) i.e "${frm.doc.rm_name}" & "${frm.doc.rom_name}"?</b></i>`,
              () => {
                // Send the document to both DH and COM users
                Promise.all([
                  frappe.call({
                    method: "frappe.share.add",
                    freeze: true,
                    freeze_message: "Internet Not Stable, Please Wait...",
                    args: {
                      doctype: frm.doctype,
                      name: frm.docname,
                      user: frm.doc.rm_user_id, // Send to RM user
                      read: 1,
                      write: 1,
                      submit: 0,
                      share: 1,
                      notify: 1,
                      send_email: 0,
                    },
                  }),
                  frappe.call({
                    method: "frappe.share.add",
                    freeze: true,
                    freeze_message: "Internet Not Stable, Please Wait...",
                    args: {
                      doctype: frm.doctype,
                      name: frm.docname,
                      user: frm.doc.rom_user_id, // Send to ROM user
                      read: 1,
                      write: 1,
                      submit: 0,
                      share: 1,
                      notify: 1,
                      send_email: 0,
                    },
                  }),
                ])
                  .then(() => {
                    // Both calls are successful
                    console.log("send to RM and ROM");
                    frappe.show_alert({
                      message:
                        "Your Approval Request Sent to send to RM and ROM Successfully",
                      indicator: "green",
                    });
                    frm.set_value("status", "Pending");
                    frm.set_value("query_status", "Pending From RM & ROM");
                    frm.set_value("rm_user_status", "Pending");
                    frm.set_value("rom_user_status", "Pending");

                    frm.refresh_field("query_status");
                    frm.refresh_field("status");
                    frm.refresh_field("rm_user_status");
                    frm.refresh_field("rom_user_status");

                    // Call the common function to set pending time for RM & ROM
                    frm.frappecalltopendingtimefunction(
                      frm,
                      frm.docname,
                      "rm_rom"
                    );
                    frm.save();
                  })
                  .catch(() => {
                    // Handle failure
                    frappe.msgprint(
                      "An error occurred while sending the request to DH/COM."
                    );
                  });
              }
            );
          },
          "Send to"
        )
        .css({
          "background-color": "#28a745",
          color: "#ffffff",
          margin: "1px",
        });
      // Add styling to the button using its class
      $('.btn.btn-default.ellipsis:contains("Send to")').css({
        "background-color": "#28a745", // Custom green background color
        color: "#ffffff", // White text color
        margin: "1px",
        width: "100px",
      });

      if (frm.doc.status !== "Draft") {
        frm.trigger("close_query");
      }
    }
  },
  show_sendToZmZomWithClose_btn: function (frm) {
    // Add the first button - "Send Response"
    if (
      frappe.user.has_role("Audit Manager") &&
      (frm.doc.status === "Draft" || frm.doc.status === "Pending")
    ) {
      frm
        .add_custom_button(
          __("Send to ZM/ZOM"),
          function () {
            // Fallback if emp_branch is not available
            let emp_branch = frm.doc.emp_branch || "the employee's branch";

            frappe.confirm(
              `<i><b>Do you want to send the query to the Level 4 (ZM & ZOM of ${emp_branch}) i.e "${frm.doc.zm_name}" & "${frm.doc.zom_name}"?</b></i>`,
              () => {
                // Send the document to both DH and COM users
                Promise.all([
                  frappe.call({
                    method: "frappe.share.add",
                    freeze: true,
                    freeze_message: "Internet Not Stable, Please Wait...",
                    args: {
                      doctype: frm.doctype,
                      name: frm.docname,
                      user: frm.doc.zm_user_id, // Send to DH user
                      read: 1,
                      write: 1,
                      submit: 0,
                      share: 1,
                      notify: 1,
                      send_email: 0,
                    },
                  }),
                  frappe.call({
                    method: "frappe.share.add",
                    freeze: true,
                    freeze_message: "Internet Not Stable, Please Wait...",
                    args: {
                      doctype: frm.doctype,
                      name: frm.docname,
                      user: frm.doc.zom_user_id, // Send to COM user
                      read: 1,
                      write: 1,
                      submit: 0,
                      share: 1,
                      notify: 1,
                      send_email: 0,
                    },
                  }),
                ])
                  .then(() => {
                    // Both calls are successful
                    console.log("send to ZM and ZOM");
                    frappe.show_alert({
                      message:
                        "Your Approval Request Sent to ZM and ZOM Successfully",
                      indicator: "green",
                    });
                    frm.set_value("query_status", "Pending From ZM & ZOM");
                    frm.set_value("zm_user_status", "Pending");
                    frm.set_value("zom_user_status", "Pending");
                    frm.set_value("status", "Pending");
                    frm.refresh_field("status");
                    frm.refresh_field("query_status");
                    frm.refresh_field("zm_user_status");
                    frm.refresh_field("zom_user_status");

                    // Call the common function to set pending time for ZM & ZOM
                    frm.frappecalltopendingtimefunction(
                      frm,
                      frm.docname,
                      "zm_zom"
                    );
                    frm.save();
                  })
                  .catch(() => {
                    // Handle failure
                    frappe.msgprint(
                      "An error occurred while sending the request to DH/COM."
                    );
                  });
              }
            );
          },
          "Send to"
        )
        .css({
          "background-color": "#28a745",
          color: "#ffffff",
          margin: "1px",
        });
      // Add styling to the button using its class
      $('.btn.btn-default.ellipsis:contains("Send to")').css({
        "background-color": "#28a745", // Custom green background color
        color: "#ffffff", // White text color
        margin: "1px",
        width: "100px",
      });

      if (frm.doc.status !== "Draft") {
        frm.trigger("close_query");
      }
    }
  },
  show_sendToGm_withClose_btn: function (frm) {
    if (
      frappe.user.has_role("Audit Manager") &&
      (frm.doc.status === "Draft" || frm.doc.status === "Pending")
    ) {
      // Add the "Send to GM" button
      if (frm.doc.gm_user_status === "") {
        frm
          .add_custom_button(
            __("Send to GM"),
            function () {
              // Fallback if emp_branch is not available
              let emp_branch = frm.doc.emp_branch || "the employee's branch";

              frappe.confirm(
                `<i><b>Do you want to send the query to the Level 5 (GM of ${emp_branch}) i.e "${frm.doc.gm_name}"?</b></i>`,
                () => {
                  // Send the document to GM
                  frappe
                    .call({
                      method: "frappe.share.add",
                      freeze: true,
                      freeze_message: "Internet Not Stable, Please Wait...",
                      args: {
                        doctype: frm.doctype,
                        name: frm.docname,
                        user: frm.doc.gm_user_id, // Send to GM user
                        read: 1,
                        write: 1,
                        submit: 0,
                        share: 1,
                        notify: 1,
                        send_email: 0,
                      },
                    })
                    .then(() => {
                      // Success message
                      console.log("Sent to GM");
                      frappe.show_alert({
                        message:
                          "Your Approval Request Sent to GM Successfully",
                        indicator: "green",
                      });
                      frm.set_value("query_status", "Pending From GM");
                      frm.set_value("gm_user_status", "Pending");
                      frm.set_value("status", "Pending");
                      frm.refresh_field("status");
                      frm.refresh_field("query_status");
                      frm.refresh_field("gm_user_status");

                      // Call the common function to set pending time for GM
                      frm.frappecalltopendingtimefunction(
                        frm,
                        frm.docname,
                        "gm"
                      );
                      frm.save();
                    })
                    .catch(() => {
                      // Handle failure
                      frappe.msgprint(
                        "An error occurred while sending the request to GM."
                      );
                    });
                }
              );
            },
            "Send to"
          )
          .css({
            "background-color": "#28a745",
            color: "#ffffff",
            margin: "1px",
          });
        // Add styling to the button using its class
        $('.btn.btn-default.ellipsis:contains("Send to")').css({
          "background-color": "#28a745", // Custom green background color
          color: "#ffffff", // White text color
          margin: "1px",
          width: "100px",
        });
      }

      // Add the close_query button
      if (frm.doc.status !== "Draft") {
        frm.trigger("close_query");
      }
    }
  },
  show_sendToCOO_withClose_btn: function (frm) {
    if (
      frappe.user.has_role("Audit Manager") &&
      (frm.doc.status === "Draft" || frm.doc.status === "Pending")
    ) {
      // Add the "Send to COO" button
      if (frm.doc.coo_user_status === "") {
        frm
          .add_custom_button(
            __("Send to COO"),
            function () {
              // Fallback if emp_branch is not available
              let emp_branch = frm.doc.emp_branch || "the employee's branch";

              frappe.confirm(
                `<i><b>Do you want to send the query to the Level 5 (COO of ${emp_branch}) i.e "${frm.doc.coo_name}"?</b></i>`,
                () => {
                  // Send the document to COO
                  frappe
                    .call({
                      method: "frappe.share.add",
                      freeze: true,
                      freeze_message: "Internet Not Stable, Please Wait...",
                      args: {
                        doctype: frm.doctype,
                        name: frm.docname,
                        user: frm.doc.coo_user_id, // Send to COO user
                        read: 1,
                        write: 1,
                        submit: 0,
                        share: 1,
                        notify: 1,
                        send_email: 0,
                      },
                    })
                    .then(() => {
                      // Success message
                      console.log("Sent to COO");
                      frappe.show_alert({
                        message:
                          "Your Approval Request Sent to COO Successfully",
                        indicator: "green",
                      });

                      frm.set_value("query_status", "Pending From COO");
                      frm.set_value("coo_user_status", "Pending");
                      frm.set_value("status", "Pending");
                      frm.refresh_field("status");
                      frm.refresh_field("query_status");
                      frm.refresh_field("coo_user_status");

                      // Call the common function to set pending time for COO
                      frm.frappecalltopendingtimefunction(
                        frm,
                        frm.docname,
                        "coo"
                      );
                      frm.save();
                    })
                    .catch(() => {
                      // Handle failure
                      frappe.msgprint(
                        "An error occurred while sending the request to COO."
                      );
                    });
                }
              );
            },
            "Send to"
          )
          .css({
            "background-color": "#28a745",
            color: "#ffffff",
            margin: "1px",
          });
        // Add styling to the button using its class
        $('.btn.btn-default.ellipsis:contains("Send to")').css({
          "background-color": "#28a745", // Custom green background color
          color: "#ffffff", // White text color
          margin: "1px",
          width: "100px",
        });
      }

      // Add the close_query button
      if (frm.doc.status !== "Draft") {
        frm.trigger("close_query");
      }
    }
  },
  show_sendToCEO_withClose_btn: function (frm) {
    if (
      frappe.user.has_role("Audit Manager") &&
      (frm.doc.status === "Draft" || frm.doc.status === "Pending")
    ) {
      // Add the "Send to COO" button
      if (frm.doc.ceo_user_status === "") {
        frm
          .add_custom_button(
            __("Send to CEO"),
            function () {
              // Fallback if emp_branch is not available
              frappe.confirm(
                `<i><b>Do you want to send the query to the Level 5 (CEO) i.e "${frm.doc.ceo_name}"?</b></i>`,
                () => {
                  // Send the document to COO
                  frappe
                    .call({
                      method: "frappe.share.add",
                      freeze: true,
                      freeze_message: "Internet Not Stable, Please Wait...",
                      args: {
                        doctype: frm.doctype,
                        name: frm.docname,
                        user: frm.doc.ceo_user_id, // Send to COO user
                        read: 1,
                        write: 1,
                        submit: 0,
                        share: 1,
                        notify: 1,
                        send_email: 0,
                      },
                    })
                    .then(() => {
                      // Success message
                      console.log("Sent to CEO");
                      frappe.show_alert({
                        message:
                          "Your Approval Request Sent to CEO Successfully",
                        indicator: "green",
                      });

                      frm.set_value("query_status", "Pending From CEO");
                      frm.set_value("ceo_user_status", "Pending");
                      frm.set_value("status", "Pending");
                      frm.refresh_field("status");
                      frm.refresh_field("query_status");
                      frm.refresh_field("ceo_user_status");

                      // Call the common function to set pending time for CEO
                      frm.frappecalltopendingtimefunction(
                        frm,
                        frm.docname,
                        "ceo"
                      );
                      frm.save();
                    })
                    .catch(() => {
                      // Handle failure
                      frappe.msgprint(
                        "An error occurred while sending the request to CEO."
                      );
                    });
                }
              );
            },
            "Send to"
          )
          .css({
            "background-color": "#28a745",
            color: "#ffffff",
            margin: "1px",
          });
        // Add styling to the button using its class
        $('.btn.btn-default.ellipsis:contains("Send to")').css({
          "background-color": "#28a745", // Custom green background color
          color: "#ffffff", // White text color
          margin: "1px",
          width: "100px",
        });
      }

      // Add the close_query button
      if (frm.doc.status !== "Draft") {
        frm.trigger("close_query");
      }
    }
  },
  show_sendToAll_withClose_btn: function (frm) {
    if (
      frappe.user.has_role("Audit Manager") &&
      (frm.doc.status === "Draft" || frm.doc.status === "Pending")
    ) {
      // Create an array of user IDs and their corresponding status fields
      const userStatusMapping = [
        { userId: frm.doc.bm_user_id, statusField: "bm_user_status" },
        { userId: frm.doc.dh_user_id, statusField: "dh_user_status" },
        { userId: frm.doc.com_user_id, statusField: "com_user_status" },
        { userId: frm.doc.rm_user_id, statusField: "rm_user_status" },
        { userId: frm.doc.rom_user_id, statusField: "rom_user_status" },
        { userId: frm.doc.zm_user_id, statusField: "zm_user_status" },
        { userId: frm.doc.zom_user_id, statusField: "zom_user_status" },
        { userId: frm.doc.gm_user_id, statusField: "gm_user_status" },
        { userId: frm.doc.coo_user_id, statusField: "coo_user_status" },
        { userId: frm.doc.ceo_user_id, statusField: "ceo_user_status" },
      ];

      // Check if any of the statuses are empty
      const hasEmptyStatus = userStatusMapping.some((mapping) => {
        return !frm.doc[mapping.statusField]; // Check if _user_status is empty
      });

      // Add the "Send to All" button
      if (hasEmptyStatus) {
        frm
          .add_custom_button(
            __("<b>Send to ALL</b>"),
            function () {
              // Fallback if emp_branch is not available
              let emp_branch = frm.doc.emp_branch || "the employee's branch";

              frappe.confirm(
                `<i><b>Do you want to send the query to the remaining levels from branch ${emp_branch} (BM to CEO)?</b></i>`,
                () => {
                  let promises = [];

                  // Loop through each user and send the document if the status is empty
                  userStatusMapping.forEach((mapping) => {
                    if (!frm.doc[mapping.statusField]) {
                      promises.push(
                        frappe
                          .call({
                            method: "frappe.share.add",
                            args: {
                              doctype: frm.doctype,
                              name: frm.docname,
                              user: mapping.userId, // Send to each user
                              read: 1,
                              write: 1,
                              submit: 0,
                              share: 1,
                              notify: 1,
                              send_email: 0,
                            },
                          })
                          .then(() => {
                            // Update the user status to Pending
                            frm.set_value(mapping.statusField, "Pending");
                          })
                      );
                    }
                  });

                  // Execute all promises
                  Promise.all(promises)
                    .then(() => {
                      // Success message
                      console.log("Sent to All");
                      frappe.show_alert({
                        message:
                          "Your Query Request Sent to All stages Successfully",
                        indicator: "green",
                      });
                      frm.set_value("status", "Pending");
                      frm.refresh_field("status");
                      frm.refresh_field("query_status");
                      // Call the function to set pending times for all stages
                      frappe.call({
                        method:
                          "audit_management.audit_management.doctype.my_audits.my_audits.send_to_all",
                        args: {
                          record: frm.docname, // Pass the current document's name as the 'record'
                        },
                        callback: function (response) {
                          if (response.message) {
                            const {
                              bm_timestamp,
                              dh_timestamp,
                              com_timestamp,
                              rm_timestamp,
                              rom_timestamp,
                              zm_timestamp,
                              zom_timestamp,
                              gm_timestamp,
                              coo_timestamp,
                              ceo_timestamp,
                            } = response.message;

                            // Check if the field is empty and set the value if it's not already set
                            if (bm_timestamp && !frm.doc.bm_pending_time) {
                              frm.set_value("bm_pending_time", bm_timestamp);
                            }
                            if (dh_timestamp && !frm.doc.dh_pending_time) {
                              frm.set_value("dh_pending_time", dh_timestamp);
                            }
                            if (com_timestamp && !frm.doc.com_pending_time) {
                              frm.set_value("com_pending_time", com_timestamp);
                            }
                            if (rm_timestamp && !frm.doc.rm_pending_time) {
                              frm.set_value("rm_pending_time", rm_timestamp);
                            }
                            if (rom_timestamp && !frm.doc.rom_pending_time) {
                              frm.set_value("rom_pending_time", rom_timestamp);
                            }
                            if (zm_timestamp && !frm.doc.zm_pending_time) {
                              frm.set_value("zm_pending_time", zm_timestamp);
                            }
                            if (zom_timestamp && !frm.doc.zom_pending_time) {
                              frm.set_value("zom_pending_time", zom_timestamp);
                            }
                            if (gm_timestamp && !frm.doc.gm_pending_time) {
                              frm.set_value("gm_pending_time", gm_timestamp);
                            }
                            if (coo_timestamp && !frm.doc.coo_pending_time) {
                              frm.set_value("coo_pending_time", coo_timestamp);
                            }
                            if (ceo_timestamp && !frm.doc.ceo_pending_time) {
                              frm.set_value("ceo_pending_time", ceo_timestamp);
                            }
                            // Optionally, display a message
                            console.log(
                              `All Timestamps received for: ${frm.docname}`
                            );
                          }
                        },
                      });
                      frm.save();
                    })
                    .catch(() => {
                      // Handle failure
                      frappe.msgprint(
                        "An error occurred while sending the requests."
                      );
                    });
                }
              );
            },
            "Send to"
          )
          .css({
            "background-color": "#28a745",
            color: "#ffffff",
            margin: "1px",
          });

        // Add styling to the button using its class
        $('.btn.btn-default.ellipsis:contains("Send to")').css({
          "background-color": "#28a745", // Custom green background color
          color: "#ffffff", // White text color
          margin: "1px",
          width: "100px",
        });
      }

      // Add the close_query button
      if (frm.doc.status !== "Draft") {
        frm.trigger("close_query");
      }
    }
  },
  show_sendResponse_btn: function (frm) {
    frm
      .add_custom_button(__("Send Response"), function () {
        // Validate if response box is filled
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
          (frappe.session.user == frm.doc.coo_user_id &&
            !frm.doc.coo_response_box) ||
          (frappe.session.user == frm.doc.ceo_user_id &&
            !frm.doc.ceo_response_box)
        ) {
          frappe.msgprint(
            "<b>Before Sending Response, First input your response in the response box.</b>"
          );
          frappe.validated = false; // Prevent action if the response box is empty
          return;
        }

        frappe.confirm(
          "Do you want to send the response to the Audit Team ?",
          function () {
            // Action if 'Yes' is selected
            // for BM
            if (frm.doc.bm_user_status === "Pending") {
              frm.set_value("query_status", "Response From BM");
              frm.set_value("bm_user_status", "Responded");
            }
            // for DH and COM
            if (
              (frm.doc.dh_user_status === "Pending" &&
                frappe.session.user == frm.doc.dh_user_id) ||
              (frm.doc.query_status === "Response From COM" &&
                frm.doc.dh_user_status === "Pending")
            ) {
              frm.set_value("query_status", "Response From DH");
              frm.set_value("dh_user_status", "Responded");
              if (frm.doc.com_user_status !== "Responded") {
                frm.set_value("com_user_status", "Pending");
              } else {
                frm.set_value("com_user_status", "Responded");
              }
              frm.refresh_field("query_status");
              frm.refresh_field("dh_user_status");
              frm.refresh_field("com_user_status");
            } else if (
              (frm.doc.com_user_status === "Pending" &&
                frappe.session.user == frm.doc.com_user_id) ||
              (frm.doc.query_status === "Response From DH" &&
                frm.doc.com_user_status === "Pending")
            ) {
              frm.set_value("query_status", "Response From COM");
              frm.set_value("com_user_status", "Responded");
              if (frm.doc.dh_user_status !== "Responded") {
                frm.set_value("dh_user_status", "Pending");
              } else {
                frm.set_value("dh_user_status", "Responded");
              }
              frm.refresh_field("query_status");
              frm.refresh_field("dh_user_status");
              frm.refresh_field("com_user_status");
            }
            if (
              frm.doc.dh_user_status === "Responded" &&
              frm.doc.com_user_status === "Responded"
            ) {
              frm.set_value("query_status", "Response From DH & COM");
              frm.refresh_field("query_status");
            }

            // for RM & ROM
            if (
              (frm.doc.rm_user_status === "Pending" &&
                frappe.session.user == frm.doc.rm_user_id) ||
              (frm.doc.query_status === "Response From ROM" &&
                frm.doc.rm_user_status === "Pending")
            ) {
              frm.set_value("query_status", "Response From RM");
              frm.set_value("rm_user_status", "Responded");
              if (frm.doc.rom_user_status !== "Responded") {
                frm.set_value("rom_user_status", "Pending");
              } else {
                frm.set_value("rom_user_status", "Responded");
              }
              frm.refresh_field("query_status");
              frm.refresh_field("rm_user_status");
              frm.refresh_field("rom_user_status");
            } else if (
              (frm.doc.rom_user_status === "Pending" &&
                frappe.session.user == frm.doc.rom_user_id) ||
              (frm.doc.query_status === "Response From RM" &&
                frm.doc.rom_user_status === "Pending")
            ) {
              frm.set_value("query_status", "Response From ROM");
              frm.set_value("rom_user_status", "Responded");
              if (frm.doc.rm_user_status !== "Responded") {
                frm.set_value("rm_user_status", "Pending");
              } else {
                frm.set_value("rm_user_status", "Responded");
              }
              frm.refresh_field("query_status");
              frm.refresh_field("rm_user_status");
              frm.refresh_field("rom_user_status");
            }
            if (
              frm.doc.rm_user_status === "Responded" &&
              frm.doc.rom_user_status === "Responded"
            ) {
              frm.set_value("query_status", "Response From RM & ROM");
              frm.refresh_field("query_status");
            }

            // for ZM & ZOM
            if (
              (frm.doc.zm_user_status === "Pending" &&
                frappe.session.user == frm.doc.zm_user_id) ||
              (frm.doc.query_status === "Response From ZOM" &&
                frm.doc.zm_user_status === "Pending")
            ) {
              frm.set_value("query_status", "Response From ZM");
              frm.set_value("zm_user_status", "Responded");
              if (frm.doc.zom_user_status !== "Responded") {
                frm.set_value("zom_user_status", "Pending");
              } else {
                frm.set_value("zom_user_status", "Responded");
              }
              frm.refresh_field("query_status");
              frm.refresh_field("zm_user_status");
              frm.refresh_field("zom_user_status");
            } else if (
              (frm.doc.zom_user_status === "Pending" &&
                frappe.session.user == frm.doc.zom_user_id) ||
              (frm.doc.query_status === "Response From ZM" &&
                frm.doc.zom_user_status === "Pending")
            ) {
              frm.set_value("query_status", "Response From ZOM");
              frm.set_value("zom_user_status", "Responded");
              if (frm.doc.zm_user_status !== "Responded") {
                frm.set_value("zm_user_status", "Pending");
              } else {
                frm.set_value("zm_user_status", "Responded");
              }
              frm.refresh_field("query_status");
              frm.refresh_field("zm_user_status");
              frm.refresh_field("zom_user_status");
            }
            if (
              frm.doc.zm_user_status === "Responded" &&
              frm.doc.zom_user_status === "Responded"
            ) {
              frm.set_value("query_status", "Response From ZM & ZOM");
              frm.refresh_field("query_status");
            }

            // for gm
            if (frm.doc.gm_user_status === "Pending") {
              frm.set_value("query_status", "Response From GM");
              frm.set_value("gm_user_status", "Responded");
            }

            // for coo
            if (frm.doc.coo_user_status === "Pending") {
              frm.set_value("query_status", "Response From COO");
              frm.set_value("coo_user_status", "Responded");
            }

            // for ceo
            if (frm.doc.ceo_user_status === "Pending") {
              frm.set_value("query_status", "Response From CEO");
              frm.set_value("ceo_user_status", "Responded");
            }

            frm.save().then(function () {
              frappe.msgprint("<b>Response sent successfully!</b>");
            });
            console.log("Response sent to Audit Team");
          },
          function () {
            // Action if 'No' is selected
          }
        );
      })
      .css({
        "background-color": "#28a745",
        color: "#ffffff",
      });
  },
  close_query: function (frm) {
    frm
      .add_custom_button(__("Close Query"), function () {
        frappe.confirm(
          "This will ensure that you're satisfied with the recent response and close the query.<br><b>Are you sure you want to close this audit query?</b>",
          function () {
            // Action if 'Yes' is selected
            if (frm.doc.status !== "Close") {
              // Prompt for closing remarks
              frappe.prompt(
                [
                  {
                    label: "Enter Closing Remark",
                    fieldname: "closing_remark",
                    fieldtype: "Data", // You can use 'Data' for a simple text box or 'Text Editor' for a larger input area
                    reqd: 1, // Makes the field required
                  },
                ],
                function (data) {
                  // Action to take after getting the remark
                  frm.set_value("closing_remark", data.closing_remark); // Assuming you have a field for closing remarks in your doctype
                  frm.set_value("status", "Close");
                  frm.save().then(function () {
                    frappe.msgprint("<b>Audit query closed successfully!</b>");
                    frm.disable_form(); // Disable form after closing the query
                  });
                },
                "Enter Closing Remark", // Title of the prompt
                "Close" // Title of the confirm button
              );
            } else {
              frappe.msgprint("<b>This query is already closed.</b>");
            }
          },
          function () {
            // Action if 'No' is selected
            frappe.msgprint("Action cancelled.");
          }
        );
      })
      .css({
        "background-color": "#dc3545",
        color: "#ffffff",
      });
  },
  onload: function (frm) {
    // Define the function inside the onload event
    frm.frappecalltopendingtimefunction = function (frm, record, stage) {
      frappe.call({
        method:
          "audit_management.audit_management.doctype.my_audits.my_audits.send_to_specific_stage",
        args: {
          record: record, // Pass the record value
          stage: stage, // Pass the stage value
        },
        callback: function (response) {
          if (response.message) {
            const {
              bm_timestamp,
              dh_timestamp,
              com_timestamp,
              rm_timestamp,
              rom_timestamp,
              zm_timestamp,
              zom_timestamp,
              gm_timestamp,
              coo_timestamp,
              ceo_timestamp,
              message,
            } = response.message;

            // Set the bm_pending_time field in the form
            if (bm_timestamp) {
              frm.set_value("bm_pending_time", bm_timestamp);
              console.log("[DEBUG] bm_pending_time set:", bm_timestamp); // Debug message
            }

            // Set the dh_pending_time and com_pending_time fields
            if (dh_timestamp) {
              frm.set_value("dh_pending_time", dh_timestamp);
              console.log("[DEBUG] dh_pending_time set:", dh_timestamp); // Debug message
            }
            if (com_timestamp) {
              frm.set_value("com_pending_time", com_timestamp);
              console.log("[DEBUG] com_pending_time set:", com_timestamp); // Debug message
            }

            // Set the rm_pending_time and rom_pending_time fields
            if (rm_timestamp) {
              frm.set_value("rm_pending_time", rm_timestamp);
              console.log("[DEBUG] rm_pending_time set:", rm_timestamp); // Debug message
            }
            if (rom_timestamp) {
              frm.set_value("rom_pending_time", rom_timestamp);
              console.log("[DEBUG] rom_pending_time set:", rom_timestamp); // Debug message
            }

            // Set the zm_pending_time and zom_pending_time fields
            if (zm_timestamp) {
              frm.set_value("zm_pending_time", zm_timestamp);
              console.log("[DEBUG] zm_pending_time set:", zm_timestamp); // Debug message
            }
            if (zom_timestamp) {
              frm.set_value("zom_pending_time", zom_timestamp);
              console.log("[DEBUG] zom_pending_time set:", zom_timestamp); // Debug message
            }

            // Set the gm_pending_time field
            if (gm_timestamp) {
              frm.set_value("gm_pending_time", gm_timestamp);
              console.log("[DEBUG] gm_pending_time set:", gm_timestamp); // Debug message
            }

            // Set the coo_pending_time field
            if (coo_timestamp) {
              frm.set_value("coo_pending_time", coo_timestamp);
              console.log("[DEBUG] coo_pending_time set:", coo_timestamp); // Debug message
            }

            // Set the ceo_pending_time field
            if (ceo_timestamp) {
              frm.set_value("ceo_pending_time", ceo_timestamp);
              console.log("[DEBUG] ceo_pending_time set:", ceo_timestamp); // Debug message
            }
          }
        },
      });
    };
  },
});
