import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {

  active :any = 'vendor';
  showElement = false;

  constructor(private commonService:CommonService,private router:Router, private route:ActivatedRoute){}

  ngOnInit():void{
    this.active = this.router.url.split('/').pop();
  }

  setActive(page:any){
    console.log(page);
    this.active = page;
    this.commonService.routeToPage('admin/'+page);
  }
}
