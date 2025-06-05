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
<div class=asset-request-container> 

<div class="Asset-Container">
    <div class="logo-img">
        <img src="/files/travel-agent.png" alt="Icon" class="logo">
        </div>
    
    <div class="intro">
        <div class="emp-name" id="emp-name"></div>
        <h4 class="welcome-text" id="message">Welcome to Audit Management</h4>
    </div>
</div>
<div  id="NewRequest">
    <hr>
    <a class="NewRequest" href="/app/my-audits/new-my-audits">
        <img src="/files/add-button.png" alt="Icon" class="create-icon">
        <span class="title">
           <span class="label">&nbsp;&nbsp;&nbsp;Create</span>
           <div class="sublabel"><i>New Query to Branch</i></div>
        </span>
    </a>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <a class="NewRequest" href="/app/audit-level?name=%5B%22is%22,%22set%22%5D">
        <img src="/files/add-button.png" alt="Icon" class="create-icon">
        <span class="title">
           <span class="label">Audit Level</span>
           <div class="sublabel"><i>Query Level For Branch</i></div>
        </span>
    </a>
    <hr>
   </div>
   
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
                <div class="wid-title">Draft Query</div>
                 <div class="wid-content">
                    <span class="red-dot"></span>
                    <span class="value" id="draftCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Drafted</span>
                </div>
            </div>
    </a>
    <a id="listClose"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Close Query</div>
                <div class="wid-content">
                    <span class="red-dot"></span>
                    <span class="value" id="closeCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Closed</span>
                </div>
            </div>
       
    </a>
     <a id="listPendingAll"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Pending Query</div>
                <div class="wid-content">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingAllCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending-Any</span>
                </div>
            </div>
       
    </a>
</div>
<hr id="saperator">
<!--Pending List-->
<div class="widgets-container" id="pending1">
<h2 style="padding:5px;">Pending Queries List</h2>
</div>
<div class="widgets-container" id="pending2">
    <a id="listPendingBM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Pending From BM</div>
                <div class="wid-content red">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingBMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending-BM</span>
                </div>
            </div>
       
    </a>
    <a id="listPendingDH"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Pending From DH</div>
                <div class="wid-content red">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingDHCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending-DH</span>
                </div>
            </div>
       
    </a>
    <a id="listPendingCOM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Pending From COM</div>
                <div class="wid-content red">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingCOMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending-COM</span>
                </div>
            </div>
       
    </a>
    <a id="listPendingRM" class="widget" href=""> 
            <div class="content-grid"  >
                <div class="wid-title">Pending From RM</div>
                <div class="wid-content red">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingRMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending-RM</span>
                </div>
                
            </div> 
        
    </a>
</div>
<div class="widgets-container" id="pending3">
    <a id="listPendingROM" class="widget" href="">
       
            <div class="content-grid">
                <div class="wid-title">Pending From ROM</div>
                 <div class="wid-content red">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingROMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending-ROM</span>
                </div>
            </div>
    </a>
    <a id="listPendingZM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Pending From ZM</div>
                <div class="wid-content red">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingZMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending-ZM</span>
                </div>
            </div>
       
    </a>
     <a id="listPendingZOM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Pending From ZOM</div>
                <div class="wid-content red">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingZOMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending-ZOM</span>
                </div>
            </div>
       
    </a>
    
</div>
<div class="widgets-container" id="pending4">
    <a id="listPendingGM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Pending From GM</div>
                <div class="wid-content red">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingGMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending-GM</span>
                </div>
            </div>
       
    </a>
    <a id="listPendingHR"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Pending From HR</div>
                <div class="wid-content red">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingHRCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending-HR</span>
                </div>
            </div>
       
    </a>
    <a id="listPendingCOO"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Pending From COO</div>
                <div class="wid-content red">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingCOOCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending-COO</span>
                </div>
            </div>
       
    </a>
    <a id="listPendingCEO"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Pending From CEO</div>
                <div class="wid-content red">
                    <span class="red-dot"></span>
                    <span class="value" id="pendingCEOCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Pending-CEO</span>
                </div>
            </div>
       
    </a>
</div>
<hr>
<!--Response List-->
<div class="widgets-container" id="response1">
<h2 style="padding:5px;">Response Queries List</h2>
</div>
<div class="widgets-container" id="response2">
    <a id="listResponseBM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Response From BM</div>
                <div class="wid-content green">
                    <span class="green-dot"></span>
                    <span class="value" id="responseBMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Response-BM</span>
                </div>
            </div>
       
    </a>
    <a id="listResponseDH"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Response From DH</div>
                <div class="wid-content green">
                    <span class="green-dot"></span>
                    <span class="value" id="responseDHCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Response-DH</span>
                </div>
            </div>
       
    </a>
    <a id="listResponseCOM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Response From COM</div>
                <div class="wid-content green">
                    <span class="green-dot"></span>
                    <span class="value" id="responseCOMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Response-COM</span>
                </div>
            </div>
       
    </a>
    <a id="listResponseRM" class="widget" href=""> 
            <div class="content-grid"  >
                <div class="wid-title">Response From RM</div>
                <div class="wid-content green">
                    <span class="green-dot"></span>
                    <span class="value" id="responseRMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Response-RM</span>
                </div>
                
            </div> 
        
    </a>
</div>
<div class="widgets-container" id="response3">
    <a id="listResponseROM" class="widget" href="">
       
            <div class="content-grid">
                <div class="wid-title">Response From ROM</div>
                 <div class="wid-content green">
                    <span class="green-dot"></span>
                    <span class="value" id="responseROMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Response-ROM</span>
                </div>
            </div>
    </a>
    <a id="listResponseZM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Response From ZM</div>
                <div class="wid-content green">
                    <span class="green-dot"></span>
                    <span class="value" id="responseZMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Response-ZM</span>
                </div>
            </div>
       
    </a>
     <a id="listResponseZOM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Response From ZOM</div>
                <div class="wid-content green">
                    <span class="green-dot"></span>
                    <span class="value" id="responseZOMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Response-ZOM</span>
                </div>
            </div>
       
    </a>
    
</div>
<div class="widgets-container" id="response4">
    <a id="listResponseGM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Response From GM</div>
                <div class="wid-content green">
                    <span class="green-dot"></span>
                    <span class="value" id="responseGMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Response-GM</span>
                </div>
            </div>
       
    </a>
    <a id="listResponseHR"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Response From HR</div>
                <div class="wid-content green">
                    <span class="green-dot"></span>
                    <span class="value" id="responseHRCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Response-HR</span>
                </div>
            </div>
       
    </a>
    <a id="listResponseCOO"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Response From COO</div>
                <div class="wid-content green">
                    <span class="green-dot"></span>
                    <span class="value" id="responseCOOCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Response-COO</span>
                </div>
            </div>
       
    </a>
    <a id="listResponseCEO"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">Response From CEO</div>
                <div class="wid-content green">
                    <span class="green-dot"></span>
                    <span class="value" id="responseCEOCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">Response-CEO</span>
                </div>
            </div>
       
    </a>
</div>
<hr>
<!--No-Response List-->
<div class="widgets-container" id="noresponse1">
<h2 style="padding:5px;">No-Response Queries List</h2>
</div>
<div class="widgets-container" id="noresponse2">
    <a id="listNoResponseBM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">No Response From BM</div>
                <div class="wid-content">
                    <span class="grey-dot"></span>
                    <span class="value" id="NoresponseBMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">No Reply-BM</span>
                </div>
            </div>
    </a>
    <a id="listNoResponseDH"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">No Response From DH</div>
                <div class="wid-content">
                    <span class="grey-dot"></span>
                    <span class="value" id="NoresponseDHCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">No Reply-DH</span>
                </div>
            </div>
       
    </a>
    <a id="listNoResponseCOM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">No Response From COM</div>
                <div class="wid-content">
                    <span class="grey-dot"></span>
                    <span class="value" id="NoresponseCOMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">No Reply-COM</span>
                </div>
            </div>
       
    </a>
    <a id="listNoResponseRM" class="widget" href=""> 
            <div class="content-grid"  >
                <div class="wid-title">No Response From RM</div>
                <div class="wid-content">
                    <span class="grey-dot"></span>
                    <span class="value" id="NoresponseRMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">No Reply-RM</span>
                </div>
                
            </div> 
        
    </a>
</div>
<div class="widgets-container" id="noresponse3">
    <a id="listNoResponseROM" class="widget" href="">
       
            <div class="content-grid">
                <div class="wid-title">No Response From ROM</div>
                 <div class="wid-content">
                    <span class="grey-dot"></span>
                    <span class="value" id="NoresponseROMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">No Reply-ROM</span>
                </div>
            </div>
    </a>
    <a id="listNoResponseZM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">No Response From ZM</div>
                <div class="wid-content">
                    <span class="grey-dot"></span>
                    <span class="value" id="NoresponseZMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">No Reply-ZM</span>
                </div>
            </div>
       
    </a>
     <a id="listNoResponseZOM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">No Response From ZOM</div>
                <div class="wid-content">
                    <span class="grey-dot"></span>
                    <span class="value" id="NoresponseZOMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">No Reply-ZOM</span>
                </div>
            </div>
       
    </a>
    
</div>
<div class="widgets-container" id="noresponse4">
    <a id="listNoResponseGM"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">No Response From GM</div>
                <div class="wid-content">
                    <span class="grey-dot"></span>
                    <span class="value" id="NoresponseGMCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">No Reply-GM</span>
                </div>
            </div>
       
    </a>
    <a id="listNoResponseHR"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">No Response From HR</div>
                <div class="wid-content">
                    <span class="grey-dot"></span>
                    <span class="value" id="NoresponseHRCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">No Reply-HR</span>
                </div>
            </div>
       
    </a>
    <a id="listNoResponseCOO"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">No Response From COO</div>
                <div class="wid-content">
                    <span class="grey-dot"></span>
                    <span class="value" id="NoresponseCOOCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">No Reply-COO</span>
                </div>
            </div>
       
    </a>
    <a id="listNoResponseCEO"  class="widget" href="">
            <div class="content-grid">
                <div class="wid-title">No Response From CEO</div>
                <div class="wid-content">
                    <span class="grey-dot"></span>
                    <span class="value" id="NoresponseCEOCount"></span> <!-- Placeholder for count -->
                    <span class="sublabel">No Reply-CEO</span>
                </div>
            </div>
       
    </a>
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
<hr>
</div>
<div class="widgets-container-ad" id="ForAuditLevel2">
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
    method: 'audit_management.audit_management.doctype.my_audits.my_audits.get_audit_level_for_user', // Replace with your correct method path
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
            root_element.querySelector('#ForAuditLevel2').style.display = 1;
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
            root_element.querySelector('#pending1').style.display = 'none';
            root_element.querySelector('#pending2').style.display = 'none';
            root_element.querySelector('#pending3').style.display = 'none';
            root_element.querySelector('#pending4').style.display = 'none';
            root_element.querySelector('#response1').style.display = 'none';
            root_element.querySelector('#response2').style.display = 'none';
            root_element.querySelector('#response3').style.display = 'none';
            root_element.querySelector('#response4').style.display = 'none';
            root_element.querySelector('#noresponse1').style.display = 'none';
            root_element.querySelector('#noresponse2').style.display = 'none';
            root_element.querySelector('#noresponse3').style.display = 'none';
            root_element.querySelector('#noresponse4').style.display = 'none';
        } 
        else if (userFlag === "AuditUser") {
            // User has an audit-related role but is not assigned to any stage
            root_element.querySelector('#ForAuditLevel1').style.display = 'none';
            root_element.querySelector('#ForAuditLevel2').style.display = 'none';
        }
        else if (userFlag === "OtherUser") {
            // User is neither assigned to any stage nor has an audit-related role
            root_element.querySelector('#message').innerHTML = "You do not have audit access.";
            root_element.querySelector('#saperator').style.display = 'none';
            root_element.querySelector('#ForAuditLevel1').style.display = 'none';
            root_element.querySelector('#ForAuditLevel2').style.display = 'none';
            root_element.querySelector('#NewRequest').style.display = 'none';
            root_element.querySelector('#allList').style.display = 'none';
            root_element.querySelector('#pending1').style.display = 'none';
            root_element.querySelector('#pending2').style.display = 'none';
            root_element.querySelector('#pending3').style.display = 'none';
            root_element.querySelector('#pending4').style.display = 'none';
            root_element.querySelector('#response1').style.display = 'none';
            root_element.querySelector('#response2').style.display = 'none';
            root_element.querySelector('#response3').style.display = 'none';
            root_element.querySelector('#response4').style.display = 'none';
            root_element.querySelector('#noresponse1').style.display = 'none';
            root_element.querySelector('#noresponse2').style.display = 'none';
            root_element.querySelector('#noresponse3').style.display = 'none';
            root_element.querySelector('#noresponse4').style.display = 'none';
        }
    }
});
"""
    css_content="""/* General Styles */
.logo {
    width: 80px;
}
#AuditLevel {
    display: none; /* Hide by default */
}

.Asset-Container {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 20px; /* Add some margin for better spacing */
}

.intro {
    margin-left: 15px;
}

.emp-name {
    margin-top: 18px;
    font-size: large;
}

.welcome-text {
    font-weight: bold;
    font-size: xx-large;
}

.asset-request-container {
    border: 1px solid #D9D9D9;
    padding: 10px;
    border-radius: 10px;
    margin-bottom: 15px;
    background : floralwhite;
}

.NewRequest {
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: transform 0.3s ease, cursor 0.3s ease, text-decoration 0.3s ease;
}

.NewRequest:hover {
    transform: translateY(-3px);
    cursor: pointer;
    text-decoration: none;
}

.create-icon {
    width: 60px;
    height: 60px;
    margin-right: 8px;
}

.label {
    font-weight: 700;
    margin-right: 8px;
    font-size: x-large;
}

.sublabel {
    font-size: 12px;
    font-weight: 500;
}

.widgets-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.widgets-container-ad {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}


.widget {
    position: relative;
    flex-direction: column;
    border-radius: 10px;
    background-color: #e3e3e3;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s, background-color 0.3s;
    text-decoration: none;
    flex-grow: 1;
    box-sizing: border-box;
    margin-bottom: 10px;
}



/* Widget Hover */
.widget:hover {
    transform: translateY(-5px);
    background-color: #eee;
    cursor: pointer;
    text-decoration: none;

}
.widget:hover .wid-title {
    font-size:17px;
}

.content-grid {
    justify-content: space-between;
}

.wid-title {
    font-size: 16px;
    padding-bottom:35px;
    font-weight: 400;
    transition: font-size 0.3s ease; /* Smooth transition for font size */
}

.wid-content {
    background-color: white;
    border-radius: 10px;
    padding: 15px 0px;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 140px;
    padding :10px;
}
.wid-content.red{
    color:#950606;
}
.wid-content.green{
    color:#06402b;
}

.red-dot {
    width: 6px;
    height: 6px;
    background-color: #950606;
    border-radius: 50%;
    margin-right: 3px;
}
.green-dot {
    width: 6px;
    height: 6px;
    background-color: #06402b;
    border-radius: 50%;
    margin-right: 3px;
}
.grey-dot {
    width: 6px;
    height: 6px;
    background-color: #677177;
    border-radius: 50%;
    margin-right: 3px;
}

.value {
    margin-right: 3px;
    font-size: 12px;
}

.no-requests-message {
    font-weight: bold;
    display: none;
    background-color: #d3f7cf;
    padding: 10px;
    border-radius: 5px;
    margin-top: 10px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.show-message {
    display: block !important;
}

/* Widget Colors */
#listLink ,#allListBranch{
    background-color: #E5DEF0;
}
#listDraft,#pendingListBranch {
    background-color: #CCCCFF;
}
#listClose , #ResponseListBranch{
    background-color: #95d5b2;
}
#listPendingAll ,#closeListBranch{
    background-color: #ff8fa3;
}

#listPendingBM {
    background-color: #E6F2FE;
}
#listPendingDH {
    background-color: #FFCCE7;
}

#listPendingCOM {
    background-color: #eed2cc;
}

#listPendingRM {
    background-color: #eaf4f4;
}

#listPendingROM {
    background-color: #cae9ff;
}

#listPendingZM {
    background-color: #e0fbfc;
}
#listPendingZOM {
    background-color: #CEFFD9;
}

#listPendingGM {
    background-color: #CCCEFF;
}

#listPendingCOO{
    background-color: #FFCDCD;
}
#listPendingCEO {
    background-color: #a3cef1;
}


#listNoResponseBM{
    background-color: #dfe7fd;
}
#listResponseDH{
    background-color: #f7d9c4;
}
#listResponseCOM{
    background-color: #a3cef1;
}
#listResponseRM{
    background-color: #e1e5f2;
}
#listResponseROM{
    background-color: #cfe1b9;
}
#listResponseZM{
    background-color: #ffcad4;
}
#listResponseZOM{
    background-color: #e0fbfc;
}
#listResponseGM{
    background-color: #e9cfff;
}
#listResponseCOO{
    background-color: #d8e2dc;
}
#listResponseCEO{
    background-color: #a3cef1;
}
#listNoResponseBM{
    background-color: #E6F2FE;
}
#listNoResponseDH{
    background-color: #e0fbfc;
}
#listNoResponseCOM{
    background-color: #a3cef1;
}
#listNoResponseRM{
    background-color: #e9cfff;
}
#listNoResponseROM{
    background-color: #ffcad4;
}
#listNoResponseZM{
    background-color: #e1e5f2;
}
#listNoResponseZOM{
    background-color: #e0fbfc;
}
#listNoResponseGM{
    background-color: #e9cfff;
}
#listNoResponseCOO{
    background-color: #d8e2dc;
}
#listNoResponseCEO{
    background-color: #a3cef1;
}


/* Media Queries */

/* For tablets and phones in landscape mode */
@media (max-width: 1024px) {
    .Asset-Container {
        flex-direction: column;
        align-items: flex-start;
    }
    .emp-name,.welcome-text{
        text-align:left;
    }

    .intro {
        margin-left: 0;
    }

    .NewRequest {
        align-items: flex-start;
        margin: 10px 0px;
    }

    .create-icon {
        width: 55px;
        height: 55px;
    }

    .widgets-container {
        flex-direction: column;
    }
    
    .widgets-container-ad {
        flex-direction: column;
    }

    .widget {
        flex-basis: calc(50% - 10px);
        max-width: calc(50% - 10px);
    }
}

/* For phones in portrait mode */
@media (max-width: 768px) {
    .Asset-Container {
        margin: 10px;
    }

    .intro {
        text-align: center;
        margin-left: 0;
        margin-bottom: 10px;
    }

    .welcome-text {
        font-size: x-large;
    }
    .emp-name,.welcome-text{
        text-align:left;
    }

    .asset-request-container {
        padding: 5px;
    }

    .NewRequest {
        align-items: left;
    }

    .create-icon {
        width: 55px;
        height: 55px;
    }

    .widgets-container {
        flex-direction: column;
    }
    
    .widgets-container-ad {
        flex-direction: column;
    }

    .widget {
        flex-basis: 100%;
        max-width: 100%;
        margin-bottom: 10px;
    }
}
.widget {
    padding: 20px;
    cursor: pointer;
    align-items: left;
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

