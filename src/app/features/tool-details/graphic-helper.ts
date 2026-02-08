import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { combineLatest, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class GraphicHelper {
  constructor(
    private readonly graphic$: Observable<any>,
    private readonly error$: Observable<any>,
    private readonly destroy$: Observable<void>,
    private readonly sanitizer: DomSanitizer
  ) {}

  public handleGraphicUrl(callback: (url: SafeUrl) => void): void {
    combineLatest([this.graphic$, this.error$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([blob, error]) => {
        let graphicUrl: SafeUrl = '';
        if (error) {
          graphicUrl = 'assets/icons/no-image-placeholder.svg';
        } else if (blob) {
          const data = blob;
          if (data === undefined || data.size === 0) {
            graphicUrl = 'assets/icons/no-image-placeholder.svg';
          } else {
            graphicUrl = this.createObjectURL(data);
          }
        }
        callback(graphicUrl);
      });
  }

  private createObjectURL(data: any): SafeUrl {
    let blob: Blob;
    if (data instanceof Blob) {
      blob = data;
    } else {
      blob = new Blob([data], { type: 'application/octet-stream' });
    }
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
  }
}
