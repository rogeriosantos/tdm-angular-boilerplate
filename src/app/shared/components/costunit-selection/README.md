# Cost Unit Selection Component

## Overview

This component provides a dual selection interface for cost units and related jobs, adapted from the WebClients select-machine pattern for the eagle-burgmann application.

## Location

- Component: `src/app/shared/components/costunit-selection/`
- Used in: Dashboard (`src/app/features/dashboard/dashboard.component.html`)

## Features

### Cost Unit Selection

- Dropdown with autocomplete for cost unit selection
- Mock data includes 4 cost units:
  - CU001: Production Department A
  - CU002: Assembly Line B
  - CU003: Quality Control C
  - CU004: Maintenance Unit D

### Job Selection

- Dropdown for job selection (enabled only when a cost unit is selected)
- Jobs are filtered based on the selected cost unit
- Mock data includes 6 jobs across different cost units

### UI Elements

- Material Design form fields with outline appearance
- Clear buttons (✕) for both dropdowns
- Arrow separator between cost unit and job selection
- Job Details button (enabled only when both cost unit and job are selected)

## Mock Data Structure

### Cost Unit Interface

```typescript
interface MockCostUnit {
  id: string;
  name: string;
}
```

### Job Interface

```typescript
interface MockJob {
  id: string;
  description: string;
  costUnitId: string;
}
```

## Dependencies

- Angular Material (already installed)
- Angular Forms (ReactiveFormsModule)
- Tailwind CSS (for styling)

## Usage

The component is automatically included in the dashboard and appears as a horizontal bar below the toolbar.

## Styling

The component uses a combination of:

- Tailwind utility classes for layout (flexbox, spacing, etc.)
- Custom SCSS for Material Design overrides
- Similar styling approach to the original WebClients component

## Functionality

- **Cascading Selection**: Job dropdown is disabled until a cost unit is selected
- **Auto-filtering**: Jobs are automatically filtered based on selected cost unit
- **Clear Actions**: Individual clear buttons for each dropdown
- **Visual Feedback**: Disabled states and hover effects
- **Form Integration**: Uses Angular Reactive Forms for state management

## Future Enhancements

This is currently a mockup with static data. Future versions could include:

- Integration with real APIs
- Pagination support
- Loading states
- Error handling
- More sophisticated filtering
- Cost center reporting integration
