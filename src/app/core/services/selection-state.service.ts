import { Injectable } from '@angular/core';
import { CostUnit } from './costunit.service';
import { Workplace } from './workplace.service';

const COST_UNIT_KEY = 'pebe_selectedCostUnit';
const WORKPLACE_KEY = 'pebe_selectedWorkplace';

@Injectable({ providedIn: 'root' })
export class SelectionStateService {
  saveCostUnit(costUnit: CostUnit | null): void {
    if (costUnit) {
      sessionStorage.setItem(COST_UNIT_KEY, JSON.stringify(costUnit));
    } else {
      sessionStorage.removeItem(COST_UNIT_KEY);
      sessionStorage.removeItem(WORKPLACE_KEY);
    }
  }

  saveWorkplace(workplace: Workplace | null): void {
    if (workplace) {
      sessionStorage.setItem(WORKPLACE_KEY, JSON.stringify(workplace));
    } else {
      sessionStorage.removeItem(WORKPLACE_KEY);
    }
  }

  getSavedCostUnit(): CostUnit | null {
    const raw = sessionStorage.getItem(COST_UNIT_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getSavedWorkplace(): Workplace | null {
    const raw = sessionStorage.getItem(WORKPLACE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
