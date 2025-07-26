# Customer Registration, Profile, and Search Flow

---

## Class Diagram

```mermaid
classDiagram
    direction LR

    class ClerkUser {
        <<External>>
        +String id
        +String email
        +String firstName
        +String lastName
    }

    class CustomerService {
        +getMe(customerId)
        +updateCustomer(customerId, data)
        +findCustomersByBloodTypeWithinRadius(customerId, params)
    }

    class Customer {
        +String id
        +String firstName
        +String lastName
        +String gender
        +Date dateOfBirth
        +String citizenId
        +String latitude
        +String longitude
    }

    class Account {
        +String id
        +String email
        +AccountRole role
    }

    class BloodType {
        +String id
        +BloodGroup group
        +BloodRh rh
    }

    ClerkUser "1" -- "1" Account : Synced via Webhook/API
    Account "1" -- "1" Customer : Has a
    Customer "1" -- "0..1" BloodType : Has a
    CustomerService ..> Customer : Manages
    CustomerService ..> Account : Manages
    CustomerService ..> BloodType : Manages
    CustomerService ..> ClerkUser : Syncs with

```

---

## Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant Clerk
    participant CustomerController
    participant CustomerService
    participant Database

    %% --- 1. Registration (Webhook) ---
    Note over Clerk, CustomerService: The registration process is initiated by a Clerk webhook, not direct user interaction with the API.
    Clerk->>+CustomerController: Send 'user.created' webhook
    CustomerController->>+CustomerService: Handle user creation(webhookData)
    CustomerService->>+Database: Create Account & Customer profile
    Database-->>-CustomerService: Return created entities
    CustomerService-->>-CustomerController: Confirm profile creation
    CustomerController-->>-Clerk: Acknowledge webhook (200 OK)

    Note over User, CustomerController: User decides to complete their profile after registration.

    %% --- 2. Profile Update ---
    User->>+CustomerController: Request to update profile
    CustomerController->>+CustomerService: Update customer profile
    CustomerService->>+Database: Find Customer by ID
    Database-->>-CustomerService: Return Customer entity
    CustomerService->>CustomerService: Assign new profile data
    alt If blood type is provided
        CustomerService->>+Database: Find or Create BloodType
        Database-->>-CustomerService: Return BloodType entity
    end
    CustomerService->>+Database: Save updated Customer profile
    Database-->>-CustomerService: Confirm profile saved
    CustomerService->>+Clerk: Sync user's name
    Clerk-->>-CustomerService: Confirm sync complete
    CustomerService-->>-CustomerController: Return updated profile
    CustomerController-->>-User: Return updated profile

    Note over User, CustomerController: Later, user searches for nearby donors.

    %% --- 3. Find Nearby Donors ---
    User->>+CustomerController: Request to find donors
    CustomerController->>+CustomerService: Find nearby customers
    CustomerService->>+Database: Get current user's location
    Database-->>-CustomerService: Return user's location
    CustomerService->>+Database: Find all customers with specified blood type
    Database-->>-CustomerService: Return list of potential customers
    Note over CustomerService: Filter results by calculating distance and checking if within radius.
    CustomerService-->>-CustomerController: Return list of matching customers
    CustomerController-->>-User: Return list of matching customers

```
