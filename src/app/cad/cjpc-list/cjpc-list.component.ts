import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-cjpc-list',
  templateUrl: './cjpc-list.component.html',
  styleUrls: ['./cjpc-list.component.scss']
})
export class CjpcListComponent {
  columns: any[] = []
  columns_release: any[] = []
  columns_retention: any[] = []
  successToast: boolean = false;
  errorToast: boolean = false;
  toastMsg: string = '';
  data: any[] = [];
  workOrderNumber: any;
  activeTab: string = 'tab1';

  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private apiService: ApiService
  ) {
    this.breadcrumbService.setBreadcrumbUrl();
    // const navigation = this.router.getCurrentNavigation();
    // const state = navigation?.extras.state as { workOrderNumber: string };
    // this.workOrderNumber = state?.workOrderNumber
    // if(this.workOrderNumber){
    //   localStorage.setItem('workOrderNumber',this.workOrderNumber)
    // }
    // console.log('invoice id',this.workOrderNumber)
    // if(localStorage.getItem('workOrderNumber') != 'undefined'){
    //   this.workOrderNumber = localStorage.getItem('workOrderNumber')
    // }
  }
  ngOnInit() {
    this.columns = [
      { name: 'Release No.', hide_col: false, isFilter: false },
      { name: 'CJPC Date', hide_col: false, isFilter: false, },
      { name: 'CJPC Id', hide_col: false, isFilter: false, },
      { name: 'Project Name and Location', hide_col: false, isFilter: false },
      { name: 'RA Bill No.', hide_col: false, isFilter: false },
      { name: 'Bill Type', hide_col: false, isFilter: false },

      { name: 'Package', hide_col: false, isFilter: false },
      { name: 'Contractors Name', hide_col: false, isFilter: false },
      { name: 'Vendor Code', hide_col: false, isFilter: false },
      { name: 'Contract / WO ref.', hide_col: false, isFilter: false },

      { name: 'Status', hide_col: false, isFilter: false },
      { name: 'Hold/Release Status', hide_col: false, isFilter: false },
      { name: 'CJPC Type', hide_col: true, isFilter: false },
      { name: 'View Details', hide_col: false, isFilter: false },
    ];

    this.columns_release = [
      { name: 'Release No.', hide_col: false, isFilter: false },
      { name: 'CJPC Date', hide_col: false, isFilter: false, },
      { name: 'CJPC Id', hide_col: false, isFilter: false, },
      { name: 'Project Name and Location', hide_col: false, isFilter: false },
      { name: 'Project Code', hide_col: true, isFilter: false },
      { name: 'Bill Type', hide_col: false, isFilter: false },

      { name: 'Package', hide_col: false, isFilter: false },
      { name: 'Contractors Name', hide_col: false, isFilter: false },
      { name: 'Vendor Code', hide_col: false, isFilter: false },
      { name: 'Contract / WO ref.', hide_col: false, isFilter: false },

      { name: 'Status', hide_col: false, isFilter: false },
      { name: 'Hold/Release Status', hide_col: true, isFilter: false },
      { name: 'CJPC Type', hide_col: true, isFilter: false },
      { name: 'View Details', hide_col: false, isFilter: false },
      { name: 'holdreleaseid', hide_col: true, isFilter: false },
    ];

    this.columns_retention = [
      { name: 'CJPC Date', hide_col: false, isFilter: false, },
      { name: 'CJPC Id', hide_col: false, isFilter: false },
      { name: 'Project Name and Location', hide_col: false, isFilter: false },
      { name: 'Package', hide_col: false, isFilter: false },
      { name: 'Contractors Name', hide_col: false, isFilter: false },
      { name: 'Vendor Code', hide_col: false, isFilter: false },
      { name: 'Contract / WO ref.', hide_col: true, isFilter: false },
      { name: 'Retention Id', hide_col: true, isFilter: false, },
      { name: 'Retention Type', hide_col: false, isFilter: false },
      { name: 'Status', hide_col: false, isFilter: false },
      { name: 'View Details', hide_col: false, isFilter: false },

    ]

    this.successToast = false;
    this.errorToast = false;
    this.toastMsg = '';


    this.workOrderNumber = this.activeRoute.snapshot.queryParamMap.get('wo') || '';
    console.log('this.workOrderNumber', this.workOrderNumber);

    this.getCjpcList();
  }

  getCjpcList() {



    let url = ''
    if (this.activeTab === 'tab2') {
      url = 'contract/getHoldReleaseCjpcList';

      this.columns.map((col: any) => {
        if (col.name === 'Release No.') {
          col.hide_col = false;
        }
      })

    } else if (this.activeTab == 'tab3') {
      url = 'contract/getRetentionReleaseCJPCList';
      this.columns.map((col: any) => {
        if (col.name === 'Release No.') {
          col.hide_col = true;
        }
      })
    }
    else {
      url = 'contract/getcjpcListBasedOnContractNumer';
      this.columns.map((col: any) => {
        if (col.name === 'Release No.') {
          col.hide_col = true;
        }
      })


    }
    let params = {
      "contractnumber": this.workOrderNumber,
      "fetchType": this.apiService.getRoleName(),
      "adID": this.apiService.getUserName(),
    }
    this.apiService.dataPost(url, params).subscribe(
      (res: any) => {
        let result = res.data && res.data.map((key: any) => {
          let cjpcType = ''
          if (key.holdreleasenumber) {
            cjpcType = 'Hold Release'
          } else if (key.fkretentionreleaseid) {
            cjpcType = 'Retention Release'
          } else if (key.invoicetypename == 'DPR') {
            cjpcType = 'DPR'
          } else {
            cjpcType = 'Invoice'
          }
          return {
            'Release No.': key.holdreleasenumber,
            'CJPC Date': moment(key.createddate).format('DD-MMM-YYYY'),
            'CJPC Id': key.cjpcid,
            'Project Name and Location': key.wbs_cc_projectname,
            'RA Bill No.': key.invoicenumber,
            'Project Code': key.projectcode,
            'Bill Type': key.invoicetypename,
            'Package': key.contractpackage,
            'Contractors Name': key.vendorname,
            'Vendor Code': key.vendorcode,
            'Contract / WO ref.': key.contractnumber,
            'Status': key.invoicestatus || key.status,
            'Hold/Release Status': key.holdStatus,
            'CJPC Type': cjpcType, //key.holdreleasenumber ? 'Hold Release' : 'Invoice',
            'View Details': '',
            'holdreleaseid': key.holdreleaseid,
            'Retention Type': key.retentionreleasefor,
          }
        })
        this.data = result;
      }, error => {
        // console.log(error);
        this.apiService.handleError(error);
      });
  }

  goBack() {
    this.router.navigate(['CAD/contract'])
  }

  activateTab(tab: string): void {
    this.activeTab = tab;
    this.getCjpcList();
  }
}