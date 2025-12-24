import { Component, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { FileUploadComponent } from 'src/app/common/file-upload/file-upload.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-cad-vendor-home',
  templateUrl: './cad-vendor-home.component.html',
  styleUrls: ['./cad-vendor-home.component.scss']
})
export class CadVendorHomeComponent {
  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent;

  columns_cjpc: any[] = []
  columns_release: any[] = []
  data_cjpc: any[] = []
  invoiceList: any[] = []
  retentionList: any[] = []
  isAddHistoryModelOpen: boolean = false;
  isAddDocumentModelOpen: boolean = false;
  isLoader!: boolean;
  base64String: string | null | undefined;
  userdata: any
  InvoiceID: any;
  isCreditNoteModelOpen: boolean = false;
  columns_creditnote: any[] = [
    { header: 'Recovery Date', field: 'createddate', date: true },
    { header: 'Recovery Name', field: 'recoverytypename' },
    { header: 'Recovery Amount', field: 'recoveryamount' },
    { header: 'Document Link', field: '' },
    { header: 'Status', field: 'status' },
    { header: 'Version', field: 'documentversion' },
  ];
  recoveryOptions: any[] = [];
  selectedRecoveryOption: string | null = null;
  recoveryAmount: number | null = null;
  creditNoteList: any[] = [];
  selectedFiles: File[] = [];
  errorMessage: string = '';
  recoveryId: any;
  activeTab: string = 'tab1';
  retentionReleaseModal: boolean = false;
  retentionId: number = 0;

  constructor(
    private commonService: CommonService,
    private apiService: ApiService,
    private breadcrumbService: BreadcrumbService,
  ) {
    // this.userdata = this.apiService.userdata
    this.userdata = JSON.parse(localStorage.getItem('userdata') || '{}');
    this.breadcrumbService.setBreadcrumbUrl();
  }

  closeHistoryModal() {
    this.isAddHistoryModelOpen = false;
  }
  openHistoryModal() {
    this.isAddHistoryModelOpen = true;
  }
  openDocumentModal() {
    this.isAddDocumentModelOpen = true;
  }
  closeDocumentModal() {
    this.isAddDocumentModelOpen = false;
  }

  VendorHistory(value: any) {
    console.log('histoy', value);
    this.InvoiceID = value['Invoice ID'];
    this.openHistoryModal();
  }
  VendorDocument(value: any) {
    console.log('histoy', value);
    this.openDocumentModal();
    this.openDocument(value);
  }
  openDocument(value: any) {
    console.log('openDocument', value);
    this.isLoader = true
    let data = {
      "Url": value.filepath
    }
    this.apiService.dataPost('contract/DocumentDownload', data).subscribe(
      (response: any) => {
        this.base64String = response?.data?.Base64String
        this.isLoader = false
        console.log('this.base64String ', this.base64String);
      },
      error => {
        this.apiService.handleError(error)
        this.isLoader = false
      }
    )
  }
  ngOnInit() {
    this.columns_cjpc = [
      { name: 'Invoice ID', hide_col: true, isFilter: false, },
      { name: 'Entry Date', hide_col: false, isFilter: false, },
      { name: 'Invoice Number', hide_col: false, isFilter: false, },
      { name: 'Invoice Date', hide_col: false, isFilter: false },
      { name: 'Invoice Amount', hide_col: false, isFilter: false },
      { name: 'PO Number', hide_col: false, isFilter: false },
      { name: 'Attach Credit Note', hide_col: false, isFilter: false },
      { name: 'Hold / Release', hide_col: false, isFilter: false },
      { name: 'Status', hide_col: false, isFilter: false },
      { name: 'History', hide_col: false, isFilter: false },
      // { name: 'Action', hide_col: false, isFilter: false, value: ['edit', 'delete', 'view'] },
    ];

    this.columns_release = [
      { name: 'Entry Date', hide_col: false, isFilter: false },
      { name: 'Work Order Number', hide_col: false, isFilter: false },
      { name: 'Vendor Code', hide_col: false, isFilter: false },
      { name: 'Vendor Name', hide_col: false, isFilter: false },
      { name: 'Retention For', hide_col: false, isFilter: false },
      { name: 'Retention Amount', hide_col: false, isFilter: false },
      { name: 'Retention Release / SCC', hide_col: false, isFilter: false },
      { name: 'Status', hide_col: false, isFilter: false },
      { name: 'contractreleasedetailsid', hide_col: true, isFilter: false },
    ]

    this.getInvoiceList()
    this.getRetentionReleaseList()

  }


  navigateToPurchase() {
    this.commonService.viewPurchase = false;
    // this.commonService.routeToPurchaseOrder();
    this.commonService.routeToPage('./CAD/vendor/home/invoice');
  }

  getInvoiceList() {
    let data = {
      "vendorcode": this.userdata.ACCOUNTNUMBER,
    }
    this.apiService.dataPost('contract/getInvoiceList', data).subscribe(
      (response: any) => {
        console.log('Response :', response);
        let result = response.data && response.data.map((item: any) => {
          return {
            'Invoice ID': item.billinvoiceid,
            'Entry Date': moment(item.createddate).format('DD-MMM-YYYY'),
            'Invoice Number': item.invoicenumber,
            'Invoice Date': moment(item.invoicedate).format('DD-MMM-YYYY'),
            'Invoice Amount': item.netpayableamount,
            'PO Number': item.contractnumber,
            'Attachment': '',
            'Hold / Release': '',
            'Status': item.status,
            'History': '',
            'Action': '',
            'filepath': item.filepath,
            'holdstatus': item.holdstatus,
            'recoverystatus': item.recoverystatus,
          }
        })
        this.invoiceList = result;
        // console.log('invoice list', this.invoiceList)
      },
      error => {
        console.log('Error :', error);
      });
  }

  getRetentionReleaseList() {
    let data = {
      "vendorCode": this.userdata.ACCOUNTNUMBER,
    }
    this.apiService.dataPost('contract/retentionReleaseList', data).subscribe(
      (response: any) => {
        console.log('Retention Release Response :', response);
        let result = response.data && response.data.map((item: any) => {
          return {
            'Entry Date': moment(item.createddate).format('DD-MMM-YYYY'),
            'Work Order Number': item.contractnumber,
            'Vendor Code': item.vendorcode,
            'Vendor Name': item.vendorname,
            'Retention For': item.retentionreleasefor,
            'Retention Amount': item.totalretentionamount,
            'Status': item.status,
            'contractreleasedetailsid': item.contractreleasedetailsid,

          }
        })
        this.retentionList = result;
      },
      error => {
        console.log('Error :', error);
      });
  }

  viewCreditNote(value: any) {
    console.log('viewCreditNote', value);
    this.InvoiceID = value['Invoice ID'];
    this.isCreditNoteModelOpen = true;
    this.getRecoveryForOptions();
    this.getCreditNoteList();
  }

  closeCreditNoteModal() {
    this.isCreditNoteModelOpen = false;
  }

  getRecoveryForOptions() {
    let data = {
      "invoiceId": this.InvoiceID
    }
    this.apiService.dataPost('checker/getRecoveryByInvoiceId', data).subscribe(
      (response: any) => {
        // console.log('Response :', response);
        this.recoveryOptions = response?.data || []
      },
      error => {
        this.apiService.handleError(error)
      });
  }

  onRecoveryChange(event: any) {
    // console.log('onRecoveryChange', event);
    this.recoveryAmount = event ? event?.recoveryamount : null;
    this.recoveryId = event ? event?.recoveryid : null;
  }

  onFilesUploaded(files: File[]) {
    console.log('Files received in parent component:', files);
    this.selectedFiles = files;
    this.errorMessage = ''
  }


  attachCreditNote() {
    let url = 'checker/addRecoveryCreditNote';
    if (this.selectedFiles.length === 0) {
      this.errorMessage = 'Please select a file to upload.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFiles[0]);
    formData.append('recoveryId', this.recoveryId);
    formData.append('loginuser', this.apiService.getUserName());

    this.isLoader = true;
    this.apiService.postFormData(url, formData).subscribe(
      (response: any) => {
        console.log('File upload response:', response);
        this.errorMessage = '';
        this.getCreditNoteList();
        this.selectedFiles = [];
        // this.isCreditNoteModelOpen = false;
        this.fileUpload.cleanFile();
        this.recoveryId = null;
        this.recoveryAmount = null;
        this.selectedRecoveryOption = null;
        this.isLoader = false;
      },
      (error) => {
        console.error('File upload error:', error);
        this.apiService.handleError(error);
        this.errorMessage = error?.message || 'File upload failed. Please try again.';
        this.isLoader = false;
      }
    );
  }

  getCreditNoteList() {
    let data = {
      "invoiceId": this.InvoiceID
    }
    this.apiService.dataPost('checker/getRecoveryCreditNoteByInvoiceId', data).subscribe(
      (response: any) => {
        // console.log('Response :', response);
        this.creditNoteList = response?.data || []
        // console.log('this.creditNoteList', this.creditNoteList);
      },
      error => {
        this.apiService.handleError(error)
      });
  }

  activateTab(tab: string): void {
    this.activeTab = tab;

    this.getInvoiceList();
    this.getRetentionReleaseList();
  }

  rowClick(row: any): void {
    console.log('Row clicked:', row);
    if (row.columnName == 'Retention Release / SCC') {
      this.retentionReleaseModal = true;
      this.retentionId = row.rowData.contractreleasedetailsid;
    }
  }

  closeRetentionModal(value: any) {
    this.retentionReleaseModal = value;
    this.getRetentionReleaseList();
  }
}
