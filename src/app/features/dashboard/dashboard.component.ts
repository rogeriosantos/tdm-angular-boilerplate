import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { TranslocoDirective } from '@jsverse/transloco';
import { ToolbarComponent } from '../../layout/toolbar/toolbar.component';
import {
  SelectionBarComponent,
  SelectionChangedEvent,
} from '../../shared/components/selection-bar/selection-bar.component';
import { BookingsTableComponent } from '../../shared/components/bookings-table/bookings-table.component';
import {
  BookingService,
  BookingRow,
} from '../../core/services/booking.service';
import { SelectionStateService } from '../../core/services/selection-state.service';
import { CostUnit } from '../../shared/components/costunit-selector/costunit-selector.component';
import { Workplace } from '../../shared/components/workplace-selector/workplace-selector.component';

interface DateRangeOption {
  key: string;
  labelKey: string;
  getRange: () => { from: number; to: number };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarComponent,
    SelectionBarComponent,
    BookingsTableComponent,
    MatTabsModule,
    TranslocoDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('bookingsTable') bookingsTable!: BookingsTableComponent;

  // Unconfirmed tab state
  toolItems: BookingRow[] = [];
  toolAssemblies: BookingRow[] = [];
  loadingBookings = false;

  // History tab state
  historyToolItems: BookingRow[] = [];
  historyToolAssemblies: BookingRow[] = [];
  loadingHistory = false;
  selectedDateRange = 'last7';

  // Shared state
  selectedCostUnitId: string | null = null;
  selectedWorkplaceId: string | null = null;
  activeTab: 'unconfirmed' | 'history' = 'unconfirmed';

  // Saved selections for restoration
  savedCostUnit: CostUnit | null = null;
  savedWorkplace: Workplace | null = null;

  dateRanges: DateRangeOption[] = [
    {
      key: 'today',
      labelKey: 'history.today',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return {
          from: Math.floor(start.getTime() / 1000),
          to: Math.floor(now.getTime() / 1000),
        };
      },
    },
    {
      key: 'last7',
      labelKey: 'history.last-7-days',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {
          from: Math.floor(start.getTime() / 1000),
          to: Math.floor(now.getTime() / 1000),
        };
      },
    },
    {
      key: 'last30',
      labelKey: 'history.last-30-days',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return {
          from: Math.floor(start.getTime() / 1000),
          to: Math.floor(now.getTime() / 1000),
        };
      },
    },
    {
      key: 'thisMonth',
      labelKey: 'history.this-month',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          from: Math.floor(start.getTime() / 1000),
          to: Math.floor(now.getTime() / 1000),
        };
      },
    },
    {
      key: 'thisYear',
      labelKey: 'history.this-year',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        return {
          from: Math.floor(start.getTime() / 1000),
          to: Math.floor(now.getTime() / 1000),
        };
      },
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private bookingService: BookingService,
    private selectionState: SelectionStateService
  ) {}

  ngOnInit(): void {
    this.savedCostUnit = this.selectionState.getSavedCostUnit();
    this.savedWorkplace = this.selectionState.getSavedWorkplace();

    // If no saved selection, fetch user defaults from USERCOSTUNIT endpoint
    if (!this.savedCostUnit) {
      this.selectionState.fetchUserDefaults().subscribe((defaults) => {
        if (defaults) {
          this.savedCostUnit = defaults.costUnit;
          this.savedWorkplace = defaults.workplace;
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onCostUnitChanged(costUnit: CostUnit | null): void {
    this.selectedCostUnitId = costUnit?.id || null;
    this.selectedWorkplaceId = null;
    this.selectionState.saveCostUnit(costUnit);
    this.resetBookings();
    this.resetHistory();
  }

  onWorkplaceChanged(workplace: Workplace | null): void {
    this.selectedWorkplaceId = workplace?.id || null;
    this.selectionState.saveWorkplace(workplace);
    if (!workplace) {
      this.resetBookings();
      this.resetHistory();
    }
  }

  onSelectionChanged(event: SelectionChangedEvent): void {
    this.selectedCostUnitId = event.costUnit.id;
    this.selectedWorkplaceId = event.workplace.id;
    this.selectionState.saveCostUnit(event.costUnit);
    this.selectionState.saveWorkplace(event.workplace);
    this.loadBookings();
    this.resetHistory();
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.activeTab = event.index === 0 ? 'unconfirmed' : 'history';
    if (this.selectedCostUnitId && this.selectedWorkplaceId) {
      if (this.activeTab === 'unconfirmed') {
        this.loadBookings();
      } else {
        this.loadHistory();
      }
    }
  }

  onDateRangeChange(key: string): void {
    console.log('[History] Date range changed to:', key);
    this.selectedDateRange = key;
    this.loadHistory();
  }

  loadBookings(): void {
    if (!this.selectedCostUnitId || !this.selectedWorkplaceId) {
      return;
    }

    this.loadingBookings = true;
    this.bookingService
      .getUnconfirmedBookings(this.selectedCostUnitId, this.selectedWorkplaceId)
      .subscribe({
        next: (result) => {
          this.toolItems = result.toolItems;
          this.toolAssemblies = result.toolAssemblies;
          this.loadingBookings = false;
        },
        error: () => {
          this.resetBookings();
          this.loadingBookings = false;
        },
      });
  }

  loadHistory(): void {
    if (!this.selectedCostUnitId || !this.selectedWorkplaceId) {
      return;
    }

    const rangeOption = this.dateRanges.find(
      (r) => r.key === this.selectedDateRange
    );
    if (!rangeOption) return;

    const range = rangeOption.getRange();
    console.log('[History] Loading with range:', this.selectedDateRange,
      'from:', new Date(range.from * 1000).toISOString(),
      'to:', new Date(range.to * 1000).toISOString());
    this.loadingHistory = true;
    this.bookingService
      .getHistoryBookings({
        costunitId: this.selectedCostUnitId,
        workplaceId: this.selectedWorkplaceId,
        timestampFrom: range.from,
        timestampTo: range.to,
      })
      .subscribe({
        next: (result) => {
          this.historyToolItems = result.toolItems;
          this.historyToolAssemblies = result.toolAssemblies;
          this.loadingHistory = false;
        },
        error: () => {
          this.resetHistory();
          this.loadingHistory = false;
        },
      });
  }

  onRefreshBookings(): void {
    this.loadBookings();
  }

  onRefreshHistory(): void {
    this.loadHistory();
  }

  onConfirmBookings(): void {
    this.bookingsTable?.confirmComplete();
  }

  private resetBookings(): void {
    this.toolItems = [];
    this.toolAssemblies = [];
  }

  private resetHistory(): void {
    this.historyToolItems = [];
    this.historyToolAssemblies = [];
  }
}
