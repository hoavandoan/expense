# Tech Stack

This project is a mobile application built with **Expo** and **React Native**.

## Core Technologies
- **Framework**: [Expo](https://expo.dev/) (Managed Workflow)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Runtime/Package Manager**: [Bun](https://bun.sh/)

## Frontend & UI
- **UI Component Library**: [HeroUI Native](https://v3.heroui.com/docs/native/getting-started)
- **Styling**: 
    - [Uniwind](https://uniwind.dev/) (Tailwind CSS for React Native)
    - Native CSS Variables (defined in `global.css`)
- **Icons**: [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
- **Animations**: `react-native-reanimated`, `react-native-gesture-handler`
- **Charts**: `react-native-gifted-charts`, `victory-native`
- **Safe Area**: `react-native-safe-area-context`

## State & Data Management
- **Global State**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching/Caching**: [TanStack React Query](https://tanstack.com/query/latest)
- **Form Handling**: `react-hook-form` with `zod` validation.
- **Database & Auth**: [Supabase](https://supabase.com/)

## Infrastructure & Utilities
- **Payment/QR**: `react-native-qrcode-svg`, VietQR custom logic.
- **Date/Time**: `Intl` API for formatting.
- **Storage**: `@react-native-async-storage/async-storage`.
