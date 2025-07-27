## Sequence Diagram

This diagram shows the detailed, end-to-end flow for a donation request, from creation to result retrieval.

```mermaid
sequenceDiagram
    actor Customer
    participant CustomerUI
    actor Staff
    participant StaffUI
    participant DonationController as :DonationController
    participant DonationService as :DonationService
    participant Database
    participant EmailService

    %% --- 1. Customer Creates Donation Request ---
    Customer->>+CustomerUI: Access donation request form
    CustomerUI->>+DonationController: Submit donation request
    DonationController->>+DonationService: Create donation request
    DonationService->>+Database: Validate campaign and donor eligibility
    Database-->>-DonationService: Return validation success
    DonationService->>+Database: Create CampaignDonation (status: APPOINTMENT_CONFIRMED) & Log
    Database-->>-DonationService: Confirm creation
    DonationService->>+EmailService: Send request received email
    EmailService-->>-DonationService: Confirm email sent
    DonationService-->>-DonationController: Return created request
    DonationController-->>-CustomerUI: Confirm request created
    CustomerUI-->>-Customer: Display success message

    %% --- 2. Staff Manages Request ---
    Note over Staff, StaffUI: Staff reviews and manages the request lifecycle.

    Staff->>+StaffUI: Access donation management dashboard
    StaffUI->>+DonationController: Update request status (e.g., to CUSTOMER_CHECKED_IN)
    DonationController->>+DonationService: Update request status
    DonationService->>+Database: Find and update request status & create log
    Database-->>-DonationService: Confirm update
    DonationService->>+EmailService: Send status update email
    EmailService-->>-DonationService: Confirm email sent
    DonationService-->>-DonationController: Return updated request
    DonationController-->>-StaffUI: Confirm status updated
    StaffUI-->>-Staff: Display update confirmation

    Note over Customer, Staff: Customer attends appointment and donation process

    %% --- 3. Staff Updates Results ---
    Staff->>+StaffUI: Access donation result form
    StaffUI->>+DonationController: Update donation result
    DonationController->>+DonationService: Update donation result
    DonationService->>+Database: Find donation request (must be COMPLETED)
    Database-->>-DonationService: Return request
    DonationService->>+Database: Update DonationResult & set request status to RESULT_RETURNED
    Database-->>-DonationService: Confirm result saved
    DonationService->>+EmailService: Send results available email
    EmailService-->>-DonationService: Confirm email sent
    DonationService-->>-DonationController: Return updated result
    DonationController-->>-StaffUI: Confirm result updated
    StaffUI-->>-Staff: Display result update confirmation

    %% --- 4. Customer Views Results ---
    Customer->>+CustomerUI: Access donation history/results
    CustomerUI->>+DonationController: Request to view donation result
    DonationController->>+DonationService: Get donation result
    DonationService->>+Database: Find donation result by request ID
    Database-->>-DonationService: Return result details
    DonationService-->>-DonationController: Return result details
    DonationController-->>-CustomerUI: Return result details
    CustomerUI-->>-Customer: Display donation results
```

---

## Class Diagram

This diagram shows the main backend entities and services involved in the donation flow and their relationships.

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

    class DonationController {
        +createDonationRequest()
        +updateDonationStatus()
        +updateDonationResult()
        +getDonationResult()
    }

    class DonationService {
        +createDonationRequest()
        +updateDonationRequestStatus()
        +updateDonationResult()
        +getDonationResultByDonationId()
        +sendStatusChangeEmail()
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
        +Int volumeMl
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

    class EmailService {
        +sendEmail()
        +convertToHTML()
    }

    class Database {
        <<External>>
        +findOne()
        +persistAndFlush()
        +findAndCount()
    }

    Customer -- DonationController : calls API
    Staff -- DonationController : calls API
    DonationController -- DonationService : uses
    DonationService -- Database : queries
    DonationService -- EmailService : uses

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
    [*] --> APPOINTMENT_CONFIRMED: Request Created (Default Status)

    APPOINTMENT_CONFIRMED --> CUSTOMER_CHECKED_IN: Customer checks in at venue
    APPOINTMENT_CONFIRMED --> APPOINTMENT_CANCELLED: Staff cancels appointment
    APPOINTMENT_CONFIRMED --> APPOINTMENT_ABSENT: Customer does not show up
    APPOINTMENT_CONFIRMED --> CUSTOMER_CANCELLED: Customer cancels

    CUSTOMER_CHECKED_IN --> COMPLETED: Donation process completed
    CUSTOMER_CHECKED_IN --> NOT_QUALIFIED: Customer not qualified for donation
    CUSTOMER_CHECKED_IN --> NO_SHOW_AFTER_CHECKIN: Customer leaves after check-in

    COMPLETED --> RESULT_RETURNED: Staff returns test results

    APPOINTMENT_CANCELLED --> [*]
    APPOINTMENT_ABSENT --> [*]
    CUSTOMER_CANCELLED --> [*]
    NOT_QUALIFIED --> [*]
    NO_SHOW_AFTER_CHECKIN --> [*]
    RESULT_RETURNED --> [*]
```
