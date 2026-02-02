import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslocoDirective } from '@jsverse/transloco';
import { BookingRow } from '../../../core/services/booking.service';
import { BookingService } from '../../../core/services/booking.service';
import { catchError, of } from 'rxjs';

type ItemStatus = 'pending' | 'processing' | 'success' | 'error';

interface ConfirmItem {
  row: BookingRow;
  status: ItemStatus;
  error?: string;
}

export interface ConfirmDialogData {
  rows: BookingRow[];
}

export interface ConfirmDialogResult {
  completed: number;
  failed: number;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    TranslocoDirective,
  ],
  template: `
    <div *transloco="let t; read: 'bookings.confirm-dialog'">
      <h2 mat-dialog-title>{{ t('title') }}</h2>

      <mat-dialog-content>
        <div class="items-list">
          @for (item of items; track item.row.cancelNr) {
            <div class="item-row" [class.item-pending]="item.status === 'pending'"
                 [class.item-success]="item.status === 'success'"
                 [class.item-error]="item.status === 'error'">
              <div class="item-info">
                <span class="item-id">{{ item.row.id }}</span>
                <span class="item-name">{{ item.row.name }}</span>
              </div>
              <div class="item-status">
                @switch (item.status) {
                  @case ('pending') {
                    <mat-icon class="status-pending">hourglass_empty</mat-icon>
                  }
                  @case ('processing') {
                    <mat-spinner diameter="20"></mat-spinner>
                  }
                  @case ('success') {
                    <mat-icon class="status-success">check_circle</mat-icon>
                  }
                  @case ('error') {
                    <mat-icon class="status-error">error</mat-icon>
                  }
                }
              </div>
            </div>
          }
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <div class="progress-section">
          <mat-progress-bar
            mode="determinate"
            [value]="progressPercent">
          </mat-progress-bar>
          <span class="progress-label">{{ processed }} / {{ items.length }}</span>
        </div>
        <button mat-flat-button
                color="primary"
                [disabled]="!isComplete"
                (click)="onClose()">
          {{ t('close') }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    h2[mat-dialog-title] {
      margin: 0;
      padding: 16px 24px;
    }

    mat-dialog-content {
      min-width: 400px;
      max-height: 400px;
      padding: 0 24px;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-radius: 6px;
      transition: background-color 0.2s, opacity 0.2s;
    }

    .item-pending {
      opacity: 0.5;
    }

    .item-success {
      background-color: rgba(76, 175, 80, 0.08);
    }

    .item-error {
      background-color: rgba(244, 67, 54, 0.08);
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1;
    }

    .item-id {
      font-weight: 500;
      font-size: 13px;
    }

    .item-name {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-status {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .status-pending {
      color: rgba(0, 0, 0, 0.3);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .status-success {
      color: #4caf50;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .status-error {
      color: #f44336;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    mat-dialog-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 24px;
    }

    .progress-section {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    mat-progress-bar {
      flex: 1;
    }

    .progress-label {
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      min-width: 48px;
      text-align: right;
    }
  `],
})
export class ConfirmDialogComponent implements OnInit {
  items: ConfirmItem[] = [];
  processed = 0;
  isComplete = false;

  get progressPercent(): number {
    return this.items.length > 0 ? (this.processed / this.items.length) * 100 : 0;
  }

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent, ConfirmDialogResult>,
    @Inject(MAT_DIALOG_DATA) private data: ConfirmDialogData,
    private bookingService: BookingService
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.items = this.data.rows.map((row) => ({
      row,
      status: 'pending' as ItemStatus,
    }));
    this.processItems();
  }

  private async processItems(): Promise<void> {
    let completed = 0;
    let failed = 0;

    for (const item of this.items) {
      item.status = 'processing';

      try {
        await new Promise<void>((resolve, reject) => {
          this.bookingService
            .confirmBooking(item.row)
            .pipe(
              catchError((err) => {
                reject(err);
                return of(null);
              })
            )
            .subscribe({
              next: (result) => {
                if (result !== null) {
                  resolve();
                }
              },
              error: (err) => reject(err),
            });
        });
        item.status = 'success';
        completed++;
      } catch {
        item.status = 'error';
        failed++;
      }

      this.processed++;
    }

    this.isComplete = true;
    this.dialogRef.disableClose = false;
  }

  onClose(): void {
    const completed = this.items.filter((i) => i.status === 'success').length;
    const failed = this.items.filter((i) => i.status === 'error').length;
    this.dialogRef.close({ completed, failed });
  }
}
