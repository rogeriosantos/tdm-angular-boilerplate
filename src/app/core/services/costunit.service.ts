import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../config/environment';

export interface CostUnit {
  id: string;
  name: string;
}

interface CostUnitApiResponse {
  COSTUNIT: string;
  Name: string;
}

@Injectable({
  providedIn: 'root',
})
export class CostUnitService {
  constructor(private http: HttpClient) {}

  getCostUnits(): Observable<CostUnit[]> {
    const url = `${environment.wsApiUrl}/2025/system/interfacereftab/TDMAPI/select/COSTUNIT`;
    const params = {
      additionalProp1: 'string',
      additionalProp2: 'string',
      additionalProp3: 'string',
    };

    console.log('CostUnitService: Fetching cost units from:', url);

    return this.http.get<CostUnitApiResponse[]>(url, { params }).pipe(
      map((response) => {
        console.log('CostUnitService: Received response:', response.length, 'items');
        const costUnits = response.map((item) => ({
          id: item.COSTUNIT,
          name: item.Name || '',
        }));
        console.log('CostUnitService: Mapped cost units:', costUnits.length);
        return costUnits;
      }),
      catchError((error) => {
        console.error('CostUnitService: Error fetching cost units:', error);
        return of([]);
      })
    );
  }
}
