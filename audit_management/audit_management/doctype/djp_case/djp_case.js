frappe.ui.form.on('DJP Case', {
    refresh: function(frm) {
        // Enforce Read Only for CMG fields
        frm.set_df_property('cmg_code', 'read_only', 1);
        frm.set_df_property('cmg_recommended_outcome', 'read_only', 1);

        if (frm.doc.misconduct_type) {
            frm.events.update_severity_options(frm);
        }

        // Inject attractive custom styling for DJP Action buttons and hide Connections section
        if (!$('#djp-case-custom-css').length) {
            $('<style id="djp-case-custom-css">\
                .djp-btn-populate { background-color: #4f46e5 !important; color: #ffffff !important; border-radius: 6px !important; font-weight: 600 !important; border: none !important; transition: all 0.2s ease !important; padding: 5px 12px !important; }\
                .djp-btn-populate:hover { background-color: #4338ca !important; transform: translateY(-1px) !important; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3) !important; color: #ffffff !important; }\
                .djp-btn-send { background-color: #0d9488 !important; color: #ffffff !important; border-radius: 6px !important; font-weight: 600 !important; border: none !important; transition: all 0.2s ease !important; padding: 5px 12px !important; }\
                .djp-btn-send:hover { background-color: #0f766e !important; transform: translateY(-1px) !important; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.3) !important; color: #ffffff !important; }\
                .djp-btn-escalate { background-color: #d97706 !important; color: #ffffff !important; border-radius: 6px !important; font-weight: 600 !important; border: none !important; transition: all 0.2s ease !important; padding: 5px 12px !important; }\
                .djp-btn-escalate:hover { background-color: #b45309 !important; transform: translateY(-1px) !important; box-shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.3) !important; color: #ffffff !important; }\
                .djp-btn-close { background-color: #16a34a !important; color: #ffffff !important; border-radius: 6px !important; font-weight: 600 !important; border: none !important; transition: all 0.2s ease !important; padding: 5px 12px !important; }\
                .djp-btn-close:hover { background-color: #15803d !important; transform: translateY(-1px) !important; box-shadow: 0 4px 6px -1px rgba(22, 163, 74, 0.3) !important; color: #ffffff !important; }\
                [data-doctype="DJP Case"] .form-links, [data-doctype="DJP Case"] .form-documents, [data-doctype="DJP Case"] .form-dashboard-section { display: none !important; }\
            </style>').appendTo('head');
        }

        // Add attractive standalone action buttons with icons
        if (!frm.doc.__islocal && frm.doc.status !== 'Closed' && frm.doc.status !== 'Cessation') {
            let b1 = frm.add_custom_button(__('Populate Stages'), function() {
                frm.events.populate_stages(frm);
            });
            b1.addClass('djp-btn-populate').find('i, svg').remove();
            b1.prepend('<i class="fa fa-sitemap mr-1"></i> ');

            let b2 = frm.add_custom_button(__('Send to Reviewer'), function() {
                frm.events.send_to_current_stage(frm);
            });
            b2.addClass('djp-btn-send').find('i, svg').remove();
            b2.prepend('<i class="fa fa-paper-plane mr-1"></i> ');

            let b4 = frm.add_custom_button(__('Close Case'), function() {
                frm.events.close_case(frm);
            });
            b4.addClass('djp-btn-close').find('i, svg').remove();
            b4.prepend('<i class="fa fa-check-circle mr-1"></i> ');
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

        // Render Stage & Escalation Tracker UI
        if (!frm.is_new()) {
            frm.events.render_djp_stage_tracker(frm);
        }

        // Hide unnecessary connections section at bottom
        if (frm.dashboard && frm.dashboard.wrapper) {
            frm.dashboard.wrapper.find('.form-links').hide();
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
            method: 'audit_management.audit_management.doctype.djp_case.djp_case.get_cmg_options',
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
            method: 'audit_management.audit_management.doctype.djp_case.djp_case.get_cmg_options',
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
                    frm.refresh_field('cmg_code');
                    frm.refresh_field('cmg_recommended_outcome');
                    frm.events.set_tat_deadline(frm);

                    // Auto-populate DJP Case stages based on BRD rules if local form
                    if (frm.doc.__islocal) {
                        frm.events.auto_populate_stage_rows(frm);
                    }
                }
            }
        });
    },

    // Auto-populates stage rows into the child table based on BRD escalation and branch assignment
    auto_populate_stage_rows: function(frm) {
        if (!frm.doc.cmg_code) return;

        frappe.call({
            method: 'audit_management.audit_management.doctype.djp_case.djp_case.fetch_auto_djp_stages',
            args: {
                cmg_code: frm.doc.cmg_code,
                emp_branch: frm.doc.emp_branch,
                created_on: frm.doc.created_on,
                accused_employee: frm.doc.employee
            },
            callback: function(r) {
                if (r.message && Array.isArray(r.message)) {
                    frm.clear_table('djp_case_stages');
                    r.message.forEach(row => {
                        let child = frm.add_child('djp_case_stages');
                        Object.assign(child, row);
                    });
                    frm.refresh_field('djp_case_stages');
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
    },

    // Render visual stage & escalation progress tracker UI
    render_djp_stage_tracker: function(frm) {
        if (!frm.doc.djp_case_stages || frm.doc.djp_case_stages.length === 0) {
            frm.page.wrapper.find('.djp-stage-tracker-container').remove();
            return;
        }

        frm.page.wrapper.find('.djp-stage-tracker-container').remove();

        if (!$('#djp-tracker-style').length) {
            $('<style id="djp-tracker-style">\
                .djp-stage-tracker-container { margin-top: 8px; margin-bottom: 12px; padding: 10px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); position: relative; overflow: visible !important; }\
                .djp-tracker-header { font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }\
                .djp-tracker-flow { display: flex; align-items: flex-start; justify-content: flex-start !important; width: 100%; overflow: visible !important; padding: 4px 0; }\
                .djp-tracker-step { display: flex; flex-direction: column; align-items: center; position: relative; flex: 0 0 auto !important; min-width: 145px; max-width: 220px; overflow: visible !important; margin-right: 12px; }\
                .djp-step-top-row { display: flex; align-items: center; width: 100%; position: relative; }\
                .djp-step-pill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #f1f5f9; color: #475569; border: 1.5px solid #cbd5e1; transition: all 0.2s ease; position: relative; cursor: pointer; white-space: nowrap; }\
                .djp-step-pill:hover { transform: translateY(-1px); box-shadow: 0 3px 6px rgba(0,0,0,0.08); }\
                .djp-pill-active { background: #dbeafe !important; color: #1d4ed8 !important; border-color: #3b82f6 !important; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15) !important; }\
                .djp-pill-responded { background: #dcfce7 !important; color: #15803d !important; border-color: #22c55e !important; }\
                .djp-pill-overdue { background: #fee2e2 !important; color: #b91c1c !important; border-color: #ef4444 !important; }\
                .djp-pill-escalated { background: #fef3c7 !important; color: #b45309 !important; border-color: #f59e0b !important; }\
                .djp-pill-skipped { background: #f8fafc !important; color: #94a3b8 !important; border-color: #e2e8f0 !important; }\
                .djp-step-num { width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.08); display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }\
                .djp-pill-active .djp-step-num { background: #2563eb; color: #ffffff; }\
                .djp-pill-responded .djp-step-num { background: #16a34a; color: #ffffff; }\
                .djp-pill-overdue .djp-step-num { background: #dc2626; color: #ffffff; }\
                .djp-pill-escalated .djp-step-num { background: #d97706; color: #ffffff; }\
                .djp-step-connector { flex: 1; height: 2px; background: #e2e8f0; margin: 0 8px; }\
                .djp-conn-completed { background: #22c55e; }\
                .djp-conn-escalated { background: #f59e0b; }\
                .djp-step-status-subtext { margin-top: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; text-align: center; white-space: nowrap; }\
                .djp-status-pending { color: #64748b; }\
                .djp-status-active { color: #2563eb; }\
                .djp-status-responded { color: #16a34a; }\
                .djp-status-overdue { color: #dc2626; }\
                .djp-status-escalated { color: #d97706; }\
                .djp-status-skipped { color: #94a3b8; }\
                .djp-pill-wrapper .djp-tooltip {\
                    visibility: hidden; opacity: 0; position: absolute; top: 100%; bottom: auto; left: 50%; transform: translateX(-50%); margin-top: 38px;\
                    background-color: #0f172a; color: #ffffff; text-align: left; padding: 8px 12px; border-radius: 8px;\
                    font-size: 11px; font-weight: 400; line-height: 1.5; white-space: nowrap; z-index: 999999 !important; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);\
                    transition: opacity 0.2s ease, visibility 0.2s ease; pointer-events: none;\
                }\
                .djp-pill-wrapper .djp-tooltip::after {\
                    content: ""; position: absolute; bottom: 100%; left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: transparent transparent #0f172a transparent;\
                }\
                .djp-pill-wrapper:hover .djp-tooltip, .djp-step-pill:hover .djp-tooltip { visibility: visible !important; opacity: 1 !important; }\
            </style>').appendTo('head');
        }

        const stages = frm.doc.djp_case_stages;
        const current_stage = frm.doc.current_stage || 1;

        let html = '<div class="djp-stage-tracker-container">';
        html += '<div class="djp-tracker-header">';
        html += '<span><i class="fa fa-tasks mr-1"></i> Stage Tracker</span>';
        html += `<span class="badge badge-info" style="font-size: 10px; font-weight: 600;">Current Stage: ${frm.doc.current_dc_level || 'Stage ' + current_stage}</span>`;
        html += '</div>';

        html += '<div class="djp-tracker-flow">';

        stages.forEach((stg, idx) => {
            const isLast = idx === stages.length - 1;
            const isCurrent = (stg.stage === current_stage) && frm.doc.status !== 'Closed' && frm.doc.status !== 'Cessation';
            
            let isOverdue = false;
            if (stg.tat_deadline && (stg.status === 'Pending' || stg.status === 'Sent')) {
                const deadline = frappe.datetime.str_to_obj(stg.tat_deadline);
                if (deadline < new Date()) {
                    isOverdue = true;
                }
            }

            let pillClass = '';
            let connClass = '';
            let statusText = stg.status || 'Pending';
            let statusTextClass = 'djp-status-pending';

            if (stg.status === 'Responded') {
                pillClass = 'djp-pill-responded';
                connClass = 'djp-conn-completed';
                statusText = '✓ Responded';
                statusTextClass = 'djp-status-responded';
            } else if (stg.status === 'Escalated') {
                pillClass = 'djp-pill-escalated';
                connClass = 'djp-conn-escalated';
                statusText = '↑ Escalated';
                statusTextClass = 'djp-status-escalated';
            } else if (isOverdue) {
                pillClass = 'djp-pill-overdue';
                statusText = '⚠ Overdue';
                statusTextClass = 'djp-status-overdue';
            } else if (stg.status === 'Sent' || isCurrent) {
                pillClass = 'djp-pill-active';
                statusText = '⚡ Sent (Under Review)';
                statusTextClass = 'djp-status-active';
            } else if (stg.status === 'Skipped') {
                pillClass = 'djp-pill-skipped';
                statusText = 'Skipped';
                statusTextClass = 'djp-status-skipped';
            } else {
                statusText = 'Pending (Not Sent)';
            }

            let remainingDaysInfo = '';
            if (stg.tat_deadline) {
                let now = new Date();
                let deadlineObj = frappe.datetime.str_to_obj(stg.tat_deadline);
                if (deadlineObj) {
                    let diffMs = deadlineObj - now;
                    let diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                    if (stg.status === 'Responded') {
                        remainingDaysInfo = '✓ Completed';
                    } else if (stg.status === 'Escalated') {
                        remainingDaysInfo = '↑ Escalated';
                    } else if (diffDays < 0) {
                        remainingDaysInfo = `⚠ Overdue (${Math.abs(diffDays)}d ago)`;
                    } else if (diffDays === 0) {
                        remainingDaysInfo = '⏳ Due Today';
                    } else {
                        remainingDaysInfo = `⏱ ${diffDays} Days Left`;
                    }
                }
            }

            let iconHtml = stg.stage;
            if (stg.status === 'Responded') iconHtml = '<i class="fa fa-check" style="font-size:9px;"></i>';
            else if (stg.status === 'Escalated') iconHtml = '<i class="fa fa-arrow-up" style="font-size:9px;"></i>';
            else if (isOverdue) iconHtml = '<i class="fa fa-exclamation" style="font-size:9px;"></i>';

            let empName = stg.employee_name || stg.employee || 'Unassigned';
            let empDesig = stg.designation ? ` (${stg.designation})` : '';
            let formattedTat = stg.tat_deadline ? frappe.datetime.str_to_user(stg.tat_deadline.split(' ')[0]) : 'N/A';
            let sentOn = stg.pending_time ? frappe.datetime.str_to_user(stg.pending_time) : (frm.doc.created_on ? frappe.datetime.str_to_user(frm.doc.created_on) : 'Not Sent Yet');

            let tatDays = 'N/A';
            if (stg.tat_deadline) {
                let startStr = stg.pending_time || frm.doc.created_on;
                if (startStr) {
                    let startObj = frappe.datetime.str_to_obj(startStr);
                    let endObj = frappe.datetime.str_to_obj(stg.tat_deadline);
                    if (startObj && endObj) {
                        let diffMs = endObj - startObj;
                        tatDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
                    }
                }
            }

            html += '<div class="djp-tracker-step">';
            
            // Pill Wrapper (Pill + Status directly below)
            html += '<div class="djp-pill-wrapper" style="display: flex; flex-direction: column; align-items: center; position: relative;">';
            html += `<div class="djp-step-pill ${pillClass}">`;
            html += `<span class="djp-step-num">${iconHtml}</span>`;
            html += `<span>${stg.dc_level || stg.stage_name}</span>`;
            
            // Hover Tooltip (Floating Outside)
            html += `<div class="djp-tooltip">`;
            html += `<div style="font-weight:700; color:#38bdf8; margin-bottom:2px;">${stg.dc_level || stg.stage_name}</div>`;
            html += `<div><strong>Assigned To:</strong> ${empName}${empDesig}</div>`;
            html += `<div><strong>Status:</strong> ${stg.status || 'Pending'}</div>`;
            html += `<div><strong>Sent On:</strong> ${sentOn}</div>`;
            html += `<div><strong>TAT:</strong> ${tatDays} Days (Deadline: ${formattedTat})</div>`;
            html += `</div>`;

            html += `</div>`; // .djp-step-pill

            // Subtext directly under card (Status + Remaining Days)
            html += `<div class="djp-step-status-subtext ${statusTextClass}">`;
            html += `<div>${statusText}</div>`;
            if (remainingDaysInfo) {
                html += `<div style="font-size: 9px; margin-top: 2px; opacity: 0.9; font-weight: 600;">${remainingDaysInfo}</div>`;
            }
            html += `</div>`;

            html += '</div>'; // .djp-pill-wrapper

            if (!isLast) {
                html += `<div class="djp-step-connector ${connClass}" style="margin-top: 14px;"></div>`;
            }
            html += '</div>'; // .djp-tracker-step
        });

        html += '</div>'; // .djp-tracker-flow
        html += '</div>'; // .djp-stage-tracker-container

        let $formContainer = frm.page.wrapper.find('.form-message-container');
        if ($formContainer.length) {
            $formContainer.after(html);
        } else {
            frm.page.wrapper.find('.layout-main-section').first().prepend(html);
        }
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
