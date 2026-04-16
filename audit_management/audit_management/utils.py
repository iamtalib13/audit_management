import frappe

def is_new_system_enabled():
	return frappe.db.get_single_value("Audit Management Settings", "use_new_system")
