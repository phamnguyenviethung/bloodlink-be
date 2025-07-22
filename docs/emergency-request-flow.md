# Emergency Request Flow

This document describes the business flow for Emergency Requests, involving three roles: **Staff**, **User**, and **Hospital**.

---

## Business Flow Overview

### **Case 1: Hospital-Initiated Emergency Request**

- **Hospital** submits an emergency request (blood type, volume, etc.).
- **Staff** reviews the request and can:
  - **Accept**: Assign a blood unit, set used volume, and approve the request.
  - **Reject**: Provide a rejection reason.
  - **Reject All**: (If implemented) Reject all similar requests for the same blood type.
- All actions are logged for audit.

### **Case 2: User-Initiated Emergency Request**

- **User** submits an emergency request (blood type, volume, etc.).
- **Staff** reviews the request and, instead of assigning a blood unit, provides the contact information of people with the same blood type so the requester can proactively contact them.
- **User** receives the contact list and can follow up directly.

---

## Mermaid Sequence Diagram

```mermaid
sequenceDiagram
    %% Hospital Case
    participant Hospital
    participant User
    participant Staff
    participant EmergencyRequestService
    participant DB

    %% Hospital submits request
    Hospital->>EmergencyRequestService: POST /emergency-requests (blood type, volume, etc.)
    EmergencyRequestService->>DB: Create EmergencyRequest (status: PENDING)
    DB-->>EmergencyRequestService: EmergencyRequest created
    EmergencyRequestService-->>Hospital: EmergencyRequestResponse

    %% Staff reviews hospital request
    Staff->>EmergencyRequestService: GET /emergency-requests/:id
    EmergencyRequestService->>DB: Fetch EmergencyRequest
    DB-->>EmergencyRequestService: EmergencyRequest data

    alt Accept
        Staff->>EmergencyRequestService: PATCH /emergency-requests/:id/approve (assign blood unit, used volume)
        EmergencyRequestService->>DB: Assign blood unit, update status to APPROVED, update blood unit volume
        EmergencyRequestService->>DB: Log approval
        DB-->>EmergencyRequestService: Updated EmergencyRequest
        EmergencyRequestService-->>Staff: EmergencyRequestResponse (APPROVED)
        EmergencyRequestService-->>Hospital: EmergencyRequestResponse (APPROVED)
    else Reject
        Staff->>EmergencyRequestService: PATCH /emergency-requests/:id/reject (reason)
        EmergencyRequestService->>DB: Update status to REJECTED, log rejection
        DB-->>EmergencyRequestService: Updated EmergencyRequest
        EmergencyRequestService-->>Staff: EmergencyRequestResponse (REJECTED)
        EmergencyRequestService-->>Hospital: EmergencyRequestResponse (REJECTED)
    else Reject All
        Staff->>EmergencyRequestService: PATCH /emergency-requests/reject-all (blood type, reason)
        EmergencyRequestService->>DB: Update all matching requests to REJECTED, log rejections
        DB-->>EmergencyRequestService: Updated EmergencyRequests
        EmergencyRequestService-->>Staff: Bulk rejection response
        EmergencyRequestService-->>Hospital: EmergencyRequestResponse (REJECTED)
    end

    %% User Case
    User->>EmergencyRequestService: POST /emergency-requests (blood type, volume, etc.)
    EmergencyRequestService->>DB: Create EmergencyRequest (status: PENDING)
    DB-->>EmergencyRequestService: EmergencyRequest created
    EmergencyRequestService-->>User: EmergencyRequestResponse

    Staff->>EmergencyRequestService: GET /emergency-requests/:id
    EmergencyRequestService->>DB: Fetch EmergencyRequest
    DB-->>EmergencyRequestService: EmergencyRequest data

    %% Staff provides contact info instead of blood unit
    Staff->>EmergencyRequestService: Provide contact info for matching donors
    EmergencyRequestService->>DB: Query users with same blood type
    DB-->>EmergencyRequestService: List of contacts
    EmergencyRequestService-->>Staff: Contact list
    Staff-->>User: Send contact list for proactive outreach
```

---

**How to use:**

- Copy the above Mermaid script.
- Paste it into your documentation markdown file or any Mermaid live editor.
- Render to visualize the business flow for both Hospital and User emergency requests.
