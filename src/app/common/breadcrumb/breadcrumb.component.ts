import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BreadcrumbItem } from './breadcrumb-item';
import { BreadcrumbService } from './breadcrumb.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {
  breadcrumb: BreadcrumbItem[] = [];
  @Output() changedUrl = new EventEmitter<string>()
  breadcrumbArray:any = [];
  roleName :any = '';
  urlPage: any[]=[];

  constructor(private breadcrumbService: BreadcrumbService, private router:Router, private activatedRoute:ActivatedRoute, private commonService:CommonService) {
    this.roleName = localStorage.getItem('roleName')?localStorage.getItem('roleName'):'';
  }

  ngOnInit(): void {
    this.breadcrumbService.breadcrumb$.subscribe((breadcrumb) => {
      
      this.breadcrumb = breadcrumb;
    });
    this.getBreadcrumbUrl();
  }

  getBreadcrumbUrl(){
    // console.log('getBreadcrumbUrl');
    this.breadcrumbService.getBreadcrumbUrl().subscribe(res=>{
      // console.log(res);
      if(res && res != '/dashboard'){
        this.setBreadcrumbUrl(res);
      }
    })
  }

  setBreadcrumbUrl(url:any){
    this.breadcrumbArray = [];
    // console.log(url);
    let urlPath = url.split('?')[0];
    let icjNumber = url.split('?')[1];
    this.urlPage = urlPath.split('/');
    this.urlPage.map((item:any)=>{
      if((item != '' && item != 'dashboard' ) && (item != 'CAD') && (item !='paperless-work') ){
        this.breadcrumbArray.push({
          // 'label': item,
          // 'label': item=='sitecontroller'?'Site Controller':item,
          'label': item=='storesincharge'?'Stores Incharge':item,
          'url': urlPath.split(item)[0].toString()+item,
        })
      }
    })
  }

  navigateToUrl(url:any){
    this.commonService.viewPurchase = false;
    this.changedUrl.emit(url);
      this.router.navigate([url], {queryParams: this.activatedRoute.snapshot.queryParams})
  } 


}
