// Copyright (c) 2026, Sahayog and contributors
// For license information, please see license.txt

frappe.ui.form.on("Audit Query Type", {
  query_type: function (frm) {
    if (frm.doc.query_type === "Audit Report Compliance") {
      if (!frm.doc.tat_config || frm.doc.tat_config.length === 0) {
        let row = frappe.model.add_child(frm.doc, "Audit TAT Config", "tat_config");
        row.tat_days = 15;
        frm.refresh_field("tat_config");
      } else if (frm.doc.tat_config[0].tat_days !== 15) {
        frm.doc.tat_config[0].tat_days = 15;
        frm.refresh_field("tat_config");
      }
    }
  },

  validate: function (frm) {
    if (frm.doc.query_type === "Audit Report Compliance") {
      if (!frm.doc.tat_config || frm.doc.tat_config.length === 0) {
        let row = frappe.model.add_child(frm.doc, "Audit TAT Config", "tat_config");
        row.tat_days = 15;
        frm.refresh_field("tat_config");
      } else if (frm.doc.tat_config[0].tat_days !== 15) {
        frm.doc.tat_config[0].tat_days = 15;
        frm.refresh_field("tat_config");
      }
    }
  }
});
