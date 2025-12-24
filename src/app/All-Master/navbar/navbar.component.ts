import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  active: string = '/dashboard/home';
  roleName: string = '';
  roleList: string[] = [];

 constructor(private router: Router) {
    this.roleName = localStorage.getItem('roleName') ?? '';
    this.roleList = this.roleName
      ? this.roleName.split(',').map(r => r.trim())
      : [];

    // Always activate 'All-Master/frieght' if role includes AllFrieghtMaster
    if (this.roleList.includes('AllFrieghtMaster')) {
      this.active = '/All-Master/frieght';
      this.router.navigate(['/All-Master/frieght']);
    } else {
      this.active = router.url;
    }
  }

  activateNav(url: string) {
    this.active = url;
    if (url) {
      this.router.navigate([url]);
    }
  }
}
