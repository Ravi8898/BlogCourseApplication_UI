import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';

@Component({
  selector: 'app-add-approval',
  templateUrl: './add-approval.component.html',
  styleUrls: ['./add-approval.component.scss']
})
export class AddApprovalComponent {
  panels = [
    { title: 'Department Approvers', isOpen: false },
    { title: 'CJPC Approvers', isOpen: false },
    { title: 'Final Bill Approvers', isOpen: false },
  ];

    constructor(
      private breadcrumbService: BreadcrumbService,
      private router: Router
    ) {
      this.breadcrumbService.setBreadcrumbUrl();
    }
  
    
  togglePanel(panel: any) {
    this.panels.forEach(p => {
      p.isOpen = (p === panel) ? !p.isOpen : false;
    });
  }

  goBack() {
    let FromAddContract = localStorage.getItem('FromAddContract');
    if (FromAddContract === 'true') {
      this.router.navigate(['CAD/contract/add-contract']);
    }
    else{
      this.router.navigate(['CAD/contract']);
    }
    // this.router.navigate(['CAD/contract']);
    // localStorage.removeItem('contractId');
    // FromAddContract = false;
  }
}
