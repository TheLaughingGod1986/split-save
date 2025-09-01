# Dark Mode Implementation Guide

## Overview

SplitSave now features a comprehensive dark mode implementation using `next-themes` for seamless theme switching with system preference detection, manual override, and smooth transitions.

## Features

### ✅ **Complete Dark Mode Support**
- **System Preference Detection**: Automatically detects and follows user's system theme preference
- **Manual Override**: Users can manually switch between light, dark, and system modes
- **Smooth Transitions**: All theme changes include smooth color transitions
- **Persistent Storage**: Theme preference is saved and restored across sessions
- **Hydration Safe**: Prevents flash of incorrect theme on page load

### ✅ **Accessibility Features**
- **High Contrast Support**: Enhanced contrast ratios for better readability
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Proper focus indicators that work in both themes
- **Screen Reader Support**: Proper ARIA labels and semantic markup

### ✅ **Component Integration**
- **Consistent Design System**: All components use the same color tokens
- **Mobile Optimized**: Touch-friendly controls with proper sizing
- **Responsive Design**: Works seamlessly across all device sizes

## Implementation Details

### 1. Theme Provider Setup

The application uses `next-themes` with the following configuration:

```typescript
// app/layout.tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <AuthProvider>
    {children}
  </AuthProvider>
</ThemeProvider>
```

**Configuration Options:**
- `attribute="class"`: Uses CSS classes for theme switching
- `defaultTheme="system"`: Defaults to system preference
- `enableSystem`: Enables system preference detection

### 2. CSS Variables System

The application uses CSS custom properties for consistent theming:

```css
/* Light Theme */
:root {
  --color-background: #ffffff;
  --color-surface: #ffffff;
  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --color-border: #e5e7eb;
  --color-accent: #0ea5e9;
}

/* Dark Theme */
.dark {
  --color-background: #111827;
  --color-surface: #1f2937;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-border: #374151;
  --color-accent: #38bdf8;
}
```

### 3. Dark Mode Toggle Component

A reusable `DarkModeToggle` component provides consistent theme switching:

```typescript
import { DarkModeToggle } from './DesignSystem'

// Icon variant (default)
<DarkModeToggle variant="icon" />

// Button variant with label
<DarkModeToggle variant="button" showLabel={true} />

// Switch variant
<DarkModeToggle variant="switch" />
```

**Variants:**
- `icon`: Compact icon-only toggle
- `button`: Button with optional label
- `switch`: Toggle switch style

### 4. Theme Hook Usage

Components can use the `useTheme` hook for theme-aware logic:

```typescript
import { useTheme } from 'next-themes'

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  
  // resolvedTheme is the actual theme being applied (light/dark)
  // theme is the user's preference (light/dark/system)
  
  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      Current theme: {resolvedTheme}
    </div>
  )
}
```

## Color Palette

### Primary Colors
- **Light**: Blue-600 (#2563eb)
- **Dark**: Blue-400 (#60a5fa)

### Background Colors
- **Light**: White (#ffffff)
- **Dark**: Gray-900 (#111827)

### Surface Colors
- **Light**: White (#ffffff)
- **Dark**: Gray-800 (#1f2937)

### Text Colors
- **Primary Light**: Gray-900 (#111827)
- **Primary Dark**: Gray-100 (#f3f4f6)
- **Secondary Light**: Gray-600 (#4b5563)
- **Secondary Dark**: Gray-400 (#9ca3af)

### Border Colors
- **Light**: Gray-200 (#e5e7eb)
- **Dark**: Gray-700 (#374151)

## Component Guidelines

### 1. Using Dark Mode Classes

Always use Tailwind's dark mode classes for consistent theming:

```jsx
// ✅ Good
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>

// ❌ Avoid hardcoded colors
<div className="bg-white text-black">
  Content
</div>
```

### 2. CSS Variables for Custom Components

For custom components, use CSS variables:

```css
.my-component {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}
```

### 3. Conditional Styling

Use the `useTheme` hook for conditional logic:

```typescript
const { resolvedTheme } = useTheme()
const isDark = resolvedTheme === 'dark'

return (
  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'}`}>
    Content
  </div>
)
```

## Best Practices

### 1. **Consistent Color Usage**
- Always use the design system color tokens
- Avoid hardcoded colors in components
- Test both themes during development

### 2. **Smooth Transitions**
- All color changes should be smooth
- Use CSS transitions for theme switching
- Respect reduced motion preferences

### 3. **Accessibility**
- Maintain proper contrast ratios
- Test with screen readers
- Ensure focus indicators are visible

### 4. **Performance**
- Use CSS classes over inline styles
- Minimize JavaScript theme calculations
- Leverage CSS variables for dynamic theming

## Testing Dark Mode

### 1. **Manual Testing**
- Toggle between light and dark modes
- Test system preference detection
- Verify theme persistence across sessions

### 2. **Automated Testing**
```typescript
// Test theme switching
test('should toggle theme', () => {
  render(<DarkModeToggle />)
  const toggle = screen.getByRole('button')
  fireEvent.click(toggle)
  expect(document.documentElement).toHaveClass('dark')
})
```

### 3. **Visual Testing**
- Screenshot testing in both themes
- Cross-browser compatibility
- Mobile device testing

## Troubleshooting

### Common Issues

1. **Flash of Incorrect Theme**
   - Ensure `suppressHydrationWarning` is set on html element
   - Use `mounted` state in components

2. **Inconsistent Colors**
   - Check for hardcoded colors
   - Verify CSS variable usage
   - Test in both themes

3. **Performance Issues**
   - Minimize theme-dependent calculations
   - Use CSS classes over JavaScript styling
   - Optimize transition animations

### Debug Mode

Enable debug mode to see theme information:

```typescript
const { theme, resolvedTheme, systemTheme } = useTheme()
console.log('Theme Debug:', { theme, resolvedTheme, systemTheme })
```

## Future Enhancements

### Planned Features
- **Custom Theme Builder**: Allow users to create custom themes
- **Auto Theme Scheduling**: Automatic theme switching based on time
- **Theme Presets**: Pre-built theme variations
- **Export/Import Themes**: Share custom themes

### Performance Optimizations
- **CSS-in-JS Optimization**: Reduce runtime theme calculations
- **Bundle Splitting**: Separate theme-specific code
- **Caching Strategies**: Optimize theme switching performance

## Resources

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: SplitSave Development Team
