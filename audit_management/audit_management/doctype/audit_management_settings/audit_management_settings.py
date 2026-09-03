import frappe
from frappe import _
from frappe.model.document import Document

class AuditManagementSettings(Document):
	def validate(self):
		if self.has_value_changed("enable_dgp_module"):
			if frappe.session.user != "Administrator":
				frappe.throw(_("Only Administrator can enable or disable the DGP Module."))

