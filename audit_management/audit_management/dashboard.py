import frappe
import json

import frappe
from frappe import _

@frappe.whitelist()
def get_dashboard_stats(pending_start=0, recent_start=0, status=None):
    user = frappe.session.user
    roles = frappe.get_roles(user)
    
    pending_start = int(pending_start)
    recent_start = int(recent_start)
    page_length = 10

    # ✅ Role flags
    is_admin = "Administrator" in roles or "System Manager" in roles
    is_manager = "Audit Manager" in roles
    is_member = "Audit Member" in roles

    try:
        # 1. 🟢 FETCH PENDING FOR ME (From Child Table)
        # --------------------------------------------
        pending_items_query = """
            SELECT DISTINCT parent
            FROM `tabAudit Items`
            WHERE status = 'Pending'
            AND (user_id = %s OR email = %s)
        """
        responded_items_query = """
            SELECT DISTINCT parent
            FROM `tabAudit Items`
            WHERE status = 'Responded'
            AND (user_id = %s OR email = %s)
        """

        pending_records = frappe.db.sql(pending_items_query, (user, user), as_dict=True)
        responded_records = frappe.db.sql(responded_items_query, (user, user), as_dict=True)

        pending_for_me_count = len(pending_records)
        responded_by_me_count = len(responded_records)

        pending_for_me_list = []
        has_more_pending = False
        
        # Use responded records if status is 'Responded', otherwise use pending
        active_records = pending_records
        if status == 'Responded':
            active_records = responded_records

        if active_records:
            parent_names = [r.parent for r in active_records]
            
            # Apply status filter if provided
            p_filters = {"name": ["in", parent_names]}
            # If stage user selects 'Pending', we filter the parent by 'Pending' too.
            # If they select 'Responded', we already have the parents from 'responded_records'.
            if status and status != 'Responded':
                p_filters["status"] = status

            pending_for_me_list = frappe.get_all(
                "My Audits",
                filters=p_filters,
                fields=["name", "audit_query_subject_box", "risk", "status", "emp_branch", "emp_division", "aging", "creation"],
                limit_start=pending_start,
                limit_page_length=page_length + 1
            )
            
            if len(pending_for_me_list) > page_length:
                has_more_pending = True
                pending_for_me_list = pending_for_me_list[:page_length]

            # Add Sr. No.
            for idx, item in enumerate(pending_for_me_list, start=pending_start + 1):
                item["sr_no"] = idx

        # 2. 🔵 FETCH GLOBAL/ROLE STATS
        # --------------------------------------------
        from audit_management.audit_management.utils import get_user_allowed_divisions
        allowed_divisions = get_user_allowed_divisions(user)
        
        filters = {}
        if is_admin:
            # ✅ Administrator / System Manager sees EVERYTHING
            pass
        elif is_manager:
            # ✅ RESTRICT BY DIVISION FOR AUDIT MANAGER
            if allowed_divisions:
                filters["emp_division"] = ["in", allowed_divisions]
            else:
                filters["emp_division"] = "None"
        elif is_member:
            filters["owner"] = user
        else:
            # For Stage Users (no manager/member role)
            if allowed_divisions:
                filters["emp_division"] = ["in", allowed_divisions]
            else:
                filters["emp_division"] = "None"

        total_pending = frappe.db.count("My Audits", {**filters, "status": "Pending"})
        high_risk = frappe.db.count("My Audits", {**filters, "risk": "High"})
        closed_count = frappe.db.count("My Audits", {**filters, "status": "Closed"})
        draft_count = frappe.db.count("My Audits", {**filters, "status": "Draft"})

        recent_list = []
        has_more_recent = False
        if is_manager or is_member:
            # Apply status filter if provided
            r_filters = filters.copy()
            if status:
                r_filters["status"] = status

            recent_list = frappe.get_all(
                "My Audits",
                filters=r_filters,
                fields=["name", "audit_query_subject_box", "risk", "status", "emp_branch", "emp_division", "aging", "creation"],
                order_by="creation desc",
                limit_start=recent_start,
                limit_page_length=page_length + 1
            )
            
            if len(recent_list) > page_length:
                has_more_recent = True
                recent_list = recent_list[:page_length]

            # Add Sr. No.
            for idx, item in enumerate(recent_list, start=recent_start + 1):
                item["sr_no"] = idx

        # 3. 🟣 ENHANCE BRANCH COLUMN WITH SOL ID
        # --------------------------------------------
        all_lists = pending_for_me_list + recent_list
        if all_lists:
            audit_levels = list(set([i.emp_branch for i in all_lists if i.emp_branch]))
            if audit_levels:
                level_data = frappe.get_all("Audit Level", filters={"name": ["in", audit_levels]}, fields=["name", "emp_branch as sahayog_branch"])
                level_map = {d.name: d.sahayog_branch for d in level_data}
                
                sahayog_branches = list(set([d.sahayog_branch for d in level_data if d.sahayog_branch]))
                if sahayog_branches:
                    branch_data = frappe.get_all("Sahayog Branch", filters={"name": ["in", sahayog_branches]}, fields=["name", "branch", "sol_id"])
                    branch_details_map = {d.name: {"name": d.branch, "sol": d.sol_id} for d in branch_data}
                    
                    for item in all_lists:
                        s_branch_key = level_map.get(item.emp_branch)
                        if s_branch_key:
                            details = branch_details_map.get(s_branch_key)
                            if details:
                                b_name = details.get("name")
                                b_sol = details.get("sol")
                                item.emp_branch = f"{b_name} ({b_sol})" if b_name and b_sol else (b_name or b_sol or s_branch_key)

        return {
            "role_type": "manager" if is_manager else ("member" if is_member else "stage_user"),
            "pending_for_me": pending_for_me_count,
            "responded_by_me": responded_by_me_count,
            "total_pending": total_pending,
            "high_risk": high_risk,
            "closed_count": closed_count,
            "draft_count": draft_count,
            "pending_list": pending_for_me_list,
            "recent_list": recent_list,
            "has_more_pending": has_more_pending,
            "has_more_recent": has_more_recent,
            "success": True
        }

    except Exception:
        frappe.log_error(frappe.get_traceback(), "Dashboard Stats Error")
        return {"success": False}

    except Exception:
        frappe.log_error(frappe.get_traceback(), "Dashboard Error")
        return {"success": False}
      
@frappe.whitelist()
def get_my_responded_records():
    user = frappe.session.user

    records = frappe.db.sql("""
        SELECT DISTINCT parent
        FROM `tabAudit Items`
        WHERE status = 'Responded'
        AND (user_id = %s OR email = %s)
    """, (user, user), as_dict=True)

    return [r.parent for r in records]

@frappe.whitelist()
def get_my_pending_records():
    user = frappe.session.user

    records = frappe.db.sql("""
        SELECT DISTINCT parent
        FROM `tabAudit Items`
        WHERE status = 'Pending'
        AND (user_id = %s OR email = %s)
    """, (user, user), as_dict=True)

    return [r.parent for r in records]
  
def update_custom_block():
    new_html = """
    <div class='modern-audit-dashboard'>
      <div class='header-section'>
        <div class='title-group'>
          <h2 class='main-title'>Audit Overview</h2>
          <p class='sub-title'>Real-time tracking and operational metrics</p>
        </div>
      </div>

      <div class='stats-grid'>
        <div class='stat-card blue' onclick=\"frappe.set_route('List', 'My Audits', {status: 'Pending'})\">
          <div class='icon-box'><i class='fa fa-user-clock'></i></div>
          <div class='stat-info'>
            <span class='val' id='stat-pending'>-</span>
            <span class='lbl'>Pending For Me</span>
          </div>
        </div>
        
        <div class='stat-card purple' onclick=\"frappe.set_route('List', 'My Audits', {status: 'Pending'})\">
          <div class='icon-box'><i class='fa fa-clipboard-list'></i></div>
          <div class='stat-info'>
            <span class='val' id='stat-total'>-</span>
            <span class='lbl'>Total Pending</span>
          </div>
        </div>

        <div class='stat-card red' onclick=\"frappe.set_route('List', 'My Audits', {status: 'Pending', risk: 'High'})\">
          <div class='icon-box'><i class='fa fa-exclamation-triangle'></i></div>
          <div class='stat-info'>
            <span class='val' id='stat-high'>-</span>
            <span class='lbl'>High Risk</span>
          </div>
        </div>

        <div class='stat-card orange' onclick=\"frappe.set_route('List', 'My Audits', {status: 'Pending', aging: ['>', 0]})\">
          <div class='icon-box'><i class='fa fa-hourglass-half'></i></div>
          <div class='stat-info'>
            <span class='val' id='stat-tat'>-</span>
            <span class='lbl'>TAT Breached</span>
          </div>
        </div>
      </div>

      <div id='pending-action-section' style='display:none; margin-bottom: 35px;'>
        <h3 class='section-label' style='color: #e53e3e;'><i class='fa fa-bell'></i> Pending For Your Action</h3>
        <div id='pending-items-list' class='pending-items-container'>
          <!-- Items injected here -->
        </div>
      </div>

      <div class='quick-actions-section'>
        <h3 class='section-label'>Quick Actions</h3>
        <div class='actions-flex'>
          <button class='btn-modern primary' onclick=\"frappe.new_doc('My Audits')\">
            <i class='fa fa-plus-circle'></i> New Audit Query
          </button>
          <button class='btn-modern secondary' onclick=\"frappe.set_route('List', 'Audit Level')\">
            <i class='fa fa-sitemap'></i> Audit Levels
          </button>
          <button class='btn-modern secondary' onclick=\"frappe.set_route('Form', 'Audit Management Settings')\">
            <i class='fa fa-user-shield'></i> Admin Settings
          </button>
        </div>
      </div>
    </div>
    """
    
    new_script = """
    (function() {
        console.log("Audit Dashboard Script Initialized");
        
        function refresh_stats() {
            frappe.call({
                method: 'audit_management.audit_management.dashboard.get_dashboard_stats',
                callback: (r) => {
                    if (r.message && r.message.success) {
                        const m = r.message;
                        const update_val = (id, val) => {
                            const el = document.getElementById(id);
                            if (el) el.innerText = val;
                        };
                        update_val('stat-pending', m.pending_for_me);
                        update_val('stat-total', m.total_pending);
                        update_val('stat-high', m.high_risk);
                        update_val('stat-tat', m.tat_breached);

                        // Highlight Pending Items
                        const pendingSection = document.getElementById('pending-action-section');
                        const pendingList = document.getElementById('pending-items-list');
                        
                        if (m.pending_list && m.pending_list.length > 0) {
                            pendingSection.style.display = 'block';
                            pendingList.innerHTML = m.pending_list.map(item => `
                                <div class='pending-item-card ${item.risk.toLowerCase()}' onclick=\"frappe.set_route('Form', 'My Audits', '${item.name}')\">
                                    <div class='item-info'>
                                        <span class='item-name'>${item.name}</span>
                                        <span class='item-subject'>${item.audit_query_subject_box || 'No Subject'}</span>
                                    </div>
                                    <div class='item-meta'>
                                        <span class='risk-badge'>${item.risk} Risk</span>
                                        <i class='fa fa-chevron-right'></i>
                                    </div>
                                </div>
                            `).join('');
                        } else {
                            pendingSection.style.display = 'none';
                        }
                    }
                }
            });
        }

        refresh_stats();
        setTimeout(refresh_stats, 1500);
        
        $(document).on('workspace_render', function() {
            refresh_stats();
        });
    })();
    """
    
    new_style = """
    .modern-audit-dashboard { font-family: 'Inter', -apple-system, sans-serif; padding: 20px; background: #fbfcfe; border-radius: 16px; border: 1px solid #e2e8f0; }
    .header-section { margin-bottom: 25px; }
    .main-title { font-size: 22px; font-weight: 800; color: #1a202c; margin: 0; }
    .sub-title { font-size: 14px; color: #718096; margin-top: 4px; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 35px; }
    .stat-card { display: flex; align-items: center; gap: 18px; padding: 24px; border-radius: 16px; color: white; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .stat-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    
    .stat-card.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .stat-card.purple { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
    .stat-card.red { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .stat-card.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
    
    .icon-box { font-size: 32px; opacity: 0.8; }
    .stat-info .val { display: block; font-size: 30px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
    .stat-info .lbl { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; }
    
    .section-label { font-size: 14px; font-weight: 700; color: #4a5568; text-transform: uppercase; margin-bottom: 16px; letter-spacing: 1px; }
    .actions-flex { display: flex; gap: 12px; flex-wrap: wrap; }
    
    .btn-modern { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-modern.primary { background: #1a202c; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .btn-modern.primary:hover { background: #2d3748; transform: scale(1.02); }
    .btn-modern.secondary { background: white; color: #4a5568; border: 1px solid #e2e8f0; }
    .btn-modern.secondary:hover { background: #edf2f7; border-color: #cbd5e0; }

    .pending-items-container { display: flex; flex-direction: column; gap: 10px; }
    .pending-item-card { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: white; border-radius: 12px; border-left: 5px solid #cbd5e0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; transition: 0.2s; }
    .pending-item-card:hover { transform: translateX(5px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .pending-item-card.high { border-left-color: #ef4444; background: #fff5f5; }
    .pending-item-card.medium { border-left-color: #f59e0b; }
    .pending-item-card.normal { border-left-color: #3b82f6; }
    
    .item-info { display: flex; flex-direction: column; }
    .item-name { font-weight: 700; font-size: 14px; color: #2d3748; }
    .item-subject { font-size: 13px; color: #718096; }
    
    .item-meta { display: flex; align-items: center; gap: 15px; }
    .risk-badge { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 20px; text-transform: uppercase; }
    .high .risk-badge { background: #fee2e2; color: #b91c1c; }
    .medium .risk-badge { background: #fef3c7; color: #92400e; }
    .normal .risk-badge { background: #dbeafe; color: #1e40af; }
    
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .btn-modern { width: 100%; justify-content: center; }
    }
    """

    if frappe.db.exists("Custom HTML Block", "Audit Management"):
        doc = frappe.get_doc("Custom HTML Block", "Audit Management")
        if doc.html != new_html or doc.script != new_script:
            doc.html = new_html
            doc.script = new_script
            doc.style = new_style
            doc.save(ignore_permissions=True)
            frappe.db.commit()
