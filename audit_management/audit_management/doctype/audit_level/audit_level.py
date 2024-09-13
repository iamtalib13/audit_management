# Copyright (c) 2024, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class AuditLevel(Document):
	pass

@frappe.whitelist()
def fetch_employee(employee_id):
    # Use parameterized query to prevent SQL injection
    sql_query = """
        SELECT CONCAT(first_name, ' ', last_name) AS employee_name,user_id, designation, branch, region, district, zone,department, division, cell_number
        FROM `tabEmployee`
        WHERE employee_id=%s
    """
    # Execute the query with the provided employee_id
    result = frappe.db.sql(sql_query, (employee_id,), as_dict=True)
    
    return result