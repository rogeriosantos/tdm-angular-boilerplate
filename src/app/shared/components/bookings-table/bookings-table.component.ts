import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ElementRef,
  AfterViewInit,
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
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoDirective } from '@jsverse/transloco';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { BookingRow } from '../../../core/services/booking.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogResult,
} from '../confirm-dialog/confirm-dialog.component';

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
  data: BookingRow;
  rowType: RowType;
  isExpanded: boolean;
  parentCancelNrBase: number | null;
  childCount: number;
  /** Assembly ID for display — set on assembly rows and their children */
  assemblyId: string;
  assemblyName: string;
  /** True only for the first child in an assembly group */
  isFirstChild: boolean;
  /** True only for the last child in an assembly group */
  isLastChild: boolean;
  /** Number of sibling children (including self) — set on first child for rowspan */
  siblingCount: number;
  /** Group index for alternating stripe colors */
  groupIndex: number;
}

interface ColumnConfig {
  order: string[];
  visibility: Record<string, boolean>;
  widths: Record<string, number>;
  pageSize?: number;
}

const STORAGE_KEY_PREFIX = 'bookings-table-column-config';

const UNCONFIRMED_COLUMNS: ColumnDef[] = [
  { key: 'toolAssembly', labelKey: 'columns.tool-assembly' },
  { key: 'targetCostUnit', labelKey: 'columns.target-cost-unit' },
  { key: 'articleId', labelKey: 'columns.id' },
  { key: 'type', labelKey: 'columns.type' },
  { key: 'quantity', labelKey: 'columns.quantity' },
  { key: 'stockPlaceId', labelKey: 'columns.stock-place-id' },
  { key: 'storageUnit', labelKey: 'columns.storage-unit' },
  { key: 'shelf', labelKey: 'columns.shelf' },
  { key: 'width', labelKey: 'columns.width' },
  { key: 'depth', labelKey: 'columns.depth' },
  { key: 'select', labelKey: 'columns.select' },
  { key: 'commissionId', labelKey: 'columns.commission-id' },
];

const HISTORY_COLUMNS: ColumnDef[] = [
  { key: 'toolAssembly', labelKey: 'columns.tool-assembly' },
  { key: 'targetCostUnit', labelKey: 'columns.target-cost-unit' },
  { key: 'articleId', labelKey: 'columns.id' },
  { key: 'type', labelKey: 'columns.type' },
  { key: 'quantity', labelKey: 'columns.quantity' },
  { key: 'stockPlaceId', labelKey: 'columns.stock-place-id' },
  { key: 'bookingTime', labelKey: 'columns.booking-time' },
  { key: 'commissionId', labelKey: 'columns.picking-order' },
];

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
    MatSelectModule,
    TranslocoDirective,
    RouterLink,
  ],
  templateUrl: './bookings-table.component.html',
  styleUrls: ['./bookings-table.component.scss'],
})
export class BookingsTableComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() toolItems: BookingRow[] = [];
  @Input() toolAssemblies: BookingRow[] = [];
  @Input() loading = false;
  @Input() hasCostUnit = false;
  @Input() hasWorkplace = false;
  @Input() readOnly = false;
  @Input() mode: 'unconfirmed' | 'history' = 'unconfirmed';
  @Input() selectedCostUnit = '';
  @Input() dateRanges: { key: string; labelKey: string }[] = [];
  @Input() selectedDateRange = '';
  @Output() refresh = new EventEmitter<void>();
  @Output() dateRangeChange = new EventEmitter<string>();
  @Output() confirmBookings = new EventEmitter<BookingRow[]>();

  confirming = false;

  private paginator!: MatPaginator;

  @ViewChild(MatPaginator) set paginatorSetter(paginator: MatPaginator) {
    if (paginator && this.dataSource) {
      this.paginator = paginator;
      this.dataSource.paginator = paginator;

      // Persist page size to column config and page index to sessionStorage
      paginator.page.subscribe(() => {
        sessionStorage.setItem(`bookings-table-page-${this.mode}`, paginator.pageIndex.toString());
        if (paginator.pageSize !== this.currentPageSize) {
          this.currentPageSize = paginator.pageSize;
          this.saveToStorage();
        }
      });
    }
  }

  @ViewChild(MatSort) set matSortSetter(sort: MatSort) {
    if (sort && this.dataSource) {
      this.dataSource.sort = sort;
      this.setupSortAccessors();
    }
  }
  @ViewChild('columnMenuTrigger', { read: MatMenuTrigger }) columnMenuTrigger!: MatMenuTrigger;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // All available columns in default order — set based on mode
  allColumns: ColumnDef[] = [];

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

  // All built rows (parents/standalone + children)
  private allRows: BookingTableRow[] = [];
  private childrenByAssembly = new Map<number, BookingTableRow[]>();

  // Track expanded state per assembly (by cancelNrBase) - default is expanded
  expandedAssemblies = new Map<number, boolean>();

  // Column drag state
  draggedColumn: string | null = null;
  dragOverColumn: string | null = null;

  // Column resize state
  resizing = false;

  // Context menu position
  contextMenuX = 0;
  contextMenuY = 0;

  currentPageSize = 10;

  private defaultOrder: string[] = [];
  private modeInitialized = false;

  private get storageKey(): string {
    return `${STORAGE_KEY_PREFIX}-${this.mode}`;
  }

  constructor(private dialog: MatDialog) {}

  ngOnDestroy(): void {}

  get tableState(): TableState {
    if (this.loading) return 'loading';
    if (!this.hasCostUnit) return 'no-selection';
    if (!this.hasWorkplace) return 'no-workplace';
    if (this.toolItems.length === 0 && this.toolAssemblies.length === 0)
      return 'empty';
    return 'data';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode'] || !this.modeInitialized) {
      this.allColumns = this.mode === 'history' ? HISTORY_COLUMNS : UNCONFIRMED_COLUMNS;
      this.defaultOrder = this.allColumns.map((c) => c.key);
      this.initDefaults();
      this.loadFromStorage();
      this.updateDisplayedColumns();
      this.modeInitialized = true;
    }
    if (changes['toolItems'] || changes['toolAssemblies']) {
      this.buildTableRows();
      this.refreshDataSource();
      this.selection.clear();
      this.restorePaginatorState();
    }
  }

  ngAfterViewInit(): void {
    // Apply saved widths after view is ready
    this.applySavedWidths();
  }

  private setupSortAccessors(): void {
    this.dataSource.sortingDataAccessor = (
      row: BookingTableRow,
      sortHeaderId: string
    ): string | number => {
      const data = row.data;
      switch (sortHeaderId) {
        case 'toolAssembly':
          return row.assemblyId || '';
        case 'targetCostUnit':
          return data.costunitTo || '';
        case 'articleId':
          return data.id || '';
        case 'type':
          return data.type;
        case 'quantity':
          return data.countNew + data.countUsed + data.countRepair;
        case 'stockPlaceId':
          return data.stockplaceId || '';
        case 'storageUnit':
          return data.hall || '';
        case 'shelf':
          return data.shelf || '';
        case 'width':
          return data.width || '';
        case 'depth':
          return data.depth || '';
        case 'bookingTime':
          return data.bookTimestamp;
        case 'commissionId':
          return data.commissionId || '';
        default:
          return '';
      }
    };

    this.dataSource.sortData = this.groupSortData.bind(this);
  }

  // --- Row building ---

  private buildTableRows(): void {
    this.allRows = [];
    this.childrenByAssembly.clear();

    // Group tool items by cancelNrBase to find which belong to an assembly
    const childMap = new Map<number, BookingRow[]>();
    const standaloneItems: BookingRow[] = [];

    // Collect assembly cancelNrBases
    const assemblyCancelNrBases = new Set(
      this.toolAssemblies.map((a) => a.cancelNrBase)
    );

    for (const item of this.toolItems) {
      if (assemblyCancelNrBases.has(item.cancelNrBase)) {
        // This tool item belongs to an assembly group
        if (!childMap.has(item.cancelNrBase)) {
          childMap.set(item.cancelNrBase, []);
        }
        childMap.get(item.cancelNrBase)!.push(item);
      } else {
        standaloneItems.push(item);
      }
    }

    // Build assembly (parent) rows
    for (const assembly of this.toolAssemblies) {
      const key = assembly.cancelNrBase;
      const children = childMap.get(key) || [];

      // Set default expanded state to true if not already set
      if (!this.expandedAssemblies.has(key)) {
        this.expandedAssemblies.set(key, true);
      }

      const parentRow: BookingTableRow = {
        data: assembly,
        rowType: 'assembly',
        isExpanded: this.expandedAssemblies.get(key) ?? true,
        parentCancelNrBase: null,
        childCount: children.length,
        assemblyId: assembly.id,
        assemblyName: assembly.name,
        isFirstChild: false,
        isLastChild: false,
        siblingCount: 0,
        groupIndex: 0,
      };
      this.allRows.push(parentRow);

      // Build child rows
      const childRows: BookingTableRow[] = children.map((child, index) => ({
        data: child,
        rowType: 'child' as RowType,
        isExpanded: false,
        parentCancelNrBase: key,
        childCount: 0,
        assemblyId: assembly.id,
        assemblyName: assembly.name,
        isFirstChild: index === 0,
        isLastChild: index === children.length - 1,
        siblingCount: index === 0 ? children.length : 0,
        groupIndex: 0,
      }));
      this.childrenByAssembly.set(key, childRows);
    }

    // Build standalone rows (tool items without an assembly)
    for (const item of standaloneItems) {
      this.allRows.push({
        data: item,
        rowType: 'standalone',
        isExpanded: false,
        parentCancelNrBase: null,
        childCount: 0,
        assemblyId: '',
        assemblyName: '',
        isFirstChild: false,
        isLastChild: false,
        siblingCount: 0,
        groupIndex: 0,
      });
    }
  }

  private refreshDataSource(): void {
    const rows: BookingTableRow[] = [];
    let groupIndex = 0;

    for (const row of this.allRows) {
      if (row.rowType === 'assembly' && row.childCount > 0) {
        // Assembly with children
        const key = row.data.cancelNrBase;
        const children = this.childrenByAssembly.get(key) || [];
        const isExpanded = this.expandedAssemblies.get(key) ?? true;

        // Update isExpanded on children for template use
        for (const child of children) {
          child.isExpanded = isExpanded;
        }

        if (isExpanded) {
          // Show all children when expanded - restore proper flags
          for (let i = 0; i < children.length; i++) {
            children[i].groupIndex = groupIndex;
            children[i].isFirstChild = i === 0;
            children[i].isLastChild = i === children.length - 1;
            children[i].siblingCount = i === 0 ? children.length : 0;
            rows.push(children[i]);
          }
        } else {
          // Show only first child when collapsed (represents the assembly)
          if (children.length > 0) {
            children[0].groupIndex = groupIndex;
            children[0].isFirstChild = true;
            children[0].isLastChild = true; // Single row is both first and last
            children[0].siblingCount = 1; // Only 1 row visible when collapsed
            rows.push(children[0]);
          }
        }
      } else {
        // Assembly without children or standalone: show normally
        row.groupIndex = groupIndex;
        rows.push(row);
      }
      groupIndex++;
    }

    this.dataSource.data = rows;
    this.setupFilterPredicate();
  }

  private setupFilterPredicate(): void {
    this.dataSource.filterPredicate = (row: BookingTableRow, filter: string): boolean => {
      const data = row.data;
      const searchStr = [
        data.id,
        data.name,
        data.description,
        data.costunitTo,
        data.commissionId,
        row.assemblyId,
        row.assemblyName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchStr.includes(filter);
    };
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
      const raw = localStorage.getItem(this.storageKey);
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
      pageSize: this.currentPageSize,
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(config));
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

    // Apply page size
    if (typeof config.pageSize === 'number' && config.pageSize > 0) {
      this.currentPageSize = config.pageSize;
    }
  }

  private applySavedWidths(): void {
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

  private restorePaginatorState(): void {
    setTimeout(() => {
      if (!this.paginator) return;
      this.paginator.pageSize = this.currentPageSize;
      const savedPage = sessionStorage.getItem(`bookings-table-page-${this.mode}`);
      if (savedPage) {
        const pageIndex = parseInt(savedPage, 10);
        const maxPage = Math.ceil(this.dataSource.data.length / this.paginator.pageSize) - 1;
        this.paginator.pageIndex = Math.min(pageIndex, Math.max(0, maxPage));
      }
      // Trigger a page event so the table re-renders with the restored page
      this.paginator.page.emit({
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
        length: this.paginator.length,
      });
    });
  }

  resetColumnConfig(): void {
    this.initDefaults();
    this.currentPageSize = 10;
    this.updateDisplayedColumns();
    this.saveToStorage();

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
      pageSize: this.currentPageSize,
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
      (key) => this.columnVisibility[key] && !(this.readOnly && key === 'select')
    );
    this.displayedColumns = [...visible];
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

      this.columnWidths[column] = th.offsetWidth;
      this.saveToStorage();
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // --- Filter (client-side) ---

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilter(): void {
    this.filterValue = '';
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onRefresh(): void {
    this.refresh.emit();
  }

  onConfirm(): void {
    const selectedRows = this.selection.selected.map((r) => r.data);
    if (selectedRows.length === 0) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { rows: selectedRows },
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result?: ConfirmDialogResult) => {
      this.selection.clear();
      if (result && result.succeededRows && result.succeededRows.length > 0) {
        this.removeConfirmedRows(result.succeededRows);
        this.refresh.emit();
      }
    });
  }

  /** Called by the parent after acknowledge completes (success or error). */
  confirmComplete(): void {
    this.confirming = false;
    this.selection.clear();
  }

  /** Remove confirmed rows from the table locally (no API refresh). */
  private removeConfirmedRows(succeededRows: BookingRow[]): void {
    const confirmedCancelNrs = new Set(succeededRows.map((r) => r.cancelNr));
    this.dataSource.data = this.dataSource.data.filter(
      (tableRow) => !confirmedCancelNrs.has(tableRow.data.cancelNr)
    );
  }

  formatBookingTime(row: BookingTableRow): string {
    if (!row.data.bookTimestamp) return '';
    const date = new Date(row.data.bookTimestamp * 1000);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
  }

  getBooktypeIcon(row: BookingTableRow): string {
    const data = row.data;
    const type = data.type;

    if (type === -3) {
      const isOutgoing = data.costunitFrom === this.selectedCostUnit;
      const isAssembly = data.comporTool === 2;
      if (isAssembly) {
        return isOutgoing ? 'assets/icons/-3-outbound.png' : 'assets/icons/-3-inbound.png';
      }
      return isOutgoing ? 'assets/icons/-3-out.png' : 'assets/icons/-3-in.png';
    }

    return `assets/icons/${type}.png`;
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

  // --- Sorting (grouped) ---

  private groupSortData(
    data: BookingTableRow[],
    sort: MatSort
  ): BookingTableRow[] {
    if (!sort.active || sort.direction === '') {
      return data;
    }

    const accessor = this.dataSource.sortingDataAccessor;
    const active = sort.active;
    const dir = sort.direction;

    const compareFn = (a: BookingTableRow, b: BookingTableRow): number => {
      const valA = accessor(a, active);
      const valB = accessor(b, active);
      let compare: number;
      if (typeof valA === 'string' && typeof valB === 'string') {
        compare = valA.localeCompare(valB);
      } else {
        compare = (valA as number) - (valB as number);
      }
      return dir === 'asc' ? compare : -compare;
    };

    // Build groups: children with same parentCancelNrBase form one group,
    // standalone/assembly-without-children are individual groups
    const groups: BookingTableRow[][] = [];
    const childGroupMap = new Map<number, BookingTableRow[]>();

    for (const row of data) {
      if (row.rowType === 'child' && row.parentCancelNrBase != null) {
        let group = childGroupMap.get(row.parentCancelNrBase);
        if (!group) {
          group = [];
          childGroupMap.set(row.parentCancelNrBase, group);
          groups.push(group);
        }
        group.push(row);
      } else {
        groups.push([row]);
      }
    }

    // Sort children within each multi-row group
    for (const group of groups) {
      if (group.length > 1) {
        group.sort(compareFn);
      }
    }

    // Sort groups relative to each other using first row as representative
    groups.sort((a, b) => compareFn(a[0], b[0]));

    // Flatten, reassign groupIndex and fix first/last child flags
    const result: BookingTableRow[] = [];
    let groupIndex = 0;
    for (const group of groups) {
      if (group.length > 1) {
        // Multi-row child group: reassign isFirstChild / isLastChild / siblingCount
        for (let i = 0; i < group.length; i++) {
          group[i].isFirstChild = i === 0;
          group[i].isLastChild = i === group.length - 1;
          group[i].siblingCount = i === 0 ? group.length : 0;
          group[i].groupIndex = groupIndex;
          result.push(group[i]);
        }
      } else {
        group[0].groupIndex = groupIndex;
        result.push(group[0]);
      }
      groupIndex++;
    }

    return result;
  }

  // --- Assembly group selection ---

  private getAssemblyChildren(cancelNrBase: number): BookingTableRow[] {
    // Use childrenByAssembly to get ALL children, not just visible ones
    return this.childrenByAssembly.get(cancelNrBase) || [];
  }

  isAssemblyAllSelected(cancelNrBase: number): boolean {
    const children = this.getAssemblyChildren(cancelNrBase);
    return (
      children.length > 0 && children.every((c) => this.selection.isSelected(c))
    );
  }

  isAssemblyIndeterminate(cancelNrBase: number): boolean {
    const children = this.getAssemblyChildren(cancelNrBase);
    const selectedCount = children.filter((c) =>
      this.selection.isSelected(c)
    ).length;
    return selectedCount > 0 && selectedCount < children.length;
  }

  toggleAssemblySelection(row: BookingTableRow): void {
    const cancelNrBase = row.parentCancelNrBase!;
    const children = this.getAssemblyChildren(cancelNrBase);
    if (this.isAssemblyAllSelected(cancelNrBase)) {
      this.selection.deselect(...children);
    } else {
      this.selection.select(...children);
    }
  }

  // --- Assembly expand/collapse ---

  toggleAssemblyExpand(row: BookingTableRow): void {
    const cancelNrBase = row.parentCancelNrBase;
    if (cancelNrBase == null) return;

    const currentState = this.expandedAssemblies.get(cancelNrBase) ?? true;
    this.expandedAssemblies.set(cancelNrBase, !currentState);
    this.refreshDataSource();
  }

  isAssemblyExpanded(cancelNrBase: number): boolean {
    return this.expandedAssemblies.get(cancelNrBase) ?? true;
  }

  hasMultipleChildren(row: BookingTableRow): boolean {
    if (row.parentCancelNrBase == null) return false;
    const children = this.childrenByAssembly.get(row.parentCancelNrBase);
    return children ? children.length > 1 : false;
  }

  getChildCount(row: BookingTableRow): number {
    if (row.parentCancelNrBase == null) return 0;
    const children = this.childrenByAssembly.get(row.parentCancelNrBase);
    return children ? children.length : 0;
  }
}
