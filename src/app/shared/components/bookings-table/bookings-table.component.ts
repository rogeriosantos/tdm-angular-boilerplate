import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoDirective } from '@jsverse/transloco';
import { SelectionModel } from '@angular/cdk/collections';
import { BookingToolItem } from '../../../core/services/booking.service';

export interface ColumnDef {
  key: string;
  labelKey: string;
}

export type TableState =
  | 'no-selection'
  | 'no-workplace'
  | 'loading'
  | 'empty'
  | 'data';

export type RowType = 'assembly' | 'child' | 'standalone';

export interface BookingTableRow {
  data: BookingToolItem;
  rowType: RowType;
  isExpanded: boolean;
  parentAssemblyId: string | null;
  childCount: number;
}

interface ColumnConfig {
  order: string[];
  visibility: Record<string, boolean>;
  widths: Record<string, number>;
}

const STORAGE_KEY = 'bookings-table-column-config';

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
    MatMenuModule,
    MatTooltipModule,
    TranslocoDirective,
  ],
  templateUrl: './bookings-table.component.html',
  styleUrls: ['./bookings-table.component.scss'],
})
export class BookingsTableComponent implements OnChanges, AfterViewInit {
  @Input() toolItems: BookingToolItem[] = [];
  @Input() toolAssemblies: BookingToolItem[] = [];
  @Input() loading = false;
  @Input() hasCostUnit = false;
  @Input() hasWorkplace = false;
  @Output() refresh = new EventEmitter<void>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('columnMenuTrigger', { read: MatMenuTrigger }) columnMenuTrigger!: MatMenuTrigger;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // All available columns in default order (expand is always prepended, not in this list)
  allColumns: ColumnDef[] = [
    { key: 'toolAssembly', labelKey: 'columns.tool-assembly' },
    { key: 'targetCostUnit', labelKey: 'columns.target-cost-unit' },
    { key: 'articleId', labelKey: 'columns.article-id' },
    { key: 'type', labelKey: 'columns.type' },
    { key: 'quantity', labelKey: 'columns.quantity' },
    { key: 'stockPlaceId', labelKey: 'columns.stock-place-id' },
    { key: 'storageUnit', labelKey: 'columns.storage-unit' },
    { key: 'shelf', labelKey: 'columns.shelf' },
    { key: 'width', labelKey: 'columns.width' },
    { key: 'depth', labelKey: 'columns.depth' },
    { key: 'select', labelKey: 'columns.select' },
  ];

  // Track visibility per column
  columnVisibility: Record<string, boolean> = {};

  // Track column widths
  columnWidths: Record<string, number> = {};

  // Current display order (visible columns only, expand always first)
  displayedColumns: string[] = [];

  // Full ordered list (includes hidden columns for ordering — does NOT include 'expand')
  private columnOrder: string[] = [];

  dataSource = new MatTableDataSource<BookingTableRow>();
  selection = new SelectionModel<BookingTableRow>(true, []);
  filterValue = '';

  // Expand state tracking: assemblyId -> expanded
  private expandedAssemblies = new Set<string>();

  // All built rows (parents/standalone + children hidden until expand)
  private allRows: BookingTableRow[] = [];
  private childrenByAssembly = new Map<string, BookingTableRow[]>();

  // Column drag state
  draggedColumn: string | null = null;
  dragOverColumn: string | null = null;

  // Column resize state
  resizing = false;

  // Context menu position
  contextMenuX = 0;
  contextMenuY = 0;

  private readonly defaultOrder: string[];

  constructor() {
    this.defaultOrder = this.allColumns.map((c) => c.key);
    this.initDefaults();
    this.loadFromStorage();
    this.updateDisplayedColumns();
  }

  get tableState(): TableState {
    if (this.loading) return 'loading';
    if (!this.hasCostUnit) return 'no-selection';
    if (!this.hasWorkplace) return 'no-workplace';
    if (this.toolItems.length === 0 && this.toolAssemblies.length === 0)
      return 'empty';
    return 'data';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['toolItems'] || changes['toolAssemblies']) {
      this.buildTableRows();
      this.refreshDataSource();
      this.selection.clear();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.dataSource.filterPredicate = (
      row: BookingTableRow,
      filter: string
    ) => {
      const data = row.data;
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

    this.dataSource.sortingDataAccessor = (
      row: BookingTableRow,
      sortHeaderId: string
    ): string | number => {
      const data = row.data;
      switch (sortHeaderId) {
        case 'toolAssembly':
          return data.relationToolAssemblyId || '';
        case 'targetCostUnit':
          return data.toCostunitId || '';
        case 'articleId':
          return data.articleId || '';
        case 'type':
          return data.type || '';
        case 'quantity':
          return data.countNew + data.countUsed + data.countRepair;
        case 'stockPlaceId':
          return data.stockplaceId || '';
        case 'storageUnit':
          return data.hallId || '';
        case 'shelf':
          return data.shelfId || '';
        case 'width':
          return data.width;
        case 'depth':
          return data.depth;
        default:
          return '';
      }
    };

    // Custom sort: sort parents/standalone normally, keep children grouped after their parent
    this.dataSource.sortData = (
      data: BookingTableRow[],
      sort: MatSort
    ): BookingTableRow[] => {
      if (!sort.active || sort.direction === '') {
        return data;
      }

      // Separate parents/standalone from children
      const topLevel = data.filter((r) => r.rowType !== 'child');
      const children = data.filter((r) => r.rowType === 'child');

      // Sort top-level rows
      const sorted = topLevel.sort((a, b) => {
        const valA = this.dataSource.sortingDataAccessor(a, sort.active);
        const valB = this.dataSource.sortingDataAccessor(b, sort.active);
        const compare =
          typeof valA === 'string' && typeof valB === 'string'
            ? valA.localeCompare(valB)
            : (valA as number) - (valB as number);
        return sort.direction === 'asc' ? compare : -compare;
      });

      // Re-inject children after their parent
      const result: BookingTableRow[] = [];
      for (const row of sorted) {
        result.push(row);
        if (row.rowType === 'assembly' && row.isExpanded) {
          const assemblyChildren = children.filter(
            (c) => c.parentAssemblyId === row.data.relationToolAssemblyId
          );
          result.push(...assemblyChildren);
        }
      }

      return result;
    };

    // Apply saved widths after view is ready
    this.applySavedWidths();
  }

  // --- Row building ---

  private buildTableRows(): void {
    this.allRows = [];
    this.childrenByAssembly.clear();

    // Index tool items by their relationToolAssemblyId
    const childMap = new Map<string, BookingToolItem[]>();
    const standaloneItems: BookingToolItem[] = [];

    for (const item of this.toolItems) {
      if (item.relationToolAssemblyId) {
        const key = item.relationToolAssemblyId;
        if (!childMap.has(key)) {
          childMap.set(key, []);
        }
        childMap.get(key)!.push(item);
      } else {
        standaloneItems.push(item);
      }
    }

    // Build assembly (parent) rows
    for (const assembly of this.toolAssemblies) {
      const assemblyId = assembly.relationToolAssemblyId || assembly.articleId;
      const children = childMap.get(assemblyId) || [];

      const parentRow: BookingTableRow = {
        data: assembly,
        rowType: 'assembly',
        isExpanded: this.expandedAssemblies.has(assemblyId),
        parentAssemblyId: null,
        childCount: children.length,
      };
      this.allRows.push(parentRow);

      // Build child rows
      const childRows: BookingTableRow[] = children.map((child) => ({
        data: child,
        rowType: 'child' as RowType,
        isExpanded: false,
        parentAssemblyId: assemblyId,
        childCount: 0,
      }));
      this.childrenByAssembly.set(assemblyId, childRows);
    }

    // Build standalone rows (tool items without an assembly)
    for (const item of standaloneItems) {
      this.allRows.push({
        data: item,
        rowType: 'standalone',
        isExpanded: false,
        parentAssemblyId: null,
        childCount: 0,
      });
    }
  }

  private refreshDataSource(): void {
    const rows: BookingTableRow[] = [];

    for (const row of this.allRows) {
      rows.push(row);
      if (row.rowType === 'assembly' && row.isExpanded) {
        const assemblyId =
          row.data.relationToolAssemblyId || row.data.articleId;
        const children = this.childrenByAssembly.get(assemblyId) || [];
        rows.push(...children);
      }
    }

    this.dataSource.data = rows;
  }

  toggleExpand(row: BookingTableRow): void {
    if (row.rowType !== 'assembly') return;

    const assemblyId =
      row.data.relationToolAssemblyId || row.data.articleId;
    row.isExpanded = !row.isExpanded;

    if (row.isExpanded) {
      this.expandedAssemblies.add(assemblyId);
    } else {
      this.expandedAssemblies.delete(assemblyId);
    }

    this.refreshDataSource();
  }

  // --- Persistence (localStorage) ---

  private initDefaults(): void {
    this.columnOrder = [...this.defaultOrder];
    for (const col of this.allColumns) {
      this.columnVisibility[col.key] = true;
    }
    this.columnWidths = {};
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      this.applyConfig(JSON.parse(raw));
    } catch {
      // Corrupted data — use defaults
    }
  }

  private saveToStorage(): void {
    const config: ColumnConfig = {
      order: this.columnOrder,
      visibility: { ...this.columnVisibility },
      widths: { ...this.columnWidths },
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }

  private applyConfig(config: ColumnConfig): void {
    const validKeys = new Set(this.allColumns.map((c) => c.key));

    // Validate and apply order
    if (Array.isArray(config.order)) {
      const validOrder = config.order.filter((k) => validKeys.has(k));
      // Add any missing columns at the end
      for (const key of this.defaultOrder) {
        if (!validOrder.includes(key)) {
          validOrder.push(key);
        }
      }
      this.columnOrder = validOrder;
    }

    // Apply visibility
    if (config.visibility && typeof config.visibility === 'object') {
      for (const key of this.defaultOrder) {
        this.columnVisibility[key] =
          key in config.visibility ? !!config.visibility[key] : true;
      }
    }

    // Apply widths
    if (config.widths && typeof config.widths === 'object') {
      this.columnWidths = {};
      for (const [key, width] of Object.entries(config.widths)) {
        if (validKeys.has(key) && typeof width === 'number' && width > 0) {
          this.columnWidths[key] = width;
        }
      }
    }
  }

  private applySavedWidths(): void {
    // Apply saved widths to <th> elements after render
    setTimeout(() => {
      const table = document.querySelector('.bookings-mat-table');
      if (!table) return;
      for (const [colKey, width] of Object.entries(this.columnWidths)) {
        const th = table.querySelector(
          `th.mat-column-${colKey}`
        ) as HTMLElement;
        if (th) {
          th.style.width = width + 'px';
          th.style.minWidth = width + 'px';
        }
      }
    });
  }

  resetColumnConfig(): void {
    this.initDefaults();
    this.updateDisplayedColumns();
    this.saveToStorage();

    // Clear inline widths
    const table = document.querySelector('.bookings-mat-table');
    if (table) {
      table.querySelectorAll('th.mat-mdc-header-cell').forEach((th) => {
        (th as HTMLElement).style.width = '';
        (th as HTMLElement).style.minWidth = '';
      });
    }
  }

  // --- Export / Import ---

  exportColumnConfig(): void {
    const config: ColumnConfig = {
      order: this.columnOrder,
      visibility: { ...this.columnVisibility },
      widths: { ...this.columnWidths },
    };
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings-table-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  triggerImport(): void {
    this.fileInput.nativeElement.click();
  }

  onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const config: ColumnConfig = JSON.parse(reader.result as string);
        this.applyConfig(config);
        this.updateDisplayedColumns();
        this.saveToStorage();
        this.applySavedWidths();
      } catch {
        console.error('Invalid column config file');
      }
      // Reset file input so the same file can be re-imported
      input.value = '';
    };
    reader.readAsText(file);
  }

  // --- Column visibility (context menu) ---

  onHeaderContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.columnMenuTrigger.openMenu();
  }

  isColumnVisible(key: string): boolean {
    return this.columnVisibility[key] ?? true;
  }

  toggleColumnVisibility(key: string): void {
    this.columnVisibility[key] = !this.columnVisibility[key];
    this.updateDisplayedColumns();
    this.saveToStorage();
  }

  private updateDisplayedColumns(): void {
    const visible = this.columnOrder.filter(
      (key) => this.columnVisibility[key]
    );
    // 'expand' column always first
    this.displayedColumns = ['expand', ...visible];
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
      const fromIndex = this.columnOrder.indexOf(this.draggedColumn);
      const toIndex = this.columnOrder.indexOf(targetColumn);
      if (fromIndex !== -1 && toIndex !== -1) {
        this.columnOrder.splice(fromIndex, 1);
        this.columnOrder.splice(toIndex, 0, this.draggedColumn);
        this.updateDisplayedColumns();
        this.saveToStorage();
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

      // Save the final width
      this.columnWidths[column] = th.offsetWidth;
      this.saveToStorage();
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

  getQuantity(row: BookingTableRow): number {
    return row.data.countNew + row.data.countUsed + row.data.countRepair;
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
