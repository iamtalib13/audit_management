frappe.ui.form.on('DJP Case', {
    refresh: function(frm) {
        if (frm.doc.__islocal) {
            frm.set_df_property('cmg_code', 'read_only', 1);
            frm.set_df_property('cmg_recommended_outcome', 'read_only', 1);
        }

        // Add custom buttons
        if (!frm.doc.__islocal && frm.doc.status !== 'Closed' && frm.doc.status !== 'Cessation') {
            frm.add_custom_button(__('Populate Stages'), function() {
                frm.events.populate_stages(frm);
            }, __('Actions'));

            frm.add_custom_button(__('Send to Current Stage'), function() {
                frm.events.send_to_current_stage(frm);
            }, __('Actions'));

            frm.add_custom_button(__('Escalate'), function() {
                frm.events.escalate_case(frm);
            }, __('Actions'));

            frm.add_custom_button(__('Close Case'), function() {
                frm.events.close_case(frm);
            }, __('Actions'));
        }

        // Highlight TAT breach
        if (frm.doc.tat_deadline && frm.doc.status !== 'Closed' && frm.doc.status !== 'Cessation') {
            const deadline = frappe.datetime.str_to_obj(frm.doc.tat_deadline);
            const now = new Date();
            if (deadline < now) {
                frm.dashboard.set_headline_alert(__('TAT Breached! Deadline: ') + frappe.datetime.str_to_user(frm.doc.tat_deadline), 'red');
            } else {
                const diffHours = (deadline - now) / (1000 * 60 * 60);
                if (diffHours < 24) {
                    frm.dashboard.set_headline_alert(__('TAT expires in ') + Math.round(diffHours) + ' hours', 'orange');
                }
            }
        }
    },

    onload: function(frm) {
        if (frm.doc.__islocal) {
            frm.set_value('created_on', frappe.datetime.now_datetime());
            frm.set_value('status', 'Draft');
            frm.set_value('escalation_count', 0);
        }
    },

    validate: function(frm) {
        // Auto-populate CMG from CMG Grid child table in settings
        if (frm.doc.misconduct_type && frm.doc.severity && frm.doc.occurrence) {
            frm.events.fetch_cmg_mapping(frm);
        }

        // Set TAT deadline based on CMG code
        if (frm.doc.cmg_code && !frm.doc.tat_deadline) {
            frm.events.set_tat_deadline(frm);
        }
    },

    misconduct_type: function(frm) {
        if (frm.doc.misconduct_type && frm.doc.severity && frm.doc.occurrence) {
            frm.events.fetch_cmg_mapping(frm);
        }
    },

    severity: function(frm) {
        if (frm.doc.misconduct_type && frm.doc.severity && frm.doc.occurrence) {
            frm.events.fetch_cmg_mapping(frm);
        }
    },

    occurrence: function(frm) {
        if (frm.doc.misconduct_type && frm.doc.severity && frm.doc.occurrence) {
            frm.events.fetch_cmg_mapping(frm);
        }
    },

    fetch_cmg_mapping: function(frm) {
        // Fetch from Audit Management Settings -> CMG Grid child table
        frappe.call({
            method: 'audit_management.audit_management.doctype.djp_case.djp_case.get_cmg_mapping',
            args: {
                misconduct_type: frm.doc.misconduct_type,
                severity: frm.doc.severity,
                occurrence: frm.doc.occurrence
            },
            callback: function(r) {
                if (r.message) {
                    frm.set_value('cmg_code', r.message.cmg_code);
                    frm.set_value('cmg_recommended_outcome', r.message.cmg_recommended_outcome);
                    // Set TAT deadline
                    frm.events.set_tat_deadline(frm);
                }
            }
        });
    },

    set_tat_deadline: function(frm) {
        if (!frm.doc.cmg_code || !frm.doc.created_on) return;

        const tat_days = {
            'C0': 7,
            'C1': 7,
            'C2': 15,
            'C3': 15,
            'C4': 15,
            'C5': 45
        };

        const days = tat_days[frm.doc.cmg_code] || 15;
        const deadline = frappe.datetime.add_days(frm.doc.created_on, days);
        frm.set_value('tat_deadline', deadline);
    },

    populate_stages: function(frm) {
        frappe.call({
            method: 'audit_management.audit_management.doctype.djp_case.djp_case.populate_djp_stages',
            args: {
                docname: frm.doc.name,
                cmg_code: frm.doc.cmg_code,
                emp_branch: frm.doc.emp_branch
            },
            callback: function(r) {
                if (r.message) {
                    frm.reload_doc();
                    frappe.show_alert({message: __('Stages populated successfully'), indicator: 'green'});
                }
            }
        });
    },

    send_to_current_stage: function(frm) {
        frappe.confirm(__('Send case to current stage reviewer?'), function() {
            frappe.call({
                method: 'audit_management.audit_management.doctype.djp_case.djp_case.send_to_current_stage',
                args: { docname: frm.doc.name },
                callback: function(r) {
                    if (r.message) {
                        frm.reload_doc();
                        frappe.show_alert({message: __('Case sent to reviewer'), indicator: 'green'});
                    }
                }
            });
        });
    },

    escalate_case: function(frm) {
        const d = new frappe.ui.Dialog({
            title: __('Escalate Case'),
            fields: [
                {
                    fieldname: 'justification',
                    fieldtype: 'Small Text',
                    label: __('Escalation Justification (Required)'),
                    reqd: 1
                }
            ],
            primary_action_label: __('Escalate'),
            primary_action: function(values) {
                frappe.call({
                    method: 'audit_management.audit_management.doctype.djp_case.djp_case.escalate_case',
                    args: {
                        docname: frm.doc.name,
                        justification: values.justification
                    },
                    callback: function(r) {
                        if (r.message) {
                            d.hide();
                            frm.reload_doc();
                            frappe.show_alert({message: __('Case escalated successfully'), indicator: 'green'});
                        }
                    }
                });
            }
        });
        d.show();
    },

    close_case: function(frm) {
        const d = new frappe.ui.Dialog({
            title: __('Close Case'),
            fields: [
                {
                    fieldname: 'final_decision',
                    fieldtype: 'Select',
                    label: __('Final Decision'),
                    options: 'C0 - Counselling / Advisory\nC1 - Warning Letter\nC2 - Black Mark\nC3 - Black Mark + Financial Penalty / Recovery\nC4 - Ask to Go (Resignation / Cessation)\nC5 - Termination',
                    reqd: 1
                },
                {
                    fieldname: 'justification',
                    fieldtype: 'Small Text',
                    label: __('Justification (Required if deviation from CMG)'),
                    depends_on: 'eval:doc.final_decision != doc.cmg_code'
                },
                {
                    fieldname: 'governance_notes',
                    fieldtype: 'Small Text',
                    label: __('Governance Notes')
                }
            ],
            primary_action_label: __('Close'),
            primary_action: function(values) {
                frappe.call({
                    method: 'audit_management.audit_management.doctype.djp_case.djp_case.close_case',
                    args: {
                        docname: frm.doc.name,
                        final_decision: values.final_decision,
                        justification: values.justification,
                        governance_notes: values.governance_notes
                    },
                    callback: function(r) {
                        if (r.message) {
                            d.hide();
                            frm.reload_doc();
                            frappe.show_alert({message: __('Case closed successfully'), indicator: 'green'});
                        }
                    }
                });
            }
        });
        d.show();
    }
});

// DJP Case Stage events
frappe.ui.form.on('DJP Case Stage', {
    stage_name: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        if (row.stage_name) {
            frappe.db.get_doc('DJP Stage', row.stage_name).then(doc => {
                frappe.model.set_value(cdt, cdn, 'dc_level', doc.dc_level);
            });
        }
    }
});