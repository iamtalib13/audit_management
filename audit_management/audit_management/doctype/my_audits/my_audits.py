# Copyright (c) 2024, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class MyAudits(Document):
	pass

@frappe.whitelist()
def fetch_employee_data(employee_id):
    # Use parameterized query to prevent SQL injection
    sql_query = """SELECT employee_name,designation,branch FROM `tabEmployee` WHERE employee_id=%s"""
    # Execute the query with the provided employee_id
    result = frappe.db.sql(sql_query, (employee_id,), as_dict=True)
    
    return result
