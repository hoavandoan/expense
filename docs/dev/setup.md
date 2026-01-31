# Developer Setup Guide

## Prerequisites

- **Required**:
    - [Node.js](https://nodejs.org/) (LTS recommended)
    - [Bun](https://bun.sh/) (Package Manager)
    - [Expo Go](https://expo.dev/go) app installed on your physical device (iOS/Android)
- **Optional**:
    - Xcode (for iOS Simulator on Mac)
    - Android Studio (for Android Emulator)

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd expense
    ```

2.  **Install dependencies**:
    ```bash
    bun install
    ```

## Development Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start the development server (clears cache by default). |
| `bun run ios` | Open in iOS Simulator. |
| `bun run android` | Open in Android Emulator. |
| `bun run web` | Open in Web Browser. |
| `bun run lint` | Run ESLint and type checking. |

## Environment Variables

Copy `.env.example` to `.env` (if available) and configure your Supabase credentials.

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
