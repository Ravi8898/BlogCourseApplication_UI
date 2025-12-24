import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';
import { environment } from 'src/environments/environment';
import { PaperlessService } from 'src/app/services/paperless.service';

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss']
})
export class PurchaseOrderComponent {

  editPurchaseData: any = {};
  purchaseForm: any;
  dynamicFilterForm: any;
  toastMsg: any = '';
  errorToast: any = false;
  successToast: any = false;
  currentDate = moment(new Date).format("YYYY-MM-DD");
  selectedSupportingDocument: any;
  selectedAllAttachment: any = [];
  selectedAllAttachmentSupport: any = [];

  apiitems: any = [];
  filterItems: any = [];
  items: any = [];
  poGrnDetails: any[] = [];
  poSesDetails: any[] = [];
  poGrnItems: any[] = [];
  poSesItems: any[] = [];
  poSesSubItems: any[] = [];
  sesSubList: any = [];
  apisesSubList: any = [];
  selectedSesSubItems: any = [];
  selectedChips: any[] = [];
  logintype: any;
  username: any;
  siteTable: any = [];
  selectedAll = false;
  selectedAllSES = false;
  selectedItemsArr: any = [];
  selectedItemsDataArr: any = [];
  confirmModalMessage = '';
  submissionArr: any = [];
  childGSTArr: any = [];
  userdata: any;
  quantityExceedsArray: any = [];
  wrongInputArray: any = [];
  blankHsnCodeArray: any = [];

  globalHsnCode: any = '';
  enableDownloadMerge = false;
  enableUploadDigital = false;
  uploadedDigitalSigned: any = [];
  totalNetAmount: any = 0;
  totalTax: any = 0;
  totalGrossAmount: any = 0;
  contractNoExist = false;
  showErrorModal :boolean = false;
  errorModalMessage = '';

  pages: number[] = [];
  pagesSes: number[] = [];
  totalPages: number = 0;
  totalPagesSes: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  currentPageSes: number = 1;
  itemsPerPageSes: number = 10;
  totalItems: number = 0;
  visiblePages: number[] = [];
  visiblePagesSes: number[] = [];
  public pagedData: any[] = [];
  public apiPagedData: any[] = [];
  public data: any[] = [];
  poNumber: any;
  childVendorCode: any;
  invoiceNoExist = false;

  sesTotalNetAmount: any = 0;
  sesTotalTax: any = 0;
  sesTotalGrossAmount: any = 0;
  viewPurchase = false;
  poNumberArray: any = [];
  poItemNumberArray: any = [];
  freightAPIGRNList: any = [];
  getmyData: any = {};
  requiredData: boolean = false;
  selectedAllAttachmentCreditNote: any = [];
  originalSubmittedItems: any[] = [];
  originalSubmittedDataItems: any[] = [];
  isFirstSubmission: boolean = true;
  @ViewChild('creditnote') 'creditnote': ElementRef;
  userIPAddress: string = '';

  @ViewChild('invoice') 'invoice': ElementRef;
  @ViewChild('suppportinvoice') 'suppportinvoice': ElementRef;
  @ViewChild('signedAttach') 'signedAttach': ElementRef;
  invoiceNumber: any;
  roleName: string | null;
  bankAccountDetails:any[]=[]
  showPOGRN: boolean = false;
  selectedGRNArr:any[]=[]
  poGRNItems:any[]=[]
  totalGRNAmount: number = 0;
  totalGRNQuantity: number=0;
  isAllGRLSelected: boolean = true;
  constructor(public commonService: CommonService, private brearcumbService: BreadcrumbService, private apiService: PaperlessService,
 private router: Router) {
    this.logintype = localStorage.getItem('logintype');
    this.username = localStorage.getItem('username');
    this.userdata = JSON.parse(localStorage.getItem('userdata') || '');
    this.brearcumbService.setBreadcrumbUrl();
    this.roleName = localStorage.getItem('roleName')
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
    this.viewPurchase = this.commonService.viewPurchase;
  }

ngOnInit(): void {
  this.getmyData = {};
  this.editPurchaseData = {};
  this.loadPurchaseForm();
  this.loadDynamicFilterForm();
  this.resetStoredData();
  this.purchaseForm.reset();

  if (this.commonService.updatePurchase == true || this.commonService.viewPurchase == true) {
    this.getmyData = this.commonService?.editPurchaseData || {};
    this.updateInvoice();
  }
    setTimeout(() => {
      if (this.commonService.viewPurchase == true) {
        this.disabledAllField();
        if (this.editPurchaseData) {
          this.initializeAttachmentsForView();
          if (this.getmyData?.Status === 'sent-back') {
            this.initializeCreditNoteAttachmentsForView();
          }
        }
      }
    }, 2000);
  if (this.commonService.isCorrectionRequired) {
    const correctionData = this.commonService.correctionRequiredData;
    console.log('Correction required edit mode', correctionData);
    this.enableCorrectionRequiredFields();
    this.populateFormWithCorrectionData(correctionData);
  }
  this.getIpAddress();
}

  getIpAddress() {
    let production = environment.production;
    if (production) {
      this.apiService.getPublicIpAddressSecure().then((ip) => {
        this.userIPAddress = ip;
        console.log('ip address', this.userIPAddress);
      });
    } else {
      this.apiService.getPublicIpAddressNonSecure().then((ip) => {
        this.userIPAddress = ip;
        console.log('ip address', this.userIPAddress);
      });
    }
  }

get canDownloadMerged(): boolean {
  const invoiceNumber = this.purchaseForm?.get('invoice_number')?.value;
  const hasInvoiceNumber = !!invoiceNumber && invoiceNumber.trim() !== '';
  const hasAttachment = this.selectedAllAttachment && this.selectedAllAttachment.length > 0;

  return hasInvoiceNumber && hasAttachment;
}

 enableCorrectionRequiredFields() {
    // Disable all form controls first
    Object.keys(this.purchaseForm.controls).forEach(key => {
        this.purchaseForm.get(key)?.disable();
    });

    // Enable only the allowed fields for correction
    const allowedFields = [
        'invoice_number',
        'invoice_amount',
        'invoice_date',
    ];

    allowedFields.forEach(field => {
        if (this.purchaseForm.get(field)) {
            this.purchaseForm.get(field)?.enable();
        }
    });
  }

  populateFormWithCorrectionData(data: any) {
    // Populate your form with the correction data
    // Use your actual form field names and data properties
    this.purchaseForm.patchValue({
        invoiceNumber: data['Invoice Number'] || data['invoiceNumber'],
        invoiceDate: data['Invoice Date'] || data['invoiceDate'],
        invoiceAmountWithoutTax: data['Invoice Amount Without Tax'] || data['invoiceAmount'],
        quantity: data['Quantity'] || data['quantity']
        // Add other fields as needed
    });
  }

private initializeAttachmentsForView(): void {
    // Clear existing attachments
    this.selectedAllAttachment = [];
    this.selectedAllAttachmentSupport = [];
    this.uploadedDigitalSigned = [];

    // Process main invoice attachments
    if (this.editPurchaseData['invoiceAttachment'] && this.editPurchaseData['invoiceAttachment'].length > 0) {
        this.editPurchaseData['invoiceAttachment'].forEach((attachment: any) => {
            if (attachment.attachmentFilePath) {
                this.uploadedDigitalSigned.push({
                    fileName: 'Invoice.pdf',
                    attachmentFilePath: attachment.attachmentFilePath
                });
                this.selectedAllAttachment.push({
                    fileName: 'Invoice.pdf',
                    attachmentFilePath: attachment.attachmentFilePath
                });
            }
        });
    }

    // Process supported documents
    if (this.editPurchaseData['History'] && this.editPurchaseData['History']['supportAttach']) {
        try {
            const supportAttach = JSON.parse(this.editPurchaseData['History']['supportAttach']);
            if (Array.isArray(supportAttach)) {
                supportAttach.forEach((attachment: any) => {
                    if (attachment.fileBase64) {
                        this.selectedAllAttachmentSupport.push({
                            fileName: attachment.fileName || 'Supported_Document.pdf',
                            fileBase64: attachment.fileBase64
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error parsing support attachments:', error);
        }
    }

    // Also check supportattachmentfilepath
    if (this.editPurchaseData['invoiceAttachment'] && this.editPurchaseData['invoiceAttachment'].length > 0) {
        const mainAttachment = this.editPurchaseData['invoiceAttachment'][0];
        if (mainAttachment.supportattachmentfilepath) {
            try {
                const supportAttachments = JSON.parse(mainAttachment.supportattachmentfilepath);
                if (Array.isArray(supportAttachments)) {
                    supportAttachments.forEach((attachment: any) => {
                        if (attachment.fileBase64) {
                            this.selectedAllAttachmentSupport.push({
                                fileName: attachment.fileName || 'Supported_Document.pdf',
                                fileBase64: attachment.fileBase64,
                                attachmentFilePath: attachment.fileBase64
                            });
                        }
                    });
                }
            } catch (error) {
                console.error('Error parsing supportattachmentfilepath:', error);
            }
        }
    }
}

downloadAttachment(attachment: any): void {
    this.commonService.spinner.show();

    // If the attachment already has base64 data
    if (attachment.fileBase64) {
        this.downloadBase64File(attachment.fileBase64, attachment.fileName);
        this.commonService.spinner.hide();
        return;
    }

    // If the attachment has file path
    if (attachment.attachmentFilePath) {
        let filePath = this.commonService.getEncryptPath(attachment.attachmentFilePath);
        let url = `getBase64FromPath?filePath=${filePath}`;

        this.commonService.dataGet(url).subscribe((res: any) => {
            this.commonService.spinner.hide();
            if (res && res['status'] == 'Success' && res['data']) {
                this.downloadBase64File(res['data'], attachment.fileName || 'download.pdf');
            } else {
                this.errorToast = true;
                this.toastMsg = 'Failed to download file';
                setTimeout(() => this.errorToast = false, 3000);
            }
        }, err => {
            this.commonService.spinner.hide();
            this.errorToast = true;
            this.toastMsg = 'Error downloading file';
            setTimeout(() => this.errorToast = false, 3000);
        });
    }
}

private downloadBase64File(base64Data: string, fileName: string): void {
    try {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();

        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading file:', error);
        this.errorToast = true;
        this.toastMsg = 'Error processing file download';
        setTimeout(() => this.errorToast = false, 3000);
    }
}

  disabledAllField() {
    document.querySelectorAll('input').forEach(t => {
        if (!t.classList.contains('download-link')) {
            t.setAttribute('disabled', 'true');
        }
    });
    document.querySelectorAll('select').forEach(t => {
        t.setAttribute('disabled', 'true');
    });
    document.querySelectorAll('textarea').forEach(t => {
        t.setAttribute('disabled', 'true');
    });
  }

  loadDynamicFilterForm() {
    this.dynamicFilterForm = new FormGroup({
      'item_number': new FormControl(''),
    })
  }

  loadPurchaseForm() {
    this.purchaseForm = new FormGroup({
      po_number: new FormControl('', [Validators.required]),
      invoice_number: new FormControl('', [Validators.required, Validators.maxLength(16),
      Validators.pattern(/^[a-zA-Z0-9\-\/]*$/)]),
      invoice_type: new FormControl('', [Validators.required]),
      invoice_date: new FormControl('', [Validators.required]),

      invoice_amount: new FormControl('', [Validators.required]),
      invoice_amount_line: new FormControl('', [Validators.required]),
      company: new FormControl('', [Validators.required, Validators.maxLength(256)]),
      plant_code: new FormControl(''),

      // department: new FormControl('', [Validators.required]),
      department: new FormControl(''),
      supp_gst_no: new FormControl('', [Validators.required]),
      child_gst: new FormControl('', [Validators.required]),
      rece_gst_no: new FormControl(''),
      currency: new FormControl(''),

      payment_mode: new FormControl('', [Validators.required]),
      adani_contact: new FormControl(''),
      // submission_to: new FormControl('', [Validators.required]),

      material_group: new FormControl(''),
      payment_term: new FormControl(''),
      bank_details:new FormControl('',Validators.required),
      attach: new FormControl('', [Validators.required]),
      attach_data: new FormControl('', [Validators.required]),
      attach_credit_note: new FormControl(''),
      credit_note_amount: new FormControl(''),

      remarks: new FormControl('', [Validators.required, Validators.maxLength(256)]),
      items_arr: new FormControl('', [Validators.required]),
    })

    this.purchaseForm['controls']['invoice_amount_line'].disable();
    this.purchaseForm['controls']['company'].disable();
    this.purchaseForm['controls']['plant_code'].disable();
    this.purchaseForm['controls']['supp_gst_no'].disable();
    this.purchaseForm['controls']['rece_gst_no'].disable();
    this.purchaseForm['controls']['currency'].disable();
    this.purchaseForm['controls']['items_arr'].disable();
    this.purchaseForm['controls']['payment_term'].disable();
    setTimeout(() => {
      this.purchaseForm['controls']['invoice_date'].setValue(moment(new Date()).format('YYYY-MM-DD'));
      if (this.router.url.includes('purchase') || this.router.url.includes('material-invoice')) {
        this.purchaseForm['controls']['invoice_type'].setValue('Material');
      } else if (this.router.url.includes('freight-inbound')) {
        this.purchaseForm['controls']['invoice_type'].setValue('Freight-Inbound');
        this.getCondVendorDetail();
      }
    }, 0);
  }

  allowInvoiceChars(event: KeyboardEvent): boolean {
    const allowedChars = /^[a-zA-Z0-9\-\/]$/;
    const key = event.key;
    return allowedChars.test(key);
  }

  resetPurchaseForm() {
    this.commonService.routeToPage('./dashboard/material-invoice');
  }

  updateInvoice() {
    let url = `POInvoiceDetails?createdBy=${this.userdata['ACCOUNTNUMBER']}`;
    // this.commonService.getPurchaseOrderList(this.userdata['ACCOUNTNUMBER']).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      if (res && res['status'] == 'Success' && res['data'].length > 0) {
        this.editPurchaseData = res['data'].find((item: any) => {
          return item['invoiceNumber'] == this.commonService['editPurchaseData']['Invoice Number'];
        })
        if (Object.keys(this.editPurchaseData).length > 0) {
          this.getPODetail(this.editPurchaseData['poNumber'], this.editPurchaseData['invoiceType']);
          
        }
      } else {
      }
    }, err => {
      console.log(err);
    })
  }

  private initializeCreditNoteAttachmentsForView(): void {
    // Clear existing credit note attachments
    this.selectedAllAttachmentCreditNote = [];

    // Check if there are credit note attachments in the response
    // You might need to adjust this based on your actual API response structure
    if (this.editPurchaseData['creditAttach'] || this.getmyData['creditAttach']) {
        const creditAttach = this.editPurchaseData['creditAttach'] || this.getmyData['creditAttach'];

        if (Array.isArray(creditAttach)) {
            creditAttach.forEach((attachment: any) => {
                this.selectedAllAttachmentCreditNote.push({
                    fileName: attachment.fileName || 'Credit_Note.pdf',
                    fileBase64: attachment.fileBase64,
                    attachmentFilePath: attachment.attachmentFilePath
                });
            });
        }
    }

    // Also check if credit note data exists in invoiceAttachment or other fields
    if (this.editPurchaseData['invoiceAttachment'] && this.editPurchaseData['invoiceAttachment'].length > 0) {
        // You might need to parse specific fields for credit notes
        // This depends on your backend response structure
    }
}


async fillPurchaseForm() {
  console.log('fillPurchaseForm');

  this.purchaseForm['controls']['po_number'].setValue(this.editPurchaseData['poNumber']);
  this.purchaseForm['controls']['invoice_number'].setValue(this.editPurchaseData['invoiceNumber']);
  this.purchaseForm['controls']['invoice_type'].setValue(this.editPurchaseData['invoiceType']);
  this.purchaseForm['controls']['invoice_date'].setValue(moment(this.editPurchaseData['invoiceDate']).format("YYYY-MM-DD"));

  this.purchaseForm['controls']['invoice_amount'].setValue(this.editPurchaseData['invoiceAmount']);

  // Enable control, set value, then disable
  this.purchaseForm['controls']['invoice_amount_line'].enable();
  this.purchaseForm['controls']['invoice_amount_line'].setValue(this.editPurchaseData['lineItermsAmount']);
  this.purchaseForm['controls']['invoice_amount_line'].disable();

  this.purchaseForm['controls']['company'].setValue(this.editPurchaseData['companyCode']);
  this.purchaseForm['controls']['plant_code'].setValue(this.editPurchaseData['plantCode']);

  this.purchaseForm['controls']['department'].setValue(this.editPurchaseData['department']);
  this.purchaseForm['controls']['supp_gst_no'].setValue(this.editPurchaseData['supplierGST']);
  this.purchaseForm['controls']['child_gst'].setValue(this.editPurchaseData['supplierChildGST']);
  this.purchaseForm['controls']['rece_gst_no'].setValue(this.editPurchaseData['receiverGST']);
  this.purchaseForm['controls']['currency'].setValue(this.editPurchaseData['currency']);

  this.purchaseForm['controls']['payment_mode'].setValue(this.editPurchaseData['paymentMode']);
  this.purchaseForm['controls']['adani_contact'].setValue(this.editPurchaseData['adaniContactNo']);

  this.purchaseForm['controls']['material_group'].setValue(this.editPurchaseData['materialGroup']);
  this.purchaseForm['controls']['payment_term'].setValue(this.editPurchaseData['paymentTerm']);

  this.purchaseForm['controls']['attach'].setValue(this.editPurchaseData['']);
  this.purchaseForm['controls']['remarks'].setValue(this.editPurchaseData['remarks']);
  this.purchaseForm['controls']['items_arr'].setValue(this.editPurchaseData['poInvoiceItems']);

  if (this.getmyData?.Status === 'sent-back') {
    this.purchaseForm['controls']['credit_note_amount'].setValue(this.editPurchaseData['creditNoteAmount']);
  }

  setTimeout(() => {
    this.refresItemsList();
  }, 0);

  this.purchaseForm['controls']['attach'].clearValidators();
  this.purchaseForm['controls']['attach'].updateValueAndValidity();

  if (this.getmyData?.Status === 'sent-back') {
    this.purchaseForm['controls']['credit_note_amount'].disable();
  }

  if (this.getmyData?.Status === 'correction_required') {
    this.purchaseForm['controls']['invoice_number'].enable();
  } else {
    this.purchaseForm['controls']['invoice_number'].disable();
  }

  this.purchaseForm['controls']['po_number'].disable();
  this.purchaseForm['controls']['company'].disable();
  this.purchaseForm['controls']['attach'].disable();
  this.purchaseForm['controls']['attach_data'].disable();

  this.selectedItemsArr = this.editPurchaseData.poInvoiceItems || [];
  this.uploadedDigitalSigned = this.editPurchaseData.invoiceAttachment || [];

  if (this.commonService.viewPurchase && this.getmyData?.Status === 'sent-back') {
    this.initializeCreditNoteAttachmentsForView();
  }

  // Fetch PO details to get remQty for correction_required status
  if (this.getmyData?.Status === 'correction_required') {
    await this.fetchPODetailsForRemainingQty();
  }

  // Initialize apisesSubList and sesSubList
  this.apisesSubList = [];
  this.sesSubList = [];
  this.selectedSesSubItems = [];

  // Process SES details if they exist in editPurchaseData
  if (this.editPurchaseData.poSubSesDetails && Array.isArray(this.editPurchaseData.poSubSesDetails)) {
    console.log('Processing poSubSesDetails from editPurchaseData:', this.editPurchaseData.poSubSesDetails);

    // Create a map of selected service rates for easy lookup
    const selectedServiceRates = new Map();

    // Process calculate items first to get the rates from selected services
    if (this.editPurchaseData.poCalculateItem && this.editPurchaseData.poCalculateItem.length > 0) {
      this.editPurchaseData.poCalculateItem.forEach((calculateItem: any) => {
        const key = `${calculateItem.extLineNo}_${calculateItem.pckgNo}`;
        selectedServiceRates.set(key, {
          grPrice: calculateItem.grPrice,
          netAmount: calculateItem.netAmount,
          netValue: calculateItem.netValue || calculateItem.netAmount || 0,
          quantity: calculateItem.quantity,
          grossAmount: calculateItem.grossAmount
        });
      });
    }

    // Create a map of remaining quantities from PO details for correction_required status
    const remainingQtyMap = new Map();
    if (this.getmyData?.Status === 'correction_required' && this.poSesSubItems && this.poSesSubItems.length > 0) {
      this.poSesSubItems.forEach((item: any) => {
        const key = `${item.extLineNo}_${item.pckgNo}`;
        if (item.remQty && item.remQty !== '-' && item.remQty !== '') {
          remainingQtyMap.set(key, item.remQty);
        }
      });
    }

    // Process SES details from poSubSesDetails
    this.editPurchaseData.poSubSesDetails.forEach((item: any) => {
      const key = `${item.extLineNo}_${item.pckgNo}`;

      // Get remaining quantity
      let remQtyStr = String(item['remQty'] || '0');

      if (this.getmyData?.Status === 'correction_required' && remainingQtyMap.has(key)) {
        remQtyStr = String(remainingQtyMap.get(key));
      }

      const quantityStr = item['quantity'] || '0';

      // Check if we have a rate from selected services for this item
      let rate = 0;
      let netValue = Number(item['netValue'] || 0);

      if (selectedServiceRates.has(key)) {
        const selectedService = selectedServiceRates.get(key);
        rate = Number(selectedService.grPrice || item['grPrice'] || 0);
        netValue = Number(selectedService.netValue || item['netValue'] || 0);
      } else {
        rate = Number(item['grPrice'] || 0);
        netValue = Number(item['netValue'] || 0);
      }

      // Find matching PO item for additional fields
      let materialNumber = '';
      let plantCode = '';
      let purchaseOrderItemNo = '';

      if (this.selectedItemsArr && this.selectedItemsArr.length > 0) {
        const poItem = this.selectedItemsArr.find((poItem: any) =>
          poItem.packageNo === item.subPackageNo
        );
        if (poItem) {
          materialNumber = poItem.materialNumber || '';
          plantCode = poItem.plantCode || '';
          purchaseOrderItemNo = poItem.purchaseOrderItemNo || '';
        }
      }

      // Get plant code from purchase form if not found
      if (!plantCode && this.purchaseForm.get('plant_code')?.value) {
        const plantCodeValue = this.purchaseForm.get('plant_code')?.value;
        plantCode = plantCodeValue.split('-')[0] || '';
      }

      // Get tax rate from item or default
      let taxRate = item['taxRate'] || 0;
      if (!taxRate && item['taxCodeTariff']) {
        // If taxRate is not in the item, we might need to fetch it
        taxRate = 0.18; // Default fallback
      }

      // Build the item with all required fields
      const sesItem = {
        checked: true,
        extLineNo: item['extLineNo'],
        matlGroup: item['matlGroup'] || '',
        netValue: String(netValue),
        pckgNo: item['pckgNo'],
        remQty: remQtyStr,
        quantity: quantityStr,
        shortText: item['shortText'] || '',
        subPackageNo: item['subPackageNo'] || '',
        taxCode: item['taxCode'] || 'IC',
        taxCodeTariff: item['taxCodeTariff'] || '',
        poNumber: this.editPurchaseData['poNumber'] || this.purchaseForm.value.po_number,
        grPrice: String(rate),
        hsnCode: item['taxCodeTariff'] || item['hsnCode'] || '', // Use taxCodeTariff as hsnCode
        materialNumber: materialNumber,
        plantCode: plantCode,
        purchaseOrderItemNo: purchaseOrderItemNo,
        taxRate: taxRate
      };

      console.log('Built SES item:', sesItem);
      this.apisesSubList.push(sesItem);
    });

    // Process calculate items from poCalculateItem if they exist
    if (this.editPurchaseData.poCalculateItem && this.editPurchaseData.poCalculateItem.length > 0) {
      this.editPurchaseData.poCalculateItem.forEach((calculateItem: any) => {
        // Find corresponding item in apisesSubList
        const sesItem = this.apisesSubList.find((ses: any) =>
          ses.extLineNo === calculateItem.extLineNo &&
          ses.pckgNo === calculateItem.pckgNo
        );

        if (sesItem) {
          const remQty = sesItem.remQty || '0';
          const rate = Number(sesItem.grPrice || calculateItem.grPrice || 0);
          const remainingAmount = Number(remQty) * rate;
          const netAmount = calculateItem.netAmount || 0;
          const quantity = calculateItem.quantity || '0';
          const grossAmount = calculateItem.grossAmount || netAmount;
          const netValue = calculateItem.netValue || calculateItem.netAmount || netAmount;

          this.selectedSesSubItems.push({
            "extLineNo": calculateItem.extLineNo,
            "netValue": String(netValue),
            "grPrice": String(rate),
            "pckgNo": calculateItem.pckgNo,
            "actu_quantity": remQty,
            "remQty": remQty,
            "quantity": String(quantity),
            "subPackageNo": calculateItem.subPackageNo || sesItem.subPackageNo,
            "taxCode": calculateItem.taxCode || sesItem.taxCode,
            "taxCodeTariff": calculateItem.taxCodeTariff || sesItem.taxCodeTariff,
            "poNumber": this.editPurchaseData['poNumber'] || this.purchaseForm.value.po_number,
            "purchaseOrderItemNo": calculateItem.purchaseOrderItemNo || sesItem.purchaseOrderItemNo,
            "taxRate": calculateItem.taxRate || sesItem.taxRate || 0,
            "netAmount": String(netAmount),
            "grossAmount": String(grossAmount),
            "remainingAmount": remainingAmount.toFixed(2),
            "maxNetAmount": remainingAmount,
            "netAmountError": false
          });
        }
      });
    }

    this.sesSubList = [...this.apisesSubList];

    // Calculate totals
    this.sesCalculateTotal();
    this.patchRatesFromSelectedServices();

    if (this.getmyData?.Status === 'correction_required') {
      this.calculateRemainingAmountForItems();
    }
  } else {
    console.warn('No poSubSesDetails found in editPurchaseData');
  }

  console.log('Final apisesSubList:', this.apisesSubList);
  console.log('Final sesSubList:', this.sesSubList);
}

async fetchPODetailsForRemainingQty() {
  try {
    const po_number = this.editPurchaseData['poNumber'];
    const invoice_type = this.editPurchaseData['invoiceType'];

    let url = `getPODetails?poNumber=${po_number}&invoiceType=${invoice_type}`;

    const res: any = await lastValueFrom(this.commonService.dataGet(url));

    if (res && res['data']) {
      // Store poSesSubItems for later use
      if (res['data']['poSesSubItems'] && res['data']['poSesSubItems'].length > 0) {
        this.poSesSubItems = res['data']['poSesSubItems'];
      }

      console.log('Fetched PO details for remQty:', this.poSesSubItems);
    }
  } catch (err) {
    console.log('Error fetching PO details for remaining quantity:', err);
  }
}

// Add this helper method to patch rates from selected services to PO Services List
patchRatesFromSelectedServices() {
  if (!this.selectedSesSubItems || this.selectedSesSubItems.length === 0) {
    return;
  }

  // Create a map of rates from selected services
  const selectedServiceRates = new Map();

  this.selectedSesSubItems.forEach((selectedItem: any) => {
    const key = `${selectedItem.extLineNo}_${selectedItem.pckgNo}`;
    selectedServiceRates.set(key, {
      grPrice: selectedItem.grPrice,
      netAmount: selectedItem.netAmount,
      quantity: selectedItem.quantity
    });
  });

  // Patch the rates in apisesSubList and sesSubList
  this.apisesSubList = this.apisesSubList.map((sesItem: any) => {
    const key = `${sesItem.extLineNo}_${sesItem.pckgNo}`;

    if (selectedServiceRates.has(key)) {
      const selectedService = selectedServiceRates.get(key);
      const rate = selectedService.grPrice;

      // Only update if the rate is valid (not null, empty, hyphen, undefined)
      if (rate && rate !== '-' && rate !== '' && rate !== null && rate !== undefined) {
        return {
          ...sesItem,
          grPrice: rate
        };
      }
    }

    return sesItem;
  });

  this.sesSubList = [...this.apisesSubList];
}

// Add this method to calculate remaining amount for each item
calculateRemainingAmountForItems() {
  if (!this.selectedSesSubItems || this.selectedSesSubItems.length === 0) {
    return;
  }

  this.selectedSesSubItems.forEach((item: any) => {
    const remQty = Number(item['remQty'] || item['actu_quantity'] || 0);
    const rate = Number(item['grPrice'] || 0);

    if (!isNaN(remQty) && !isNaN(rate)) {
      const remainingAmount = remQty * rate;
      item['remainingAmount'] = remainingAmount.toFixed(2);
      item['maxNetAmount'] = remainingAmount;

      // Ensure net amount doesn't exceed remaining amount
      const netAmount = Number(item['netAmount'] || 0);
      if (netAmount > remainingAmount) {
        item['netAmount'] = remainingAmount.toFixed(2);
        item['grossAmount'] = remainingAmount.toFixed(2);
        item['netAmountError'] = true;
        item['netAmountErrorMsg'] = `Cannot exceed: ${remainingAmount.toFixed(2)}`;
      } else {
        item['netAmountError'] = false;
        item['netAmountErrorMsg'] = '';
      }
    } else {
      item['remainingAmount'] = '0.00';
      item['maxNetAmount'] = 0;
    }
  });

  // Recalculate totals
  this.sesCalculateTotal();
}

  invoiceTypeSelect(event?: any, invoicetype?: any) {
    // this.purchaseForm.controls.po_number.setValue('');
    /* if(this.commonService.updatePurchase == false){
      this.selectedAllAttachment = [];
      this.selectedAllAttachmentSupport = [];
      this.uploadedDigitalSigned = [];
      this.suppportinvoice.nativeElement.value = null;
      this.invoice.nativeElement.value = null;
      this.enableUploadDigital = false;
    } */

    let invoice_type = event.target?.value ? event.target.value : invoicetype;
    if (invoice_type == 'Material') {
      this.purchaseForm.controls['department'].setErrors();
      this.purchaseForm.controls['department'].setValidators();
      this.purchaseForm.controls['department'].updateValueAndValidity();
      this.purchaseForm.controls.po_number.setValue(this.editPurchaseData.poNumber);
      this.commonService.viewPurchase = false;
    this.commonService.updatePurchase = false;
      this.commonService.routeToPage('./dashboard/material-invoice');
    } else if (invoice_type == 'Service') {
       this.commonService.viewPurchase = false;
    this.commonService.updatePurchase = false;
      this.commonService.routeToPage('./dashboard/service-invoice');
    } else if (invoice_type == 'SLA') {
      this.commonService.routeToPage('./dashboard/sla-invoice');
    } else if (invoice_type == 'Freight-Inbound') {
      // alert(`🚫 vSPEED Functionality Disabled
      // Due to updates introduced with GST 2.0, the vSPEED feature has been temporarily disabled.
      // We’re working to align with the new compliance standards and will notify you once functionality is restored.
      // Thank you for your understanding.`);
      this.commonService.routeToPage('./dashboard/freight-inbound-invoice');
    } else if (invoice_type == 'Reward') {
      this.commonService.routeToPage('./dashboard/reward-invoice');
 } else if (invoice_type == 'Contracts') {
      this.commonService.routeToPage('./CAD/vendor/home/invoice');

    } else {
      /* this.purchaseForm.controls['submission_to'].enable();
      this.purchaseForm.controls['submission_to'].setValidators([Validators.required]);
      this.purchaseForm.controls['submission_to'].updateValueAndValidity();
      this.purchaseForm.controls['attach_data_supp'].setErrors();
      this.purchaseForm.controls['attach_data_supp'].setValidators();
      this.purchaseForm.controls['attach_data_supp'].updateValueAndValidity(); */
    }
  }

  getCondVendorDetail() {
    let url = 'getCondVendorDetail';
    let json = {
      "vendorCode": this.userdata['ACCOUNTNUMBER'],
      "poNumber": ''
    }
    this.commonService.spinner.show();
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      this.commonService.spinner.hide();
      this.freightAPIGRNList = res;
      this.poNumber = [];
      this.purchaseForm.controls.po_number.setValue('choose');
      setTimeout(() => {
        if (res.length > 0) {
          res.map((item: any) => {
            if (this.poNumberArray.indexOf(item.poNumber) == -1) {
              this.poNumberArray.push(item.poNumber)
            }
          })
        }
      }, 0);
      setTimeout(() => {
        this.poNumberArray = this.poNumberArray.sort()
      }, 0);
    }, err => {
      this.commonService.spinner.hide();
      console.log(err);
    })
  }

  selectChileVendorCode(item: any) {
    let select = this.childGSTArr.find((ele: any) => {
      return ele.gstNumber == item.target.value
    })
    this.childVendorCode = select.vendorCode;
  }

  /* Attachment */
  onImageCapture(evt: any) {
    this.selectedAllAttachment = [];
    var files = evt.target.files;
    var file = files[0];

    // let extension_list = ['png', 'jpeg', 'jpg', 'jfif', 'xlsx', 'xls', 'doc', 'docx', 'txt', 'pdf'];
    let extension_list = ['pdf'];
    let file_name = file['name'];
    let file_extension = file_name.split('.').pop();
    if (!extension_list.includes(file_extension.toLowerCase())) {
      this.purchaseForm.controls['attach'].setValue('');
      this.toastMsg = "file with extension ." + file_extension + " not allowed";
      this.errorToast = true;
      return;
    }

    if (files && file) {
      this.selectedSupportingDocument = file;
      var reader = new FileReader();
      reader.onload = this._onImageCapture.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  _onImageCapture(readerEvt: any, file?: any) {
    var binaryString = readerEvt.target.result;
    let base64 = btoa(binaryString);
    let attach_json = {
      fileName: this.selectedSupportingDocument.name,
      fileBase64: base64
    }

    this.selectedAllAttachment.push(attach_json);
    this.purchaseForm['controls']['attach_data'].setValue(this.selectedAllAttachment);

    /* if(this.purchaseForm.value.invoice_type == 'Material'){
      this.selectedAllAttachment.push(attach_json);
      this.purchaseForm['controls']['attach_data'].setValue(this.selectedAllAttachment);
    }else if(this.purchaseForm.value.invoice_type == 'Service'){
      this.uploadedDigitalSigned = [];
      this.commonService.spinner.show();
      this.errorToast = false;
      this.commonService.uploadSignedAttachment(attach_json).subscribe((res: any) => {
        console.log(res);
        if (res['status'] == 'Success' && res['data'] == true) {

          this.selectedAllAttachment.push(attach_json);
          this.purchaseForm['controls']['attach_data'].setValue(this.selectedAllAttachment);

          this.uploadedDigitalSigned.push(attach_json);
          this.commonService.spinner.hide();
          this.successToast = true;
          this.toastMsg = "PDF File is digitally Signed";
          setTimeout(() => {
            this.successToast = false;
          }, 2000);
        } else if (res['status'] == 'Success' && res['data'] == false) {
          this.commonService.spinner.hide();
          this.errorToast = true;
          this.toastMsg = "PDF File is not digitally Signed";
          setTimeout(() => {
            this.errorToast = false;
          }, 3000);
          this.invoice.nativeElement.value = null;
        }
      }, err => {
        console.log(err);
        this.commonService.spinner.hide();
        this.invoice.nativeElement.value = null;
      })
    } */
    // this.enableDownloadMerge = true;
    // console.log(btoa(binaryString));
  }

 onImageCaptureSupport(evt: any) {
     var files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
        let file = files[i];
        let extension_list = ['pdf', 'xls', 'csv', 'xlsx'];
        let file_name = file['name'];
        let file_extension = file_name.split('.').pop();
        if (!extension_list.includes(file_extension.toLowerCase())) {
            this.purchaseForm.controls['attach'].setValue('');
            this.toastMsg = "file with extension ." + file_extension + " not allowed";
            this.errorToast = true;
            return;
        }

        if (files && file) {
            var reader = new FileReader();
            reader.onload = this._onImageCaptureSupport.bind(this, file);
            reader.readAsBinaryString(file);
        }
    }
  }

  _onImageCaptureSupport(readerEvt: any, file?: any) {
    // var binaryString = readerEvt.target.result;
    var binaryString = file.target.result;
    let base64 = btoa(binaryString);
    let attach_json = {
      // fileName : this.selectedSupportingDocument.name,
      fileName: readerEvt.name,
      fileBase64: base64
    }
    // Check for duplicate file names before adding
    if (!this.selectedAllAttachmentSupport.some((f: any) => f.fileName === attach_json.fileName)) {
        this.selectedAllAttachmentSupport.push(attach_json);
    }
    // Optionally, update the form control value
    this.purchaseForm['controls']['attach_data_supp']?.setValue(this.selectedAllAttachmentSupport);
  }

onImageCaptureCreditNote(evt: any) {
    if (this.commonService.updatePurchase == false) {
        this.selectedAllAttachmentCreditNote = [];
    }
    var files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
        let file = files[i];
        let extension_list = ['pdf', 'xls', 'csv', 'xlsx'];
        let file_name = file['name'];
        let file_extension = file_name.split('.').pop();
        if (!extension_list.includes(file_extension.toLowerCase())) {
            this.purchaseForm.controls['attach_credit_note'].setValue('');
            this.toastMsg = "file with extension ." + file_extension + " not allowed";
            this.errorToast = true;
            return;
        }

        if (files && file) {
            var reader = new FileReader();
            reader.onload = this._onImageCaptureCreditNote.bind(this, file);
            reader.readAsBinaryString(file);
        }
    }
}

_onImageCaptureCreditNote(readerEvt: any, file?: any) {
    var binaryString = file.target.result;
    let base64 = btoa(binaryString);
    let attach_json = {
        fileName: readerEvt.name,
        fileBase64: base64
    }
    this.selectedAllAttachmentCreditNote.push(attach_json);
    this.purchaseForm['controls']['attach_credit_note'].setValue(this.selectedAllAttachmentCreditNote);
}

// Method to delete credit note attachment
deleteAttachmentCreditNote(json: any) {
    this.selectedAllAttachmentCreditNote.map((item: any, index: any) => {
        if (item['fileName'] == json['fileName']) {
            this.selectedAllAttachmentCreditNote.splice(index, 1)
        }
    })
    this.creditnote.nativeElement.value = null;
    this.purchaseForm['controls']['attach_credit_note'].setValue(this.selectedAllAttachmentCreditNote);
}

  downloadMergedAttachment() {
    this.commonService.spinner.show();
    /* let json = {
      'invoice_attach': this.selectedAllAttachment,
      'supp_attach': this.selectedAllAttachmentSupport
    } */
    let json = [...this.selectedAllAttachment, ...this.selectedAllAttachmentSupport]
    let url = `mergePDF`;
    // this.commonService.getMergedAttachment(json).subscribe((res:any)=>{
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      this.commonService.spinner.hide();
      if (res['status'] == 'Success' && res['data'] != '') {
        /* this.uploadedDigitalSigned.push({
          fileName : 'signed.pdf',
          fileBase64 : res['data']
        }) */
        this.enableUploadDigital = true;
        const invoiceNumber = this.purchaseForm?.get('invoice_number')?.value;
        const fileName = invoiceNumber && invoiceNumber.trim() !== ''
          ? `${invoiceNumber}.pdf`
          : 'mergefile.pdf';
        const a = document.createElement('a');
        a.href = `data:application/pdf;base64,${res.data}`;
        a.download = fileName;
        a.click();
      }
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
    })
  }

  uploadMergedSignAttachment(evt: any) {
    var files = evt.target.files;
    var file = files[0];

    let extension_list = ['pdf'];
    let file_name = file['name'];
    let file_extension = file_name.split('.').pop();
    if (!extension_list.includes(file_extension.toLowerCase())) {
      this.purchaseForm.controls['attach'].setValue('');
      this.toastMsg = "file with extension ." + file_extension + " not allowed";
      this.errorToast = true;
      return;
    }

    if (files && file) {
      this.selectedSupportingDocument = file;
      var reader = new FileReader();
      reader.onload = this._uploadMergedSignAttachment.bind(this, file);
      reader.readAsBinaryString(file);
    }
  }

  _uploadMergedSignAttachment(readerEvt: any, file?: any) {
    var binaryString = file.target.result;
    let base64 = btoa(binaryString);
    let attach_json = {
      fileName: readerEvt.name,
      fileBase64: base64
    }
    this.uploadedDigitalSigned = [];
    this.commonService.spinner.show();
    // this.uploadedDigitalSigned.push(attach_json);
    this.errorToast = false;

    let url = `checkDigitalSignature`;
    // this.commonService.uploadSignedAttachment(attach_json).subscribe((res:any)=>{
    this.commonService.dataPost(url, attach_json).subscribe((res: any) => {
      if (res['status'] == 'Success' && res['data'] == true) {
        this.uploadedDigitalSigned.push(attach_json);
        this.commonService.spinner.hide();
        this.successToast = true;
        this.toastMsg = "PDF File is digitally Signed";
        setTimeout(() => {
          this.successToast = false;
        }, 2000);
      } else if (res['status'] == 'Success' && res['data'] == false) {
        this.commonService.spinner.hide();
        this.errorToast = true;
        this.toastMsg = "PDF File is not digitally Signed";
        setTimeout(() => {
          this.errorToast = false;
        }, 3000);
      }
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
    })
  }

  verifyValidSubmit() {

    let message: any = [];
    let type = false;

    if (this.getmyData?.Status === 'sent-back' && this.selectedAllAttachmentCreditNote?.length === 0) {
      message.push('upload credit note document');
    }

    switch (type) {
      case this.purchaseForm['valid']:
        message.push('form is invalid');
        break;
      case this.selectedItemsArr.length == 0:
        message.push('select PO');
        break;
      case this.uploadedDigitalSigned.length == 0:
        message.push('upload digital signed document');
        break;
      case this.submissionArr.length == 0:
        message.push('Please select submission to');
        break;
      case this.quantityExceedsArray.length > 0:
        message.push('quantity exceeds for GRN');
        break;
      case this.wrongInputArray.length > 0:
        message.push('wrong data entered');
        break;
      case this.blankHsnCodeArray.length > 0:
        message.push('HSN is blank');
        break;
      default:
        break
    }
    if (message.length > 0) {
      // this.toastMsg = `Please find the following error ${message.join()}`;
      this.toastMsg = `${message.join(',')}`;
      this.errorToast = true;
      setTimeout(() => {
        this.errorToast = false;
      }, 5000);
      return message;
    }
  }

  getButtonText(): string {
    if (this.getmyData?.Status === 'correction_required') {
        return 'Resubmit';
    } else if (this.getmyData?.Status === 'sent-back') {
        return 'Resubmit';
    } else {
        return 'Submit';
    }
}

handleSubmitData() {
  // If this is the first submission, store the original data
  if (this.isFirstSubmission) {
    this.originalSubmittedItems = JSON.parse(JSON.stringify(this.selectedItemsArr));
    this.originalSubmittedDataItems = JSON.parse(JSON.stringify(this.selectedItemsDataArr));
    this.isFirstSubmission = false;
  }

  // Get the PO items data from the API response
  // This assumes you have access to the PO items data from getPODetails API
  const poItemsData = this.apiitems || []; // This should be populated from getPODetails

  // Apply corrections using the stored original data and patch from PO items
  this.selectedItemsArr = this.originalSubmittedItems.map((item: any) => {
    // Find matching PO item to get the missing fields
    const matchingPoItem = poItemsData.find((poItem: any) =>
      poItem.purchaseOrderItemNo === item.purchaseOrderItemNo
    );

    // For correction_required status, patch missing fields
    if (this.getmyData?.Status === 'correction_required') {
      return {
        ...item,
        // Patch storageLocation from PO item or history
        storageLocation: item.storageLocation === null ?
          (matchingPoItem?.storageLocation ||
           this.getmyData?.History?.poInvoiceItems?.find((hi: any) => hi.purchaseOrderItemNo === item.purchaseOrderItemNo)?.storageLocation ||
           this.getmyData?.History?.poInvoiceItems?.[0]?.storageLocation ||
           null) :
          item.storageLocation,

        // Patch materialGroup from PO item or history
        materialGroup: item.materialGroup === null ?
          (matchingPoItem?.materialGroup ||
           this.getmyData?.History?.poInvoiceItems?.find((hi: any) => hi.purchaseOrderItemNo === item.purchaseOrderItemNo)?.materialGroup ||
           this.getmyData?.History?.poInvoiceItems?.[0]?.materialGroup ||
           null) :
          item.materialGroup,

        // Patch preqNo from PO item or history
        preqNo: item.preqNo === null ?
          (matchingPoItem?.preqNo ||
           this.getmyData?.History?.poInvoiceItems?.find((hi: any) => hi.purchaseOrderItemNo === item.purchaseOrderItemNo)?.preqNo ||
           this.getmyData?.History?.poInvoiceItems?.[0]?.preqNo ||
           null) :
          item.preqNo,

        // Patch preqItem from PO item or history
        preqItem: item.preqItem === null ?
          (matchingPoItem?.preqItem ||
           this.getmyData?.History?.poInvoiceItems?.find((hi: any) => hi.purchaseOrderItemNo === item.purchaseOrderItemNo)?.preqItem ||
           this.getmyData?.History?.poInvoiceItems?.[0]?.preqItem ||
           null) :
          item.preqItem,

        // Patch taxRate from PO item or history
        taxRate: item.taxRate === null ?
          (matchingPoItem?.taxRate ||
           this.getmyData?.History?.poInvoiceItems?.find((hi: any) => hi.purchaseOrderItemNo === item.purchaseOrderItemNo)?.taxRate ||
           this.getmyData?.History?.poInvoiceItems?.[0]?.taxRate ||
           null) :
          item.taxRate
      };
    }
    return item;
  });

  // Also update selectedItemsDataArr if needed
  this.selectedItemsDataArr = this.originalSubmittedDataItems.map((item: any) => {
    if (this.getmyData?.Status === 'correction_required' && item.materialNumber === null) {
      const matchingPoItem = poItemsData.find((poItem: any) =>
        poItem.purchaseOrderItemNo === item.purchaseOrderItemNo
      );

      return {
        ...item,
        materialNumber: matchingPoItem?.materialNumber ||
                       this.getmyData?.History?.poCalculateItem?.find((hci: any) => hci.purchaseOrderItemNo === item.purchaseOrderItemNo)?.materialNumber ||
                       this.getmyData?.History?.poCalculateItem?.[0]?.materialNumber ||
                       null
      };
    }
    return item;
  });
}


  /* Invoice Submit */
submitPurchaseForm(event?: any) {
  console.log('submitPurchaseForm - Starting submission');
  console.log('Current status:', this.getmyData?.Status);

  if (this.getmyData?.Status !== 'correction_required') {
    this.originalSubmittedItems = [];
    this.originalSubmittedDataItems = [];
    this.isFirstSubmission = true;
  }

  if(this.getmyData?.Status === 'sent-back' && this.purchaseForm?.value?.attach_credit_note == null){
      this.errorToast = true;
      this.toastMsg = 'Please upload credit note document';
      setTimeout(() => {
        this.errorToast = false;
      }, 3000);
      return;
  }

  if(this.getmyData?.Status === 'correction_required'){
    console.log('Handling correction_required data');
    this.handleSubmitData();
  }

  // Build the poSubSesDetails array with all necessary fields
  let poSubSesDetailsArray = [];

  // Log current state before building array
  console.log('Building poSubSesDetailsArray...');
  console.log('apisesSubList:', this.apisesSubList);
  console.log('sesSubList:', this.sesSubList);
  console.log('selectedSesSubItems:', this.selectedSesSubItems);

  // Always process from apisesSubList for consistency
  if (this.apisesSubList && this.apisesSubList.length > 0) {
    console.log('Processing apisesSubList with', this.apisesSubList.length, 'items');

    poSubSesDetailsArray = this.apisesSubList
      .filter((item: any) => item.checked === true)
      .map((item: any, index: number) => {
        // Find matching item in selectedSesSubItems for calculated values
        const matchingSelectedItem = this.selectedSesSubItems.find((selected: any) =>
          selected.extLineNo === item.extLineNo && selected.pckgNo === item.pckgNo
        );

        // Get values from selected item or fallback to original item
        const netValue = matchingSelectedItem ?
                        matchingSelectedItem.netAmount || matchingSelectedItem.netValue || item.netValue :
                        item.netValue || '0';

        const taxRate = matchingSelectedItem ?
                       matchingSelectedItem.taxRate || item.taxRate :
                       item.taxRate || 0;

        const quantity = matchingSelectedItem ?
                        matchingSelectedItem.quantity || item.quantity :
                        item.quantity || '0';

        const grPrice = matchingSelectedItem ?
                       matchingSelectedItem.grPrice || item.grPrice :
                       item.grPrice || '0';

        const remQty = matchingSelectedItem ?
                      matchingSelectedItem.remQty || matchingSelectedItem.actu_quantity || item.remQty :
                      item.remQty || '0';

        // Ensure all required fields are present
        const processedItem = {
          checked: true, // Always true for submitted items
          extLineNo: item.extLineNo || '',
          matlGroup: item.matlGroup || '',
          netValue: String(netValue),
          pckgNo: item.pckgNo || '',
          remQty: String(remQty),
          quantity: String(quantity),
          shortText: item.shortText || '',
          subPackageNo: item.subPackageNo || '',
          taxCode: item.taxCode || 'IC',
          taxCodeTariff: item.taxCodeTariff || '',
          grPrice: String(grPrice),
          hsnCode: item.taxCodeTariff || item.hsnCode || '', // Use taxCodeTariff as hsnCode
          poNumber: this.purchaseForm['controls']['po_number']?.value || this.editPurchaseData['poNumber'] || '',
          materialNumber: item.materialNumber || '',
          plantCode: item.plantCode || '',
          purchaseOrderItemNo: item.purchaseOrderItemNo || '',
          taxRate: Number(taxRate)
        };

        console.log(`Processed item ${index + 1}:`, processedItem);
        return processedItem;
      });

    console.log('Built poSubSesDetailsArray with', poSubSesDetailsArray.length, 'items');
  } else {
    console.warn('apisesSubList is empty or undefined');
  }

  // If poSubSesDetailsArray is still empty, try to build from sesSubList as fallback
  if (poSubSesDetailsArray.length === 0 && this.sesSubList && this.sesSubList.length > 0) {
    console.log('Falling back to sesSubList');
    poSubSesDetailsArray = this.sesSubList
      .filter((item: any) => item.checked == true)
      .map((item: any) => {
        return {
          ...item,
          hsnCode: item.taxCodeTariff || item.hsnCode || '',
          poNumber: this.purchaseForm['controls']['po_number']?.value || '',
          materialNumber: item.materialNumber || '',
          plantCode: item.plantCode || '',
          purchaseOrderItemNo: item.purchaseOrderItemNo || '',
          taxRate: item.taxRate || 0
        };
      });
  }

  console.log('Final poSubSesDetailsArray to be submitted:', poSubSesDetailsArray);

  // Build the main JSON payload
  let json: any = {
    poNumber: this.purchaseForm['controls']['po_number'].value,
    invoiceNumber: this.purchaseForm['controls']['invoice_number'].value,
    invoiceType: this.purchaseForm['controls']['invoice_type'].value,
    invoiceDate: moment(new Date(this.purchaseForm['controls']['invoice_date'].value)).format('YYYY-MM-DD HH:mm:ss'),
    vendorIp: this.userIPAddress || '',
    invoiceAmount: this.purchaseForm['controls']['invoice_amount'].value,
    lineItermsAmount: this.purchaseForm['controls']['invoice_amount_line'].value,
    totalInvoiceAmount: this.purchaseForm['controls']['invoice_amount_line'].value,
    companyCode: this.purchaseForm['controls']['company'].value,
    plantCode: this.purchaseForm['controls']['plant_code'].value ? this.purchaseForm['controls']['plant_code'].value : null,

    department: this.purchaseForm['controls']['department'].value ? this.purchaseForm['controls']['department'].value : null,
    supplierGST: this.purchaseForm['controls']['supp_gst_no'].value ? this.purchaseForm['controls']['supp_gst_no'].value : null,
    supplierChildGST: this.purchaseForm['controls']['child_gst'].value ? this.purchaseForm['controls']['child_gst'].value : null,
    childVendorCode: this.childVendorCode ? this.childVendorCode : null,
    receiverGST: this.purchaseForm['controls']['rece_gst_no'].value ? this.purchaseForm['controls']['rece_gst_no'].value : null,
    currency: this.purchaseForm['controls']['currency'].value ? this.purchaseForm['controls']['currency'].value : null,

    paymentMode: this.purchaseForm['controls']['payment_mode'].value ? this.purchaseForm['controls']['payment_mode'].value : null,
    adaniContactNo: this.purchaseForm['controls']['adani_contact'].value ? this.purchaseForm['controls']['adani_contact'].value : null,
    submissionTo: null,

    materialGroup: this.purchaseForm['controls']['material_group'].value,
    paymentTerm: this.purchaseForm['controls']['payment_term'].value,
    uploadedByBusinessUser: this.roleName == 'BusinessUser' ? 1 : 0,
    attach: this.uploadedDigitalSigned,
    remarks: this.purchaseForm['controls']['remarks'].value ? this.purchaseForm['controls']['remarks'].value : null,
    poInvoiceItems: this.selectedItemsArr,
    poCalculateItem: this.selectedItemsDataArr,
    poSubSesDetails: poSubSesDetailsArray // Use the properly built array
  };

  // Add bank details if available
  if (this.purchaseForm['controls']['bank_details'].value) {
    let bankDetails = this.purchaseForm['controls']['bank_details'].value;
    if (bankDetails) {
      json.ifsc = bankDetails?.IFSC_Code;
      json.bankAccount = bankDetails?.Bank_Account;
    }
  }

  // Set resubmission flag
  if (this.getmyData?.Status === 'correction_required') {
    json.resubmission = true;
    console.log('Setting resubmission to true for correction_required');
  } else {
    json.resubmission = false;
  }

  // Handle credit note details
  if (this.getmyData?.Status === 'sent-back') {
    json.creditAttach = this.selectedAllAttachmentCreditNote;
    json.creditNoteAmount = this.purchaseForm['controls']['credit_note_amount'].value;
  } else {
    json.creditAttach = [];
    json.creditNoteAmount = null;
  }

  if (this.getmyData?.Status === 'sent-back' && this.selectedAllAttachmentCreditNote?.length > 0) {
    json.hasCreditNote = true;
  } else {
    json.hasCreditNote = false;
  }

  // Handle update vs new submission
  if (this.commonService.updatePurchase == true) {
    if (this.purchaseForm.controls['attach_data'].value) {
      json.attach = this.purchaseForm['controls']['attach_data'].value;
      json.supportAttach = [];
    } else {
      json.attach = [];
      json.supportAttach = [];
    }

    json.creditAttach = this.selectedAllAttachmentCreditNote ? this.selectedAllAttachmentCreditNote : [];
    json.resubmission = this.getmyData?.Status === 'correction_required' ? true : false;
    json.creditNoteAmount = this.purchaseForm['controls']['credit_note_amount'].value ? this.purchaseForm['controls']['credit_note_amount'].value : null;

    if (this.getmyData?.Status === 'sent-back' && this.selectedAllAttachmentCreditNote?.length > 0) {
      json.hasCreditNote = true;
    } else {
      json.hasCreditNote = false;
    }

    if (this.getmyData?.Status === 'sent-back') {
      json.status = 'resubmitted';
    } else {
      json.status = 'pending';
    }

    json.sapStatus = this.editPurchaseData.sapStatus;
    json.pdfTransferredSap = null;
    json.createdBy = this.editPurchaseData.createdBy;
    json.createdDate = moment(this.editPurchaseData.createdDate).format('YYYY-MM-DD HH:mm:ss');
    json.updatedBy = this.username;
    json.updatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    json.poInvoiceID = this.editPurchaseData.poInvoiceID;
    json.reviewerRemarks = this.editPurchaseData['reviewerRemarks'];
  } else {
    json.attach = this.uploadedDigitalSigned;
    json.supportAttach = [];
    json.creditAttach = this.selectedAllAttachmentCreditNote ? this.selectedAllAttachmentCreditNote : [];
    json.creditNoteAmount = this.purchaseForm['controls']['credit_note_amount'].value ? this.purchaseForm['controls']['credit_note_amount'].value : null;

    if (this.getmyData?.Status === 'sent-back' && this.selectedAllAttachmentCreditNote?.length > 0) {
      json.hasCreditNote = true;
    } else {
      json.hasCreditNote = false;
    }

    if (this.getmyData?.Status === 'sent-back') {
      json.status = 'resubmitted';
    } else {
      json.status = 'pending';
    }

      json.sapStatus = 0;
      json.pdfTransferredSap = null;
      json.createdBy = this.userdata['ACCOUNTNUMBER'];
      json.createdDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      json.updatedBy = this.username;
      json.updatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
    if(this.poGRNItems.length > 0){
      json.poGRNItems= this.selectedGRNArr
    }


  let url = `PostPOInvoice`;
  this.commonService.spinner.show();

  this.commonService.dataPost(url, json).subscribe((res: any) => {
    console.log('API Response:', res);
    this.commonService.spinner.hide();
    if (res && res['status'] == 'Success') {
      this.successToast = true;
      this.toastMsg = res['message'];
      this.checkInvoiceStatusAfterSubmission();
      setTimeout(() => {
        this.successToast = false;
      }, 2000);
    } else {
      this.errorToast = true;
      this.toastMsg = res['message'];
    }
  }, err => {
    console.log('API Error:', err);
    this.commonService.spinner.hide();
    this.errorToast = true;
    this.toastMsg = err['error']?.['message'] || 'Submission failed';
    setTimeout(() => {
      this.errorToast = false;
    }, 2000);
  });
}

  resetStoredData() {
  this.originalSubmittedItems = [];
  this.originalSubmittedDataItems = [];
  this.isFirstSubmission = true;
}

  checkInvoiceStatusAfterSubmission() {
    const url = `POInvoiceDetails?createdBy=${this.userdata['ACCOUNTNUMBER']}`;
    this.commonService.dataGet(url).subscribe((res: any) => {
        if (res && res['status'] == 'Success' && res['data'] && res['data'].length > 0) {
            const firstRecord = res['data'][0];
                  this.invoiceNumber = firstRecord.invoiceNumber;
            if (firstRecord.status === 'correction_required') {
                this.showErrorModal = true;
                this.errorModalMessage = firstRecord.reviewerRemarks || 'Correction required for the submitted invoice';
            } else {
                this.commonService.routeToPage('./dashboard');
            }
        } else {
            this.commonService.routeToPage('./dashboard');
        }

        setTimeout(() => {
            this.successToast = false;
        }, 2000);

    }, err => {
        this.commonService.routeToPage('./dashboard');
        setTimeout(() => {
            this.successToast = false;
        }, 2000);
    });
}

  // Method to handle error modal actions
handleErrorModalAction(action: string) {
  this.showErrorModal = false;
  this.errorModalMessage = '';
  this.commonService.routeToPage('./dashboard');
}


  getPODetail(po_number?: any, invoice_type?: any) {
    this.errorToast = false;
    this.selectedItemsArr = [];
    this.selectedItemsDataArr = [];
    this.submissionArr = [];
    this.poNumber = po_number;
    this.commonService.spinner.show();

    let url = `getPODetails?poNumber=${po_number}&invoiceType=${invoice_type}`
    // this.commonService.getPODetail(po_number, invoice_type).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      this.commonService.spinner.hide();
      this.getBankDetail(po_number);
      if (this.purchaseForm.value.invoice_type == 'Freight-Inbound' || (this.viewPurchase == true && this.commonService.editPurchaseData.History.invoiceType == 'Freight-Inbound')) {
        res['data'].conditionalGRN = this.freightAPIGRNList.filter((item: any) => {
          return item.poNumber == this.purchaseForm.value.po_number;
        })
        localStorage.setItem('poResponseJson', JSON.stringify(res['data']));
        localStorage.setItem('poNumber', this.poNumber);
        localStorage.setItem('invoice_type', this.purchaseForm.value.invoice_type);
        // this.commonService.routeToconditionalFormInvoice();
        this.commonService.routeToPage('./dashboard/freight-inbound/invoice');
        return;
      }

      if (res['data']['vendorCode'] != this.userdata['ACCOUNTNUMBER']) {
        this.errorToast = true;
        this.toastMsg = "Invalid PO Number";
        setTimeout(() => {
          this.errorToast = false;
        }, 2000);
        return;
      }

      this.purchaseForm['controls']['company'].setValue(res['data']['companyCode']);
      if (res['data'] && res['data']['poItems'].length > 0) {
        this.items = res['data']['poItems'];
        this.apiitems = this.structureItems(res['data']['poItems']);
        this.filterItems = [...this.apiitems];
        this.items = [...this.apiitems];
        if(res['data']['poItems'].length > 0){
          this.showPOGRN = res['data']['poItems'][0]?.materialGroup.startsWith("01");
        }
        if(this.showPOGRN){
           if (this.commonService.updatePurchase == true || this.commonService.viewPurchase == true) {
             this.getViewConditionalDataGRNDetails(this.editPurchaseData.poInvoiceID)
           }
         
        }
        // this.purchaseForm['controls']['plant_code'].setValue(res['data']['poItems'][0]['plantCode']);
        this.purchaseForm['controls']['material_group'].setValue(res['data']['materialGroup'] ? res['data']['materialGroup'] : '');
        this.purchaseForm['controls']['payment_term'].setValue(res['data']['paymentTerm'] ? res['data']['paymentTerm'] : '');
        // this.purchaseForm['controls']['plant_code'].setValue(res['data']['poItems'][0]['plantCode']+'-Ambujanagar');
        this.purchaseForm['controls']['supp_gst_no'].setValue(this.userdata.GST);
        // this.purchaseForm['controls']['rece_gst_no'].setValue('24AAACG0569P1ZD');
        this.purchaseForm['controls']['currency'].setValue('INR');
        this.purchaseForm['controls']['payment_mode'].setValue('rtgs');
        this.getSubmissionTo(res['data']['poItems'][0]['plantCode'], invoice_type, res['data']['poItems'][0]['preqNo']);
        this.getChildGST()
        this.globalHsnCode = res['data']['poItems'][0]['hsnCode'] ? res['data']['poItems'][0]['hsnCode'] : 995461;
        let supportAttach = this.getmyData && this.getmyData?.Attachment?.[0]?.supportattachmentfilepath ;
        let supportFileName = JSON.parse(supportAttach ? supportAttach : '[]');
        this.selectedAllAttachmentSupport = supportFileName;
      }

      if (res['data'] && res['data']['poGrnItems'].length > 0) {
        this.poGrnDetails = res['data']['poGrnItems'];
      }
      if (res['data'] && res['data']['poSesItems'].length > 0) {
        this.poSesDetails = res['data']['poSesItems'];
      }
      if (res['data'] && res['data']['poSesSubItems'].length > 0) {
        this.poSesSubItems = res['data']['poSesSubItems'];
      }
      // this.purchaseForm['controls']['plant_code'].enable();
      // this.purchaseForm['controls']['submission_to'].enable();
      this.purchaseForm['controls']['items_arr'].enable();
      this.updateItems();

      // this.totalPages = Math.ceil(this.apiitems.length / this.itemsPerPage);
      this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      this.updateVisiblePages();
      this.updatePagedData();
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
      this.purchaseForm['controls']['plant_code'].enable();
      // this.purchaseForm['controls']['submission_to'].enable();
      this.purchaseForm['controls']['items_arr'].enable();
      return;
    })
  }

  validateInvoiceNumber(event: any) {
    this.errorToast = false;
    let value = event.target.value.trim();

    if (value == '') {
      return;
    }
   
    let json = {
      vendorNumber: this.userdata['ACCOUNTNUMBER'],
      invoiceNumber: value,
    }
    let isUpdate = false;
    if(this.getmyData?.Status === 'correction_required'){
      isUpdate = true
    }
    let url = `InvoiceVendorValidation?createdBy=${this.userdata['ACCOUNTNUMBER']}&invoiceNumber=${value}&isUpdate=${isUpdate}`
    // this.commonService.validateInvoiceNumber(json).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      this.invoiceNoExist = false;
      this.purchaseForm['controls']['invoice_number'].setErrors();
      this.purchaseForm['controls']['invoice_number'].clearValidators();
    }, err => {
      console.log(err.error.message);
      this.errorToast = true;
      this.toastMsg = err.error.message;
      this.invoiceNoExist = true;
      this.purchaseForm['controls']['invoice_number'].setErrors({ 'invoice_exist': true });
    })
  }

  getSubmissionTo(plant_code?: any, invoice_type?: any, preqNo?: any) {
    let url = `plantDetails?plantCode=${plant_code}&invoiceType=${invoice_type}&preqNo=${preqNo}`
    // this.commonService.getSubmissionTo(plant_code, invoice_type, preqNo).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      if (res && res['status'] == 'Success' && res['data']) {
        this.purchaseForm['controls']['plant_code'].setValue(res['data']['plantCode'] + '-' + res['data']['plantName']);
        this.purchaseForm['controls']['rece_gst_no'].setValue(res['data']['gstNumber'] ? res['data']['gstNumber'] : '');
        // this.purchaseForm['controls']['submission_to'].enable();
        // this.submissionArr = res['data'];
        if (res['data']['employeeData']) {
          this.submissionArr = res['data']['employeeData'].filter((item: any) => {
            return (item['adminAccess'] == false && (item.roleName == 'SiteController' || item.roleName.includes('SiteController')))
          });
          if (this.submissionArr.length == 1) {
            // this.purchaseForm.controls.submission_to.setValue(this.submissionArr[0]['loginId']);
            // this.purchaseForm.controls.submission_to.disable();
          }
        }
        if (this.commonService.updatePurchase == true) {
          if (this.commonService.editPurchaseData.History.invoiceType == 'Freight-Inbound') {
            // this.commonService.routeToconditionalFormInvoice();
            this.commonService.routeToPage('./dashboard/freight-inbound/invoice');
            return;
          } else {
            this.fillPurchaseForm();
          }
        }
      } else {
        console.log('error');
        this.errorToast = true;
        this.toastMsg = `Store In Charge not updated for the plant - ${plant_code} in system. Kindly connect with Admin team`;
      }
    }, err => {
      console.log(err);
      this.errorToast = true;
      this.toastMsg = `Store In Charge not updated for the plant - ${plant_code} in system. Kindly connect with Admin team`;
    })
  }

  getChildGST() {
    let url = 'getChildVendorCode';
    let json = {
      "vendorCode": this.userdata.ACCOUNTNUMBER
    }
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      if (res && res['status'] == 'Success' && res['data'].length > 0) {
        this.childGSTArr = res['data'];
        this.purchaseForm.controls['child_gst'].setValue(res['data'][0]['gstNumber']);
        this.childVendorCode = (res['data'][0]['vendorCode']);
      }
      if (this.commonService.updatePurchase == true || this.commonService.viewPurchase == true) {
        if (this.commonService.editPurchaseData.History.invoiceType == 'Freight-Inbound') {
          // this.commonService.routeToconditionalFormInvoice();
          this.commonService.routeToPage(['./dashboard/freight-inbound/invoice']);
          return;
        } else {
          this.fillPurchaseForm();
        }
      }
    }, err => {
      console.log(err);
      this.errorToast = true;
      this.toastMsg = 'No child gst number found';
      setTimeout(() => {
        this.errorToast = false;
      }, 1000);
    })
  }

  refresItemsList() {
    this.items = this.items.map((element: any) => {
      return element;
    })
    let pop = this.items.pop();
    setTimeout(() => {
      this.items.push(pop);
    }, 0)
  }

  siteOrderAction(action: any) {
    if (action == 'reject') {
      this.confirmModalMessage = 'Are You Sure, You Want To Reject ?';
    } else if (action == 'sentback') {
      this.confirmModalMessage = 'Are You Sure, You Want To Sent Back ?';
    } else if (action == 'onhold') {
      this.confirmModalMessage = 'Are You Sure, You Want To OnHold ?';
    }
  }

  checkAll(event: any) {
    this.selectedAll = true;
    // this.selectedItemsArr = [];
    // this.selectedItemsDataArr = [];
    if (event.target.checked) {
      /* this.siteTable.forEach((item:any)=>{
        item['checked'] = true;
      }) */
      this.filterItems.forEach((item: any) => {
        if (item['remainingQuantity'] != "0") {
          item['checked'] = true;
          item['status'] = 'done';
          item['updatedBy'] = this.username;
          item['updatedDate'] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

          let status = this.selectedItemsDataArr.some((element: any) => {
            return element.purchaseOrderItemNo == item.purchaseOrderItemNo
          })
          if (!status) {
            if (this.purchaseForm.value.invoice_type == 'Service') {
              this.addRemoveItemsDataArrSes(event, item);
            } else {
              this.addRemoveItemsDataArr(event, item);
            }
            // this.addRemoveItemsDataArr(event, item);
            // this.selectedItemsArr = [...this.filterItems];
            this.selectedItemsArr.push(item);
          }
          /* this.addRemoveItemsDataArr(event, item);
          // this.selectedItemsArr = [...this.filterItems];
          this.selectedItemsArr.push(item); */
          this.purchaseForm['controls']['items_arr'].clearValidators();
          this.purchaseForm['controls']['items_arr'].updateValueAndValidity();
        }
        /* item['checked']=true;
        item['status']='done';
        item['updatedBy']=this.username;
        item['updatedDate']=moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        this.addRemoveItemsDataArr(event, item); */
      })
      // this.selectedItemsArr = [...this.filterItems];
    } else {
      /* this.siteTable.forEach((item:any)=>{
        item['checked'] = false;
      }) */
      this.filterItems.forEach((item: any) => {
        item['checked'] = false;

        this.addRemoveItemsDataArr(event, item);
        this.selectedItemsArr.map((element: any, i: any) => {
          if (element.purchaseOrderItemNo == item.purchaseOrderItemNo) {
            this.selectedItemsArr.splice(i, 1);
          }
        })

      })
      // this.selectedItemsArr = [];
      // this.selectedItemsDataArr = [];
      this.purchaseForm['controls']['items_arr'].setValidators([Validators.required]);
      this.purchaseForm['controls']['items_arr'].updateValueAndValidity();
      this.apisesSubList = [];
      this.sesSubList = [];
    }
  }

  updateItems() {
    this.items.forEach((item: any) => {
      item.checked = false;
    })
    if (this.editPurchaseData['poInvoiceItems']) {
      this.selectedItemsArr = this.editPurchaseData['poInvoiceItems'];
      this.items.forEach((element: any) => {
        this.selectedItemsArr.map((item: any) => {
          if (element['purchaseOrderItemNo'] == item['purchaseOrderItemNo']) {
            element['checked'] = true;
          }
        })
      });
    }
    if (this.editPurchaseData['poCalculateItem']) {
      this.selectedItemsDataArr = this.editPurchaseData['poCalculateItem'];
      /* this.selectedItemsDataArr.forEach((element:any) => {
        this.items.map((item:any)=>{
          if(element['purchaseOrderItemNo'] == item['purchaseOrderItemNo']){
            element['taxRate'] = item['taxRate']?item['taxRate']:0
          }
        })
      }); */

      this.calculateTotal();
    }
  }

  poSelect(event: any, row: any) {
    if (row['remainingQuantity'] == "0") {
      event.target.checked = false
      this.errorToast = true;
      this.toastMsg = 'PO Item remaining quantity is 0';

      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
      return;
    }
    /* if(row['taxRate'] == "0"){
      event.target.checked = false
      this.errorToast = true;
      this.toastMsg = 'Tax rate is not updated in system due to missing HSN code.  Kindly connect with system admin.';

      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
      return;
    } */

    let checked = event.target.checked;
    if (this.purchaseForm.value.invoice_type == 'Service') {
      this.addRemoveItemsDataArrSes(event, row);
    } else {
      this.addRemoveItemsDataArr(event, row);
    }
    if (checked) {
      /* this.items.map((item:any)=>{
        if(item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']){
          item['checked']=true;
          this.selectedItemsArr.push(item)
        }
      }) */

      this.apiitems.map((item: any) => {
        if (item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']) {
          item['checked'] = true;
          this.selectedItemsArr.push(item)
        }
      })
      if (checked) {
        if (this.showPOGRN) {
          this.poGrnDetails.forEach((ele: any) => {
          let purchaseOrderItemNo = ele['purchaseOrderItemNo'].replace(/^0+/, '')
          if(purchaseOrderItemNo == row.purchaseOrderItemNo ){
            this.poGRNItems.push(ele);
          }}
          )
        }
        this.totalGRNAmount = this.getTotalByKey(this.poGRNItems, "amount");
        this.totalGRNQuantity = this.getTotalByKey(this.poGRNItems,'quantity')
      }
     
      this.purchaseForm['controls']['items_arr'].clearValidators();
      this.purchaseForm['controls']['items_arr'].updateValueAndValidity();
      /* let status = this.items.every((item:any)=>{
        return item['checked'] == true
      }) */
      let status = this.apiitems.every((item: any) => {
        return item['checked'] == true
      })
      if (status) {
        this.selectedAll = true;
      }
    } else {
      this.selectedItemsArr.map((item: any, i: any) => {
        if (item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']) {
          item['checked'] = false;
          this.selectedItemsArr.splice(i, 1);
        }
        if (this.selectedItemsArr.length > 0) {
          this.purchaseForm['controls']['items_arr'].clearValidators();
          this.purchaseForm['controls']['items_arr'].updateValueAndValidity();
        } else {
          this.purchaseForm['controls']['items_arr'].setValidators([Validators.required]);
          this.purchaseForm['controls']['items_arr'].updateValueAndValidity();
        }
      })
      this.poGRNItems = this.poGRNItems.filter(ele => {
        let purchaseOrderItemNo = ele['purchaseOrderItemNo'].replace(/^0+/, '');
        if (purchaseOrderItemNo === row.purchaseOrderItemNo) {
          ele['checked'] = false; 
          return false; // remove this element
        }
        return true; // keep others
      });
      this.totalGRNAmount = this.getTotalByKey(this.poGRNItems, "amount");
      this.totalGRNQuantity = this.getTotalByKey(this.poGRNItems, 'quantity')
      this.selectedAll = false;
    }
    // this.selectedItemsDataArr = [];
  }

  addRemoveItemsDataArr(event: any, row: any) {
    if (event.target.checked) {
      if (row['hsnCode'] == '' && row['taxRate'] == '') {
        this.toastMsg = 'HscCode and TaxRate is missing, please enter hsc code';
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 2000);
      }
      this.selectedItemsDataArr.push({
        purchaseOrderItemNo: row['purchaseOrderItemNo'],
        itemDescription: row['itemDescription'],
        taxCode: row['taxCode'],
        // hsnCode: row['hsnCode']?row['hsnCode']:this.globalHsnCode,
        hsnCode: row['hsnCode'] ? row['hsnCode'] : '',
        // quantity: Number(row['quantity']),
        quantity: Number(row['remainingQuantity']),
        actualquantity: Number(row['remainingQuantity']),
        maxAllowQty: Number(row['maxAllowQty']),
        // netPrice: Number(row['pricePerUnit']),
        // netPrice: Number(row['netPrice']).toFixed(2),
        netPrice: Number(row['netPrice']),
        // netAmount: Number(Number(row['quantity'])*Number(row['netPrice'])).toFixed(2),
        netAmount: Number(Number(row['remainingQuantity']) * Number(row['netPrice'])).toFixed(2),
        // tax: Number(row['quantity'])*Number(row['pricePerUnit'])*(0.05),
        // grossAmount: Number(row['quantity'])*Number(row['pricePerUnit'])+Number(row['quantity'])*Number(row['pricePerUnit'])*(0.05),
        taxRate: Number(row['taxRate']),
        // tax: Number(Number(row['quantity'])*Number(row['netPrice'])*Number(row['taxRate'])).toFixed(2),
        tax: Number(Number(row['remainingQuantity']) * Number(row['netPrice']) * Number(row['taxRate'])).toFixed(2),
        // grossAmount: Number(Number(row['quantity'])*Number(row['netPrice'])+Number(row['quantity'])*Number(row['netPrice'])*Number(row['taxRate'])).toFixed(2),
        //grossAmount: Number(Number(row['remainingQuantity'])*Number(row['netPrice'])+Number(row['remainingQuantity'])*Number(row['netPrice'])*Number(row['taxRate'])).toFixed(2), /* adding tax amount */
        grossAmount: Number(Number(row['remainingQuantity']) * Number(row['netPrice'])).toFixed(2),
        materialNumber: row['materialNumber'],
        plantCode: row['plantCode']
      })
      // if(!row['hsnCode'] && this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']) == -1){
      /* if(!row['hsnCode'] || !row['taxRate'] && this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']) == -1){
        this.blankHsnCodeArray.push(row['purchaseOrderItemNo']);
      } */
      this.getSesItemsForPOItem(row);
    } else {
      this.selectedItemsDataArr.map((item: any, index: any) => {
        if (item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']) {
          this.selectedItemsDataArr.splice(index, 1);
        }
      })
      if (this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']) > -1) {
        this.blankHsnCodeArray.splice(this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']), 1);
      }
      this.removeSesItemsForPOItem(row);
    }
    this.calculateTotal();
    this.compareAmount();
  }

  validateNumber(event: any) {
    /* let value = event.target.value;
    let pattern = new RegExp("/^(?!$)\d{0,10}(?:\.\d{1,2})?$/");
    let status = pattern.test(value);
    if(status == false){
      value = value.split('');
      value.splice(value.indexOf(event.key, 1));
      value = value.join();
    }
    return value; */
  }

  updateTotal(event?: any, field?: any, row?: any) {
    let eve_re = event;
    if (field == 'hsnCode' && event.target.value == '') {
      return;
    } else if (field == 'hsnCode' && event.target.value) {
      let json = {
        "hsnCode": event.target.value,
        "taxType": row['taxCode'] ? row['taxCode'] : "IA",
        "materialNumber": row['materialNumber'],
        "purchaseOrderItemNo": row['purchaseOrderItemNo'],
        "plantcode": row['plantCode'],
        "poNumber": this.poNumber,
        "vendorCode": this.userdata['ACCOUNTNUMBER']
      }
      let url = 'getTaxRate';
      this.commonService.dataPost(url, json).subscribe((res: any) => {
        if (res && res['status'] && res['status'] == 'Success') {
          this.items.forEach((item: any) => {
            if (item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']) {
              item['hsnCode'] = event.target.value;
              item['taxRate'] = res['data'] ? Number(res['data'] / 100) : '';
            }
          })
          this.selectedItemsArr.forEach((item: any) => {
            if (item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']) {
              item['hsnCode'] = event.target.value;
              item['taxRate'] = res['data'] ? Number(res['data'] / 100) : '';
            }
          })
          this.selectedItemsDataArr.forEach((item: any) => {
            if (item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']) {
              item['hsnCode'] = event.target.value;
              item['taxRate'] = res['data'] ? Number(res['data'] / 100) : '';
              item['tax'] = Number(Number(item['quantity']) * Number(item['netPrice']) * Number(item['taxRate'])).toFixed(2);
              // item['grossAmount'] =  Number(Number(item['quantity'])*Number(item['netPrice'])+Number(item['quantity'])*Number(item['netPrice'])*Number(item['taxRate'])).toFixed(2);
              item['grossAmount'] = Number(Number(item['quantity']) * Number(item['netPrice'])).toFixed(2);
            }
          })
          this.calculateTotal();
          this.compareAmount();

          if (this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']) > -1) {
            this.blankHsnCodeArray.splice(this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']), 1);
          }

          eve_re.target.nextSibling.classList.remove("show");
          eve_re.target.nextSibling.classList.add("hide");
        } else {
          eve_re.target.nextSibling.classList.remove("hide");
          eve_re.target.nextSibling.classList.add("show");
          if (this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']) == -1) {
            this.blankHsnCodeArray.push(row['purchaseOrderItemNo']);
          }
        }
      }, err => {
        console.log(err);
        eve_re.target.nextSibling.classList.remove("hide");
        eve_re.target.nextSibling.classList.add("show");
        if (this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']) == -1) {
          this.blankHsnCodeArray.push(row['purchaseOrderItemNo']);
        }
        this.toastMsg = err.error.data ? err.error.data : 'Tax rate not found';
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 2000);
      })
    }

    let value = event.target.value ? (event.target.value != 0 ? event.target.value : 1) : 1;

    let regExp = new RegExp(/^(?!$)\d{0,10}(?:\.\d{1,3})?$/)
    let test = regExp.test(value);
    if (test == false) {
      if (this.wrongInputArray.indexOf(row.purchaseOrderItemNo) == -1) {
        this.wrongInputArray.push(row.purchaseOrderItemNo);
      }
      event.srcElement.parentElement.childNodes[2].style.display = 'block';
      return;
    } else {
      if (this.wrongInputArray.splice(this.wrongInputArray.indexOf(row.purchaseOrderItemNo) > -1)) {
        this.wrongInputArray.splice(this.wrongInputArray.indexOf(row.purchaseOrderItemNo), 1);
        event.srcElement.parentElement.childNodes[2].style.display = 'none';
      }
    }

    let status: any = false;
    this.items.map((item: any) => {
      // if(item.purchaseOrderItemNo == row.purchaseOrderItemNo && row.quantity < value){
      // if(item.purchaseOrderItemNo == row.purchaseOrderItemNo && row.actualquantity < value){
      if (item.purchaseOrderItemNo == row.purchaseOrderItemNo && row.maxAllowQty < value) {
        status = true;
        return;
      }
    })
    if (status == true) {
      if (this.quantityExceedsArray.indexOf(row.purchaseOrderItemNo) == -1) {
        this.quantityExceedsArray.push(row.purchaseOrderItemNo);
      }
      event.srcElement.nextSibling.style.display = 'block';
      return;
    } else {
      this.quantityExceedsArray.splice(this.quantityExceedsArray.indexOf(row.purchaseOrderItemNo), 1);
      event.srcElement.nextSibling.style.display = 'none';
    }

    event.target.value = Number(value);
    this.selectedItemsDataArr.forEach((item: any) => {
      if (item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']) {
        item[field] = value;
        // item['netAmount'] =  Number(item['quantity'])*Number(item['netPrice']);
        item['netAmount'] = Number(Number(item['quantity']) * Number(item['netPrice'])).toFixed(2);
        // item['tax'] =  Number(item['quantity'])*Number(item['netPrice'])*(0.05);
        // item['grossAmount'] =  Number(item['quantity'])*Number(item['netPrice'])+Number(item['quantity'])*Number(item['netPrice'])*(0.05);
        /* item['tax'] =  Number(item['quantity'])*Number(item['netPrice'])*Number(item['taxRate']);
        item['grossAmount'] =  Number(item['quantity'])*Number(item['netPrice'])+Number(item['quantity'])*Number(item['netPrice'])*Number(item['taxRate']); */
        item['tax'] = Number(Number(item['quantity']) * Number(item['netPrice']) * Number(item['taxRate'])).toFixed(2);
        // item['grossAmount'] =  Number(Number(item['quantity'])*Number(item['netPrice'])+Number(item['quantity'])*Number(item['netPrice'])*Number(item['taxRate'])).toFixed(2); /* adding tax amount */
        item['grossAmount'] = Number(Number(item['quantity']) * Number(item['netPrice'])).toFixed(2);
      }
    })
    this.calculateTotal();
    this.compareAmount();
  }

  calculateTotal() {
    this.totalNetAmount = 0;
    this.totalTax = 0;
    this.totalGrossAmount = 0;
    this.selectedItemsDataArr.map((item: any) => {
      /* this.totalNetAmount = this.totalNetAmount + item['netAmount'];
      this.totalTax = this.totalTax + item['tax'];
      this.totalGrossAmount = this.totalGrossAmount + item['grossAmount']; */
      this.totalNetAmount = Number(Number(this.totalNetAmount) + Number(item['netAmount'])).toFixed(2);
      this.totalTax = Number(Number(this.totalTax) + Number(item['tax'])).toFixed(2);
      this.totalGrossAmount = Number(Number(this.totalGrossAmount) + Number(item['grossAmount'])).toFixed(2);
    })
    this.purchaseForm['controls']['invoice_amount_line'].setValue(this.totalGrossAmount);
  }

  compareAmount(event?: any) {
    if (Number(this.purchaseForm['controls']['invoice_amount'].value) && Number(this.purchaseForm['controls']['invoice_amount_line'].value)) {
      if (Number(this.purchaseForm['controls']['invoice_amount'].value) == Number(this.purchaseForm['controls']['invoice_amount_line'].value)) {
        this.purchaseForm['controls']['invoice_amount'].setErrors();
        this.purchaseForm['controls']['invoice_amount'].clearValidators();
      } else {
        this.purchaseForm['controls']['invoice_amount'].setErrors({ 'amount_mismatch': true });
      }
    } else {
      this.purchaseForm['controls']['invoice_amount'].setErrors({ 'amount_mismatch': true });
    }
  }

  siteselect(event: any, row: any) {
    this.siteTable.forEach((item: any) => {
      if (item['item_no'] == row['item_no']) {
        item['checked'] = event.target.checked
      }
    })
    setTimeout(() => {
      this.selectedAll = this.siteTable.every((item: any) => {
        return item['checked']
      })
    }, 0)
  }

  submitPurchaseStatus(event: any) {
  }

  /* Attachment */
  viewAttachment() {
    let filePath = this.editPurchaseData['invoiceAttachment'][0]['attachmentFilePath'];
    filePath = this.commonService.getEncryptPath(filePath);

    let url = `getBase64FromPath?filePath=${filePath}`;
    // this.commonService.viewAttachment(filePath).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      if (res && res['status'] == 'Success' && res['data']) {
        let link = document.createElement('a');
        link.href = `data:application/pdf;base64,${res['data']}`;
        link.download = `download.pdf`;
        link.click();
      } else {
      }
    }, err => {
      console.log(err);
    })
  }

  deleteAttachment(json: any) {
    // delete(this.editPurchaseData['invoiceAttachment']);
    this.purchaseForm['controls']['attach'].enable();
    this.purchaseForm['controls']['attach_data'].enable();
    this.selectedAllAttachment.map((item: any, index: any) => {
      if (item['fileName'] == json['fileName']) {
        this.selectedAllAttachment.splice(index, 1)
      }
    })
    this.invoice.nativeElement.value = null;
    if (this.purchaseForm.value.invoice_type == 'Service') {
      this.uploadedDigitalSigned = [];
    }
    // this.enableDownloadMerge = false;
  }

  deleteAttachmentSupp(json: any) {
    this.selectedAllAttachmentSupport.map((item: any, index: any) => {
      if (item['fileName'] == json['fileName']) {
        this.selectedAllAttachmentSupport.splice(index, 1)
      }
    })
    this.suppportinvoice.nativeElement.value = null;
  }

  deleteDigitalSignedAttachment(json: any) {
    this.uploadedDigitalSigned.map((item: any, index: any) => {
      if (item['fileName'] == json['fileName']) {
        this.uploadedDigitalSigned.splice(index, 1)
      }
    })
    this.signedAttach.nativeElement.value = null;
  }

  performAction(message: any) {
    this.errorToast = false;
    if (message == 'Invalid PO Number') {
      // this.commonService.routeToDashboard();
      this.purchaseForm['controls']['po_number'].setValue('');
      this.resetPurchaseForm();
    } else if (message.includes('Already exist')) {
      this.purchaseForm['controls']['invoice_number'].setValue('');
    }
  }

  structureItems(items: any) {
    items.forEach((item: any) => {
      // item['taxRate'] = Number(item['taxRate']?item['taxRate']/100:0),
      item['taxRate'] = item['taxRate'] ? Number(item['taxRate'] / 100) : '',
        item['netPrice'] = Number(item['netPrice']); /* .toFixed(2); */
      item['quantity'] = Number(item['quantity']); /* .toFixed(2) */
      item['purchaseOrderItemNo'] = item['purchaseOrderItemNo'].replace(/^0+/, '');
      item['materialNumber'] = item['materialNumber'].replace(/^0+/, '');
      if (item['contractNo']) {
        this.contractNoExist = true;
      }
    })
    return items;
  }

  /* --FIlter */
  resetFilter() {
    this.loadDynamicFilterForm();
    this.selectedAll = false;
    /* this.apiitems.forEach((item:any)=>{
      if(item['remainingQuantity'] != "0"){
        item['checked']=false;
      }
    }) */
    this.filterItems = this.apiitems;
    this.items = this.apiitems;
    /* this.selectedItemsDataArr = []
    this.selectedItemsArr = [] */
    this.updatePagination();
  }

  applyFilter() {
    this.selectedAll = false;
    let filtered: any = [];
    let filter_item_number = this.dynamicFilterForm.value.item_number;
    if (filter_item_number == '') {
      this.filterItems = this.apiitems;
      this.items = this.apiitems;
      this.updatePagination();
    } else {
      filter_item_number = filter_item_number.split(',');
      filter_item_number.map((element: any) => {
        this.apiitems.filter((item: any) => {
          if (element == item['purchaseOrderItemNo']) {
            filtered.push(item);
          }
        })
      })
      this.filterItems = filtered;
      this.items = filtered;
      this.updatePagination();
    }
  }
  updatePagination() {
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages();
    this.updatePagedData();
  }
  /* FIlter-- */

  /* --Pagination */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedData();
      this.updateVisiblePages();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedData();
      this.updateVisiblePages();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedData();
      this.updateVisiblePages();
    }
  }

  updatePagedData(): void {
    if (Object.values(this.apiitems[0])[0] != '') {
      // this.apiPagedData = this.data ? this.data.slice(this.startIndex, this.endIndex) : [];
      // this.pagedData = this.data ? this.data.slice(this.startIndex, this.endIndex) : [];
    }
    this.items = this.filterItems ? this.filterItems.slice(this.startIndex, this.endIndex) : [];
  }

  updateVisiblePages() {
    const range = 2; // Number of pages to show before and after the current page
    let start = Math.max(1, this.currentPage - range);
    let end = Math.min(this.totalPages, this.currentPage + range);

    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);
    }
  }

  onPageChange(event: any): void {
    // Update the currentPage in PaginationService when the dropdown changes
    const selectedPage = event.target.value;
    this.currentPage = selectedPage;
    this.updatePagedData();
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return this.currentPage * this.itemsPerPage;
  }

  /* Pagination-- */

  /* poSesSubItems */
  /* ADd SES on check on PO Items */
  getSesItemsForPOItem(row: any) {
    let selectedPckg_ = this.poSesSubItems.find(item => {
      return item['pckgNo'] == row['packageNo']
    })

    let taxSacCode;
    this.poSesSubItems.map(item => {
      if (item['pckgNo'] == selectedPckg_['subPackageNo']) {
        this.apisesSubList.push({
          checked: false,
          extLineNo: item['extLineNo'],
          matlGroup: item['matlGroup'],
          netValue: item['netValue'],
          pckgNo: item['pckgNo'],
          quantity: item['quantity'],
          shortText: item['shortText'],
          subPackageNo: item['subPackageNo'],
          taxCode: item['taxCode'],
          taxCodeTariff: item['taxCodeTariff'],
          poNumber: this.purchaseForm.value.po_number,
          materialNumber: row['materialNumber'],
          plantCode: row['plantCode'],
          purchaseOrderItemNo: row['purchaseOrderItemNo']
        });
        taxSacCode = item['taxCodeTariff'];
      }
    })
    this.sesSubList = [...this.apisesSubList];
    this.selectedAllSES = false;
    return taxSacCode;
  }

  /* Remove SES on uncheck on PO Items */
  removeSesItemsForPOItem(row: any) {
    let selectedPckg_ = this.poSesSubItems.find(item => {
      return item['pckgNo'] == row['packageNo']
    })

    var removeValFrom: any = []
    this.sesSubList.map((item: any, index: any) => {
      if (item['pckgNo'] == selectedPckg_['subPackageNo']) {
        removeValFrom.push(index);
      }
    })
    this.sesSubList = this.sesSubList.filter(function (value: any, index: any) {
      return removeValFrom.indexOf(index) == -1;
    })

    var removeValFromApi: any = []
    this.apisesSubList.map((item: any, index: any) => {
      if (item['pckgNo'] == selectedPckg_['subPackageNo']) {
        removeValFromApi.push(index);
      }
    })
    this.apisesSubList = this.apisesSubList.filter(function (value: any, index: any) {
      return removeValFromApi.indexOf(index) == -1;
    })

    var removeValFromSelected: any = []
    this.selectedSesSubItems.map((item: any, index: any) => {
      if (item['pckgNo'] == selectedPckg_['subPackageNo']) {
        removeValFromSelected.push(index);
      }
    })
    this.selectedSesSubItems = this.selectedSesSubItems.filter(function (value: any, index: any) {
      return removeValFromSelected.indexOf(index) == -1;
    })
  }

  /* Select All SES */
  checkAllSesItems(event: any) {
    if (event.target.checked == true) {
      this.selectedSesSubItems = [];
      this.selectedAllSES = true;
      this.sesSubList.forEach((item: any) => {
        item.checked = true;
      })
      this.apisesSubList.forEach((item: any) => {
        item.checked = true;
        this.selectUnselectSesItem(event, item);
      })
      // this.selectedSesSubItems = [...this.apisesSubList];
    } else {
      this.selectedAllSES = false;
      this.sesSubList.forEach((item: any) => {
        item.checked = false;
      })
      this.apisesSubList.forEach((item: any) => {
        item.checked = false;
      })
      this.selectedSesSubItems = [];
    }
  }

  /* Select Single SES */
  async selectUnselectSesItem(event: any, row: any) {
    if (event.target.checked == true) {
      row.checked = true;
      let apiTaxRate: any = await this.getTaxRateForSes(row['taxCodeTariff'], row);
      if (apiTaxRate?.data) {
        row['taxRate'] = apiTaxRate['data'] / 100;
        row['netAmount'] = Number(Number(row['netValue'])).toFixed(2);
        row['tax'] = Number(Number(row['netValue']) * Number(row['taxRate'])).toFixed(2);
        row['grossAmount'] = Number(Number(row['netValue']) + Number(row['netValue']) * Number(row['taxRate'])).toFixed(2)
      } else {
        row['taxRate'] = 0;
        row['netAmount'] = Number(Number(row['netValue'])).toFixed(2);
        row['tax'] = 0;
        row['grossAmount'] = 0;
      }

      this.selectedSesSubItems.push(row);
      /* let status = this.sesSubList.every((item:any)=>{
        return item['checked'] == true
      }) */
      let status = this.apisesSubList.every((item: any) => {
        return item['checked'] == true
      })
      if (status) {
        this.selectedAllSES = true;
      }
    } else {
      row.checked = false;
      if (this.selectedSesSubItems.length > 0) {
        this.selectedSesSubItems.map((item: any, index: any) => {
          if (item['extLineNo'] == row['extLineNo']) {
            // this.selectedSesSubItems.splice(this.selectedSesSubItems.indexOf(index),1)
            this.selectedSesSubItems.splice(index, 1)
          }
        })
      }
      this.selectedAllSES = false;
    }
    this.sesCalculateTotal();
    this.compareAmount();
  }

  addRemoveItemsDataArrSes(event: any, row: any) {
    if (event.target.checked == false) {
      this.selectedItemsDataArr.map((item: any, index: any) => {
        if (item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']) {
          this.selectedItemsDataArr.splice(index, 1);
        }
      })
      if (this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']) > -1) {
        this.blankHsnCodeArray.splice(this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']), 1);
      }
      this.removeSesItemsForPOItem(row);
    } else if (event.target.checked == true) {
      // let taxSacCode = this.getSesItemsForPOItem(row);
      // let apiTaxRate:any = await this.getTaxRateForSes(taxSacCode, row);
      this.getSesItemsForPOItem(row);

      // row['hsnCode'] = taxSacCode;
      // row['taxRate'] = apiTaxRate['data']/100;

      this.selectedItemsDataArr.push({
        purchaseOrderItemNo: row['purchaseOrderItemNo'],
        itemDescription: row['itemDescription'],
        taxCode: row['taxCode'],
        hsnCode: row['hsnCode'],
        quantity: Number(row['remainingQuantity']),
        actualquantity: Number(row['remainingQuantity']),
        maxAllowQty: Number(row['maxAllowQty']),
        netPrice: Number(row['netPrice']),
        netAmount: Number(Number(row['remainingQuantity']) * Number(row['netPrice'])).toFixed(2),
        taxRate: row['taxRate'],
        tax: Number(Number(row['remainingQuantity']) * Number(row['netPrice']) * Number(row['taxRate'])).toFixed(2),
        grossAmount: Number(Number(row['remainingQuantity']) * Number(row['netPrice']) + Number(row['remainingQuantity']) * Number(row['netPrice']) * Number(row['taxRate'])).toFixed(2),
        materialNumber: row['materialNumber'],
        plantCode: row['plantCode']
      })
      /* if(!row['hsnCode'] || !row['taxRate'] && this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']) == -1){
        this.blankHsnCodeArray.push(row['purchaseOrderItemNo']);
      } */
    }/* else{
      this.selectedItemsDataArr.map((item:any, index:any)=>{
        if(item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']){
          this.selectedItemsDataArr.splice(index,1);
        }
      })
      if(this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo'])>-1){
        this.blankHsnCodeArray.splice(this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']),1);
      }
      this.removeSesItemsForPOItem(row);
    } */
    this.updateSesPagination();
    this.updateVisiblePagesSes();
    this.calculateTotal();
    this.compareAmount();
  }

  getTaxRateForSes(taxSacCode: any, row: any) {
    let json = {
      "hsnCode": taxSacCode,
      "taxType": row['taxCode'] ? row['taxCode'] : "IA",
      "materialNumber": row['materialNumber'],
      "purchaseOrderItemNo": row['purchaseOrderItemNo'],
      "plantcode": row['plantCode'],
      "poNumber": this.poNumber,
      "vendorCode": this.userdata['ACCOUNTNUMBER']
    }
    let url = 'getTaxRate';
    return lastValueFrom(this.commonService.dataPost(url, json)).catch(() => {
    })
  }

  updateSesPagination() {
    this.totalPagesSes = Math.ceil(this.apisesSubList.length / this.itemsPerPage);
    this.pagesSes = Array.from({ length: this.totalPagesSes }, (_, i) => i + 1);
    this.updateVisiblePagesSes();
    this.updatePagedDataSes();
  }

  prevPageSes(): void {
    if (this.currentPageSes > 1) {
      this.currentPageSes--;
      this.updatePagedDataSes();
      this.updateVisiblePagesSes();
    }
  }

  nextPageSes(): void {
    if (this.currentPageSes < this.totalPagesSes) {
      this.currentPageSes++;
      this.updatePagedDataSes();
      this.updateVisiblePagesSes();
    }
  }

  goToPageSes(page: number): void {
    if (page >= 1 && page <= this.totalPagesSes) {
      this.currentPageSes = page;
      this.updatePagedDataSes();
      this.updateVisiblePagesSes();
    }
  }

  updatePagedDataSes(): void {
    this.sesSubList = this.apisesSubList ? this.apisesSubList.slice(this.startIndexSes, this.endIndexSes) : [];
  }

  updateVisiblePagesSes() {
    const range = 2; // Number of pages to show before and after the current page
    let start = Math.max(1, this.currentPageSes - range);
    let end = Math.min(this.totalPagesSes, this.currentPageSes + range);

    this.visiblePagesSes = [];
    for (let i = start; i <= end; i++) {
      this.visiblePagesSes.push(i);
    }
  }

  onPageChangeSes(event: any): void {
    // Update the currentPage in PaginationService when the dropdown changes
    const selectedPage = event.target.value;
    this.currentPageSes = selectedPage;
    this.updatePagedDataSes();
  }

  get startIndexSes(): number {
    return (this.currentPageSes - 1) * this.itemsPerPageSes;
  }

  get endIndexSes(): number {
    return this.currentPageSes * this.itemsPerPageSes;
  }

  sesCalculateTotal() {
    this.sesTotalNetAmount = 0;
    this.sesTotalTax = 0;
    this.sesTotalGrossAmount = 0;
    this.selectedSesSubItems.map((item: any) => {
      this.sesTotalNetAmount = Number(Number(this.sesTotalNetAmount) + Number(item['netAmount'])).toFixed(2);
      this.sesTotalTax = Number(Number(this.sesTotalTax) + Number(item['tax'])).toFixed(2);
      this.sesTotalGrossAmount = Number(Number(this.sesTotalGrossAmount) + Number(item['grossAmount'])).toFixed(2);
    })
    this.purchaseForm['controls']['invoice_amount_line'].setValue(this.sesTotalGrossAmount);
  }

  sesUpdateTotal(event?: any, field?: any, row?: any) {
    let eve_re = event;
    if (field == 'taxCodeTariff' && event.target.value == '') {
      return;
    } else if (field == 'taxCodeTariff' && event.target.value) {
      let json = {
        "hsnCode": event.target.value,
        "taxType": row['taxCode'] ? row['taxCode'] : "IA",
        "materialNumber": row['materialNumber'],
        "purchaseOrderItemNo": row['purchaseOrderItemNo'],
        "plantcode": row['plantCode'],
        "poNumber": this.poNumber,
        "vendorCode": this.userdata['ACCOUNTNUMBER']
      }
      let url = 'getTaxRate';
      this.commonService.dataPost(url, json).subscribe((res: any) => {
        if (res && res['status'] && res['status'] == 'Success') {
          this.selectedSesSubItems.forEach((item: any) => {
            if (item['extLineNo'] == row['extLineNo']) {
              item['hsnCode'] = event.target.value;
              item['taxCodeTariff'] = event.target.value;
              item['taxRate'] = res['data'] ? Number(res['data'] / 100) : '';
              row['tax'] = Number(Number(row['netValue']) * Number(row['taxRate'])).toFixed(2);
              row['grossAmount'] = Number(Number(row['netValue']) + Number(row['netValue']) * Number(row['taxRate'])).toFixed(2);
            }
          })
          this.sesCalculateTotal();
          this.compareAmount();

          if (this.blankHsnCodeArray.indexOf(row['extLineNo']) > -1) {
            this.blankHsnCodeArray.splice(this.blankHsnCodeArray.indexOf(row['extLineNo']), 1);
          }

          eve_re.target.nextSibling.classList.remove("show");
          eve_re.target.nextSibling.classList.add("hide");
        } else {
          eve_re.target.nextSibling.classList.remove("hide");
          eve_re.target.nextSibling.classList.add("show");
          if (this.blankHsnCodeArray.indexOf(row['extLineNo']) == -1) {
            this.blankHsnCodeArray.push(row['extLineNo']);
          }
        }
      }, err => {
        console.log(err);
        eve_re.target.nextSibling.classList.remove("hide");
        eve_re.target.nextSibling.classList.add("show");
        if (this.blankHsnCodeArray.indexOf(row['extLineNo']) == -1) {
          this.blankHsnCodeArray.push(row['extLineNo']);
        }
        this.toastMsg = err.error.data ? err.error.data : 'Tax rate not found';
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 2000);
      })
    } else {
      let value = event.target.value ? (event.target.value != 0 ? event.target.value : 0) : 0;
      /* if(Number(value)>Number(row['netValue'])){
        if(this.quantityExceedsArray.indexOf(row.extLineNo) == -1){
          this.quantityExceedsArray.push(row.extLineNo);
        }
        event.srcElement.nextSibling.style.display = 'block';
        return;
      }else{
        this.quantityExceedsArray.splice(this.quantityExceedsArray.indexOf(row.extLineNo),1);
        event.srcElement.nextSibling.style.display = 'none';
      } */

      let regExp = new RegExp(/^(?!$)\d{0,10}(?:\.\d{1,3})?$/);
      let test = regExp.test(value);
      if (test == false) {
        if (this.wrongInputArray.indexOf(row.extLineNo) == -1) {
          this.wrongInputArray.push(row.extLineNo);
        }
        event.srcElement.parentElement.childNodes[2].style.display = 'block';
        return;
      } else {
        if (this.wrongInputArray.splice(this.wrongInputArray.indexOf(row.extLineNo) > -1)) {
          this.wrongInputArray.splice(this.wrongInputArray.indexOf(row.extLineNo), 1);
          event.srcElement.parentElement.childNodes[2].style.display = 'none';
        }
      }

      value = Number(value);
      this.selectedSesSubItems.forEach((item: any) => {
        if (item['extLineNo'] == row['extLineNo']) {
          item[field] = value;
          item['netAmount'] = Number(Number(value)).toFixed(2);
          item['tax'] = Number(Number(value) * Number(item['taxRate'])).toFixed(2);
          item['grossAmount'] = Number(Number(value) + Number(value) * Number(item['taxRate'])).toFixed(2);
        }
      })
    }
    this.sesCalculateTotal();
    this.compareAmount();
  }

  searchList(event: any) {
    this.selectedAll = false;
    let filtered: any = [];
    let filter_item_number = event.target.value;
    if (filter_item_number == '') {
      this.filterItems = this.apiitems;
      this.items = this.apiitems;
      this.updatePagination();
    } else {
      filter_item_number = filter_item_number.split(',');
      filter_item_number.map((element: any) => {
        this.apiitems.filter((item: any) => {
          // if(element == item['purchaseOrderItemNo']){
          if ((item['materialNumber'] + ' ' + item['itemDescription'] + ' ' + item['purchaseOrderItemNo']).toLocaleLowerCase().includes(element.trim().toLocaleLowerCase())) {
            filtered.push(item);
          }
        })
      })
      this.filterItems = filtered;
      this.items = filtered;
      this.updatePagination();
    }
  }

  ngAfterViewChecked() {
    if (this.commonService.viewPurchase == true) {
      this.disabledAllField();
    }
  }


    getBankDetail(po_number?: any, invoice_type?: any) {
    let url = `getBankDetails?poNumber=${po_number}&vendorCode=${this.userdata['ACCOUNTNUMBER']}`
    // this.commonService.getPODetail(po_number, invoice_type).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      this.bankAccountDetails = res?.Record
      if(this.commonService.viewPurchase && this.roleName == 'BusinessUser'){
        let bankAccount = this.bankAccountDetails.find((ele:any)=> ele.Bank_Account == this.commonService['editPurchaseData']['bankAccount'])
        this.purchaseForm['controls']['bank_details'].setValue(bankAccount);
      }
      else{
        if(this.editPurchaseData && Object.keys(this.editPurchaseData).length > 0){
          let bankAccount = this.bankAccountDetails.find((ele:any)=> ele.Bank_Account == this.editPurchaseData['bankAccount'])
          this.purchaseForm['controls']['bank_details'].setValue(bankAccount);
        }
        else if(this.bankAccountDetails && this.bankAccountDetails.length ==1){
         this.purchaseForm['controls']['bank_details'].setValue(this.bankAccountDetails[0]);
        }
      }
      this.commonService.spinner.hide();

    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
      return;
    })
  }
ngOnDestroy() {
  // Reset all form controls to enabled state
  this.resetAllFormControls();

  this.commonService.updatePurchase = false;
  this.commonService.viewPurchase = false;
  this.commonService.isCorrectionRequired = false;
  this.commonService.correctionRequiredData = null;
  this.purchaseForm.reset();

  // Clear the getmyData to prevent contamination
  this.getmyData = {};
}

// Add this method to both components
resetAllFormControls(): void {
  if (!this.purchaseForm) return;

  // Enable all controls
  Object.keys(this.purchaseForm.controls).forEach(key => {
    const control = this.purchaseForm.get(key);
    if (control) {
      control.enable();
    }
  });
}
  checkAllPOGRN(item:any){
    
  }
  selectPOGRN(event: any, row: any) {

    let checked = event.target.checked;
    if (checked) {
      if (this.showPOGRN) {
        this.poGrnDetails.forEach((ele: any) => {
          let materialDocumentNumber = ele['materialDocumentNumber'].replace(/^0+/, '')
          if (materialDocumentNumber == row.materialDocumentNumber) {
            ele['checked'] = true
            this.selectedGRNArr.push(ele);
          }
        }
        )
      }
    }
    else {
      this.selectedGRNArr = this.selectedGRNArr.filter(ele => {
        let materialDocumentNumber = ele['materialDocumentNumber'].replace(/^0+/, '')
        if (materialDocumentNumber == row.materialDocumentNumber) {
          ele['checked'] = false; // optional, if you still want to mark before removal
          return false; // remove this element
        }
        return true; // keep others
      });
    }
  }
  
  getTotalByKey(items: any[], key: string): number {
  let total = 0;
  for (const item of items) {
    const value = item[key];
    if (value !== undefined && value !== null) {
      total += parseFloat(value); // handles string numbers like "10.000"
    }
  }
  return total;
}
getViewConditionalDataGRNDetails(poInvoiceID?: any) {
    console.log('getViewConditionalDataGRNDetails');

    let url = `getPOSesAndGrnDetails?poInvoiceID=${poInvoiceID}`;

    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log('resssss',res);
      if (res.status == 'Success' && res?.data?.length > 0) {
        let data = res.data[0];
        this.poGRNItems = data.poGrnDetails;
        this.poGRNItems.forEach((item: any) => {
          item.checked = true;
          item.disabled = true;
        })
        this.totalGRNQuantity = this.getTotalByKey(this.poGRNItems,'quantity');
        this.totalGRNAmount = this.getTotalByKey(this.poGRNItems,'amount');
        this.selectedGRNArr = this.poGRNItems;
        this.isAllGRLSelected  = this.poGRNItems.every((item: any) => {
        return item['checked'] == true
      })
      } else {
      }
    }, err => {
      console.log(err);
    })
  }
   downloadGRNExcelFile() {
      console.log('downloadGRNExcelFile');
  
      let data: any = [];
      this.poGRNItems.map((item: any) => {
        data.push({
          'Posting Date': item.documentDate,
          'Ref Number': item.refInvoiceNumber,
          'Doc Number': item.materialDocumentNumber,
          'Doc Item Number': item.materialDocumentItemNumber,
          'Challan Number': item.challanNo,
          'Challan Date': item.challanDate,
          'LR Number': item.lrNo,
          'LR Date': item.lrDate,
          'Vehicle Number': item.truckId,
          'Material Desc': item.materialDes,
          'Rate': item.rate,
          'Quantity': item.quantity,
          'Amount': item.amount,
          /* 'Po Number': item.purchaseOrderNumber,
          'PO Item Number': item.purchaseOrderItemNo,
          'Fiscal Year': item.materialDocumentFiscalYear,
          'Material Number': item.materialNumber,
          'Plant Code': item.plantCode,
          'Conditional Type': item.conditionType,
          'Conditional Desc': item.conditionDescription, */
        })
      })
  
      let filename = "grnlist.xlsx";
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      const allDataWs: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  
      XLSX.utils.book_append_sheet(wb, allDataWs, 'Sheet1');
      XLSX.writeFile(wb, filename);
    }
  
}
