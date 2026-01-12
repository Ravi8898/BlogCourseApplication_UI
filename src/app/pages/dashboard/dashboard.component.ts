import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  roleName: any = '';
  loginType: any;
  userData: string | null = '';
  vendorLogin: string = '';
  division: string = '';
  roleNameArray:any;

  constructor(private router: Router) {
  
    this.roleName = localStorage.getItem('role') ? localStorage.getItem('role') : '';
    this.userData = localStorage.getItem('userdata') == null ? '' : localStorage.getItem('userdata');
    this.roleNameArray = this.roleName ? this.roleName.split(',') : [];

    let user = JSON.parse(this.userData || '{}');
    this.vendorLogin = user?.ROLE || '';
    // console.log('userData', user, this.vendorLogin);
  }

    ngOnInit(): void {
    // if (this.roleName && this.roleName.includes('AllFrieghtMaster')) {
    //   this.active = '/All-Master';
    //   this.router.navigate(['/All-Master']);
    // }
  }

  /** ✅ single source of truth */
  isActive(route: string): boolean {
    return this.router.url === route;
  }

  /** ✅ navigation only */
  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
