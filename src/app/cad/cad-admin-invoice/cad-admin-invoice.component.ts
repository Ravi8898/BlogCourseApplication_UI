import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-cad-admin-invoice',
  templateUrl: './cad-admin-invoice.component.html',
  styleUrls: ['./cad-admin-invoice.component.scss']
})
export class CadAdminInvoiceComponent {

  data_invoice: any[] = []
  // data_invoice = [
  //   {
  //     "WO No.": "WO12345",
  //     "Bill Type": "Regular",
  //     "RA Bill No.": "RA56789",
  //     "RA Bill Date": "2024-02-01",
  //     "Vendor": "ABC Pvt Ltd",
  //     "Invoice No.": "INV-1001",
  //     "Invoice Date": "2024-02-05",
  //     "Received On": "2024-02-10",
  //     "Period": "Jan 2024",
  //     "SES No.": "SES-789",
  //     "Invoice Rec. In CAD - HD": "2024-02-12",
  //     "Bill Process Date": "2024-02-15",
  //     "No of Days": 5,
  //     "Status": "Accept",
  //     "History": "",
  //     "Action": ""
  //   },
  //   {
  //     "WO No.": "WO67890",
  //     "Bill Type": "Advance",
  //     "RA Bill No.": "RA98765",
  //     "RA Bill Date": "2024-03-02",
  //     "Vendor": "XYZ Ltd",
  //     "Invoice No.": "INV-2002",
  //     "Invoice Date": "2024-03-06",
  //     "Received On": "2024-03-11",
  //     "Period": "Feb 2024",
  //     "SES No.": "SES-456",
  //     "Invoice Rec. In CAD - HD": "2024-03-14",
  //     "Bill Process Date": "2024-03-18",
  //     "No of Days": 7,
  //     "Status": "Send Back",
  //     "History": "",
  //     "Action": ""
  //   },
  //   {
  //     "WO No.": "WO67890",
  //     "Bill Type": "Advance",
  //     "RA Bill No.": "RA98765",
  //     "RA Bill Date": "2024-03-02",
  //     "Vendor": "XYZ Ltd",
  //     "Invoice No.": "INV-2002",
  //     "Invoice Date": "2024-03-06",
  //     "Received On": "2024-03-11",
  //     "Period": "Feb 2024",
  //     "SES No.": "SES-456",
  //     "Invoice Rec. In CAD - HD": "2024-03-14",
  //     "Bill Process Date": "2024-03-18",
  //     "No of Days": 7,
  //     "Status": "Reject",
  //     "History": "",
  //     "Action": ""
  //   }
  // ]

  columns_invoice = [
    { name: 'WO No.', hide_col: false, isFilter: false },
    { name: 'Bill Type', hide_col: false, isFilter: false, col_expand: 'out', },
    { name: 'RA Bill No.', hide_col: false, isFilter: false, groupOf: 'Bill Type' },
    { name: 'RA Bill Date', hide_col: false, isFilter: false, groupOf: 'Bill Type' },
    { name: 'Vendor', hide_col: false, isFilter: false, col_expand: 'in' },
    { name: 'Invoice No.', hide_col: true, isFilter: false, groupOf: 'Vendor' },
    { name: 'Invoice Date', hide_col: true, isFilter: false, groupOf: 'Vendor' },
    { name: 'Received On', hide_col: false, isFilter: false, col_expand: 'in' },
    { name: 'Period', hide_col: true, isFilter: false, groupOf: 'Received On' },
    { name: 'SES No.', hide_col: true, isFilter: true, groupOf: 'Received On' },
    { name: 'Invoice Rec. In CAD - HD', hide_col: true, isFilter: false, groupOf: 'Received On' },
    { name: 'Bill Process Date', hide_col: false, isFilter: false, col_expand: 'in' },
    { name: 'No of Days', hide_col: true, isFilter: false, groupOf: 'Bill Process Date' },
    { name: 'Status', hide_col: false, isFilter: false },
    // { name: 'Hold', hide_col: false, isFilter: false },
    // { name: 'CJPC', hide_col: true, isFilter: false },
    { name: 'Action', hide_col: true, isFilter: false, value: ['forward'], view: 'edit' },
  ]

  isLoader: boolean = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private apiService: ApiService
  ) {
    this.breadcrumbService.setBreadcrumbUrl();

  }
  ngOnInit() {
    this.getInvoiceData()
  }
  handleIconClick(columnName: string, rowData: any) {
    console.log(`Clicked on ${columnName}:`, rowData);
    // alert(`You clicked on "${columnName}" for ${rowData['Status']}`);
    if (columnName === 'Action') {
      console.log('action column')
      this.router.navigate(['CAD/invoice/purchase-order'], { state: { invoiceid: rowData['invoiceid'] } })
    }
    if (columnName === 'CJPC') {
      this.router.navigate(['CAD/cjpc'], { queryParams: { id: 1 }, skipLocationChange: false })
      // this.router.navigate(['CAD/cjpc-list'], { state: { workOrderNumber: rowData['WO No.'] } })
    }
  }
  getInvoiceData() {
    this.isLoader = true
    let data = {
      "adID": this.apiService.getUserName(),
    }
    const url1 = 'contract/getPendingInvoiceList'
    this.apiService.dataPost(url1, data).subscribe(
      (res: any) => {

        this.data_invoice = res.data.filter((item: any) => item.status !== 'Pending')
        this.data_invoice = this.data_invoice.map((key: any) => {
          return {
            'WO No.': key.contractnumber,
            'Bill Type': key.invoicetypename,
            'RA Bill No.': key.invoicenumber,
            'RA Bill Date': moment(key.runningaccbilldt).format('DD-MMM-YYYY'),
            'Vendor': key.vendorname,
            'Invoice No.': key.invoicenumber,
            'Invoice Date': moment(key.invoicedate).format('DD-MMM-YYYY'),
            'Received On': moment(key.invoicereceiveddate).format('DD-MMM-YYYY'),
            'Period': 'From ' + moment(key.invoicefromdate).format('DD-MMM-YYYY') + ' To ' + moment(key.invoicetodate).format('DD-MMM-YYYY'),
            'SES No.': key.sesnumber,
            'Invoice Rec. In CAD - HD': '-',
            'Bill Process Date': moment(key.invoiceprocessdate).format('DD-MMM-YYYY'),
            'No of Days': key?.days ? key?.days : '-',
            'Status': key?.status,
            'History': '',
            'invoiceid': key.billinvoiceid
          }
        })
        this.isLoader = false;
      },
      error => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    )
  }

}
