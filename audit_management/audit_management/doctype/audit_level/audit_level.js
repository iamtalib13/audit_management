frappe.ui.form.on('Audit Level', {
    refresh: function(frm) {
        // audit_stages should be always visible now
        frm.toggle_display("audit_stages", true);

        frappe.db.get_single_value("Audit Management Settings", "use_new_system").then(use_new_system => {
            if (use_new_system) {
                // In New System, hide old sections
                
                // Hide old level sections
                const old_sections = [
                    "stage_1_bm_section", "stage_2_dh_section", "stage_2_com_section",
                    "stage_3_rm_section", "stage_3_rom_section", "stage_4_zm_section",
                    "stage_4_zom_section", "stage_5_gm_section", "stage_6_hr_section",
                    "stage_7_chro_section", "stage_8_coo_section", "stage_9_cfo_section",
                    "stage_10_ceo_section"
                ];
                old_sections.forEach(s => frm.toggle_display(s, false));

            } else {
                // In Old System, hide audit_stages and show old sections
                frm.toggle_display("audit_stages", false);
                
                const old_sections = [
                    "stage_1_bm_section", "stage_2_dh_section", "stage_2_com_section",
                    "stage_3_rm_section", "stage_3_rom_section", "stage_4_zm_section",
                    "stage_4_zom_section", "stage_5_gm_section", "stage_6_hr_section",
                    "stage_7_chro_section", "stage_8_coo_section", "stage_9_cfo_section",
                    "stage_10_ceo_section"
                ];
                old_sections.forEach(s => frm.toggle_display(s, true));
            }
        });
    }
});

frappe.ui.form.on('Audit Items', {
    employee: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.employee) {
            frappe.call({
                method: "audit_management.audit_management.doctype.audit_level.audit_level.fetch_employee",
                args: { employee_id: row.employee },
                callback: function(r) {
                    if (r.message && r.message.length > 0) {
                        let data = r.message[0];
                        frappe.model.set_value(cdt, cdn, "employee_name", data.employee_name);
                        frappe.model.set_value(cdt, cdn, "user_id", data.user_id);
                        frappe.model.set_value(cdt, cdn, "email", data.company_email);
                    }
                }
            });
        }
    }
});
