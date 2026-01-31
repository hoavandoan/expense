# Project Requirement Document (PRD)

**Project Name**: SplitSmart (Expense)
**Version**: 1.0
**Status**: Active Development

## 1. Introduction

### 1.1 Purpose
SplitSmart is a mobile application designed to simplify expense sharing among groups of people (roommates, travelers, friends). It allows users to track shared expenses, calculate debts, and settle up easily using integrated payment methods (VietQR).

### 1.2 Target Audience
- Roommates sharing living expenses.
- Groups traveling together.
- Friends organizing events or parties.

## 2. Core Features & Functional Requirements

### 2.1 Authentication
- **User Registration**: Sign up via Email/Password or OAuth (Google/Apple).
- **User Profile**: Manage display name, avatar, and payment information (QR codes).
- **Session Management**: Secure persistent login state.

### 2.2 Group Management
- **Create Group**: Users can create new expense groups.
- **Join Group**:
    - Via Invite Code.
    - Via QR Code scan.
- **Group Settings**:
    - Edit group name and cover image.
    - Manage members (View list, roles).
    - Leave/Delete group.

### 2.3 Expense Management
- **Add Expense**:
    - Enter amount, description, and date.
    - Select payer (single user).
    - Select participants (split equally or custom/unequal logic).
    - Attach images/receipts (future).
- **View Expenses**: List of all expenses in a group, sorted by date.
- **Expense Details**: View split breakdown and participants.

### 2.4 Debts & Settlement
- **Debt Calculation**: Automatic calculation of "who owes whom" based on simplified debt graph.
- **Settle Up**:
    - Record a payment between two users.
    - Integration with VietQR for easy bank transfers.
    - Confirmation flow (Payer claims payment -> Receiver confirms).

### 2.5 Notifications & Activity
- **Activity Feed**: Log of all actions within a group (Expense added, Settlement completed).
- **Push Notifications**: Real-time alerts for new expenses or debt requests.

## 3. Non-Functional Requirements

- **Performance**: Offline-first capability for key actions (viewing data).
- **Security**: Data isolation via RLS (Row Level Security).
- **Usability**: "Premium" UI/UX with smooth transitions and haptic feedback.
- **Platform**: Support for iOS and Android devices.
