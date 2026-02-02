import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of, concat, toArray, tap } from 'rxjs';
import { environment } from '../config/environment';

export interface ConfirmationPayload {
  transactionNumber: number;
  transactionListPosition: number;
  cancelListPosition: number;
}

/**
 * Raw API response shape from the WSAPI UNCONFIRMED endpoint.
 * Field names match the SQL column aliases (uppercase).
 */
export interface UnconfirmedBookingApiRow {
  BOOKTIMESTAMP: string;
  BOOKDATE: string;
  BOOKTIME: string;
  TYPE: string;
  COMPORTOOL: string;
  COSTUNITFROM: string;
  WORKPLACEFROM: string;
  COSTUNITTO: string;
  WORKPLACETO: string;
  COUNTNEW: string;
  COUNTUSED: string;
  COUNTREPAIR: string;
  COSTCORRELATION: string;
  STATE: string;
  FACTOR: string;
  COSTUNITCOSTS: string;
  WORKPLACECOSTS: string;
  ACCOUNTID: string;
  BOOKTEXT: string;
  USERID: string;
  CANCELNR: string;
  ID: string;
  NAME: string;
  NAME2: string;
  INVID: string;
  STOCKPLACEID: string;
  LISTID: string;
  UNCONFIRMED: string;
  COMMISSIONID: string;
  MACHINEID: string;
  MACHINENAME: string;
  TRANSACTIONNR: string;
  TRANSACTIONLISTPOS: string;
}

/**
 * Mapped frontend model for a booking row (tool item or tool assembly).
 */
export interface BookingRow {
  // Identification
  id: string;
  name: string;
  description: string;
  cancelNr: string;
  cancelNrBase: number;

  // Type classification
  type: number;
  comporTool: number; // 1 = tool/component, 2 = tool assembly
  unconfirmed: boolean;

  // Cost unit / workplace
  costunitFrom: string;
  workplaceFrom: string;
  costunitTo: string;
  workplaceTo: string;
  costunitCosts: string;
  workplaceCosts: string;

  // Quantities
  countNew: number;
  countUsed: number;
  countRepair: number;

  // Stock location
  stockplaceId: string;

  // Booking metadata
  bookTimestamp: number;
  bookDate: string;
  bookTime: string;
  state: number;
  factor: number;
  costCorrelation: number;
  accountId: string;
  bookText: string;
  userId: string;
  invId: string;
  listId: string;
  commissionId: string;
  machineId: string;
  machineName: string;
  transactionNr: number;
  transactionListPos: number;
}

export interface BookingsResult {
  toolItems: BookingRow[];
  toolAssemblies: BookingRow[];
}

export interface PaginatedBookingsResult extends BookingsResult {
  totalCount: number;
}

export interface BookingsPaginationParams {
  costunitId: string;
  workplaceId: string;
  skip?: number;
  take?: number;
  filter?: string;
}

export interface HistoryParams {
  costunitId: string;
  workplaceId: string;
  timestampFrom: number;
  timestampTo: number;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private http: HttpClient) {}

  /**
   * Fetches paginated unconfirmed bookings (data + count) in parallel.
   * Pagination is by CANCELNR_BASE groups, not individual rows.
   */
  getUnconfirmedBookings(
    params: BookingsPaginationParams
  ): Observable<PaginatedBookingsResult> {
    const data$ = this.fetchBookingsData(params);
    const count$ = this.fetchBookingsCount(params);

    return forkJoin({ data: data$, count: count$ }).pipe(
      map(({ data, count }) => ({
        ...data,
        totalCount: count,
      }))
    );
  }

  private fetchBookingsData(
    params: BookingsPaginationParams
  ): Observable<BookingsResult> {
    const url = `${environment.wsApiUrl}/2025/system/interfacereftab/TDMAPI/select/UNCONFIRMED`;
    let httpParams = new HttpParams()
      .set('costunit', params.costunitId)
      .set('workplace', params.workplaceId);

    if (params.skip != null) {
      httpParams = httpParams.set('skip', params.skip.toString());
    }
    if (params.take != null) {
      httpParams = httpParams.set('take', params.take.toString());
    }
    if (params.filter) {
      httpParams = httpParams.set('filter', params.filter);
    }

    return this.http
      .get<UnconfirmedBookingApiRow[]>(url, { params: httpParams })
      .pipe(
        map((rows) => {
          const mapped = rows.map((row) => this.mapApiRow(row));
          const toolItems = mapped.filter((r) => r.comporTool === 1);
          const toolAssemblies = mapped.filter((r) => r.comporTool === 2);
          return { toolItems, toolAssemblies };
        }),
        catchError((error) => {
          console.error(
            'BookingService: Error fetching unconfirmed bookings:',
            error
          );
          return of({ toolItems: [], toolAssemblies: [] });
        })
      );
  }

  private fetchBookingsCount(
    params: BookingsPaginationParams
  ): Observable<number> {
    const url = `${environment.wsApiUrl}/2025/system/interfacereftab/TDMAPI/select/UNCONFIRMED_COUNT`;
    let httpParams = new HttpParams()
      .set('costunit', params.costunitId)
      .set('workplace', params.workplaceId);

    if (params.filter) {
      httpParams = httpParams.set('filter', params.filter);
    }

    return this.http
      .get<Array<{ TOTAL_COUNT: string }>>(url, { params: httpParams })
      .pipe(
        map((rows) => {
          if (rows && rows.length > 0) {
            return parseInt(rows[0].TOTAL_COUNT, 10) || 0;
          }
          return 0;
        }),
        catchError((error) => {
          console.error(
            'BookingService: Error fetching bookings count:',
            error
          );
          return of(0);
        })
      );
  }

  /**
   * Acknowledge (confirm) a single booking row.
   */
  acknowledgeBooking(
    row: BookingRow,
    costunit: string,
    workplace: string
  ): Observable<unknown> {
    const url = `${environment.wsApiUrl}/2025/lgm/acknowledge`;
    const body = {
      id: row.id,
      cancelNr: row.cancelNr,
      invId: row.invId,
      costunit,
      workplace,
      stockPlaceId: row.stockplaceId,
      historyUpdate: true,
      uniqueId: '',
      bookStateNr: row.state,
      startUp: true,
      stockTypeId: '',
      userName: '',
      idType: row.comporTool,
    };
    return this.http.post(url, body);
  }

  /**
   * Acknowledge multiple booking rows sequentially.
   * Returns an array of results (one per row).
   */
  acknowledgeBookings(
    rows: BookingRow[],
    costunit: string,
    workplace: string
  ): Observable<unknown[]> {
    const requests = rows.map((row) =>
      this.acknowledgeBooking(row, costunit, workplace)
    );
    return concat(...requests).pipe(toArray());
  }

  /**
   * Confirm a single booking via the Stock API.
   */
  confirmBooking(row: BookingRow): Observable<unknown> {
    const url = `${environment.stockApiUrl}/Bookings/Confirmations?move=false`;
    const payload: ConfirmationPayload[] = [
      {
        transactionNumber: row.transactionNr,
        transactionListPosition: row.transactionListPos,
        cancelListPosition: 1,
      },
    ];
    console.log('[Confirm] Sending confirmation for:', row.id, payload);
    return this.http.patch(url, payload).pipe(
      tap(() => console.log('[Confirm] SUCCESS for:', row.id, '| transactionNr:', row.transactionNr, '| transactionListPos:', row.transactionListPos)),
      catchError((error) => {
        console.error('[Confirm] FAILED for:', row.id, '| transactionNr:', row.transactionNr, '| transactionListPos:', row.transactionListPos, '| Error:', error);
        throw error;
      })
    );
  }

  /**
   * Confirm multiple bookings sequentially via the Stock API.
   */
  confirmBookings(rows: BookingRow[]): Observable<unknown[]> {
    const requests = rows.map((row) => this.confirmBooking(row));
    return concat(...requests).pipe(toArray());
  }

  /**
   * Fetches history bookings for a given date range.
   */
  getHistoryBookings(params: HistoryParams): Observable<BookingsResult> {
    const url = `${environment.wsApiUrl}/2025/system/interfacereftab/TDMAPI/select/HISTORY`;
    const httpParams = new HttpParams()
      .set('costunit', params.costunitId)
      .set('workplace', params.workplaceId)
      .set('timestampFrom', params.timestampFrom.toString())
      .set('timestampTo', params.timestampTo.toString());

    console.log('[History API]', `${url}?${httpParams.toString()}`);

    return this.http
      .get<UnconfirmedBookingApiRow[]>(url, { params: httpParams })
      .pipe(
        map((rows) => {
          const mapped = rows.map((row) => this.mapApiRow(row));
          const toolItems = mapped.filter((r) => r.comporTool === 1);
          const toolAssemblies = mapped.filter((r) => r.comporTool === 2);
          return { toolItems, toolAssemblies };
        }),
        catchError((error) => {
          console.error(
            'BookingService: Error fetching history bookings:',
            error
          );
          return of({ toolItems: [], toolAssemblies: [] });
        })
      );
  }

  private mapApiRow(row: UnconfirmedBookingApiRow): BookingRow {
    const cancelNr = row.CANCELNR || '';
    return {
      id: row.ID || '',
      name: row.NAME || '',
      description: row.NAME2 || '',
      cancelNr,
      cancelNrBase: Math.floor(parseFloat(cancelNr) || 0),

      type: parseInt(row.TYPE, 10) || 0,
      comporTool: parseInt(row.COMPORTOOL, 10) || 0,
      unconfirmed: row.UNCONFIRMED === 'UNCONFIRMED',

      costunitFrom: row.COSTUNITFROM || '',
      workplaceFrom: row.WORKPLACEFROM || '',
      costunitTo: row.COSTUNITTO || '',
      workplaceTo: row.WORKPLACETO || '',
      costunitCosts: row.COSTUNITCOSTS || '',
      workplaceCosts: row.WORKPLACECOSTS || '',

      countNew: parseInt(row.COUNTNEW, 10) || 0,
      countUsed: parseInt(row.COUNTUSED, 10) || 0,
      countRepair: parseInt(row.COUNTREPAIR, 10) || 0,

      stockplaceId: row.STOCKPLACEID || '',

      bookTimestamp: parseInt(row.BOOKTIMESTAMP, 10) || 0,
      bookDate: row.BOOKDATE || '',
      bookTime: row.BOOKTIME || '',
      state: parseInt(row.STATE, 10) || 0,
      factor: parseFloat(row.FACTOR) || 0,
      costCorrelation: parseInt(row.COSTCORRELATION, 10) || 0,
      accountId: row.ACCOUNTID || '',
      bookText: row.BOOKTEXT || '',
      userId: row.USERID || '',
      invId: row.INVID || '',
      listId: row.LISTID || '',
      commissionId: row.COMMISSIONID || '',
      machineId: row.MACHINEID || '',
      machineName: row.MACHINENAME || '',
      transactionNr: parseInt(row.TRANSACTIONNR, 10) || 0,
      transactionListPos: parseInt(row.TRANSACTIONLISTPOS, 10) || 0,
    };
  }
}
