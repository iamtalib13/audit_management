frappe.ui.form.on('DJP Case', {
    setup: function(frm) {
        // Prevent user from selecting themselves as the Accused Employee
        frm.set_query('employee', function() {
            return {
                filters: {
                    'user_id': ['!=', frappe.session.user]
                }
            };
        });

        frm.set_query('employee', 'additional_accused_employees', function() {
            return {
                filters: {
                    'user_id': ['!=', frappe.session.user]
                }
            };
        });

        // Prevent user from selecting Accused Employee or themselves as a Stage Reviewer
        frm.set_query('employee', 'djp_case_stages', function(doc, cdt, cdn) {
            return {
                filters: {
                    'name': ['!=', doc.employee],
                    'user_id': ['!=', frappe.session.user]
                }
            };
        });
    },
    refresh: function(frm) {
        // Enforce Read Only for CMG fields
        frm.set_df_property('cmg_code', 'read_only', 1);
        frm.set_df_property('cmg_recommended_outcome', 'read_only', 1);

        // Make form 100% strictly read-only and unclickable for Stage Reviewers (non-creator / non-admin / non-manager)
        const is_admin_or_creator = (frm.doc.owner === frappe.session.user) ||
                                    frappe.user.has_role('System Manager') ||
                                    frappe.user.has_role('Administrator') ||
                                    frappe.user.has_role('Audit Manager') ||
                                    frappe.session.user === 'Administrator';

        if (!is_admin_or_creator && !frm.is_new()) {
            frm.set_read_only();
            if (!$('#djp-reviewer-readonly-style').length) {
                $('<style id="djp-reviewer-readonly-style">\
                    [data-doctype="DJP Case"] .form-section { pointer-events: none !important; opacity: 0.9 !important; user-select: text !important; }\
                    [data-doctype="DJP Case"] .grid-row, [data-doctype="DJP Case"] .grid-add-row, [data-doctype="DJP Case"] .grid-remove-rows { pointer-events: none !important; }\
                    [data-doctype="DJP Case"] .page-actions, [data-doctype="DJP Case"] .djp-stage-tracker-container { pointer-events: auto !important; }\
                </style>').appendTo('head');
            }

            // Lock attachment field specifically
            frm.set_df_property("case_attachment", "read_only", 1);
            frm.set_df_property("is_multiple_accused", "read_only", 1);
            frm.set_df_property("additional_accused_employees", "read_only", 1);
            
            // Hide Frappe sidebar attachment delete buttons for stage users
            setTimeout(() => {
                frm.page.sidebar.find(".attachment-row .btn-trash, .attachment-row .remove-btn, .attachment-row [data-action='remove'], .sidebar-actions .btn-trash").hide();
                frm.page.sidebar.find(".attachment-row").each(function () {
                    $(this).find("a, button, span").last().hide();
                });
            }, 500);
            
            // Also re-apply on sidebar mutation
            const observer = new MutationObserver(() => {
                frm.page.sidebar.find(".attachment-row .btn-trash, .attachment-row .remove-btn, .attachment-row [data-action='remove'], .sidebar-actions .btn-trash").hide();
            });
            if (frm.page.sidebar.length) {
                observer.observe(frm.page.sidebar[0], { childList: true, subtree: true });
            }

        } else {
            $('#djp-reviewer-readonly-style').remove();
            frm.set_df_property("case_attachment", "read_only", 0);
        }

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
            const is_admin = frappe.user.has_role('System Manager') ||
                             frappe.user.has_role('Administrator') ||
                             frappe.session.user === 'Administrator';

            const is_admin_or_manager = is_admin || frappe.user.has_role('Audit Manager');

            const is_creator_or_audit = is_admin_or_manager ||
                                         frappe.user.has_role('Audit Member') ||
                                         frappe.session.user === frm.doc.owner;

            // 1. Populate Stages (Admin / Audit Manager only)
            if (is_admin_or_manager) {
                let b1 = frm.add_custom_button(__('Populate Stages'), function() {
                    frm.events.populate_stages(frm);
                });
                b1.addClass('djp-btn-populate').find('i, svg').remove();
                b1.prepend('<i class="fa fa-sitemap mr-1"></i> ');
            }

            // 2. Send to Reviewer (Case Creator & Audit Team)
            if (is_creator_or_audit) {
                let b2 = frm.add_custom_button(__('Send to All Reviewers'), function() {
                    frm.events.send_to_all_reviewers(frm);
                });
                b2.addClass('djp-btn-send').find('i, svg').remove();
                b2.prepend('<i class="fa fa-paper-plane mr-1"></i> ');
            }

            // 3. Submit Response (Stage Reviewer & Admin - visible before & after response)
            const is_assigned_stage_reviewer = frm.doc.djp_case_stages && frm.doc.djp_case_stages.some(s => s.user_id === frappe.session.user);
            const is_stage_reviewer = is_assigned_stage_reviewer || is_admin;

            if (is_stage_reviewer) {
                let b3 = frm.add_custom_button(__('Submit Response'), function() {
                    frm.events.submit_stage_response(frm);
                });
                b3.addClass('btn-primary').find('i, svg').remove();
                b3.prepend('<i class="fa fa-reply mr-1"></i> ');

                const is_pending = frm.doc.djp_case_stages && frm.doc.djp_case_stages.some(s => s.user_id === frappe.session.user && s.status === 'Pending');
                if (is_pending || is_admin) {
                    let b_send_back = frm.add_custom_button(__('Send Back'), function() {
                        frm.events.send_back_case(frm);
                    });
                    b_send_back.addClass('btn-danger').find('i, svg').remove();
                    b_send_back.prepend('<i class="fa fa-undo mr-1"></i> ');
                }
            }

            // 4. Close Case (Case Creator & Audit Team)
            if (is_creator_or_audit) {
                let b4 = frm.add_custom_button(__('Close Case'), function() {
                    frm.events.close_case(frm);
                });
                b4.addClass('djp-btn-close').find('i, svg').remove();
                b4.prepend('<i class="fa fa-check-circle mr-1"></i> ');
            }
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
        // 5. Reopen Case Button (Sirf Closed status me dikhega)
        if (!frm.doc.__islocal && frm.doc.status === 'Closed') {
                const is_admin_or_manager = frappe.user.has_role('System Manager') ||
                                            frappe.user.has_role('Administrator') ||
                                            frappe.user.has_role('Audit Manager') ||
                                            frappe.session.user === 'Administrator' ||
                                            frappe.session.user === frm.doc.owner;

                // Sirf Admin, Manager ya Creator ko permission den
                if (is_admin_or_manager) {                                                                             
                    let btn_reopen = frm.add_custom_button(__('Reopen Case'), function() {                             
                        // Dialog open hoga reason puchne ke liye                                                      
                        const d = new frappe.ui.Dialog({                                                               
                            title: __('Reopen Case'),                                                                  
                            fields: [                                                                                  
                                {                                                                                      
                                    fieldname: 'reason',                                                               
                                    fieldtype: 'Small Text',                                                           
                                    label: __('Reason for Reopening (Required)'),                                      
                                    reqd: 1                                                                            
                                }                                                                                      
                            ],                                                                                         
                            primary_action_label: __('Reopen'),                                                        
                            primary_action: function(values) {                                                         
                                frappe.call({                                                                          
                                    method: 'audit_management.audit_management.doctype.djp_case.djp_case.reopen_case', 
                                    args: {                                                                            
                                        docname: frm.doc.name,                                                         
                                        reason: values.reason                                                          
                                    },                                                                                 
                                    freeze: true,                                                                      
                                    freeze_message: __('Reopening Case...'),                                           
                                    callback: function(r) {
                                        if (!r.exc) {
                                            d.hide();
                                            frm.reload_doc();
                                            frappe.show_alert({message: __('Case Reopened'), indicator: 'orange'});    
                                        }
                                    }
                                });
                            }
                        });
                        d.show();
                    });
    
                    // Button ko style dene ke liye (Optional)
                    btn_reopen.css({'background-color': '#d97706', 'color': 'white', 'font-weight': 'bold'});          
                    btn_reopen.prepend('<i class="fa fa-unlock mr-1"></i> ');
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
        if (frm.doc.cmg_code && !frm.doc.tat_deadline) {
            frm.events.set_tat_deadline(frm);
        }
    },

    // Triggers dynamic filtering of Severity options when Misconduct Type changes
    misconduct_type: function(frm) {
        frm.events.update_severity_options(frm);
    },

    // Handle multiple accused employee selection and cleanup
    is_multiple_accused: function(frm) {
        if (frm.doc.is_multiple_accused && frm.doc.additional_accused_employees && frm.doc.additional_accused_employees.length > 0) {
            frm.set_value('employee', frm.doc.additional_accused_employees[0].employee);
        } else if (!frm.doc.is_multiple_accused) {
            frm.clear_table('additional_accused_employees');
            frm.refresh_field('additional_accused_employees');
        }
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

                    if (frm.doc.__islocal && valid_severities.length === 1 && !frm.doc.severity) {
                        frm.set_value('severity', valid_severities[0]);
                        frm.events.update_occurrence_options(frm);
                    } else if (frm.doc.__islocal && frm.doc.severity && !valid_severities.includes(frm.doc.severity)) {
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

                    if (frm.doc.__islocal && valid_occurrences.length === 1 && !frm.doc.occurrence) {
                        frm.set_value('occurrence', valid_occurrences[0]);
                        frm.events.fetch_cmg_mapping(frm);
                    } else if (frm.doc.__islocal && frm.doc.occurrence && !valid_occurrences.includes(frm.doc.occurrence) && !valid_occurrences.includes('Any')) {
                        frm.set_value('occurrence', '');
                        frm.set_value('cmg_code', '');
                        frm.set_value('cmg_recommended_outcome', '');
                    } else if (frm.doc.occurrence && frm.doc.__islocal) {
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
                    if (frm.doc.cmg_code !== r.message.cmg_code) {
                        frm.set_value('cmg_code', r.message.cmg_code);
                    }
                    if (frm.doc.cmg_recommended_outcome !== r.message.cmg_recommended_outcome) {
                        frm.set_value('cmg_recommended_outcome', r.message.cmg_recommended_outcome);
                    }
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

    // Calculate and update TAT deadline based on CMG Code
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
        
        let current_tat = frm.doc.tat_deadline ? frappe.datetime.str_to_obj(frm.doc.tat_deadline).getTime() : null;
        let new_tat = frappe.datetime.str_to_obj(deadline).getTime();

        if (current_tat !== new_tat) {
            frm.set_value('tat_deadline', deadline);
        }
    },

    // Populate stage reviewers from backend and allow editing
    populate_stages: function(frm) {
        if (frm.doc.__islocal) {
            frm.events.auto_populate_stage_rows(frm);
            frappe.show_alert({message: __('Stages populated. You can edit stage reviewers and sequence.'), indicator: 'green'});
            return;
        }

        frappe.call({
            method: 'audit_management.audit_management.doctype.djp_case.djp_case.populate_djp_stages',
            args: {
                docname: frm.doc.name,
                cmg_code: frm.doc.cmg_code,
                emp_branch: frm.doc.emp_branch
            },
            freeze: true,
            freeze_message: __('Populating DJP stages...'),
            callback: function(r) {
                if (r.message) {
                    frm.reload_doc();
                    frappe.show_alert({message: __('Stages populated successfully. You can edit stage reviewers and sequence.'), indicator: 'green'});
                }
            }
        });
    },

    // Send case to all stage reviewers simultaneously
    send_to_all_reviewers: function(frm) {
        if (!frm.doc.djp_case_stages || frm.doc.djp_case_stages.length === 0) {
            frappe.msgprint(__('Please populate stages first using "Populate Stages" button.'));
            return;
        }

        frappe.confirm(__('Are you sure you want to send this case to ALL reviewers simultaneously? They will all share the same TAT deadline.'), function() {
            frappe.call({
                method: 'audit_management.audit_management.doctype.djp_case.djp_case.send_to_all_reviewers',
                args: { docname: frm.doc.name },
                freeze: true,
                freeze_message: __('Sending to all reviewers...'),
                callback: function(r) {
                    if (r.message && r.message.success) {
                        frappe.show_alert({message: r.message.message, indicator: 'green'});
                        frm.reload_doc();
                    }
                }
            });
        });
    },

    // Open escalation dialog and submit to next stage
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
                            frappe.show_alert({message: __('Case escalated to next stage'), indicator: 'orange'});
                        }
                    }
                });
            }
        });
        d.show();
    },

    // Open closure dialog with decision and justification
    close_case: function(frm) {
        const d = new frappe.ui.Dialog({
            title: __('Close Case'),
            fields: [
                {
                    fieldname: 'final_decision',
                    fieldtype: 'Select',
                    label: __('Final Decision / Outcome (Required)'),
                    options: frm.fields_dict.final_decision.df.options,
                    default: frm.doc.cmg_recommended_outcome || '',
                    reqd: 1
                },
                {
                    fieldname: 'justification',
                    fieldtype: 'Small Text',
                    label: __('Justification (Required)'),
                    reqd: 1
                },
                {
                    fieldname: 'governance_notes',
                    fieldtype: 'Small Text',
                    label: __('Governance Notes (Optional)')
                }
            ],
            primary_action_label: __('Close Case'),
            primary_action: function(values) {
                if (!values.final_decision || !values.justification) {
                    frappe.msgprint(__('Please fill out both Final Decision and Justification fields to close case'));
                    return;
                }

                frappe.call({
                    method: 'audit_management.audit_management.doctype.djp_case.djp_case.close_case',
                    args: {
                        docname: frm.doc.name,
                        final_decision: values.final_decision,
                        justification: values.justification,
                        governance_notes: values.governance_notes
                    },
                    freeze: true,
                    freeze_message: __('Closing DJP Case...'),
                    callback: function(r) {
                        if (!r.exc && r.message) {
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

    // Prompt for remark and send case back to creator
    send_back_case: function(frm) {
        frappe.prompt(
            [
                {
                    fieldname: 'remark',
                    fieldtype: 'Small Text',
                    label: __('Send Back Remark (Required)'),
                    reqd: 1
                }
            ],
            function(values) {
                frappe.call({
                    method: 'audit_management.audit_management.doctype.djp_case.djp_case.send_back_case',
                    args: {
                        docname: frm.doc.name,
                        remark: values.remark
                    },
                    freeze: true,
                    freeze_message: __('Sending back case...'),
                    callback: function(r) {
                        if (!r.exc && r.message) {
                            frappe.show_alert({
                                message: r.message.message || __('Case sent back successfully!'),
                                indicator: 'orange'
                            });
                            frm.reload_doc();
                        }
                    }
                });
            },
            __('Send Back to Creator'),
            __('Send Back')
        );
    },

    // Submit stage review response with supporting attachments
    submit_stage_response: function(frm) {
        let uploaded_files = []; // Array of { name: '...', url: '...' }

        const d = new frappe.ui.Dialog({
            title: __('Submit Review Response'),
            fields: [
                {
                    fieldname: 'response',
                    fieldtype: 'Small Text',
                    label: __('Review Response / Remarks (Required)'),
                    reqd: 1
                },
                {
                    fieldname: 'upload_section',
                    fieldtype: 'HTML',
                    label: __('Upload Attachments')
                }
            ],
            primary_action_label: __('Submit Response'),
            primary_action: function(values) {
                let attachment_urls = uploaded_files.map(f => f.url).join(', ');

                frappe.call({
                    method: 'audit_management.audit_management.doctype.djp_case.djp_case.submit_stage_response',
                    args: {
                        docname: frm.doc.name,
                        response: values.response,
                        attachment: attachment_urls
                    },
                    freeze: true,
                    freeze_message: __('Submitting stage review response...'),
                    callback: function(r) {
                        if (!r.exc && r.message) {
                            d.hide();
                            frappe.show_alert({
                                message: r.message.message || __('Response submitted successfully!'),
                                indicator: 'green'
                            });
                            frm.reload_doc();
                        }
                    }
                });
            }
        });

        d.show();

        // Render multi-file public uploader
        let $upload_wrapper = d.get_field('upload_section').$wrapper;

        function render_file_list() {
            let list_html = '';
            if (uploaded_files.length === 0) {
                list_html = '<span style="font-size: 11px; color: #64748b;">No files attached</span>';
            } else {
                list_html = uploaded_files.map((f, i) => `
                    <div style="display: inline-flex; align-items: center; gap: 6px; background: #ffffff; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 4px; font-size: 11px; margin-top: 4px;">
                        <i class="fa fa-paperclip" style="color: #2563eb;"></i>
                        <a href="${f.url}" target="_blank" style="color: #0f172a; text-decoration: none; font-weight: 600;">${f.name}</a>
                        <i class="fa fa-times text-danger djp-remove-file" data-idx="${i}" style="cursor: pointer; margin-left: 4px;" title="Remove"></i>
                    </div>
                `).join(' ');
            }
            $upload_wrapper.find('#djp_file_list_container').html(list_html);
        }

        $upload_wrapper.html(`
            <div style="margin-top: 10px; padding: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">
                <label style="font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; display: block;">Upload Supporting Documents (Multiple Allowed)</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="file" id="djp_direct_file_input" multiple style="display: none;">
                    <button type="button" class="btn btn-default btn-xs" id="djp_btn_select_file" style="font-weight: 600; background: #ffffff; border: 1px solid #cbd5e1;">
                        <i class="fa fa-plus mr-1" style="color: #2563eb;"></i> Attach Files
                    </button>
                    <span id="djp_upload_status" style="font-size: 11px; color: #64748b;"></span>
                </div>
                <div id="djp_file_list_container" style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px;"></div>
            </div>
        `);

        render_file_list();

        $upload_wrapper.find('#djp_btn_select_file').on('click', function() {
            $upload_wrapper.find('#djp_direct_file_input').click();
        });

        $upload_wrapper.find('#djp_file_list_container').on('click', '.djp-remove-file', function() {
            let idx = $(this).data('idx');
            uploaded_files.splice(idx, 1);
            render_file_list();
        });

        $upload_wrapper.find('#djp_direct_file_input').on('change', function(e) {
            let files = Array.from(e.target.files);
            if (files.length === 0) return;

            let remaining = files.length;
            $upload_wrapper.find('#djp_upload_status').html('<span style="color: #2563eb;"><i class="fa fa-spinner fa-spin mr-1"></i> Uploading ' + files.length + ' file(s)...</span>');

            files.forEach(file => {
                let formdata = new FormData();
                formdata.append('file', file, file.name);
                formdata.append('doctype', frm.doc.doctype);
                formdata.append('docname', frm.doc.name);
                formdata.append('is_private', 0); // FORCE PUBLIC FILE UPLOAD!

                $.ajax({
                    url: '/api/method/upload_file',
                    type: 'POST',
                    data: formdata,
                    contentType: false,
                    processData: false,
                    headers: {
                        'X-Frappe-CSRF-Token': frappe.csrf_token
                    },
                    success: function(r) {
                        if (r.message && r.message.file_url) {
                            uploaded_files.push({ name: file.name, url: r.message.file_url });
                        }
                    },
                    complete: function() {
                        remaining--;
                        if (remaining <= 0) {
                            $upload_wrapper.find('#djp_upload_status').html('<span style="color: #16a34a; font-weight: 600;"><i class="fa fa-check-circle mr-1"></i> Uploaded!</span>');
                            render_file_list();
                            setTimeout(() => { $upload_wrapper.find('#djp_upload_status').empty(); }, 2000);
                        }
                    }
                });
            });
        });
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

        let hasAnySentStage = stages.some(s => s.status && s.status !== 'Not Sent');
        let currentBadgeHtml = '';
        if (hasAnySentStage && frm.doc.status !== 'Draft') {
            currentBadgeHtml = `<span class="badge badge-info" style="font-size: 10px; font-weight: 600;">Current Stage: ${frm.doc.current_dc_level || 'Stage ' + current_stage}</span>`;
        }

        let html = '<div class="djp-stage-tracker-container">';
        html += '<div class="djp-tracker-header">';
        html += '<span><i class="fa fa-tasks mr-1"></i> Stage Tracker</span>';
        html += currentBadgeHtml;
        html += '</div>';

        html += '<div class="djp-tracker-flow">';

        stages.forEach((stg, idx) => {
            const isLast = idx === stages.length - 1;
            const isCurrent = (stg.stage === current_stage) && frm.doc.status !== 'Closed' && frm.doc.status !== 'Cessation';
            
            let isOverdue = false;
            if (stg.tat_deadline && stg.status === 'Pending') {
                const deadline = frappe.datetime.str_to_obj(stg.tat_deadline);
                if (deadline < new Date()) {
                    isOverdue = true;
                }
            }

            let pillClass = '';
            let connClass = '';
            let statusText = stg.status || 'Not Sent';
            let statusTextClass = 'djp-status-pending';

            if (stg.status === 'Responded') {
                pillClass = 'djp-pill-responded';
                connClass = 'djp-conn-completed';
                statusText = '✓ Responded';
                statusTextClass = 'djp-status-responded';
            } else if (stg.status === 'No Responded') {
                pillClass = 'djp-pill-escalated';
                connClass = 'djp-conn-escalated';
                statusText = '⨂ No Responded';
                statusTextClass = 'djp-status-escalated';
            } else if (stg.status === 'Overdue' || isOverdue) {
                pillClass = 'djp-pill-overdue';
                statusText = '⚠ Overdue';
                statusTextClass = 'djp-status-overdue';
            } else if (stg.status === 'Pending') {
                pillClass = 'djp-pill-active';
                statusText = '⚡ Pending (Under Review)';
                statusTextClass = 'djp-status-active';
            } else if (stg.status === 'Skipped') {
                pillClass = 'djp-pill-skipped';
                statusText = 'Skipped';
                statusTextClass = 'djp-status-skipped';
            } else {
                statusText = 'Not Sent';
                statusTextClass = 'djp-status-pending';
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
                    } else if (stg.status === 'No Responded') {
                        remainingDaysInfo = '⨂ No Response in TAT';
                    } else if (diffDays < 0 || stg.status === 'Overdue' || isOverdue) {
                        remainingDaysInfo = `⚠ Overdue (${Math.abs(diffDays)}d ago)`;
                    } else if (diffDays === 0) {
                        remainingDaysInfo = '⏳ Due Today';
                    } else if (stg.status === 'Pending') {
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
            
            let respInfo = stg.response ? `<div style="margin-top:4px; border-top:1px solid #334155; padding-top:4px; color:#38bdf8;"><strong>Response:</strong> ${stg.response}</div>` : '';
            let attachInfo = '';
            if (stg.attachment) {
                let links = stg.attachment.split(',').map(url => url.trim()).filter(Boolean);
                let linkHtml = links.map((url, i) => {
                    let filename = url.split('/').pop();
                    return `<a href="${url}" target="_blank" style="color:#a7f3d0; text-decoration:underline;"><i class="fa fa-paperclip"></i> ${filename}</a>`;
                }).join(', ');
                attachInfo = `<div style="margin-top:2px; color:#a7f3d0;"><strong>Attachments (${links.length}):</strong> ${linkHtml}</div>`;
            }

            // Hover Tooltip (Floating Outside)
            html += `<div class="djp-tooltip">`;
            html += `<div style="font-weight:700; color:#38bdf8; margin-bottom:2px;">${stg.dc_level || stg.stage_name}</div>`;
            html += `<div><strong>Assigned To:</strong> ${empName}${empDesig}</div>`;
            html += `<div><strong>Status:</strong> ${stg.status || 'Not Sent'}</div>`;
            html += `<div><strong>Sent On:</strong> ${sentOn}</div>`;
            html += `<div><strong>TAT:</strong> ${tatDays} Days (Deadline: ${formattedTat})</div>`;
            html += respInfo;
            html += attachInfo;
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
    // Sync DC Level with selected stage name
    stage_name: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        if (row.stage_name) {
            frappe.db.get_doc('DJP Stage', row.stage_name).then(doc => {
                frappe.model.set_value(cdt, cdn, 'dc_level', doc.dc_level);
            });
        }
    }
});

frappe.ui.form.on('DJP Additional Accused', {
    // Sync main employee field with first additional accused employee
    employee: function(frm, cdt, cdn) {
        if (frm.doc.is_multiple_accused && frm.doc.additional_accused_employees && frm.doc.additional_accused_employees.length > 0) {
            frm.set_value('employee', frm.doc.additional_accused_employees[0].employee);
        }
    }
});
