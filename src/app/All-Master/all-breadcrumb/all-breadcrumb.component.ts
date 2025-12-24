import { Component } from '@angular/core';
import { AllBreadcrumbItem } from './all-breadcrumb-item';
import { AllBreadcrumbService} from './all-breadcrumb.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './all-breadcrumb.component.html',
  styleUrls: ['./all-breadcrumb.component.scss']
})
export class AllBreadcrumbComponent {
  // breadcrumb: AllBreadcrumbItem[] = [];
  // breadcrumbArray:any = [];
  // roleName :any = '';

  // constructor(private breadcrumbService: AllBreadcrumbService, private router:Router, private activatedRoute:ActivatedRoute, private commonService:CommonService) {
  //   this.roleName = localStorage.getItem('roleName')?localStorage.getItem('roleName'):'';
  // }

  // ngOnInit(): void {
  //   this.breadcrumbService.breadcrumb$.subscribe((breadcrumb:any) => {

  //     this.breadcrumb = breadcrumb;
  //   });
  //   this.getBreadcrumbUrl();
  // }

  // getBreadcrumbUrl(){
  //   // console.log('getBreadcrumbUrl');
  //   this.breadcrumbService.getBreadcrumbUrl().subscribe(res=>{
  //     // console.log(res);
  //     if(res && res != '/dashboard'){
  //       this.setBreadcrumbUrl(res);
  //     }
  //   })
  // }

  // setBreadcrumbUrl(url:any){
  //   this.breadcrumbArray = [];
  //   console.log(url);
  //   let urlPath = url.split('?')[0];
  //   let icjNumber = url.split('?')[1];
  //   let urlPage = urlPath.split('/');
  //   urlPage.map((item:any)=>{
  //     if(item != '' && item != 'dashboard'){
  //       this.breadcrumbArray.push({
  //         // 'label': item,
  //         // 'label': item=='sitecontroller'?'Site Controller':item,
  //         'label': item=='storesincharge'?'Stores Incharge':item,
  //         'url': urlPath.split(item)[0].toString()+item,
  //       })
  //     }
  //   })
  // }

  // navigateToUrl(url:any){
  //   this.commonService.viewPurchase = false;
  //   this.router.navigate([url], {queryParams: this.activatedRoute.snapshot.queryParams})
  // }
}
