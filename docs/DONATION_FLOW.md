## Sequence Diagram

This diagram shows the detailed, end-to-end flow for a donation request, from creation to result retrieval.

```mermaid
sequenceDiagram
    actor Customer
    actor Staff
    participant DonationController
    participant DonationService
    participant Database
    participant EmailService

    %% --- 1. Customer Creates Donation Request ---
    Customer->>+DonationController: Submit donation request
    DonationController->>+DonationService: Create donation request(data)
    DonationService->>+Database: Validate campaign and donor eligibility
    Database-->>-DonationService: Return validation success
    DonationService->>+Database: Create CampaignDonation (status: PENDING) & Log
    Database-->>-DonationService: Confirm creation
    DonationService->>+EmailService: Send request received email
    EmailService-->>-DonationService: Confirm email sent
    DonationService-->>-DonationController: Return created request
    DonationController-->>-Customer: Confirm request created

    %% --- 2. Staff Manages Request ---
    Note over Staff, DonationController: Staff reviews and manages the request lifecycle.

    Staff->>+DonationController: Update request status (e.g., to APPOINTMENT_CONFIRMED)
    DonationController->>+DonationService: Update request status(id, newStatus)
    DonationService->>+Database: Find and update request status & create log
    Database-->>-DonationService: Confirm update
    DonationService->>+EmailService: Send status update email (e.g., appointment confirmed)
    EmailService-->>-DonationService: Confirm email sent
    DonationService-->>-DonationController: Return updated request
    DonationController-->>-Staff: Confirm status updated

    Note over Customer, Staff: Customer attends appointment and completes donation. Staff updates status accordingly (Checked-in, Completed).

    %% --- 3. Staff Updates Results ---
    Staff->>+DonationController: Update donation result(id, results)
    DonationController->>+DonationService: Update donation result(id, results)
    DonationService->>+Database: Find donation request (must be COMPLETED)
    Database-->>-DonationService: Return request
    DonationService->>+Database: Update DonationResult & set request status to RESULT_RETURNED
    Database-->>-DonationService: Confirm result saved
    DonationService->>+EmailService: Send results available email
    EmailService-->>-DonationService: Confirm email sent
    DonationService-->>-DonationController: Return updated result
    DonationController-->>-Staff: Confirm result updated

    %% --- 4. Customer Views Results ---
    Customer->>+DonationController: Request to view donation result
    DonationController->>+DonationService: Get donation result(id)
    DonationService->>+Database: Find donation result by request ID
    Database-->>-DonationService: Return result details
    DonationService-->>-DonationController: Return result details
    DonationController-->>-Customer: Display result details
```

---

## Class Diagram

This diagram shows the main entities involved in the donation flow and their relationships, reflecting the latest database schema.

```mermaid
classDiagram
    direction LR

    class Customer {
        +String id
        +String firstName
        +String email
        +Date lastDonationDate
        +createDonationRequest()
        +cancelDonationRequest()
    }

    class Staff {
        +String id
        +String name
        +StaffRole role
        +updateDonationStatus()
        +updateDonationResult()
    }

    class Campaign {
        +String id
        +String name
        +Date startDate
        +Date endDate
        +CampaignStatus status
    }

    class CampaignDonation {
        +String id
        +CampaignDonationStatus currentStatus
        +Date appointmentDate
    }

    class CampaignDonationLog {
        +String id
        +CampaignDonationStatus status
        +String note
    }

    class DonationResult {
        +String id
        +Int volumeMl
        +BloodGroup bloodGroup
        +BloodRh bloodRh
        +DonationResultStatus status
    }

    class DonationReminder {
        +String id
        +String message
        +ReminderType type
    }

    Customer "1" -- "0..*" CampaignDonation : creates
    Customer "1" -- "0..*" DonationReminder : receives
    Campaign "1" -- "0..*" CampaignDonation : includes
    Staff "1" -- "0..*" CampaignDonationLog : creates
    Staff "1" -- "0..*" DonationResult : processes
    CampaignDonation "1" -- "1..*" CampaignDonationLog : has
    CampaignDonation "1" -- "0..1" DonationResult : has
    CampaignDonation "1" -- "0..*" DonationReminder : triggers

```

---

## State Machine Diagram

This diagram illustrates the lifecycle of a `CampaignDonation` request, showing all possible statuses and the transitions between them.

```mermaid
stateDiagram-v2
    [*] --> PENDING: Request Created

    PENDING --> APPOINTMENT_CONFIRMED: Staff confirms appointment
    PENDING --> REJECTED: Staff rejects request
    PENDING --> CUSTOMER_CANCELLED: Customer cancels

    APPOINTMENT_CONFIRMED --> CUSTOMER_CHECKED_IN: Customer checks in at venue
    APPOINTMENT_CONFIRMED --> APPOINTMENT_CANCELLED: Staff cancels appointment
    APPOINTMENT_CONFIRMED --> APPOINTMENT_ABSENT: Customer does not show up
    APPOINTMENT_CONFIRMED --> CUSTOMER_CANCELLED: Customer cancels (>24h before)

    CUSTOMER_CHECKED_IN --> COMPLETED: Donation process is finished

    COMPLETED --> RESULT_RETURNED: Staff returns test results

    REJECTED --> [*]
    CUSTOMER_CANCELLED --> [*]
    APPOINTMENT_CANCELLED --> [*]
    APPOINTMENT_ABSENT --> [*]
    RESULT_RETURNED --> [*]
```
