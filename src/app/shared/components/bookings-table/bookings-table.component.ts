import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoDirective } from '@jsverse/transloco';
import { SelectionModel } from '@angular/cdk/collections';
import { BookingToolItem } from '../../../core/services/booking.service';

export type TableState =
  | 'no-selection'
  | 'no-workplace'
  | 'loading'
  | 'empty'
  | 'data';

@Component({
  selector: 'app-bookings-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    TranslocoDirective,
  ],
  templateUrl: './bookings-table.component.html',
  styleUrls: ['./bookings-table.component.scss'],
})
export class BookingsTableComponent implements OnChanges {
  @Input() bookings: BookingToolItem[] = [];
  @Input() loading = false;
  @Input() hasCostUnit = false;
  @Input() hasWorkplace = false;
  @Output() refresh = new EventEmitter<void>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    'toolAssembly',
    'targetCostUnit',
    'articleId',
    'type',
    'quantity',
    'stockPlaceId',
    'storageUnit',
    'shelf',
    'width',
    'depth',
    'select',
  ];

  dataSource = new MatTableDataSource<BookingToolItem>();
  selection = new SelectionModel<BookingToolItem>(true, []);
  filterValue = '';

  // Column drag state
  draggedColumn: string | null = null;
  dragOverColumn: string | null = null;

  // Column resize state
  resizing = false;

  get tableState(): TableState {
    if (this.loading) return 'loading';
    if (!this.hasCostUnit) return 'no-selection';
    if (!this.hasWorkplace) return 'no-workplace';
    if (this.bookings.length === 0) return 'empty';
    return 'data';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bookings']) {
      this.dataSource.data = this.bookings;
      this.selection.clear();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.dataSource.filterPredicate = (
      data: BookingToolItem,
      filter: string
    ) => {
      const searchStr = filter.toLowerCase();
      return (
        (data.articleId || '').toLowerCase().includes(searchStr) ||
        (data.articleName || '').toLowerCase().includes(searchStr) ||
        (data.articleDescription || '').toLowerCase().includes(searchStr) ||
        (data.relationToolAssemblyId || '').toLowerCase().includes(searchStr) ||
        (data.relationToolAssemblyName || '').toLowerCase().includes(searchStr) ||
        (data.toCostunitName || '').toLowerCase().includes(searchStr) ||
        (data.stockplaceId || '').toLowerCase().includes(searchStr) ||
        (data.type || '').toLowerCase().includes(searchStr)
      );
    };
  }

  // --- Column drag-and-drop (native HTML5) ---

  onColumnDragStart(event: DragEvent, column: string): void {
    this.draggedColumn = column;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', column);
    }
  }

  onColumnDragOver(event: DragEvent, column: string): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverColumn = column;
  }

  onColumnDrop(event: DragEvent, targetColumn: string): void {
    event.preventDefault();
    if (this.draggedColumn && this.draggedColumn !== targetColumn) {
      const fromIndex = this.displayedColumns.indexOf(this.draggedColumn);
      const toIndex = this.displayedColumns.indexOf(targetColumn);
      if (fromIndex !== -1 && toIndex !== -1) {
        this.displayedColumns.splice(fromIndex, 1);
        this.displayedColumns.splice(toIndex, 0, this.draggedColumn);
      }
    }
    this.draggedColumn = null;
    this.dragOverColumn = null;
  }

  onColumnDragEnd(): void {
    this.draggedColumn = null;
    this.dragOverColumn = null;
  }

  // --- Column resize (mousedown on handle) ---

  onResizeStart(event: MouseEvent, column: string): void {
    event.preventDefault();
    event.stopPropagation();

    this.resizing = true;

    const th = (event.target as HTMLElement).closest('th') as HTMLElement;
    if (!th) return;

    const startX = event.pageX;
    const startWidth = th.offsetWidth;

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.pageX - startX;
      const newWidth = Math.max(40, startWidth + delta);
      th.style.width = newWidth + 'px';
      th.style.minWidth = newWidth + 'px';
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      this.resizing = false;
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // --- Filter ---

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterValue = value;
    this.dataSource.filter = value.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilter(): void {
    this.filterValue = '';
    this.dataSource.filter = '';
  }

  onRefresh(): void {
    this.refresh.emit();
  }

  getQuantity(item: BookingToolItem): number {
    return item.countNew + item.countUsed + item.countRepair;
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.dataSource.data);
    }
  }
}
