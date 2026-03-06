import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
    TranslocoDirective,
    CostunitSelectorComponent,
    WorkplaceSelectorComponent,
  ],
  templateUrl: './selection-bar.component.html',
  styleUrls: ['./selection-bar.component.scss'],
})
export class SelectionBarComponent {
  @Input() initialCostUnit: CostUnit | null = null;
  @Input() initialWorkplace: Workplace | null = null;

  selectedCostUnit: CostUnit | null = null;
  selectedWorkplace: Workplace | null = null;
  collapsed = false;

  @Output() selectionChanged = new EventEmitter<SelectionChangedEvent>();
  @Output() costUnitChanged = new EventEmitter<CostUnit | null>();
  @Output() workplaceChanged = new EventEmitter<Workplace | null>();

  get canCollapse(): boolean {
    return !!this.selectedCostUnit && !!this.selectedWorkplace;
  }

  get costUnitDisplay(): string {
    if (!this.selectedCostUnit) return '';
    return this.selectedCostUnit.name
      ? `${this.selectedCostUnit.id} - ${this.selectedCostUnit.name}`
      : this.selectedCostUnit.id;
  }

  get workplaceDisplay(): string {
    if (!this.selectedWorkplace) return '';
    return this.selectedWorkplace.name
      ? `${this.selectedWorkplace.id} - ${this.selectedWorkplace.name}`
      : this.selectedWorkplace.id;
  }

  toggleCollapsed(): void {
    if (this.canCollapse) {
      this.collapsed = !this.collapsed;
    }
  }

  onCostUnitSelected(costUnit: CostUnit | null): void {
    this.selectedCostUnit = costUnit;
    this.costUnitChanged.emit(costUnit);
    if (!costUnit) {
      this.collapsed = false;
    }
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
}
