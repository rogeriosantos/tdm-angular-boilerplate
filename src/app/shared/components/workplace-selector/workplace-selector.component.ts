import { Component, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CostUnit } from '../costunit-selector/costunit-selector.component';

export interface Workplace {
  id: string;
  description: string;
  costUnitId: string;
}

@Component({
  selector: 'app-workplace-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './workplace-selector.component.html',
  styleUrls: ['./workplace-selector.component.scss'],
})
export class WorkplaceSelectorComponent implements OnChanges {
  @Input() selectedCostUnit: CostUnit | null = null;
  @Output() workplaceSelected = new EventEmitter<Workplace | null>();

  selectWorkplacesControl = new FormControl('');
  selectedWorkplace: Workplace | null = null;

  // Mock data
  mockWorkplaces: Workplace[] = [
    { id: 'WP001', description: 'Main Production Floor', costUnitId: 'CU001' },
    { id: 'WP002', description: 'CNC Machining Center', costUnitId: 'CU001' },
    { id: 'WP003', description: 'Assembly Station 1', costUnitId: 'CU002' },
    { id: 'WP004', description: 'Quality Lab', costUnitId: 'CU003' },
    { id: 'WP005', description: 'Maintenance Workshop', costUnitId: 'CU004' },
    { id: 'WP006', description: 'Packaging Area', costUnitId: 'CU001' },
  ];

  get filteredWorkplaces(): Workplace[] {
    if (!this.selectedCostUnit) {
      return [];
    }
    return this.mockWorkplaces.filter(
      (workplace) => workplace.costUnitId === this.selectedCostUnit?.id
    );
  }

  get isDisabled(): boolean {
    return !this.selectedCostUnit;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCostUnit'] && this.selectedCostUnit === null) {
      // Reset workplace selection when cost unit is cleared
      this.selectWorkplacesControl.setValue('');
      this.selectedWorkplace = null;
      this.workplaceSelected.emit(null);
    }
  }

  displayFnWorkplace = (workplace: Workplace): string => {
    return workplace ? `${workplace.id} - ${workplace.description}` : '';
  };

  onWorkplaceOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedWorkplace = event.option.value;
    this.workplaceSelected.emit(this.selectedWorkplace);
    console.log('Selected workplace:', this.selectedWorkplace);
  }

  clearWorkplaceSelection(event: Event): void {
    event.stopPropagation();
    this.selectWorkplacesControl.setValue('');
    this.selectedWorkplace = null;
    this.workplaceSelected.emit(null);
  }
}
