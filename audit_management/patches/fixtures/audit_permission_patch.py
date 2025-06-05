import frappe

def execute():
    permissions = [
        # Audit Level
        {
            "doctype": "Audit Level",
            "role": "Audit Manager",
            "permlevel": 0,
            "read": 1,
            "write": 1,
            "create": 1,
            "email": 1,
            "export": 1,
            "select": 1,
        },
        {
            "doctype": "Audit Level",
            "role": "Audit Member",
            "permlevel": 0,
            "read": 1,
            "write": 1,
            "create": 1,
            "select": 1,
        },
        {
            "doctype": "Audit Level",
            "role": "Employee",
            "permlevel": 0,
            "read": 1,
            "export": 1,
            "select": 1,
        },

        # My Audits
        {
            "doctype": "My Audits",
            "role": "Audit Manager",
            "permlevel": 0,
            "read": 1,
            "write": 1,
            "create": 1,
            "email": 1,
            "export": 1,
            "select": 1,
            "delete": 1,
            "report": 1
        },
        {
            "doctype": "My Audits",
            "role": "Audit Member",
            "permlevel": 0,
            "read": 1,
            "write": 1,
            "create": 1,
            "select": 1,
            "report": 1
        },
        {
            "doctype": "My Audits",
            "role": "Employee",
            "permlevel": 0,
            "read": 1,
            "write": 1,
            "export": 1,
            "select": 1
        }
    ]

    for perm in permissions:
        if not frappe.db.exists("Custom DocPerm", {
            "parent": perm["doctype"],
            "role": perm["role"],
            "permlevel": perm["permlevel"]
        }):
            doc = frappe.get_doc({
                "doctype": "Custom DocPerm",
                **perm
            })
            doc.insert()
