// Copyright (c) 2024, Sahayog and contributors
// For license information, please see license.txt

frappe.ui.form.on("My Audits", {
  onload: function (frm) {
    frm.trigger("check_field_read_only");
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
  },
  check_field_read_only: function (frm) {
    if (
      frm.doc.query_status !== "Pending From BM" &&
      frm.doc.bm_user_status === "Responded"
    ) {
      frm.set_df_property("bm_response_box", "read_only", true);
    }
    // making read_only to DH&COM response box
    if (frm.doc.query_status !== "Pending From DH & COM") {
      if (frm.doc.dh_user_status === "Responded") {
        frm.set_df_property("dh_response_box", "read_only", 1);
      }
      if (frm.doc.com_user_status === "Responded") {
        frm.set_df_property("com_response_box", "read_only", 1);
      }
      frm.refresh_field("dh_response_box");
      frm.refresh_field("com_response_box");
    }
    // making read_only to RM&ROM response box
    if (frm.doc.query_status !== "Pending From RM & ROM") {
      if (frm.doc.rm_user_status === "Responded") {
        frm.set_df_property("rm_response_box", "read_only", 1);
      }
      if (frm.doc.rom_user_status === "Responded") {
        frm.set_df_property("rom_response_box", "read_only", 1);
      }
      frm.refresh_field("dh_response_box");
      frm.refresh_field("com_response_box");
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
  before_save: function (frm) {
    // If the status is blank, set it to "Draft" before saving
    if (!frm.doc.status) {
      frm.set_value("status", "Draft");
      frm.refresh_field("status");
    }

    // Check if branch and employee_details are not empty before saving
    if (!frm.doc.emp_branch || !frm.doc.employee_id) {
      frappe.msgprint(
        "<b>Before saving, First input Branch and select Employee.</b>"
      );
      frappe.validated = false;
      return;
    }

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
  refresh: function (frm) {
    frm.trigger("check_field_read_only");
    if (frm.doc.status === "Close") {
      frm.disable_form();
    }
    if (frappe.user.has_role("Audit Manager") && frm.doc.status === "Pending") {
      frm.disable_form();
    }
    if (frm.is_new()) {
      console.log("new");
      frm.trigger("fetch_query_maker");
      frm.trigger("show_button");
      frm.trigger("fetch_employee_id");
    } else if (!frm.is_new()) {
      console.log("not new");
      frm.trigger("show_sendToBm_btn");
      frm.trigger("fetch_query_maker");
      frm.trigger("fetch_employee_id");
      if (
        frappe.session.user == frm.doc.bm_user_id &&
        frm.doc.status === "Pending" &&
        frm.doc.query_status === "Pending From BM" &&
        frm.doc.bm_user_status === "Pending"
      ) {
        frm.trigger("show_sendResponse_btn");
      }
      // jab DH||COM aur RM||ROM mese koi bhi reply na kre to dono ko sendTOresponse ki button dikhane
      if (
        (frappe.session.user == frm.doc.dh_user_id &&
          frm.doc.status === "Pending" &&
          frm.doc.query_status === "Pending From DH & COM" &&
          frm.doc.dh_user_status === "Pending") ||
        (frappe.session.user == frm.doc.com_user_id &&
          frm.doc.status === "Pending" &&
          frm.doc.query_status === "Pending From DH & COM" &&
          frm.doc.com_user_status === "Pending") ||
        (frappe.session.user == frm.doc.rm_user_id &&
          frm.doc.status === "Pending" &&
          frm.doc.query_status === "Pending From RM & ROM" &&
          frm.doc.rm_user_status === "Pending") ||
        (frappe.session.user == frm.doc.rom_user_id &&
          frm.doc.status === "Pending" &&
          frm.doc.query_status === "Pending From RM & ROM" &&
          frm.doc.rom_user_status === "Pending")
      ) {
        frm.trigger("show_sendResponse_btn");
      }

      // jab DH||COM aur RM||ROM mese koi ek reply kre to dusre ko sendTOresponse ki button dikhane
      if (
        (frappe.session.user == frm.doc.dh_user_id &&
          frm.doc.dh_user_status === "Pending" &&
          frm.doc.com_user_status === "Responded" &&
          frm.doc.query_status === "Response From COM") ||
        (frappe.session.user == frm.doc.com_user_id &&
          frm.doc.com_user_status === "Pending" &&
          frm.doc.dh_user_status === "Responded" &&
          frm.doc.query_status === "Response From DH") ||
        (frappe.session.user == frm.doc.rm_user_id &&
          frm.doc.rm_user_status === "Pending" &&
          frm.doc.rom_user_status === "Responded" &&
          frm.doc.query_status === "Response From ROM") ||
        (frappe.session.user == frm.doc.rom_user_id &&
          frm.doc.rom_user_status === "Pending" &&
          frm.doc.rm_user_status === "Responded" &&
          frm.doc.query_status === "Response From RM")
      ) {
        frm.trigger("show_sendResponse_btn");
      }
      if (
        frappe.user.has_role("Audit Manager") &&
        frm.doc.status === "Pending" &&
        frm.doc.query_status === "Response From BM" &&
        frm.doc.bm_user_status === "Responded"
      ) {
        frm.trigger("show_sendToDhComWithClose_btn");
      }

      if (
        frappe.user.has_role("Audit Manager") &&
        frm.doc.status === "Pending" &&
        frm.doc.query_status === "Response From DH & COM" &&
        frm.doc.dh_user_status === "Responded" &&
        frm.doc.com_user_status === "Responded"
      ) {
        frm.trigger("show_sendToRmRomWithClose_btn");
      }
    }
    // Define the status messages
    let statusMessages = {
      pending: "Pending",
      responded: "Responded",
    };

    // Define colors
    let colors = {
      green: "#28a745",
      red: "#dc3545",
    };

    // Initialize the intro message
    let introMessage = "";

    // Check the current status and set the intro message
    if (frm.doc.status === "Pending") {
      if (
        frm.doc.query_status === "Pending From BM" &&
        frm.doc.bm_user_status === "Pending"
      ) {
        introMessage = `
					<p><span style="color: ${colors.green}">Audit Manager</span> &#8658;
					<span style="color: ${colors.red}">BM</span></p>
				`;
      } else if (
        frm.doc.query_status === "Response From BM" &&
        frm.doc.bm_user_status === "Responded"
      ) {
        introMessage = `
					<p><span style="color: ${colors.green}">Audit Manager</span> &#8658;
					<span style="color: ${colors.green}">BM</span></p>
				`;
      } else if (
        frm.doc.query_status === "Pending From DH & COM" &&
        frm.doc.dh_user_status === "Pending" &&
        frm.doc.com_user_status === "Pending"
      ) {
        introMessage = `
         <table>
            <tr>
                <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
                <td>&#8663;</td>
                <td style="color: ${colors.red};"> DH</td>
            </tr>
            <tr>
                <td>&#8664;</td>
                <td style="color: ${colors.red};"> COM</td>
            </tr>
        </table>`;
      } else if (
        frm.doc.query_status === "Response From DH" &&
        frm.doc.dh_user_status === "Responded" &&
        frm.doc.com_user_status === "Pending"
      ) {
        introMessage = `
         <table>
            <tr>
                <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
                <td>&#8663;</td>
                <td style="color: ${colors.green};"> DH</td>
            </tr>
            <tr>
                <td>&#8664;</td>
                <td style="color: ${colors.red};"> COM</td>
            </tr>
        </table>`;
      } else if (
        frm.doc.query_status === "Response From COM" &&
        frm.doc.dh_user_status === "Pending" &&
        frm.doc.com_user_status === "Responded"
      ) {
        introMessage = `
         <table>
            <tr>
                <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
                <td>&#8663;</td>
                <td style="color: ${colors.red};"> DH</td>
            </tr>
            <tr>
                <td>&#8664;</td>
                <td style="color: ${colors.green};"> COM</td>
            </tr>
        </table>`;
      } else if (
        frm.doc.query_status === "Response From DH & COM" &&
        frm.doc.dh_user_status === "Responded" &&
        frm.doc.com_user_status === "Responded"
      ) {
        introMessage = `
         <table>
            <tr>
                <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
                <td>&#8663;</td>
                <td style="color: ${colors.green};"> DH</td>
            </tr>
            <tr>
                <td>&#8664;</td>
                <td style="color: ${colors.green};"> COM</td>
            </tr>
        </table>`;
      } else if (
        frm.doc.query_status === "Pending From RM & ROM" &&
        frm.doc.rm_user_status === "Pending" &&
        frm.doc.rom_user_status === "Pending" &&
        frm.doc.dh_user_status === "Responded" &&
        frm.doc.com_user_status === "Responded"
      ) {
        introMessage = `
          <table>
             <tr>
                 <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
                 <td>&#8663;</td>
                 <td style="color: ${colors.green};"> DH</td>
                 <td>&#8658;</td>
                 <td style="color: ${colors.red};"> RM</td>
             </tr>
             <tr>
                 <td>&#8664;</td>
                 <td style="color: ${colors.green};"> COM</td>
                 <td>&#8658;</td>
                 <td style="color: ${colors.red};"> ROM</td>
             </tr>
         </table>`;
      } else if (
        frm.doc.query_status === "Response From ROM" &&
        frm.doc.rm_user_status === "Pending" &&
        frm.doc.rom_user_status === "Responded" &&
        frm.doc.dh_user_status === "Responded" &&
        frm.doc.com_user_status === "Responded"
      ) {
        introMessage = `
          <table>
             <tr>
                 <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
                 <td>&#8663;</td>
                 <td style="color: ${colors.green};"> DH</td>
                 <td>&#8658;</td>
                 <td style="color: ${colors.red};"> RM</td>
             </tr>
             <tr>
                 <td>&#8664;</td>
                 <td style="color: ${colors.green};"> COM</td>
                 <td>&#8658;</td>
                 <td style="color: ${colors.green};"> ROM</td>
             </tr>
         </table>`;
      } else if (
        frm.doc.query_status === "Response From RM" &&
        frm.doc.rm_user_status === "Responded" &&
        frm.doc.rom_user_status === "Pending" &&
        frm.doc.dh_user_status === "Responded" &&
        frm.doc.com_user_status === "Responded"
      ) {
        introMessage = `
          <table>
             <tr>
                 <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
                 <td>&#8663;</td>
                 <td style="color: ${colors.green};"> DH</td>
                 <td>&#8658;</td>
                 <td style="color: ${colors.green};"> RM</td>
             </tr>
             <tr>
                 <td>&#8664;</td>
                 <td style="color: ${colors.green};"> COM</td>
                 <td>&#8658;</td>
                 <td style="color: ${colors.red};"> ROM</td>
             </tr>
         </table>`;
      } else if (
        frm.doc.query_status === "Response From RM & ROM" &&
        frm.doc.rm_user_status === "Responded" &&
        frm.doc.rom_user_status === "Responded" &&
        frm.doc.dh_user_status === "Responded" &&
        frm.doc.com_user_status === "Responded"
      ) {
        introMessage = `
          <table>
             <tr>
                 <td rowspan="2" style="color: ${colors.green}; padding-right: 2px;">Audit Manager &#8658; BM</td>
                 <td>&#8663;</td>
                 <td style="color: ${colors.green};"> DH</td>
                 <td>&#8658;</td>
                 <td style="color: ${colors.green};"> RM</td>
             </tr>
             <tr>
                 <td>&#8664;</td>
                 <td style="color: ${colors.green};"> COM</td>
                 <td>&#8658;</td>
                 <td style="color: ${colors.green};"> ROM</td>
             </tr>
         </table>`;
      }

      // Add similar checks for other levels...
    }

    // Set the intro message
    frm.set_intro(introMessage, true);
  },
  fetch_employee_id: function (frm) {
    if (frm.doc.employee_id) {
      frappe.call({
        method:
          "audit_management.audit_management.doctype.audit_level.audit_level.fetch_employee",
        args: {
          employee_id: frm.doc.employee_id,
        },
        callback: function (r) {
          if (!r.exc) {
            if (Array.isArray(r.message) && r.message.length > 0) {
              const employeeData = r.message[0]; // Accessing the first element of the array
              console.log("Employee Data:", employeeData);

              // Safeguard against potential HTML injection
              const escapeHtml = (unsafe) => {
                return unsafe
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;");
              };

              // Directly set the response data in HTML with inline CSS
              let html = `
									  <style>
										  .myemployee-grid {
											  display: grid;
											  grid-template-columns: repeat(3, 1fr); /* Creates 3 equal columns */
											  gap: 10px; /* Adds space between items */
										  }
										  .myemployee-grid p {
											  border-radius: 5px;
											  padding: 7px;
											  margin: 5px;
											  background: #f4f5f6;
										  }
										  .mylabel {
											  margin: 8px;
											  font-size: var(--text-sm);
										  }
									  </style>
									  <div class="employee-details">
										  <div class="myemployee-grid">
											  <div>
												  <span class="mylabel">Employee Name</span>
												  <p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
												  <span class="mylabel">Employee ID</span>
												  <p id="employee_id">${escapeHtml(frm.doc.employee_id || "- - -")}</p>
												  <span class="mylabel">Designation</span>
												  <p id="employee_designation">${escapeHtml(
                            employeeData.designation || "- - -"
                          )}</p><hr>
											  </div>
											  <div>
												  <span class="mylabel">Phone</span>
												  <p id="employee_phone">${escapeHtml(employeeData.cell_number || "- - -")}</p>
												  <span class="mylabel">Region</span>
												  <p id="employee_region">${escapeHtml(employeeData.region || "- - -")}</p>
												  <span class="mylabel">Division</span>
												  <p id="employee_division">${escapeHtml(
                            employeeData.division || "- - -"
                          )}</p><hr>
											  </div>
											  <div>
												  <span class="mylabel">District</span>
												  <p id="employee_district">${escapeHtml(employeeData.district || "- - -")}</p>
												  <span class="mylabel">Branch</span>
												  <p id="employee_branch">${escapeHtml(employeeData.branch || "- - -")}</p>
												  <span class="mylabel">Department</span>
												  <p id="employee_department">${escapeHtml(
                            employeeData.department || "- - -"
                          )}</p><hr>
											  </div>
										  </div>
									  </div>
								  `;

              // Set the above `html` as Summary HTML
              frm.set_df_property("employee_html", "options", html);

              // Setting user_id in the form field
              // frm.set_value("stage_1_bm_user_id", employeeData.user_id || "- - -");
            } else {
              console.error("Unexpected response format or empty data.");
            }
          } else {
            console.error("Error in API call:", r.exc);
          }
        },
      });
    }
  },
  fetch_query_maker: function (frm) {
    console.log("new");
    // When form is new
    // Setting Employee ID
    let auditor_user = frappe.session.user;
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
  show_sendToBm_btn: function (frm) {
    console.log("audit work kar raha hai");
    if (frappe.user.has_role("Audit Manager") && frm.doc.status == "Draft") {
      console.log("Condition met: User is Audit Manager and status is Draft.");
      console.log("User roles:", frappe.user.roles); // Log user roles
      console.log("Document status:", frm.doc.status); // Log the document status

      // Make fields read-only and add custom button
      frm.set_df_property("audit_query_box", "read_only", true);
      frm.set_df_property("emp_branch", "read_only", true);
      frm.set_df_property("employee_id", "read_only", true);

      frm
        .add_custom_button(__("Send to BM"), function () {
          // Fallback if emp_branch is not available
          let emp_branch = frm.doc.emp_branch || "the employee's branch";

          frappe.confirm(
            `<i><b>Do you want to send query to the Level 1 (BM of ${emp_branch}) ?</b></i>`,
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
                  if (frm.doc.status === "Draft") {
                    frm.set_value("status", "Pending");
                    frm.set_value("query_status", "Pending From BM");
                    frm.set_value("bm_user_status", "Pending");
                    frm.refresh_field("status");
                    frm.refresh_field("query_status");
                    frm.refresh_field("bm_user_status");
                    frm.save();
                  }
                },
              });
            }
          );
        })
        .css({
          "background-color": "#28a745",
          color: "#ffffff",
        });
    } else {
      console.log("Condition not met.");
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
            !frm.doc.rom_response_box)
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
            if (frm.doc.query_status === "Pending From BM") {
              frm.set_value("query_status", "Response From BM");
              frm.set_value("bm_user_status", "Responded");
            }
            // for DH and COM
            if (
              (frm.doc.query_status === "Pending From DH & COM" &&
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
              (frm.doc.query_status === "Pending From DH & COM" &&
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
              (frm.doc.query_status === "Response From DH" ||
                frm.doc.query_status === "Response From COM") &&
              frm.doc.dh_user_status === "Responded" &&
              frm.doc.com_user_status === "Responded"
            ) {
              frm.set_value("query_status", "Response From DH & COM");
              frm.refresh_field("query_status");
            }

            // for RM & ROM
            if (
              (frm.doc.query_status === "Pending From RM & ROM" &&
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
              (frm.doc.query_status === "Pending From RM & ROM" &&
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
              (frm.doc.query_status === "Response From RM" ||
                frm.doc.query_status === "Response From ROM") &&
              frm.doc.rm_user_status === "Responded" &&
              frm.doc.rom_user_status === "Responded"
            ) {
              frm.set_value("query_status", "Response From RM & ROM");
              frm.refresh_field("query_status");
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

  show_sendToDhComWithClose_btn: function (frm) {
    // Add the first button - "Send Response"
    frm
      .add_custom_button(__("Send to DH/COM"), function () {
        // Fallback if emp_branch is not available
        let emp_branch = frm.doc.emp_branch || "the employee's branch";

        frappe.confirm(
          `<i><b>Do you want to send the query to the Level 2 (DH & COM of ${emp_branch})?</b></i>`,
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
                if (frm.doc.query_status === "Response From BM") {
                  frm.set_value("query_status", "Pending From DH & COM");
                  frm.set_value("dh_user_status", "Pending");
                  frm.set_value("com_user_status", "Pending");

                  frm.refresh_field("query_status");
                  frm.refresh_field("dh_user_status");
                  frm.refresh_field("com_user_status");
                  frm.save();
                }
              })
              .catch(() => {
                // Handle failure
                frappe.msgprint(
                  "An error occurred while sending the request to DH/COM."
                );
              });
          }
        );
      })
      .css({
        "background-color": "#28a745",
        color: "#ffffff",
      });

    frm.trigger("close_query");
  },
  show_sendToRmRomWithClose_btn: function (frm) {
    // Add the first button - "Send Response"
    frm
      .add_custom_button(__("Send to RM/ROM"), function () {
        // Fallback if emp_branch is not available
        let emp_branch = frm.doc.emp_branch || "the employee's branch";

        frappe.confirm(
          `<i><b>Do you want to send the query to the Level 2 (RM & ROM of ${emp_branch})?</b></i>`,
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
                if (frm.doc.query_status === "Response From DH & COM") {
                  frm.set_value("query_status", "Pending From RM & ROM");
                  frm.set_value("rm_user_status", "Pending");
                  frm.set_value("rom_user_status", "Pending");

                  frm.refresh_field("query_status");
                  frm.refresh_field("rm_user_status");
                  frm.refresh_field("rom_user_status");
                  frm.save();
                }
              })
              .catch(() => {
                // Handle failure
                frappe.msgprint(
                  "An error occurred while sending the request to DH/COM."
                );
              });
          }
        );
      })
      .css({
        "background-color": "#28a745",
        color: "#ffffff",
      });

    frm.trigger("close_query");
  },
  close_query: function (frm) {
    frm
      .add_custom_button(__("Close Query"), function () {
        frappe.confirm(
          "This will ensure that you're satisfied with the recent response and close the query.<br><b>Are you sure you want to close this audit query?</b>",
          function () {
            // Action if 'Yes' is selected
            if (frm.doc.status !== "Close") {
              frm.set_value("status", "Close");
              frm.save().then(function () {
                frappe.msgprint("<b>Audit query closed successfully!</b>");
                frm.disable_form(); // Disable form after closing the query
              });
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
});
