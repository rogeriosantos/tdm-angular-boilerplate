# Selection Components Architecture

## Overview

This module provides a modular selection system with separate components for Cost Unit and Workplace selection, composed together in a selection bar.

## Component Structure

### 1. Cost Unit Selector (`costunit-selector/`)

**Purpose**: Handles Cost Unit selection independently

- **Selector**: `app-costunit-selector`
- **Exports**: `CostUnit` interface
- **Events**: `@Output() costUnitSelected: EventEmitter<CostUnit | null>`
- **Features**:
  - Autocomplete dropdown with mock cost units
  - Clear functionality
  - Emits selection events to parent

### 2. Workplace Selector (`workplace-selector/`)

**Purpose**: Handles Workplace selection based on selected Cost Unit

- **Selector**: `app-workplace-selector`
- **Exports**: `Workplace` interface
- **Inputs**: `@Input() selectedCostUnit: CostUnit | null`
- **Events**: `@Output() workplaceSelected: EventEmitter<Workplace | null>`
- **Features**:
  - Autocomplete dropdown filtered by cost unit
  - Disabled state when no cost unit selected
  - Auto-reset when cost unit changes
  - Emits selection events to parent

### 3. Selection Bar (`selection-bar/`)

**Purpose**: Container component that orchestrates the two selectors

- **Selector**: `app-selection-bar`
- **Features**:
  - Combines both selectors in a horizontal layout
  - Manages state between the two components
  - Provides action button (Show Details)
  - Handles communication between child components

## Data Flow

```
Selection Bar (Container)
├── Cost Unit Selector
│   └── Emits: CostUnit selection
├── Arrow Separator
├── Workplace Selector
│   ├── Receives: selectedCostUnit (Input)
│   └── Emits: Workplace selection
└── Action Button
    └── Enabled when both selections made
```

## Usage

### In Dashboard

```html
<app-selection-bar></app-selection-bar>
```

### Individual Components (if needed)

```html
<!-- Cost Unit only -->
<app-costunit-selector (costUnitSelected)="onCostUnitSelected($event)"> </app-costunit-selector>

<!-- Workplace only -->
<app-workplace-selector
  [selectedCostUnit]="selectedCostUnit"
  (workplaceSelected)="onWorkplaceSelected($event)"
>
</app-workplace-selector>
```

## Benefits of Separation

1. **Reusability**: Each selector can be used independently
2. **Maintainability**: Clear separation of concerns
3. **Testability**: Each component can be tested in isolation
4. **Scalability**: Easy to extend with additional selectors
5. **Flexibility**: Can be composed differently for different use cases

## Mock Data

### Cost Units

- CU001: Production Department A
- CU002: Assembly Line B
- CU003: Quality Control C
- CU004: Maintenance Unit D

### Workplaces

- WP001: Main Production Floor (CU001)
- WP002: CNC Machining Center (CU001)
- WP003: Assembly Station 1 (CU002)
- WP004: Quality Lab (CU003)
- WP005: Maintenance Workshop (CU004)
- WP006: Packaging Area (CU001)

## Future Enhancements

1. **Service Integration**: Replace mock data with real API calls
2. **Caching**: Add caching for performance
3. **Validation**: Add form validation
4. **Accessibility**: Enhance ARIA support
5. **Internationalization**: Add translation support
6. **Loading States**: Add proper loading indicators
7. **Error Handling**: Add comprehensive error handling
