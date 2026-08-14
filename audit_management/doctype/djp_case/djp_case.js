frappe.ui.form.on('DJP Case', {
    refresh: function(frm) {
        // Enforce Read Only for CMG fields
        frm.set_df_property('cmg_code', 'read_only', 1);
        frm.set_df_property('cmg_recommended_outcome', 'read_only', 1);

        if (frm.doc.misconduct_type) {
            frm.events.update_severity_options(frm);
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
        frm.set_df_property('cmg_code', 'read_only', 1);
        frm.set_df_property('cmg_recommended_outcome', 'read_only', 1);

        if (frm.doc.__islocal) {
            frm.set_value('created_on', frappe.datetime.now_datetime());
            frm.set_value('status', 'Draft');
            frm.set_value('escalation_count', 0);
        }
    },

    validate: function(frm) {
        if (frm.doc.misconduct_type && frm.doc.severity && frm.doc.occurrence) {
            frm.events.fetch_cmg_mapping(frm);
        }

        if (frm.doc.cmg_code && !frm.doc.tat_deadline) {
            frm.events.set_tat_deadline(frm);
        }
    },

    // Triggers dynamic filtering of Severity options when Misconduct Type changes
    misconduct_type: function(frm) {
        frm.events.update_severity_options(frm);
    },

    // Triggers dynamic filtering of Occurrence options when Severity changes
    severity: function(frm) {
        frm.events.update_occurrence_options(frm);
    },

    // Triggers auto-population of CMG Code & Outcome when Occurrence is selected
    occurrence: function(frm) {
        if (frm.doc.misconduct_type && frm.doc.severity && frm.doc.occurrence) {
            frm.events.fetch_cmg_mapping(frm);
        }
    },

    // Fetches valid Severity options from backend and auto-selects if single option available
    update_severity_options: function(frm) {
        if (!frm.doc.misconduct_type) {
            set_field_options('severity', ["", "Minor", "Major"]);
            frm.set_df_property('severity', 'options', ["", "Minor", "Major"].join('\n'));
            frm.refresh_field('severity');
            return;
        }

        frappe.call({
            method: 'audit_management.doctype.djp_case.djp_case.get_cmg_options',
            args: {
                misconduct_type: frm.doc.misconduct_type
            },
            callback: function(r) {
                if (r.message && r.message.severities) {
                    const valid_severities = r.message.severities;
                    const options = ["", ...valid_severities];

                    set_field_options('severity', options);
                    frm.set_df_property('severity', 'options', options.join('\n'));
                    frm.refresh_field('severity');

                    if (valid_severities.length === 1) {
                        frm.set_value('severity', valid_severities[0]);
                        frm.events.update_occurrence_options(frm);
                    } else if (frm.doc.severity && !valid_severities.includes(frm.doc.severity)) {
                        frm.set_value('severity', '');
                        frm.set_value('occurrence', '');
                        frm.set_value('cmg_code', '');
                        frm.set_value('cmg_recommended_outcome', '');
                    } else if (frm.doc.severity) {
                        frm.events.update_occurrence_options(frm);
                    }
                }
            }
        });
    },

    // Fetches valid Occurrence options from backend and auto-selects if single option available
    update_occurrence_options: function(frm) {
        if (!frm.doc.misconduct_type || !frm.doc.severity) {
            set_field_options('occurrence', ["", "First", "Repeat", "Any"]);
            frm.set_df_property('occurrence', 'options', ["", "First", "Repeat", "Any"].join('\n'));
            frm.refresh_field('occurrence');
            return;
        }

        frappe.call({
            method: 'audit_management.doctype.djp_case.djp_case.get_cmg_options',
            args: {
                misconduct_type: frm.doc.misconduct_type,
                severity: frm.doc.severity
            },
            callback: function(r) {
                if (r.message && r.message.occurrences) {
                    const valid_occurrences = r.message.occurrences;
                    const options = ["", ...valid_occurrences];

                    set_field_options('occurrence', options);
                    frm.set_df_property('occurrence', 'options', options.join('\n'));
                    frm.refresh_field('occurrence');

                    if (valid_occurrences.length === 1) {
                        frm.set_value('occurrence', valid_occurrences[0]);
                        frm.events.fetch_cmg_mapping(frm);
                    } else if (frm.doc.occurrence && !valid_occurrences.includes(frm.doc.occurrence) && !valid_occurrences.includes('Any')) {
                        frm.set_value('occurrence', '');
                        frm.set_value('cmg_code', '');
                        frm.set_value('cmg_recommended_outcome', '');
                    } else if (frm.doc.occurrence) {
                        frm.events.fetch_cmg_mapping(frm);
                    }
                }
            }
        });
    },

    // Auto-populates read-only CMG Code and CMG Recommended Outcome fields
    fetch_cmg_mapping: function(frm) {
        if (!frm.doc.misconduct_type || !frm.doc.severity || !frm.doc.occurrence) return;

        frappe.call({
            method: 'audit_management.doctype.djp_case.djp_case.get_cmg_mapping',
            args: {
                misconduct_type: frm.doc.misconduct_type,
                severity: frm.doc.severity,
                occurrence: frm.doc.occurrence
            },
            callback: function(r) {
                if (r.message) {
                    frm.set_value('cmg_code', r.message.cmg_code);
                    frm.set_value('cmg_recommended_outcome', r.message.cmg_recommended_outcome);
                    frm.refresh_field('cmg_code');
                    frm.refresh_field('cmg_recommended_outcome');
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
            method: 'audit_management.doctype.djp_case.djp_case.populate_djp_stages',
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
                method: 'audit_management.doctype.djp_case.djp_case.send_to_current_stage',
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
                    method: 'audit_management.doctype.djp_case.djp_case.escalate_case',
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
                    method: 'audit_management.doctype.djp_case.djp_case.close_case',
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