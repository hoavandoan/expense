# Technology Stack

## 1. Frontend (Mobile)
- **Framework**: [Expo SDK 54](https://expo.dev/) (React Native 0.81)
- **Language**: TypeScript 5.9+
- **Navigation**: Expo Router (File-system based routing)
- **Runtime**: Bun (Package Manager & Script Runner)

### Core Libraries
- **UI Components**: `heroui-native` (Beta)
- **Styling**: `uniwind` (Tailwind CSS 4.x for Native) + `nativewind` concepts
- **Animations**: `react-native-reanimated` v4
- **Gestures**: `react-native-gesture-handler`
- **Charts**: `react-native-gifted-charts`, `victory-native`
- **Icons**: `lucide-react-native`

### Data & State
- **Server State**: `@tanstack/react-query` v5
- **Global Store**: `zustand` v5
- **Forms**: `react-hook-form` + `@hookform/resolvers`
- **Validation**: `zod`

## 2. Backend (Supabase)
- **Database**: PostgreSQL 15
- **Authentication**: GoTrue (JWT based)
- **Realtime**: Supabase Realtime (WebSockets)
- **Storage**: Supabase Storage (S3 compatible)

## 3. DevOps & Tooling
- **Build**: EAS Build
- **Linting**: ESLint + Prettier
- **Assets**: `expo-image` (Optimized image loading)
- **QR Codes**: `react-native-qrcode-svg`
