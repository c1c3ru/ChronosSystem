# Accessibility and UX Improvements

This document describes the accessibility and user experience improvements implemented in the Chronos System application.

## 🎯 Overview

All 7 improvement areas have been successfully implemented:

- ✅ **ALTA**: ARIA attributes and keyboard navigation
- ✅ **ALTA**: Enhanced error messages
- ✅ **MÉDIA**: Basic offline mode
- ✅ **MÉDIA**: Image optimization
- ✅ **BAIXA**: Loading skeletons
- ✅ **BAIXA**: Haptic feedback
- ✅ **BAIXA**: Page transitions

## 🔴 High Priority Improvements

### 1. ARIA Attributes and Keyboard Navigation

#### Enhanced Components

**Button Component** (`components/ui/Button.tsx`)
- Added `aria-disabled` and `aria-busy` attributes
- Implemented keyboard event handlers for Enter and Space keys
- Added screen reader text for loading states
- Loading spinner marked with `aria-hidden="true"`

**Input Component** (`components/ui/Input.tsx`)
- Added `aria-invalid` for error states
- Implemented `aria-describedby` linking to error/helper text
- Added `aria-required` for required fields
- Unique IDs generated using React.useId()
- Optional label support with proper htmlFor association
- Error messages announced with `role="alert"` and `aria-live="assertive"`

**Alert Component** (`components/ui/Alert.tsx`)
- Added `aria-live` regions (polite for default, assertive for errors)
- Added `aria-atomic="true"` for complete message reading
- Icons added for visual feedback (marked with `aria-hidden="true"`)
- Supports variants: default, destructive, warning, success

**Loading Component** (`components/ui/Loading.tsx`)
- Added `role="status"`, `aria-live="polite"`, and `aria-busy="true"`
- Screen reader text for loading states
- Loading spinner marked with `aria-hidden="true"`

#### Accessibility Utilities

**Screen Reader Only Class** (`app/globals.css`)
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  /* ... visually hidden but accessible */
}
```

**Skip Navigation** (`app/globals.css`)
```css
.skip-to-content {
  /* Hidden until focused, then appears at top */
}
```

**Keyboard Shortcuts** (`lib/keyboard-shortcuts.ts`)
- Global keyboard shortcut manager
- Prevents shortcuts when typing in inputs (except Escape)
- Common shortcuts defined (Escape, Enter, Arrow keys, etc.)
- Utilities to find focusable elements

**Focus Management** (`lib/focus-management.ts`)
- `FocusTrap` class for modals and dialogs
- Focus restoration after modal close
- `RovingTabIndex` for component groups (tabs, radio buttons)
- Arrow key navigation support

### 2. Enhanced Error Messages

#### Error System Enhancements (`lib/errors.ts`)

All error classes now include:
- `userMessage`: User-friendly error message
- `technicalDetails`: Technical information for debugging
- `recoveryActions`: Array of suggested actions with labels and descriptions
- `severity`: Error severity level (low, medium, high, critical)

Example:
```typescript
new UnauthorizedError()
// Returns:
// - userMessage: "Você precisa estar autenticado para acessar este recurso."
// - recoveryActions: [
//     { label: 'Fazer login', action: '/auth/signin' },
//     { label: 'Voltar', action: 'back' }
//   ]
```

#### New Components

**ErrorMessage Component** (`components/ui/ErrorMessage.tsx`)
- Displays user-friendly error messages
- Shows recovery action buttons
- Severity-based styling
- Default action handlers (back, refresh, retry, navigation)

**ErrorBoundary Component** (`components/ErrorBoundary.tsx`)
- Catches React errors globally
- Displays user-friendly error UI
- Shows recovery actions
- Technical details in development mode
- Integrated into app providers

## 🟡 Medium Priority Improvements

### 3. Basic Offline Mode

**Online Status Hook** (`lib/hooks/useOnlineStatus.ts`)
- Detects online/offline status using `navigator.onLine`
- Listens to `online` and `offline` events
- Tracks `wasOffline` state for reconnection messages

**Offline Indicator** (`components/OfflineIndicator.tsx`)
- Shows banner when offline
- Shows success message when connection restored
- Smooth animations using Framer Motion
- Automatically integrated into app providers

**Usage:**
```tsx
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'

function MyComponent() {
  const { isOnline, isOffline, wasOffline } = useOnlineStatus()
  // Use status to show offline UI or queue requests
}
```

### 4. Image Optimization

**Next.js Image Configuration** (`next.config.js`)
- WebP and AVIF format support
- Optimized device sizes and image sizes
- Minimum cache TTL of 60 seconds
- SVG support with security policies

**OptimizedImage Component** (`components/ui/OptimizedImage.tsx`)
- Wrapper around `next/image` with defaults
- Lazy loading by default
- Blur placeholder during load
- Error fallback support
- Responsive sizes configuration
- Quality set to 85 by default

**Usage:**
```tsx
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
/>
```

## 🟢 Low Priority Improvements

### 5. Loading Skeletons

**Base Skeleton Component** (`components/ui/Skeleton.tsx`)
- Variants: text, circular, rectangular
- Animation options: pulse, wave, none
- Helper components: `SkeletonText`, `SkeletonAvatar`

**Specialized Skeletons** (`components/skeletons/`)
- **CardSkeleton**: Mimics card structure with optional image and actions
- **TableSkeleton**: Configurable rows and columns
- **FormSkeleton**: Form fields with labels and inputs
- **ListSkeleton**: List items with optional avatars and actions

**Usage:**
```tsx
import { CardSkeleton } from '@/components/skeletons'

function MyPage() {
  const { data, isLoading } = useData()
  
  if (isLoading) return <CardSkeleton />
  return <Card>{data}</Card>
}
```

### 6. Haptic Feedback

**Haptic Utilities** (`lib/haptic.ts`)
- Predefined patterns: light, medium, heavy, success, error, warning, selection
- Feature detection for Vibration API
- Respects `prefers-reduced-motion` preference
- Convenience methods: `haptic.tap()`, `haptic.success()`, etc.

**useHaptic Hook** (`lib/hooks/useHaptic.ts`)
- React hook for haptic feedback
- Returns trigger functions for all patterns
- Includes feature detection state

**Usage:**
```tsx
import { useHaptic } from '@/lib/hooks/useHaptic'

function MyButton() {
  const { tap, success } = useHaptic()
  
  const handleClick = () => {
    tap() // Light haptic feedback
    // ... perform action
    success() // Success haptic pattern
  }
  
  return <button onClick={handleClick}>Click me</button>
}
```

### 7. Page Transitions

**PageTransition Component** (`components/PageTransition.tsx`)
- Smooth transitions using Framer Motion
- Three variants: fade, slide, scale
- Configurable duration
- Uses pathname as key for route changes

**CSS Enhancements** (`app/globals.css`)
- Shimmer animation for skeletons
- Smooth scroll behavior
- Respects `prefers-reduced-motion` preference

**Usage:**
```tsx
import { PageTransition } from '@/components/PageTransition'

export default function Layout({ children }) {
  return (
    <PageTransition variant="fade">
      {children}
    </PageTransition>
  )
}
```

## 📦 New Files Created

### Components
- `components/ui/ErrorMessage.tsx` - Error message display
- `components/ui/Skeleton.tsx` - Base skeleton component
- `components/ui/OptimizedImage.tsx` - Optimized image wrapper
- `components/ErrorBoundary.tsx` - React error boundary
- `components/OfflineIndicator.tsx` - Offline status indicator
- `components/PageTransition.tsx` - Page transition wrapper
- `components/skeletons/CardSkeleton.tsx`
- `components/skeletons/TableSkeleton.tsx`
- `components/skeletons/FormSkeleton.tsx`
- `components/skeletons/ListSkeleton.tsx`
- `components/skeletons/index.ts`

### Utilities
- `lib/keyboard-shortcuts.ts` - Keyboard shortcut manager
- `lib/focus-management.ts` - Focus management utilities
- `lib/haptic.ts` - Haptic feedback utilities
- `lib/hooks/useHaptic.ts` - Haptic feedback hook
- `lib/hooks/useOnlineStatus.ts` - Online status hook

## 🔧 Modified Files

### Components
- `components/ui/Button.tsx` - Added ARIA attributes and keyboard support
- `components/ui/Input.tsx` - Added ARIA attributes and label support
- `components/ui/Alert.tsx` - Added ARIA live regions and icons
- `components/ui/Loading.tsx` - Added ARIA attributes
- `components/ui/index.ts` - Updated exports

### Configuration
- `next.config.js` - Enhanced image optimization
- `app/globals.css` - Added accessibility utilities and animations
- `app/providers.tsx` - Added ErrorBoundary and OfflineIndicator

### Error Handling
- `lib/errors.ts` - Enhanced with user messages and recovery actions

## 🧪 Testing Recommendations

### Accessibility Testing
1. **Screen Reader Testing**
   - Test with NVDA (Windows) or VoiceOver (Mac)
   - Verify all interactive elements are announced
   - Check error message announcements

2. **Keyboard Navigation**
   - Navigate using only keyboard (Tab, Enter, Space, Arrows)
   - Test modal focus trapping
   - Verify skip navigation links

### Offline Mode Testing
1. Open DevTools → Network → Set to "Offline"
2. Verify offline indicator appears
3. Navigate between pages
4. Set back to "Online" and verify restoration message

### Haptic Feedback Testing
1. Open on mobile device
2. Interact with buttons and forms
3. Verify appropriate vibration patterns

### Performance Testing
1. Run Lighthouse audit
2. Check image optimization (WebP format, lazy loading)
3. Verify loading skeleton performance

## 📚 Usage Examples

### Using Enhanced Error Handling
```tsx
import { ValidationError } from '@/lib/errors'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

try {
  // ... validation logic
  throw new ValidationError('Email inválido', { field: 'email' })
} catch (error) {
  if (error instanceof ValidationError) {
    return (
      <ErrorMessage
        message={error.userMessage}
        severity={error.severity}
        recoveryActions={error.recoveryActions}
      />
    )
  }
}
```

### Using Loading Skeletons
```tsx
import { FormSkeleton } from '@/components/skeletons'

function MyForm() {
  const { data, isLoading } = useQuery()
  
  if (isLoading) return <FormSkeleton fields={5} />
  
  return <form>{/* ... */}</form>
}
```

### Using Haptic Feedback
```tsx
import { useHaptic } from '@/lib/hooks/useHaptic'

function SubmitButton() {
  const { impact, success, error } = useHaptic()
  
  const handleSubmit = async () => {
    impact() // Haptic on button press
    
    try {
      await submitForm()
      success() // Success haptic
    } catch (err) {
      error() // Error haptic
    }
  }
  
  return <button onClick={handleSubmit}>Submit</button>
}
```

## 🎨 CSS Utilities

### Accessibility
- `.sr-only` - Screen reader only content
- `.skip-to-content` - Skip navigation link

### Animations
- `.animate-shimmer` - Shimmer effect for skeletons
- Smooth scroll with `prefers-reduced-motion` support

## 🚀 Next Steps

1. **Service Worker** (Future Enhancement)
   - Implement full offline support with caching
   - Queue failed requests for retry
   - Background sync

2. **Accessibility Audit**
   - Run automated accessibility tests
   - Manual testing with screen readers
   - WCAG 2.1 AA compliance verification

3. **Performance Monitoring**
   - Set up Lighthouse CI
   - Monitor Core Web Vitals
   - Track error rates

## 📝 Notes

- All CSS warnings for `@tailwind` and `@apply` are expected and valid (Tailwind CSS directives)
- Haptic feedback only works on mobile devices with Vibration API support
- Page transitions use Framer Motion which is already installed
- Error boundary catches React errors only (not async errors outside React tree)
