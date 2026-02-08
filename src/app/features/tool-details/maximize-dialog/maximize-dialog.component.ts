import { Component, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-maximize-dialog',
  standalone: true,
  imports: [MatIconModule, TranslocoDirective],
  template: `
    <div class="dialog-content" *transloco="let t; read: 'tool-details'">
      <img
        [src]="data.url"
        [alt]="t('maximized-graphic-alt')"
        class="maximized-graphic"
        [style.transform]="'scale(' + scale + ')'"
        [style.transform-origin]="transformOrigin"
      />
      <div class="scroll-indicator">
        <mat-icon>mouse</mat-icon>
        <span>{{ t('scroll-to-zoom') }}</span>
      </div>
      <div class="zoom-factor">
        <mat-icon>zoom_in</mat-icon>
        <span>{{ (scale * 100).toFixed(0) }}%</span>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-content {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        overflow: hidden;
        position: relative;
      }

      .maximized-graphic {
        max-width: 100%;
        max-height: 100%;
        transition: transform 0.2s ease;
        cursor: crosshair;
      }

      .scroll-indicator {
        position: absolute;
        bottom: 10px;
        right: 10px;
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
      }

      .scroll-indicator mat-icon {
        margin-right: 5px;
      }

      .zoom-factor {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
      }

      .zoom-factor mat-icon {
        margin-right: 5px;
      }
    `,
  ],
})
export class MaximizeDialogComponent {
  scale = 1;
  transformOrigin = 'center center';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { url: string }) {}

  @HostListener('document:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();

    const zoomSpeed = 0.1;
    const minScale = 1;
    const maxScale = 3;

    const zoomIn = event.deltaY < 0;
    this.scale += zoomIn ? zoomSpeed : -zoomSpeed;
    this.scale = Math.min(Math.max(this.scale, minScale), maxScale);

    const imageElement = document.querySelector('.maximized-graphic') as HTMLElement;
    if (imageElement) {
      const rect = imageElement.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const normalizedX = offsetX / rect.width;
      const normalizedY = offsetY / rect.height;
      this.transformOrigin = `${normalizedX * 100}% ${normalizedY * 100}%`;
    }
  }
}
