frappe.pages['audit_management_dashboard'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Audit Management Dashboard',
		single_column: true
	});

	// CSS Injection
	const style = document.createElement('style');
	style.innerHTML = `
		.audit-dashboard-light { background: #f1f5f9; color: #1e293b; padding: 20px; border-radius: 16px; font-family: 'Inter', sans-serif; border: 1px solid #e2e8f0; }
		.db-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: nowrap; gap: 15px; }
		.title-wrap { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
		.db-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; white-space: nowrap; }
		.live-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px rgba(34, 197, 94, 0.4); }

		.master-capsule-container { display: flex; gap: 6px; flex-wrap: nowrap; align-items: center; justify-content: flex-end; flex-grow: 1; }
		.master-capsule { background: #ffffff; padding: 4px 10px; border-radius: 50px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 30px; box-sizing: border-box; }
		.master-capsule:hover { border-color: #3b82f6; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
		.master-capsule i { font-size: 13px; flex-shrink: 0; }
		.master-capsule span { font-size: 10px; font-weight: 700; color: #475569; white-space: nowrap; }
		.label-text { min-width: 40px; text-align: center; }

		.create-btn-capsule { background: #2563eb !important; color: white !important; border: none !important; }
		.create-btn-capsule i, .create-btn-capsule span { color: white !important; }
		.create-btn-capsule:hover { background: #1d4ed8 !important; transform: scale(1.02); }

		.dropdown-wrapper { position: relative; }
		.custom-dropdown { position: absolute; top: 110%; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 1000; min-width: 180px; padding: 8px 0; }
		.dropdown-item { padding: 10px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.2s; font-size: 12px; font-weight: 600; color: #475569; }
		.dropdown-item:hover { background: #f1f5f9; color: #1e293b; }

		.grid-compact { display: grid; gap: 10px; margin-bottom: 24px; }
		.stats-grid { grid-template-columns: repeat(6, 1fr); }

		.blue-txt { color: #2563eb; } .purple-txt { color: #7c3aed; } .orange-txt { color: #ea580c; } .green-txt { color: #16a34a; } .red-txt { color: #dc2626; }

		.compact-stat-card { background: #ffffff; padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; cursor: pointer; transition: 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: row; align-items: center; gap: 8px; min-width: 140px; flex-wrap: nowrap; }
		.stat-label-small { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap; flex-shrink: 0; }
		.stat-val-small { font-size: 18px; font-weight: 800; color: #0f172a; margin-left: auto; flex-shrink: 0; }
		.icon-stat { font-size: 13px; opacity: 0.9; flex-shrink: 0; }
		.accent-bar { position: absolute; bottom: 0; left: 0; height: 4px; width: 100%; }
		.blue-bg { background: #3b82f6; } .green-bg { background: #10b981; } .purple-bg { background: #8b5cf6; } .orange-bg { background: #f59e0b; } .red-bg { background: #ef4444; }

		.multiselect-container { position: relative; }
		.multiselect-list { position: absolute; top: 110%; left: 0; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 1000; min-width: 160px; padding: 8px 0; display: none; }
		.multiselect-item { padding: 8px 16px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; font-size: 12px; font-weight: 600; color: #475569; }
		.multiselect-item:hover { background: #f1f5f9; }
		.multiselect-item input[type='checkbox'] { cursor: pointer; width: 14px; height: 14px; }

		.mini-table { width: 100%; border-collapse: collapse; font-size: 12px; }
		.mini-table th { background: #f1f5f9; color: #475569; text-align: left; padding: 12px 12px; border-bottom: 2px solid #e2e8f0; font-weight: 700; text-transform: uppercase; font-size: 10px; }
		.mini-table td { padding: 14px 16px; color: #334155; border-bottom: 1px solid #f1f5f9; }
		.mini-table tr:hover { background: #f9fafb; cursor: pointer; }
		.t-id { font-weight: 800; color: #2563eb; }
		.t-status { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; color: #475569; font-weight: 700; font-size: 10px; }
		.t-status.pending { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
		.t-status.closed { background: #b9f9cf; color: #001a00; border: 1px solid #bbf7d0; }
		.t-risk { font-weight: 800; text-transform: uppercase; font-size: 10px; }
		.t-risk.high { background: #dc2626; color: white; padding: 4px 8px; border-radius: 6px; } .t-risk.medium { color: #d97706; } .t-risk.normal { color: #2563eb; }

		.load-more-btn { background: #ffffff; color: #475569; border: 1px solid #e2e8f0; padding: 8px 24px; border-radius: 50px; cursor: pointer; font-size: 11px; font-weight: 800; transition: 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); letter-spacing: 0.5px; text-transform: uppercase; }
		.load-more-btn:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
		.load-more-btn:active { transform: translateY(0); box-shadow: none; background: #f1f5f9; }

		@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
		@media (max-width: 768px) { .db-header { flex-direction: column; align-items: flex-start; } .master-capsule-container { width: 100%; justify-content: flex-start; flex-wrap: wrap; } .stats-grid { grid-template-columns: 1fr; } }
		.compact-stat-card.active-card { border-color: #2563eb; background: #eff6ff; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1); }

		.drilldown-bar { background: #ffffff; padding: 15px; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
		.filter-group { margin-bottom: 12px; }
		.filter-group-label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
		.checkbox-row { display: flex; flex-wrap: wrap; gap: 15px; }
		.check-item { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: #475569; cursor: pointer; }
	`;
	document.head.appendChild(style);

	// HTML Injection
	page.main.html(`
<div class='audit-dashboard-light'>
	<div class='db-header'>
		<div class='title-wrap'>
			<h2 class='db-title'>Audit Management</h2>
			<div class='live-dot'></div>
		</div>
		<div class='master-capsule-container'>
			<div class='multiselect-container'><div class='master-capsule filter-capsule' id='status-filter-btn'><i class='fa fa-filter blue-txt'></i> <span id='selected-status-label' class='label-text'>Status</span> <i class='fa fa-chevron-down' style='font-size: 8px; margin-left: 3px;'></i></div><div id='filter-dropdown-status' class='multiselect-list'></div></div>
			<div class='multiselect-container'><div class='master-capsule filter-capsule' id='risk-filter-btn'><i class='fa fa-shield purple-txt'></i> <span id='selected-risk-label' class='label-text'>Risk</span> <i class='fa fa-chevron-down' style='font-size: 8px; margin-left: 3px;'></i></div><div id='filter-dropdown-risk' class='multiselect-list'></div></div>
			<div id='clear-filter-btn' class='master-capsule' style='display:none; border-color: #fecaca; background: #fee2e2; padding: 4px 10px;'><i class='fa fa-times-circle red-txt' style='font-size: 12px;'></i> <span class='red-txt' style='font-size: 10px;'>Clear</span></div>
			<div class='dropdown-wrapper'><div class='master-capsule' id='actions-btn'><i class='fa fa-th-list blue-txt'></i> <span>Actions</span> <i class='fa fa-chevron-down' style='font-size: 8px; margin-left: 5px;'></i></div><div id='actions-dropdown' class='custom-dropdown' style='display:none;'><div class='dropdown-item' id='btn-audit-levels'><i class='fa fa-sitemap blue-txt'></i> <span>Audit Levels</span></div><div class='dropdown-item' id='btn-query-types'><i class='fa fa-list-ul purple-txt'></i> <span>Query Types</span></div><div class='dropdown-item' id='btn-settings'><i class='fa fa-cog orange-txt'></i> <span>Settings</span></div><div class='dropdown-item' id='btn-show-reports'><i class='fa fa-bar-chart green-txt'></i> <span>Reports</span></div></div></div>
			<div id='stage-report-btn' class='master-capsule' style='display:none; border-color: #16a34a;'><i class='fa fa-bar-chart' style='color: #16a34a;'></i> <span style='color: #16a34a;'>Reports</span></div>
			<div class='master-capsule create-btn-capsule' id='btn-create-audit'><i class='fa fa-plus-circle'></i> <span>Create Audit</span></div>
		</div>
	</div>
	<div class='grid-compact stats-grid'>
		<div class='compact-stat-card' id='total-card'><i class='fa fa-database icon-stat blue-txt'></i> <div class='stat-label-small'>Total Records</div> <div class='stat-val-small' id='val-total'>-</div> <div class='accent-bar blue-bg'></div></div>
		<div class='compact-stat-card' id='draft-card'><i class='fa fa-file-text-o icon-stat purple-txt'></i> <div class='stat-label-small'>Draft</div> <div class='stat-val-small' id='val-draft'>-</div> <div class='accent-bar purple-bg'></div></div>
		<div class='compact-stat-card' id='p-card'><i class='fa fa-clock-o icon-stat red-txt'></i> <div class='stat-label-small' id='lbl-pending'>Pending</div> <div class='stat-val-small' id='val-pending'>-</div> <div class='accent-bar red-bg'></div></div>
		<div class='compact-stat-card' id='c-card'><i class='fa fa-check-square-o icon-stat green-txt'></i> <div class='stat-label-small' id='lbl-closed'>Closed</div> <div class='stat-val-small' id='val-closed'>-</div> <div class='accent-bar green-bg'></div></div>
		<div class='compact-stat-card' id='resp-card' style='display:none;'><i class='fa fa-reply icon-stat green-txt'></i> <div class='stat-label-small'>Responded</div> <div class='stat-val-small' id='val-resp'>-</div> <div class='accent-bar green-bg'></div></div>
		<div class='compact-stat-card' id='nr-card' style='display:none;'><i class='fa fa-exclamation-circle icon-stat orange-txt'></i> <div class='stat-label-small'>Not Responded</div> <div class='stat-val-small' id='val-nr'>-</div> <div class='accent-bar orange-bg'></div></div>
	</div>
	<div id='drilldown-section' class='drilldown-bar' style='display:none;'><div class='filter-group'><div class='filter-group-label'>Filter by Stage:</div><div id='stage-checkbox-list' class='checkbox-row'></div></div><div class='filter-group'><div class='filter-group-label'>Filter by Time:</div><div class='checkbox-row'><label class='check-item'><input type='checkbox' class='time-checkbox' value='Today'> Today <span id='count-today'></span></label><label class='check-item'><input type='checkbox' class='time-checkbox' value='Yesterday'> Yesterday <span id='count-yest'></span></label><label class='check-item'><input type='checkbox' class='time-checkbox' value='Last Week'> Last Week <span id='count-week'></span></label><label class='check-item'><input type='checkbox' class='time-checkbox' value='All Time'> All Time <span id='count-all'></span></label></div></div></div>
	<div id='stage-view' class='list-section' style='display:none;'><div class='list-header' style='font-weight:800; padding:10px 0; font-size:14px;'>Attention Required</div><div class='table-light-wrap' style='background:white; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden;'><table class='mini-table'><thead><tr><th>Sr. No.</th><th>ID</th><th>Branch</th><th>Subject</th><th>Division</th><th>Status</th><th>Risk</th><th>Pending Days</th><th>Creation Date</th><th>Ago</th></tr></thead><tbody id='stage-items'></tbody></table></div><div id='pending-more-btn' style='display:none; justify-content: center; padding: 20px 10px;'><button class='load-more-btn' id='load-more-p-btn'>Load More</button></div></div>
	<div id='manager-view' class='list-section' style='display:none;'><div class='list-header' style='font-weight:800; padding:10px 0; font-size:14px;'>Latest Activity</div><div class='table-light-wrap' style='background:white; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden;'><table class='mini-table'><thead><tr><th>Sr. No.</th><th>ID</th><th>Branch</th><th>Subject</th><th>Division</th><th>Status</th><th>Risk</th><th>Pending Days</th><th>Creation Date</th><th>Ago</th></tr></thead><tbody id='activity-body'></tbody></table></div><div id='recent-more-btn' style='display:none; justify-content: center; padding: 20px 10px;'><button class='load-more-btn' id='load-more-r-btn'>Load More</button></div></div>
</div>
	`);

	// --- LOGIC ---
	const $w = $(wrapper);
	let userRole = '';
	let currentStatusFilter = [];
	let currentRiskFilter = [];
	let pendingStart = 0;
	let recentStart = 0;
	let currentItemStages = [];
	let currentTimeFilter = [];

	const upd = (id, val) => { const $el = $w.find('#' + id); if ($el.length) $el.text(val ?? 0); };

	const renderRows = (list) => {
		return list.map(i => `
			<tr onclick="frappe.set_route('Form', 'My Audits', '${i.name}')">
				<td>${i.sr_no}</td>
				<td><span class='t-id'>${i.name.split('-').pop()}</span></td>
				<td>${i.emp_branch || '---'}</td>
				<td>${i.audit_query_subject_box || '---'}</td>
				<td>${i.emp_division || '---'}</td>
				<td><span class='t-status ${i.status === 'Pending' ? 'pending' : (i.status === 'Closed' ? 'closed' : '')}'>${i.status || '---'}</span></td>
				<td><span class='t-risk ${(i.risk || 'Normal').toLowerCase()}'>${i.risk || 'Normal'}</span></td>
				<td>${i.aging || 0}</td>
				<td>${frappe.datetime.str_to_user(i.creation).split(' ')[0]}</td><td>${frappe.datetime.comment_when(i.creation)}</td>
			</tr>`).join('');
	};

	const refresh = () => {
		pendingStart = 0; recentStart = 0;
		frappe.call({
			method: 'audit_management.audit_management.dashboard.get_dashboard_stats',
			args: { pending_start: 0, recent_start: 0, status: currentStatusFilter.join(','), risk: currentRiskFilter.join(','), item_stages: currentItemStages.join(','), time_filter: currentTimeFilter.join(',') },
			callback: function (r) {
				if (!r.message || !r.message.success) return;
				const d = r.message; userRole = d.role_type;
				
				const $sDD = $w.find('#filter-dropdown-status');
				const $rDD = $w.find('#filter-dropdown-risk');
				if ($sDD.is(':empty')) {
					const sOps = userRole === 'stage_user' ? ['Pending', 'Responded', 'No Response'] : ['Draft', 'Pending', 'Closed'];
					$sDD.html(sOps.map(o => `<div class='multiselect-item' onclick='event.stopPropagation()'><input type='checkbox' class='status-checkbox' value='${o}'><span>${o}</span></div>`).join(''));
					const rOps = ['High', 'Medium', 'Normal'];
					$rDD.html(rOps.map(o => `<div class='multiselect-item' onclick='event.stopPropagation()'><input type='checkbox' class='risk-checkbox' value='${o}'><span>${o}</span></div>`).join(''));
				}

				const is_stage = userRole === 'stage_user';
				$w.find('#draft-card, #total-card, #resp-card').toggle(!is_stage).css('display', !is_stage ? 'flex' : 'none');
				$w.find('#nr-card').show().css('display', 'flex');
				
				if (is_stage) {
					upd('val-pending', d.pending_for_me); $w.find('#lbl-pending').text('Pending Me');
					upd('val-nr', d.not_responded_count);
					upd('val-closed', d.responded_by_me); $w.find('#lbl-closed').text('Responded');
				} else {
					upd('val-draft', d.draft_count); upd('val-total', d.total_count);
					upd('val-pending', d.total_pending); $w.find('#lbl-pending').text('Total Pending');
					upd('val-closed', d.closed_count); $w.find('#lbl-closed').text('Closed');
					upd('val-nr', d.not_responded_count); upd('val-resp', d.responded_by_me);
				}

				$w.find('.compact-stat-card').removeClass('active-card');
				if (currentStatusFilter.length > 0) {
					const s = currentStatusFilter[0];
					if (s === 'Draft') $w.find('#draft-card').addClass('active-card');
					else if (s === 'Pending') $w.find('#p-card').addClass('active-card');
					else if (s === 'Closed') $w.find('#c-card').addClass('active-card');
					else if (s === 'Responded') $w.find('#resp-card').addClass('active-card');
					else if (s === 'No Response') $w.find('#nr-card').addClass('active-card');
				} else if (currentRiskFilter.length === 0) { $w.find('#total-card').addClass('active-card'); }

				const showD = (currentStatusFilter.includes('Responded') || currentStatusFilter.includes('No Response'));
				$w.find('#drilldown-section').toggle(showD);
				if (showD) {
					const $sL = $w.find('#stage-checkbox-list');
					if ($sL.is(':empty')) {
						frappe.call({ method: 'frappe.client.get_list', args: { doctype: 'Audit Stage', fields: ['name'], order_by: 'name asc' }, callback: (res) => {
							if (res.message) {
								const counts = d.stage_counts || {};
								$sL.html(res.message.map(s => `<label class='check-item'><input type='checkbox' class='stage-item-checkbox' value='${s.name}'> ${s.name} (${counts[s.name] || 0})</label>`).join(''));
							}
						}});
					}
				}

				$w.find('#stage-view').toggle(is_stage); $w.find('#manager-view').toggle(!is_stage);
				const items = is_stage ? d.pending_list : d.recent_list;
				const $b = $w.find(is_stage ? '#stage-items' : '#activity-body');
				const $m = $w.find(is_stage ? '#pending-more-btn' : '#recent-more-btn');
				const hasM = is_stage ? d.has_more_pending : d.has_more_recent;
				if (items && items.length > 0) { $b.html(renderRows(items)); $m.toggle(!!hasM).css('display', hasM ? 'flex' : 'none'); }
				else { $b.html('<tr><td colspan="10" style="text-align:center; padding: 20px; color: #64748b;">No records found</td></tr>'); $m.hide(); }
			}
		});
	};

	const load_more = (type) => {
		const is_p = type === 'pending';
		frappe.call({
			method: 'audit_management.audit_management.dashboard.get_dashboard_stats',
			args: { pending_start: is_p ? pendingStart + 10 : pendingStart, recent_start: !is_p ? recentStart + 10 : recentStart, status: currentStatusFilter.join(','), risk: currentRiskFilter.join(','), item_stages: currentItemStages.join(','), time_filter: currentTimeFilter.join(',') },
			callback: function (r) {
				if (!r.message || !r.message.success) return;
				const d = r.message;
				if (is_p) { pendingStart += 10; $w.find('#stage-items').append(renderRows(d.pending_list)); $w.find('#pending-more-btn').toggle(!!d.has_more_pending).css('display', d.has_more_pending ? 'flex' : 'none'); }
				else { recentStart += 10; $w.find('#activity-body').append(renderRows(d.recent_list)); $w.find('#recent-more-btn').toggle(!!d.has_more_recent).css('display', d.has_more_recent ? 'flex' : 'none'); }
			}
		});
	};

	// --- BIND EVENTS ---
	$w.on('click', '#status-filter-btn', (e) => { e.stopPropagation(); $w.find('.multiselect-list').not('#filter-dropdown-status').hide(); $w.find('#filter-dropdown-status').toggle(); });
	$w.on('click', '#risk-filter-btn', (e) => { e.stopPropagation(); $w.find('.multiselect-list').not('#filter-dropdown-risk').hide(); $w.find('#filter-dropdown-risk').toggle(); });
	$w.on('click', '#actions-btn', (e) => { e.stopPropagation(); $w.find('#actions-dropdown').toggle(); });
	$w.on('click', '#clear-filter-btn', () => { $w.find('input[type=checkbox]').prop('checked', false); currentStatusFilter = []; currentRiskFilter = []; currentItemStages = []; currentTimeFilter = []; $w.find('#selected-status-label').text('Status'); $w.find('#selected-risk-label').text('Risk'); $w.find('#clear-filter-btn').hide(); refresh(); });
	
	$w.on('change', '.status-checkbox', function() {
		currentStatusFilter = $w.find('.status-checkbox:checked').map((i, el) => $(el).val()).get();
		$w.find('#selected-status-label').text(currentStatusFilter.length === 0 ? 'Status' : (currentStatusFilter.length === 1 ? currentStatusFilter[0] : currentStatusFilter.length + ' Selected'));
		$w.find('#clear-filter-btn').show(); refresh();
	});

	$w.on('change', '.risk-checkbox', function() {
		currentRiskFilter = $w.find('.risk-checkbox:checked').map((i, el) => $(el).val()).get();
		$w.find('#selected-risk-label').text(currentRiskFilter.length === 0 ? 'Risk' : (currentRiskFilter.length === 1 ? currentRiskFilter[0] : currentRiskFilter.length + ' Selected'));
		$w.find('#clear-filter-btn').show(); refresh();
	});

	$w.on('change', '.time-checkbox', () => { currentTimeFilter = $w.find('.time-checkbox:checked').map((i, el) => $(el).val()).get(); refresh(); });
	$w.on('change', '.stage-item-checkbox', () => { currentItemStages = $w.find('.stage-item-checkbox:checked').map((i, el) => $(el).val()).get(); refresh(); });

	$w.on('click', '#total-card', () => { currentStatusFilter = []; currentRiskFilter = []; refresh(); });
	$w.on('click', '#draft-card', () => { currentStatusFilter = ['Draft']; refresh(); });
	$w.on('click', '#p-card', () => { currentStatusFilter = ['Pending']; refresh(); });
	$w.on('click', '#c-card', () => { currentStatusFilter = ['Closed']; refresh(); });
	$w.on('click', '#resp-card', () => { currentStatusFilter = ['Responded']; refresh(); });
	$w.on('click', '#nr-card', () => { currentStatusFilter = ['No Response']; refresh(); });

	$w.on('click', '#load-more-p-btn', () => load_more('pending'));
	$w.on('click', '#load-more-r-btn', () => load_more('recent'));

	$w.on('click', '#btn-audit-levels', () => frappe.set_route('List', 'Audit Level'));
	$w.on('click', '#btn-query-types', () => frappe.set_route('List', 'Audit Query Type'));
	$w.on('click', '#btn-settings', () => frappe.set_route('Form', 'Audit Management Settings'));
	$w.on('click', '#btn-create-audit', () => frappe.new_doc('My Audits'));
	$w.on('click', '#btn-show-reports', () => {
		const reports = ['My Audits Report', 'Pending Audit Queries Aging Report', 'Process Technical Improvement Commitment Report', 'Recurring Operational Reports'];
		let html = `<div style="display: flex; flex-direction: column; gap: 10px; padding: 10px;">${reports.map(r => `<button class="btn btn-default btn-sm text-left" onclick="frappe.set_route('query-report', '${r}'); cur_dialog.hide();" style="text-align: left; padding: 10px 15px; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 600; color: #475569; background: white;"><i class="fa fa-file-text-o" style="margin-right: 10px; color: #16a34a;"></i> ${r}</button>`).join('')}</div>`;
		new frappe.ui.Dialog({ title: 'Select Report', fields: [{ fieldtype: 'HTML', fieldname: 'reports_html', options: html }] }).show();
	});

	$(document).on('click', () => { $w.find('.custom-dropdown, .multiselect-list').hide(); });

	refresh();
};
