import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  CostunitSelectorComponent,
  CostUnit,
} from '../costunit-selector/costunit-selector.component';
import {
  WorkplaceSelectorComponent,
  Workplace,
} from '../workplace-selector/workplace-selector.component';

export interface SelectionChangedEvent {
  costUnit: CostUnit;
  workplace: Workplace;
}

@Component({
  selector: 'app-selection-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    TranslocoDirective,
    CostunitSelectorComponent,
    WorkplaceSelectorComponent,
  ],
  templateUrl: './selection-bar.component.html',
  styleUrls: ['./selection-bar.component.scss'],
})
export class SelectionBarComponent {
  selectedCostUnit: CostUnit | null = null;
  selectedWorkplace: Workplace | null = null;

  @Output() selectionChanged = new EventEmitter<SelectionChangedEvent>();
  @Output() costUnitChanged = new EventEmitter<CostUnit | null>();
  @Output() workplaceChanged = new EventEmitter<Workplace | null>();

  onCostUnitSelected(costUnit: CostUnit | null): void {
    this.selectedCostUnit = costUnit;
    this.costUnitChanged.emit(costUnit);
  }

  onWorkplaceSelected(workplace: Workplace | null): void {
    this.selectedWorkplace = workplace;
    this.workplaceChanged.emit(workplace);
    this.emitIfBothSelected();
  }

  private emitIfBothSelected(): void {
    if (this.selectedCostUnit && this.selectedWorkplace) {
      this.selectionChanged.emit({
        costUnit: this.selectedCostUnit,
        workplace: this.selectedWorkplace,
      });
    }
  }

  onShowDetails(): void {
    if (this.selectedCostUnit && this.selectedWorkplace) {
      this.selectionChanged.emit({
        costUnit: this.selectedCostUnit,
        workplace: this.selectedWorkplace,
      });
    }
  }
}
