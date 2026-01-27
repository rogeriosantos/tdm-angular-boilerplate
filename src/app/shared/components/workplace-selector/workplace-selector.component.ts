import { Component, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, map, startWith } from 'rxjs';
import { CostUnit } from '../../../core/services/costunit.service';
import { WorkplaceService, Workplace } from '../../../core/services/workplace.service';

export type { Workplace } from '../../../core/services/workplace.service';

@Component({
  selector: 'app-workplace-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './workplace-selector.component.html',
  styleUrls: ['./workplace-selector.component.scss'],
})
export class WorkplaceSelectorComponent implements OnChanges {
  @Input() selectedCostUnit: CostUnit | null = null;
  @Output() workplaceSelected = new EventEmitter<Workplace | null>();

  selectWorkplacesControl = new FormControl('');
  selectedWorkplace: Workplace | null = null;

  workplaces: Workplace[] = [];
  filteredWorkplaces$!: Observable<Workplace[]>;
  isLoading = false;

  constructor(private workplaceService: WorkplaceService) {}

  get isDisabled(): boolean {
    return !this.selectedCostUnit;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCostUnit']) {
      // Reset workplace selection when cost unit changes
      this.selectWorkplacesControl.setValue('');
      this.selectedWorkplace = null;
      this.workplaceSelected.emit(null);
      this.workplaces = [];

      // Load workplaces for the new cost unit
      if (this.selectedCostUnit) {
        this.loadWorkplaces(this.selectedCostUnit.id);
      }
    }
  }

  private loadWorkplaces(costUnitId: string): void {
    this.isLoading = true;
    this.workplaceService.getWorkplaces(costUnitId).subscribe({
      next: (workplaces) => {
        this.workplaces = workplaces;
        this.isLoading = false;
        this.setupFiltering();
        console.log('Loaded workplaces:', workplaces.length);
      },
      error: (error) => {
        console.error('Failed to load workplaces:', error);
        this.isLoading = false;
      },
    });
  }

  private setupFiltering(): void {
    this.filteredWorkplaces$ = this.selectWorkplacesControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const filterValue = typeof value === 'string' ? value : '';
        return this.filterWorkplaces(filterValue);
      })
    );
  }

  private filterWorkplaces(value: string): Workplace[] {
    const filterValue = value.toLowerCase();
    return this.workplaces.filter(
      (workplace) =>
        workplace.id.toLowerCase().includes(filterValue) ||
        workplace.name.toLowerCase().includes(filterValue)
    );
  }

  displayFnWorkplace = (workplace: Workplace): string => {
    return workplace ? `${workplace.id} - ${workplace.name}` : '';
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
