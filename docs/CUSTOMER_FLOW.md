# Customer Registration, Profile, and Search Flow

This document outlines the class structure and interaction sequences for customer registration, profile management, and searching for other customers based on blood type and proximity.

---

## Class Diagram

This diagram shows the main entities involved in the customer-related flows and their relationships.

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

This diagram shows the complete customer journey, from registration and profile setup to searching for other donors, with internal components grouped for simplicity.

```mermaid
sequenceDiagram
    actor User
    participant Clerk
    participant System as BloodLink System

    %% --- 1. Registration ---
    User->>+Clerk: Sign up
    Clerk-->>-User: Signup successful

    Clerk->>+System: Webhook: New user created
    System->>System: Create Account & Profile in database
    System-->>-Clerk: Acknowledge webhook

    Note over User, System: User completes their profile

    %% --- 2. Update Profile ---
    User->>+System: Update Profile (add location, blood type)
    System->>System: Find profile, update data, and save to database
    System->>+Clerk: Sync name change
    Clerk-->>-System: Sync complete
    System-->>-User: Return updated profile

    Note over User, System: User searches for nearby donors

    %% --- 3. Search ---
    User->>+System: Search for donors (bloodType, radius)
    System->>System: Find donors by blood type and filter by distance
    System-->>-User: Return matching donors

```
