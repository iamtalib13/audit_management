frappe.ui.form.on('Audit Management Settings', {
	refresh: function(frm) {
		if (frappe.session.user !== 'Administrator') {
			frm.set_df_property('enable_dgp_module', 'read_only', 1);
		}
	}
});

