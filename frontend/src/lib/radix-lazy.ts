import { lazy } from 'react';

// Lazy load Radix UI components
export const Accordion = lazy(() => import('@radix-ui/react-accordion'));
export const Avatar = lazy(() => import('@radix-ui/react-avatar'));
export const Checkbox = lazy(() => import('@radix-ui/react-checkbox'));
export const Dialog = lazy(() => import('@radix-ui/react-dialog'));
export const DropdownMenu = lazy(() => import('@radix-ui/react-dropdown-menu'));
export const Label = lazy(() => import('@radix-ui/react-label'));
export const Menubar = lazy(() => import('@radix-ui/react-menubar'));
export const NavigationMenu = lazy(() => import('@radix-ui/react-navigation-menu'));
export const Popover = lazy(() => import('@radix-ui/react-popover'));
export const Progress = lazy(() => import('@radix-ui/react-progress'));
export const ScrollArea = lazy(() => import('@radix-ui/react-scroll-area'));
export const Select = lazy(() => import('@radix-ui/react-select'));
export const Separator = lazy(() => import('@radix-ui/react-separator'));
export const Slot = lazy(() => import('@radix-ui/react-slot'));
export const Switch = lazy(() => import('@radix-ui/react-switch'));
export const Tabs = lazy(() => import('@radix-ui/react-tabs'));
export const Tooltip = lazy(() => import('@radix-ui/react-tooltip'));

// Create a wrapper component for lazy loading
export const LazyRadix = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense fallback={null}>
    {children}
  </React.Suspense>
);
