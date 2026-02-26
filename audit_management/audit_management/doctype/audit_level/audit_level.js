frappe.ui.form.on('Audit Level', {
    refresh: function(frm) {
        if (!frappe.user.has_role("System Manager")) {
            frm.toggle_display("audit_stages", false);
        }
    }
});