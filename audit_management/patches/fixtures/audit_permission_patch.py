import frappe

def execute():
    doctype_permissions = {
        "Audit Level": [
            {
                "role": "Audit Manager",
                "permlevel": 0,
                "read": 1, "write": 1, "create": 1, "delete": 0,
                "submit": 0, "cancel": 0, "amend": 0,
                "email": 1, "export": 1, "print": 1, "report": 0
            },
            {
                "role": "Audit Member",
                "permlevel": 0,
                "read": 1, "write": 1, "create": 1, "delete": 0,
                "submit": 0, "cancel": 0, "amend": 0,
                "email": 0, "export": 1, "print": 1, "report": 0
            },
            {
                "role": "Employee",
                "permlevel": 0,
                "read": 1, "write": 0, "create": 0, "delete": 0,
                "submit": 0, "cancel": 0, "amend": 0,
                "email": 0, "export": 1, "print": 1, "report": 0
            }
        ],
        "My Audits": [
            {
                "role": "Audit Manager",
                "permlevel": 0,
                "read": 1, "write": 1, "create": 1, "delete": 1,
                "submit": 0, "cancel": 0, "amend": 0,
                "email": 1, "export": 1, "print": 1, "report": 1
            },
            {
                "role": "Audit Member",
                "permlevel": 0,
                "read": 1, "write": 1, "create": 1, "delete": 0,
                "submit": 0, "cancel": 0, "amend": 0,
                "email": 0, "export": 1, "print": 1, "report": 1
            },
            {
                "role": "Employee",
                "permlevel": 0,
                "read": 1, "write": 0, "create": 0, "delete": 0,
                "submit": 0, "cancel": 0, "amend": 0,
                "email": 0, "export": 1, "print": 1, "report": 0
            }
        ],
        "Branch": [
            {
                "role": "Audit Manager",
                "permlevel": 0,
                "read": 1, "write": 0, "create": 0, "delete": 0,
                "submit": 0, "cancel": 0, "amend": 0,
                "email": 0, "export": 1, "print": 0, "report": 0
            },
            {
                "role": "Audit Member",
                "permlevel": 0,
                "read": 1, "write": 0, "create": 0, "delete": 0,
                "submit": 0, "cancel": 0, "amend": 0,
                "email": 0, "export": 0, "print": 0, "report": 0
            }
        ]
    }

    for doctype, perms in doctype_permissions.items():
        for perm in perms:
            filters = {
                "parent": doctype,
                "role": perm["role"],
                "permlevel": perm["permlevel"]
            }
            if not frappe.db.exists("Custom DocPerm", filters):
                docperm = frappe.get_doc({
                    "doctype": "Custom DocPerm",
                    "parent": doctype,
                    "parentfield": "permissions",
                    "parenttype": "DocType",
                    "role": perm["role"],
                    "permlevel": perm["permlevel"],
                    "read": perm.get("read", 0),
                    "write": perm.get("write", 0),
                    "create": perm.get("create", 0),
                    "delete": perm.get("delete", 0),
                    "submit": perm.get("submit", 0),
                    "cancel": perm.get("cancel", 0),
                    "amend": perm.get("amend", 0),
                    "email": perm.get("email", 0),
                    "export": perm.get("export", 0),
                    "print": perm.get("print", 0),
                    "report": perm.get("report", 0)
                })
                docperm.insert(ignore_permissions=True)

    frappe.clear_cache(doctype=None)
