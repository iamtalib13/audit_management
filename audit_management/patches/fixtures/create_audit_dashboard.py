import frappe

def execute():
    html_content="""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Card Layout</title>
</head>
<body>
     <!-- Overlay inside root_element -->
    <div id="report-overlay" class="report-overlay" style="display: none;">
      <div id="report-message" class="report-message">Opening report.</div>
    </div>
<div class=asset-request-container> 

<div class="Asset-Container">
     <div class="intro">
        <div class="emp-name" id="emp-name"></div>
        <h4 class="welcome-text" id="message">Welcome to Audit Management</h4>
    </div>
</div>

<hr id="saperator">

<div class="tabs-nav">
  <button class="tab-button active" data-tab="newrequest">New</button>
  <button class="tab-button" data-tab="alllist">All Query list</button>
  <button class="tab-button" data-tab="pending">All Pending List</button>
  <button class="tab-button" data-tab="response">All Response List</button>
  <button class="tab-button" data-tab="noresponse">All No Response List</button>
  <button class="tab-button" id="tab-report" style="display: none;">Audit Report</button>
</div>

<!-- New Query-->
<div class="tab-content active" id="tab-newrequest" style="display: block;">
    <div id="NewRequest">
  <div class="new-request-actions">
    <a class="new-request-card" href="/app/my-audits/new-my-audits">
      <div class="text-group">
        <span class="label">Create</span>
        <div class="sublabel"><i>New Query to Branch</i></div>
      </div>
    </a>

    <a class="new-request-card" href="/app/audit-level?name=%5B%22is%22,%22set%22%5D">
      <div class="text-group">
        <span class="label">Audit Level</span>
        <div class="sublabel"><i>Query Level For Branch</i></div>
      </div>
    </a>
  </div>
 </div>
</div>

<!-- All List-->
<div class="tab-content" id="tab-alllist">
    <div class="widgets-container" id="allList">
    <a id="listLink" class="widget" href=""> 
            <div class="content-grid"  >
                <div class="wid-title">All Query</div>
                <div class="wid-content">
                    <span class="red-dot"></span>
                    <span class="value" id="totalCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Generated</span>
                </div>
                
            </div> 
        
    </a>
    <a id="listDraft" class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">All Draft Query</div>
                 <div class="wid-content">
                    <span class="red-dot"></span>
                    <span class="value" id="draftCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Drafted</span>
                </div>
            </div>
    </a>
    <a id="listClose"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">All Close Query</div>
                <div class="wid-content">
                    <span class="red-dot"></span>
                    <span class="value" id="closeCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Closed</span>
                </div>
            </div>
       
    </a>
     <a id="listPendingAll"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">All Pending Query</div>
                <div class="wid-content">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingAllCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending-Any</span>
                </div>
            </div>
       
    </a>
</div>
</div>

<!-- Pending List -->
<div class="tab-content" id="tab-pending">
<div class="widgets-container" id="pending-container-1">
    <h2 style="padding: 5px;">Pending Queries List - Level Wise</h2>

    <a id="listPendingBM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Pending From BM</div>
            <div class="wid-content red">
                <span class="red-dot"></span>
                <span class="value" id="pendingBMCount"></span>
                <span class="sublabel">Pending-BM</span>
            </div>
        </div>
    </a>

    <a id="listPendingDH" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Pending From DH</div>
            <div class="wid-content red">
                <span class="red-dot"></span>
                <span class="value" id="pendingDHCount"></span>
                <span class="sublabel">Pending-DH</span>
            </div>
        </div>
    </a>

    <a id="listPendingCOM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Pending From COM</div>
            <div class="wid-content red">
                <span class="red-dot"></span>
                <span class="value" id="pendingCOMCount"></span>
                <span class="sublabel">Pending-COM</span>
            </div>
        </div>
    </a>

    <a id="listPendingRM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Pending From RM</div>
            <div class="wid-content red">
                <span class="red-dot"></span>
                <span class="value" id="pendingRMCount"></span>
                <span class="sublabel">Pending-RM</span>
            </div>
        </div>
    </a>

    <a id="listPendingROM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Pending From ROM</div>
            <div class="wid-content red">
                <span class="red-dot"></span>
                <span class="value" id="pendingROMCount"></span>
                <span class="sublabel">Pending-ROM</span>
            </div>
        </div>
    </a>
</div>
<div class="widgets-container" id="pending-container-2">
    <a id="listPendingZM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Pending From ZM</div>
            <div class="wid-content red">
                <span class="red-dot"></span>
                <span class="value" id="pendingZMCount"></span>
                <span class="sublabel">Pending-ZM</span>
            </div>
        </div>
    </a>

    <a id="listPendingZOM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Pending From ZOM</div>
            <div class="wid-content red">
                <span class="red-dot"></span>
                <span class="value" id="pendingZOMCount"></span>
                <span class="sublabel">Pending-ZOM</span>
            </div>
        </div>
    </a>

    <a id="listPendingGM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Pending From GM</div>
            <div class="wid-content red">
                <span class="red-dot"></span>
                <span class="value" id="pendingGMCount"></span>
                <span class="sublabel">Pending-GM</span>
            </div>
        </div>
    </a>

    <a id="listPendingCOO" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Pending From COO</div>
            <div class="wid-content red">
                <span class="red-dot"></span>
                <span class="value" id="pendingCOOCount"></span>
                <span class="sublabel">Pending-COO</span>
            </div>
        </div>
    </a>

    <a id="listPendingCEO" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Pending From CEO</div>
            <div class="wid-content red">
                <span class="red-dot"></span>
                <span class="value" id="pendingCEOCount"></span>
                <span class="sublabel">Pending-CEO</span>
            </div>
        </div>
    </a>
</div>
</div>

<!-- Response List -->
<div class="tab-content" id="tab-response" style="display: none;">
<div class="widgets-container" id="response-container-1">
    <h2 style="padding: 5px;">Response Queries List - Level Wise</h2>

    <a id="listResponseBM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Response From BM</div>
            <div class="wid-content green">
                <span class="green-dot"></span>
                <span class="value" id="responseBMCount"></span>
                <span class="sublabel">Response-BM</span>
            </div>
        </div>
    </a>

    <a id="listResponseDH" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Response From DH</div>
            <div class="wid-content green">
                <span class="green-dot"></span>
                <span class="value" id="responseDHCount"></span>
                <span class="sublabel">Response-DH</span>
            </div>
        </div>
    </a>

    <a id="listResponseCOM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Response From COM</div>
            <div class="wid-content green">
                <span class="green-dot"></span>
                <span class="value" id="responseCOMCount"></span>
                <span class="sublabel">Response-COM</span>
            </div>
        </div>
    </a>

    <a id="listResponseRM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Response From RM</div>
            <div class="wid-content green">
                <span class="green-dot"></span>
                <span class="value" id="responseRMCount"></span>
                <span class="sublabel">Response-RM</span>
            </div>
        </div>
    </a>

    <a id="listResponseROM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Response From ROM</div>
            <div class="wid-content green">
                <span class="green-dot"></span>
                <span class="value" id="responseROMCount"></span>
                <span class="sublabel">Response-ROM</span>
            </div>
        </div>
    </a>
</div>
<div class="widgets-container" id="response-container-2">
    <a id="listResponseZM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Response From ZM</div>
            <div class="wid-content green">
                <span class="green-dot"></span>
                <span class="value" id="responseZMCount"></span>
                <span class="sublabel">Response-ZM</span>
            </div>
        </div>
    </a>

    <a id="listResponseZOM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Response From ZOM</div>
            <div class="wid-content green">
                <span class="green-dot"></span>
                <span class="value" id="responseZOMCount"></span>
                <span class="sublabel">Response-ZOM</span>
            </div>
        </div>
    </a>

    <a id="listResponseGM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Response From GM</div>
            <div class="wid-content green">
                <span class="green-dot"></span>
                <span class="value" id="responseGMCount"></span>
                <span class="sublabel">Response-GM</span>
            </div>
        </div>
    </a>

    <a id="listResponseCOO" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Response From COO</div>
            <div class="wid-content green">
                <span class="green-dot"></span>
                <span class="value" id="responseCOOCount"></span>
                <span class="sublabel">Response-COO</span>
            </div>
        </div>
    </a>

    <a id="listResponseCEO" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">Response From CEO</div>
            <div class="wid-content green">
                <span class="green-dot"></span>
                <span class="value" id="responseCEOCount"></span>
                <span class="sublabel">Response-CEO</span>
            </div>
        </div>
    </a>
</div>
</div>

<!-- No-Response List -->
<div class="tab-content" id="tab-noresponse" style="display: none;">
<div class="widgets-container" id="noresponse-container-1">
    <h2 style="padding: 5px;">No-Response Queries List - Level Wise</h2>

    <a id="listNoResponseBM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">No Response - BM</div>
            <div class="wid-content">
                <span class="grey-dot"></span>
                <span class="value" id="NoresponseBMCount"></span>
                <span class="sublabel">No Reply-BM</span>
            </div>
        </div>
    </a>

    <a id="listNoResponseDH" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">No Response - DH</div>
            <div class="wid-content">
                <span class="grey-dot"></span>
                <span class="value" id="NoresponseDHCount"></span>
                <span class="sublabel">No Reply-DH</span>
            </div>
        </div>
    </a>

    <a id="listNoResponseCOM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">No Response - COM</div>
            <div class="wid-content">
                <span class="grey-dot"></span>
                <span class="value" id="NoresponseCOMCount"></span>
                <span class="sublabel">No Reply-COM</span>
            </div>
        </div>
    </a>

    <a id="listNoResponseRM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">No Response - RM</div>
            <div class="wid-content">
                <span class="grey-dot"></span>
                <span class="value" id="NoresponseRMCount"></span>
                <span class="sublabel">No Reply-RM</span>
            </div>
        </div>
    </a>

    <a id="listNoResponseROM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">No Response - ROM</div>
            <div class="wid-content">
                <span class="grey-dot"></span>
                <span class="value" id="NoresponseROMCount"></span>
                <span class="sublabel">No Reply-ROM</span>
            </div>
        </div>
    </a>
</div>
<div class="widgets-container" id="noresponse-container-2">
    <a id="listNoResponseZM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">No Response - ZM</div>
            <div class="wid-content">
                <span class="grey-dot"></span>
                <span class="value" id="NoresponseZMCount"></span>
                <span class="sublabel">No Reply-ZM</span>
            </div>
        </div>
    </a>

    <a id="listNoResponseZOM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">No Response - ZOM</div>
            <div class="wid-content">
                <span class="grey-dot"></span>
                <span class="value" id="NoresponseZOMCount"></span>
                <span class="sublabel">No Reply-ZOM</span>
            </div>
        </div>
    </a>

    <a id="listNoResponseGM" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">No Response - GM</div>
            <div class="wid-content">
                <span class="grey-dot"></span>
                <span class="value" id="NoresponseGMCount"></span>
                <span class="sublabel">No Reply-GM</span>
            </div>
        </div>
    </a>

    <a id="listNoResponseCOO" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">No Response - COO</div>
            <div class="wid-content">
                <span class="grey-dot"></span>
                <span class="value" id="NoresponseCOOCount"></span>
                <span class="sublabel">No Reply-COO</span>
            </div>
        </div>
    </a>

    <a id="listNoResponseCEO" class="widget" href="">
        <div class="content-grid">
            <div class="wid-title">No Response - CEO</div>
            <div class="wid-content">
                <span class="grey-dot"></span>
                <span class="value" id="NoresponseCEOCount"></span>
                <span class="sublabel">No Reply-CEO</span>
            </div>
        </div>
    </a>
</div>
</div>

<!--for Audit Level Employees-->
<div class="widgets-container-ad" id="ForAuditLevel1">
    <a id="allListBranch" class="widget" href=""> 
            <div class="content-grid"  >
                <div class="wid-title" id="AllListAuditLevel">All Query</div>
                <div class="wid-content">
                    <span class="red-dot"></span>
                    <span class="value" id="totalCountBranch"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Sended</span>
                </div>
                
            </div> 
        
    </a>
    <a id="closeListBranch"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Closed</div>
                <div class="wid-content">
                    <span class="red-dot"></span>
                    <span class="value" id="closeCountBranch"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Closed</span>
                </div>
            </div>
    </a>
    
    <a id="pendingListBranch" class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Pending from You</div>
                 <div class="wid-content">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingCountBranch"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending</span>
                </div>
            </div>
    </a>
    <a id="ResponseListBranch"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Response from You</div>
                <div class="wid-content">
                    <span class="red-dot"></span>
                    <span class="value" id="responseCountBranch"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Responded</span>
                </div>
            </div>
       
    </a>
    <a id="NoResponseListBranch"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">No Response from You</div>
                <div class="wid-content">
                    <span class="red-dot"></span>
                    <span class="value" id="NoresponseCountBranch"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Not Responded</span>
                </div>
            </div>
       
    </a>
</div>
</div>
</body>
</html>
"""
    js_content="""// Check if the user is a System Manager or Administrator
if (
  frappe.user.has_role("System Manager") ||
  frappe.user.has_role("Administrator") ||
  frappe.user.has_role("Audit Manager")
) {
  get_name();
  get_records_count();

  const statuses = [
    { id: "listLink", url: `/app/my-audits?status=%5B"is"%2C"set"%5D` },
    { id: "listDraft", url: `/app/my-audits/view/list?status=Draft` },
    { id: "listClose", url: `/app/my-audits/view/list?status=Close` },
    { id: "listPendingAll", url: `/app/my-audits/view/list?status=Pending` },
    { id: "listPendingBM", url: `/app/my-audits/view/list?bm_user_status=Pending` },
    { id: "listPendingDH", url: `/app/my-audits/view/list?dh_user_status=Pending` },
    { id: "listPendingCOM", url: `/app/my-audits/view/list?com_user_status=Pending` },
    { id: "listPendingRM", url: `/app/my-audits/view/list?rm_user_status=Pending` },
    { id: "listPendingROM", url: `/app/my-audits/view/list?rom_user_status=Pending` },
    { id: "listPendingZM", url: `/app/my-audits/view/list?zm_user_status=Pending` },
    { id: "listPendingZOM", url: `/app/my-audits/view/list?zom_user_status=Pending` },
    { id: "listPendingGM", url: `/app/my-audits/view/list?gm_user_status=Pending` },
    { id: "listPendingHR", url: `/app/my-audits/view/list?hr_user_status=Pending` },
    { id: "listPendingCOO", url: `/app/my-audits/view/list?coo_user_status=Pending` },
    { id: "listPendingCEO", url: `/app/my-audits/view/list?ceo_user_status=Pending` },
    { id: "listResponseBM", url: `/app/my-audits/view/list?bm_user_status=Responded` },
    { id: "listResponseDH", url: `/app/my-audits/view/list?dh_user_status=Responded` },
    { id: "listResponseCOM", url: `/app/my-audits/view/list?com_user_status=Responded` },
    { id: "listResponseRM", url: `/app/my-audits/view/list?rm_user_status=Responded` },
    { id: "listResponseROM", url: `/app/my-audits/view/list?rom_user_status=Responded` },
    { id: "listResponseZM", url: `/app/my-audits/view/list?zm_user_status=Responded` },
    { id: "listResponseZOM", url: `/app/my-audits/view/list?zom_user_status=Responded` },
    { id: "listResponseGM", url: `/app/my-audits/view/list?gm_user_status=Responded` },
    { id: "listResponseHR", url: `/app/my-audits/view/list?hr_user_status=Responded` },
    { id: "listResponseCOO", url: `/app/my-audits/view/list?coo_user_status=Responded` },
    { id: "listResponseCEO", url: `/app/my-audits/view/list?ceo_user_status=Responded` },
    { id: "listNoResponseBM", url: `/app/my-audits/view/list?bm_user_status=No Response` },
    { id: "listNoResponseDH", url: `/app/my-audits/view/list?dh_user_status=No Response` },
    { id: "listNoResponseCOM", url: `/app/my-audits/view/list?com_user_status=No Response` },
    { id: "listNoResponseRM", url: `/app/my-audits/view/list?rm_user_status=No Response` },
    { id: "listNoResponseROM", url: `/app/my-audits/view/list?rom_user_status=No Response` },
    { id: "listNoResponseZM", url: `/app/my-audits/view/list?zm_user_status=No Response` },
    { id: "listNoResponseZOM", url: `/app/my-audits/view/list?zom_user_status=No Response` },
    { id: "listNoResponseGM", url: `/app/my-audits/view/list?gm_user_status=No Response` },
    { id: "listNoResponseHR", url: `/app/my-audits/view/list?hr_user_status=No Response` },
    { id: "listNoResponseCOO", url: `/app/my-audits/view/list?coo_user_status=No Response` },
    { id: "listNoResponseCEO", url: `/app/my-audits/view/list?ceo_user_status=No Response` }
  ];

  // Loop through the statuses array and update href attributes
  statuses.forEach(({ id, url }) => {
    const element = root_element.querySelector(`#${id}`);
    if (element) {
      element.href = url;
    } else {
      console.error(`Element with ID '${id}' not found.`);
    }
  });

  console.log("Updated href attributes for SMBG Team Leader");
}

// Check if the user is both a BDO and a BDE (Audit Manager role)
else if (frappe.user.has_role("Audit Member") && frappe.session.user !== "4857@sahayog.com") {
  var sessionUser = frappe.session.user;
  var empID = sessionUser.split("@")[0]; // Extracting employee ID
  console.log(empID);

  get_name();
  get_records_count();

  const statuses = [
    { id: "listLink", url: `/app/my-audits?status=%5B"is"%2C"set"%5D&query_generated_by_empid=${empID}` },
    { id: "listDraft", url: `/app/my-audits/view/list?status=Draft&query_generated_by_empid=${empID}` },
    { id: "listClose", url: `/app/my-audits/view/list?status=Close&query_generated_by_empid=${empID}` },
    { id: "listPendingAll", url: `/app/my-audits/view/list?status=Pending&query_generated_by_empid=${empID}` },
    { id: "listPendingBM", url: `/app/my-audits/view/list?bm_user_status=Pending&query_generated_by_empid=${empID}` },
    { id: "listPendingDH", url: `/app/my-audits/view/list?dh_user_status=Pending&query_generated_by_empid=${empID}` },
    { id: "listPendingCOM", url: `/app/my-audits/view/list?com_user_status=Pending&query_generated_by_empid=${empID}` },
    { id: "listPendingRM", url: `/app/my-audits/view/list?rm_user_status=Pending&query_generated_by_empid=${empID}` },
    { id: "listPendingROM", url: `/app/my-audits/view/list?rom_user_status=Pending&query_generated_by_empid=${empID}` },
    { id: "listPendingZM", url: `/app/my-audits/view/list?zm_user_status=Pending&query_generated_by_empid=${empID}` },
    { id: "listPendingZOM", url: `/app/my-audits/view/list?zom_user_status=Pending&query_generated_by_empid=${empID}` },
    { id: "listPendingGM", url: `/app/my-audits/view/list?gm_user_status=Pending&query_generated_by_empid=${empID}` },
    { id: "listPendingHR", url: `/app/my-audits/view/list?hr_user_status=Pending&query_generated_by_empid=${empID}` },
    { id: "listPendingCOO", url: `/app/my-audits/view/list?coo_user_status=Pending&query_generated_by_empid=${empID}` },
    { id: "listPendingCEO", url: `/app/my-audits/view/list?ceo_user_status=Pending&query_generated_by_empid=${empID}` },
    { id: "listResponseBM", url: `/app/my-audits/view/list?bm_user_status=Responded&query_generated_by_empid=${empID}` },
    { id: "listResponseDH", url: `/app/my-audits/view/list?dh_user_status=Responded&query_generated_by_empid=${empID}` },
    { id: "listResponseCOM", url: `/app/my-audits/view/list?com_user_status=Responded&query_generated_by_empid=${empID}` },
    { id: "listResponseRM", url: `/app/my-audits/view/list?rm_user_status=Responded&query_generated_by_empid=${empID}` },
    { id: "listResponseROM", url: `/app/my-audits/view/list?rom_user_status=Responded&query_generated_by_empid=${empID}` },
    { id: "listResponseZM", url: `/app/my-audits/view/list?zm_user_status=Responded&query_generated_by_empid=${empID}` },
    { id: "listResponseZOM", url: `/app/my-audits/view/list?zom_user_status=Responded&query_generated_by_empid=${empID}` },
    { id: "listResponseGM", url: `/app/my-audits/view/list?gm_user_status=Responded&query_generated_by_empid=${empID}` },
    { id: "listResponseHR", url: `/app/my-audits/view/list?hr_user_status=Responded&query_generated_by_empid=${empID}` },
    { id: "listResponseCOO", url: `/app/my-audits/view/list?coo_user_status=Responded&query_generated_by_empid=${empID}` },
    { id: "listResponseCEO", url: `/app/my-audits/view/list?ceo_user_status=Responded&query_generated_by_empid=${empID}` },
    
    { id: "listNoResponseBM", url: `/app/my-audits/view/list?bm_user_status=No Response&query_generated_by_empid=${empID}` },
    { id: "listNoResponseDH", url: `/app/my-audits/view/list?dh_user_status=No Response&query_generated_by_empid=${empID}` },
    { id: "listNoResponseCOM", url: `/app/my-audits/view/list?com_user_status=No Response&query_generated_by_empid=${empID}` },
    { id: "listNoResponseRM", url: `/app/my-audits/view/list?rm_user_status=No Response&query_generated_by_empid=${empID}` },
    { id: "listNoResponseROM", url: `/app/my-audits/view/list?rom_user_status=No Response&query_generated_by_empid=${empID}` },
    { id: "listNoResponseZM", url: `/app/my-audits/view/list?zm_user_status=No Response&query_generated_by_empid=${empID}` },
    { id: "listNoResponseZOM", url: `/app/my-audits/view/list?zom_user_status=No Response&query_generated_by_empid=${empID}` },
    { id: "listNoResponseGM", url: `/app/my-audits/view/list?gm_user_status=No Response&query_generated_by_empid=${empID}` },
    { id: "listNoResponseHR", url: `/app/my-audits/view/list?hr_user_status=No Response&query_generated_by_empid=${empID}` },
    { id: "listNoResponseCOO", url: `/app/my-audits/view/list?coo_user_status=No Response&query_generated_by_empid=${empID}` },
    { id: "listNoResponseCEO", url: `/app/my-audits/view/list?ceo_user_status=No Response&query_generated_by_empid=${empID}` }
  ];

  // Update href attributes dynamically
  statuses.forEach(({ id, url }) => {
    const element = root_element.querySelector(`#${id}`);
    if (element) {
      element.href = url; // Update href attribute
    } else {
      console.error(`Element with ID '${id}' not found.`); // Log error if element not found
    }
  });

  console.log("Updated href attributes for Audit Member.");
}

else if (frappe.session.user === "4857@sahayog.com") {
    const empIDs = [3649, 6105 ,6929]; // Employee IDs as an array
    const empIDParam = encodeURIComponent(JSON.stringify(["in", empIDs]));
  
    get_name();
    get_records_count();
  
    const statuses = [
      { id: "listLink", url: `/app/my-audits?status=%5B"is"%2C"set"%5D&query_generated_by_empid=${empIDParam}` },
      { id: "listDraft", url: `/app/my-audits/view/list?status=Draft&query_generated_by_empid=${empIDParam}` },
      { id: "listClose", url: `/app/my-audits/view/list?status=Close&query_generated_by_empid=${empIDParam}` },
      { id: "listPendingAll", url: `/app/my-audits/view/list?status=Pending&query_generated_by_empid=${empIDParam}` },
      
      { id: "listPendingBM", url: `/app/my-audits/view/list?bm_user_status=Pending&query_generated_by_empid=${empIDParam}` },
      { id: "listPendingDH", url: `/app/my-audits/view/list?dh_user_status=Pending&query_generated_by_empid=${empIDParam}` },
      { id: "listPendingCOM", url: `/app/my-audits/view/list?com_user_status=Pending&query_generated_by_empid=${empIDParam}` },
      { id: "listPendingRM", url: `/app/my-audits/view/list?rm_user_status=Pending&query_generated_by_empid=${empIDParam}` },
      { id: "listPendingROM", url: `/app/my-audits/view/list?rom_user_status=Pending&query_generated_by_empid=${empIDParam}` },
      { id: "listPendingZM", url: `/app/my-audits/view/list?zm_user_status=Pending&query_generated_by_empid=${empIDParam}` },
      { id: "listPendingZOM", url: `/app/my-audits/view/list?zom_user_status=Pending&query_generated_by_empid=${empIDParam}` },
      { id: "listPendingGM", url: `/app/my-audits/view/list?gm_user_status=Pending&query_generated_by_empid=${empIDParam}` },
      { id: "listPendingHR", url: `/app/my-audits/view/list?hr_user_status=Pending&query_generated_by_empid=${empIDParam}` },
      { id: "listPendingCOO", url: `/app/my-audits/view/list?coo_user_status=Pending&query_generated_by_empid=${empIDParam}` },
      { id: "listPendingCEO", url: `/app/my-audits/view/list?ceo_user_status=Pending&query_generated_by_empid=${empIDParam}` },
      
      { id: "listResponseBM", url: `/app/my-audits/view/list?bm_user_status=Response&query_generated_by_empid=${empIDParam}` },
      { id: "listResponseDH", url: `/app/my-audits/view/list?dh_user_status=Response&query_generated_by_empid=${empIDParam}` },
      { id: "listResponseCOM", url: `/app/my-audits/view/list?com_user_status=Response&query_generated_by_empid=${empIDParam}` },
      { id: "listResponseRM", url: `/app/my-audits/view/list?rm_user_status=Response&query_generated_by_empid=${empIDParam}` },
      { id: "listResponseROM", url: `/app/my-audits/view/list?rom_user_status=Response&query_generated_by_empid=${empIDParam}` },
      { id: "listResponseZM", url: `/app/my-audits/view/list?zm_user_status=Response&query_generated_by_empid=${empIDParam}` },
      { id: "listResponseZOM", url: `/app/my-audits/view/list?zom_user_status=Response&query_generated_by_empid=${empIDParam}` },
      { id: "listResponseGM", url: `/app/my-audits/view/list?gm_user_status=Response&query_generated_by_empid=${empIDParam}` },
      { id: "listResponseHR", url: `/app/my-audits/view/list?hr_user_status=Response&query_generated_by_empid=${empIDParam}` },
      { id: "listResponseCOO", url: `/app/my-audits/view/list?coo_user_status=Response&query_generated_by_empid=${empIDParam}` },
      { id: "listResponseCEO", url: `/app/my-audits/view/list?ceo_user_status=Response&query_generated_by_empid=${empIDParam}` },

      { id: "listNoResponseBM", url: `/app/my-audits/view/list?bm_user_status=No Response&query_generated_by_empid=${empIDParam}` },
      { id: "listNoResponseDH", url: `/app/my-audits/view/list?dh_user_status=No Response&query_generated_by_empid=${empIDParam}` },
      { id: "listNoResponseCOM", url: `/app/my-audits/view/list?com_user_status=No Response&query_generated_by_empid=${empIDParam}` },
      { id: "listNoResponseRM", url: `/app/my-audits/view/list?rm_user_status=No Response&query_generated_by_empid=${empIDParam}` },
      { id: "listNoResponseROM", url: `/app/my-audits/view/list?rom_user_status=No Response&query_generated_by_empid=${empIDParam}` },
      { id: "listNoResponseZM", url: `/app/my-audits/view/list?zm_user_status=No Response&query_generated_by_empid=${empIDParam}` },
      { id: "listNoResponseZOM", url: `/app/my-audits/view/list?zom_user_status=No Response&query_generated_by_empid=${empIDParam}` },
      { id: "listNoResponseGM", url: `/app/my-audits/view/list?gm_user_status=No Response&query_generated_by_empid=${empIDParam}` },
      { id: "listNoResponseHR", url: `/app/my-audits/view/list?hr_user_status=No Response&query_generated_by_empid=${empIDParam}` },
      { id: "listNoResponseCOO", url: `/app/my-audits/view/list?coo_user_status=No Response&query_generated_by_empid=${empIDParam}` },
      { id: "listNoResponseCEO", url: `/app/my-audits/view/list?ceo_user_status=No Response&query_generated_by_empid=${empIDParam}` },
      
      
    ];
  
    
    // Update href attributes dynamically
    statuses.forEach(({ id, url }) => {
      const element = root_element.querySelector(`#${id}`);
      if (element) {
        element.href = url;
      } else {
        console.error(`Element with ID '${id}' not found.`);
      }
    });
  
    console.log("Updated href attributes for Audit Member.");
}

else if (!frappe.user.has_role("Audit Member") && !frappe.user.has_role("Audit Manager") && !frappe.user.has_role("Administrator") && frappe.user.has_role("Employee"))
{
    get_name();
}

// Function to fetch and display the user's full name
function get_name() {
  if (frappe.session.user === "Administrator") {
    // Directly set the name for the Administrator
    const fullName = "Administrator";
    console.log("Full name is:", fullName);
    const nameElement = root_element.querySelector("#emp-name");
    if (nameElement) {
      nameElement.textContent = "Hello, " + fullName;
    } else {
      console.warn("#emp-name element not found.");
    }
  } else {
    // For non-Administrator users, fetch the user details from the Employee doctype
    frappe.call({
      method: "frappe.client.get",
      args: {
        doctype: "Employee",
        filters: { user_id: frappe.session.user }, // Fetch based on user_id
      },
      callback: function (response) {
        if (response.message) {
          const { first_name, last_name } = response.message;
          const fullName = `${first_name} ${last_name}`;
          console.log("Full name is:", fullName);
          const nameElement = root_element.querySelector("#emp-name");
          if (nameElement) {
            nameElement.textContent = "Hello, " + fullName;
          } else {
            console.warn("#emp-name element not found.");
          }
        } else {
          console.error("Failed to fetch user name.");
        }
      },
    });
  }
}

function get_records_count() {
    var is_admin = "";
    if(frappe.user.has_role("System Manager") ||
       frappe.user.has_role("Administrator") ||
       frappe.user.has_role("Audit Manager")) {
        is_admin = "yes";
    } else if(frappe.user.has_role("Audit Member")) {
        is_admin = "no";
    }
  frappe.call({
    method:
      "audit_management.audit_management.doctype.my_audits.my_audits.get_audit_counts", 
      args: {
            is_admin: is_admin  // Send the is_admin flag as an argument
        },// Adjust the path to your app's method
    callback: function (response) {
      // Retrieve counts from the response
      const counts = response.message;

      // Define the elements and corresponding count keys
      const countKeys = [
        { key: "total_count", elementId: "#totalCount" },
        { key: "draft_count", elementId: "#draftCount" },
        { key: "pending_count", elementId: "#pendingAllCount" },
        { key: "close_count", elementId: "#closeCount" },
        { key: "bm_pending_count", elementId: "#pendingBMCount" },
        { key: "dh_pending_count", elementId: "#pendingDHCount" },
        { key: "com_pending_count", elementId: "#pendingCOMCount" },
        { key: "rm_pending_count", elementId: "#pendingRMCount" },
        { key: "rom_pending_count", elementId: "#pendingROMCount" },
        { key: "zm_pending_count", elementId: "#pendingZMCount" },
        { key: "zom_pending_count", elementId: "#pendingZOMCount" },
        { key: "gm_pending_count", elementId: "#pendingGMCount" },
        { key: "hr_pending_count", elementId: "#pendingHRCount" },
        { key: "coo_pending_count", elementId: "#pendingCOOCount" },
        { key: "ceo_pending_count", elementId: "#pendingCEOCount" },
        { key: "bm_response_count", elementId: "#responseBMCount" },
        { key: "dh_response_count", elementId: "#responseDHCount" },
        { key: "com_response_count", elementId: "#responseCOMCount" },
        { key: "rm_response_count", elementId: "#responseRMCount" },
        { key: "rom_response_count", elementId: "#responseROMCount" },
        { key: "zm_response_count", elementId: "#responseZMCount" },
        { key: "zom_response_count", elementId: "#responseZOMCount" },
        { key: "gm_response_count", elementId: "#responseGMCount" },
        { key: "hr_response_count", elementId: "#responseHRCount" },
        { key: "coo_response_count", elementId: "#responseCOOCount" },
        { key: "ceo_response_count", elementId: "#responseCEOCount" },
        
        { key: "bm_no_response_count", elementId: "#NoresponseBMCount" },
        { key: "dh_no_response_count", elementId: "#NoresponseDHCount" },
        { key: "com_no_response_count", elementId: "#NoresponseCOMCount" },
        { key: "rm_no_response_count", elementId: "#NoresponseRMCount" },
        { key: "rom_no_response_count", elementId: "#NoresponseROMCount" },
        { key: "zm_no_response_count", elementId: "#NoresponseZMCount" },
        { key: "zom_no_response_count", elementId: "#NoresponseZOMCount" },
        { key: "gm_no_response_count", elementId: "#NoresponseGMCount" },
        { key: "hr_no_response_count", elementId: "#NoresponseHRCount" },
        { key: "coo_no_response_count", elementId: "#NoresponseCOOCount" },
        { key: "ceo_no_response_count", elementId: "#NoresponseCEOCount" }
      ];

      // Loop through the keys and set the corresponding text content
      countKeys.forEach(({ key, elementId }) => {
        const element = root_element.querySelector(elementId);
        if (element && counts[key] !== undefined) {
          element.textContent = counts[key];
        }
      });
    },
  });
}

frappe.call({
    method: 'audit_management.audit_management.doctype.my_audits.my_audits_workspace_helper.get_audit_level_for_user', // Replace with your correct method path
    callback: function(response) {
        // Ensure matches is always an array to prevent errors
        const matches = response.message.matches || [];
        let userFlag = response.message.flag || "";

        // Extract branch and user stages
        const names = matches.map(match => match.name || "");
        let branch = names.map(b => `"${b}"`).join(",");
        
        const userStages = matches.map(match => match.user_stage || "");
        let userStatusQuery = userStages.map(stage => `${stage}=Pending`).join("&");
        let userStatusQueryResponse = userStages.map(stage => `${stage}=Responded`).join("&");
        let userStatusQueryNoResponse = userStages.map(stage => `${stage}=No Response`).join("&");

        console.log("flag : ", userFlag);
        console.log("Branch Array:", branch);
        console.log("User status query for pending:", userStatusQuery);
        console.log("User status query for responded:", userStatusQueryResponse);
        console.log("User status query for No responded:", userStatusQueryNoResponse);

        // Show/Hide elements based on the flag
        if (userFlag === "LevelUser") {
            // User is assigned to one of the audit level stages
            root_element.querySelector('#ForAuditLevel1').style.display = 1;
            if (frappe.session.user === "2800@sahayog.com") 
                {
                    root_element.querySelector('#allListBranch').href = `/app/my-audits?gm_user_status=%5B"is"%2C"set"%5D`;
                    root_element.querySelector('#pendingListBranch').href = `/app/my-audits?gm_user_status=Pending`;
                    root_element.querySelector('#ResponseListBranch').href = `/app/my-audits?gm_user_status=Responded`;
                    root_element.querySelector('#NoResponseListBranch').href = `/app/my-audits?gm_user_status=No Response`;
                    root_element.querySelector('#closeListBranch').href = `/app/my-audits?status=Close`;
                }
            else if (frappe.session.user === "1394@sahayog.com") 
                {
                    root_element.querySelector('#allListBranch').href = `/app/my-audits?hr_user_status=%5B"is"%2C"set"%5D`;
                    root_element.querySelector('#pendingListBranch').href = `/app/my-audits?hr_user_status=Pending`;
                    root_element.querySelector('#ResponseListBranch').href = `/app/my-audits?hr_user_status=Responded`;
                    root_element.querySelector('#NoResponseListBranch').href = `/app/my-audits?hr_user_status=No Response`;
                    root_element.querySelector('#closeListBranch').href = `/app/my-audits?status=Close`;
                }
            else if (frappe.session.user === "914@sahayog.com") 
                {
                    root_element.querySelector('#allListBranch').href = `/app/my-audits?coo_user_status=%5B"is"%2C"set"%5D`;
                    root_element.querySelector('#pendingListBranch').href = `/app/my-audits?coo_user_status=Pending`;
                    root_element.querySelector('#ResponseListBranch').href = `/app/my-audits?coo_user_status=Responded`;
                    root_element.querySelector('#NoResponseListBranch').href = `/app/my-audits?coo_user_status=No Response`;
                    root_element.querySelector('#closeListBranch').href = `/app/my-audits?status=Close`;
                }
            else if (frappe.session.user === "1@sahayog.com") 
                {
                    root_element.querySelector('#allListBranch').href = `/app/my-audits?ceo_user_status=%5B"is"%2C"set"%5D`;
                    root_element.querySelector('#pendingListBranch').href = `/app/my-audits?ceo_user_status=Pending`;
                    root_element.querySelector('#ResponseListBranch').href = `/app/my-audits?ceo_user_status=Responded`;
                    root_element.querySelector('#NoResponseListBranch').href = `/app/my-audits?ceo_user_status=No Response`;
                    root_element.querySelector('#closeListBranch').href = `/app/my-audits?status=Close`;
                }
            else{
                root_element.querySelector('#allListBranch').href = `/app/my-audits?emp_branch=["in",[${branch}]]`;
                root_element.querySelector('#pendingListBranch').href = `/app/my-audits?${userStatusQuery}&emp_branch=["in",[${branch}]]`;
                root_element.querySelector('#ResponseListBranch').href = `/app/my-audits?${userStatusQueryResponse}&emp_branch=["in",[${branch}]]`;
                root_element.querySelector('#NoResponseListBranch').href = `/app/my-audits?${userStatusQueryNoResponse}&emp_branch=["in",[${branch}]]`;
                root_element.querySelector('#closeListBranch').href = `/app/my-audits?status=Close&emp_branch=["in",[${branch}]]`;
            }
                
            root_element.querySelector('#saperator').style.display = 'none';
            root_element.querySelector('#NewRequest').style.display = 'none';
            root_element.querySelector('#allList').style.display = 'none';
            root_element.querySelector('.tabs-nav').style.display = 'none';
            
            root_element.querySelector('#pending-container-1').style.display = 'none';
            root_element.querySelector('#pending-container-2').style.display = 'none';
          
            root_element.querySelector('#response-container-1').style.display = 'none';
            root_element.querySelector('#response-container-2').style.display = 'none';
            
            root_element.querySelector('#noresponse-container-1').style.display = 'none';
            root_element.querySelector('#noresponse-container-2').style.display = 'none';
        
        } 
        else if (userFlag === "AuditUser") {
            // User has an audit-related role but is not assigned to any stage
            root_element.querySelector('#ForAuditLevel1').style.display = 'none';
        }
        else if (userFlag === "OtherUser") {
            // User is neither assigned to any stage nor has an audit-related role
            root_element.querySelector('#message').innerHTML = "You do not have audit access.";
            root_element.querySelector('#saperator').style.display = 'none';
            root_element.querySelector('#ForAuditLevel1').style.display = 'none';
            root_element.querySelector('#NewRequest').style.display = 'none';
            root_element.querySelector('#allList').style.display = 'none';
            root_element.querySelector('.tabs-nav').style.display = 'none';
            
            root_element.querySelector('#pending-container-1').style.display = 'none';
            root_element.querySelector('#pending-container-2').style.display = 'none';
          
            root_element.querySelector('#response-container-1').style.display = 'none';
            root_element.querySelector('#response-container-2').style.display = 'none';
            
            root_element.querySelector('#noresponse-container-1').style.display = 'none';
            root_element.querySelector('#noresponse-container-2').style.display = 'none';
        
        }
    }
});

// Attach tab switch logic
const buttons = root_element.querySelectorAll('.tab-button');
const contents = root_element.querySelectorAll('.tab-content');

buttons.forEach(button => {
  button.addEventListener('click', function () {
    const tabName = this.getAttribute('data-tab');

    // Hide all tab contents
    contents.forEach(c => c.style.display = 'none');

    // Remove active class from all buttons
    buttons.forEach(b => b.classList.remove('active'));

    // Show selected tab and activate button
    this.classList.add('active');
    const selectedTab = root_element.querySelector(`#tab-${tabName}`);
    if (selectedTab) selectedTab.style.display = 'block';
  });
});

let reportTab = root_element.querySelector('#tab-report');
let overlay = root_element.querySelector('.report-overlay');      // global full-screen overlay
let message = root_element.querySelector('.report-message');      // global message text

// Show tab if user has the required role
if (
  frappe.user.has_role("Audit Manager") ||
  frappe.user.has_role("Administrator")
) {
  reportTab.style.display = "inline-block";
} else {
  reportTab.style.display = "none";
}

// On click, show overlay and animate message, then redirect
reportTab.addEventListener("click", function () {
  overlay.style.display = "flex";

  let dotCount = 1;
  const interval = setInterval(() => {
    dotCount = (dotCount % 3) + 1;
    message.textContent = "Opening report" + ".".repeat(dotCount);
  }, 500);

  setTimeout(() => {
    clearInterval(interval);
    window.location.href = "/app/query-report/My%20Audits%20Report";
  }, 3000);
});
"""
    css_content=""".asset-request-container * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
.report-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.report-message {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

/* Base Container */
.asset-request-container {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    color: #333;
    padding: 10px;
    background: transparent;
}

/* Header Section */
.Asset-Container {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.logo {
    width: 48px;
    height: 48px;
    object-fit: contain;
}

.intro {
    margin-left: 16px;
}

.emp-name {
    font-size: 14px;
    color: #666;
}

.welcome-text {
    font-size: 20px;
    font-weight: 600;
    color: #222;
    margin-top: 4px;
}

#NewRequest {
  padding: 12px 0;
  margin: 16px 0;
}

.new-request-actions {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.new-request-card {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dee2e6;
  border-left: 4px solid #6f42c1;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-width: 240px;
  max-width: 320px;
}

.new-request-card:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.text-group {
  display: flex;
  flex-direction: column;
}

.text-group .label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.text-group .sublabel {
  font-size: 12px;
  font-style: italic;
  color: #6c757d;
}


/* Widget Grid */
.widgets-container,
.widgets-container-ad {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    margin: 16px 0;
}

.widget {
    padding: 16px;
    border-radius: 8px;
    background: white;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
    border: 1px solid #e9ecef;
}

.widget:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.wid-title {
    font-size: 14px;
    font-weight: 500;
    color: #495057;
    margin-bottom: 12px;
}

.wid-content {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #212529;
}

.wid-content.red {
    color: #dc3545;
}

.wid-content.green {
    color: #28a745;
}

/* Status Dots */
.red-dot,
.green-dot,
.grey-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
}

.red-dot {
    background: #dc3545;
}

.green-dot {
    background: #28a745;
}

.grey-dot {
    background: #6c757d;
}

.value {
    font-weight: 600;
    margin-right: 4px;
}

/* Divider */
hr {
    border: 0;
    height: 1px;
    background: #e9ecef;
    margin: 16px 0;
}

/* Section Headers */
.widgets-container h2 {
    font-size: 18px;
    font-weight: 600;
    color: #343a40;
    margin: 8px 0;
    grid-column: 1 / -1;
}

/* Color Coding for Widgets */
#listLink, #allListBranch { border-left: 4px solid #6f42c1; }
#listDraft, #pendingListBranch { border-left: 4px solid #6610f2; }
#listClose, #ResponseListBranch { border-left: 4px solid #28a745; }
#listPendingAll, #closeListBranch { border-left: 4px solid #fd7e14; }

/* Pending Widgets (Red palette - 10 shades) */
#listPendingBM { border-left: 4px solid #ff0000; } /* Bright red */
#listPendingDH { border-left: 4px solid #ff5252; } /* Light red */
#listPendingCOM { border-left: 4px solid #ff1744; } /* Pinkish red */
#listPendingRM { border-left: 4px solid #d50000; } /* Dark red */
#listPendingROM { border-left: 4px solid #ff8a80; } /* Pale red */
#listPendingZM { border-left: 4px solid #c62828; } /* Brick red */
#listPendingZOM { border-left: 4px solid #ff3d00; } /* Orange-red */
#listPendingGM { border-left: 4px solid #b71c1c; } /* Deep red */
#listPendingHR { border-left: 4px solid #ff6e40; } /* Coral */
#listPendingCOO { border-left: 4px solid #dd2c00; } /* Rust */
#listPendingCEO { border-left: 4px solid #9e0000; } /* Maroon */

/* Response Widgets (Green palette - 10 shades) */
#listResponseBM { border-left: 4px solid #00c853; } /* Vibrant green */
#listResponseDH { border-left: 4px solid #64dd17; } /* Lime green */
#listResponseCOM { border-left: 4px solid #aeea00; } /* Chartreuse */
#listResponseRM { border-left: 4px solid #00e676; } /* Emerald */
#listResponseROM { border-left: 4px solid #76ff03; } /* Bright green */
#listResponseZM { border-left: 4px solid #1de9b6; } /* Teal green */
#listResponseZOM { border-left: 4px solid #00bfa5; } /* Sea green */
#listResponseGM { border-left: 4px solid #00b248; } /* Forest green */
#listResponseHR { border-left: 4px solid #b2ff59; } /* Light lime */
#listResponseCOO { border-left: 4px solid #4caf50; } /* Classic green */
#listResponseCEO { border-left: 4px solid #087f23; } /* Dark green */

/* No-Response Widgets (Blue palette - 11 shades) */
#listNoResponseBM { border-left: 4px solid #e3f2fd; }  /* Lightest Blue */
#listNoResponseDH { border-left: 4px solid #bbdefb; }  /* Sky Blue */
#listNoResponseCOM { border-left: 4px solid #90caf9; } /* Pale Blue */
#listNoResponseRM { border-left: 4px solid #64b5f6; }  /* Cool Blue */
#listNoResponseROM { border-left: 4px solid #42a5f5; } /* Moderate Blue */
#listNoResponseZM { border-left: 4px solid #2196f3; }  /* Standard Blue */
#listNoResponseZOM { border-left: 4px solid #1e88e5; } /* Slightly Darker */
#listNoResponseGM { border-left: 4px solid #1976d2; }  /* Dark Blue */
#listNoResponseHR { border-left: 4px solid #1565c0; }  /* Navy Blue */
#listNoResponseCOO { border-left: 4px solid #0d47a1; } /* Deep Blue */
#listNoResponseCEO { border-left: 4px solid #82b1ff; } /* Light Indigo */


/* Responsive Adjustments */
@media (max-width: 768px) {
    .widgets-container,
    .widgets-container-ad {
        grid-template-columns: 1fr 1fr;
    }
    
    .Asset-Container {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .intro {
        margin-left: 0;
        margin-top: 12px;
    }
}

@media (max-width: 480px) {
    .widgets-container,
    .widgets-container-ad {
        grid-template-columns: 1fr;
    }
    
    .welcome-text {
        font-size: 18px;
    }
    
    .label {
        font-size: 14px;
    }
}

/* Tab Navigation */
.tabs-nav {
    display: flex;
    gap: 8px;
    margin: 20px 0 16px 0;
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 8px;
}

.tab-button {
    padding: 8px 16px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #6c757d;
    border-radius: 4px;
    transition: all 0.2s ease;
    position: relative;
}

/* Hover for all tabs except active */
.tab-button:hover {
    color: #495057;
    background: #f8f9fa;
}

/* Active tab base styling */
.tab-button.active {
    background-color: #6f42c1;  /* Primary accent background */
    color: #ffffff;             /* White text for contrast */
    font-weight: 600;
}

/* Darker background on hover for active tab */
.tab-button.active:hover {
    background-color: #59359e;  /* Darker shade of #6f42c1 */
    color: #ffffff;
}

/* Remove underline effect if still present */
.tab-button.active::after {
    content: none;
}

/* Tab Content Areas (you'll need to add these classes to your content divs) */
.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}
"""

    custom_block = frappe.db.exists('Custom HTML Block', 'Audit Management')
    if custom_block:
        # Update the existing Custom HTML Block
        doc = frappe.get_doc('Custom HTML Block', 'Audit Management')
        doc.html = html_content
        doc.script = js_content
        doc.style = css_content
        doc.save()
        print("✅ Updated Custom HTML Block: Audit Management")

    else:
        # Create a new Custom HTML Block if it doesn't exist
        frappe.get_doc({
            'doctype': 'Custom HTML Block',
            'name': 'Audit Management',
            'html': html_content,
            'script': js_content,
            'style': css_content,
        }).insert()
        
        print("✅ Created Custom HTML Block: Audit Management")

