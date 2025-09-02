# Select Machine Component

## Overview

This component is a simplified mockup version of the select-machine bar from the WebClients project, adapted for the eagle-burgmann application.

## Location

- Component: `src/app/shared/components/select-machine/`
- Used in: Dashboard (`src/app/features/dashboard/dashboard.component.html`)

## Features

### Machine Selection

- Dropdown with autocomplete for machine selection
- Mock data includes 4 machines:
  - MCH001: CNC Machine A
  - MCH002: Lathe Machine B
  - MCH003: Milling Machine C
  - MCH004: Grinding Machine D

### Job Selection

- Dropdown for job selection (enabled only when a machine is selected)
- Jobs are filtered based on the selected machine
- Mock data includes 6 jobs across different machines

### UI Elements

- Material Design form fields with outline appearance
- Clear buttons (X) for both dropdowns
- Arrow separator between machine and job selection
- Job Details button (enabled only when both machine and job are selected)

## Mock Data Structure

### Machine Interface

```typescript
interface MockMachine {
  id: string;
  name: string;
}
```

### Job Interface

```typescript
interface MockJob {
  id: string;
  description: string;
  machineId: string;
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

## Future Enhancements

This is currently a mockup with static data. Future versions could include:

- Integration with real APIs
- Pagination support
- Loading states
- Error handling
- More sophisticated filtering
- Tool list integration
