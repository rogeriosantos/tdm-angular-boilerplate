import { inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, concatMap, map, mergeMap } from 'rxjs/operators';

import { ToolDetailService } from '../../../core/services/tool-detail.service';
import * as ToolDetailActions from './tool-detail.actions';

@Injectable()
export class ToolDetailEffects {
  private actions$ = inject(Actions);
  private toolDetailService = inject(ToolDetailService);
  private sanitizer = inject(DomSanitizer);

  loadToolAssembly$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ToolDetailActions.LoadToolAssembly),
      concatMap(({ toolId }) =>
        this.toolDetailService.getToolAssembly(toolId).pipe(
          map((tool) => ToolDetailActions.LoadToolAssemblySuccess({ tool })),
          catchError((error: any) =>
            of(ToolDetailActions.LoadToolAssemblyFailure({ error }))
          )
        )
      )
    )
  );

  loadBillOfMaterials$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ToolDetailActions.LoadBillOfMaterials),
      concatMap(({ toolId }) =>
        this.toolDetailService.getToolAssemblyBillOfMaterials(toolId).pipe(
          map((billOfMaterials) =>
            ToolDetailActions.LoadBillOfMaterialsSuccess({ billOfMaterials })
          ),
          catchError((error: any) =>
            of(ToolDetailActions.LoadBillOfMaterialsFailure({ error }))
          )
        )
      )
    )
  );

  loadThumbnails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ToolDetailActions.LoadBillOfMaterialsSuccess),
      mergeMap((action) =>
        from(action.billOfMaterials).pipe(
          mergeMap((item) =>
            this.toolDetailService
              .getToolItemImage(item.elementToolItemId, 50, 50)
              .pipe(
                map((blob) => ({
                  id: item.elementToolItemId,
                  url: this.sanitizer.bypassSecurityTrustUrl(
                    URL.createObjectURL(blob)
                  ) as string,
                })),
                catchError(() =>
                  of({ id: item.elementToolItemId, url: '' })
                )
              )
          )
        )
      ),
      map((thumbnail) =>
        ToolDetailActions.LoadSingleThumbnailSuccess({
          thumbnail: thumbnail as { id: string; url: string },
        })
      )
    )
  );

  loadGraphic2D$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ToolDetailActions.LoadGraphic2D),
      concatMap(({ toolId }) =>
        this.toolDetailService.getToolAssembly2DGraphics(toolId, 1024, 768).pipe(
          map((graphic2D) =>
            ToolDetailActions.LoadGraphic2DSuccess({ graphic2D })
          ),
          catchError((error: any) =>
            of(ToolDetailActions.LoadGraphic2DFailure({ error }))
          )
        )
      )
    )
  );

  loadGraphicImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ToolDetailActions.LoadGraphicImage),
      concatMap(({ toolId }) =>
        this.toolDetailService.getToolAssemblyImage(toolId, 1024, 768).pipe(
          map((graphicImage) =>
            ToolDetailActions.LoadGraphicImageSuccess({ graphicImage })
          ),
          catchError((error: any) =>
            of(ToolDetailActions.LoadGraphicImageFailure({ error }))
          )
        )
      )
    )
  );
}
