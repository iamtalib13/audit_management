# Copyright (c) 2024, Sahayog and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class AuditLevel(Document):
    def on_change(self):
        # Call method to update related records in "My Audits"
        self.update_my_audit()  
    
    def validate(self):
        print("🔥 ON UPDATE RUNNING FOR:", self.name)
        frappe.msgprint("ON UPDATE RUNNING")
        # Always normalize data in same order
        self.sync_parent_to_child()
        self.sync_child_to_parent()
        self.remove_blank_rows()

    # -----------------------------------------
    # 1️⃣ Parent → Child Sync
    # -----------------------------------------
    def sync_parent_to_child(self):

        parent_fields = [df.fieldname for df in self.meta.fields]

        for field in parent_fields:

            if field.endswith("_emp_id") and field.startswith("stage_"):

                parts = field.split("_")
                if len(parts) < 4:
                    continue

                stage_number = parts[1]
                role = parts[2]

                employee = getattr(self, field)
                mail_field = f"stage_{stage_number}_{role}_mail"
                user_field = f"stage_{stage_number}_{role}_user_id"
                name_field = f"stage_{stage_number}_{role}_name"

                email = getattr(self, mail_field, None)
                user_id = getattr(self, user_field, None)
                employee_name = getattr(self, name_field, None)

                existing_row = None
                for row in self.audit_stages:
                    if (
                        str(row.stage) == str(stage_number)
                        and row.stage_name
                        and row.stage_name.strip().lower() == role.strip().lower()
                    ):
                        existing_row = row
                        break

                if employee:
                    if existing_row:
                        existing_row.employee = employee
                        existing_row.email = email
                        existing_row.user_id = user_id
                        existing_row.employee_name = employee_name
                    else:
                        self.append("audit_stages", {
                            "stage": stage_number,
                            "stage_name": role.upper(),
                            "employee": employee,
                            "user_id": user_id,
                            "employee_name": employee_name,
                            "email": email
                        })
                else:
                    if existing_row:
                        self.audit_stages.remove(existing_row)
    # -----------------------------------------
    # 2️⃣ Child → Parent Sync
    # -----------------------------------------
    def sync_child_to_parent(self):

        parent_fields = [df.fieldname for df in self.meta.fields]
        child_keys = set()

        for row in self.audit_stages:

            if not row.stage or not row.stage_name:
                continue

            stage_number = row.stage
            role = row.stage_name.lower()

            emp_field = f"stage_{stage_number}_{role}_emp_id"
            mail_field = f"stage_{stage_number}_{role}_mail"
            user_field = f"stage_{stage_number}_{role}_user_id"
            name_field = f"stage_{stage_number}_{role}_name"

            child_keys.update([emp_field, mail_field, user_field, name_field])

            if emp_field in parent_fields:
                setattr(self, emp_field, row.employee or None)

            if mail_field in parent_fields:
                setattr(self, mail_field, row.email or None)

            if user_field in parent_fields:
                setattr(self, user_field, row.user_id or None)

            if name_field in parent_fields:
                setattr(self, name_field, row.employee_name or None)

        # Clear parent fields only if child table actually changed
        if self.get_doc_before_save() and self.get_doc_before_save().audit_stages != self.audit_stages:
            for field in parent_fields:
                if (
                    field.startswith("stage_")
                    and (
                        field.endswith("_emp_id")
                        or field.endswith("_mail")
                        or field.endswith("_user_id")
                        or field.endswith("_name")
                    )
                ):
                    if field not in child_keys:
                        setattr(self, field, None)
                    
                
    def remove_blank_rows(self):
        cleaned_rows = []

        for row in self.audit_stages:
            if row.stage and row.stage_name:
                # Only remove row if completely empty
                if row.employee or row.email or row.user_id or row.employee_name:
                    cleaned_rows.append(row)

        self.audit_stages = cleaned_rows
                        
                
    def update_my_audit(self):  # Moved method into the class
        try:
            # Fetch related records in "My Audits" based on a relevant filter (like branch)
            my_audit_records = frappe.get_all(
                "My Audits",
                filters={"emp_branch": self.emp_branch},  # Use appropriate filter for linking
                fields=["name", "bm_user_status", "dh_user_status", "com_user_status",
                        "rm_user_status", "rom_user_status", "zm_user_status", 
                        "zom_user_status", "gm_user_status","hr_user_status","coo_user_status", 
                        "ceo_user_status"]
            )

            # Handle each stage individually
            for record in my_audit_records:
                # Stage 1: BM
                if self.stage_1_bm_emp_id and (record.bm_user_status == "" or record.bm_user_status == "Pending"):
                    frappe.db.set_value("My Audits", record.name, "bm_user_id", self.stage_1_bm_user_id, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "bm_name", self.stage_1_bm_name, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "bm_mail", self.stage_1_bm_mail, update_modified=False)

                # Stage 2: DH
                if self.stage_2_dh_emp_id and (record.dh_user_status == "" or record.dh_user_status == "Pending"):
                    frappe.db.set_value("My Audits", record.name, "dh_user_id", self.stage_2_dh_user_id, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "dh_name", self.stage_2_dh_name, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "dh_mail", self.stage_2_dh_mail, update_modified=False)

                # Stage 2: COM
                if self.stage_2_com_emp_id and (record.com_user_status == "" or record.com_user_status == "Pending"):
                    frappe.db.set_value("My Audits", record.name, "com_user_id", self.stage_2_com_user_id, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "com_name", self.stage_2_com_name, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "com_mail", self.stage_2_com_mail, update_modified=False)


                # Stage 3: RM
                if self.stage_3_rm_emp_id and (record.rm_user_status == "" or record.rm_user_status == "Pending"):
                    frappe.db.set_value("My Audits", record.name, "rm_user_id", self.stage_3_rm_user_id, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "rm_name", self.stage_3_rm_name, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "rm_mail", self.stage_3_rm_mail, update_modified=False)


                # Stage 3: ROM
                if self.stage_3_rom_emp_id and (record.rom_user_status == "" or record.rom_user_status == "Pending"):
                    frappe.db.set_value("My Audits", record.name, "rom_user_id", self.stage_3_rom_user_id, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "rom_name", self.stage_3_rom_name, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "rom_mail", self.stage_3_rom_mail, update_modified=False)


                # Stage 4: ZM
                if self.stage_4_zm_emp_id and (record.zm_user_status == "" or record.zm_user_status == "Pending"):
                    frappe.db.set_value("My Audits", record.name, "zm_user_id", self.stage_4_zm_user_id, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "zm_name", self.stage_4_zm_name, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "zm_mail", self.stage_4_zm_mail, update_modified=False)


                # Stage 4: ZOM
                if self.stage_4_zom_emp_id and (record.zom_user_status == "" or record.zom_user_status == "Pending"):
                    frappe.db.set_value("My Audits", record.name, "zom_user_id", self.stage_4_zom_user_id, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "zom_name", self.stage_4_zom_name, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "zom_mail", self.stage_4_zom_mail, update_modified=False)


                # Stage 5: GM
                if self.stage_5_gm_emp_id and (record.gm_user_status == "" or record.gm_user_status == "Pending"):
                    frappe.db.set_value("My Audits", record.name, "gm_user_id", self.stage_5_gm_user_id, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "gm_name", self.stage_5_gm_name, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "gm_mail", self.stage_5_gm_mail, update_modified=False)

                
                # Stage 6: HR
                if self.stage_6_hr_emp_id and (record.hr_user_status == "" or record.hr_user_status == "Pending"):
                    frappe.db.set_value("My Audits", record.name, "hr_user_id", self.stage_6_hr_user_id, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "hr_name", self.stage_6_hr_name, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "hr_mail", self.stage_6_hr_mail, update_modified=False)


                # Stage 7: COO
                if self.stage_7_coo_emp_id and (record.coo_user_status == "" or record.coo_user_status == "Pending"):
                    frappe.db.set_value("My Audits", record.name, "coo_user_id", self.stage_7_coo_user_id, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "coo_name", self.stage_7_coo_name, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "coo_mail", self.stage_7_coo_mail, update_modified=False)


                # Stage 8: CEO
                if self.stage_8_ceo_emp_id and (record.ceo_user_status == "" or record.ceo_user_status == "Pending"):
                    frappe.db.set_value("My Audits", record.name, "ceo_user_id", self.stage_8_ceo_user_id, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "ceo_name", self.stage_8_ceo_name, update_modified=False)
                    frappe.db.set_value("My Audits", record.name, "ceo_mail", self.stage_8_ceo_mail, update_modified=False)


            frappe.db.commit()  # Commit changes to the database
            frappe.msgprint(f"My Audits records updated successfully where branch is {self.emp_branch}.")
        except Exception as e:
            frappe.log_error(f"Error updating My Audits: {str(e)}", "AuditLevel")
            frappe.msgprint(f"An error occurred: {str(e)}")
 
@frappe.whitelist()
def fetch_employee(employee_id):
    # Use parameterized query to prevent SQL injection
    sql_query = """
        SELECT CONCAT(first_name, ' ', last_name) AS employee_name, user_id, designation, branch, region, district, zone, department, division, cell_number
        FROM `tabEmployee`
        WHERE employee_id = %s
    """
    # Execute the query with the provided employee_id
    result = frappe.db.sql(sql_query, (employee_id,), as_dict=True)
    
    return result