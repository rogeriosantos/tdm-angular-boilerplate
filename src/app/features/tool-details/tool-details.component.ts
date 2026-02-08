import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { ToolbarComponent } from '../../layout/toolbar/toolbar.component';
import { ToolAssemblyDetail } from './models/tool-detail.model';
import * as ToolDetailActions from './state/tool-detail.actions';
import {
  selectToolAssembly,
  selectBillOfMaterials,
  selectBomThumbnailUrls,
  selectGraphics2D,
  selectGraphics2DLoading,
  selectGraphics2DError,
  selectGraphicsImage,
  selectGraphicsImageLoading,
  selectGraphicsImageError,
} from './state/tool-detail.selectors';
import { GraphicHelper } from './graphic-helper';
import { MaximizeDialogComponent } from './maximize-dialog/maximize-dialog.component';

@Component({
  selector: 'app-tool-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    TranslocoDirective,
    ToolbarComponent,
  ],
  templateUrl: './tool-details.component.html',
  styleUrls: ['./tool-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolDetailsComponent implements OnInit, OnDestroy {
  billOfMaterialsDisplayedColumns: string[] = [
    'position',
    'thumbnail',
    'id',
    'description',
    'quantity',
  ];

  tool$: Observable<ToolAssemblyDetail | null> = new Observable();
  billsOfMaterials$: Observable<any> = new Observable();
  thumbnailUrls$: Observable<{ [id: string]: string }> = new Observable();

  graphic2D$: Observable<any | null> = new Observable();
  graphic2DUrl: SafeUrl = '';
  graphic2DLoading$: Observable<boolean> = new Observable();

  graphicImage$: Observable<any | null> = new Observable();
  graphicImageUrl: SafeUrl = '';
  graphicImageLoading$: Observable<boolean> = new Observable();

  toolId: string | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly sanitizer: DomSanitizer,
    private readonly dialog: MatDialog
  ) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const toolId = (this.toolId = params.get('toolId'));

      if (toolId) {
        this.store.dispatch(ToolDetailActions.LoadToolAssembly({ toolId }));
        this.store.dispatch(ToolDetailActions.LoadBillOfMaterials({ toolId }));
        this.store.dispatch(ToolDetailActions.LoadGraphic2D({ toolId }));
        this.store.dispatch(ToolDetailActions.LoadGraphicImage({ toolId }));

        this.tool$ = this.store.select(selectToolAssembly).pipe(takeUntil(this.destroy$));

        this.billsOfMaterials$ = this.store
          .select(selectBillOfMaterials)
          .pipe(takeUntil(this.destroy$));

        this.thumbnailUrls$ = this.store
          .select(selectBomThumbnailUrls)
          .pipe(takeUntil(this.destroy$));

        // Graphics 2D
        this.graphic2D$ = this.store.select(selectGraphics2D).pipe(takeUntil(this.destroy$));
        const error2D$ = this.store.select(selectGraphics2DError).pipe(takeUntil(this.destroy$));
        this.graphic2DLoading$ = this.store
          .select(selectGraphics2DLoading)
          .pipe(takeUntil(this.destroy$));

        const graphicHelper2D = new GraphicHelper(
          this.graphic2D$,
          error2D$,
          this.destroy$,
          this.sanitizer
        );
        graphicHelper2D.handleGraphicUrl((url: SafeUrl) => {
          this.graphic2DUrl = url;
        });

        // Graphics Image
        this.graphicImage$ = this.store.select(selectGraphicsImage).pipe(takeUntil(this.destroy$));
        const errorImage$ = this.store
          .select(selectGraphicsImageError)
          .pipe(takeUntil(this.destroy$));
        this.graphicImageLoading$ = this.store
          .select(selectGraphicsImageLoading)
          .pipe(takeUntil(this.destroy$));

        const graphicHelperImage = new GraphicHelper(
          this.graphicImage$,
          errorImage$,
          this.destroy$,
          this.sanitizer
        );
        graphicHelperImage.handleGraphicUrl((url: SafeUrl) => {
          this.graphicImageUrl = url;
        });
      }
    });
  }

  goBack() {
    this.location.back();
  }

  maximizeGraphic(url: SafeUrl) {
    this.dialog.open(MaximizeDialogComponent, {
      data: { url },
      width: '90%',
      height: '90%',
    });
  }
}
