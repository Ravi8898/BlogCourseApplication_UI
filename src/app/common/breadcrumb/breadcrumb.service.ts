import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BreadcrumbItem } from './breadcrumb-item';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private breadcrumbSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  breadcrumb$: Observable<BreadcrumbItem[]> = this.breadcrumbSubject.asObservable();
  breadcrumbUrl = new BehaviorSubject('');

  constructor(private router:Router) {}

  setBreadcrumb(breadcrumb: BreadcrumbItem[]): void {
    this.breadcrumbSubject.next(breadcrumb);
  }

  getBreadcrumb(): BreadcrumbItem[] {
    return this.breadcrumbSubject.value;
  }

  setBreadcrumbUrl(){
    // console.log('setbrea');
    // console.log(this.router.url)
    this.breadcrumbUrl.next(this.router.url);
  }

  getBreadcrumbUrl(){
    return this.breadcrumbUrl.asObservable();
  }
}
