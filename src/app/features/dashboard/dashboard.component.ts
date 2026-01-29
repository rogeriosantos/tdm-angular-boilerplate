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
    this.toolItems = [];
    this.toolAssemblies = [];
  }

  onWorkplaceChanged(workplace: Workplace | null): void {
    this.selectedWorkplaceId = workplace?.id || null;
    if (!workplace) {
      this.toolItems = [];
      this.toolAssemblies = [];
    }
  }

  onSelectionChanged(event: SelectionChangedEvent): void {
    this.selectedCostUnitId = event.costUnit.id;
    this.selectedWorkplaceId = event.workplace.id;
    this.loadBookings();
  }

  loadBookings(): void {
    if (!this.selectedCostUnitId || !this.selectedWorkplaceId) {
      return;
    }

    this.loadingBookings = true;
    this.bookingService
      .getUnconfirmedBookings(
        this.selectedCostUnitId,
        this.selectedWorkplaceId
      )
      .subscribe({
        next: (result) => {
          this.toolItems = result.toolItems;
          this.toolAssemblies = result.toolAssemblies;
          this.loadingBookings = false;
        },
        error: () => {
          this.toolItems = [];
          this.toolAssemblies = [];
          this.loadingBookings = false;
        },
      });
  }

  onRefreshBookings(): void {
    this.loadBookings();
  }
}
