# Project Design Patterns

These patterns are extracted from the `expense` project and represent the localized implementation of HeroUI Native.

## Card Patterns

### Animated Pressable Card
Used in `ExpenseCard` and `GroupCard`.
- **Logic**: Uses `react-native-reanimated` for scale feedback on press.
- **Feedback**: `spring` animation on `onPressIn` and `onPressOut`.

### Horizontal Card Layout
Used in `GroupCard` for wide items.
- **Anatomy**: `Card` -> `Image` (absolute) -> `LinearGradient` (overlay) -> `Card.Body`.

## Avatar Patterns

### Avatar Stacks
Used for list of participants or group members.
- **Pattern**: Negative margin (e.g., `-ml-3`) for overlapping effect.
- **Fallback**: Displaying initial if image is missing.

## BottomSheet Patterns

### Detached Mode
Used in `LoginBottomSheet`.
- **Props**: `detached={true}`, `className="mx-4"`.
- **Overlays**: Custom `BottomSheetBlurOverlay` for premium feel.

## Styling Constants
- **Rounding**: `rounded-2xl` for cards, `rounded-3xl` for bottom sheets.
- **Borders**: `border-divider/10` is the standard border token.
- **Backgrounds**: `bg-surface` for primary containers.
- **Conditional Class name**: `cn` is used for conditional class names.
