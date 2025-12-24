import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';

@Component({
  selector: 'app-add-contract',
  templateUrl: './add-contract.component.html',
  styleUrls: ['./add-contract.component.scss']
})
export class AddContractComponent {

  lineHeight: string = '100%';
  currentDate = moment(new Date).format("YYYY-MM-DD");
  contractId: string | null = null;
  panels = [
    { title: 'Contract Information', isOpen: true },
    { title: 'Work Order Advance', isOpen: false },
    { title: 'Work Order Clause', isOpen: false },
    { title: 'Statutory Compliance', isOpen: false }
  ];;

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
  goTOApprovers() {
    this.router.navigate(['CAD/contract/approvers'])
    localStorage.setItem('FromAddContract', 'true');
    console.log('from add contract');
    
  }

  getContractId(): string {
    this.contractId = localStorage.getItem('contractId');
    return this.contractId || '';
  }

  goBack() {
    this.router.navigate(['CAD/contract']);
    localStorage.removeItem('contractId');
  }
}
