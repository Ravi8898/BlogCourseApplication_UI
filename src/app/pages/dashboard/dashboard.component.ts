import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  active: string = '/dashboard/home';
  roleName: any = '';
  loginType: any;
  userData: string | null = '';
  vendorLogin: string = '';
  division: string = '';
  roleNameArray:any;

  constructor(private router: Router) {
    this.active = router.url;
    this.roleName = localStorage.getItem('roleName') ? localStorage.getItem('roleName') : '';
    this.loginType = localStorage.getItem('logintype') ? localStorage.getItem('logintype') : '';
    this.userData = localStorage.getItem('userdata') == null ? '' : localStorage.getItem('userdata');
    this.division = localStorage.getItem('division') ? localStorage.getItem('division') || '' : '';
    // this.roleNameArray = localStorage.getItem('roleNameArray') ? localStorage.getItem('roleNameArray') || '' : '';
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

  activateNav(url: string) {
    this.active = url;
    console.log('active', this.active);
    if (url !== '') {
      this.router.navigate([url]);
    }
  }


  urlChange(event: any) {
    console.log('event', event);
    this.active = event;
  }
}
