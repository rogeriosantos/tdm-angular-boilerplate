import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CostunitSelectorComponent, CostUnit } from '../costunit-selector/costunit-selector.component';
import { WorkplaceSelectorComponent, Workplace } from '../workplace-selector/workplace-selector.component';

@Component({
  selector: 'app-selection-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    CostunitSelectorComponent,
    WorkplaceSelectorComponent,
  ],
  templateUrl: './selection-bar.component.html',
  styleUrls: ['./selection-bar.component.scss'],
})
export class SelectionBarComponent {
  selectedCostUnit: CostUnit | null = null;
  selectedWorkplace: Workplace | null = null;

  onCostUnitSelected(costUnit: CostUnit | null): void {
    this.selectedCostUnit = costUnit;
    console.log('Cost unit selected in parent:', costUnit);
  }

  onWorkplaceSelected(workplace: Workplace | null): void {
    this.selectedWorkplace = workplace;
    console.log('Workplace selected in parent:', workplace);
  }

  onShowDetails(): void {
    if (this.selectedCostUnit && this.selectedWorkplace) {
      console.log('Show details for:', {
        costUnit: this.selectedCostUnit,
        workplace: this.selectedWorkplace,
      });
      // Implement navigation or modal logic here
    }
  }
}
