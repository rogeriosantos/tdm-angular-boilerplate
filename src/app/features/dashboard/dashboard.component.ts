import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
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
import { CostUnit } from '../../shared/components/costunit-selector/costunit-selector.component';
import { Workplace } from '../../shared/components/workplace-selector/workplace-selector.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarComponent,
    SelectionBarComponent,
    BookingsTableComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  toolItems: BookingRow[] = [];
  toolAssemblies: BookingRow[] = [];
  loadingBookings = false;
  selectedCostUnitId: string | null = null;
  selectedWorkplaceId: string | null = null;

  // Server-side pagination state
  totalBookingCount = 0;
  currentPageIndex = 0;
  currentPageSize = 50;
  currentFilter = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private bookingService: BookingService
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onCostUnitChanged(costUnit: CostUnit | null): void {
    this.selectedCostUnitId = costUnit?.id || null;
    this.selectedWorkplaceId = null;
    this.resetBookings();
  }

  onWorkplaceChanged(workplace: Workplace | null): void {
    this.selectedWorkplaceId = workplace?.id || null;
    if (!workplace) {
      this.resetBookings();
    }
  }

  onSelectionChanged(event: SelectionChangedEvent): void {
    this.selectedCostUnitId = event.costUnit.id;
    this.selectedWorkplaceId = event.workplace.id;
    this.currentPageIndex = 0;
    this.currentFilter = '';
    this.loadBookings();
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.currentPageIndex = event.pageIndex;
    this.currentPageSize = event.pageSize;
    this.loadBookings();
  }

  onFilterChange(filter: string): void {
    this.currentFilter = filter;
    this.currentPageIndex = 0;
    this.loadBookings();
  }

  loadBookings(): void {
    if (!this.selectedCostUnitId || !this.selectedWorkplaceId) {
      return;
    }

    this.loadingBookings = true;
    this.bookingService
      .getUnconfirmedBookings({
        costunitId: this.selectedCostUnitId,
        workplaceId: this.selectedWorkplaceId,
        skip: this.currentPageIndex * this.currentPageSize,
        take: this.currentPageSize,
        filter: this.currentFilter,
      })
      .subscribe({
        next: (result) => {
          this.toolItems = result.toolItems;
          this.toolAssemblies = result.toolAssemblies;
          this.totalBookingCount = result.totalCount;
          this.loadingBookings = false;
        },
        error: () => {
          this.resetBookings();
          this.loadingBookings = false;
        },
      });
  }

  onRefreshBookings(): void {
    this.loadBookings();
  }

  private resetBookings(): void {
    this.toolItems = [];
    this.toolAssemblies = [];
    this.totalBookingCount = 0;
    this.currentPageIndex = 0;
    this.currentFilter = '';
  }
}
