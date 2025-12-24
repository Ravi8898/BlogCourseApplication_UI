import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { BorderColorService } from 'src/app/common/services/border-color.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-view-contract-details',
  templateUrl: './view-contract-details.component.html',
  styleUrls: ['./view-contract-details.component.scss']
})
export class ViewContractDetailsComponent {
  roleName: string = '';
  projectData: any;
  CJPCID: any = 1;
  contractId: any;
  constractDetails: any;
  isLoader: boolean = false;
  currentDate: any = moment().format('YYYY-MM-DD');
  OriginalDate_clr: string = '';
  blink_OriginalDate: boolean = false;
  LastAmndDate_clr: string = '';
  blink_LastAmndDate: boolean = false;
  ActualComDate_clr: string = '';
  blink_ActualComDate: boolean = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private apiService: ApiService,
    private borderColorService: BorderColorService
  ) {
    this.breadcrumbService.setBreadcrumbUrl();
    this.roleName = localStorage.getItem('roleName') || '';

  }

  ngOnInit() {
    this.getContractId();
    this.getContractDetails();
  }

  getContractDetails() {
    const url = 'contract/getContractDetails';
    const data = {
      "contractid": this.contractId
    }
    this.apiService.dataPost(url, data).subscribe((response: any) => {
      console.log(response.data[0]);

      let value = response.data[0];
      this.constractDetails = value;
      //  this.contractForm.patchValue({
      //    WONumber: value.contractnumber,
      //    plant: value.plantname,
      //    company: value.companyname,
      //    vendorCode: value.vendorcode,
      //    vendorName: value.vendorname,
      //    WBSNo: value.costcenter,
      //    projectName: value.wbsccprojectname,
      //    Package: value.contractpackage,
      //    tds: value.tds,
      //    contractStartDate: value.contractdate,
      //    value: value.contractvalue,
      //    currency: value.currencycode,
      //    AMDT: value.amendmentdate,
      //    WOValue: value.amendmentvalue,
      //    completionDate: value.amendmentcompletiondate,
      //    lastCompletionDate: value.contractactualcompletiondate,
      //    VendorGSTN: value.vendorgstn,
      //    ClientGSTN: value.clientgstn,
      //  })


      // this.days = moment(this.contractForm.value.AMDT).diff(this.currentDate, 'days');
      // console.log('days', this.days);

      let days_1 = moment(this.constractDetails.ogCompletionDate).diff(this.currentDate, 'days');
      this.OriginalDate_clr = this.borderColorService.getColor(days_1);
      if (days_1 <= -7) {
        this.blink_OriginalDate = true
      } else {
        this.blink_OriginalDate = false
      }

      //Date Of Last AMDT.
      let days_2 = moment(this.constractDetails.LastAmndDate).diff(this.currentDate, 'days');
      this.LastAmndDate_clr = this.borderColorService.getColor(days_2);
      if (days_2 <= -7) {
        this.blink_LastAmndDate = true
      } else {
        this.blink_LastAmndDate = false
      }

      let days_3 = moment(this.constractDetails.lastAmndCompletionDate).diff(this.currentDate, 'days');
      this.ActualComDate_clr = this.borderColorService.getColor(days_3);
      if (days_3 <= -7) {
        this.blink_ActualComDate = true
      } else {
        this.blink_ActualComDate = false
      }

    });
  }



  getContractId(): string {
    this.contractId = localStorage.getItem('contractId') || '';
    return this.contractId;
  }

}
