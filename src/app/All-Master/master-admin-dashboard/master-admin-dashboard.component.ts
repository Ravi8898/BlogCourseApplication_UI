import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-master-admin-dashboard',
  templateUrl: './master-admin-dashboard.component.html',
  styleUrls: ['./master-admin-dashboard.component.scss']
})
export class MasterAdminDashboardComponent {
  active: any = 'AllFrieghtMaster';
  showElement = false;
  constructor(private commonService: CommonService, private router: Router, private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.active = this.router.url.split('/').pop();
  }
  setActive(page: any) {
    this.active = page;
    this.commonService.routeToPage('All-Master/' + page);
  }
}
