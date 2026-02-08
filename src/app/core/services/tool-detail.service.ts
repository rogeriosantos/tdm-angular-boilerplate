import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../config/environment';
import {
  ToolAssemblyDetail,
  ToolAssemblyBillOfMaterial,
} from '../../features/tool-details/models/tool-detail.model';

@Injectable({
  providedIn: 'root',
})
export class ToolDetailService {
  constructor(private readonly http: HttpClient) {}

  getToolAssembly(toolId: string): Observable<ToolAssemblyDetail> {
    const url = `${environment.baseApiUrl}/api/V1_1/Tools/${toolId}`;
    return this.http.get<ToolAssemblyDetail>(url);
  }

  getToolAssemblyBillOfMaterials(toolId: string): Observable<ToolAssemblyBillOfMaterial[]> {
    const url = `${environment.baseApiUrl}/api/V1_1/Tools/${toolId}/billOfMaterials`;
    return this.http.get<ToolAssemblyBillOfMaterial[]>(url);
  }

  getToolAssembly2DGraphics(
    assetId: string,
    width: number = 400,
    height: number = 400
  ): Observable<Blob> {
    const url = `${environment.baseApiUrl}/api/V1_1/Tools/assets/Image2D/${assetId}?width=${width}&height=${height}&showDimensions=true&usePrintTemplate=false`;
    return this.http.get(url, { responseType: 'blob' });
  }

  getToolAssemblyImage(
    toolId: string,
    width: number = 50,
    height: number = 50
  ): Observable<Blob> {
    const url = `${environment.baseApiUrl}/api/V1_1/Tools/${toolId}/assets/Thumbnail?width=${width}&height=${height}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  getToolItemImage(
    toolItemId: string,
    width: number = 50,
    height: number = 50
  ): Observable<Blob> {
    const url = `${environment.baseApiUrl}/api/V1_1/ToolItems/${toolItemId}/assets/Thumbnail?width=${width}&height=${height}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
