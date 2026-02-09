import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
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
import { TranslocoDirective } from '@jsverse/transloco';
import { Observable, map, startWith } from 'rxjs';
import { CostUnitService, CostUnit } from '../../../core/services/costunit.service';

export type { CostUnit } from '../../../core/services/costunit.service';

@Component({
  selector: 'app-costunit-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslocoDirective,
  ],
  templateUrl: './costunit-selector.component.html',
  styleUrls: ['./costunit-selector.component.scss'],
})
export class CostunitSelectorComponent implements OnInit, OnChanges {
  @Input() initialCostUnit: CostUnit | null = null;
  @Output() costUnitSelected = new EventEmitter<CostUnit | null>();

  selectCostUnitsControl = new FormControl('');
  selectedCostUnit: CostUnit | null = null;

  costUnits: CostUnit[] = [];
  filteredCostUnits$!: Observable<CostUnit[]>;
  isLoading = false;

  constructor(private costUnitService: CostUnitService) {}

  ngOnInit(): void {
    this.loadCostUnits();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If initialCostUnit arrives after cost units are already loaded, apply it
    if (changes['initialCostUnit'] && !changes['initialCostUnit'].firstChange && this.costUnits.length > 0) {
      this.applyInitialValue();
    }
  }

  private loadCostUnits(): void {
    this.isLoading = true;
    this.costUnitService.getCostUnits().subscribe({
      next: (costUnits) => {
        this.costUnits = costUnits;
        this.isLoading = false;
        this.setupFiltering();
        this.applyInitialValue();
        console.log('Loaded cost units:', costUnits.length);
      },
      error: (error) => {
        console.error('Failed to load cost units:', error);
        this.isLoading = false;
      },
    });
  }

  private setupFiltering(): void {
    this.filteredCostUnits$ = this.selectCostUnitsControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const filterValue = typeof value === 'string' ? value : '';
        return this.filterCostUnits(filterValue);
      })
    );
  }

  private filterCostUnits(value: string): CostUnit[] {
    const filterValue = value.toLowerCase();
    return this.costUnits.filter(
      (costUnit) =>
        costUnit.id.toLowerCase().includes(filterValue) ||
        costUnit.name.toLowerCase().includes(filterValue)
    );
  }

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

  private applyInitialValue(): void {
    if (this.initialCostUnit) {
      const match = this.costUnits.find((cu) => cu.id === this.initialCostUnit!.id);
      if (match) {
        this.selectedCostUnit = match;
        this.selectCostUnitsControl.setValue(match as any);
        this.costUnitSelected.emit(match);
      }
    }
  }
}
