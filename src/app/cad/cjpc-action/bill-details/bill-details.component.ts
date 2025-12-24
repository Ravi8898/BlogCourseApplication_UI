import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-bill-details',
  templateUrl: './bill-details.component.html',
  styleUrls: ['./bill-details.component.scss']
})
export class BillDetailsComponent {
  @Input() CJPCID: string = '';

  billForm!: FormGroup;
  billingDetails: any;
  billType: string = '';

  constructor(
    private breadcrumbService: BreadcrumbService, 
    private fb: FormBuilder, 
    private fs: FormService, 
    private apiService: ApiService
  ) {
  }

  ngOnInit(): void {
    this.billForm = this.fb.group({
      billType: [{ value: '', disabled: true }],
      billNumber: [{ value: '', disabled: true }],
      invoicePeriod: [{ value: '', disabled: true }],
      contractorBillRef: [{ value: '', disabled: true }],
      dated: [{ value: '', disabled: true }],
      invoicePeriodDuplicate: [{ value: '', disabled: true }],
      invoiceAmount: [{ value: '' }],
      completeBillRectDate: [{ value: '', disabled: true }],
      paymentDueDate: [{ value: '', disabled: true }],
      sesDprNo: [{ value: '', disabled: true }]
    });
    this.getBillDetails();
    const json = [{}]
    this.setDynamicValues(json)
  }

  setDynamicValues(data: any): void {
    const formatDate = (dateString: string) => dateString ? dateString.split('T')[0] : '';
console.log('data', data);

    this.billForm.patchValue({
      billType: data?.invoicetypename || '',
      billNumber: data?.invoicenumber || '',
      invoicePeriod: `${moment(data?.invoicefromdate).format('DD-MMM-YYYY')} To ${moment(data?.invoicetodate).format('DD-MMM-YYYY')}`,
      contractorBillRef: data?.runningaccbillno || '',
      dated: moment(data?.dated).format('DD-MMM-YYYY') || '',
      invoicePeriodDuplicate: '',
      invoiceAmount: data?.netpayableamount || '',
      completeBillRectDate: moment(data?.completebillrectdate).format('DD-MMM-YYYY') || '',
      paymentDueDate: moment(data?.paymentDueDate).format('DD-MMM-YYYY') || '',
      sesDprNo: data?.dprNumber || ''
    });

    this.billType = data?.invoicetypename || '';
  }
  getBillDetails() {
    this.apiService.dataGet(`checker/getInvoiceBillDetails?cjpcid=${this.CJPCID}`).subscribe(
      (response: any) => {
        // console.log('Response :', response);
        this.billingDetails = response?.data;
        this.setDynamicValues(this.billingDetails)
      },
      error => {
        console.log('Error :', error);
      });
  }

}
