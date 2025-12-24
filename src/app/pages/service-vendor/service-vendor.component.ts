import { Component, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { PaperlessService } from 'src/app/services/paperless.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-service-vendor',
  templateUrl: './service-vendor.component.html',
  styleUrls: ['./service-vendor.component.scss']
})
export class ServiceVendorComponent {

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
  supportFileLabel: string = 'No file chosen';

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
  rcmSelection: 'Yes' | 'No' | null = null;
  showFCMRCMModal: boolean = false;
  pendingSubmission = false;
  errorModalMessage = '';
  sesTotalNetAmount: any = 0;
  sesTotalTax: any = 0;
  sesTotalGrossAmount: any = 0;
  viewPurchase = false;
  poNumberArray: any = [];
  freightAPIGRNList: any = [];
  viewOnly = false;
  RCMsacCode: boolean = false; // Add this flag
  totalRemainingAmount: number = 0;
  totalAvailableAfter: number = 0;
  getmyData: any = {};
  originalSubmittedItems: any[] = [];
  originalSubmittedDataItems: any[] = [];
  isFirstSubmission: boolean = true;
  showErrorModal :boolean = false;
  userIPAddress: string = '';

  @ViewChild('invoice') 'invoice': ElementRef;
  @ViewChild('suppportinvoice') 'suppportinvoice': ElementRef;
  @ViewChild('signedAttach') 'signedAttach': ElementRef;
  bankAccountDetails: any[]=[];
  vendorList: any[]=[];
  roleName: string | null;
  invoiceNumber: any;

  constructor(public commonService: CommonService, private brearcumbService: BreadcrumbService,private apiService: PaperlessService,
   private router: Router) {
    this.logintype = localStorage.getItem('logintype');
    this.username = localStorage.getItem('username');
    this.roleName = localStorage.getItem('roleName')
    this.userdata = JSON.parse(localStorage.getItem('userdata') || '');
    this.brearcumbService.setBreadcrumbUrl();
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
    this.viewPurchase = this.commonService.viewPurchase;
  }

  ngOnInit(): void {
    this.getmyData = {};
    this.editPurchaseData = {};
    if (this.roleName == 'BusinessUser') {
      this.getVendorList()
    }
    this.loadPurchaseForm();
    this.loadDynamicFilterForm();
    this.resetStoredData();
    this.purchaseForm.reset();

    // Only set getmyData if we're editing/viewing
    if (this.commonService.updatePurchase || this.commonService.viewPurchase) {
      this.getmyData = this.commonService?.editPurchaseData || {};
      this.editPurchaseData = this.commonService?.editPurchaseData || {};

      if (this.commonService.updatePurchase) {
        this.updateInvoice();
        this.viewOnly = false;
      } else if (this.commonService.viewPurchase) {
        this.viewOnly = true;
        this.updateInvoice();
        setTimeout(() => {
          this.disabledAllField();
        }, 2000);
      }
    } else {
      // New invoice - reset everything
      this.getmyData = {};
      this.editPurchaseData = {};
      this.viewOnly = false;
    }
    console.log('this.getmyData', this.getmyData)
    console.log('this.editPurchaseData', this.editPurchaseData)
  if (this.getmyData?.Status === 'correction_required') {
    this.setupCorrectionRequiredMode();
  }
    this.checkInvoiceStatusAfterSubmission();
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

disabledAllField() {
  if (this.getmyData?.Status === 'correction_required') {
    // For correction_required, only disable non-editable fields
    this.disableNonEditableFields();
  } else {
    // For normal view mode, disable everything
    document.querySelectorAll('input').forEach(t => {
      t.setAttribute('disabled', 'true')
    })
    document.querySelectorAll('select').forEach(t => {
      t.setAttribute('disabled', 'true')
    })
    document.querySelectorAll('textarea').forEach(t => {
      t.setAttribute('disabled', 'true')
    })
  }
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

      department: new FormControl(''),
      supp_gst_no: new FormControl('', [Validators.required]),
      child_gst: new FormControl('', [Validators.required]),
      rece_gst_no: new FormControl(''), /* [Validators.required] */
      currency: new FormControl(''),

      payment_mode: new FormControl('', [Validators.required]),
      bank_details:new FormControl('',Validators.required),
      adani_contact: new FormControl(''),
      submission_to: new FormControl('', [Validators.required]),

      material_group: new FormControl(''),
      payment_term: new FormControl(''),

      attach: new FormControl('', [Validators.required]),
      attach_data: new FormControl('', ),
      attach_data_supp: new FormControl(''), /* Validators.required */

      remarks: new FormControl('', [Validators.required, Validators.maxLength(256)]),
      items_arr: new FormControl('', [Validators.required]),
    })

    // this.purchaseForm['controls']['invoice_amount'].disable();
    this.purchaseForm['controls']['invoice_amount_line'].disable();
    this.purchaseForm['controls']['company'].disable();
    this.purchaseForm['controls']['plant_code'].disable();
    this.purchaseForm['controls']['supp_gst_no'].disable();
    this.purchaseForm['controls']['rece_gst_no'].disable();
    this.purchaseForm['controls']['currency'].disable();
    this.purchaseForm['controls']['items_arr'].disable();
    // this.purchaseForm['controls']['submission_to'].disable();
    this.purchaseForm['controls']['payment_term'].disable();
    setTimeout(() => {
      this.purchaseForm['controls']['invoice_date'].setValue(moment(new Date()).format('YYYY-MM-DD'));
      this.purchaseForm['controls']['invoice_type'].setValue('Service');
       if (this.getmyData?.Status === 'correction_required') {
      this.setupCorrectionRequiredMode();
    }
    }, 0);
    this.updateFormForRole(this.roleName)
  }

  updateFormForRole(userRole: any) {
  if (userRole === 'BusinessUser') {
    if (!this.purchaseForm.contains('on_behalf_of')) {
      this.purchaseForm.addControl('on_behalf_of', new FormControl('',[Validators.required]));
    }
  } else {
    if (this.purchaseForm.contains('on_behalf_of')) {
      this.purchaseForm.removeControl('on_behalf_of');
    }
  }
}

setupCorrectionRequiredMode(): void {
  // Only enable specific fields for editing
  this.purchaseForm['controls']['invoice_number'].enable();
  this.purchaseForm['controls']['invoice_date'].enable();
  this.purchaseForm['controls']['invoice_amount'].enable();

  // Disable all other fields
  this.disableNonEditableFields();

  // For SES items, enable only net amount editing
  this.enableSesNetAmountEditing();
}

disableNonEditableFields(): void {
  const fieldsToDisable = [
    'po_number',
    'invoice_type',
    'company',
    'plant_code',
    'department',
    'supp_gst_no',
    'child_gst',
    'rece_gst_no',
    'currency',
    'payment_mode',
    'bank_details',
    'adani_contact',
    'submission_to',
    'material_group',
    'payment_term',
    'attach',
    'attach_data',
    'attach_data_supp',
    'remarks',
    'items_arr'
  ];

  if (this.purchaseForm.contains('on_behalf_of')) {
    fieldsToDisable.push('on_behalf_of');
  }

  fieldsToDisable.forEach(field => {
    if (this.purchaseForm.contains(field)) {
      this.purchaseForm['controls'][field].disable();
    }
  });
}

// Add this method to enable net amount editing for SES items
enableSesNetAmountEditing(): void {
  // This will make the net amount inputs editable in the template
  // The template already has [disabled]="viewOnly" on the net amount inputs
  // We need to set viewOnly to false for correction_required status
  if (this.getmyData?.Status === 'correction_required') {
    this.viewOnly = false;
  }
}


  resetPurchaseForm() {
    // this.commonService.routeToPurchaseOrder();
    this.commonService.routeToPage('./dashboard/service-invoice');
    return;
  }
  allowInvoiceChars(event: KeyboardEvent): boolean {
    const allowedChars = /^[a-zA-Z0-9\-\/]$/;
    const key = event.key;
    return allowedChars.test(key);
  }


  updateInvoice() {
    if(this.roleName == 'BusinessUser'){
      this.userdata['ACCOUNTNUMBER'] = this.commonService['editPurchaseData']['createdBy']
    }
    let url = `POInvoiceDetails?createdBy=${this.userdata['ACCOUNTNUMBER']}`;
    // this.commonService.getPurchaseOrderList(this.userdata['ACCOUNTNUMBER']).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      // console.log(res);
      if (res && res['status'] == 'Success' && res['data'].length > 0) {
        this.editPurchaseData = res['data'].find((item: any) => {
          return item['invoiceNumber'] == this.commonService['editPurchaseData']['Invoice Number'];
        })
        if (Object.keys(this.editPurchaseData).length > 0) {
          if(this.roleName == 'BusinessUser'){
             let vendor = this.vendorList.find((ele:any)=> ele.vendorCode == this.commonService['editPurchaseData']['createdBy'])
             this.purchaseForm.get('on_behalf_of').setValue(vendor);
          }
          this.getPODetail(this.editPurchaseData['poNumber'], this.editPurchaseData['invoiceType']);
           if (this.getmyData?.Status === 'correction_required') {
          this.setupCorrectionRequiredMode();
        }
        }
      } else {
        console.log();
      }
    }, err => {
      console.log(err);
    })

  }

   checkInvoiceStatusAfterSubmission() {
    const url = `getSacCodes`;
    this.commonService.dataGetMasterRCM(url).subscribe((res: any) => {
        console.log('Invoice status check response:', res);

    }, err => {
        console.log('Error checking invoice status:', err);
        setTimeout(() => {
            this.successToast = false;
        }, 2000);
    });
}

  checkInvoiceStatus() {
    const url = `POInvoiceDetails?createdBy=${this.userdata['ACCOUNTNUMBER']}`;
    this.commonService.dataGet(url).subscribe((res: any) => {
        console.log('Invoice status check response:', res);

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
        console.log('Error checking invoice status:', err);
        this.commonService.routeToPage('./dashboard');
        setTimeout(() => {
            this.successToast = false;
        }, 2000);
    });
}

  // Method to handle error modal actions
handleErrorModalAction(action: string) {
  this.showFCMRCMModal = false;
  this.showErrorModal = false;
  this.errorModalMessage = '';
  this.commonService.routeToPage('./dashboard');
}

  openRCMModal() {
  this.showFCMRCMModal = true;
  this.rcmSelection = null; // reset each time modal opens
}

handleRCMSelection(choice: 'yes' | 'no') {
  this.showFCMRCMModal = false;
  this.rcmSelection = choice === 'yes' ? 'Yes' : 'No';
  console.log('RCM Selection saved:', this.rcmSelection);

  // Clear validators for both 'Yes' and 'No' selections
  this.purchaseForm['controls']['child_gst'].clearValidators();
  this.purchaseForm['controls']['child_gst'].updateValueAndValidity();

  this.purchaseForm['controls']['supp_gst_no'].clearValidators();
  this.purchaseForm['controls']['supp_gst_no'].updateValueAndValidity();
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
  this.purchaseForm['controls']['submission_to'].setValue(this.editPurchaseData['submissionTo']);

  this.purchaseForm['controls']['material_group'].setValue(this.editPurchaseData['materialGroup']);
  this.purchaseForm['controls']['payment_term'].setValue(this.editPurchaseData['paymentTerm']);

  this.purchaseForm['controls']['attach'].setValue(this.editPurchaseData['']);
  this.purchaseForm['controls']['remarks'].setValue(this.editPurchaseData['remarks']);
  this.purchaseForm['controls']['items_arr'].setValue(this.editPurchaseData['poInvoiceItems']);

  setTimeout(() => {
    this.refresItemsList();
  }, 0);

  this.purchaseForm['controls']['attach'].clearValidators();
  this.purchaseForm['controls']['attach'].updateValueAndValidity();
  if (this.getmyData?.Status === 'correction_required') {
    this.purchaseForm['controls']['invoice_number'].enable();
  } else {
    this.purchaseForm['controls']['invoice_number'].disable();
  }
  this.purchaseForm['controls']['po_number'].disable();
  this.purchaseForm['controls']['company'].disable();
  this.purchaseForm['controls']['attach'].disable();
  this.purchaseForm['controls']['attach_data'].disable();
  this.selectedItemsArr = this.editPurchaseData.poInvoiceItems;
  this.uploadedDigitalSigned = this.editPurchaseData.invoiceAttachment;
  this.selectedAllAttachmentSupport = this.editPurchaseData.invoiceAttachment;

  // Fetch PO details to get remQty for correction_required status
  if (this.getmyData?.Status === 'correction_required') {
    await this.fetchPODetailsForRemainingQty();
  }

  if (this.editPurchaseData.poSubSesDetails) {
    this.apisesSubList = [];
    this.sesSubList = [];
    this.selectedSesSubItems = [];

    // First, create a map of selected service rates for easy lookup
    const selectedServiceRates = new Map();

    // Process calculate items first to get the rates from selected services
    if (this.editPurchaseData.poCalculateItem && this.editPurchaseData.poCalculateItem.length > 0) {
      this.editPurchaseData.poCalculateItem.map((calculateItem: any) => {
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
    this.editPurchaseData.poSubSesDetails.map((item: any) => {
      const key = `${item.extLineNo}_${item.pckgNo}`;

      // Get remaining quantity - prioritize from PO details for correction_required status
      let remQtyStr = String(item['remQty'] || '0');

      if (this.getmyData?.Status === 'correction_required' && remainingQtyMap.has(key)) {
        remQtyStr = String(remainingQtyMap.get(key));
      }

      const quantityStr = item['quantity'];

      // Check if we have a rate from selected services for this item
      let rate = 0;
            let netValue = Number(item['netValue'] || 0);

      if (selectedServiceRates.has(key)) {
        // Use the rate from selected services
        const selectedService = selectedServiceRates.get(key);
        rate = Number(selectedService.grPrice || item['grPrice'] || 0);
        netValue = Number(selectedService.netValue || item['netValue'] || 0);
      } else {
        // Use the original rate or default
        rate = Number(item['grPrice'] || 0);
        netValue = Number(item['netValue'] || 0);
      }

      const remainingAmount = Number(remQtyStr) * rate;

      this.apisesSubList.push({
        checked: true,
        extLineNo: item['extLineNo'],
        matlGroup: item['matlGroup'],
        netValue: netValue,
        // netValue: item['netValue'],
        pckgNo: item['pckgNo'],
        remQty: remQtyStr, // Use the corrected remQty
        quantity: quantityStr,
        shortText: item['shortText'],
        subPackageNo: item['subPackageNo'],
        taxCode: item['taxCode'],
        taxCodeTariff: item['taxCodeTariff'],
        poNumber: this.purchaseForm.value.po_number,
        grPrice: rate // Use the patched rate
      });
    });

    // Process calculate items from poCalculateItem
    if (this.editPurchaseData.poCalculateItem && this.editPurchaseData.poCalculateItem.length > 0) {
      this.editPurchaseData.poCalculateItem.map((calculateItem: any) => {
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
          const netValue = calculateItem.netValue || calculateItem.netAmount || netAmount; // Get netValue

          // Parse the values properly - remove .toFixed() for view mode
          const formattedNetAmount = this.viewOnly ? String(netAmount) : String(netAmount);
          const formattedGrossAmount = this.viewOnly ? String(grossAmount) : String(grossAmount);
          const formattedQuantity = this.viewOnly ? String(quantity) : String(quantity);
          const formattedRate = this.viewOnly ? String(rate) : String(rate);
          const formattedNetValue = this.viewOnly ? String(netValue) : String(netValue);

          this.selectedSesSubItems.push({
            "extLineNo": calculateItem.extLineNo,
            "netValue": formattedNetValue,
            "grPrice": formattedRate,
            "pckgNo": calculateItem.pckgNo,
            "actu_quantity": remQty,
            "remQty": remQty,
            "quantity": formattedQuantity,
            "subPackageNo": calculateItem.subPackageNo,
            "taxCode": calculateItem.taxCode || sesItem.taxCode,
            "taxCodeTariff": calculateItem.taxCodeTariff || sesItem.taxCodeTariff,
            "poNumber": this.purchaseForm.value.po_number,
            "purchaseOrderItemNo": calculateItem.purchaseOrderItemNo,
            "taxRate": calculateItem.taxRate || 0,
            "netAmount": formattedNetAmount,
            "grossAmount": formattedGrossAmount,
            "remainingAmount": remainingAmount.toFixed(2),
            "maxNetAmount": remainingAmount,
            "netAmountError": false
          });
        } else {
          // If no matching sesItem, create from calculateItem data
          const rate = Number(calculateItem.grPrice || 0);
          const netAmount = calculateItem.netAmount || 0;
          const quantity = calculateItem.quantity || '0';
          const grossAmount = calculateItem.grossAmount || netAmount;
          const netValue = calculateItem.netValue || calculateItem.netAmount || netAmount; // Get netValue

          // Parse the values properly
          const formattedNetAmount = this.viewOnly ? String(netAmount) : String(netAmount);
          const formattedGrossAmount = this.viewOnly ? String(grossAmount) : String(grossAmount);
          const formattedQuantity = this.viewOnly ? String(quantity) : String(quantity);
          const formattedRate = this.viewOnly ? String(rate) : String(rate);
          const formattedNetValue = this.viewOnly ? String(netValue) : String(netValue);

          this.selectedSesSubItems.push({
            "extLineNo": calculateItem.extLineNo,
            "netValue": formattedNetValue || 0,
            "grPrice": formattedRate,
            "pckgNo": calculateItem.pckgNo,
            "actu_quantity": quantity,
            "remQty": quantity,
            "quantity": formattedQuantity,
            "subPackageNo": calculateItem.subPackageNo,
            "taxCode": calculateItem.taxCode || "IC",
            "taxCodeTariff": calculateItem.taxCodeTariff || "",
            "poNumber": this.purchaseForm.value.po_number,
            "purchaseOrderItemNo": calculateItem.purchaseOrderItemNo,
            "taxRate": calculateItem.taxRate || 0,
            "netAmount": formattedNetAmount,
            "grossAmount": formattedGrossAmount,
            "remainingAmount": (rate * Number(quantity)).toFixed(2),
            "maxNetAmount": rate * Number(quantity),
            "netAmountError": false
          });
        }
      });
    } else {
      // Fallback: Use poSubSesDetails if poCalculateItem doesn't exist
      this.editPurchaseData.poSubSesDetails.map((item: any) => {
        const key = `${item.extLineNo}_${item.pckgNo}`;
        let remQtyStr = String(item['remQty'] || '0');

        if (this.getmyData?.Status === 'correction_required' && remainingQtyMap.has(key)) {
          remQtyStr = String(remainingQtyMap.get(key));
        }

        const quantityStr = item['remQty'];
        const rate = Number(item['grPrice'] || 0);
        const remainingAmount = Number(remQtyStr) * rate;
        const netValue = Number(item['netValue'] || 0);

        this.selectedSesSubItems.push({
          "extLineNo": item['extLineNo'],
          "netValue": String(netValue),
          "grPrice": String(rate),
          "pckgNo": item['pckgNo'],
          "actu_quantity": remQtyStr,
          "remQty": remQtyStr,
          "quantity": quantityStr,
          "subPackageNo": item['subPackageNo'],
          "taxCode": item['taxCode'],
          "taxCodeTariff": item['taxCodeTariff'],
          "poNumber": this.purchaseForm.value.po_number,
          "purchaseOrderItemNo": item['purchaseOrderItemNo'],
          "taxRate": item['taxRate'] || 0,
          "netAmount": String(item['netValue'] || 0),
          "grossAmount": String(item['netValue'] || 0),
          "remainingAmount": remainingAmount.toFixed(2),
          "maxNetAmount": remainingAmount,
          "netAmountError": false
        });
      });
    }

    this.sesSubList = [...this.apisesSubList];

    // Calculate totals
    this.sesCalculateTotal();
    this.patchRatesFromSelectedServices();
    if (this.getmyData?.Status === 'correction_required') {
  this.calculateRemainingAmountForItems();
}
  }
}

  onVendorSelect(event:any){
    this.userdata['ACCOUNTNUMBER'] = this.purchaseForm.get("on_behalf_of").value.vendorCode;
    this.userdata['GST'] =this.purchaseForm.get("on_behalf_of").value.gst
  }

  getVendorList(){
    let empId = this.userdata.ldap.employeeID
     let url = `getVendorByEmployee?employeeID=${empId}`;
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      if (res  && res?.length > 0) {
        this.vendorList = res
      } else {
        console.log();
      }
    }, err => {
      console.log(err);
    })

  }
// Add this method to fetch PO details for remaining quantities
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

isCorrectionRequiredInvalid(): boolean {
  // Only check editable fields for correction_required status
  if (this.getmyData?.Status !== 'correction_required') {
    return false;
  }

  // 1. Check Invoice Amount Without Tax - required and valid
  const invoiceAmountCtrl = this.purchaseForm.get('invoice_amount');
  if (invoiceAmountCtrl && (invoiceAmountCtrl.invalid || invoiceAmountCtrl.hasError('amount_mismatch'))) {
    return true;
  }

  // 2. Check Invoice Date - required and valid
  const invoiceDateCtrl = this.purchaseForm.get('invoice_date');
  if (invoiceDateCtrl && invoiceDateCtrl.invalid) {
    return true;
  }

  // 3. Check Invoice Number - required and valid (including duplicate check)
  const invoiceNumberCtrl = this.purchaseForm.get('invoice_number');
  if (invoiceNumberCtrl && (invoiceNumberCtrl.invalid || this.invoiceNoExist)) {
    return true;
  }

  // 4. Check Net Amount in Selected Services
  if (this.selectedSesSubItems && this.selectedSesSubItems.length > 0) {
    // Check if any net amount has errors or is empty
    const hasInvalidNetAmount = this.selectedSesSubItems.some((item: any) => {
      const netAmount = item['netAmount'];
      const netAmountError = item['netAmountError'];

      // Check if net amount is empty, zero, negative, or has error
      return !netAmount ||
             netAmount === '' ||
             Number(netAmount || 0) <= 0 ||
             netAmountError === true;
    });

    if (hasInvalidNetAmount) {
      return true;
    }
  } else {
    // No selected services
    return true;
  }

  return false;
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

// Call this method after setting up the data

  getButtonText(): string {
    if (this.getmyData?.Status === 'correction_required') {
        return 'Resubmit';
    } else if (this.getmyData?.Status === 'sent-back') {
        return 'Resubmit';
    } else {
        return 'Submit';
    }
}

  invoiceTypeSelect(event?: any, invoicetype?: any) {
    console.log('invoiceTypeSelect');

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
      this.commonService.viewPurchase = false;
    this.commonService.updatePurchase = false;
      this.commonService.routeToPage('./dashboard/material-invoice');
    } else if (invoice_type == 'Service') {
       this.commonService.viewPurchase = false;
    this.commonService.updatePurchase = false;
      this.commonService.routeToPage('./dashboard/service-vendor');
    } else if (invoice_type == 'Freight-Inbound') {
      // alert(`🚫 vSPEED Functionality Disabled
      // Due to updates introduced with GST 2.0, the vSPEED feature has been temporarily disabled.
      // We’re working to align with the new compliance standards and will notify you once functionality is restored.
      // Thank you for your understanding.`);
      this.commonService.routeToPage('./dashboard/freight-inbound-invoice');
    } else if (invoice_type == 'SLA') {
      this.commonService.routeToPage('./dashboard/sla-invoice');
    } else if (invoice_type == 'Reward') {
      this.commonService.routeToPage('./dashboard/reward-invoice');
    } else if (invoice_type == 'Contracts') {
      this.commonService.routeToPage('./CAD/vendor/home/invoice');
    } else {
      this.purchaseForm.controls['department'].setValidators([Validators.required]);
      this.purchaseForm.controls['department'].updateValueAndValidity();
    }

    /* if(invoice_type == 'Freight-Inbound'){
      let url = 'getCondVendorDetail';
      let json = {
        "vendorCode": this.userdata['ACCOUNTNUMBER'],
        "poNumber": ''
      }

      this.commonService.spinner.show();
      this.commonService.dataPost(url, json).subscribe((res:any)=>{
        console.log(res);
        this.commonService.spinner.hide();
        this.freightAPIGRNList = res;
        this.poNumber = [];
        this.purchaseForm.controls.po_number.setValue('choose');
        setTimeout(() => {
          if(res.length>0){
            res.map((item:any)=>{
              if(this.poNumberArray.indexOf(item.poNumber)==-1){
                this.poNumberArray.push(item.poNumber)
              }
            })
          }
        }, 0);
        setTimeout(() => {
          this.poNumberArray = this.poNumberArray.sort()
        }, 0);
      },err=>{
        this.commonService.spinner.hide();
        console.log(err);
      })
    } */
  }

  selectChildVendorCode(item: any) {
    console.log(item);
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

    if (this.purchaseForm.value.invoice_type == 'Material') {
      this.selectedAllAttachment.push(attach_json);
      this.purchaseForm['controls']['attach_data'].setValue(this.selectedAllAttachment);
    } else if (this.purchaseForm.value.invoice_type == 'Service' && this.roleName !='BusinessUser') {
      this.uploadedDigitalSigned = [];
      this.commonService.spinner.show();
      this.errorToast = false;

      let url = `checkDigitalSignature`;
      // this.commonService.uploadSignedAttachment(attach_json).subscribe((res:any)=>{
      this.commonService.dataPost(url, attach_json).subscribe((res: any) => {
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
    }
    else if(this.roleName =='BusinessUser'){
      this.selectedAllAttachment.push(attach_json);
      this.purchaseForm['controls']['attach_data'].setValue(this.selectedAllAttachment);
      this.uploadedDigitalSigned.push(attach_json);
    }
  }

onImageCaptureSupport(evt: any) {
  const files: FileList = evt.target.files;
  let filesAdded = 0;
  let invalidFiles: string[] = [];
  let validFiles: File[] = [];

  const extension_list = [
    'pdf', 'xls', 'xlsx', 'csv', 'zip', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'txt', 'rtf'
  ];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const file_name = file.name;
    const file_extension = file_name.split('.').pop()?.toLowerCase();

    if (!file_extension || !extension_list.includes(file_extension)) {
      invalidFiles.push(file_name);
    } else {
      validFiles.push(file);
    }
  }

  if (invalidFiles.length > 0) {
    this.toastMsg = 'Only PDF, XLS, XLSX, CSV, ZIP, JPG, JPEG, PNG, DOC, DOCX, TXT, RTF files are allowed';
    this.errorToast = true;
    setTimeout(() => { this.errorToast = false; }, 4000);
  }

  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i];

    const isDuplicate = this.selectedAllAttachmentSupport.some((existingFile: any) =>
      existingFile.fileName.toLowerCase() === file.name.toLowerCase()
    );

    if (isDuplicate) {
      this.toastMsg = `Duplicate File: ${file.name}`;
      this.errorToast = true;
      setTimeout(() => { this.errorToast = false; }, 4000);
      continue;
    }

    const reader = new FileReader();
    reader.onload = ((f: File) => (readerEvt: any) => {
      this._onImageCaptureSupport(f, readerEvt);
    })(file);

    reader.readAsBinaryString(file);
    filesAdded++;
  }

  if (filesAdded > 0) {
    this.successToast = true;
    this.toastMsg = `${filesAdded} valid file(s) added successfully`;
    setTimeout(() => { this.successToast = false; }, 2000);
  }

  if (typeof this.updateFileLabel === 'function') {
    this.updateFileLabel();
  }

}

updateFileLabel() {
  const totalFiles = this.selectedAllAttachmentSupport?.length || 0;
  if (totalFiles === 0) {
    this.supportFileLabel = 'No file chosen';
  } else if (totalFiles === 1) {
    this.supportFileLabel = this.selectedAllAttachmentSupport[0].fileName;
  } else {
    this.supportFileLabel = `${totalFiles} files chosen`;
  }
}

_onImageCaptureSupport(file: any, readerEvt: any) {
    var binaryString = readerEvt.target.result;
    let base64 = btoa(binaryString);

    let attach_json = {
        fileName: file.name,
        fileBase64: base64,
        fileSize: file.size,
        fileType: file.type,
        lastModified: file.lastModified
    }
    this.selectedAllAttachmentSupport.push(attach_json);
    this.purchaseForm['controls']['attach_data_supp']?.setValue(this.selectedAllAttachmentSupport);

    console.log(`File "${file.name}" added. Total files: ${this.selectedAllAttachmentSupport.length}`);
}

deleteAttachmentSupp(json: any) {
    console.log('deleteAttachmentSupp');

    const index = this.selectedAllAttachmentSupport.findIndex((item: any) =>
        item.fileName === json.fileName &&
        item.fileBase64 === json.fileBase64
    );

    if (index !== -1) {
        this.selectedAllAttachmentSupport.splice(index, 1);
    }

    this.purchaseForm['controls']['attach_data_supp'].setValue(
        this.selectedAllAttachmentSupport.length > 0 ? this.selectedAllAttachmentSupport : null
    );

    if (this.suppportinvoice && this.suppportinvoice.nativeElement) {
        this.suppportinvoice.nativeElement.value = null;
    }
}

  uploadMergedSignAttachment(evt: any) {
    console.log('downloadMergedAttachment');
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
      console.log(res);
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

  // Check for invalid SES quantities
  if (this.hasInvalidSesQuantities()) {
    message.push('Please enter valid quantities for all selected services');
  }

   const hasNetAmountErrors = this.selectedSesSubItems.some((item: any) => item['netAmountError']);
    if (hasNetAmountErrors) {
        message.push('Net amount exceeds maximum allowed for some services');
    }
      const hasNegativeAvailable = this.selectedSesSubItems.some((item: any) =>
        Number(item['availableAfter']) < 0
    );
    if (hasNegativeAvailable) {
        message.push('Some services have negative available amounts');
    }

      const hasZeroNetAmount = this.selectedSesSubItems.some((item: any) => {
    const netAmount = Number(item['netAmount'] || 0);
    return netAmount <= 0;
  });

  if (hasZeroNetAmount) {
    message.push('Net amount must be greater than zero for all selected services');
  }

    // Check if total available after is negative
    if (this.totalAvailableAfter < 0) {
        message.push('Total available amount is negative');
    }

  // Check form validity - but exclude GST fields if RCM is selected (either Yes or No)
  if (this.rcmSelection !== null && this.rcmSelection !== undefined) {
    // RCM is selected (Yes or No), create a temporary form state without GST validation
    const formErrors = this.getFormErrorsWithoutGST();
    if (Object.keys(formErrors).length > 0) {
      message.push('Form is invalid');
    }
  } else {
    // RCM not selected, check full form validity
    if (!this.purchaseForm['valid']) {
      message.push('Form is invalid');
    }
  }

  // Check if PO items are selected
  if (this.selectedItemsArr.length == 0) {
    message.push('Select PO items');
  }

  // Check for uploaded digital signed document
  if (this.uploadedDigitalSigned.length == 0 && this.roleName  != 'BusinessUser') {
    message.push('Upload digital signed document');
  }

  // Check for submission to selection
  if (this.submissionArr.length == 0) {
    message.push('Please select submission to');
  }

  // Check for quantity exceeds
  if (this.quantityExceedsArray.length > 0) {
    message.push('Quantity exceeds for GRN');
  }

  // Check for wrong input data
  if (this.wrongInputArray.length > 0) {
    message.push('Wrong data entered');
  }

  // Check for blank HSN codes
  if (this.blankHsnCodeArray.length > 0) {
    message.push('HSN is blank');
  }

  // Check for selected SES items
  if (this.selectedSesSubItems.length == 0) {
    message.push('Select services');
  }

  // Check for supporting documents (only for Service type)
  if (this.purchaseForm.value.invoice_type == 'Service' && this.selectedAllAttachmentSupport.length == 0) {
    message.push('Upload supporting documents');
  }

  // Only check GST validation if RCM is null (not selected)
  // When RCM is selected (Yes or No), don't validate GST
if (this.rcmSelection === null || this.rcmSelection === undefined) {
  const childGstCtrl = this.purchaseForm.get('child_gst');
  const suppGstCtrl  = this.purchaseForm.get('supp_gst_no');

  if (childGstCtrl && !childGstCtrl.disabled && !childGstCtrl.valid) {
    message.push('Child GST is required');
  }

  if (suppGstCtrl && !suppGstCtrl.disabled && !suppGstCtrl.valid) {
    message.push('Supplier GST is required');
  }
}

  if (message.length > 0) {
    this.toastMsg = `${message.join(', ')}`;
    this.errorToast = true;
    setTimeout(() => {
      this.errorToast = false;
    }, 5000);
    return message;
  }

  return [];
}

// Add this method to check for net amount errors
hasNetAmountErrors(): boolean {
  if (!this.selectedSesSubItems || this.selectedSesSubItems.length === 0) {
    return false;
  }

  // Check if any item has netAmountError set to true
  return this.selectedSesSubItems.some((item: any) => {
    return item['netAmountError'] === true;
  });
}

// Add this helper method if you don't have it
getFormErrorsWithoutGST() {
  const errors: any = {};
  const controls = this.purchaseForm.controls;

  // Check all controls except GST ones
  Object.keys(controls).forEach(key => {
    if (key !== 'child_gst' && key !== 'supp_gst_no' && controls[key].errors) {
      errors[key] = controls[key].errors;
    }
  });

  return errors;
}

  /* Invoice Submit */
submitPurchaseForm(event: any) {
  console.log('submitPurchaseForm');

  const validationErrors = this.verifyValidSubmit();
  if (validationErrors.length > 0) {
    return;
  }

  if (this.purchaseForm.value.invoice_type == 'Service') {
    // Simply pass all supporting documents without merging
    this.callSubmitPurchaseFormApi(this.selectedAllAttachmentSupport || []);
  } else {
    // For non-service invoices
    this.callSubmitPurchaseFormApi([]);
  }
}

handleSubmitData(){
    if (this.isFirstSubmission) {
    this.submissionArr = JSON.parse(JSON.stringify(this.selectedItemsArr));
    this.originalSubmittedDataItems = JSON.parse(JSON.stringify(this.selectedItemsDataArr));
    this.isFirstSubmission = false;
    console.log('Stored original submission data');
  }

  const poItemsData = this.apiitems || []; // This should be populated from getPODetails

  // Apply corrections using the stored original data and patch from PO items
  this.selectedItemsArr = this.submissionArr.map((item: any) => {
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

    console.log('Applied corrections to items:', this.selectedItemsArr);
  console.log('Applied corrections to data items:', this.selectedItemsDataArr);
  console.log('Source PO Items data:', poItemsData);

}

  callSubmitPurchaseFormApi(supp_attach?: any) {
    console.log('callSubmitPurchaseFormApi');
    if (this.getmyData?.Status !== 'correction_required') {
    this.submissionArr = [];
    this.originalSubmittedDataItems = [];
    this.isFirstSubmission = true;
  }
let submission_to = this.submissionArr.filter((item: any) => {
  return item.createdBy === this.purchaseForm.controls['submission_to'].value;
});

const isInvalid = (v: any) =>
  v === null ||
  v === undefined ||
  v === '' ||
  v === '[]' ||
  (Array.isArray(v) && v.length === 0);

let finalSubmissionTo;

if (!isInvalid(submission_to)) {
  finalSubmissionTo = JSON.stringify(submission_to).replace(/"/g, '\\"');
} else {
  const formValue = this.purchaseForm.get('submission_to')?.value;

  finalSubmissionTo = isInvalid(formValue) ? null : formValue;
}
    if(this.getmyData?.Status === 'correction_required'){
      this.handleSubmitData();
    }

    const invoiceAmount =
      this.purchaseForm.controls['invoice_amount'].value?.toString().trim()
        ? this.purchaseForm.controls['invoice_amount'].value
        : this.purchaseForm.controls['invoice_amount_line'].value;

    let json: any = {
      poNumber: this.purchaseForm['controls']['po_number']?.value,
      invoiceNumber: this.purchaseForm['controls']['invoice_number']?.value,
      invoiceType: this.purchaseForm['controls']['invoice_type']?.value,
      invoiceDate: moment(new Date(this.purchaseForm['controls']['invoice_date']?.value)).format('YYYY-MM-DD HH:mm:ss'),
      vendorIp: this.userIPAddress || '',
      lineItermsAmount: this.purchaseForm['controls']['invoice_amount_line']?.value,
      invoiceAmount: invoiceAmount,
      totalInvoiceAmount: this.purchaseForm['controls']['invoice_amount_line']?.value,
      companyCode: this.purchaseForm['controls']['company']?.value,
      plantCode: this.purchaseForm['controls']['plant_code']?.value ? this.purchaseForm['controls']['plant_code']?.value : null,

      department: this.purchaseForm['controls']['department'].value ? this.purchaseForm['controls']['department']?.value : null,
      supplierGST: this.purchaseForm['controls']['supp_gst_no'].value ? this.purchaseForm['controls']['supp_gst_no']?.value : null,
      supplierChildGST: this.purchaseForm['controls']['child_gst'].value ? this.purchaseForm['controls']['child_gst']?.value : null,
      childVendorCode: this.childVendorCode ? this.childVendorCode : null,
      receiverGST: this.purchaseForm['controls']['rece_gst_no'].value ? this.purchaseForm['controls']['rece_gst_no']?.value : null,
      currency: this.purchaseForm['controls']['currency'].value ? this.purchaseForm['controls']['currency']?.value : null,

      paymentMode: this.purchaseForm['controls']['payment_mode'].value ? this.purchaseForm['controls']['payment_mode']?.value : null,
      adaniContactNo: this.purchaseForm['controls']['adani_contact'].value ? this.purchaseForm['controls']['adani_contact']?.value : null,
      submissionTo: finalSubmissionTo,
      materialGroup: this.purchaseForm['controls']['material_group'].value,
      paymentTerm: this.purchaseForm['controls']['payment_term'].value,

      attach: this.uploadedDigitalSigned,
      remarks: this.purchaseForm['controls']['remarks'].value ? this.purchaseForm['controls']['remarks'].value : null,

      on_behalf_of:this.purchaseForm['controls']['on_behalf_of']?.value.VendorCode,
      uploadedByBusinessUser :this.roleName == 'BusinessUser' ? 1:0,
      poInvoiceItems: this.selectedItemsArr,
      // poSubSesDetails: this.purchaseForm.value.invoice_type=='Service'?this.selectedSesSubItems:[],
      // poCalculateItem: this.selectedSesSubItems,
      // poCalculateItem: this.purchaseForm.value.invoice_type == 'Material' || this.getmyData?.Status === 'correction_required' ? this.selectedItemsDataArr : [],
      poCalculateItem: this.selectedSesSubItems,
      poSubSesDetails: this.sesSubList.filter((item: any) => {
        return item.checked == true;
      })
    }
     if(this.getmyData?.Status === 'correction_required'){
         json.resubmission = true;
    }else{
          json.resubmission = false;
    }
    if (this.purchaseForm['controls']['bank_details'].value) {
      let bankDetails = this.purchaseForm['controls']['bank_details'].value
      {
        json.ifsc = bankDetails?.IFSC_Code
        json.bankAccount = bankDetails?.Bank_Account
      }
    }
    json.rcm = this.rcmSelection ? this.rcmSelection : 'No';
    if (this.commonService.updatePurchase == true) {
      if (this.purchaseForm.controls['attach_data'].value) {
        json.attach = this.purchaseForm['controls']['attach_data'].value;
        json.supportAttach = [];
      } else {
        json.attach = [];
        json.supportAttach = [];
      }
      json.resubmission = this.getmyData?.Status === 'correction_required' ? true : false;
      json.status = 'pending';
      json.rcm = this.rcmSelection ? this.rcmSelection : 'No';
      json.sapStatus = this.editPurchaseData.sapStatus;
      json.pdfTransferredSap = null;
      json.createdBy = this.editPurchaseData.createdBy;
      json.createdDate = moment(this.editPurchaseData.createdDate).format('YYYY-MM-DD HH:mm:ss');
      json.updatedBy = this.username;
      json.updatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      json.poInvoiceID = this.editPurchaseData.poInvoiceID;
      json.reviewerRemarks = this.editPurchaseData['reviewerRemarks'];
    } else {
      // json.attach = this.purchaseForm['controls']['attach_data'].value,
      json.attach = this.uploadedDigitalSigned,
        json.supportAttach = supp_attach ? supp_attach : [],
        json.status = 'pending';
      json.sapStatus = 0;
      json.rcm = this.rcmSelection ? this.rcmSelection : 'No';
      json.pdfTransferredSap = null;
      json.createdBy = this.userdata['ACCOUNTNUMBER'];
      json.createdDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      json.updatedBy = this.username;
      json.updatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
    console.log('josn of postpoinvoice',json);

    let url = `PostPOInvoice`;
    this.commonService.spinner.show();
    // this.commonService.purchaseOrder(json).subscribe((res:any)=>{
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res && res['status'] == 'Success') {
        this.successToast = true;
        this.toastMsg = res['message'];
        // this.commonService.routeToDashboard();
        // this.commonService.routeToPage('./dashboard');
        this.checkInvoiceStatus();
        setTimeout(() => {
          this.successToast = false;
        }, 2000);
      } else {
        this.errorToast = true;
        this.toastMsg = res['message'];
      }
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
      this.errorToast = true;
      this.toastMsg = err['error']['message'];
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
    })
  }

    resetStoredData() {
  this.submissionArr = [];
  this.originalSubmittedDataItems = [];
  this.isFirstSubmission = true;
}

calculateMaxNetAmount(item: any): number {
    const remQty = Number(item['actu_quantity']);
    const rate = Number(item['grPrice']);

    if (isNaN(remQty) || isNaN(rate)) return 0;

    return remQty * rate;
}

onNetAmountChange(event: any, item: any, index: number): void {
    const inputValue = event.target.value;

    const decimalRegex = /^\d*(\.\d{0,5})?$/;

    if (inputValue === '' || decimalRegex.test(inputValue)) {
        item['tempNetAmount'] = inputValue;

        item['netAmountError'] = false;
        item['netAmountErrorMsg'] = '';

        const netAmount = Number(inputValue);

        if (inputValue !== '' && (isNaN(netAmount) || netAmount <= 0)) {
            item['netAmount'] = '';
            item['netAmountError'] = true;
            item['netAmountErrorMsg'] = 'Net amount must be greater than zero';
            this.sesCalculateItemFields(item);
            return;
        }
    } else {
        event.target.value = item['tempNetAmount'] || item['netAmount'] || '';
    }
}

// Add this method to validate net amount on focus out
validateNetAmount(event: any, item: any, index: number): void {
    const inputValue = item['tempNetAmount'] || event.target.value;
    const netAmount = Number(inputValue || 0);
    const maxNetAmount = Number(item['remainingAmount']);

    // Check for zero value
    if (netAmount === 0 || netAmount <= 0) {
        item['netAmountError'] = true;
        item['netAmountErrorMsg'] = 'Net amount must be greater than zero';
        // event.target.value = item['netAmount']; // Reset to previous value
        return;
    }

    if (netAmount > maxNetAmount) {
        item['netAmountError'] = true;
        item['netAmountErrorMsg'] = `Cannot exceed: ${item['remainingAmount']}`;
        event.target.value = item['netAmount']; // Reset to previous value
    } else {
        item['netAmountError'] = false;
        item['netAmountErrorMsg'] = '';
        // Store exactly what user typed (or empty string if blank)
        item['netAmount'] = inputValue === '' ? '0' : inputValue;
        this.sesCalculateItemFields(item);
    }

    delete item['tempNetAmount'];
}

// Add this method to recalculate all fields based on net amount
// Add this method to recalculate all fields based on net amount
sesCalculateItemFields(item: any): void {
    const netAmountStr = item['netAmount'] || '0';
    const netAmount = Number(netAmountStr);
    const rate = Number(item['grPrice'] || 0);
    const maxNetAmount = Number(item['maxNetAmount'] || 0);

    // Check for zero or negative values
    if (netAmount <= 0) {
        item['netAmountError'] = true;
        item['netAmountErrorMsg'] = 'Net amount must be greater than zero';
        return;
    }

    if (isNaN(netAmount) || isNaN(rate) || rate === 0) {
        // Set defaults
        item['quantity'] = item['quantity'] || '0';
        item['grossAmount'] = '0';
        return;
    }

    // Ensure net amount doesn't exceed max (Rate × Rem Qty)
    if (netAmount > maxNetAmount) {
        item['netAmount'] = maxNetAmount.toString();
        item['netAmountError'] = true;
        item['netAmountErrorMsg'] = `Cannot exceed: ${item['remainingAmount']}`;
        return;
    }

    if (netAmount > 0) {
        const calculatedQuantity = netAmount / rate;

        // Always show at least 2 decimal places for quantity, but preserve up to 5
        let quantityDecimalPlaces = 2;
        const calculatedDecimalPlaces = this.getDecimalPlacesFromNumber(calculatedQuantity);
        quantityDecimalPlaces = Math.min(Math.max(quantityDecimalPlaces, calculatedDecimalPlaces), 5);
        item['quantity'] = calculatedQuantity.toFixed(quantityDecimalPlaces);
        item['quantity'] = this.removeTrailingZeros(item['quantity']);
    } else {
        // Keep the existing quantity if net amount is 0
        item['quantity'] = item['quantity'] || '0';
    }

    // Keep gross amount with same format as net amount
    item['grossAmount'] = netAmountStr;

    // Clear any error
    item['netAmountError'] = false;
    item['netAmountErrorMsg'] = '';

    // Recalculate totals
    this.sesCalculateTotal();
    this.compareAmount();

    // Update the array to trigger change detection
    this.selectedSesSubItems = [...this.selectedSesSubItems];
}

getDecimalPlacesFromNumber(num: number): number {
    if (!Number.isFinite(num)) return 0;

    // Convert to string and check for decimal places
    const str = num.toString();
    if (str.includes('.')) {
        return str.split('.')[1].length;
    }

    // If it's an integer but small (less than 1), we need to check precision
    if (num > 0 && num < 1) {
        // Count leading zeros after decimal
        const match = str.match(/^0\.0*/);
        if (match) {
            const zeros = match[0].length - 2; // Subtract "0."
            // Find first non-zero digit
            const remaining = str.substring(zeros + 2);
            if (remaining) {
                return zeros + 1;
            }
        }
    }

    return 0;
}

getDecimalPlaces(value: string): number {
    if (!value.includes('.')) return 0;
    return value.split('.')[1].length;
}

removeTrailingZeros(value: string): string {
    // Remove trailing zeros after decimal point
    if (value.includes('.')) {
        value = value.replace(/(\.\d*?)0+$/, '$1');
        // Remove decimal point if nothing after it
        value = value.replace(/\.$/, '');
    }
    return value;
}

podetailsGetData(){
 const po_number = this.purchaseForm['controls']['po_number'].setValue(this.editPurchaseData['poNumber']);
 const  invoice_type = this.purchaseForm['controls']['invoice_number'].setValue(this.editPurchaseData['invoiceNumber']);
   let url = `getPODetails?poNumber=${po_number}&invoiceType=${invoice_type}`

     this.commonService.dataGet(url).subscribe(async (res: any) => {
      console.log(res);
      this.commonService.spinner.hide();

      this.getBankDetail()
      this.purchaseForm['controls']['company'].setValue(res['data']['companyCode']);
      if (res['data'] && res['data']['poItems'].length > 0) {
      }
    })
}



  async getPODetail(po_number?: any, invoice_type?: any) {
    this.clearOldData();
    if (this.roleName == 'BusinessUser' && !this.purchaseForm.get('on_behalf_of')?.value) {
      this.purchaseForm.get('on_behalf_of')?.markAsTouched();
      return;
    }
    this.errorToast = false;
    this.selectedItemsArr = [];
    this.selectedItemsDataArr = [];
    this.submissionArr = [];
    this.poNumber = po_number;
    this.commonService.spinner.show();

    let url = `getPODetails?poNumber=${po_number}&invoiceType=${invoice_type}`
    // this.commonService.getPODetail(po_number, invoice_type).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe(async (res: any) => {
      console.log(res);
      this.commonService.spinner.hide();

      /* if(this.purchaseForm.value.invoice_type=='Freight-Inbound' || (this.viewPurchase==true && this.commonService.editPurchaseData.History.invoiceType=='Freight-Inbound')){
        res['data'].conditionalGRN = this.freightAPIGRNList.filter((item:any)=>{
          return item.poNumber == this.purchaseForm.value.po_number;
        })
        localStorage.setItem('poResponseJson', JSON.stringify(res['data']));
        localStorage.setItem('poNumber', this.poNumber);
        localStorage.setItem('invoice_type', this.purchaseForm.value.invoice_type);
        this.commonService.routeToconditionalFormInvoice();
        return;
      } */

      if (res['data']['vendorCode'] != this.userdata['ACCOUNTNUMBER']) {
        this.errorToast = true;
        this.toastMsg = "Invalid PO Number";
        this.clearOldData();
        setTimeout(() => {
          this.errorToast = false;
        }, 2000);
        return;
      }
      this.getBankDetail(po_number);
      this.purchaseForm['controls']['company'].setValue(res['data']['companyCode']);
      if (res['data'] && res['data']['poItems'].length > 0) {
        this.items = res['data']['poItems'];
        this.apiitems = this.structureItems(res['data']['poItems']);
        this.filterItems = [...this.apiitems];
        this.items = [...this.apiitems];
        // this.purchaseForm['controls']['plant_code'].setValue(res['data']['poItems'][0]['plantCode']);
        this.purchaseForm['controls']['material_group'].setValue(res['data']['materialGroup'] ? res['data']['materialGroup'] : '');
        this.purchaseForm['controls']['payment_term'].setValue(res['data']['paymentTerm'] ? res['data']['paymentTerm'] : '');
        // this.purchaseForm['controls']['plant_code'].setValue(res['data']['poItems'][0]['plantCode']+'-Ambujanagar');
        this.purchaseForm['controls']['supp_gst_no'].setValue(this.userdata.GST);
        this.purchaseForm['controls']['currency'].setValue('INR');
        this.purchaseForm['controls']['payment_mode'].setValue('rtgs');
        this.getSubmissionTo(res['data']['poItems'][0]['plantCode'], invoice_type, res['data']['poItems'][0]['preqNo']);
        this.getChildGST();
        this.globalHsnCode = res['data']['poItems'][0]['hsnCode'] ? res['data']['poItems'][0]['hsnCode'] : 995461;
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

      // After all your existing logic for setting up PO details, add this block:
      if (res['data']) {
        // Check for RCM based on SAC codes
        this.checkRCMOnSAC(res['data']);
      }
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
      this.purchaseForm['controls']['plant_code'].enable();
      // this.purchaseForm['controls']['submission_to'].enable();
      this.purchaseForm['controls']['items_arr'].enable();
      return;
    })
  }
    getBankDetail(po_number?: any, invoice_type?: any) {
    let url = `getBankDetails?poNumber=${po_number}&vendorCode=${this.userdata['ACCOUNTNUMBER']}`
    // this.commonService.getPODetail(po_number, invoice_type).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log("bank Details",res);
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

  clearOldData() {

  this.clearAllFiles();
  // Reset form fields
  this.purchaseForm['controls']['company'].setValue('');
  this.purchaseForm['controls']['plant_code'].setValue('');
  this.purchaseForm['controls']['material_group'].setValue('');
  this.purchaseForm['controls']['payment_term'].setValue('');
  this.purchaseForm['controls']['currency'].setValue('');
  this.purchaseForm['controls']['invoice_number'].setValue('');
  this.purchaseForm['controls']['invoice_amount'].setValue('');
  this.purchaseForm['controls']['invoice_amount_line'].setValue('');
  this.purchaseForm['controls']['department'].setValue('');
  this.purchaseForm['controls']['rece_gst_no'].setValue('');
  this.purchaseForm['controls']['supp_gst_no'].setValue('');
  this.purchaseForm['controls']['child_gst'].setValue('');
  this.purchaseForm['controls']['child_gst'].setValue('');
  this.purchaseForm['controls']['payment_mode'].setValue('');
  this.purchaseForm['controls']['payment_term'].setValue('');
  this.purchaseForm['controls']['adani_contact'].setValue('');
  this.purchaseForm['controls']['submission_to'].setValue('');
  this.purchaseForm['controls']['attach'].setValue('');
  this.purchaseForm['controls']['attach_data'].setValue('');
  this.purchaseForm['controls']['attach_data_supp'].setValue('');
  this.purchaseForm['controls']['remarks'].setValue('');
  this.purchaseForm['controls']['items_arr'].setValue('');

  // Clear tables and arrays
  this.items = [];
  this.apiitems = [];
  this.filterItems = [];
  this.selectedItemsArr = [];
  this.selectedItemsDataArr = [];
  this.sesSubList = [];
  this.apisesSubList = [];
  this.selectedSesSubItems = [];

  // Reset totals
  this.totalNetAmount = 0;
  this.totalGrossAmount = 0;
  this.sesTotalNetAmount = 0;
  this.sesTotalGrossAmount = 0;

  this.purchaseForm['controls']['invoice_amount_line']?.setValue('');
}

clearAllFiles() {
  // Reset file form controls
  this.purchaseForm['controls']['attach'].setValue('');
  this.purchaseForm['controls']['attach_data'].setValue('');
  this.purchaseForm['controls']['attach_data_supp'].setValue('');

  // Clear file input elements
  if (this.invoice && this.invoice.nativeElement) {
    this.invoice.nativeElement.value = '';
  }
  if (this.suppportinvoice && this.suppportinvoice.nativeElement) {
    this.suppportinvoice.nativeElement.value = '';
  }

  // Clear attachment arrays
  this.selectedAllAttachment = [];
  this.selectedAllAttachmentSupport = [];
  this.uploadedDigitalSigned = [];
  this.selectedSupportingDocument = null;
}

  validateInvoiceNumber(event: any) {
    console.log('validateInvoiceNumber');
    this.errorToast = false;
    let value = event.target.value.trim();

    if (value == '') {
      return;
    }

    let json = {
      vendorNumber: this.userdata['ACCOUNTNUMBER'],
      invoiceNumber: value
    }
    let isUpdate = false;
    if(this.getmyData?.Status === 'correction_required'){
      isUpdate = true
    }
    let url = `InvoiceVendorValidation?createdBy=${this.userdata['ACCOUNTNUMBER']}&invoiceNumber=${value}&isUpdate=${isUpdate}`
    // this.commonService.validateInvoiceNumber(json).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      this.invoiceNoExist = false;
      this.purchaseForm['controls']['invoice_amount'].setErrors();
      this.purchaseForm['controls']['invoice_amount'].clearValidators();
    }, err => {
      console.log(err.error.message);
      this.errorToast = true;
      this.toastMsg = err.error.message;
      this.invoiceNoExist = true;
      this.purchaseForm['controls']['invoice_number'].setErrors({ 'invoice_exist': true });
    })
  }

  getSubmissionTo(plant_code?: any, invoice_type?: any, preqNo?: any) {
    console.log('getSubmissionTo');

    let url = `plantDetails?plantCode=${plant_code}&invoiceType=${invoice_type}&preqNo=${preqNo}`;
    // this.commonService.getSubmissionTo(plant_code, invoice_type, preqNo).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      if (res && res['status'] == 'Success' && res['data']) {
        this.purchaseForm['controls']['plant_code'].setValue(res['data']['plantCode'] + '-' + res['data']['plantName']);
        this.purchaseForm['controls']['rece_gst_no'].setValue(res['data']['gstNumber'] ? res['data']['gstNumber'] : '');
        // this.purchaseForm['controls']['submission_to'].enable();
         this.submissionArr = res['data']['employeeData'];
        if (res['data']['employeeData']) {
          // if(this.roleName == 'BusinessUser'){

            if(this.commonService.viewPurchase == true && this.editPurchaseData){
              let data = this.submissionArr.find((ele:any)=> ele.name ==this.editPurchaseData['submissionTo'] )
              this.purchaseForm['controls']['submission_to'].setValue(data);
            }
          // }
          // else{
          //    this.submissionArr = res['data']['employeeData'].filter((item: any) => {
          //   return (item['adminAccess'] == false && (item.roleName == 'SiteController' || item.roleName.includes('SiteController')))
          // });
          // }
        if (this.submissionArr.length == 1) {
          this.purchaseForm.controls.submission_to.setValue(this.submissionArr[0]['createdBy']);
          this.purchaseForm.controls.submission_to.disable();
        }
      }
        if (this.commonService.updatePurchase == true || this.commonService.viewPurchase == true) {
          this.fillPurchaseForm();
          /* if(this.commonService.editPurchaseData.History.invoiceType == 'Freight-Inbound'){
            this.commonService.routeToconditionalFormInvoice();
            return;
          }else{
          } */
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
    console.log('getChildGST');

    let url = 'getChildVendorCode';
    let json = {
      "vendorCode": this.userdata.ACCOUNTNUMBER
    }
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      if (res && res['status'] == 'Success' && res['data'].length > 0) {
        this.childGSTArr = res['data'];
        this.purchaseForm.controls['child_gst'].setValue(res['data'][0]['gstNumber']);
        this.childVendorCode = (res['data'][0]['vendorCode']);
      }
      if (this.commonService.updatePurchase == true) {
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
    console.log('siteAction');
    if (action == 'reject') {
      this.confirmModalMessage = 'Are You Sure, You Want To Reject ?';
    } else if (action == 'sentback') {
      this.confirmModalMessage = 'Are You Sure, You Want To Sent Back ?';
    } else if (action == 'onhold') {
      this.confirmModalMessage = 'Are You Sure, You Want To OnHold ?';
    }
  }

  checkAll(event: any) {
    console.log('checkAll');
    this.selectedAll = true;
    if (event.target.checked) {
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
      this.calculateTotal();
    }
  }

  poSelect(event: any, row: any) {
    console.log('poSelect', event.target.checked);

    if (row['remainingQuantity'] == "0") {
      event.target.checked = false
      this.errorToast = true;
      this.toastMsg = 'PO Item remaining quantity is 0';

      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
      return;
    }

    let checked = event.target.checked;
    if (this.purchaseForm.value.invoice_type == 'Service') {
      this.addRemoveItemsDataArrSes(event, row);
    } else {
      this.addRemoveItemsDataArr(event, row);
    }

    if (checked) {
      this.apiitems.map((item: any) => {
        if (item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']) {
          item['checked'] = true;
          this.selectedItemsArr.push(item)
        }
      })

      this.purchaseForm['controls']['items_arr'].clearValidators();
      this.purchaseForm['controls']['items_arr'].updateValueAndValidity();
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
      this.selectedAll = false;
    }
  }



  addRemoveItemsDataArr(event: any, row: any) {
    console.log('addRemoveItemsDataArr');
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
        grossAmount: Number(Number(row['remainingQuantity']) * Number(row['netPrice']) + Number(row['remainingQuantity']) * Number(row['netPrice']) * Number(row['taxRate'])).toFixed(2),
        materialNumber: row['materialNumber'],
        plantCode: row['plantCode'],
        grPrice: row['grPrice']
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

  updateTotal(event?: any, field?: any, row?: any) {
    console.log('updateTotal');
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
        console.log(res);

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
              item['grossAmount'] = Number(Number(item['quantity']) * Number(item['netPrice']) + Number(item['quantity']) * Number(item['netPrice']) * Number(item['taxRate'])).toFixed(2);
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
        item['grossAmount'] = Number(Number(item['quantity']) * Number(item['netPrice']) + Number(item['quantity']) * Number(item['netPrice']) * Number(item['taxRate'])).toFixed(2);
      }
    })
    this.calculateTotal();
    this.compareAmount();
  }

  calculateTotal() {
    console.log('calculateTotal');
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
    this.purchaseForm.controls['invoice_amount_line'].setValue(!isNaN(Number(this.totalGrossAmount)) ? Number(this.totalGrossAmount) : 0);
  }

compareAmount(event?: any) {
    console.log('compareAmount');

    // Parse values with 5 decimal precision
    const invoiceAmount = parseFloat(this.purchaseForm['controls']['invoice_amount'].value) || 0;
    const lineItemsAmount = parseFloat(this.purchaseForm['controls']['invoice_amount_line']?.value) || 0;

    // Compare with 0.00001 precision (5 decimal places)
    if (Math.abs(invoiceAmount - lineItemsAmount) < 0.00001) {
        console.log('match');
        this.purchaseForm['controls']['invoice_amount'].setErrors();
        this.purchaseForm['controls']['invoice_amount'].clearValidators();
    } else {
        console.log('mismatch');
        this.purchaseForm['controls']['invoice_amount'].setErrors({ 'amount_mismatch': true });
    }
}

  submitPurchaseStatus(event: any) {

  }

  /* Attachment */
  viewAttachment() {
    console.log('viewAttachment');
    let filePath = this.editPurchaseData['invoiceAttachment'][0]['attachmentFilePath'];
    filePath = this.commonService.getEncryptPath(filePath);

    let url = `getBase64FromPath?filePath=${filePath}`;
    // this.commonService.viewAttachment(filePath).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      if (res && res['status'] == 'Success' && res['data']) {
        let link = document.createElement('a');
        link.href = `data:application/pdf;base64,${res['data']}`;
        link.download = `download.pdf`;
        link.click();
      } else {
        console.log('viewAttachmenterror');
      }
    }, err => {
      console.log(err);
    })
  }

  deleteAttachment(json: any) {
    console.log('deleteAttachment');
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
  }

  deleteDigitalSignedAttachment(json: any) {
    console.log('deleteDigitalSignedAttachment');
    this.uploadedDigitalSigned.map((item: any, index: any) => {
      if (item['fileName'] == json['fileName']) {
        this.uploadedDigitalSigned.splice(index, 1)
      }
    })
    this.signedAttach.nativeElement.value = null;
  }

  performAction(message: any) {
    this.errorToast = false;
    console.log('performAction');
    if (message == 'Invalid PO Number') {
      this.purchaseForm['controls']['po_number'].setValue('');
      this.resetPurchaseForm();
    } else if (message.includes('Already exist')) {
      this.purchaseForm['controls']['invoice_number'].setValue('');
    }
  }

  structureItems(items: any) {
    console.log('structureItems');

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
    console.log('applyFilter');
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
      console.log(filtered);
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

  ngAfterViewInit() {
    this.currentPage;
  }


  /* poSesSubItems */
  /* ADd SES on check on PO Items */
  getSesItemsForPOItem(row: any) {
    console.log('getSesItemsForPOItem');

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
          netValue: Number(item['netValue']).toFixed(2),
          pckgNo: item['pckgNo'],
          quantity: item['quantity'],
          shortText: item['shortText'],
          subPackageNo: item['subPackageNo'],
          taxCode: item['taxCode'],
          taxCodeTariff: item['taxCodeTariff'],
          grPrice: Number(item['grPrice']).toFixed(2),
          hsnCode: item['taxCodeTariff'],
          poNumber: this.purchaseForm.value.po_number,
          materialNumber: row['materialNumber'],
          plantCode: row['plantCode'],
          purchaseOrderItemNo: row['purchaseOrderItemNo'],
          remQty: item['remQty']
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
    console.log('removeSesItemsForPOItem');

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

  isRemQtyZero(remQty: any): boolean {
    if (remQty === null || remQty === undefined) {
      return false;
    }

    // Convert to string and handle different formats
    const remQtyStr = String(remQty).trim();

    // Check for zero values in different formats
    const isZero = remQtyStr === '0' ||
      remQtyStr === '0.000' ||
      remQtyStr === '0.00' ||
      remQtyStr === '$00.000' ||
      remQtyStr === '$00.00' ||
      remQtyStr === '$0.000' ||
      remQtyStr === '00.000' ||
      remQtyStr === '00.00' ||
      remQtyStr === '-0' ||
      remQtyStr === '-0.000' ||
      remQtyStr === '-0.00' ||
      remQtyStr === '-$00.000' ||
      remQtyStr === '-$00.00' ||
      remQtyStr === '-$0.000';

    // Check for negative values (less than zero)
    let isNegative = false;

    try {
      // Remove currency symbols and convert to number
      const numericValue = parseFloat(remQtyStr.replace(/[$,]/g, ''));
      isNegative = numericValue < 0;
    } catch (error) {
      // If parsing fails, treat as invalid (disable)
      isNegative = false;
    }

    return isZero || isNegative;
  }

  // Add this method to check if all SES items are disabled
  isAllSesItemsDisabled(): boolean {
    if (!this.apisesSubList || this.apisesSubList.length === 0) {
      return true;
    }

    // Check if all items have zero or negative remaining quantity
    return this.apisesSubList.every((item: any) => this.isRemQtyZero(item['remQty']));
  }

  hasInvalidQuantity(item: any): boolean {
    if (this.viewOnly == false) {
      if (!item || item['remQty'] === null || item['remQty'] === undefined) {
        return true;
      }


      const quantity = Number(item['remQty']);
      const availableQty = Number(item['actu_quantity'] || item['remQty']);

      // Check for invalid values: zero, negative, NaN, or exceeding available quantity
      const isInvalid = quantity <= 0 ||
        quantity > availableQty ||
        isNaN(quantity) ||
        !this.isValidNumber(item['remQty']);

      return isInvalid;
    } else {
      return false;
    }
  }

  // Add this method for real-time input validation
 onSesQuantityInput(event: any, item: any): void {
  const inputValue = event.target.value;

  // Update the item quantity immediately for real-time validation
  item['remQty'] = inputValue;

  // Trigger immediate calculation
  this.sesUpdateTotalForItem(item);

  // Optional: You can add immediate validation feedback here
  // For now, we'll rely on the hasInvalidQuantity method for UI updates
}

sesUpdateTotalForItem(item: any): void {
  const enteredQuantity = Number(item['remQty']);
  const rate = Number(item['grPrice']);
  const taxRate = Number(item['taxRate']);

  if (!isNaN(enteredQuantity) && !isNaN(rate) && !isNaN(taxRate)) {
    // Calculate net amount: quantity * rate
    // item['netAmount'] = Number(enteredQuantity * rate).toFixed(2);

    // // Calculate tax: netAmount * taxRate
    // item['tax'] = Number(enteredQuantity * rate * taxRate).toFixed(2);

    // Calculate gross amount: netAmount + tax
    item['grossAmount'] = Number(enteredQuantity * rate).toFixed(2);
    item['quantity'] = String(item['remQty']);
    // Update the totals
    this.sesCalculateTotal();
    this.compareAmount();
  }
}

  /* Select All SES */
  checkAllSesItems(event: any) {
    console.log('checkAllSesItems');

    if (event.target.checked == true) {
      this.selectedSesSubItems = [];
      this.selectedAllSES = true;

      this.sesSubList.forEach((item: any) => {
        // Skip items with zero or negative remaining quantity
        if (!this.isRemQtyZero(item['remQty'])) {
          item.checked = true;
        }
      });

      this.apisesSubList.forEach((item: any) => {
        // Skip items with zero or negative remaining quantity
        if (!this.isRemQtyZero(item['remQty'])) {
          item.checked = true;
          this.selectUnselectSesItem(event, item);
        }
      });
    } else {
      this.selectedAllSES = false;
      this.sesSubList.forEach((item: any) => {
        // Only uncheck items that are not disabled
        if (!this.isRemQtyZero(item['remQty'])) {
          item.checked = false;
        }
      });

      this.apisesSubList.forEach((item: any) => {
        // Only uncheck items that are not disabled
        if (!this.isRemQtyZero(item['remQty'])) {
          item.checked = false;
        }
      });

      this.selectedSesSubItems = [];
    }
  }

  /* Select Single SES */
async selectUnselectSesItem(event: any, row: any) {
    console.log('selectUnselectSesItem');

    if (this.isRemQtyZero(row['remQty'])) {
        event.target.checked = false;
        return;
    }

    if (event?.target?.checked == true) {
        row.checked = true;
        let apiTaxRate: any = await this.getTaxRateForSes(row['taxCodeTariff'], row);

        if (apiTaxRate?.data) {
            row['taxRate'] = apiTaxRate['data'] / 100;
        } else {
            row['taxRate'] = 0;
        }

        // Calculate Remaining Amount = Rate × Remaining Quantity
        const remainingQty = Number(row['remQty']);
        const rate = Number(row['grPrice']);
        const remainingAmount = remainingQty * rate;

        // Start with 0 (no decimal places unless user adds them)
       const actualQuantity = row['quantity'] || row['remQty'] || '0';

    // Calculate initial net amount based on actual quantity
    const initialNetAmount = (Number(actualQuantity) * rate).toString();

        this.selectedSesSubItems.push({
            "extLineNo": row['extLineNo'],
            "netValue": row['netValue'],
            "grPrice": row['grPrice'],
            "pckgNo": row['pckgNo'],
            "actu_quantity": row['remQty'],
            "remQty": row['remQty'],
            "quantity": actualQuantity,
            "subPackageNo": row['subPackageNo'],
            "taxCode": row['taxCode'],
            "taxCodeTariff": row['taxCodeTariff'],
            "poNumber": row['poNumber'],
            "purchaseOrderItemNo": row['purchaseOrderItemNo'],
            "taxRate": row['taxRate'],
            "netAmount": initialNetAmount,
            "grossAmount": initialNetAmount,
            "remainingAmount": remainingAmount.toFixed(2), // Format currency with 2 decimals
            "maxNetAmount": remainingAmount,
            "netAmountError": false
        });

        let status = this.apisesSubList.every((item: any) => {
            return item['checked'] == true || this.isRemQtyZero(item['remQty']);
        })

        if (status) {
            this.selectedAllSES = true;
        }
    } else {
        row.checked = false;
        if (this.selectedSesSubItems.length > 0) {
            this.selectedSesSubItems = this.selectedSesSubItems.filter((item: any) =>
                item['extLineNo'] != row['extLineNo']
            );
        }
        this.selectedAllSES = false;
    }

    this.sesCalculateTotal();
    this.compareAmount();
}

  addRemoveItemsDataArrSes(event: any, row: any) {
    console.log('addRemoveItemsDataArr');
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
      this.getSesItemsForPOItem(row);
      this.selectedItemsDataArr.push({
        purchaseOrderItemNo: row['purchaseOrderItemNo'],
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
    }
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
      console.log('catch');
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
  console.log('calculateTotal');
  this.sesTotalNetAmount = 0;
  this.sesTotalGrossAmount = 0;
  this.totalRemainingAmount = 0;
  this.totalAvailableAfter = 0;

  this.selectedSesSubItems.map((item: any) => {
    // Calculate remaining amount if not set
    if (!item['remainingAmount'] || item['remainingAmount'] === 'NaN') {
      const remQty = Number(item['remQty'] || item['actu_quantity'] || 0);
      const rate = Number(item['grPrice'] || 0);
      item['remainingAmount'] = (remQty * rate).toFixed(2);
      item['maxNetAmount'] = remQty * rate;
    }

    const itemNetAmount = item['netAmount'] ? Number(item['netAmount']) : Number(item['netValue'] || 0);
    const itemGrossAmount = item['grossAmount'] ? Number(item['grossAmount']) : itemNetAmount;
    const itemRemainingAmount = item['remainingAmount'] ? Number(item['remainingAmount']) : 0;
    const itemAvailableAfter = item['availableAfter'] ? Number(item['availableAfter']) : 0;

    // Format totals with 2 decimal places for display
    this.sesTotalNetAmount = Number(Number(this.sesTotalNetAmount) + itemNetAmount).toFixed(2);
    this.sesTotalGrossAmount = Number(Number(this.sesTotalGrossAmount) + itemGrossAmount).toFixed(2);
    this.totalRemainingAmount = Number(Number(this.totalRemainingAmount) + itemRemainingAmount);
    this.totalAvailableAfter = Number(Number(this.totalAvailableAfter) + itemAvailableAfter);
  });

  // Only set the value in the form control if not in view mode
  if (!this.viewOnly) {
    this.purchaseForm['controls']['invoice_amount_line']?.setValue(this.sesTotalGrossAmount);
  }
}


  sesUpdateTotal(event?: any, field?: any, row?: any) {
    console.log('sesupdateTotal');

    const value = event.target.value;

   if (field === 'remQty') { // Changed from 'quantity' to 'remQty' to match your template
    const quantity = Number(value);
    const availableQty = Number(row['actu_quantity'] || row['remQty']);

    // Validate the quantity - consolidated validation
    if (quantity <= 0 || quantity > availableQty || isNaN(quantity) || !this.isValidNumber(value)) {
      // Add to wrong input array if not already there
      if (this.wrongInputArray.indexOf(row.extLineNo) === -1) {
        this.wrongInputArray.push(row.extLineNo);
      }
      // Show error message
      event.currentTarget.nextElementSibling.classList.remove('hide');
      event.currentTarget.nextElementSibling.classList.add('show');
      return; // Don't proceed with calculation
    } else {
      // Remove from wrong input array if valid
      const index = this.wrongInputArray.indexOf(row.extLineNo);
      if (index > -1) {
        this.wrongInputArray.splice(index, 1);
      }
      // Hide error message
      event.currentTarget.nextElementSibling.classList.remove('show');
      event.currentTarget.nextElementSibling.classList.add('hide');
    }

    // Update the quantity and recalculate amounts
    this.selectedSesSubItems.forEach((item: any) => {
      if (item['extLineNo'] == row['extLineNo'] && item['pckgNo'] == row['pckgNo']) {
        // Update the quantity with the manually entered value
        item['remQty'] = String(value);
        item['quantity'] = String(value);

        // Calculate based on the manually entered quantity and the rate (grPrice)
       this.sesUpdateTotalForItem(item);
      }
    });
  }

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
        console.log(res);

        if (res && res['status'] && res['status'] == 'Success') {
          this.selectedSesSubItems.forEach((item: any) => {
            if (item['extLineNo'] == row['extLineNo']) {
              item['hsnCode'] = event.target.value;
              item['taxCodeTariff'] = event.target.value;
              item['taxRate'] = res['data'] ? Number(res['data'] / 100) : '';
              row['tax'] = Number(Number(row['netValue']) * Number(row['taxRate'])).toFixed(2);
              row['grossAmount'] = Number(Number(row['netValue'])).toFixed(2);
            }
          })
          this.sesCalculateTotal();
          this.compareAmount();

          if (this.blankHsnCodeArray.indexOf(row['extLineNo']) > -1) {
            this.blankHsnCodeArray.splice(this.blankHsnCodeArray.indexOf(row['extLineNo']), 1);
          }

          eve_re.target.nextElementSibling.classList.remove("show");
          eve_re.target.nextElementSibling.classList.add("hide");
        } else {
          eve_re.target.nextElementSibling.classList.remove("hide");
          eve_re.target.nextElementSibling.classList.add("show");
          if (this.blankHsnCodeArray.indexOf(row['extLineNo']) == -1) {
            this.blankHsnCodeArray.push(row['extLineNo']);
          }
        }
      }, err => {
        console.log(err);
        eve_re.target.nextElementSibling.classList.remove("hide");
        eve_re.target.nextElementSibling.classList.add("show");
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
      // For other fields (netAmount, etc.)
      let value = event.target.value ? (event.target.value != 0 ? event.target.value : 0) : 1;
      let regExp = new RegExp(/^(?!$)\d{0,10}(?:\.\d{1,3})?$/);
      let test = regExp.test(value);

      if (test == false) {
        if (this.wrongInputArray.indexOf(row.extLineNo) == -1) {
          this.wrongInputArray.push(row.extLineNo);
        }
        event.target.nextElementSibling.classList.remove('hide');
        event.target.nextElementSibling.classList.add('show');
        return;
      } else {
        if (this.wrongInputArray.indexOf(row.extLineNo) > -1) {
          this.wrongInputArray.splice(this.wrongInputArray.indexOf(row.extLineNo), 1);
        }
        event.target.nextElementSibling.classList.remove('show');
        event.target.nextElementSibling.classList.add('hide');
      }

      value = Number(value);
      this.selectedSesSubItems.forEach((item: any) => {
        if (item['extLineNo'] == row['extLineNo'] && item['pckgNo'] == row['pckgNo']) {
          item[field] = value;
          if (field == 'netAmount') {
            item['netAmount'] = Number(Number(value)).toFixed(2);
            item['tax'] = Number(Number(value) * Number(item['taxRate'])).toFixed(2);
            item['grossAmount'] = Number(Number(value)).toFixed(2);
          } else if (field == 'quantity') {
            item['tax'] = Number(Number(value) * Number(item['grPrice']) * Number(item['taxRate'])).toFixed(2);
            item['grossAmount'] = Number(Number(value) * Number(item['grPrice'])).toFixed(2);
          }
        }
      });
    }

    this.sesCalculateTotal();
    this.compareAmount();
    this.selectedSesSubItems = [...this.selectedSesSubItems];
  }

  // Add this helper method if you don't have it
  isValidNumber(value: any): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    const num = Number(value);
    return !isNaN(num) && isFinite(num) && value.toString().trim() !== '';
  }

  hasInvalidSesQuantities(): boolean {
    if (!this.selectedSesSubItems || this.selectedSesSubItems.length === 0) {
      return false;
    }

    // Check if any selected SES item has invalid quantity
    return this.selectedSesSubItems.some((item: any) => this.hasInvalidQuantity(item));
  }

  searchList(event: any) {
    console.log('searchList');
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
          if ((item['materialNumber'] + ' ' + item['itemDescription'] + ' ' + item['purchaseOrderItemNo']).toLocaleLowerCase().includes(element.trim().toLocaleLowerCase())) {
            filtered.push(item);
          }
        })
      })
      console.log(filtered);
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

// In ServiceVendorComponent
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

  // Add this method inside your ServiceVendorComponent class
checkRCMOnSAC(poData: any) {
  if(!this.viewOnly === true){
  const url = `getSacCodes`;
  this.commonService.dataGetMasterRCM(url).subscribe((sacRes: any) => {
    let sacCodes: string[] = [];
    if (sacRes && sacRes['status'] === 'Success' && Array.isArray(sacRes['data'])) {
      sacCodes = sacRes['data'].map((item: any) => item.sacCode);
    }

    let poSesSubItems = poData['poSesSubItems'] || [];
    let matchFound = false;

    for (let sesItem of poSesSubItems) {
      if (sacCodes.includes(sesItem.taxCodeTariff)) {
        matchFound = true;
        break;
      }
    }

    this.RCMsacCode = matchFound;

    // Get Supplier GST
    const supplierGST = this.userdata.GST || this.purchaseForm['controls']['supp_gst_no'].value;

    if (this.RCMsacCode || !supplierGST || supplierGST === '' || supplierGST === null || supplierGST === undefined) {
      // Clear validators for Child GST and Supplier GST
      this.purchaseForm['controls']['child_gst'].clearValidators();
      this.purchaseForm['controls']['child_gst'].updateValueAndValidity();

      this.purchaseForm['controls']['supp_gst_no'].clearValidators();
      this.purchaseForm['controls']['supp_gst_no'].updateValueAndValidity();

      this.showFCMRCMModal = true;
      this.errorModalMessage = 'Is Reverse Charge Mechanism (RCM) applicable for this invoice?';
    }
  }, err => {
    console.log('Error checking SAC codes:', err);
  });
}
}

}
