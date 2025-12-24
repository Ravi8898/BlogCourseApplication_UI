import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-advance-and-retention',
  templateUrl: './advance-and-retention.component.html',
  styleUrls: ['./advance-and-retention.component.scss']
})
export class AdvanceAndRetentionComponent {
  form!: FormGroup;
  @Input() contractDetails: any;
  @Input() CJPCID: string = '';
  @Input() billingDetails: any

  username: string = ''
  unadjustedBalance: number = 0;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.username = localStorage.getItem('username') || ''
  }

  ngOnInit(): void {
    console.log('contractDetails', this.contractDetails);
    this.form = this.fb.group({
      maxAmountPaidHold: ['', Validators.required],
      currentBalance: ['', Validators.required],
      cbpgvlues: [''],
      advanceRecoveryPercent: ['', Validators.required],
      retentionCalculateBalance: [''],
      retentionCurrentBalance: [''],
      calculateAmount: [''],
      retentionMaxAmountPaidHold: ['', Validators.required],
      retentionValues: [''],

      cpbgMaxAmountPaidHold: [''],
      cpbgCurrentBalance: ['', Validators.required],
      adhocMaxAmountPaidHoldPercent: [''],
      adhocCurrentBalance: ['', Validators.required],

      pbgCurrentBalance: [''],
      pbgRetentionPercent: [''],
      pbgCalculateRetentionAmount: [''],
      pbgTotalRetentionAmount: [''],

    });
    this.AdvanceRecoveryCalculation()
    this.AdvanceRetentionCalculation()
  }

  AdvanceRetentionCalculation() {
    let url = 'contract/pbgretentionCal'
    let passParams = {
      "cjpcId": this.CJPCID,
      "contractNumber": this.contractDetails?.contractnumber || "",
      "billId": this.billingDetails.billinvoiceid,
      "userName": this.apiService.getUserName()
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        console.log('response', res);
        this.form.patchValue({
          pbgCurrentBalance: res?.pbgamount,
          pbgRetentionPercent: res?.retentionPer,
          pbgCalculateRetentionAmount: res?.retentionamount,
          pbgTotalRetentionAmount: res?.totalretentionamount,

        });
      }, error => {
        this.apiService.handleError(error)
      }
    )

    let url1 = 'contract/cpbgretentionCal'
    let passParams1 = {
      "cjpcId": this.CJPCID,
      "contractNumber": this.contractDetails?.contractnumber || "",
      "billId": this.billingDetails.billinvoiceid,
      "userName": this.apiService.getUserName()
    }
    this.apiService.dataPost(url1, passParams1).subscribe(
      (res: any) => {
        console.log('response', res);
        this.form.patchValue({
          cbpgvlues: res?.cpbgamount,
          retentionValues: res?.retentionPer,
          retentionCalculateBalance: res?.retentionamount,
          retentionCurrentBalance: res?.totalretentionamount,
        });
      }, error => {
        this.apiService.handleError(error)
      }
    )
  }
  calculateAmountValue() {
    this.updateAdvanceRecovery()

  }

  AdvanceRecoveryCalculation() {
    let url = 'contract/AdvanceRecoveryCal'
    let passParams = {
      "cjpcId": this.CJPCID,
      "contractNumber": this.contractDetails?.contractnumber || "1200963636",
      "billId": this.billingDetails.billinvoiceid,
      "userName": this.username
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        console.log('response', res);
        this.form.patchValue({
          calculateAmount: res?.deductedAmount || 0,
          maxAmountPaidHold: res?.totalDprAmt || 0,
          currentBalance: res?.totalrecovered || 0,
          advanceRecoveryPercent: res?.amtRecPer || 0,
          // retentionMaxAmountPaidHold: res?.totalrecovered || 0,
        });

        this.unadjustedBalance = (res?.totalDprAmt - res?.totalrecovered) || 0;

      }, error => {
        this.apiService.handleError(error)
      }
    )
  }

  updateAdvanceRecovery() {
    const percentage = this.form.get('advanceRecoveryPercent')?.value;
    let url = 'contract/updateAdvanceRecovery'
    let passParams = {
      "contractNumber": this.contractDetails?.contractnumber || "1200963636",
      "perValue": percentage,
      "billInvoiceId": this.billingDetails.billinvoiceid,
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        console.log('response', res);
        this.AdvanceRecoveryCalculation()
      }, error => {
        this.apiService.handleError(error)
      }
    )
  }

  updateRetentionBPG() {
    const percentage = this.form.get('pbgRetentionPercent')?.value;
    let url = 'contract/updatePBGRetentionPer'
    let passParams = {
      "contractNumber": this.contractDetails?.contractnumber || "",
      "perValue": percentage,
      "billInvoiceId": this.billingDetails.billinvoiceid,
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        console.log('response', res);
        this.AdvanceRetentionCalculation()
      }, error => {
        this.apiService.handleError(error)
      }
    )
  }

  updateRetentionCBPG() {
    const percentage = this.form.get('retentionValues')?.value;
    let url = 'contract/updateCPBGRetentionPer'
    let passParams = {
      "contractNumber": this.contractDetails?.contractnumber || "",
      "perValue": percentage,
      "billInvoiceId": this.billingDetails?.billinvoiceid || "",
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        console.log('response', res);
        this.AdvanceRetentionCalculation()
      }, error => {
        this.apiService.handleError(error)
      }
    )
  }

}
