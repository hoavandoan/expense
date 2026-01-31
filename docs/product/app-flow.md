# App Flow & Navigation

This document visualizes the core user flows and screen transitions within the application.

## 1. High-Level Navigation Map

```mermaid
graph TD
    Start((Launch)) --> AuthCheck{Authenticated?}
    
    AuthCheck -->|No| OnboardingFlow
    AuthCheck -->|Yes| MainTabs
    
    subgraph OnboardingFlow [Onboarding]
        Welcome[Welcome Screen]
        Login[Login / Sign Up]
        Tutorial[Tutorial / Intro]
    end
    
    subgraph MainTabs [Main App (Tabs)]
        TabHome[Home Tab]
        TabGroups[Groups Tab]
        TabActivity[Activity Tab]
        TabProfile[Profile Tab]
        TabPlus[(+)]
    end
    
    OnboardingFlow --> MainTabs
    
    TabGroups --> GroupDetail[Group Detail Screen]
    TabPlus --> AddExpense[Add Expense Modal]
    TabPlus --> AddGroup[Add Group Modal]
    
    GroupDetail --> GroupSettings[Group Settings]
    GroupDetail --> SettleUp[Settle Up Flow]
```

## 2. Detailed User Flows

### 2.1 Expense Creation Flow

```mermaid
sequenceDiagram
    actor User
    participant Home as Home Screen
    participant Modal as Add Expense Modal
    participant API as Backend
    
    User->>Home: Taps (+) Button
    Home->>Modal: Opens Modal
    
    User->>Modal: Enters Amount
    User->>Modal: Selects Group
    User->>Modal: Selects Payer & Split
    User->>Modal: Taps "Save"
    
    Modal->>API: POST /expenses
    API-->>Modal: Success
    Modal-->>Home: Closes & Toast Success
    Home->>Home: Refresh List
```

### 2.2 Settlement Flow

```mermaid
flowchart LR
    Start([User A owes User B]) --> ClickSettle[Click 'Settle Up']
    ClickSettle --> SelectAmount[Enter Amount]
    SelectAmount --> ScanQR{Scan QR?}
    
    ScanQR -->|Yes| VietQR[Open VietQR Interop]
    ScanQR -->|No| Manual[Manual Confirmation]
    
    VietQR --> RequestSent[Payment Request Sent]
    Manual --> RequestSent
    
    RequestSent --> UserB[User B Receives Notification]
    UserB --> Confirm{Confirm?}
    
    Confirm -->|Yes| Done[Debt Cleared]
    Confirm -->|No| Reject[Request Rejected]
```
