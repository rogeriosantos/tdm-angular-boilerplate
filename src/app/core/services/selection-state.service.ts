import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap, catchError, of } from 'rxjs';
import { CostUnit } from './costunit.service';
import { Workplace } from './workplace.service';
import { UserProfileService } from './user-profile.service';
import { environment } from '../config/environment';

const COST_UNIT_KEY = 'pebe_selectedCostUnit';
const WORKPLACE_KEY = 'pebe_selectedWorkplace';

interface UserCostUnitApiResponse {
  COSTUNIT: string;
  WORKPLACE: string;
}

export interface UserDefaultSelection {
  costUnit: CostUnit;
  workplace: Workplace;
}

@Injectable({ providedIn: 'root' })
export class SelectionStateService {
  private http = inject(HttpClient);
  private userProfileService = inject(UserProfileService);

  saveCostUnit(costUnit: CostUnit | null): void {
    if (costUnit) {
      sessionStorage.setItem(COST_UNIT_KEY, JSON.stringify(costUnit));
    } else {
      sessionStorage.removeItem(COST_UNIT_KEY);
      sessionStorage.removeItem(WORKPLACE_KEY);
    }
  }

  saveWorkplace(workplace: Workplace | null): void {
    if (workplace) {
      sessionStorage.setItem(WORKPLACE_KEY, JSON.stringify(workplace));
    } else {
      sessionStorage.removeItem(WORKPLACE_KEY);
    }
  }

  getSavedCostUnit(): CostUnit | null {
    const raw = sessionStorage.getItem(COST_UNIT_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getSavedWorkplace(): Workplace | null {
    const raw = sessionStorage.getItem(WORKPLACE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  /**
   * Fetches the user's default cost unit and workplace from the USERCOSTUNIT endpoint.
   * 1. Gets the claims/name from the UserInfo response
   * 2. Calls USERCOSTUNIT?user=<claimsName>
   * 3. Returns the default selection
   */
  fetchUserDefaults(): Observable<UserDefaultSelection | null> {
    return this.userProfileService.getUserInfo().pipe(
      switchMap((profile) => {
        const claimsName = profile.claimsName;
        if (!claimsName) {
          console.warn('[SelectionState] No claims name found in user profile');
          return of(null);
        }

        console.log('[SelectionState] Fetching user defaults for:', claimsName);
        const url = `${environment.wsApiUrl}/2025/system/interfacereftab/TDMAPI/select/USERCOSTUNIT`;
        const params = new HttpParams().set('user', claimsName);

        return this.http.get<UserCostUnitApiResponse[]>(url, { params }).pipe(
          map((rows) => {
            if (!rows || rows.length === 0) {
              console.warn('[SelectionState] No default selection found for user:', claimsName);
              return null;
            }

            const row = rows[0];
            console.log('[SelectionState] User defaults:', row);

            const costUnit: CostUnit = { id: row.COSTUNIT, name: '' };
            const workplace: Workplace = { id: row.WORKPLACE, name: '' };

            return { costUnit, workplace };
          })
        );
      }),
      catchError((error) => {
        console.error('[SelectionState] Failed to fetch user defaults:', error);
        return of(null);
      })
    );
  }
}
