import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ScannerService } from './game/scanner/scanner.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    {
      provide: APP_INITIALIZER,
      useFactory: (scannerService: ScannerService) => () => {
        scannerService.init().then(()=>{
          scannerService.loading = false
        });
      },
      deps: [ScannerService],
      multi: true,
    },
  ],
};
