import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { FileUploadComponent } from 'src/app/common/file-upload/file-upload.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { PaperlessService } from 'src/app/services/paperless.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
})
export class AdminHomeComponent {
  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent;

  invioceList_columns: any[] = [];
  columns_release: any[] = [];
  data_cjpc: any[] = [];
  invoiceList: any[] = [];
  retentionList: any[] = [];
  isAddHistoryModelOpen: boolean = false;
  isAddDocumentModelOpen: boolean = false;
  isLoader!: boolean;
  base64String: string | null | undefined;
  userdata: any;
  InvoiceID: any;
  isCreditNoteModelOpen: boolean = false;
  succesResponse:boolean = false;
  errorResponse:boolean = false;
  toastMessage:string = '';
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
    private apiService: PaperlessService,
    private breadcrumbService: BreadcrumbService,
    private router:Router,
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
    this.InvoiceID = value['Invoice ID'];
    this.openHistoryModal();
  }
  VendorDocument(value: any) {
    this.openDocumentModal();
    this.openDocument(value);
  }
  openDocument(value: any) {
    this.isLoader = true;
    let data = {
      Url: value.filepath,
    };
    this.apiService.dataPost('contract/DocumentDownload', data).subscribe(
      (response: any) => {
        this.base64String = response?.data?.Base64String;
        this.isLoader = false;
      },
      (error) => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }
  ngOnInit() {
    this.invioceList_columns = [
      // { name: 'Document NO.', hide_col: false, isFilter: false },
      { name: 'Entry Date', hide_col: false, isFilter: false, },
      { name: 'Invoice Type', hide_col: false, isFilter: true },
      { name: 'Invoice Number', hide_col: false, isFilter: true },
      { name: 'Invoice Date', hide_col: false, isFilter: false },
      { name: 'Invoice Amount', hide_col: false, isFilter: false },
      { name: 'PO Number', hide_col: false, isFilter: true },
      { name: 'Vendor Code', hide_col: false, isFilter: false },
      { name: 'Vendor Name', hide_col: false, isFilter: false },
      { name: 'Reference No.', hide_col: false, isFilter: true },
      // { name: 'Hold / Release', hide_col: false, isFilter: false },
      // { name: 'Attachment SSC Certificate', hide_col: false, isFilter: false },
      // { name: 'Retention Release', hide_col: false, isFilter: false },
      { name: 'Status', hide_col: false, isFilter: false },
      { name: 'Invoice Action', hide_col: false, isFilter: false },
      // { name: 'Action', hide_col: false, isFilter: false, value: ['view'] },
    ];

    this.getInvoiceListByAdId()
  }
  getInvoiceListByAdId() {
      let data = {
      }
      this.apiService.dataPost('checker/findInvoiceListByAdid', data).subscribe(
        (response: any) => {
          this.invoiceList = response?.data || []
          this.invoiceList = this.invoiceList && this.invoiceList.map((key: any) => {
                      return {
                        // 'Refrence ID': '',
                        'Entry Date': moment(key.createdDate).format('DD-MM-YYYY'),
                        'poInvoiceId':key.poInvoiceId,
                        'Invoice Type': key.invoiceType,
                        'Invoice Number': key.invoiceNo,
                        'Invoice Date': moment(key.invoiceDate).format('DD-MM-YYYY'),
                        'Invoice Amount': key.invcAmount,
                        'PO Number': key.poNumber,
                        'Vendor Code': key.vendorCode,
                        'Vendor Name':key.vendorName,
                        'Attachment': '',
                        'Status': key.status,
                        // 'History': '',
                        'Action': '',
                        'docDetails':key.docDetails,
                        'Reference No.':key.invRefNumber,
                      }
                    })
        },
        error => {
          this.apiService.handleError(error)
        });
    }
  

  navigateToPurchase() {
    this.commonService.viewPurchase = false;
    // this.commonService.routeToPurchaseOrder();
    this.commonService.routeToPage('./paperless-work/home/invoice');
  }

 
  onFilesUploaded(files: File[]) {
    this.selectedFiles = files;
    this.errorMessage = '';
  }

  goToInvoicePage(value: any) {
    this.router.navigate([`/paperless-work/home/invoice`],{state:{invoiceId: value.poInvoiceId}})
  }
}
