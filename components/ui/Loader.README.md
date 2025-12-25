# Loader Component

A reusable, customizable loader component that can be easily modified in the future.

## Usage

### Basic Usage
```tsx
import Loader from '@/components/ui/Loader';

<Loader />
```

### Full Screen Loader
```tsx
<Loader fullScreen text="Loading..." />
```

### Custom Size and Color
```tsx
<Loader size="lg" variant="primary" />
<Loader size={50} variant="#ff0000" /> // Custom size and color
```

### Inline Loader
```tsx
<div className="flex items-center justify-center p-8">
    <Loader size="md" variant="secondary" text="Processing..." />
</div>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| number` | `'md'` | Size of the loader |
| `variant` | `'primary' \| 'secondary' \| 'white' \| string` | `'primary'` | Color variant or custom hex color |
| `fullScreen` | `boolean` | `false` | Show as full screen overlay |
| `className` | `string` | `''` | Additional CSS classes |
| `text` | `string` | `undefined` | Optional text below loader |

## Customization

### Changing the Animation
Edit the `@keyframes spin` in `Loader.tsx`:
```tsx
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

### Changing Default Colors
Modify the `colorMap` object:
```tsx
const colorMap: Record<string, string> = {
    primary: '#f97316', // Your brand color
    secondary: '#0ea5e9',
    white: '#ffffff',
};
```

### Changing the Style
The loader uses a simple CSS spinner. To change to a different style (dots, bars, etc.), modify the JSX structure in the component.

## Examples

### Different Variants
```tsx
<Loader variant="primary" />    // Orange
<Loader variant="secondary" />  // Blue
<Loader variant="white" />       // White
<Loader variant="#ff00ff" />     // Custom color
```

### Different Sizes
```tsx
<Loader size="sm" />  // 24px
<Loader size="md" />  // 40px
<Loader size="lg" />  // 56px
<Loader size={80} />  // 80px custom
```

