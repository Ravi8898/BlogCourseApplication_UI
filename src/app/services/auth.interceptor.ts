import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CommonService } from './common.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private commonService: CommonService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const count = parseInt(localStorage.getItem('unauthorizedCount') || '0', 10) + 1;
          localStorage.setItem('unauthorizedCount', count.toString());
          if (count > 1) {
            // Auto logout after more than one 401
            this.commonService.logout().subscribe({
              next: () => {
                localStorage.clear();
                this.router.navigate(['']);
              },
              error: () => {
                localStorage.clear();
                this.router.navigate(['']);
              }
            });
          }
        } else {
          // Reset counter on non-401 errors
          localStorage.setItem('unauthorizedCount', '0');
        }
        return throwError(error);
      })
    );
  }
}
