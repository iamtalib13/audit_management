// Copyright (c) 2024, Sahayog and contributors
// For license information, please see license.txt

frappe.ui.form.on("My Audits", {
  onload: function (frm) {
    frm.trigger("check_field_read_only");
    frm.trigger("set_background_colors");
  },
  check_field_read_only: function (frm) {
    if (
      (!frappe.user.has_role("Audit Manager") ||
        !frappe.user.has_role("Audit Member")) &&
      frm.doc.status === "Pending"
    ) {
      console.log("Disabling Save button");
      frm.disable_save();
      frm.set_df_property("audit_query_box", "read_only", true);
      frm.set_df_property("emp_branch", "read_only", true);
      frm.set_df_property("employee_id", "read_only", true);
      frm.set_df_property("query_type", "read_only", true);
      frm.set_df_property("audit_query_subject_box", "read_only", true);
    }
    if (
      (frappe.user.has_role("Audit Manager") ||
        frappe.user.has_role("Audit Member")) &&
      frm.doc.status === "Pending"
    ) {
      frm.disable_form();
    }
    if (
      (frappe.user.has_role("Audit Manager") ||
        frappe.user.has_role("Audit Member")) &&
      frm.doc.status === "Draft"
    ) {
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
        frm.set_df_property("com_attach_box", "read_only", true);
        frm.set_df_property("com_response_box", "read_only", 1);
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

    // making read_only to HR response box
    if (frm.doc.query_status !== "Pending From HR") {
      if (frm.doc.hr_user_status === "Responded") {
        frm.set_df_property("hr_response_box", "read_only", 1);
        frm.set_df_property("hr_attach_box", "read_only", true);
      }
      frm.refresh_field("hr_response_box");
      frm.refresh_field("hr_attach_box");
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
  audit_query_subject_box: function (frm) {
    // Check if audit_query_box has a value before converting to uppercase
    if (frm.doc.audit_query_subject_box) {
      frm.set_value(
        "audit_query_subject_box",
        frm.doc.audit_query_subject_box.toUpperCase()
      );
      frm.refresh_field("audit_query_subject_box");
    }
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
  hr_response_box: function (frm) {
    // Check if com_response_box has a value before converting to uppercase
    if (frm.doc.gm_response_box) {
      frm.set_value("hr_response_box", frm.doc.hr_response_box.toUpperCase());
      frm.refresh_field("hr_response_box");
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

    if (!frm.doc.audit_query_subject_box) {
      frappe.msgprint(
        "<b>Before saving, First input your Query subject in the Query Subject Box.</b>"
      );
      frappe.validated = false;
      return;
    }

    // Check if query_box is not empty before saving
    if (!frm.doc.audit_query_box) {
      frappe.msgprint(
        "<b>Before saving, First describe your Query in the Query Description Box.</b>"
      );
      frappe.validated = false;
      return;
    }

    if (!frm.doc.query_type) {
      frappe.msgprint("<b>Before saving, Please select Query Type.</b>");
      frappe.validated = false;
      return;
    }
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
    if (
      (frappe.user.has_role("Audit Manager") ||
        frappe.user.has_role("Audit Member")) &&
      frm.doc.status === "Pending"
    ) {
      frm.disable_form();
    }

    // Check if the form is new
    if (frm.is_new() && !frm.__is_fetched) {
      console.log("calling and fetching details")
      frm.trigger("fetch_query_maker"); // Call the fetch function
    } else if (!frm.is_new()) {
      console.log("not new");
      if (
        frm.doc.status === "Pending" &&
        ((frappe.session.user == frm.doc.bm_user_id &&
          frm.doc.bm_user_status === "Pending") ||
          (frappe.session.user == frm.doc.gm_user_id &&
            frm.doc.gm_user_status === "Pending") ||
          (frappe.session.user == frm.doc.hr_user_id &&
            frm.doc.hr_user_status === "Pending") ||
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

      if (
        (frappe.user.has_role("Audit Manager") ||
          frappe.user.has_role("Audit Member")) &&
        (frm.doc.status === "Draft" || frm.doc.status === "Pending")
      ) {
        if (frm.doc.bm_user_status === "") {
          frm.trigger("show_sendToBmWithClose_btn");
        }
        if (
          (frm.doc.dh_user_status === "" || frm.doc.com_user_status === "") &&
          (frm.doc.query_type !== "Branch Compliance" ||
            frm.doc.bm_user_status === "Responded")
        ) {
          frm.trigger("show_sendToDhComWithClose_btn");
        }
        if (
          (frm.doc.rm_user_status === "" || frm.doc.rom_user_status === "") &&
          (frm.doc.query_type !== "Branch Compliance" ||
            frm.doc.bm_user_status === "Responded")
        ) {
          frm.trigger("show_sendToRmRomWithClose_btn");
        }
        if (
          (frm.doc.zm_user_status === "" || frm.doc.zom_user_status === "") &&
          (frm.doc.query_type !== "Branch Compliance" ||
            frm.doc.bm_user_status === "Responded")
        ) {
          frm.trigger("show_sendToZmZomWithClose_btn");
        }
        if (
          frm.doc.gm_user_status === "" &&
          (frm.doc.query_type !== "Branch Compliance" ||
            frm.doc.bm_user_status === "Responded")
        ) {
          frm.trigger("show_sendToGm_withClose_btn");
        }
        if (
          frm.doc.hr_user_status === "" &&
          (frm.doc.query_type !== "Branch Compliance" ||
            frm.doc.bm_user_status === "Responded")
        ) {
          frm.trigger("show_sendToHr_withClose_btn");
        }
        if (
          frm.doc.coo_user_status === "" &&
          (frm.doc.query_type !== "Branch Compliance" ||
            frm.doc.bm_user_status === "Responded")
        ) {
          frm.trigger("show_sendToCOO_withClose_btn");
        }
        if (
          frm.doc.ceo_user_status === "" &&
          (frm.doc.query_type !== "Branch Compliance" ||
            frm.doc.bm_user_status === "Responded")
        ) {
          frm.trigger("show_sendToCEO_withClose_btn");
        }
        if (
          (!frm.doc.bm_user_status ||
            !frm.doc.dh_user_status ||
            !frm.doc.com_user_status ||
            !frm.doc.rm_user_status ||
            !frm.doc.rom_user_status ||
            !frm.doc.zm_user_status ||
            !frm.doc.zom_user_status ||
            !frm.doc.gm_user_status ||
            !frm.doc.coo_user_status ||
            !frm.doc.ceo_user_status) &&
          frm.doc.query_type !== "Branch Compliance"
        ) {
          frm.trigger("show_sendToAll_withClose_btn");
        }
      }
      if (frm.doc.status !== "Draft" && frappe.user.has_role("Audit Manager") || frappe.user.has_role("Audit Member")) {
        frm.trigger("close_query");
      }
    }
  },
  fetch_query_maker: function (frm) {
    console.log("Fetching query maker data...");

    // Prevent data fetching on refresh after save
    if (!frm.__is_fetched) {
        frm.__is_fetched = true; // Set flag to prevent re-fetching

        let auditor_user = frappe.session.user;
        let auditor_user_emp_id = auditor_user.match(/\d+/)[0];
        console.log("Employee ID:", auditor_user_emp_id);

        frappe.call({
            method: "audit_management.audit_management.doctype.my_audits.my_audits.fetch_employee_data",
            args: {
                employee_id: auditor_user_emp_id,
            },
            callback: function (r) {
                if (!r.exc) {
                    // Accessing response data
                    const employeeData = r.message[0]; // Accessing the first element of the array
                    console.log("Employee Data:", employeeData);

                    // Set fields with employee data
                    frm.set_value("query_generated_by_empid", auditor_user_emp_id);
                    frm.refresh_field("query_generated_by_empid");

                    frm.set_value("query_generated_by_name", employeeData.employee_name);
                    frm.refresh_field("query_generated_by_name");

                    frm.set_value("query_generated_by_designation", employeeData.designation);
                    frm.refresh_field("query_generated_by_designation");

                    frm.set_value("query_generated_by_branch", employeeData.branch);
                    frm.refresh_field("query_generated_by_branch");

                    frm.set_value("query_generated_by_mail", employeeData.company_email);
                    frm.refresh_field("query_generated_by_mail");

                } else {
                    console.error("Error fetching employee data", r.exc);
                }
            },
            error: function (err) {
                console.error("Failed to fetch employee data", err);
            },
        });
    }
  },
  show_sendToBmWithClose_btn: function (frm) {
    console.log("audit work kar raha hai");
    if (
      (frappe.user.has_role("Audit Manager") ||
        frappe.user.has_role("Audit Member")) &&
      (frm.doc.status === "Draft" || frm.doc.status === "Pending")
    ) {
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
      (frappe.user.has_role("Audit Manager") ||
        frappe.user.has_role("Audit Member")) &&
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
      (frappe.user.has_role("Audit Manager") ||
        frappe.user.has_role("Audit Member")) &&
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
      (frappe.user.has_role("Audit Manager") ||
        frappe.user.has_role("Audit Member")) &&
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
      (frappe.user.has_role("Audit Manager") ||
        frappe.user.has_role("Audit Member")) &&
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
  show_sendToHr_withClose_btn: function (frm) {
    if (
      (frappe.user.has_role("Audit Manager") ||
        frappe.user.has_role("Audit Member")) &&
      (frm.doc.status === "Draft" || frm.doc.status === "Pending")
    ) {
      // Add the "Send to HR" button
      if (frm.doc.hr_user_status === "") {
        frm
          .add_custom_button(
            __("Send to HR"),
            function () {
              // Fallback if emp_branch is not available
              let emp_branch = frm.doc.emp_branch || "the employee's branch";

              frappe.confirm(
                `<i><b>Do you want to send the query to the Level 5 (HR of ${emp_branch}) i.e "${frm.doc.hr_name}"?</b></i>`,
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
                        user: frm.doc.hr_user_id, // Send to GM user
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
                      console.log("Sent to HR");
                      frappe.show_alert({
                        message:
                          "Your Approval Request Sent to HR Successfully",
                        indicator: "green",
                      });
                      frm.set_value("query_status", "Pending From HR");
                      frm.set_value("hr_user_status", "Pending");
                      frm.set_value("status", "Pending");
                      frm.refresh_field("status");
                      frm.refresh_field("query_status");
                      frm.refresh_field("hr_user_status");

                      // Call the common function to set pending time for GM
                      frm.frappecalltopendingtimefunction(
                        frm,
                        frm.docname,
                        "hr"
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
      (frappe.user.has_role("Audit Manager") ||
        frappe.user.has_role("Audit Member")) &&
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
      (frappe.user.has_role("Audit Manager") ||
        frappe.user.has_role("Audit Member")) &&
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
      (frappe.user.has_role("Audit Manager") || frappe.user.has_role("Audit Member")) &&
      (frm.doc.status === "Draft" || frm.doc.status === "Pending")
    ) {
      const userStatusMapping = [
        { userId: frm.doc.bm_user_id, statusField: "bm_user_status" },
        { userId: frm.doc.dh_user_id, statusField: "dh_user_status" },
        { userId: frm.doc.com_user_id, statusField: "com_user_status" },
        { userId: frm.doc.rm_user_id, statusField: "rm_user_status" },
        { userId: frm.doc.rom_user_id, statusField: "rom_user_status" },
        { userId: frm.doc.zm_user_id, statusField: "zm_user_status" },
        { userId: frm.doc.zom_user_id, statusField: "zom_user_status" },
        { userId: frm.doc.gm_user_id, statusField: "gm_user_status" },
        { userId: frm.doc.hr_user_id, statusField: "hr_user_status" },
        { userId: frm.doc.coo_user_id, statusField: "coo_user_status" },
        { userId: frm.doc.ceo_user_id, statusField: "ceo_user_status" },
      ];
  
      const hasEmptyStatus = userStatusMapping.some((mapping) => {
        return !frm.doc[mapping.statusField];
      });
  
      if (hasEmptyStatus) {
        frm
          .add_custom_button(
            __("<b>Send to ALL</b>"),
            async function () {
              let emp_branch = frm.doc.emp_branch || "the employee's branch";
  
              frappe.confirm(
                `<i><b>Do you want to send the query to the remaining levels from branch ${emp_branch} (BM to CEO)?</b></i>`,
                async () => {
                  // Loop through each user and update statuses where necessary
                  for (const mapping of userStatusMapping) {
                    if (!frm.doc[mapping.statusField]) {
                      try {
                        // Add sharing for each user
                        await frappe.call({
                          method: "frappe.share.add",
                          args: {
                            doctype: frm.doctype,
                            name: frm.docname,
                            user: mapping.userId,
                            read: 1,
                            write: 1,
                            submit: 0,
                            share: 1,
                            notify: 1,
                            send_email: 0,
                          },
                        });
  
                        // Update status field to "Pending"
                        await frm.set_value(mapping.statusField, "Pending");
                        await frm.save(); // Save after each update
                      } catch (error) {
                        console.error(`Failed to send to user: ${mapping.userId}`, error);
                      }
                    }
                  }
  
                  // Call server-side method for timestamps
                  const response = await frappe.call({
                    method: "audit_management.audit_management.doctype.my_audits.my_audits.send_to_all",
                    args: { record: frm.docname },
                  });
  
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
                      hr_timestamp,
                      coo_timestamp,
                      ceo_timestamp,
                    } = response.message;
  
                    // Update pending timestamps
                    const timestampUpdates = {
                      bm_pending_time: bm_timestamp,
                      dh_pending_time: dh_timestamp,
                      com_pending_time: com_timestamp,
                      rm_pending_time: rm_timestamp,
                      rom_pending_time: rom_timestamp,
                      zm_pending_time: zm_timestamp,
                      zom_pending_time: zom_timestamp,
                      gm_pending_time: gm_timestamp,
                      hr_pending_time: hr_timestamp,
                      coo_pending_time: coo_timestamp,
                      ceo_pending_time: ceo_timestamp,
                    };
  
                    for (const [field, value] of Object.entries(timestampUpdates)) {
                      if (value && !frm.doc[field]) {
                        await frm.set_value(field, value);
                        await frm.save(); // Save after each update
                      }
                    }
                  }
  
                  // Check if all status fields are set to "Pending"
                  const allStatusPending = userStatusMapping.every(
                    (mapping) => frm.doc[mapping.statusField] === "Pending"
                  );
  
                  if (allStatusPending) {
                    await frm.set_value("send_mail_to_all", "Yes");
                    await frm.save(); // Save after setting send_mail_to_all
                  }
  
                  frappe.show_alert({
                    message: "Your Query Request Sent to All stages Successfully",
                    indicator: "green",
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
  
        $('.btn.btn-default.ellipsis:contains("Send to")').css({
          "background-color": "#28a745",
          color: "#ffffff",
          margin: "1px",
          width: "100px",
        });
      }
  
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
          (frappe.session.user == frm.doc.hr_user_id &&
            !frm.doc.hr_response_box) ||
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

            // for hr
            if (frm.doc.hr_user_status === "Pending") {
              frm.set_value("query_status", "Response From HR");
              frm.set_value("hr_user_status", "Responded");
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
    if (frm.doc.status !== "Close") {
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
                      frappe.msgprint(
                        "<b>Audit query closed successfully!</b>"
                      );
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
    }
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
              hr_timestamp,
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

            // Set the hr_pending_time field
            if (hr_timestamp) {
              frm.set_value("hr_pending_time", hr_timestamp);
              console.log("[DEBUG] hr_pending_time set:", hr_timestamp); // Debug message
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
