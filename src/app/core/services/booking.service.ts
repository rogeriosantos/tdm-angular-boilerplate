import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../config/environment';

export interface BookingToolItem {
  transactionNumber: number;
  transactionListPosition: number;
  cancelListPosition: number;
  costunitId: string;
  workplaceId: string;
  stockplaceId: string;
  fromCostunitId: string;
  fromWorkplaceId: string;
  fromCostunitType: string;
  fromCostunitName: string;
  toCostunitId: string | null;
  toWorkplaceId: string | null;
  toCostunitType: string | null;
  toCostunitName: string | null;
  hallId: string;
  shelfId: string;
  drawerId: string;
  height: number;
  width: number;
  depth: number;
  listId: string | null;
  accountId: string | null;
  userId: string;
  area: string;
  commissionId: string | null;
  commissionRequestTimestamp: number;
  transactionReasonId: string | null;
  transactionReasonName: string | null;
  articleId: string;
  physicalArticleId: string | null;
  articleName: string;
  articleDescription: string;
  articleCadId: string;
  relationToolAssemblyId: string | null;
  relationToolAssemblyName: string | null;
  relationToolAssemblyDescription: string | null;
  relationToolAssemblyCadId: string | null;
  type: string;
  inventoryTypeId: string | null;
  deviceId: string | null;
  deviceType: string;
  countNew: number;
  countUsed: number;
  countRepair: number;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private http: HttpClient) {}

  getUnconfirmedBookings(
    costunitId: string,
    workplaceId: string,
    skip: number = 0,
    take: number = 50
  ): Observable<BookingToolItem[]> {
    const encodedWorkplace = encodeURIComponent(workplaceId);
    const url = `${environment.stockApiUrl}/Bookings/ToolItems/Unconfirmed/${costunitId}/${encodedWorkplace}`;
    const params = {
      skip: skip.toString(),
      take: take.toString(),
    };

    console.log('BookingService: Fetching unconfirmed bookings from:', url);

    return this.http.get<BookingToolItem[]>(url, { params }).pipe(
      map((response) => {
        console.log(
          'BookingService: Received response:',
          response.length,
          'items'
        );
        return response;
      }),
      catchError((error) => {
        console.error('BookingService: Error fetching bookings:', error);
        return of([]);
      })
    );
  }
}
