import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface CostUnit {
  id: string;
  name: string;
}

@Component({
  selector: 'app-costunit-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './costunit-selector.component.html',
  styleUrls: ['./costunit-selector.component.scss'],
})
export class CostunitSelectorComponent {
  @Output() costUnitSelected = new EventEmitter<CostUnit | null>();

  selectCostUnitsControl = new FormControl('');
  selectedCostUnit: CostUnit | null = null;

  // Mock data
  mockCostUnits: CostUnit[] = [
    { id: 'CU001', name: 'Production Department A' },
    { id: 'CU002', name: 'Assembly Line B' },
    { id: 'CU003', name: 'Quality Control C' },
    { id: 'CU004', name: 'Maintenance Unit D' },
  ];

  displayFnCostUnit = (costUnit: CostUnit): string => {
    return costUnit ? `${costUnit.id} - ${costUnit.name}` : '';
  };

  onCostUnitOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedCostUnit = event.option.value;
    this.costUnitSelected.emit(this.selectedCostUnit);
    console.log('Selected cost unit:', this.selectedCostUnit);
  }

  clearCostUnitSelection(event: Event): void {
    event.stopPropagation();
    this.selectCostUnitsControl.setValue('');
    this.selectedCostUnit = null;
    this.costUnitSelected.emit(null);
  }
}
