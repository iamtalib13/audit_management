// Copyright (c) 2024, Sahayog and contributors
// For license information, please see license.txt
frappe.ui.form.on("Audit Level", {
  stage_1_bm_emp_id: function (frm) {
    if (frm.doc.stage_1_bm_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_1_bm_emp_id,
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
											<span class="mylabel">COM Name</span>
											<p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
											<span class="mylabel">COM Employee ID</span>
											<p id="employee_id">${escapeHtml(frm.doc.stage_1_bm_emp_id || "- - -")}</p>
											<span class="mylabel">COM Designation</span>
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
              frm.set_df_property("stage_1_bm_html", "options", html);

              // Setting user_id in the form field
              frm.set_value(
                "stage_1_bm_user_id",
                employeeData.user_id || "- - -"
              );
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
  stage_2_dh_emp_id: function (frm) {
    if (frm.doc.stage_2_dh_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_2_dh_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
							  <span class="mylabel">DH Name</span>
							  <p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
							  <span class="mylabel">DH Employee ID</span>
							  <p id="employee_id">${escapeHtml(frm.doc.stage_2_dh_emp_id || "- - -")}</p>
							  <span class="mylabel">DH Designation</span>
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
            frm.set_df_property("stage_2_dh_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_2_dh_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
  },
  stage_2_com_emp_id: function (frm) {
    if (frm.doc.stage_2_com_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_2_com_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
							  <span class="mylabel">COM Name</span>
							  <p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
							  <span class="mylabel">COM Employee ID</span>
							  <p id="employee_id">${escapeHtml(frm.doc.stage_2_com_emp_id || "- - -")}</p>
							  <span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_2_com_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_2_com_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
  },
  stage_3_rm_emp_id: function (frm) {
    if (frm.doc.stage_3_rm_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_3_rm_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
							  <span class="mylabel">COM Name</span>
							  <p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
							  <span class="mylabel">COM Employee ID</span>
							  <p id="employee_id">${escapeHtml(frm.doc.stage_3_rm_emp_id || "- - -")}</p>
							  <span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_3_rm_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_3_rm_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
  },
  stage_3_rom_emp_id: function (frm) {
    if (frm.doc.stage_3_rom_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_3_rom_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
							  <span class="mylabel">COM Name</span>
							  <p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
							  <span class="mylabel">COM Employee ID</span>
							  <p id="employee_id">${escapeHtml(frm.doc.stage_3_rom_emp_id || "- - -")}</p>
							  <span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_3_rom_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_3_rom_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
  },
  stage_4_zm_emp_id: function (frm) {
    if (frm.doc.stage_4_zm_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_4_zm_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
							  <span class="mylabel">COM Name</span>
							  <p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
							  <span class="mylabel">COM Employee ID</span>
							  <p id="employee_id">${escapeHtml(frm.doc.stage_4_zm_emp_id || "- - -")}</p>
							  <span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_4_zm_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_4_zm_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
  },
  stage_4_zom_emp_id: function (frm) {
    if (frm.doc.stage_4_zom_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_4_zom_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
							  <span class="mylabel">COM Name</span>
							  <p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
							  <span class="mylabel">COM Employee ID</span>
							  <p id="employee_id">${escapeHtml(frm.doc.stage_4_zom_emp_id || "- - -")}</p>
							  <span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_4_zom_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_4_zom_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
  },
  stage_brn_gm_emp_id: function (frm) {
    if (frm.doc.stage_brn_gm_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_brn_gm_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
							  <span class="mylabel">COM Name</span>
							  <p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
							  <span class="mylabel">COM Employee ID</span>
							  <p id="employee_id">${escapeHtml(frm.doc.stage_brn_gm_emp_id || "- - -")}</p>
							  <span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_brn_gm_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_brn_gm_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
  },
  stage_5_coo_emp_id: function (frm) {
    if (frm.doc.stage_5_coo_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_5_coo_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
							  <span class="mylabel">COM Name</span>
							  <p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
							  <span class="mylabel">COM Employee ID</span>
							  <p id="employee_id">${escapeHtml(frm.doc.stage_5_coo_emp_id || "- - -")}</p>
							  <span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_5_coo_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_5_coo_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
  },
  stage_6_ceo_emp_id: function (frm) {
    if (frm.doc.stage_6_ceo_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_6_ceo_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
							  <span class="mylabel">COM Name</span>
							  <p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
							  <span class="mylabel">COM Employee ID</span>
							  <p id="employee_id">${escapeHtml(frm.doc.stage_6_ceo_emp_id || "- - -")}</p>
							  <span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_6_ceo_html", "options", html);
            frm.refresh_field("stage_6_ceo_html");

            // Setting user_id in the form field
            frm.set_value(
              "stage_6_ceo_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
  },
  refresh: function (frm) {
    if (frm.doc.stage_1_bm_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_1_bm_emp_id,
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
											<span class="mylabel">COM Name</span>
											<p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
											<span class="mylabel">COM Employee ID</span>
											<p id="employee_id">${escapeHtml(frm.doc.stage_1_bm_emp_id || "- - -")}</p>
											<span class="mylabel">COM Designation</span>
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
              frm.set_df_property("stage_1_bm_html", "options", html);

              // Setting user_id in the form field
              frm.set_value(
                "stage_1_bm_user_id",
                employeeData.user_id || "- - -"
              );
            } else {
              console.error("Unexpected response format or empty data.");
            }
          } else {
            console.error("Error in API call:", r.exc);
          }
        },
      });
    }
    if (frm.doc.stage_2_dh_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_2_dh_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
								<span class="mylabel">DH Name</span>
								<p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
								<span class="mylabel">DH Employee ID</span>
								<p id="employee_id">${escapeHtml(frm.doc.stage_2_dh_emp_id || "- - -")}</p>
								<span class="mylabel">DH Designation</span>
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
            frm.set_df_property("stage_2_dh_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_2_dh_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
    if (frm.doc.stage_2_com_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_2_com_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
								<span class="mylabel">COM Name</span>
								<p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
								<span class="mylabel">COM Employee ID</span>
								<p id="employee_id">${escapeHtml(frm.doc.stage_2_com_emp_id || "- - -")}</p>
								<span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_2_com_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_2_com_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
    if (frm.doc.stage_3_rm_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_3_rm_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
								<span class="mylabel">COM Name</span>
								<p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
								<span class="mylabel">COM Employee ID</span>
								<p id="employee_id">${escapeHtml(frm.doc.stage_3_rm_emp_id || "- - -")}</p>
								<span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_3_rm_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_3_rm_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
    if (frm.doc.stage_3_rom_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_3_rom_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
								<span class="mylabel">COM Name</span>
								<p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
								<span class="mylabel">COM Employee ID</span>
								<p id="employee_id">${escapeHtml(frm.doc.stage_3_rom_emp_id || "- - -")}</p>
								<span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_3_rom_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_3_rom_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
    if (frm.doc.stage_4_zm_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_4_zm_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
								<span class="mylabel">COM Name</span>
								<p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
								<span class="mylabel">COM Employee ID</span>
								<p id="employee_id">${escapeHtml(frm.doc.stage_4_zm_emp_id || "- - -")}</p>
								<span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_4_zm_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_4_zm_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
    if (frm.doc.stage_4_zom_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_4_zom_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
								<span class="mylabel">COM Name</span>
								<p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
								<span class="mylabel">COM Employee ID</span>
								<p id="employee_id">${escapeHtml(frm.doc.stage_4_zom_emp_id || "- - -")}</p>
								<span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_4_zom_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_4_zom_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
    if (frm.doc.stage_brn_gm_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_brn_gm_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
								<span class="mylabel">COM Name</span>
								<p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
								<span class="mylabel">COM Employee ID</span>
								<p id="employee_id">${escapeHtml(frm.doc.stage_brn_gm_emp_id || "- - -")}</p>
								<span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_brn_gm_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_brn_gm_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
    if (frm.doc.stage_5_coo_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_5_coo_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
								<span class="mylabel">COM Name</span>
								<p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
								<span class="mylabel">COM Employee ID</span>
								<p id="employee_id">${escapeHtml(frm.doc.stage_5_coo_emp_id || "- - -")}</p>
								<span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_5_coo_html", "options", html);

            // Setting user_id in the form field
            frm.set_value(
              "stage_5_coo_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
    if (frm.doc.stage_6_ceo_emp_id) {
      frm.call({
        method: "fetch_employee",
        args: {
          employee_id: frm.doc.stage_6_ceo_emp_id,
        },
        callback: function (r) {
          if (!r.exc) {
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
								<span class="mylabel">COM Name</span>
								<p id="employee_name">${escapeHtml(employeeData.employee_name || "- - -")}</p>
								<span class="mylabel">COM Employee ID</span>
								<p id="employee_id">${escapeHtml(frm.doc.stage_6_ceo_emp_id || "- - -")}</p>
								<span class="mylabel">COM Designation</span>
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
            frm.set_df_property("stage_6_ceo_html", "options", html);
            frm.refresh_field("stage_6_ceo_html");

            // Setting user_id in the form field
            frm.set_value(
              "stage_6_ceo_user_id",
              employeeData.user_id || "- - -"
            );
          }
        },
      });
    }
  },
});
