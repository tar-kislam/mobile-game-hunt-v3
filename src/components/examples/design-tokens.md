# Design Tokens Documentation

## Overview
This project uses consistent design tokens throughout all Shadcn UI components to maintain visual consistency.

## Border Radius
- **Primary**: `rounded-2xl` (1rem) - Used for all cards, modals, buttons, and form elements
- **Small**: `rounded-lg` - Used for badges and smaller elements

## Shadows
- **Soft**: `shadow-soft` - Subtle shadow for cards and buttons
- **Medium**: `shadow-medium` - Moderate shadow for elevated elements
- **Large**: `shadow-large` - Strong shadow for modals and overlays

## Spacing
- **Small**: `p-2` (0.5rem/8px) - Compact padding for form elements
- **Standard**: `p-4` (1rem/16px) - Default padding for card content and headers

## Component Examples

### Cards
```tsx
<Card className="rounded-2xl shadow-soft">
  <CardHeader className="p-4">
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent className="p-4 pt-0">
    Content
  </CardContent>
</Card>
```

### Buttons
```tsx
<Button className="rounded-2xl shadow-soft">Primary</Button>
<Button variant="outline" className="rounded-2xl">Secondary</Button>
```

### Form Elements
```tsx
<Input className="rounded-2xl border-border focus:ring-2 focus:ring-ring" />
<Textarea className="rounded-2xl border-border focus:ring-2 focus:ring-ring" />
```

### Modals
```tsx
<DialogContent className="rounded-2xl shadow-large">
  <DialogHeader className="p-2">
    Content with consistent spacing
  </DialogHeader>
</DialogContent>
```

### Badges
```tsx
<Badge className="rounded-2xl">Primary</Badge>
<Badge variant="secondary" className="rounded-2xl">Secondary</Badge>
```

## CSS Variables
Custom shadow variables are defined in `globals.css`:

```css
--shadow-soft: 0 2px 8px -2px rgb(0 0 0 / 0.1), 0 4px 16px -4px rgb(0 0 0 / 0.06);
--shadow-medium: 0 4px 16px -4px rgb(0 0 0 / 0.15), 0 8px 32px -8px rgb(0 0 0 / 0.1);
--shadow-large: 0 8px 32px -8px rgb(0 0 0 / 0.2), 0 16px 64px -16px rgb(0 0 0 / 0.15);
```

## Usage Guidelines

1. **Always use `rounded-2xl`** for primary elements (cards, buttons, modals)
2. **Apply `shadow-soft`** to elevated elements like cards and primary buttons
3. **Use `p-4` for content areas** and `p-2` for compact spaces
4. **Maintain consistent spacing** with the defined padding values
5. **Focus states** should include `focus:ring-2 focus:ring-ring` for accessibility
