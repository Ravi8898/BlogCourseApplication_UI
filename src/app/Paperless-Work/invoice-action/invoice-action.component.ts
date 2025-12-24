import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { PaperlessService } from 'src/app/services/paperless.service';

@Component({
  selector: 'app-invoice-action',
  templateUrl: './invoice-action.component.html',
  styleUrls: ['./invoice-action.component.scss']
})
export class InvoiceActionComponent {
  successPopup: boolean = false;
  popupMessage: string = '';
  invoiceForm!: FormGroup;
  isLoader: boolean = false;
  poInvoiceId: string | null = '';
  hashCode: string = '';
  panels = [
    { title: 'PO Items', isOpen: true },
    { title: 'Documents', isOpen: false },
  ]
  simpleTableDetails = []
  items: any;
  poItemsTableColumns = [
    { header: 'Purchase Order Number', field: 'purchaseOrderItemNo' },
    { header: 'Item Description', field: 'itemDescription' },
    { header: 'Material Number', field: 'materialNumber' },
    { header: 'Plant Code', field: 'plantCode' },
    { header: 'Unit Of Measure', field: 'unitOfMeasure', },
    { header: 'Net Price', field: 'netPrice', },
    // { header: 'Price Per Unit', field: 'pricePerUnit' },
    { header: 'Quantity', field: 'quantity', }
  ];
  poItems: any[] = []
  invoiceData: any;
  docViewModelOpen: boolean = false;
  invoicePDFDocuments: any;
  bash64String: any;
  openDocumentListModal: boolean = false; supportedDocuments: any;
  confirmationModal: boolean = false;
  status: string = '';
  errorMessage: string = '';
  showPopupAlert: boolean = false;
  popupAlertMessage: string = '';
  invoiceStatus: any;
  constructor(private fb: FormBuilder, private apiService: PaperlessService, private router: Router,private breadcrumbService:BreadcrumbService) {
    let state = this.router.getCurrentNavigation()?.extras?.state;
    this.breadcrumbService.setBreadcrumbUrl();
    if (state) {
      this.poInvoiceId = state?.['invoiceId'];
      localStorage.setItem('invoiceId', this.poInvoiceId || '')
    }
    if (localStorage.getItem('invoiceId')) {
      this.poInvoiceId = localStorage.getItem('invoiceId')
    }
  }
  ngOnInit(): void {
    this.invoiceForm = this.fb.group({
      invoiceType: [{ value: '', disabled: true }, Validators.required],
      poNumber: [{ value: '', disabled: true }, Validators.required],
      invoiceNumber: [{ value: '', disabled: true }, Validators.required],
      invoiceDate: [{ value: '', disabled: true }, Validators.required],
      amountAsPerInvoice: [
        { value: '', disabled: true },
        [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]
      ],
      amountPerLineItems: [
        { value: '', disabled: true },
        [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]
      ],
      company: [{ value: '', disabled: true }, Validators.required],
      plantCode: [{ value: '', disabled: true }, Validators.required],
      // department: ['', Validators.required],
      supplierGST: [{ value: '', disabled: true }, Validators.required],
      // receiverGST: ['', Validators.required],
      currency: [{ value: '', disabled: true }, Validators.required],
      // bankDetails: ['', Validators.required],
      // paymentMode: ['', Validators.required],
      adaniContact: [{ value: '', disabled: true }, Validators.required],
      subbmissionTo: [{ value: '', disabled: true }, Validators.required],
      // invoiceSeriesType: ['', Validators.required],
      // lateDelivery: ['', Validators.required],
      // lateDeliveryAmount: ['', Validators.required],
      // retentionApplicable: ['', Validators.required],
      // retentionAmount: ['', Validators.required],
      // uploadInvoicePDF: ['', Validators.required],
      // uploadSuppDocPDF: ['', Validators.required],
      remark: [{ value: '', disabled: true }],
      // reviewerRemakr: ['']
    }, {
    });
    this.getInvoiceByInvoiceId();

  }

  togglePanel(panel: any) {
    this.panels.forEach(p => {
      p.isOpen = (p === panel) ? !p.isOpen : false;
    });
  }

  getInvoiceByInvoiceId() {
    let url = `upload/findInvoiceById`;
    let json = {
      poInvoiceId: this.poInvoiceId
    }
    this.apiService.dataPost(url, json).subscribe((res: any) => {
      this.invoiceData = res.data?.[0];
      this.hashCode = this.invoiceData?.hashcode;
      this.setFormData(this.invoiceData);
      this.poItems = this.invoiceData.poItemDetails;
      this.invoiceStatus = this.invoiceData?.status
      this.invoicePDFDocuments = this.invoiceData?.docDetails.filter((doc: any) => doc.filetype == 'Invoice')
      this.supportedDocuments = this.invoiceData?.docDetails.filter((doc: any) => doc.filetype !== 'Invoice')

    }, (error) => {
      this.apiService.handleError(error);
    }
    )
  }

  setFormData(invoiceData: any) {
    this.invoiceForm.controls['invoiceType']?.setValue(invoiceData?.invoiceType);
    this.invoiceForm.controls['poNumber']?.setValue(invoiceData?.poNumber);
    this.invoiceForm.controls['invoiceNumber']?.setValue(invoiceData?.invoiceNo);
    this.invoiceForm.controls['invoiceDate']?.setValue(moment(invoiceData?.invoiceDate).format('DD-MMM-YYYY'));
    this.invoiceForm.controls['amountAsPerInvoice']?.setValue(invoiceData?.invcAmount);
    this.invoiceForm.controls['amountPerLineItems']?.setValue(invoiceData?.invcAmount);
    this.invoiceForm.controls['company']?.setValue(invoiceData?.company);
    this.invoiceForm.controls['plantCode']?.setValue(invoiceData?.plantCode);
    this.invoiceForm.controls['supplierGST']?.setValue(invoiceData?.supplierGst);
    this.invoiceForm.controls['currency']?.setValue(invoiceData?.currency);
    this.invoiceForm.controls['adaniContact']?.setValue(invoiceData?.adaniContactDetails);
    this.invoiceForm.controls['subbmissionTo']?.setValue(invoiceData?.submissionTo);
    this.invoiceForm.controls['remark']?.setValue(invoiceData?.remark);

  }
  openInvoiceDocumentModal() {

    this.docViewModelOpen = true
    let finalDOC = this.supportedDocuments.filter((doc:any)=> doc.filetype == 'Finalupload')
    this.onViewDocument(finalDOC[0]);

  }
  onViewDocument(value: any) {
    this.docViewModelOpen = true
    this.isLoader = true;
    let data = {
      blobId: value.blobId,
    };
    this.apiService.dataPost('upload/documentDownload', data).subscribe(
      (response: any) => {
        this.bash64String = response?.data?.Base64String;
        this.isLoader = false;
      },
      (error) => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }
  rowAction() {
    this.openDocumentListModal = true
  }
  accept() {
    this.status = 'Accept';
    this.popupAlertMessage = 'Are you sure you want to Accept ?'
    this.showPopupAlert = true
  }
  reject() {
    this.status = 'Reject';
    this.showPopupAlert = true
    this.popupAlertMessage = 'Are you sure you want to Reject ?'
  }
  cancel() {
    this.showPopupAlert = false;
  }
  confirm(confirmStatus: any) {
    let data = {
      poInvoiceId: this.poInvoiceId,
      status: this.status
    };
    if (confirmStatus) {
      this.isLoader = true;
      this.showPopupAlert = false;
      this.apiService.dataPost('checker/acceptNRejectInv', data).subscribe(
        (response: any) => {
          this.successPopup = true;
          this.popupMessage = response.message
          this.isLoader = false;
          this.status = '';
          this.cancel()
          this.invoiceStatus = 'Accept';
        },
        (error) => {
          this.errorMessage = this.apiService.handleError(error);
          this.isLoader = false;
        }
      );
    }
    else {
      this.showPopupAlert = false
    }


  }
}
