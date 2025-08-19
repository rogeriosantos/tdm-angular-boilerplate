import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { switchMap, take } from 'rxjs/operators';
import { selectSettings } from '../state/i18n.reducer';

export const i18nInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return store.select(selectSettings).pipe(
    take(1),
    switchMap((settings) => {
      if (settings?.selectedDataLanguage) {
        const modifiedReq = req.clone({
          setHeaders: {
            'Accept-Language': settings.selectedDataLanguage,
          },
        });
        return next(modifiedReq);
      }
      return next(req);
    })
  );
};
