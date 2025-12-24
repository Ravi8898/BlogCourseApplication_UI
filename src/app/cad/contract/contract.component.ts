import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss']
})
export class ContractComponent {

  isLoader: boolean = false;
  contractList: any[] = [];
  loginType: string = ''
  activeTab: string = 'tab1';
  modalName: string = '';
  searchModal: string = ''
  contractSearchObject: any[] = [];
  roleName: string = '';
  columns: any[] = []
  retentionReleaseModal: boolean = false;
  retentionId: number = 0;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private apiService: ApiService,
    private fb: FormBuilder,
  ) {
    this.breadcrumbService.setBreadcrumbUrl();
    this.roleName = localStorage.getItem('roleName') || '';

  }
  ngOnInit() {
    this.columns = [
      { name: 'contractId', hide_col: true, isFilter: false, },
      { name: 'Contract Date', hide_col: true, isFilter: false, },
      { name: 'WO No', hide_col: false, isFilter: true, },
      { name: 'Plant', hide_col: false, isFilter: true, },
      { name: 'Vendor Code', hide_col: false, isFilter: true, },
      { name: 'Status', hide_col: false, isFilter: false, },
      { name: `No.'s of Invoice`, hide_col: false, isFilter: false, },
      { name: 'Retention For', hide_col: false, isFilter: false, },
      { name: 'Retention Release / SCC', hide_col: false, isFilter: false, },
      { name: 'Approvers', hide_col: (this.roleName == 'Checker' || this.roleName == 'Project Manager'), isFilter: false, },
      { name: 'CJPC / Payments', hide_col: false, isFilter: false, },
      { name: 'Action', value: ['edit', 'delete'], hide_col: false, isFilter: false, },
      { name: 'retentionrelese', hide_col: true, isFilter: false, },
      { name: 'retentionreleseId', hide_col: true, isFilter: false, },
    ];

    if (this.roleName === 'Project Manager' || this.roleName === 'Checker') {
      this.columns = this.columns.map(col => {
        if (col.name === 'Action') {
          return {
            ...col,
            value: ['view']
          };
        }
        return col;
      });
    }

    this.getContractData()


  }
  goToAdd() {
    localStorage.removeItem('contractId'); // remove contractId from local storage
    this.router.navigate(['CAD/contract/add-contract'])
  }
  activateTab(tab: string): void {
    this.activeTab = tab;
  }
  applyPurchaseSearch(data: any) {

  }
  onDeleteConfirmedPurchase(invoice_no: any) { }

  getContractData() {

    this.isLoader = true
    const url = 'contract/getContractList'
    let passParam = {
      "fetchType": this.apiService.getRoleName(),
      "adID": this.apiService.getUserName(),
    }
    this.apiService.dataPost(url, passParam).subscribe(
      (res: any) => {
        this.contractList = res.data && res.data.map((key: any) => {
          return {
            'contractId': key.contractid,
            'Contract Date': key.contractdate,
            'WO No': key.contractumber,
            'Plant': key.plantname,
            'Vendor Code': key.vendorcode,
            'Status': key.status,
            "No.'s of Invoice": key.count,
            "Retention For": key.retentionrelesefor,
            'Approvers': '',
            'CJPC / Payments': '',
            'Action': '',
            'retentionrelese': key.retentionrelese,
            'retentionreleseId': key.retentionreleseId,

          }
        })
        this.isLoader = false
      },
      error => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    )
  }

  onEdit(value: any) {
    console.log('value', value);

    localStorage.setItem('contractId', value.contractId);
    this.router.navigate(['CAD/contract/add-contract'])
  }

  onView(value: any) {
    localStorage.setItem('contractId', value.contractId);
    this.router.navigate(['CAD/contract/contract-details'])
    console.log('value', value);

  }

  onDelete(value: any) {
    console.log('value', value);

    const url = 'contract/deleteContract'
    let passParam = {
      "id": value.contractId,
      "isActive": false,
      "loginuser": "Test User"
    }
    this.apiService.dataPost(url, passParam).subscribe(
      (res: any) => {
        this.getContractData()
      }, error => {
        this.apiService.handleError(error);
      });
  }

  rowClick(event: any) {
    // console.log('event', event);
    if (event.columnName === 'Retention Release / SCC') {
      this.retentionReleaseModal = true;
      this.retentionId = event.rowData['retentionreleseId'] || 0;
      // this.retentionReleaseForm.patchValue({
      //   vendorCode: event.rowData['Vendor Code'],
      //   woNumber: event.rowData['WO No'],
      //   retetionAmount: '',
      // });
    }
  }

  closeRetentionModal(event: any) {
    console.log('event from child', event);
    this.retentionReleaseModal = event;

  }


}
