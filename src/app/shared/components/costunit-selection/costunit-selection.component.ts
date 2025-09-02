import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

interface MockCostUnit {
  id: string;
  name: string;
}

interface MockWorkplace {
  id: string;
  description: string;
  costUnitId: string;
}

@Component({
  selector: 'app-costunit-selection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './costunit-selection.component.html',
  styleUrls: ['./costunit-selection.component.scss'],
})
export class CostunitSelectionComponent implements OnInit {
  selectCostUnitsControl = new FormControl('');
  selectWorkplacesControl = new FormControl('');

  selectedCostUnit: MockCostUnit | null = null;
  selectedWorkplace: MockWorkplace | null = null;

  // Mock data
  mockCostUnits: MockCostUnit[] = [
    { id: 'CU001', name: 'Production Department A' },
    { id: 'CU002', name: 'Assembly Line B' },
    { id: 'CU003', name: 'Quality Control C' },
    { id: 'CU004', name: 'Maintenance Unit D' },
  ];

  mockWorkplaces: MockWorkplace[] = [
    { id: 'WP001', description: 'Main Production Floor', costUnitId: 'CU001' },
    { id: 'WP002', description: 'CNC Machining Center', costUnitId: 'CU001' },
    { id: 'WP003', description: 'Assembly Station 1', costUnitId: 'CU002' },
    { id: 'WP004', description: 'Quality Lab', costUnitId: 'CU003' },
    { id: 'WP005', description: 'Maintenance Workshop', costUnitId: 'CU004' },
    { id: 'WP006', description: 'Packaging Area', costUnitId: 'CU001' },
  ];

  get filteredWorkplaces(): MockWorkplace[] {
    if (!this.selectedCostUnit) {
      return [];
    }
    return this.mockWorkplaces.filter(
      (workplace) => workplace.costUnitId === this.selectedCostUnit?.id
    );
  }

  ngOnInit(): void {
    // Initialize form controls
    this.selectCostUnitsControl.valueChanges.subscribe(() => {
      // Reset workplace selection when cost unit changes
      if (!this.selectCostUnitsControl.value) {
        this.selectedCostUnit = null;
        this.selectWorkplacesControl.setValue('');
        this.selectedWorkplace = null;
      }
    });
  }

  displayFnCostUnit = (costUnit: MockCostUnit): string => {
    return costUnit ? `${costUnit.id} - ${costUnit.name}` : '';
  };

  displayFnWorkplace = (workplace: MockWorkplace): string => {
    return workplace ? `${workplace.id} - ${workplace.description}` : '';
  };

  onCostUnitOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedCostUnit = event.option.value;
    // Reset workplace selection when cost unit changes
    this.selectWorkplacesControl.setValue('');
    this.selectedWorkplace = null;
    console.log('Selected cost unit:', this.selectedCostUnit);
  }

  onWorkplaceOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedWorkplace = event.option.value;
    console.log('Selected workplace:', this.selectedWorkplace);
  }

  clearCostUnitSelection(event: Event): void {
    event.stopPropagation();
    this.selectCostUnitsControl.setValue('');
    this.selectedCostUnit = null;
    this.selectWorkplacesControl.setValue('');
    this.selectedWorkplace = null;
  }

  clearWorkplaceSelection(event: Event): void {
    event.stopPropagation();
    this.selectWorkplacesControl.setValue('');
    this.selectedWorkplace = null;
  }
}
