import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../config/environment';

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
}

export interface BookingsResult {
  toolItems: BookingRow[];
  toolAssemblies: BookingRow[];
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private http: HttpClient) {}

  /**
   * Fetches all unconfirmed bookings (both tool items and assemblies)
   * from the unified WSAPI endpoint, then splits by COMPORTOOL.
   */
  getUnconfirmedBookings(
    costunitId: string,
    workplaceId: string
  ): Observable<BookingsResult> {
    const url = `${environment.wsApiUrl}/2025/system/interfacereftab/TDMAPI/select/UNCONFIRMED`;
    const params = {
      costunit: costunitId,
      workplace: workplaceId,
    };

    return this.http.get<UnconfirmedBookingApiRow[]>(url, { params }).pipe(
      map((rows) => {
        const mapped = rows.map((row) => this.mapApiRow(row));
        const toolItems = mapped.filter((r) => r.comporTool === 1);
        const toolAssemblies = mapped.filter((r) => r.comporTool === 2);
        return { toolItems, toolAssemblies };
      }),
      catchError((error) => {
        console.error('BookingService: Error fetching unconfirmed bookings:', error);
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
    };
  }
}
