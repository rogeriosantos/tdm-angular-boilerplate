import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@jsverse/transloco';
import { Subject } from 'rxjs';

@Injectable()
export class CustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  itemsPerPageLabel = 'Items per page:';
  nextPageLabel = 'Next page';
  previousPageLabel = 'Previous page';
  firstPageLabel = 'First page';
  lastPageLabel = 'Last page';

  private ofLabel = 'of';

  constructor(private transloco: TranslocoService) {
    this.transloco.langChanges$.subscribe(() => {
      this.updateLabels();
      this.changes.next();
    });
    this.updateLabels();
  }

  private updateLabels(): void {
    this.itemsPerPageLabel = this.transloco.translate('bookings.paginator.items-per-page');
    this.nextPageLabel = this.transloco.translate('bookings.paginator.next-page');
    this.previousPageLabel = this.transloco.translate('bookings.paginator.previous-page');
    this.firstPageLabel = this.transloco.translate('bookings.paginator.first-page');
    this.lastPageLabel = this.transloco.translate('bookings.paginator.last-page');
    this.ofLabel = this.transloco.translate('bookings.paginator.of');
  }

  getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 ${this.ofLabel} ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length
      ? Math.min(startIndex + pageSize, length)
      : startIndex + pageSize;
    return `${startIndex + 1} – ${endIndex} ${this.ofLabel} ${length}`;
  };
}
