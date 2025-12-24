import { Component, ViewChild } from '@angular/core';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { FileUploadComponent } from 'src/app/common/file-upload/file-upload.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { PaperlessService } from 'src/app/services/paperless.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vendor-home',
  templateUrl: './vendor-home.component.html',
  styleUrls: ['./vendor-home.component.scss']
})
export class VendorHomeComponent {
  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent;

  invioceList_columns: any[] = []
  columns_release: any[] = []
  data_cjpc: any[] = []
  invoiceList: any[] = [
  ]

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
  // creditNoteList: any[] = [];
  selectedFiles: File[] = [];
  errorMessage: string = '';
  recoveryId: any;
  activeTab: string = 'tab1';
  retentionReleaseModal: boolean = false;
  retentionId: number = 0;
  DocumentDetails: any;
  Documentcolumns = [
    // { header: '#', field: 'blobId' },
    { header: 'Document Upload Date', field: 'createddate', date: true },
    { header: 'Document Name', field: 'filename' },
    { header: 'Document Type', field: 'filetype' },
    { header: 'Action', field: 'action', value: ['eye'] },
  ];
  isDocumentListModelOpen: boolean = false;

  constructor(
    private commonService: CommonService,
    private apiService: PaperlessService,
    private breadcrumbService: BreadcrumbService,
    private router:Router
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
  openDocumentModal(value:any) {
    this.isDocumentListModelOpen = true;
    this.DocumentDetails = value.docDetails.filter((doc:any)=> doc.filetype !='Finalupload');
  }
    onView(value: any) {
  
    this.openDocument(value);
  }
  
  closeDocumentModal() {
    this.isAddDocumentModelOpen = false;
  }
  closeDocumentListModal(){
    this.isDocumentListModelOpen = false;
  }

  ViewInvoice(value: any) {
    this.InvoiceID = value['InvoiceID'];
    this.commonService.viewVendorInvoice = true;
    this.router.navigate(['/paperless-work/vendor-home/invoice'],{state:{'InvoiceID':this.InvoiceID}})
  }
  VendorDocument(value: any) {
    // this.openDocumentModal(value);
    this.DocumentDetails = value.docDetails.filter((doc:any)=> doc.filetype =='Finalupload');
    this.openDocument(this.DocumentDetails[0])
    // this.openDocument(value);
  }
  openDocument(value: any) {
    this.isAddDocumentModelOpen = true;
    this.isLoader = true;
    let data = {
      blobId: value.blobid,
    };
    this.apiService.dataPost('upload/documentDownload', data).subscribe(
      (response: any) => {
        this.base64String = response?.data?.Base64String;
        this.isLoader = false;
        // console.log('this.base64String ', this.base64String);
      },
      (error) => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }
  ngOnInit() {
    this.invioceList_columns = [
      { name: 'Refrence ID', hide_col: true, isFilter: false, },
      { name: 'Entry Date', hide_col: false, isFilter: false, },
      { name: 'Invoice Type', hide_col: false, isFilter: false, },
      { name: 'Invoice Number', hide_col: false, isFilter: true, },
      { name: 'Invoice Date', hide_col: false, isFilter: false },
      { name: 'Invoice Amount', hide_col: false, isFilter: false },
      { name: 'PO Number.', hide_col: false, isFilter: false },
      { name: 'Submission To', hide_col: false, isFilter: false },
      // { name: 'Attach Credit Note', hide_col: false, isFilter: false },
      { name: 'Attachment', hide_col: false, isFilter: false },
      // { name: 'Hold / Release', hide_col: false, isFilter: false },
      // { name: 'Attachment SSC Certificate', hide_col: false, isFilter: false },
      // { name: 'Retention Release', hide_col: false, isFilter: false },
      { name: 'Status', hide_col: false, isFilter: false },
      // { name: 'History', hide_col: false, isFilter: false },
      { name: 'Action', hide_col: false, isFilter: false, value: ['view',] },
    ];
    this.getVendorInvoiceListByVendorCode()

  }


  navigateToPurchase() {
    this.commonService.viewPurchase = false;
    // this.commonService.routeToPurchaseOrder();
    this.commonService.routeToPage('./paperless-work/vendor-home/invoice');
  }

  closeCreditNoteModal() {
    this.isCreditNoteModelOpen = false;
  }

  onFilesUploaded(files: File[]) {
    console.log('Files received in parent component:', files);
    this.selectedFiles = files;
    this.errorMessage = ''
  }

  getVendorInvoiceListByVendorCode() {
    let data = {
    }
    this.apiService.dataPost('upload/getInvoiceListByVendorCode', data).subscribe(
      (response: any) => {
        this.invoiceList = response?.data || []
        this.invoiceList = this.invoiceList && this.invoiceList.map((key: any) => {
                    return {
                      'Refrence ID': '',
                      'Entry Date': moment(key.createdDate).format('DD-MM-YYYY'),
                      'Invoice Type': key.invoiceType,
                      'Invoice Number': key.invoiceNo,
                      'Invoice Amount': key.invcAmount,
                      'PO Number.': key.poNumber,
                      'Invoice Date': moment(key.invoiceDate).format('DD-MM-YYYY'),
                      'Submission To': key.submission,
                      'Attachment': '',
                      'Status': key.status,
                      'InvoiceID':key.poInvoiceId,
                      // 'History': '',
                      // 'Action': '',
                      'docDetails':key.docDetails
                    }
                  })
      },
      error => {
        this.apiService.handleError(error)
      });
  }

  activateTab(tab: string): void {
    this.activeTab = tab;
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
  }
}
