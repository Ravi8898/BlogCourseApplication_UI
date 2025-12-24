import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AllBreadcrumbItem } from './all-breadcrumb-item';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AllBreadcrumbService {
  private breadcrumbSubject = new BehaviorSubject<AllBreadcrumbItem[]>([]);
  breadcrumb$: Observable<AllBreadcrumbItem[]> = this.breadcrumbSubject.asObservable();
  breadcrumbUrl = new BehaviorSubject('');

  constructor(private router:Router) {}

  setBreadcrumb(breadcrumb: AllBreadcrumbItem[]): void {
    this.breadcrumbSubject.next(breadcrumb);
  }

  getBreadcrumb(): AllBreadcrumbItem[] {
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
