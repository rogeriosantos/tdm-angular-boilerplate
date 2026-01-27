import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../config/environment';

export interface Workplace {
  id: string;
  name: string;
}

interface WorkplaceApiResponse {
  WORKPLACE: string;
  NAME: string;
}

@Injectable({
  providedIn: 'root',
})
export class WorkplaceService {
  constructor(private http: HttpClient) {}

  getWorkplaces(costUnitId: string): Observable<Workplace[]> {
    const url = `${environment.wsApiUrl}/2025/system/interfacereftab/TDMAPI/select/WORKPLACE`;
    const params = {
      costunit: costUnitId,
    };

    console.log('WorkplaceService: Fetching workplaces for cost unit:', costUnitId);

    return this.http.get<WorkplaceApiResponse[]>(url, { params }).pipe(
      map((response) => {
        console.log('WorkplaceService: Received response:', response.length, 'items');
        const workplaces = response.map((item) => ({
          id: item.WORKPLACE,
          name: item.NAME || '',
        }));
        console.log('WorkplaceService: Mapped workplaces:', workplaces.length);
        return workplaces;
      }),
      catchError((error) => {
        console.error('WorkplaceService: Error fetching workplaces:', error);
        return of([]);
      })
    );
  }
}
