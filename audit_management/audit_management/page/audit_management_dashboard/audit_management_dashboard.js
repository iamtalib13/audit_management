frappe.pages['audit_management_dashboard'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Audit Management',
		single_column: true
	});

	// CSS Injection
	const style = document.createElement('style');
	style.innerHTML = `
		.audit-dashboard-gmail { display: flex; gap: 20px; background: #f6f8fc; min-height: 100vh; padding: 10px; font-family: 'Inter', sans-serif; }
		
		/* Sidebar Styling */
		.db-sidebar { width: 260px; display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
		.btn-compose-wrap { padding: 8px 0 16px 0; }
		.btn-create-audit { background: #c2e7ff; color: #001d35; padding: 16px 24px; border-radius: 16px; display: flex; align-items: center; gap: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; font-size: 14px; width: fit-content; }
		.btn-create-audit:hover { box-shadow: 0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15); background: #d3e3fd; }
		.btn-create-audit i { font-size: 18px; }

		.nav-item { display: flex; align-items: center; padding: 0 16px 0 24px; height: 36px; border-radius: 0 20px 20px 0; cursor: pointer; color: #444746; font-size: 14px; transition: 0.1s; position: relative; margin-right: 12px; }
		.nav-item:hover { background-color: #eaebef; }
		.nav-item.active { background-color: #d3e3fd; color: #001d35; font-weight: 700; }
		.nav-item i { width: 20px; margin-right: 18px; font-size: 16px; text-align: center; opacity: 0.8; }
		.nav-count { margin-left: auto; font-size: 12px; opacity: 0.8; }
		.nav-item.active .nav-count { opacity: 1; }

		/* Main Content Area */
		.db-main-content { flex-grow: 1; background: #ffffff; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
		.db-inner-header { padding: 12px 16px; border-bottom: 1px solid #f1f3f4; display: flex; align-items: center; justify-content: space-between; background: #fff; position: sticky; top: 0; z-index: 10; }
		.filter-section { display: flex; gap: 8px; align-items: center; }

		.master-capsule { background: #ffffff; padding: 4px 12px; border-radius: 50px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s; height: 32px; box-sizing: border-box; font-size: 12px; font-weight: 600; color: #444746; }
		.master-capsule:hover { border-color: #0b57d0; background: #f8f9fa; }
		.blue-txt { color: #0b57d0; } .purple-txt { color: #7c3aed; } .orange-txt { color: #ea580c; } .green-txt { color: #16a34a; } .red-txt { color: #d93025; }
		
		.multiselect-list { position: absolute; top: 110%; left: 0; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 1000; min-width: 180px; padding: 8px 0; display: none; }
		.multiselect-item { padding: 8px 16px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; font-size: 13px; color: #444746; }
		.multiselect-item:hover { background: #f1f5f9; }
		.multiselect-item input { cursor: pointer; }

		/* Table Styling */
		.list-container { padding: 0; overflow-y: auto; flex-grow: 1; }
		.list-header-text { padding: 16px 20px; font-size: 15px; font-weight: 700; color: #1f1f1f; border-bottom: 1px solid #f1f3f4; background: #fff; }
		
		.mini-table { width: 100%; border-collapse: collapse; font-size: 13px; }
		.mini-table th { text-align: left; padding: 12px 16px; border-bottom: 1px solid #f1f3f4; color: #444746; font-weight: 600; background: #fafafa; white-space: nowrap; }
		.mini-table td { padding: 12px 16px; border-bottom: 1px solid #f1f3f4; color: #1f1f1f; vertical-align: middle; }
		.mini-table tr:hover { background: #f2f6fc; box-shadow: inset 1px 0 0 #0b57d0; cursor: pointer; }
		
		.t-id { font-weight: 700; color: #0b57d0; }
		.t-status { padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
		.t-status.pending { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
		.t-status.closed { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
		
		.load-more-btn { background: #fff; border: 1px solid #dadce0; color: #0b57d0; padding: 10px 24px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 600; margin: 24px auto; display: block; transition: 0.2s; }
		.load-more-btn:hover { background: #f8f9fa; border-color: #0b57d0; }

		.drilldown-bar { background: #f8f9fa; padding: 16px 24px; border-bottom: 1px solid #f1f3f4; }
		.filter-group-label { font-size: 11px; font-weight: 700; color: #5f6368; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px; }
		.checkbox-row { display: flex; flex-wrap: wrap; gap: 16px; }
		.check-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #3c4043; cursor: pointer; font-weight: 500; }

		@media (max-width: 992px) {
			.audit-dashboard-gmail { flex-direction: column; }
			.db-sidebar { width: 100%; }
			.nav-item { border-radius: 20px; margin-right: 0; }
		}
	`;
	document.head.appendChild(style);

	// HTML Structure
	page.main.html(`
<div class='audit-dashboard-gmail'>
	<div class='db-sidebar'>
		<div class='btn-compose-wrap'>
			<button class='btn-create-audit' id='btn-create-audit'>
				<i class='fa fa-plus'></i>
				<span>Create Audit</span>
			</button>
		</div>

		<div class='nav-item active' id='nav-total'>
			<i class='fa fa-inbox blue-txt'></i>
			<span>All Records</span>
			<span class='nav-count' id='val-total'>0</span>
		</div>
		<div class='nav-item' id='nav-draft'>
			<i class='fa fa-file-text-o purple-txt'></i>
			<span>Draft</span>
			<span class='nav-count' id='val-draft'>0</span>
		</div>
		<div class='nav-item' id='nav-pending'>
			<i class='fa fa-clock-o red-txt'></i>
			<span>Pending</span>
			<span class='nav-count' id='val-pending'>0</span>
		</div>
		<div class='nav-item' id='nav-closed'>
			<i class='fa fa-check-square-o green-txt'></i>
			<span>Closed</span>
			<span class='nav-count' id='val-closed'>0</span>
		</div>
		<div class='nav-item' id='nav-responded' style='display:none;'>
			<i class='fa fa-reply green-txt'></i>
			<span>Responded</span>
			<span class='nav-count' id='val-resp'>0</span>
		</div>
		<div class='nav-item' id='nav-nr' style='display:none;'>
			<i class='fa fa-exclamation-circle orange-txt'></i>
			<span>Not Responded</span>
			<span class='nav-count' id='val-nr'>0</span>
		</div>

		<div style='margin-top: 24px; padding: 0 24px; font-size: 11px; font-weight: 700; color: #5f6368; text-transform: uppercase; letter-spacing: 0.5px;'>Actions</div>
		<div class='nav-item' id='btn-audit-levels'><i class='fa fa-sitemap blue-txt'></i> <span>Audit Levels</span></div>
		<div class='nav-item' id='btn-query-types'><i class='fa fa-list-ul purple-txt'></i> <span>Query Types</span></div>
		<div class='nav-item' id='btn-settings'><i class='fa fa-cog orange-txt'></i> <span>Settings</span></div>
		<div class='nav-item' id='btn-show-reports'><i class='fa fa-bar-chart green-txt'></i> <span>Reports</span></div>
	</div>

	<div class='db-main-content'>
		<div class='db-inner-header'>
			<div class='filter-section'>
				<div class='multiselect-container' style='position:relative;'>
					<div class='master-capsule' id='status-filter-btn'>
						<i class='fa fa-filter blue-txt'></i>
						<span id='selected-status-label'>Status</span>
						<i class='fa fa-chevron-down' style='font-size: 8px; margin-left: 5px;'></i>
					</div>
					<div id='filter-dropdown-status' class='multiselect-list'></div>
				</div>
				<div class='multiselect-container' style='position:relative;'>
					<div class='master-capsule' id='risk-filter-btn'>
						<i class='fa fa-shield purple-txt'></i>
						<span id='selected-risk-label'>Risk</span>
						<i class='fa fa-chevron-down' style='font-size: 8px; margin-left: 5px;'></i>
					</div>
					<div id='filter-dropdown-risk' class='multiselect-list'></div>
				</div>
				<div id='clear-filter-btn' class='master-capsule' style='display:none; border-color: #fecaca; background: #fee2e2; color: #dc2626;'>
					<i class='fa fa-times-circle'></i> <span>Clear</span>
				</div>
			</div>
			
			<div style='display: flex; align-items: center; gap: 12px;'>
				<div id='stage-report-btn' class='master-capsule' style='display:none; border-color: #16a34a; color: #16a34a;'>
					<i class='fa fa-bar-chart'></i> <span>Reports</span>
				</div>
				<div class='live-dot' style='width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);'></div>
			</div>
		</div>

		<div id='drilldown-section' class='drilldown-bar' style='display:none;'>
			<div class='filter-group-label'>Filter by Stage</div>
			<div id='stage-checkbox-list' class='checkbox-row' style='margin-bottom: 16px;'></div>
			<div class='filter-group-label'>Filter by Time</div>
			<div class='checkbox-row' id='time-filters'>
				<label class='check-item'><input type='checkbox' class='time-checkbox' value='Today'> Today <span id='count-today'></span></label>
				<label class='check-item'><input type='checkbox' class='time-checkbox' value='Yesterday'> Yesterday <span id='count-yest'></span></label>
				<label class='check-item'><input type='checkbox' class='time-checkbox' value='Last Week'> Last Week <span id='count-week'></span></label>
				<label class='check-item'><input type='checkbox' class='time-checkbox' value='All Time'> All Time <span id='count-all'></span></label>
			</div>
		</div>

		<div class='list-container'>
			<div id='stage-view' style='display:none;'>
				<div class='list-header-text'>Attention Required</div>
				<table class='mini-table'>
					<thead>
						<tr><th>Sr. No.</th><th>ID</th><th>Branch</th><th>Subject</th><th>Division</th><th>Status</th><th>Risk</th><th>Days</th><th>Ago</th></tr>
					</thead>
					<tbody id='stage-items'></tbody>
				</table>
				<button class='load-more-btn' id='load-more-p-btn' style='display:none;'>Load More</button>
			</div>

			<div id='manager-view' style='display:none;'>
				<div class='list-header-text'>Latest Activity</div>
				<table class='mini-table'>
					<thead>
						<tr><th>Sr. No.</th><th>ID</th><th>Branch</th><th>Subject</th><th>Division</th><th>Status</th><th>Risk</th><th>Days</th><th>Ago</th></tr>
					</thead>
					<tbody id='activity-body'></tbody>
				</table>
				<button class='load-more-btn' id='load-more-r-btn' style='display:none;'>Load More</button>
			</div>
		</div>
	</div>
</div>
	`);

	// --- LOGIC SECTION ---
	const $w = $(wrapper);
	let userRole = '';
	let currentStatusFilter = [];
	let currentRiskFilter = [];
	let pendingStart = 0;
	let recentStart = 0;
	let currentItemStages = [];
	let currentTimeFilter = [];

	const STORAGE_KEY = `audit_dashboard_settings_${frappe.session.user}`;

	const saveFilters = () => {
		const data = {
			status: currentStatusFilter,
			risk: currentRiskFilter,
			stages: currentItemStages,
			time: currentTimeFilter
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	};

	const loadFilters = () => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const data = JSON.parse(saved);
				currentStatusFilter = data.status || [];
				currentRiskFilter = data.risk || [];
				currentItemStages = data.stages || [];
				currentTimeFilter = data.time || [];
			} catch (e) { console.error("Error loading filters", e); }
		}
	};

	loadFilters();

	const upd = (id, val) => { 
		const $el = $w.find('#' + id); 
		if ($el.length) $el.text(val ?? 0); 
	};

	const renderRows = (list) => {
		return list.map(i => `
			<tr onclick="frappe.set_route('Form', 'My Audits', '${i.name}')">
				<td>${i.sr_no}</td>
				<td><span class='t-id'>${i.name.split('-').pop()}</span></td>
				<td>${i.emp_branch || '---'}</td>
				<td>${i.audit_query_subject_box || '---'}</td>
				<td>${i.emp_division || '---'}</td>
				<td><span class='t-status ${i.status === 'Pending' ? 'pending' : (i.status === 'Closed' ? 'closed' : '')}'>${i.status || '---'}</span></td>
				<td>${i.risk || 'Normal'}</td>
				<td>${i.aging || 0}</td>
				<td>${frappe.datetime.comment_when(i.creation)}</td>
			</tr>`).join('');
	};

	const refresh = () => {
		pendingStart = 0; recentStart = 0;
		frappe.call({
			method: 'audit_management.audit_management.dashboard.get_dashboard_stats',
			args: { 
				pending_start: 0, recent_start: 0, 
				status: currentStatusFilter.join(','), 
				risk: currentRiskFilter.join(','), 
				item_stages: currentItemStages.join(','), 
				time_filter: currentTimeFilter.join(',') 
			},
			callback: function (r) {
				if (!r.message || !r.message.success) return;
				const d = r.message; userRole = d.role_type;
				
				// Setup Filters
				const $sDD = $w.find('#filter-dropdown-status');
				const $rDD = $w.find('#filter-dropdown-risk');
				if ($sDD.is(':empty')) {
					const sOps = userRole === 'stage_user' ? ['Pending', 'Responded', 'No Response'] : ['Draft', 'Pending', 'Closed'];
					$sDD.html(sOps.map(o => `<div class='multiselect-item' onclick='event.stopPropagation()'><input type='checkbox' class='status-checkbox' value='${o}' ${currentStatusFilter.includes(o) ? 'checked' : ''}><span>${o}</span></div>`).join(''));
					$rDD.html(['High', 'Medium', 'Normal'].map(o => `<div class='multiselect-item' onclick='event.stopPropagation()'><input type='checkbox' class='risk-checkbox' value='${o}' ${currentRiskFilter.includes(o) ? 'checked' : ''}><span>${o}</span></div>`).join(''));
					
					// Update labels initially
					if (currentStatusFilter.length > 0) {
						$w.find('#selected-status-label').text(currentStatusFilter.length === 1 ? currentStatusFilter[0] : currentStatusFilter.length + ' Selected');
					}
					if (currentRiskFilter.length > 0) {
						$w.find('#selected-risk-label').text(currentRiskFilter.length === 1 ? currentRiskFilter[0] : currentRiskFilter.length + ' Selected');
					}
					$w.find('#clear-filter-btn').toggle(currentStatusFilter.length > 0 || currentRiskFilter.length > 0);
				}

				// Sync Stats & Sidebar UI
				const is_stage = userRole === 'stage_user';
				$w.find('#nav-draft, #nav-total, #nav-responded').toggle(!is_stage);
				$w.find('#nav-nr').show();
				
				if (is_stage) {
					upd('val-pending', d.pending_for_me); $w.find('#nav-pending span:nth-child(2)').text('Pending Me');
					upd('val-nr', d.not_responded_count);
					upd('val-closed', d.responded_by_me); $w.find('#nav-closed span:nth-child(2)').text('Responded');
				} else {
					upd('val-draft', d.draft_count); upd('val-total', d.total_count);
					upd('val-pending', d.total_pending); $w.find('#nav-pending span:nth-child(2)').text('Pending');
					upd('val-closed', d.closed_count); $w.find('#nav-closed span:nth-child(2)').text('Closed');
					upd('val-nr', d.not_responded_count); upd('val-resp', d.responded_by_me);
				}

				// Active Nav Styling
				$w.find('.nav-item').removeClass('active');
				if (currentStatusFilter.length > 0) {
					const s = currentStatusFilter[0];
					if (s === 'Draft') $w.find('#nav-draft').addClass('active');
					else if (s === 'Pending') $w.find('#nav-pending').addClass('active');
					else if (s === 'Closed') $w.find('#nav-closed').addClass('active');
					else if (s === 'Responded') $w.find('#nav-responded').addClass('active');
					else if (s === 'No Response') $w.find('#nav-nr').addClass('active');
				} else if (currentRiskFilter.length === 0) {
					$w.find('#nav-total').addClass('active');
				}

				// Drilldown handling
				const showD = (currentStatusFilter.includes('Responded') || currentStatusFilter.includes('No Response'));
				$w.find('#drilldown-section').toggle(showD);
				
				// Sync Timeframe Checkboxes (Always run)
				$w.find('.time-checkbox').each(function() {
					$(this).prop('checked', currentTimeFilter.includes($(this).val()));
				});

				if (showD) {
					const $sL = $w.find('#stage-checkbox-list');
					if ($sL.is(':empty')) {
						frappe.call({ 
							method: 'frappe.client.get_list', 
							args: { doctype: 'Audit Stage', fields: ['name'], order_by: 'name asc' }, 
							callback: (res) => {
								if (res.message) {
									const counts = d.stage_counts || {};
									$sL.html(res.message.map(s => `<label class='check-item'><input type='checkbox' class='stage-item-checkbox' value='${s.name}' ${currentItemStages.includes(s.name) ? 'checked' : ''}> ${s.name} (${counts[s.name] || 0})</label>`).join(''));
								}
							}
						});
					} else {
						// Update existing checkboxes
						$sL.find('.stage-item-checkbox').each(function() {
							$(this).prop('checked', currentItemStages.includes($(this).val()));
						});
					}
				}

				// List Rendering
				$w.find('#stage-view').toggle(is_stage); $w.find('#manager-view').toggle(!is_stage);
				const items = is_stage ? d.pending_list : d.recent_list;
				const $body = $w.find(is_stage ? '#stage-items' : '#activity-body');
				const $btn = $w.find(is_stage ? '#load-more-p-btn' : '#load-more-r-btn');
				const hasMore = is_stage ? d.has_more_pending : d.has_more_recent;
				
				if (items && items.length > 0) { 
					$body.html(renderRows(items)); 
					$btn.toggle(!!hasMore); 
				} else { 
					$body.html('<tr><td colspan="10" style="text-align:center; padding: 40px; color: #5f6368;">No records found</td></tr>'); 
					$btn.hide(); 
				}
			}
		});
	};

	const load_more = (type) => {
		const is_p = type === 'pending';
		frappe.call({
			method: 'audit_management.audit_management.dashboard.get_dashboard_stats',
			args: { 
				pending_start: is_p ? pendingStart + 10 : pendingStart, 
				recent_start: !is_p ? recentStart + 10 : recentStart, 
				status: currentStatusFilter.join(','), 
				risk: currentRiskFilter.join(','), 
				item_stages: currentItemStages.join(','), 
				time_filter: currentTimeFilter.join(',') 
			},
			callback: function (r) {
				if (!r.message || !r.message.success) return;
				const d = r.message;
				if (is_p) { 
					pendingStart += 10; 
					$w.find('#stage-items').append(renderRows(d.pending_list)); 
					$w.find('#load-more-p-btn').toggle(!!d.has_more_pending); 
				} else { 
					recentStart += 10; 
					$w.find('#activity-body').append(renderRows(d.recent_list)); 
					$w.find('#load-more-r-btn').toggle(!!d.has_more_recent); 
				}
			}
		});
	};

	// --- EVENT BINDING ---
	$w.on('click', '#status-filter-btn', (e) => { e.stopPropagation(); $w.find('.multiselect-list').not('#filter-dropdown-status').hide(); $w.find('#filter-dropdown-status').toggle(); });
	$w.on('click', '#risk-filter-btn', (e) => { e.stopPropagation(); $w.find('.multiselect-list').not('#filter-dropdown-risk').hide(); $w.find('#filter-dropdown-risk').toggle(); });
	$w.on('click', '#actions-btn', (e) => { e.stopPropagation(); $w.find('#actions-dropdown').toggle(); });
	$w.on('click', '#clear-filter-btn', () => { 
		$w.find('input[type=checkbox]').prop('checked', false); 
		currentStatusFilter = []; currentRiskFilter = []; currentItemStages = []; currentTimeFilter = []; 
		$w.find('#selected-status-label').text('Status'); $w.find('#selected-risk-label').text('Risk'); 
		$w.find('#clear-filter-btn').hide(); 
		saveFilters();
		refresh(); 
	});
	
	$w.on('change', '.status-checkbox', function() {
		currentStatusFilter = $w.find('.status-checkbox:checked').map((i, el) => $(el).val()).get();
		$w.find('#selected-status-label').text(currentStatusFilter.length === 0 ? 'Status' : (currentStatusFilter.length === 1 ? currentStatusFilter[0] : currentStatusFilter.length + ' Selected'));
		$w.find('#clear-filter-btn').toggle(currentStatusFilter.length > 0 || currentRiskFilter.length > 0);
		saveFilters();
		refresh();
	});

	$w.on('change', '.risk-checkbox', function() {
		currentRiskFilter = $w.find('.risk-checkbox:checked').map((i, el) => $(el).val()).get();
		$w.find('#selected-risk-label').text(currentRiskFilter.length === 0 ? 'Risk' : (currentRiskFilter.length === 1 ? currentRiskFilter[0] : currentRiskFilter.length + ' Selected'));
		$w.find('#clear-filter-btn').toggle(currentStatusFilter.length > 0 || currentRiskFilter.length > 0);
		saveFilters();
		refresh();
	});

	$w.on('change', '.time-checkbox', () => { currentTimeFilter = $w.find('.time-checkbox:checked').map((i, el) => $(el).val()).get(); saveFilters(); refresh(); });
	$w.on('change', '.stage-item-checkbox', () => { currentItemStages = $w.find('.stage-item-checkbox:checked').map((i, el) => $(el).val()).get(); saveFilters(); refresh(); });

	// Sidebar Nav Clicks
	$w.on('click', '#nav-total', () => { currentStatusFilter = []; currentRiskFilter = []; saveFilters(); refresh(); });
	$w.on('click', '#nav-draft', () => { currentStatusFilter = ['Draft']; saveFilters(); refresh(); });
	$w.on('click', '#nav-pending', () => { currentStatusFilter = ['Pending']; saveFilters(); refresh(); });
	$w.on('click', '#nav-closed', () => { currentStatusFilter = ['Closed']; saveFilters(); refresh(); });
	$w.on('click', '#nav-responded', () => { currentStatusFilter = ['Responded']; saveFilters(); refresh(); });
	$w.on('click', '#nav-nr', () => { currentStatusFilter = ['No Response']; saveFilters(); refresh(); });

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

	$(document).on('click', () => { $w.find('.multiselect-list').hide(); });

	// Initial Refresh
	refresh();
};
