import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { CommonService } from 'src/app/services/common.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';
// import { lastValueFrom, Observable, forkJoin } from 'rxjs';
// import { toWords } from 'number-to-words';
import { NumberToWordsService } from 'src/app/services/number-to-words.service';
import { AllMaterService } from 'src/app/services/all-mater.service';


@Component({
  selector: 'conditional-vendor-invoice',
  templateUrl: './conditional-vendor.component.html',
  styleUrls: ['./conditional-vendor.component.scss']
})
export class ConditionalVendorComponent {

  barcodeValue = '';
  currentDate = moment(new Date).format("YYYY-MM-DD");
  conditionalForm: any;
  allForm: any;
  submissionArr: any = [];
  poNumber: any;
  invoiceType: any;

  // dynamicSearchForm: any;
  dynamicFilterForm: any;
  toastMsg: any = '';
  errorToast: any = false;
  successToast: any = false;

  selectedSupportingDocument: any;
  selectedAllAttachment: any = [];
  selectedAllAttachmentSupport: any = [];

  items: any[] = [];
  apipoGrnDetails: any = [];
  poGrnDetails: any = [];
  filterGrnDetails: any = [];
  childGSTArr: any = [];

  // logintype:any;
  username: any;
  selectedAll = false;
  // selectedItemsArr :any = [];
  // selectedItemsDataArr :any = [];
  selectedGRNArr: any = [];
  grn_arrr: any = [];
  userdata: any;
  // contractNoExist = false;
  totalGRNQuantity = 0;
  totalGRNAmount: any = 0;

  pages: number[] = [];
  totalPages: number = 0;
  currentPage: number = 1
  itemsPerPage: number = 10;
  totalItems: number = 0;
  visiblePages: number[] = [];

  enableUploadDigital = false;
  uploadedDigitalSigned: any = [];
  refNotFoundArr: any = [];

  poDetail: any;
  poResponseJson: any;
  createdConditionData: any = []
  selectedCreatedCondition: any;
  selectedConditionData: any = [];
  childVendorCode: any;
  viewConditional = false;

  vendorArray: any = [];
  poArray: any = [];
  poItemArray: any = [];
  quantityArray: any = ['Challan', 'Actual', 'GRN', 'Lesser'];
  condDescArray: any = [];
  isALLInvoice = false;

  pdfChildData: any = {};
  pdfAllData: any = {};
  plantCodeArr: any = [];
  stateDetailsArr: any = [];
  allPDFBase64: any = []
  childPDFBase64: any = []
  printAllCopy: boolean = false;
  printChildCopy: boolean = false;
  mergeChildAndSupportPDF: any = [];
  mergeALLAndSupportPDF: any = [];
  allPoNumber: any = '';
  apiBilltoData: any = {}
  qrCodeImageUrl: any = '';
  actualPOVendor: any;
  ALLVendor: any;

  submitStatus: any = {};
  vendorBasicData: any = {};
  plantFIJson: any;
  allPOAPIRes: any;
  allPOArray: any = [];
  allPOLineItemArray: any = [];
  selectedALLPO: any = {};
  allAndGRNRateMatched = false;
  invoiceNoExist = false;
  roleName:String = ''
  @ViewChild('invoice') 'invoice': ElementRef;
  @ViewChild('suppportinvoice') 'suppportinvoice': ElementRef;
  @ViewChild('signedAttach') 'signedAttach': ElementRef;
  @ViewChild('uploadExcel') 'uploadExcel': ElementRef;
  @ViewChild('content') 'content': ElementRef;
  @ViewChild('page1') 'page1': ElementRef;
  @ViewChild('page2') 'page2': ElementRef;
  materialPoNumber: any;
  allRate: any;
  aaaRate: any;
  poDetailsData: any;
  materialPoNumberData: any;
  aaarateData: any;
  totalGRNAmountALL: any = 0;
  totalGRNAmountAAA: any =0 ;
  rateUser:any;

  constructor(private breadcrumbService: BreadcrumbService, private commonService: CommonService, private allService: AllMaterService ,private router: Router, public numberToWordsService: NumberToWordsService) {
    // console.log(125678.89, this.numberToWordsService.convertToWords(125678.89))
    this.userdata = JSON.parse(localStorage.getItem('userdata') || '');
    this.username = localStorage.getItem('username');
    this.roleName = this.userdata.ROLE;
    this.breadcrumbService.setBreadcrumbUrl();
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
    this.viewConditional = this.commonService.viewPurchase;
    this.pdfChildData['self'] = this.userdata;
  }

  ngOnInit(): void {
    this.getVendorsList();
    this.loadConditionalForm();
    this.loadAllForm();
    this.loadDynamicFilterForm();
    // this.getAllCondtionData();
    // this.getPlantDetails();
    this.getStateDetails();
    // this.getOpenServiceALLPO();
    // this.genearteFIEntryJson();
    if (this.viewConditional == true) {
      this.getChildGST();
      this.getViewConditionalDataGRNDetails(this.commonService.editPurchaseData.History.poInvoiceID)
      this.conditionalForm.disable();
      this.allForm.disable();
      this.selectedAll = true;
    } else {
      // this.poResponseJson = JSON.parse(localStorage.getItem('poResponseJson') || '');
      // this.poNumber = localStorage.getItem('poNumber');
      this.invoiceType = localStorage.getItem('invoice_type');
      this.getCreatedCondition();
      this.disableField();
      // this.getConditionalVendorData();
      // this.getSubmissionTo(this.poResponseJson['poItems'][0]['plantCode'], this.poResponseJson['poItems'][0]['preqNo']);
      // this.getChildGST();
    }

    /* this.poGrnDetails = this.apipoGrnDetails;
    this.totalPages = Math.ceil(this.poGrnDetails.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages();
    this.updatePagedData(); */
    // this.updatePagination();
  }

  loadDynamicFilterForm() {
    this.dynamicFilterForm = new FormGroup({
      'ref_number': new FormControl(''),
    })
  }

  resetconditionalForm() {
    console.log('resetconditionalForm',this.conditionalForm);
    // this.commonService.routeToPage(['./dashboard/freight-inbound/invoice']);
    this.loadConditionalForm();
    this.poGrnDetails = [];
    this.apipoGrnDetails = [];
    this.resetField();
    this.enableUploadDigital = false;
    this.suppportinvoice.nativeElement.value = null;
    this.signedAttach.nativeElement.value = null;
    this.uploadedDigitalSigned = []; this.mergeALLAndSupportPDF = []; this.selectedAllAttachmentSupport = []; this.selectedSupportingDocument = [];
  }

  resetField() {
    console.log('resetField');
    this.selectedAll = false;
    this.selectedGRNArr = [];
    this.quantityArray = [];
    this.poGrnDetails = [];
    this.allPoNumber = '';
    this.totalGRNAmount = 0;
    this.totalGRNQuantity = 0;

    this.uploadedDigitalSigned = []; this.mergeALLAndSupportPDF = []; this.childPDFBase64 = [];

    this.conditionalForm.controls['quantity_type'].setValue('');
    this.conditionalForm.controls['invoice_number'].setValue('');
    this.conditionalForm.controls['invoice_amount'].setValue('');
    this.conditionalForm.controls['payment_mode'].setValue('');
    this.conditionalForm.controls['supp_gst_no'].setValue('');
    this.conditionalForm.controls['child_gst'].setValue('');
    this.conditionalForm.controls['rece_gst_no'].setValue('');
    this.conditionalForm.controls['attach'].setValue('');
    this.conditionalForm.controls['attach_data'].setValue('');
    this.conditionalForm.controls['attach_data_supp'].setValue('');
  }

  loadConditionalForm() {
    this.conditionalForm = new FormGroup({
      invoice_type: new FormControl('', [Validators.required]),
      plant_code: new FormControl('', [Validators.required]),
      po_number: new FormControl('', [Validators.required]),
      po_item_no: new FormControl('', [Validators.required]),
      condition_type: new FormControl('', [Validators.required]),
      quantity_type: new FormControl('', [Validators.required]),
      invoice_date: new FormControl('', [Validators.required]),
      invoice_number: new FormControl('', [Validators.required, Validators.maxLength(16), Validators.pattern(/^[a-zA-Z0-9\-\/]*$/)])  /* Validators.pattern("^[a-zA-Z0-9-/]{1,16}$") */,
      invoice_amount: new FormControl('', [Validators.required]),
      invoice_quantity: new FormControl('', [Validators.required]),
      payment_mode: new FormControl('', [Validators.required]),
      all_gst_no: new FormControl('', [Validators.required]),
      supp_gst_no: new FormControl('', [Validators.required]),
      child_gst: new FormControl('', [Validators.required]),
      rece_gst_no: new FormControl(''),
      attach: new FormControl('', [Validators.required]),
      attach_data: new FormControl('', [Validators.required]),
      attach_data_supp: new FormControl('', [Validators.required]),
      // grn_arr: new FormControl('', [Validators.required]),
    })

    this.conditionalForm['controls']['invoice_amount'].disable();
    this.conditionalForm['controls']['invoice_quantity'].disable();
    this.conditionalForm['controls']['supp_gst_no'].disable();
    this.conditionalForm['controls']['rece_gst_no'].disable();

    setTimeout(() => {
      this.conditionalForm['controls']['invoice_date'].setValue(moment(new Date()).format('YYYY-MM-DD'));
      this.conditionalForm['controls']['invoice_type'].setValue('Freight-Inbound');
    }, 0);
  }


  allowInvoiceChars(event: KeyboardEvent): boolean {
    const allowedChars = /^[a-zA-Z0-9\-\/]$/;
    const key = event.key;
    return allowedChars.test(key);
  }

  loadAllForm() {
    this.allForm = new FormGroup({
      po_number: new FormControl('', [Validators.required]),
      po_item_no: new FormControl('', [Validators.required]),
      rate: new FormControl('', [Validators.required]),
      remain_qty: new FormControl('', [Validators.required]),
      validity_date: new FormControl('', [Validators.required]),
    })

    setTimeout(() => {
      this.allForm['controls']['rate'].disable();
      this.allForm['controls']['remain_qty'].disable();
      this.allForm['controls']['validity_date'].disable();
    }, 0);
  }

  disableField() {
    /* this.conditionalForm.controls.po_item_no.disable();
    this.conditionalForm.controls.condition_type.disable(); */
    this.conditionalForm.controls.quantity_type.disable();
    this.conditionalForm.controls.po_item_no.setValue('');
    this.conditionalForm.controls.quantity_type.setValue('');
    this.conditionalForm.controls.condition_type.setValue('');
    this.poItemArray = []; this.condDescArray = []; this.poGrnDetails = [];
    this.currentPage = 1;
  }


  selectedPlantCode(event: any) {
    console.log('selectedPlantCode');

    this.resetField();
    this.getFIEntryFromPlantCode();
    this.conditionalForm.controls['po_number'].setValue('');
    this.conditionalForm.controls['po_item_no'].setValue('');
    this.conditionalForm.controls['condition_type'].setValue('');

    /* this.conditionalForm.reset({
      po_number: '', // Reset select control to its default value
      po_item_no: '',
    }); */

    this.poArray = [];
    this.actualPOVendor = '';
    this.createdConditionData.map((item: any) => {
      if (this.poArray.indexOf(item.poNumber) == -1 && item['plantCode'] == event.target.value && item['status'] != 'submitted') {
        this.poArray.push(item.poNumber)
      }
      if (this.poArray.length > 0) {
        this.conditionalForm.controls.po_number.enable()
      } else {
        this.conditionalForm.controls.po_number.disable()
      }
      setTimeout(() => {
        this.conditionalForm.controls['po_number'].setValue('');
      }, 0);
    })

    // this.getAllCondtionData(event.target.value);
  }

  getAllCondtionData(plant_code?: any) {
    console.log('getPOList');

    let url = 'getCondVendorDetail';
    let json = {
      "vendorCode": this.userdata['ACCOUNTNUMBER'],
      "poNumber": '',
      "plantCode": plant_code
      // "plantCode" : 'NE03'
    }

    this.commonService.spinner.show();
    this.conditionalForm.controls.po_number.setValue('');

    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      // this.conditionalForm.controls.po_number.enable();
      this.commonService.spinner.hide();
      this.poResponseJson = res;
    }, err => {
      this.commonService.spinner.hide();
      console.log(err);
    })
  }

  getCreatedCondition() {
    console.log('getCreatedCondition');

    let url = `getConditionRequestDetails?vendorNumber=${this.userdata.ACCOUNTNUMBER}`;
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);

      if (res && res['status'] == 'Success' && res.data.length > 0) {
        // this.createdConditionData = res['data'];
        this.createdConditionData = res['data'].filter((item: any) => {
          // return item.status != 'submitted'
          return item.status == null
        })
        res['data'].map((item: any) => {
          // if(this.poArray.indexOf(item.poNumber)==-1){
          if (this.plantCodeArr.indexOf(item.plantCode) == -1 && item['status'] != 'submitted') {
            this.plantCodeArr.push(item.plantCode)
          }
          /* if(this.poArray.indexOf(item.poNumber)==-1 && item['status']!='submitted'){
            this.poArray.push(item.poNumber)
          } */
          if (this.poArray.length > 0) {
            this.conditionalForm.controls.po_number.enable()
          } else {
            this.conditionalForm.controls.po_number.disable()
          }
        })
      } else {
        this.poArray = [];
      }
    }, err => {
      console.log(err);
    })
  }

  getStateDetails() {
    console.log('getStateDetails');

    let url = `getStateDetails`;
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      if (res?.status == 'Success' && res['data'].length > 0) {
        this.stateDetailsArr = res['data'];
      } else {
        this.stateDetailsArr = []
      }
    }, err => {
      console.log(err);

    })
  }

  getPlantDetails() {
    console.log('getPlantDetails');

    let url = `getPlantDetails`;

    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      if (res && res['status'] == 'Success' && res['data'].length > 0) {
        this.plantCodeArr = res['data'];
      }
    }, err => {
      console.log(err);
    })
  }

getPOItemList(event: any) {
    const selectedPoNumber = event.target.value; // Get the selected PO number

    this.conditionalForm.controls['po_item_no'].setValue('');
    this.conditionalForm.controls['condition_type'].setValue('');
    this.resetField();
    this.disableField();
    this.conditionalForm.controls['po_item_no'].setValue('choose');
  this.conditionalForm.controls['condition_type'].setValue('choose');
  this.poItemArray = [];
  this.selectedGRNArr = [];
  this.poGrnDetails = [];
  this.filterGrnDetails = [];

    // Filter and get unique PO items for the selected PO number
    this.createdConditionData.map((item: any) => {
      if (item.poNumber == selectedPoNumber && this.poItemArray.indexOf(item.poItemNo) == -1) {
        this.poItemArray.push(item.poItemNo); // Push poItemNo, not poNumber
      }
    });

    // Set the selected PO number to poDetailsData
    this.poDetailsData = selectedPoNumber;

    // Call getPoItemsRates without specific PO item (will use all items for this PO)
    this.getPoItemsRates();
     this.filterGrnDetails.forEach((item: any) => {
              const rateToUse = this.isValidRate(this.allRate) ? this.allRate : item['rate'];
          item['amount'] = Number(Number(item['quantity']) * Number(rateToUse)).toFixed(2);
           item['amountALL'] = Number(Number(item['quantity']) * Number(rateToUse)).toFixed(2);
          item['amountAAA'] = Number(Number(item['quantity']) * Number(this.aaaRate || item['rate'])).toFixed(2);

          this.selectedGRNArr.push(item);
        });
              this.totalGRNQuantity = 0;
      this.totalGRNAmount = 0;
      this.selectedGRNArr.map((item: any) => {
        this.totalGRNQuantity = this.totalGRNQuantity + Number(item['quantity'])
        this.totalGRNAmount = this.totalGRNAmount + Number(item['amount']);
        this.totalGRNAmountALL = Number(Number(this.totalGRNAmountALL) + Number(item['amountALL'])).toFixed(2);
        this.totalGRNAmountAAA = Number(Number(this.totalGRNAmountAAA) + Number(item['amountAAA'])).toFixed(2);
      })
      this.totalGRNAmount = Number(this.totalGRNAmount).toFixed(2);
      this.compareAmount();
      this.compareGRNSES();
}

getPoItemsRates(selectedPoItem?: string) {
  // Get the selected PO item from parameter or form
  const selectedPoItemToUse = selectedPoItem || this.conditionalForm.value.po_item_no;

  let json = {
    "childVendorCode": [this.userdata.ACCOUNTNUMBER],
    "poNumber": this.poDetailsData, // This will now have the selected PO number
  }

  this.commonService.spinner.show();
  this.selectedCreatedCondition?.['poGrnData'].forEach((item: any) =>{
    this.rateUser = item['rate'];
  });

  this.allService.getPoItemsRates(json).subscribe((res: any) => {
    if (res?.status === 'Success' && Array.isArray(res?.data)) {

      // Filter the response by selected PO item
      let filteredRates = res.data;
      if (selectedPoItemToUse && selectedPoItemToUse !== 'choose') {
        filteredRates = res.data.filter((rate: any) => rate.poItem === selectedPoItemToUse);
      }

      // If we have filtered results, use the first one
      if (filteredRates.length > 0) {
        const AllRate = filteredRates[0];
        // Use isValidRate method to properly check for valid rates
        if (this.isValidRate(AllRate.allrate)) {
          this.allRate = AllRate.allrate;
        } else {
          this.allRate = AllRate.aaarate || this.rateUser;
        }
        if (this.isValidRate(AllRate.aaarate)) {
          this.aaaRate = AllRate.aaarate;
        } else {
          this.aaaRate = this.rateUser || null;
        }

        console.log('Updated rates for PO Item', selectedPoItemToUse, '- allRate:', this.allRate, 'aaaRate:', this.aaaRate);
      } else {
        // No matching PO item found, use fallback
        this.setFallbackRates();
        console.log('No rates found for PO Item:', selectedPoItemToUse);
      }
    } else {
      // API returned success but no data or invalid response
      this.setFallbackRates();
    }
    this.commonService.spinner.hide();

  }, (err: any) => {
    this.commonService.spinner.hide();
    // API failed completely - use fallback rates
    this.setFallbackRates();
    console.error('API call failed, using fallback rates:', err);
  });

}

// Add this method to handle fallback rates
setFallbackRates() {
  this.allRate = this.rateUser;
  this.aaaRate = this.rateUser;
  // Also update the GRN items with the fallback rates
  this.updateGRNItemsWithFallbackRates();

  console.log('Using fallback rates - allRate:', this.allRate, 'aaaRate:', this.aaaRate);
}

// Add this method to update GRN items with fallback rates
updateGRNItemsWithFallbackRates() {
  if (this.selectedGRNArr.length > 0) {
    this.selectedGRNArr = this.selectedGRNArr.map((item: any) => ({
      ...item,
      rate: this.rateUser,
      amount: Number(Number(item['quantity']) * Number(this.rateUser)).toFixed(2)
    }));

    // Recalculate total amounts
    this.recalculateTotalAmounts();
  }

  // Also update the displayed GRN items in the table
  if (this.poGrnDetails.length > 0) {
    this.poGrnDetails = this.poGrnDetails.map((item: any) => ({
      ...item,
      rate: this.rateUser,
      amount: Number(Number(item['quantity']) * Number(this.rateUser)).toFixed(2)
    }));
  }

  if (this.filterGrnDetails.length > 0) {
    this.filterGrnDetails = this.filterGrnDetails.map((item: any) => ({
      ...item,
      rate: this.rateUser,
      amount: Number(Number(item['quantity']) * Number(this.rateUser)).toFixed(2)
    }));
  }
}

// Add this helper method to recalculate totals
recalculateTotalAmounts() {
  this.totalGRNAmount = 0;
  this.totalGRNQuantity = 0;
  this.totalGRNAmountALL = 0;
  this.totalGRNAmountAAA = 0;

  this.selectedGRNArr.forEach((item: any) => {
    this.totalGRNQuantity = Number(this.totalGRNQuantity) + Number(item['quantity']);
    this.totalGRNAmount = Number(Number(this.totalGRNAmount) + Number(item['amount'])).toFixed(2);
    this.totalGRNAmountALL = Number(Number(this.totalGRNAmountALL) + Number(item['amountALL'] || item['amount'])).toFixed(2);
    this.totalGRNAmountAAA = Number(Number(this.totalGRNAmountAAA) + Number(item['amountAAA'] || item['amount'])).toFixed(2);
  });

  // Update form controls
  this.conditionalForm['controls']['invoice_amount'].setValue(this.totalGRNAmount);
  this.conditionalForm['controls']['invoice_quantity'].setValue(this.totalGRNQuantity);
}

  getPOConditionType(event: any) {
    console.log('getPOCondiType');
        const selectedPoItem = event.target.value;

    this.conditionalForm.controls['condition_type'].setValue('');
    this.resetField();
    this.condDescArray = [];
    this.createdConditionData.map((item: any) => {
      if (this.condDescArray.indexOf(item.conditionType) == -1 && item.poItemNo == event.target.value && item.poNumber == this.conditionalForm.value.po_number) {
        this.condDescArray.push(item.conditionType);
        this.materialPoNumberData = item.conditionType;
      }
    })
    this.conditionalForm.controls.condition_type.setValue(this.condDescArray[0])
        this.getPoItemsRates(selectedPoItem);
    // }

    // getselectedConditionData(event:any){}

    // getPOConditionQuantity(event:any){
    // console.log('getPOConditionQuantity');

    this.resetField();
    this.conditionalForm.controls.quantity_type.enable();
    this.conditionalForm.controls.quantity_type.setValue('');
    this.createdConditionData.map((item: any) => {
      // if(this.quantityArray.indexOf(item.quantityType)==-1 && item.conditionType==event.target.value && item.poItemNo==this.conditionalForm.value.po_item_no && item.poNumber==this.conditionalForm.value.po_number){
      if (this.quantityArray.indexOf(item.quantityType) == -1 && item.conditionType == this.conditionalForm.value.condition_type && item.poItemNo == this.conditionalForm.value.po_item_no && item.poNumber == this.conditionalForm.value.po_number) {
        this.quantityArray.push(item.quantityType);
      }
    })
    this.conditionalForm.controls.quantity_type.setValue(this.quantityArray[0]);
    /* }
    getselectedConditionData(event:any){
      console.log('getselectedConditionData'); */

    this.isALLInvoice = false; //false
    this.selectedGRNArr = [];
    this.poGrnDetails = [];
    let formdata = this.conditionalForm.value;
    let arr: any = [];
    /* this.poResponseJson.map((item:any)=>{
      if(item.poNumber==formdata['po_number'] && item.purchaseOrderItemNo==formdata['po_item_no'] && item.conditionDescription==formdata['condition_type'] && item.status!='submitted'){
        arr.push(
          {
            poNumber: item.poNumber,
            documentDate: item.date,
            refInvoiceNumber: item.refrenceDocNo,
            purchaseOrderNumber: item.poNumber,
            purchaseOrderItemNo: item.purchaseOrderItemNo,
            materialDocumentFiscalYear: '-',
            materialDocumentNumber: item.materialDocumentNumber,
            materialDocumentItemNumber: item.materialDocumentItemNumber,
            lrNo: item['lrNo']?item['lrNo']:'-',
            lrDate: item['lrDate']?item['lrDate']:'-',
            truckId: item['truckId']?item['truckId']:'-',
            doNumber: item['doNumber']?item['doNumber']:'-',
            docNumber: item['docNumber']?item['docNumber']:'-',
            materialNumber: '-',
            materialDescription: '-',
            plantCode: '-',
            challanQty: item.challanQty,
            actualQty: item.actualQty,
            lesserQty: item.lesserQty,
            grnquantity: item.quantity,
            // quantity: this.conditionalForm.value.quantity_type=='Challan'?item['challanQty']:this.conditionalForm.value.quantity_type=='Actual'?item['actualQty']:item['quantity'],
            quantity: this.returnPOItemQnty(item),
            vendorCode: item.vendorCode,
            conditionType: item.conditionType,
            conditionDescription: item.conditionDescription,
            amount: item.amount,
            checked : false,
            quantityType: this.conditionalForm.value.quantity_type,
            parentVendorCode: item.parentVendorCode,
            materialDes: item['materialDes'],
            challanNo: item['challanNo']?item['challanNo']:'-',
            challanDate: item['challanDate']?item['challanDate']:'-',
            igpNo: item['igpNo']?item['igpNo']:'-'
            // childVendorCode: item.childVendorCode?item.childVendorCode:''
          }
        )
      }
    }) */
    // arr[0].childVendorCode = '0918048617';
    if (arr.length == 0) {
      arr = this.getGrnDataFromConditionList();
    }
    // if(arr[0].vendorCode && arr[0].parentVendorCode && arr[0].vendorCode != arr[0].parentVendorCode){
    if (arr[0].childVendorCode && arr[0].parentVendorCode && arr[0].childVendorCode != arr[0].parentVendorCode) {
      this.isALLInvoice = true;
      this.conditionalForm['controls']['attach'].clearValidators();
      this.conditionalForm['controls']['attach'].updateValueAndValidity();
      this.conditionalForm['controls']['attach_data'].clearValidators();
      this.conditionalForm['controls']['attach_data'].updateValueAndValidity();
      this.conditionalForm['controls']['attach_data_supp'].clearValidators();
      this.conditionalForm['controls']['attach_data_supp'].updateValueAndValidity();
      this.getBillToDetails();
    }
    if(this.roleName === 'AAA_T'){
      this.isALLInvoice = false;
      this.conditionalForm['controls']['attach'].clearValidators();
      this.conditionalForm['controls']['attach'].updateValueAndValidity();
      this.conditionalForm['controls']['attach_data'].clearValidators();
      this.conditionalForm['controls']['attach_data'].updateValueAndValidity();
      this.conditionalForm['controls']['attach_data_supp'].clearValidators();
      this.conditionalForm['controls']['attach_data_supp'].updateValueAndValidity();
      this.getBillToDetails();
    }

    this.apipoGrnDetails = arr;
    this.poGrnDetails = arr;
    this.filterGrnDetails = arr;
    this.totalPages = Math.ceil(this.poGrnDetails.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages();
    this.updatePagedData();

    this.conditionalForm['controls']['supp_gst_no'].setValue(this.userdata.GST ? this.userdata.GST : '');
    this.conditionalForm['controls']['payment_mode'].setValue('rtgs');
    // this.getPODetail();
    this.getChildGST();
    this.getPoItemsRates();
  }

  returnPOItemQnty(item: any) {
    let type = this.conditionalForm.value.quantity_type;
    let qnt;
    switch (type) {
      case 'Challan':
        qnt = item['challanQty'];
        break;
      case 'Actual':
        qnt = item['actualQty'];
        break;
      case 'GRN':
        qnt = item['grnQty'];
        break;
      case 'Lesser':
        qnt = item['lesserQty'];
        // qnt = Math.min(Number(item['challanQty']), Number(item['actualQty']), Number(item['grnQty']));
        break;
    }
    return qnt;
  }

  getGrnDataFromConditionList() {
    let formdata = this.conditionalForm.value;
    let arr1 = this.createdConditionData.find((ele: any) => {
      return ele['plantCode'] == formdata['plant_code'] && ele['poNumber'] == formdata['po_number'] && ele['poItemNo'] == formdata['po_item_no'] && ele['conditionType'] == formdata['condition_type'] && ele['quantityType'] == formdata['quantity_type'] && ele['status'] != 'submitted'
    })
    this.selectedCreatedCondition = arr1;
    this.actualPOVendor = JSON.parse(this.selectedCreatedCondition.actualPOVendor.replace(/\\/g, ''));
    this.ALLVendor = this.vendorArray.find((item: any) => {
      return item['vendorNumber'] == this.selectedCreatedCondition['parentVendorNo']
    })
    // arr1['poGrnData'] = arr1['poGrnData'].forEach(item=>{})

    arr1['poGrnData'].forEach((item: any) => {
      item['documentDate'] = item['date'];
      item['refInvoiceNumber'] = item['refrenceDocNo'];
      item['purchaseOrderNumber'] = item['poNumber'];
      item['materialDocumentFiscalYear'] = '-';
      item['materialNumber'] = '-';
      item['materialDescription'] = '-';
      item['plantCode'] = '-';
      item['grnquantity'] = item['quantity'];
      item['checked'] = false;
      item['quantityType'] = this.conditionalForm.value.quantity_type;
      item['quantity'] = this.returnPOItemQnty(item);
      const rateToUse = this.isValidRate(this.allRate) ? this.allRate : item['rate'];
      item['amount'] = Number(Number(item['quantity']) * Number(rateToUse)).toFixed(2);
    })

    /* arr1['poGrnData'][0]['documentDate'] = arr1['poGrnData'][0]['date'];
    arr1['poGrnData'][0]['refInvoiceNumber'] = arr1['poGrnData'][0]['refrenceDocNo'];
    arr1['poGrnData'][0]['purchaseOrderNumber'] = arr1['poGrnData'][0]['poNumber'];
    arr1['poGrnData'][0]['materialDocumentFiscalYear'] = '-';
    arr1['poGrnData'][0]['materialNumber'] = '-';
    arr1['poGrnData'][0]['materialDescription'] = '-';
    arr1['poGrnData'][0]['plantCode'] = '-';
    arr1['poGrnData'][0]['grnquantity'] = arr1['poGrnData'][0]['quantity'];
    arr1['poGrnData'][0]['checked'] = false;
    arr1['poGrnData'][0]['quantityType'] = this.conditionalForm.value.quantity_type;
    arr1['poGrnData'][0]['quantity'] = this.returnPOItemQnty(arr1['poGrnData'][0]);
    arr1['poGrnData'][0]['amount'] = Number(arr1['poGrnData'][0]['quantity']) * Number(arr1['poGrnData'][0]['rate']) */

    return arr1['poGrnData'];
  }

  getConditionalVendorData() {
    console.log('getConditionalVendorData');

    this.condDescArray = [];

    let url = `getConditionType`;
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);

      if (res.status == 'Success' && res.data?.length > 0) {
        res['data'].map((item: any) => {
          this.poResponseJson['conditionalGRN'].map((ele: any) => {
            if (ele['conditionDescription'] == item['type'] && this.condDescArray.indexOf(ele.conditionDescription) == -1) {
              this.condDescArray.push(ele.conditionDescription)
            }
          })
        })
      }

      if (this.condDescArray.length > 0) {
        this.conditionalForm.controls.condition_type.setValue(this.condDescArray[0]);
        this.selectPoGrnDetails(this.condDescArray[0]);
      }
    }, err => {
      console.log(err.error.message);
      this.errorToast = true;
      this.toastMsg = "Invoice uploads have been temporarily stopped."
      setTimeout(() => {
        this.errorToast = false;
      }, 2000)
    })
  }

  selectConditionalType(event: any) {
    this.conditionalForm.controls.condition_type.setValue(event.target.value);
  }

  selectPoGrnDetails(desc: any) {
    console.log('selectPoGrnDetails');

    let arr: any = [];
    this.poResponseJson['conditionalGRN'].map((item: any) => {
      if (item.conditionDescription == desc) {
        arr.push(
          {
            poNumber: item.poNumber,
            documentDate: item.date,
            refInvoiceNumber: item.refrenceDocNo,
            purchaseOrderNumber: item.poNumber,
            purchaseOrderItemNo: item.purchaseOrderItemNo,
            materialDocumentFiscalYear: '-',
            materialDocumentNumber: item.materialDocumentNumber,
            materialDocumentItemNumber: item.materialDocumentItemNumber,
            vehicleNumber: '-',
            materialNumber: '-',
            materialDescription: '-',
            plantCode: '-',
            quantity: item.quantity,
            vendorCode: item.vendorCode,
            conditionType: item.conditionType,
            conditionDescription: item.conditionDescription,
            amount: item.amount,
            checked: false
          }
        )
      }
    })
    this.apipoGrnDetails = arr;
    this.poGrnDetails = arr;
    this.filterGrnDetails = arr;
    this.totalPages = Math.ceil(this.poGrnDetails.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages();
    this.updatePagedData();
  }

  getPODetail() {
    console.log('getPoDetail');

    this.commonService.spinner.show();

    let url = `getPODetails?poNumber=${this.conditionalForm.value.po_number}&invoiceType=${this.invoiceType}`;
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res['status'] == 'Success' && res['data']) {
        this.actualPOVendor = this.vendorArray.find((item: any) => {
          return item['vendorNumber'] == res['data']['vendorCode']
        })
        this.ALLVendor = this.vendorArray.find((item: any) => {
          return item['vendorNumber'] == this.selectedCreatedCondition['parentVendorNo']
        })
        this.poDetail = res['data'];
        this.getSubmissionTo(res['data']['poItems'][0]['plantCode'], res['data']['poItems'][0]['preqNo']);
        this.getChildGST();
      }
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
    })
  }

  getSubmissionTo(plant_code: any, preqNo?: any) {
    console.log('getSubmissionTo');
    let url = `plantDetails?plantCode=${plant_code}&invoiceType=${this.invoiceType}&preqNo=${preqNo}`;
    // this.commonService.getSubmissionTo(plant_code, invoice_type, preqNo).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      if (res && res['status'] == 'Success' && res['data']) {
        // this.conditionalForm['controls']['plant_code'].setValue(res['data']['plantCode']+'-'+res['data']['plantName']);
        this.conditionalForm['controls']['rece_gst_no'].setValue(res['data']['gstNumber'] ? res['data']['gstNumber'] : '');
        this.conditionalForm['controls']['supp_gst_no'].setValue(this.userdata.GST ? this.userdata.GST : '');
        this.conditionalForm['controls']['payment_mode'].setValue('rtgs');
        // this.conditionalForm['controls']['submission_to'].enable();
        if (res['data']['employeeData']) {
          this.submissionArr = res['data']['employeeData'].filter((item: any) => {
            return item['adminAccess'] == false
          });
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

    let url = 'getChildVendorDetail';
    let json = {
      "vendorCode": this.userdata.ACCOUNTNUMBER
    }
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      if (res && res['status'] == 'Success' && res['data'].length > 0) {
        this.childGSTArr = res['data'];
        /* this.conditionalForm.controls['child_gst'].setValue(res['data'][0]['gstNumber']);
        this.childVendorCode = (res['data'][0]['vendorCode']); */
        this.conditionalForm.controls['child_gst'].setValue(res['data'][0]['gst']);
        this.childVendorCode = res['data'][0]['vendorNumber'];
        this.vendorBasicData = res['data'][0];
        this.vendorBasicData['stcode'] = this.vendorBasicData['gst'].slice(0, 2)
        this.vendorBasicData['state'] = this.returnStateName(this.vendorBasicData['gst'].slice(0, 2))
      } else if (res.status == 'Failed') {
        this.errorToast = true;
        this.toastMsg = 'No child gst number found';
        setTimeout(() => {
          this.errorToast = false;
        }, 5000);
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

  selectChileVendorCode(item: any) {
    console.log(item);
    /* let select = this.childGSTArr.find((ele:any)=>{
      return ele.gstNumber == item.target.value
    })
    this.childVendorCode = select.vendorCode; */
    this.vendorBasicData = this.childGSTArr.find((ele: any) => {
      return ele.gst == item.target.value
    })
    this.childVendorCode = this.vendorBasicData.vendorNumber;
    this.vendorBasicData['stcode'] = this.vendorBasicData['gst'].slice(0, 2)
    this.vendorBasicData['state'] = this.returnStateName(this.vendorBasicData['gst'].slice(0, 2));
  }

  submitConditionalForm(event?: any) {
    let selected = this.createdConditionData.find((item: any) => {
      return item['conditionType'] == this.conditionalForm.value.condition_type && item['poItemNo'] == this.conditionalForm.value.po_item_no && item['poNumber'] == this.conditionalForm.value.po_number && item['quantityType'] == this.conditionalForm.value.quantity_type
    })
    if (this.conditionalForm.valid == false) {
      this.errorToast = true;
      this.toastMsg = 'Form is invalid';
      return;
    }
    this.calculateVendorAndALLTax()
    const cgst = Number(this.pdfChildData?.invoice?.cgst || 0);
  const sgst = Number(this.pdfChildData?.invoice?.sgst || 0);
  const igst = Number(this.pdfChildData?.invoice?.igst || 0);
  const taxSplit = (cgst + sgst + igst) / this.totalGRNQuantity;
    if(this.conditionalForm['controls']['invoice_type'].value == 'Freight-Inbound') {
       const poInvoice1Amount = this.isValidRate(this.allRate)
    ? this.calculateTotalAmountWithRate(this.allRate)
    : this.totalGRNAmount;

  const poInvoice2Amount = this.isValidRate(this.aaaRate)
    ? this.calculateTotalAmountWithRate(this.aaaRate)
    : this.totalGRNAmount;

     const poInvoice1GRNItems = this.isValidRate(this.allRate)
    ? this.selectedGRNArr.map((item: any) => {
        const quantity = Number(item.quantity);
        const rate = Number(this.allRate);
        const amount = quantity * rate;
        const itemTax = quantity * taxSplit;

        return {
          ...item,
          rate,
          amount: amount.toFixed(2),
          cgst: (cgst ? (quantity * (cgst / this.totalGRNQuantity)).toFixed(2) : 0),
          sgst: (sgst ? (quantity * (sgst / this.totalGRNQuantity)).toFixed(2) : 0),
          igst: (igst ? (quantity * (igst / this.totalGRNQuantity)).toFixed(2) : 0),
          totalAmount: (amount + itemTax).toFixed(2)
        };
      })
    : this.selectedGRNArr;
         const poInvoice1 = {
    rate: this.isValidRate(this.allRate) ? this.allRate : this.selectedGRNArr[0].rate,
    invoiceAmount: poInvoice1Amount,
    totalInvoiceAmount: poInvoice1Amount,
    poGRNItems: poInvoice1GRNItems,
    netAamount: poInvoice1Amount,
    invoiceType: this.conditionalForm['controls']['invoice_type'].value ? this.conditionalForm['controls']['invoice_type'].value : null,
    poNumber: this.conditionalForm['controls']['po_number'].value,
    poItemNumber: this.conditionalForm['controls']['po_item_no'].value,
    invoiceNumber: this.conditionalForm['controls']['invoice_number'].value,
    invoiceDate:  moment(new Date(this.conditionalForm['controls']['invoice_date'].value)).format('YYYY-MM-DD HH:mm:ss'),
    paymentMode: this.conditionalForm['controls']['payment_mode'].value ? this.conditionalForm['controls']['payment_mode'].value : null,
    receiverGST: this.pdfAllData['self']['GST'] ? this.pdfAllData['self']['GST'] : null,
    supplierGST: this.conditionalForm['controls']['supp_gst_no'].value ? this.conditionalForm['controls']['supp_gst_no'].value : null,
    supplierChildGST: this.conditionalForm['controls']['child_gst'].value ? this.conditionalForm['controls']['child_gst'].value : null,
    childVendorCode: this.childVendorCode ? this.childVendorCode : null,
    childVendorName:this.vendorBasicData.name ? this.vendorBasicData.name : null,
    materialGroup: '',
    sapStatus: 0,
    companyCode: this.selectedCreatedCondition.companyCode,
    plantCode: this.conditionalForm.value.plant_code,
    status: 'submitted',
    createdBy: this.userdata.ACCOUNTNUMBER,
    createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    updatedBy: this.username,
    updatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    conditionId: selected['conditionId'],
    submissionTo: selected['createdBy'],
    matDescription: 'Freight Bill-Goods Transportation',
    sacCode: this.userdata.SACCODE,
    quantity: Number(this.totalGRNQuantity.toFixed(3)),
    uom: 'MT',
    cgst: this.pdfChildData?.['invoice']?.['cgst'] ? this.pdfChildData['invoice']['cgst'] : 0,
    sgst: this.pdfChildData?.['invoice']?.['sgst'] ? this.pdfChildData['invoice']['sgst'] : 0,
    igst: this.pdfChildData?.['invoice']?.['igst'] ? this.pdfChildData['invoice']['igst'] : 0,
    tax: this.pdfChildData?.['invoice']?.['ttax'] ? this.pdfChildData['invoice']['ttax'] : 0,
    totalAmount: this.pdfChildData?.['invoice']?.['tamount'] ? this.pdfChildData['invoice']['tamount'] : 0,
    reverseCharge: this.pdfChildData?.['invoice']?.['reversecharge'] ? this.pdfChildData['invoice']['reversecharge'] : '',
    irnNo: '',
    itemMaterialDes: this.selectedGRNArr[0]['materialDes'],
    remarks: this.conditionalForm.value.invoice_number,
    isALLInvoice:0,
    attach: this.uploadedDigitalSigned,
  };
  const poInvoice2 =null
  console.log("json",poInvoice1);
  const payload = {
    // invData: {
      poNumber: this.conditionalForm['controls']['po_number'].value, 
      totalAmount: this.pdfChildData?.['invoice']?.['tamount'] ? this.pdfChildData['invoice']['tamount'] : 0,
      poInvoice1,
      poInvoice2
    // },
    // conData,
    // sesData,
    // irnFiData
  };
  console.log("payload",payload);
  this.commonService.spinner.show()
   this.commonService.dataPost('postPOInvoice', payload).subscribe(
    (res: any) => {
      this.commonService.spinner.hide();
      if (res && res.status === 'Success') {
        this.successToast = true;
        this.toastMsg = 'Records have been updated successfully';
        this.commonService.spinner.hide()
        setTimeout(() => {
          this.successToast = false;
          this.commonService.routeToPage('./dashboard');
        }, 2000);
      } else {
        this.errorToast = true;
        this.commonService.spinner.hide()
        this.toastMsg = res.message;
      }
    },
    (err: any) => {
      this.commonService.spinner.hide();
      this.errorToast = true;
      this.toastMsg = err.error?.message || err.invData.poInvoice1.invoiceNumber || 'Error occurred';
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
    }
  );
    }
    else{
      let json: any = {
      invoiceType: this.conditionalForm['controls']['invoice_type'].value ? this.conditionalForm['controls']['invoice_type'].value : null,
      poNumber : this.conditionalForm['controls']['po_number'].value,
      // poNumber: this.allPoNumber,
      poItemNumber: this.conditionalForm['controls']['po_number'].value,
      invoiceNumber: this.conditionalForm['controls']['invoice_number'].value,
      invoiceDate: moment(new Date(this.conditionalForm['controls']['invoice_date'].value)).format('YYYY-MM-DD HH:mm:ss'),

      invoiceAmount: this.conditionalForm['controls']['invoice_amount'].value,
      totalInvoiceAmount: this.conditionalForm['controls']['invoice_amount'].value,

      paymentMode: this.conditionalForm['controls']['payment_mode'].value ? this.conditionalForm['controls']['payment_mode'].value : null,
      // receiverGST: this.conditionalForm['controls']['rece_gst_no'].value?this.conditionalForm['controls']['rece_gst_no'].value:null,
      receiverGST: this.pdfAllData['self']['GST'] ? this.pdfChildData['self']['GST'] : null,
      supplierGST: this.conditionalForm['controls']['supp_gst_no'].value ? this.conditionalForm['controls']['supp_gst_no'].value : null,
      supplierChildGST: this.conditionalForm['controls']['child_gst'].value ? this.conditionalForm['controls']['child_gst'].value : null,
      childVendorCode: this.childVendorCode ? this.childVendorCode : null,

      poGRNItems: this.selectedGRNArr,

      materialGroup: '', // this.poDetail.materialGroup,
      sapStatus: 0,
      companyCode: this.selectedCreatedCondition.companyCode,
      plantCode: this.conditionalForm.value.plant_code,
      status: 'submitted',
      createdBy: this.userdata['ACCOUNTNUMBER'],
      createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      updatedBy: this.username,
      updatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      conditionId: selected['conditionId'],
      submissionTo: selected['createdBy'],

      matDescription: 'Freight Bill-Goods Transportation',
      sacCode: this.userdata.SACCODE,
      quantity: this.totalGRNQuantity,
      uom: 'MT',
      netAamount: this.totalGRNAmount,
      cgst: this.pdfChildData?.['invoice']?.['cgst'] ? this.pdfChildData['invoice']['cgst'] : 0,
      sgst: this.pdfChildData?.['invoice']?.['sgst'] ? this.pdfChildData['invoice']['sgst'] : 0,
      igst: this.pdfChildData?.['invoice']?.['igst'] ? this.pdfChildData['invoice']['igst'] : 0,
      tax: this.pdfChildData?.['invoice']?.['ttax'] ? this.pdfChildData['invoice']['ttax'] : 0,
      totalAmount: this.pdfChildData?.['invoice']?.['tamount'] ? this.pdfChildData['invoice']['tamount'] : 0,
      reverseCharge: this.pdfChildData?.['invoice']?.['reversecharge'] ? this.pdfChildData['invoice']['reversecharge'] : '',
      irnNo: '',
      itemMaterialDes: this.selectedGRNArr[0]['materialDes'],
      remarks: this.conditionalForm.value.invoice_number + '-' + this.pdfAllData['invoice']['invoice_number'],
    }
    
    if (this.isALLInvoice == true) {
      json['isALLInvoice'] = 1;
      // json['attach'] = this.mergeChildAndSupportPDF;
      json['attach'] = this.uploadedDigitalSigned;
    } else {
      json['isALLInvoice'] = 0;
      json['attach'] = this.uploadedDigitalSigned;
    }
       let url = `PostPOInvoice`;
    this.commonService.spinner.show();

    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
    
      if (res && res['status'] == 'Success') {
        this.successToast = true;
        this.toastMsg = 'Records have been updated successfully';
        this.commonService.spinner.hide();
        this.submitStatus.transporterPoId = res['data'];
        if (this.submitStatus.transporterPoId && this.submitStatus.allPoId) {
          this.sendJsonForEmail();
          this.updateConditionStatus();
          this.commonService.routeToPage('./dashboard');
        }
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
   
  }

  redirectToDashboard() {
    console.log('redirectToDashboard');
    this.commonService.routeToPage('./dashboard');
  }



  grnSelect(event: any, row: any) {
    let checked = event.target.checked;
    if (checked) {
      this.poGrnDetails.map((item: any) => {
        console.log('grnSelect', event.target.checked, item);
        if (item['materialDocumentNumber'] == row['materialDocumentNumber']) {
          item['checked'] = true;
          item['status'] = 'done';
          item['updatedBy'] = this.username;
          item['updatedDate'] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
          const rateToUse = this.isValidRate(this.allRate) ? this.allRate : item['rate'];
          item['amount'] = Number(Number(item['quantity']) * Number(rateToUse)).toFixed(2);
          item['amountALL'] = Number(Number(item['quantity']) * Number(rateToUse)).toFixed(2);
          item['amountAAA'] = Number(Number(item['quantity']) * Number(this.aaaRate || item['rate'])).toFixed(2);
          this.selectedGRNArr.push(item);
          this.totalGRNQuantity = Number(this.totalGRNQuantity) + Number(item['quantity']);
          // this.totalGRNAmount = Number(this.totalGRNAmount) + Number(item['amount']);
          this.totalGRNAmount = Number(Number(this.totalGRNAmount) + Number(item['amount'])).toFixed(2);
          this.totalGRNAmountALL = Number(Number(this.totalGRNAmountALL) + Number(item['amountALL'])).toFixed(2);
          this.totalGRNAmountAAA = Number(Number(this.totalGRNAmountAAA) + Number(item['amountAAA'])).toFixed(2);
        }
      })
      // this.conditionalForm['controls']['grn_arr'].clearValidators();
      // this.conditionalForm['controls']['grn_arr'].updateValueAndValidity();
      // if(this.poGrnDetails.length == this.selectedGRNArr.length){
      if (this.filterGrnDetails.length == this.selectedGRNArr.length) {
        this.selectedAll = true;
      }
    } else {
      this.selectedAll = false;
      this.selectedGRNArr.map((item: any, i: any) => {
        if (item['materialDocumentNumber'] == row['materialDocumentNumber']) {
          // if(item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']){
          item['checked'] = false;
          this.selectedGRNArr.splice(i, 1);
          this.totalGRNQuantity = Number(this.totalGRNQuantity) - Number(item['quantity']);
          this.totalGRNAmount = Number(Number(this.totalGRNAmount) - Number(item['amount'])).toFixed(2);
          this.totalGRNAmountALL = Number(Number(this.totalGRNAmountALL) + Number(item['amountALL'])).toFixed(2);
          this.totalGRNAmountAAA = Number(Number(this.totalGRNAmountAAA) + Number(item['amountAAA'])).toFixed(2);
        }
        /* if(this.selectedGRNArr.length>0){
          this.conditionalForm['controls']['grn_arr'].clearValidators();
          this.conditionalForm['controls']['grn_arr'].updateValueAndValidity();
        }else{
          this.conditionalForm['controls']['grn_arr'].setValidators([Validators.required]);
          this.conditionalForm['controls']['grn_arr'].updateValueAndValidity();
        } */
      })
    }
    this.compareAmount();
    this.compareGRNSES();
  }

  compareAmount(event?: any) {
    console.log('compareAmount');
    this.conditionalForm['controls']['invoice_amount'].setValue(this.totalGRNAmount);
    this.conditionalForm['controls']['invoice_quantity'].setValue(this.totalGRNQuantity);
    return;
    if (Number(this.conditionalForm['controls']['invoice_amount'].value) && Number(this.totalGRNAmount)) {
      if (Number(this.conditionalForm['controls']['invoice_amount'].value) == Number(this.totalGRNAmount)) {
        console.log('match');
        this.conditionalForm['controls']['invoice_amount'].setErrors();
        this.conditionalForm['controls']['invoice_amount'].clearValidators();
      } else {
        console.log('mismatch');
        this.conditionalForm['controls']['invoice_amount'].setErrors({ 'amount_mismatch': true });
      }
    } else {
      console.log('value mismatch');
      this.conditionalForm['controls']['invoice_amount'].setErrors({ 'amount_mismatch': true });
    }
  }

  compareGRNSES() {
    console.log('compareGRNSES');
    /* if(this.selectedGRNArr.length>0){
      this.conditionalForm['controls']['grn_arr'].clearValidators();
      this.conditionalForm['controls']['grn_arr'].updateValueAndValidity();
    }else{
      this.conditionalForm['controls']['grn_arr'].setValidators([Validators.required]);
      this.conditionalForm['controls']['grn_arr'].updateValueAndValidity();
    } */
  }

checkAll(event: any) {

  if (event.target.checked) {
    // Clear the selected array first to avoid duplicates
    this.selectedGRNArr = [];

    this.filterGrnDetails.forEach((item: any) => {
      console.log('checkAll', item);
      // Always update the item regardless of previous checked state
      item['checked'] = true;
      item['status'] = 'done';
      item['updatedBy'] = this.username;
      item['updatedDate'] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

      const rateToUse = this.isValidRate(this.allRate) ? this.allRate : item['rate'];
      item['amount'] = Number(Number(item['quantity']) * Number(rateToUse)).toFixed(2);
      item['amountALL'] = Number(Number(item['quantity']) * Number(rateToUse)).toFixed(2);
      item['amountAAA'] = Number(Number(item['quantity']) * Number(this.aaaRate || item['rate'])).toFixed(2);

      // Add to selected array
      this.selectedGRNArr.push(item);

      this.grn_arrr = {
        "grn_posting_date": item.date ? moment(item.date, 'DD-MM-YYYY').format('YYYYMMDD') : '',
        "material_desc": item.materialDes,
        "plant": this.conditionalForm.value.plant_code,
        "grn_number": item.materialDocumentNumber,
        "po_number": item.poNumber,
        "do_number": item.doNumber,
        "vehicle_number": item?.vehicleNumber ?? '',
        "challan_number": item.challanNo,
        "challan_date": item.challanDate ? moment(item.challanDate, 'DD-MM-YYYY').format('YYYYMMDD') : '',
        "lr_number": item.lrNo,
        "lr_date": item.lrDate ? moment(item.lrDate, 'DD-MM-YYYY').format('YYYYMMDD') : '',
        "rate": this.allRate || item.rate,
        "challan_quantity": item.challanQty,
        "actual_quantity": item.actualQty,
        "grn_quantity": item.grnquantity,
        "lesser_quantity": item.lesserQty,
        "freight_billing_quantity": item.quantity,
        "amount": item.amount,
      }
    });

    this.selectedAll = true;

    // Recalculate totals
    this.recalculateTotals();

    this.compareAmount();
    this.compareGRNSES();
  } else {
    // Uncheck all
    this.selectedAll = false;

    this.filterGrnDetails.forEach((item: any) => {
      item['checked'] = false;
    });

    // Clear selected array
    this.selectedGRNArr = [];

    // Reset totals
    this.totalGRNQuantity = 0;
    this.totalGRNAmount = 0;
    this.totalGRNAmountALL = 0;
    this.totalGRNAmountAAA = 0;

    this.compareAmount();
    this.compareGRNSES();
  }

  // Update the displayed data to reflect changes
  this.updatePagedData();
   if(this.roleName != 'AAA_T'){
      this.compareRateOfGRNAndALLPO();
    }
}

// Add this helper method to recalculate totals
recalculateTotals() {
  this.totalGRNQuantity = 0;
  this.totalGRNAmount = 0;
  this.totalGRNAmountALL = 0;
  this.totalGRNAmountAAA = 0;

  this.selectedGRNArr.forEach((item: any) => {
    this.totalGRNQuantity = Number(this.totalGRNQuantity) + Number(item['quantity']);
    this.totalGRNAmount = Number(Number(this.totalGRNAmount) + Number(item['amount'])).toFixed(2);
    this.totalGRNAmountALL = Number(Number(this.totalGRNAmountALL) + Number(item['amountALL'])).toFixed(2);
    this.totalGRNAmountAAA = Number(Number(this.totalGRNAmountAAA) + Number(item['amountAAA'])).toFixed(2);
  });

  // Update form controls
  this.conditionalForm['controls']['invoice_amount'].setValue(this.totalGRNAmount);
  this.conditionalForm['controls']['invoice_quantity'].setValue(this.totalGRNQuantity);
}

isGenerateInvoiceDisabled(): boolean {
  return !this.conditionalForm.valid ||
         this.selectedGRNArr.length === 0 ||
         this.allAndGRNRateMatched === false ||
         this.invoiceNoExist ||
         !this.allForm.get('po_number').value ||
         !this.allForm.get('po_item_no').value ||
         this.allForm.get('po_item_no').value === 'choose' ||
         !this.conditionalForm.get('invoice_number').value ||
         this.conditionalForm.get('invoice_number').invalid;
}

  invoiceTypeSelect(event?: any, invoicetype?: any) {
    console.log('invoiceTypeSelect');

    let invoice_type = event.target?.value ? event.target.value : invoicetype;
    if (invoice_type == 'Material') {
      this.commonService.routeToPage('./dashboard/material-invoice');
    } else if (invoice_type == 'Service') {
      this.commonService.routeToPage('./dashboard/service-invoice');
    } else if (invoice_type == 'SLA') {
      this.commonService.routeToPage('./dashboard/sla-invoice');
    } else if (invoice_type == 'Freight-Inbound') {
      this.commonService.routeToPage('./dashboard/conditional-invoice');
    } else if (invoice_type == 'Contracts') {
      this.commonService.routeToPage('./CAD/vendor/home/invoice');
    } else if (invoice_type == 'Reward') {
      this.commonService.routeToPage('./dashboard/reward-invoice');
    }
  }

  /* Pagination */
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

  updatePagination() {
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.poGrnDetails.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages();
    this.updatePagedData();
  }

  /* Table Structure */
  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }
  get endIndex(): number {
    return this.currentPage * this.itemsPerPage;
  }

  resetFilter() {
    this.selectedAll = false;
    console.log('resetFilter');
    this.loadDynamicFilterForm();
    this.filterGrnDetails = this.apipoGrnDetails;
    this.poGrnDetails = this.apipoGrnDetails;
    this.updatePagination();
    if (this.filterGrnDetails.length == this.selectedGRNArr.length) {
      this.selectedAll = true;
    }
  }

  pasteApplyFilter() {
    setTimeout(() => {
      this.dynamicFilterForm.controls['ref_number'].setValue(this.dynamicFilterForm.value.ref_number.replace(/ /g, ','));
      // this.applyFilter();
    }, 100);
  }

  applyFilter(excel_upload?: any) {
    console.log('applyFilter');
    this.selectedAll = false;
    let filtered: any = [];
    let filter_item_number = this.dynamicFilterForm.value.ref_number;
    if (filter_item_number == '') {
      this.filterGrnDetails = this.apipoGrnDetails;
      this.poGrnDetails = this.apipoGrnDetails;
      this.updatePagination();
    } else {
      this.refNotFoundArr = filter_item_number.split(',');
      filter_item_number = filter_item_number.split(',');
      filter_item_number.map((element: any) => {
        this.apipoGrnDetails.find((item: any) => {
          if (element == item['refInvoiceNumber']) {
            if (excel_upload == true) {
              item.checked = true;
              item['status'] = 'done';
              item['updatedBy'] = this.username;
              item['updatedDate'] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
              const rateToUse = this.isValidRate(this.allRate) ? this.allRate : item['rate'];
              item['amount'] = Number(Number(item['quantity']) * Number(rateToUse)).toFixed(2);
            }
            filtered.push(item);
            this.refNotFoundArr.splice(this.refNotFoundArr.indexOf(element), 1)
          }
        })
      })
      console.log(filtered);
      if (this.refNotFoundArr.length > 0) {
        document.getElementById('refNotFoundModalButton')?.click();
      }
      this.filterGrnDetails = filtered;
      this.poGrnDetails = filtered;

      let status = this.poGrnDetails.every((item: any) => {
        return item['checked'] == true
      })
      if (status == true) { this.selectedAll = true }

      this.totalGRNQuantity = 0;
      this.totalGRNAmount = 0;
      this.selectedGRNArr = this.apipoGrnDetails.filter((item: any) => {
        if (item.checked == true) {
          this.totalGRNQuantity = this.totalGRNQuantity + Number(item['quantity']);
          this.totalGRNAmount = this.totalGRNAmount + Number(item['amount']);
        }
        return item.checked == true;
      })

      this.updatePagination();
    }
    this.totalGRNAmount = Number(this.totalGRNAmount).toFixed(2);
  }

  updatePagedData(): void {
    /* if(Object.values(this.apipoGrnDetails[0])[0] != ''){

    } */
    this.poGrnDetails = this.filterGrnDetails ? this.filterGrnDetails.slice(this.startIndex, this.endIndex) : [];
    this.updateVisiblePages();
  }

  onPageChange(event: any): void {
    const selectedPage = event.target.value;
    this.currentPage = selectedPage;
    this.updatePagedData();
  }

  updateVisiblePages() {
    const range = 2;
    let start = Math.max(1, this.currentPage - range);
    let end = Math.min(this.totalPages, Number(this.currentPage) + range);

    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);
    }
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
    if (!extension_list.includes(file_extension)) {
      this.conditionalForm.controls['attach'].setValue('');
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
    this.conditionalForm['controls']['attach_data'].setValue(this.selectedAllAttachment);
  }

  onImageCaptureSupport(evt: any) {
    this.selectedAllAttachmentSupport = [];
    var files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
      console.log(files[i]);

      let file = files[i];
      let extension_list = ['pdf'];
      let file_name = file['name'];
      let file_extension = file_name.split('.').pop();
      if (!extension_list.includes(file_extension.toLowerCase())) {
        this.conditionalForm.controls['attach'].setValue('');
        this.toastMsg = "file with extension ." + file_extension + " not allowed";
        this.errorToast = true;
        return;
      }

      if (files && file) {
        // this.selectedSupportingDocument = file;
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
    this.selectedAllAttachmentSupport.push(attach_json);
    this.conditionalForm['controls']['attach_data_supp']?.setValue(this.selectedAllAttachmentSupport);
    // console.log(btoa(binaryString));
  }

  downloadMergedAttachment() {
    console.log('downloadMergedAttachment');
     this.updateGRNArrayWithNewRates();
    this.commonService.spinner.show();

    /* let json;
    if(this.isALLInvoice == true){
      json = [...this.childPDFBase64, ...this.selectedAllAttachmentSupport];
    }else{
      json = [...this.selectedAllAttachment, ...this.selectedAllAttachmentSupport];
    }
    let url = `mergePDF`; */

    let json: any = {}
    if (this.isALLInvoice == true) {
      json.attach = [...this.childPDFBase64, ...this.selectedAllAttachmentSupport];
    } else if(this.roleName == 'AAA_T'){
      json.attach = [...this.childPDFBase64, ...this.selectedAllAttachmentSupport];
    }
    else {
      json.attach = [...this.selectedAllAttachment, ...this.selectedAllAttachmentSupport];
    }

    json.barcode = this.userdata.ACCOUNTNUMBER + this.conditionalForm.value.invoice_number + this.conditionalForm.value.invoice_date;
    let url = `mergePDFwithBarcode`;

    // this.commonService.getMergedAttachment(json).subscribe((res:any)=>{
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res['status'] == 'Success' && res['data'] != '') {
        this.enableUploadDigital = true;
        let a = document.createElement('a');
        a.href = `data:application/pdf;base64,${res.data}`;
        // a.download = 'mergefile.pdf';
        a.download = this.conditionalForm.value.invoice_number + (this.userdata.CUSTOMERCODE ? '_' + this.userdata.CUSTOMERCODE : '') + '.pdf';
        a.click();
      }
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
    })
  }

  uploadMergedSignAttachment(evt: any) {
    console.log('uploadMergedSignAttachment');
    var files = evt.target.files;
    var file = files[0];

    let extension_list = ['pdf'];
    let file_name = file['name'];
    let file_extension = file_name.split('.').pop();
    if (!extension_list.includes(file_extension)) {
      this.conditionalForm.controls['attach'].setValue('');
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

  clearToastMessages() {
  this.successToast = false;
  this.errorToast = false;
  this.toastMsg = '';
}

  _uploadMergedSignAttachment(readerEvt: any, file?: any) {
    this.clearToastMessages();
    var binaryString = file.target.result;
    let base64 = btoa(binaryString);
    let attach_json = {
      fileName: readerEvt.name,
      fileBase64: base64,
      barcode: this.userdata.ACCOUNTNUMBER + this.conditionalForm.value.invoice_number + this.conditionalForm.value.invoice_date
    }
    this.uploadedDigitalSigned = [];
    this.commonService.spinner.show();
    // this.uploadedDigitalSigned.push(attach_json);
    this.errorToast = false;

    // let url = `checkDigitalSignature`;
    let url = `validateSignatureAndBarcode`;

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
      } else if (res['status'] == 'Failed' && res['data'] == false && res['message'] == 'Digital signature is invalid') {
        this.commonService.spinner.hide();
        this.errorToast = true;
        this.toastMsg = "PDF File is not digitally Signed ";
        setTimeout(() => {
          this.errorToast = false;
        }, 3000);
      } else if (res['status'] == 'Failed' && res['data'] == false && res['message'] == 'Barcode mismatch') {
        this.commonService.spinner.hide();
        this.errorToast = true;
        this.toastMsg = "The uploaded file is incorrect; kindly upload the correct one";
        setTimeout(() => {
          this.errorToast = false;
        }, 3000);
      } else {
        this.commonService.spinner.hide();
        this.errorToast = true;
        this.toastMsg = res['message'] || 'Unknown error occurred';
        setTimeout(() => {
          this.errorToast = false;
        }, 3000);
      }
      setTimeout(() => {
        this.signedAttach.nativeElement.value = '';
      }, 0);
    }, err => {
     console.log(err);
    this.signedAttach.nativeElement.value = '';
    this.commonService.spinner.hide();
    this.errorToast = true;
    this.toastMsg = err.error?.message || 'Error validating digital signature';
    setTimeout(() => {
      this.errorToast = false;
    }, 3000);
  })
  }

  deleteAttachment(json: any) {
    console.log('deleteAttachment');
    this.conditionalForm['controls']['attach'].enable();
    this.conditionalForm['controls']['attach_data'].enable();
    this.selectedAllAttachment.map((item: any, index: any) => {
      if (item['fileName'] == json['fileName']) {
        this.selectedAllAttachment.splice(index, 1)
      }
    })
    this.invoice.nativeElement.value = null;
  }

  deleteAttachmentSupp(json: any) {
    console.log('deleteAttachmentSupp');
    this.selectedAllAttachmentSupport.map((item: any, index: any) => {
      if (item['fileName'] == json['fileName']) {
        this.selectedAllAttachmentSupport.splice(index, 1)
      }
    })
    this.suppportinvoice.nativeElement.value = null;
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
  /* Attchment closed */

  /* Upload excel for grn filter */
  uploadExcelFile(event: any) {
    console.log('uploadExcelFile', event);

    let file = event.target.files[0];
    let fileReader = new FileReader();

    fileReader.readAsBinaryString(file);
    fileReader.onload = (e) => {
      var wb = XLSX.read(fileReader.result, { type: 'binary' });
      var ws = wb.SheetNames;
      var excel_json = XLSX.utils.sheet_to_json(wb.Sheets[ws[0]]);
      var json: any = [];
      console.log(excel_json);
      excel_json.map((item: any) => {
        json.push(item['Ref Number'])
      })

      json = json.toString();
      this.dynamicFilterForm.controls.ref_number.setValue(json);
      this.applyFilter(true);
      this.uploadExcel.nativeElement.value = null;
    }
  }

  /* Download grn list */
  downloadGRNExcelFile() {
    console.log('downloadGRNExcelFile');

    let data: any = [];
    this.apipoGrnDetails.map((item: any) => {
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

  /* View conditional invoice detail*/
  getViewConditionalDataGRNDetails(poInvoiceID?: any) {
    console.log('getViewConditionalDataGRNDetails');

    let url = `getPOSesAndGrnDetails?poInvoiceID=${poInvoiceID}`;

    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log('resssss',res);
      if (res.status == 'Success' && res?.data?.length > 0) {
        let data = res.data[0];
        this.conditionalForm.controls.invoice_type.setValue(data.invoiceType);
        this.conditionalForm.controls.invoice_number.setValue(data.invoiceNumber);
        this.conditionalForm.controls.invoice_date.setValue(moment(data.invoiceDate).format('YYYY-MM-DD'));
        this.conditionalForm.controls.invoice_amount.setValue(data.invoiceAmount);
        this.conditionalForm.controls.payment_mode.setValue(data.paymentMode);
        this.conditionalForm.controls.rece_gst_no.setValue(data.receiverGST);
        this.conditionalForm.controls.all_gst_no.setValue(data.receiverGST);
        this.conditionalForm.controls.supp_gst_no.setValue(data.supplierGST);
        this.conditionalForm.controls.child_gst.setValue(data.supplierChildGST);
        this.conditionalForm.controls.plant_code.setValue(data.plantCode);
        this.conditionalForm.controls.invoice_quantity.setValue(data.quantity);

        this.allPOArray.push(data.poNumber);
        this.allForm.controls.po_number.setValue(data.poNumber);
        // this.allForm.controls.po_item_no.setValue('00010');

        data.poGrnDetails.map((item: any) => {
          if (this.condDescArray.indexOf(item.conditionDescription) == -1) {
            this.condDescArray.push(item.conditionDescription)
          }
        })
        this.poArray.push(data.poGrnDetails[0]['poNumber']);
        this.poItemArray.push(data.poGrnDetails[0]['purchaseOrderItemNo']);
        this.conditionalForm.controls.condition_type.setValue(data.poGrnDetails[0]['conditionDescription']);
        this.conditionalForm.controls.po_item_no.setValue(
          data?.poGrnDetails?.[0]?.['purchaseOrderItemNo']
        );

        this.conditionalForm.controls.quantity_type.setValue(data.poGrnDetails[0]['quantityType']);
        this.conditionalForm.controls.po_number.setValue(data.poGrnDetails[0]['poNumber']);
        setTimeout(() => {
          this.conditionalForm.controls.po_number.disable();
        }, 0);

        this.poGrnDetails = data.poGrnDetails;
        this.poGrnDetails.forEach((item: any) => {
          item.purchaseOrderNumber = item.poNumber;
          item.checked = true;
          item.disabled = true;
          this.totalGRNQuantity = Number(this.totalGRNQuantity) + Number(item['quantity']);
          this.totalGRNAmount = Number(this.totalGRNAmount) + Number(item['amount']);
        })
        this.totalGRNAmount = Number(this.totalGRNAmount).toFixed(2);
        this.selectedGRNArr = this.poGrnDetails;
        console.log('yyyyyyyiiii',this.selectedGRNArr);
        this.filterGrnDetails = this.poGrnDetails;
        this.plantCodeArr.push(data.plantCode);
        this.updatePagination();
        this.getBillToDetails();
      } else {
        console.log('No data found')
      }
    }, err => {
      console.log(err);
    })
  }

  /* View attachment of conditional invoice */
  viewAttachment() {
    console.log('viewAttachment');
    let filePath = this.commonService.editPurchaseData.Attachment[0].attachmentFilePath;
    filePath = this.commonService.getEncryptPath(filePath);

    let url = `getBase64FromPath?filePath=${filePath}`;
    // this.commonService.viewAttachment(filePath).subscribe((res:any)=>{

    this.commonService.spinner.show();
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res && res['status'] == 'Success' && res['data']) {
        let link = document.createElement('a');
        link.href = `data:application/pdf;base64,${res['data']}`;
        link.download = `${this.commonService.editPurchaseData['Invoice Number']}.pdf`;
        link.click();
      } else {
        console.log('viewAttachmenterror');
      }
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
    })
  }

  getBillToDetails() {
    // console.log('getBillToDetails');

    let url = `getBillToDetails?plantCode=${this.conditionalForm.value.plant_code}`;

    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      if (res?.['status'] == 'Success' && res['data'].length > 0) {
        this.apiBilltoData = res['data'][0];

        this.conditionalForm['controls']['all_gst_no'].setValue(this.apiBilltoData.allGstNo);
        this.pdfChildData['self']['STCODE'] = this.pdfChildData['self']['GST'].slice(0, 2),
          this.pdfChildData['self']['STATE'] = this.returnStateName(this.pdfChildData['self']['GST'].slice(0, 2)),

          this.pdfChildData['other'] = {
            NAME: this.apiBilltoData['allCompanyName'],
            ADDRESS: this.apiBilltoData['allGstAddress'],
            GST: this.apiBilltoData['allGstNo'],
            STCODE: this.apiBilltoData['allGstNo'].slice(0, 2),
            STATE: this.returnStateName(this.apiBilltoData['allGstNo'].slice(0, 2)),
            PINCODE: this.apiBilltoData['allPincode'],
          }
        this.pdfAllData['self'] = {
          NAME: this.apiBilltoData['allCompanyName'],
          ADDRESS: this.apiBilltoData['allGstAddress'],
          GST: this.apiBilltoData['allGstNo'],
          STCODE: this.apiBilltoData['allGstNo'].slice(0, 2),
          STATE: this.returnStateName(this.apiBilltoData['allGstNo'].slice(0, 2)),
          PINCODE: this.apiBilltoData['allPincode'],
          LOCATION: this.apiBilltoData['allLocation']
        }
        this.pdfAllData['other'] = {
          NAME: this.apiBilltoData['aaaPlantName'],
          ADDRESS: this.apiBilltoData['aaaPlantAddress'],
          GST: this.apiBilltoData['aaaGstNo'],
          STCODE: this.apiBilltoData['aaaGstNo'].slice(0, 2),
          STATE: this.returnStateName(this.apiBilltoData['aaaGstNo'].slice(0, 2)),
          PLANTCODE: this.apiBilltoData['aaaPlantCode'],
          PINCODE: this.apiBilltoData['aaaPincode'],
          LOCATION: this.apiBilltoData['aaaLocation'],
          PAN: this.apiBilltoData['aaaPanNo']
        }
        this.getOpenServiceALLPO();
      } else {
        this.toastMsg = 'No data available for plant, Contact Admin.'
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 2000)
      }
    }, err => {
      console.log(err);
    })

  }

  returnStateName(stateCode?: any) {
    let json = this.stateDetailsArr.find((item: any) => {
      return Number(item['stateCode']) == Number(stateCode)
    })
    return json['stateName'];
  }

  checkAllPONumber(event: any) {
    console.log('checkAllPONumber', this.allPoNumber);

    this.allPoNumber = '';
    if (event.target.value.length != 10) {
      return;
    }
    let start_code = event.target.value.slice(0, 2);
    if (start_code == '48' || start_code == '57') {
      this.allPoNumber = event.target.value;
    } else {
      this.toastMsg = 'ALL PO Number starts with 48 or 57';
      this.errorToast = true;
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
    }

  }

 generateInvoice(status?: any) {

  // Check if we have valid rates, if not try to get them again
  if (!this.isValidRate(this.allRate) && !this.isValidRate(this.aaaRate)) {
    console.log('No valid rates found, attempting to reload rates...');
    this.getPoItemsRates();

    // Show error if still no rates after reload attempt
    setTimeout(() => {
      if (!this.isValidRate(this.allRate) && !this.isValidRate(this.aaaRate)) {
        this.errorToast = true;
        this.toastMsg = 'No valid rates available. Please check rate configuration.';
        setTimeout(() => {
          this.errorToast = false;
        }, 3000);
        return;
      }
    }, 1000);
  }

  if (status == 'open') {
    this.updateGRNArrayWithNewRates();
    this.calculateVendorAndALLTax();
  }

  let ele = document.getElementById('content_1')?.style;
  if(ele && status == 'close_force'){
    ele.display = 'none';
    this.printAllCopy = false;
    this.printChildCopy = false;
    this.allPDFBase64 = [];
    this.childPDFBase64 = [];
    this.enableUploadDigital = false;
    this.uploadedDigitalSigned = [];
    return;
  }
  if (ele && status == 'open') {
    ele.width = '100%';
    ele.display = 'block';
    this.printChildCopy = true;
    this.printAllCopy = false; //false
  } else if (ele && status == 'close') {
    ele.display = 'none';
    this.printAllCopy = false;
  }
}

calculateVendorAndALLTax() {
  console.log('calculateVendorAndALLTax');

  // Use isValidRate instead of just checking for 0
  if (this.isValidRate(this.allRate)) {
    const vendorAmount = Number(this.calculateTotalAmountWithRate(this.allRate));
    const allAmount = Number(this.calculateTotalAmountWithRate(this.aaaRate));

    if (this.apiBilltoData.rcmFcm == 'FCM') {
      if (this.apiBilltoData.allGstNo.trim().slice(0, 2) == this.apiBilltoData.aaaGstNo.trim().slice(0, 2)) {
        this.pdfAllData['invoice'] = {
          cgst: Number(allAmount * (this.apiBilltoData['fcmGstPercentage'] / 2) / 100).toFixed(2),
          sgst: Number(allAmount * (this.apiBilltoData['fcmGstPercentage'] / 2) / 100).toFixed(2),
          igst: 0,
          ttax: Number(allAmount * (this.apiBilltoData['fcmGstPercentage'] / 2) / 100 + allAmount * (this.apiBilltoData['fcmGstPercentage'] / 2) / 100).toFixed(2),
          reversecharge: this.apiBilltoData.rcmFcm == 'RCM' ? 'YES' : 'NO'
        }
        this.pdfAllData['invoice']['tamount'] = Number(Number(this.pdfAllData['invoice'].ttax) + Number(allAmount)).toFixed(2)
      } else {
        this.pdfAllData['invoice'] = {
          cgst: 0,
          sgst: 0,
          igst: Number(allAmount * (this.apiBilltoData['fcmGstPercentage'] / 100)).toFixed(2),
          ttax: Number(allAmount * (this.apiBilltoData['fcmGstPercentage'] / 100)).toFixed(2),
          reversecharge: this.apiBilltoData.rcmFcm == 'RCM' ? 'YES' : 'NO'
        }
        this.pdfAllData['invoice']['tamount'] = Number(Number(this.pdfAllData['invoice'].ttax) + Number(allAmount)).toFixed(2)
      }
    } else {
      this.pdfAllData['invoice'] = {
        cgst: 0,
        sgst: 0,
        igst: 0,
        ttax: 0,
        reversecharge: this.apiBilltoData.rcmFcm == 'RCM' ? 'YES' : 'NO'
      }
      this.pdfAllData['invoice']['tamount'] = Number(Number(this.pdfAllData['invoice'].ttax) + Number(allAmount)).toFixed(2)
    }

    if (this.userdata['CHARGEMECHANISM'] == 'FCM') {
      if (this.apiBilltoData.allGstNo?.trim().slice(0, 2) == this.vendorBasicData.gst.trim().slice(0, 2)) {
        this.pdfChildData['invoice'] = {
          cgst: Number(vendorAmount * (9) / 100).toFixed(2),
          sgst: Number(vendorAmount * (9) / 100).toFixed(2),
          igst: 0,
          ttax: Number(vendorAmount * (9) / 100 + vendorAmount * (9) / 100).toFixed(2),
          reversecharge: this.userdata['CHARGEMECHANISM'] == 'RCM' ? 'YES' : 'NO'
        }
        this.pdfChildData['invoice']['tamount'] = Number(Number(this.pdfChildData['invoice'].ttax) + Number(vendorAmount)).toFixed(2)
      } else {
        this.pdfChildData['invoice'] = {
          cgst: 0,
          sgst: 0,
          igst: Number(vendorAmount * (18 / 100)).toFixed(2),
          ttax: Number(vendorAmount * (18 / 100)).toFixed(2),
          reversecharge: this.userdata['CHARGEMECHANISM'] == 'RCM' ? 'YES' : 'NO'
        }
        this.pdfChildData['invoice']['tamount'] = Number(Number(this.pdfChildData['invoice'].ttax) + Number(vendorAmount)).toFixed(2)
      }
    } else {
      this.pdfChildData['invoice'] = {
        cgst: 0,
        sgst: 0,
        igst: 0,
        ttax: 0,
        reversecharge: this.userdata['CHARGEMECHANISM'] == 'RCM' ? 'YES' : 'NO'
      }
      this.pdfChildData['invoice']['tamount'] = Number(this.pdfChildData['invoice'].ttax) + Number(vendorAmount)
    }

    if (this.selectedCreatedCondition.allPoId == 0) {
      this.getALLInvoiceNumber();
    } else {
      this.pdfAllData['invoice']['invoice_number'] = 'All invoice already created';
    }
  } else {
    // Use the original flow when allRate is not valid
    if (this.apiBilltoData.rcmFcm == 'FCM') {
      if (this.apiBilltoData.allGstNo.trim().slice(0, 2) == this.apiBilltoData.aaaGstNo.trim().slice(0, 2)) {
        this.pdfAllData['invoice'] = {
          cgst: Number(this.totalGRNAmount * (this.apiBilltoData['fcmGstPercentage'] / 2) / 100).toFixed(2),
          sgst: Number(this.totalGRNAmount * (this.apiBilltoData['fcmGstPercentage'] / 2) / 100).toFixed(2),
          igst: 0,
          ttax: Number(this.totalGRNAmount * (this.apiBilltoData['fcmGstPercentage'] / 2) / 100 + this.totalGRNAmount * (this.apiBilltoData['fcmGstPercentage'] / 2) / 100).toFixed(2),
          reversecharge: this.apiBilltoData.rcmFcm == 'RCM' ? 'YES' : 'NO'
        }
        this.pdfAllData['invoice']['tamount'] = Number(Number(this.pdfAllData['invoice'].ttax) + Number(this.totalGRNAmount)).toFixed(2)
      } else {
        this.pdfAllData['invoice'] = {
          cgst: 0,
          sgst: 0,
          igst: Number(this.totalGRNAmount * (this.apiBilltoData['fcmGstPercentage'] / 100)).toFixed(2),
          ttax: Number(this.totalGRNAmount * (this.apiBilltoData['fcmGstPercentage'] / 100)).toFixed(2),
          reversecharge: this.apiBilltoData.rcmFcm == 'RCM' ? 'YES' : 'NO'
        }
        this.pdfAllData['invoice']['tamount'] = Number(Number(this.pdfAllData['invoice'].ttax) + Number(this.totalGRNAmount)).toFixed(2)
      }
    } else {
      console.log('No Tax Calculation');
      this.pdfAllData['invoice'] = {
        cgst: 0,
        sgst: 0,
        igst: 0,
        ttax: 0,
        reversecharge: this.apiBilltoData.rcmFcm == 'RCM' ? 'YES' : 'NO'
      }
      this.pdfAllData['invoice']['tamount'] = Number(Number(this.pdfAllData['invoice'].ttax) + Number(this.totalGRNAmount)).toFixed(2)
    }

    if (this.userdata['CHARGEMECHANISM'] == 'FCM') {
      if (this.apiBilltoData.allGstNo.trim().slice(0, 2) == this.vendorBasicData.gst.trim().slice(0, 2)) {
        this.pdfChildData['invoice'] = {
          cgst: Number(this.totalGRNAmount * (9) / 100).toFixed(2),
          sgst: Number(this.totalGRNAmount * (9) / 100).toFixed(2),
          igst: 0,
          ttax: Number(this.totalGRNAmount * (9) / 100 + this.totalGRNAmount * (9) / 100).toFixed(2),
          reversecharge: this.userdata['CHARGEMECHANISM'] == 'RCM' ? 'YES' : 'NO'
        }
        this.pdfChildData['invoice']['tamount'] = Number(Number(this.pdfChildData['invoice'].ttax) + Number(this.totalGRNAmount)).toFixed(2)
      } else {
        this.pdfChildData['invoice'] = {
          cgst: 0,
          sgst: 0,
          igst: Number(this.totalGRNAmount * (18 / 100)).toFixed(2),
          ttax: Number(this.totalGRNAmount * (18 / 100)).toFixed(2),
          reversecharge: this.userdata['CHARGEMECHANISM'] == 'RCM' ? 'YES' : 'NO'
        }
        this.pdfChildData['invoice']['tamount'] = Number(Number(this.pdfChildData['invoice'].ttax) + Number(this.totalGRNAmount)).toFixed(2)
      }
    } else {
      console.log('No Tax Calculation');
      this.pdfChildData['invoice'] = {
        cgst: 0,
        sgst: 0,
        igst: 0,
        ttax: 0,
        reversecharge: this.userdata['CHARGEMECHANISM'] == 'RCM' ? 'YES' : 'NO'
      }
      this.pdfChildData['invoice']['tamount'] = Number(this.pdfChildData['invoice'].ttax) + Number(this.totalGRNAmount)
    }

    if (this.selectedCreatedCondition.allPoId == 0) {
      this.getALLInvoiceNumber();
    } else {
      this.pdfAllData['invoice']['invoice_number'] = 'All invoice already created';
    }
  }
  console.log("this.pdfChildData['invoice']",this.pdfChildData['invoice'])
}


  generateChildPDF() {
    console.log('generateChildPDF');

    this.commonService.spinner.show();

    const content = document.getElementById('content');
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');

    const pdf = new jsPDF("p", "mm", "a4");

    // if (content) {
    if (page1) {
      domtoimage.toJpeg(page1, {
        quality: 1, width: page1.scrollWidth * 2,
        height: page1.scrollHeight * 2,
        style: { transform: "scale(2)", transformOrigin: "top left" }
      }).then((imgData: any) => {

        const img = new Image();
        img.src = imgData;

        img.onload = () => {
          const imgWidth = 210; // A4 width in mm
          let imgHeight = (img.height / img.width) * imgWidth; // Maintain aspect ratio

          const pageHeight = 297;
          let y = 0; // Starting Y position for pages

          imgHeight = 160;
          let pageCount = Math.ceil(imgHeight / pageHeight);
          pdf.addImage(img, "JPEG", 0, -y, imgWidth, imgHeight); // Shift image up
          pdf.addPage();

          if (page2) {
            domtoimage.toJpeg(page2, {
              quality: 1, width: page2.scrollWidth * 2,
              height: page2.scrollHeight * 2,
              style: { transform: "scale(2)", transformOrigin: "top left", paddingTop: '40px', paddingBottom: '40px', }
            }).then((imgData: any) => {
              const img1 = new Image();
              img1.src = imgData;
              img1.onload = () => {
                const imgWidth = 210; // A4 width in mm
                const imgHeight = (img1.height / img1.width) * imgWidth; // Maintain aspect ratio

                const pageHeight = 297; //297;
                let y = 0; // Starting Y position for pages

                let pageCount = Math.ceil(imgHeight / pageHeight);
                /* while (y < imgHeight) {
                  if (y > 0) pdf.addPage(); // Add new page after first one
                  pdf.addImage(img, "PNG", 0, -y, imgWidth, imgHeight);
                  y += 297; // Move down by A4 height
                } */

                for (let i = 0; i < pageCount; i++) {
                  if (i > 0) pdf.addPage(); // Add new page after first

                  // pdf.addImage(img, "PNG", 0, -y, imgWidth, imgHeight); // Shift image up
                  pdf.addImage(img1, "JPEG", 0, -y, imgWidth, imgHeight); // Shift image up
                  y += pageHeight; // Move down by A4 height
                }

                const base64PDF = pdf.output('datauristring');
                base64PDF.split(',')[1];
                let attach_json = [{
                  fileName: 'generated.pdf',
                  fileBase64: base64PDF.split(',')[1]
                }]

                this.childPDFBase64 = attach_json;
                //print transporter copy on local
                //pdf.save(`${this.conditionalForm.value.invoice_number}.pdf`);  // download pdf
                this.printChildCopy = false;
                this.printAllCopy = true;
                setTimeout(() => {
                  if(this.selectedCreatedCondition.allPoId == 0 && this.roleName != 'AAA_T'){
                    this.generateALLPDF();
                  }else{
                    this.allPDFBase64.push({});
                    this.commonService.spinner.hide();
                    this.generateInvoice('close');
                  }
                }, 500);
                // pdf.save()
              }
            })
          }
        };
        return
      });
    }
  }

  generateALLPDF() {
    console.log('generateALLPDF');

    const content = document.getElementById('content');
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');

    const pdf = new jsPDF("p", "mm", "a4");

    // if (content) {
    if (page1) {
      domtoimage.toJpeg(page1, {
        quality: 1, width: page1.scrollWidth * 2,
        height: page1.scrollHeight * 2,
        style: { transform: "scale(2)", transformOrigin: "top left" }
      }).then((imgData: any) => {

        const img = new Image();
        img.src = imgData;

        img.onload = () => {
          const imgWidth = 210; // A4 width in mm
          let imgHeight = (img.height / img.width) * imgWidth; // Maintain aspect ratio

          const pageHeight = 297;
          let y = 0;

          imgHeight = 160;
          let pageCount = Math.ceil(imgHeight / pageHeight);
          pdf.addImage(img, "JPEG", 0, -y, imgWidth, imgHeight);
          pdf.addPage();

          if (page2) {
            domtoimage.toJpeg(page2, {
              quality: 1, width: page2.scrollWidth * 2,
              height: page2.scrollHeight * 2,
              style: { transform: "scale(2)", transformOrigin: "top left", paddingTop: '40px', paddingBottom: '40px', }
            }).then((imgData: any) => {

              const img1 = new Image();
              img1.src = imgData;
              img1.onload = () => {
                const imgWidth = 210; // A4 width in mm
                const imgHeight = (img1.height / img1.width) * imgWidth; // Maintain aspect ratio

                const pageHeight = 297;
                let y = 0;

                let pageCount = Math.ceil(imgHeight / pageHeight);
                for (let i = 0; i < pageCount; i++) {
                  if (i > 0) pdf.addPage(); // Add new page after first
                  pdf.addImage(img1, "JPEG", 0, -y, imgWidth, imgHeight); // Shift image up
                  y += pageHeight; // Move down by A4 height
                }

                const base64PDF = pdf.output('datauristring');
                base64PDF.split(',')[1];
                let attach_json = [{
                  fileName: 'generated.pdf',
                  fileBase64: base64PDF.split(',')[1]
                }]
                this.allPDFBase64 = attach_json;
                  //  pdf.save()
                // pdf.save("all_invoice.pdf");  // download pdf  to check all invoice format
                this.commonService.spinner.hide();
                setTimeout(() => {
                  this.generateInvoice('close');
                }, 0);
             
              }
            })
          }
        };
      });
    }
  }

  submitALLConditionalInvoice(event?: any) {
    // console.log('submitALLConditionalInvoice');

    this.commonService.spinner.show();

    // this.getChildPDFMerged();
    if(this.selectedCreatedCondition.allPoId == 0){
      this.getALLPDFMerged();
    }else{
      this.mergeALLAndSupportPDF.push({});
      this.submitFinalALLConditionalInvoice();
    }
  }

  getChildPDFMerged() {
    let json = [...this.childPDFBase64, ...this.selectedAllAttachmentSupport];
    let url = `mergePDF`;

    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      if (res['status'] == 'Success' && res['data'] != '') {
        let a = document.createElement('a');
        a.href = `data:application/pdf;base64,${res.data}`;
        a.download = 'vendorInvoice.pdf';
        a.click();
        this.mergeChildAndSupportPDF.push({
          fileName: 'vendorInvoice.pdf',
          fileBase64: res['data']
        });
        this.submitFinalALLConditionalInvoice();
      }
    }, err => {
      console.log(err?.error?.message);
    })
  }

  getALLPDFMerged() {
    let json = [...this.allPDFBase64, ...this.selectedAllAttachmentSupport];
    let url = `mergePDF`;

    this.commonService.spinner.show();
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      if (res['status'] == 'Success' && res['data'] != '') {
        this.mergeALLAndSupportPDF.push({
          fileName: 'allInvoice.pdf',
          fileBase64: res['data']
        });
        this.submitFinalALLConditionalInvoice();
      }
    }, err => {
      console.log(err?.error?.message);
    })
  }

  submitFinalALLConditionalInvoice() {
    // console.log('submitFinalALLConditionalInvoice');

    // if(this.mergeChildAndSupportPDF.length>0 && this.mergeALLAndSupportPDF.length>0){  //earlier for child vendor merger\ fil
    if (this.uploadedDigitalSigned.length > 0 && this.mergeALLAndSupportPDF.length > 0) {
      console.log('merge file generated');
      this.submitBothInvoiceTransactional();
      // this.submitConditionalForm();
      // this.submitALLInvoice();
    }
  }

  submitALLInvoice() {
    console.log('submitALLInvoice');

    let selected = this.createdConditionData.find((item: any) => {
      return item['conditionType'] == this.conditionalForm.value.condition_type && item['poItemNo'] == this.conditionalForm.value.po_item_no && item['poNumber'] == this.conditionalForm.value.po_number && item['quantityType'] == this.conditionalForm.value.quantity_type
    })

    if (this.conditionalForm.valid == false) {
      this.errorToast = true;
      this.toastMsg = 'Form is invalid';
      return;
    }

    let json: any = {
      invoiceType: this.conditionalForm['controls']['invoice_type'].value ? this.conditionalForm['controls']['invoice_type'].value : null,
      poItemNumber: this.conditionalForm['controls']['po_number'].value,
      poNumber: this.conditionalForm['controls']['po_number'].value,
      // invoiceNumber: this.conditionalForm['controls']['invoice_number'].value,
      // poNumber : this.allPoNumber,
      invoiceNumber: this.pdfAllData['invoice']['invoice_number'],
      invoiceDate: moment(new Date(this.conditionalForm['controls']['invoice_date'].value)).format('YYYY-MM-DD HH:mm:ss'),

      invoiceAmount: this.conditionalForm['controls']['invoice_amount'].value,
      totalInvoiceAmount: this.conditionalForm['controls']['invoice_amount'].value,

      paymentMode: this.conditionalForm['controls']['payment_mode'].value ? this.conditionalForm['controls']['payment_mode'].value : null,
      /* receiverGST: this.conditionalForm['controls']['rece_gst_no'].value?this.conditionalForm['controls']['rece_gst_no'].value:null,
      supplierGST: this.conditionalForm['controls']['supp_gst_no'].value?this.conditionalForm['controls']['supp_gst_no'].value:null,
      supplierChildGST: this.conditionalForm['controls']['child_gst'].value?this.conditionalForm['controls']['child_gst'].value:null,
      childVendorCode: this.childVendorCode?this.childVendorCode:null, */

      receiverGST: this.pdfAllData['other']['GST'] ? this.pdfAllData['other']['GST'] : null,
      supplierGST: this.pdfAllData['self']['GST'] ? this.pdfAllData['self']['GST'] : null,
      supplierChildGST: this.pdfAllData['self']['GST'] ? this.pdfAllData['self']['GST'] : null,
      childVendorCode: this.selectedGRNArr[0]['childVendorCode'] ? this.selectedGRNArr[0]['childVendorCode'] : null,

      poGRNItems: this.selectedGRNArr,

      materialGroup: '', //this.poDetail.materialGroup,
      sapStatus: 0,
      companyCode: this.selectedCreatedCondition.companyCode,
      plantCode: this.conditionalForm.value.plant_code,
      status: 'pending',
      // createdBy : this.userdata['ACCOUNTNUMBER'],
      createdBy: this.selectedGRNArr[0]['parentVendorCode'],
      createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      // updatedBy : this.username,
      updatedBy: this.selectedGRNArr[0]['parentVendorCode'],
      updatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      conditionId: selected['conditionId'],
      submissionTo: selected['createdBy'],

      matDescription: 'Freight Bill-Goods Transportation',
      sacCode: 996791,
      quantity: this.totalGRNQuantity,
      netAamount: this.totalGRNAmount,
      uom: 'MT',
      cgst: this.pdfAllData['invoice']['cgst'],
      sgst: this.pdfAllData['invoice']['sgst'],
      igst: this.pdfAllData['invoice']['igst'],
      tax: this.pdfAllData['invoice']['ttax'],
      totalAmount: this.pdfAllData['invoice']['tamount'],
      reverseCharge: this.pdfAllData['invoice']['reversecharge'],
      irnNo: this.pdfAllData['invoice']['irn'] ? this.pdfAllData['invoice']['irn'] : null,
      itemMaterialDes: this.selectedGRNArr[0]['materialDes'],
      remarks: this.conditionalForm.value.invoice_number + '-' + this.pdfAllData['invoice']['invoice_number'],

      attach: this.mergeALLAndSupportPDF,
      isALLInvoice: 2,
    }

    let url = `PostPOInvoice`;
    this.commonService.spinner.show();

    // this.commonService.purchaseOrder(json).subscribe((res:any)=>{
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res && res['status'] == 'Success') {
        this.successToast = true;
        this.toastMsg = 'Records have been updated successfully';

        this.submitStatus.allPoId = res.data;
        if (this.submitStatus.transporterPoId && this.submitStatus.allPoId) {
          this.sendJsonForEmail();
          this.updateConditionStatus();
          this.commonService.routeToPage('./dashboard');
        }
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

  getALLInvoiceNumber() {
    console.log('getALLInvoiceNumber');

    let url = `generateAllInvoiceNumber`;
    let json = {
      'commodity': this.selectedGRNArr[0]['materialDes'].slice(0, 4),
      'plantCode': this.conditionalForm.controls['plant_code'].value
    }

    this.commonService.spinner.show();
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res.status == 'Success' && res.data) {
        this.pdfAllData['invoice']['invoice_number'] = res.data;
      }
      // this.getALLIRNNumber();
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
      this.toastMsg = 'Failed to create ALL Invoice Number';
      this.errorToast = true;
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
    })

  }

  getALLIRNNumber() {
    const poInvoice2Amount = this.isValidRate(this.aaaRate)
    ? this.calculateTotalAmountWithRate(this.aaaRate)
    : this.totalGRNAmount;
    let url = `generateIRNNumber`;
    let json = {
      "invoices": [
        {
          "DocDtls": {    //  //request from ui
            "Typ": "INV",
            "No": this.pdfAllData['invoice']['invoice_number'], //all invoice number
            "Dt": moment(new Date).format("DD/MM/YYYY")  // current date
          },
          "TranDtls": {
            "SupTyp": "B2B",
            "RegRev": "N",
            "IgstOnIntra": null,
            "EcmGstin": null
          },
          "SellerDtls": {     //ALL Details  //request from ui
            "Gstin": this.pdfAllData['self']['GST']?.trim(),
            "LglNm": this.pdfAllData['self']['NAME']?.trim(),
            "TrdNm": this.pdfAllData['self']['NAME']?.trim(),
            "Addr1": this.pdfAllData['self']['ADDRESS']?.trim().slice(0, 98),
            "Addr2": "",
            "Loc": this.pdfAllData['self']['LOCATION']?.trim(),
            "Pin": this.pdfAllData['self']['PINCODE']?.trim(),
            "Stcd": this.pdfAllData['self']['GST'].trim().slice(0, 2),
            "Ph": null,
            "Em": null
          },

          "BuyerDtls": { //billto plant details  //request from ui
            "Gstin": this.pdfAllData['other']['GST']?.trim(),
            "LglNm": this.pdfAllData['other']['NAME']?.trim(),
            "TrdNm": this.pdfAllData['other']['NAME']?.trim(),
            "Addr1": this.pdfAllData['other']['ADDRESS']?.trim().slice(0, 98),
            "Addr2": "",
            "Loc": this.pdfAllData['other']['LOCATION'] ? this.pdfAllData['other']['LOCATION']?.trim() : '',
            "Pin": this.pdfAllData['other']['PINCODE'] ? this.pdfAllData['other']['PINCODE']?.trim() : '',
            "Stcd": this.pdfAllData['other']['GST'].trim().slice(0, 2),
            "Pos": this.pdfAllData['other']['GST'].trim().slice(0, 2),
            "Ph": null,
            "Em": null
          },

          "ShipDtls": {     //request from ui
            "Gstin": this.pdfAllData['other']['GST']?.trim(),
            "LglNm": this.pdfAllData['other']['NAME']?.trim(),
            "TrdNm": this.pdfAllData['other']['NAME']?.trim(),
            "Addr1": this.pdfAllData['other']['ADDRESS']?.trim().slice(0, 98),
            "Addr2": "",
            "Loc": this.pdfAllData['other']['LOCATION']?.trim(),
            "Pin": this.pdfAllData['other']['PINCODE']?.trim(),
            "Stcd": this.pdfAllData['other']['GST'].trim().slice(0, 2),
          },

          "ItemList": [    //request from ui
            {
              "SlNo": "1",   //1
              "PrdDesc": "Freight Bill - Good Transportation", //prd desc
              "IsServc": "Y",   //Y
              "HsnCd": "996791",  //sac
              "Barcde": null,
              // "Qty": this.totalGRNQuantity.toString(),
              "Qty": Number(this.totalGRNQuantity.toFixed(3)),
              "FreeQty": "0", //0
              "Unit": "MT",
              "UnitPrice": 1,  //1
              "TotAmt": poInvoice2Amount,  //amount
              "Discount": "0", //0
              "PreTaxVal": 0, //0
              "AssAmt": poInvoice2Amount,  //totalamou
              "GstRt": this.apiBilltoData['rcmFcm']=='FCM'?this.apiBilltoData['fcmGstPercentage'].toString():(this.apiBilltoData['rcmGstPercentage']!=null?this.apiBilltoData['rcmGstPercentage']:0),  //req from
              "CgstAmt": Number(this.pdfAllData['invoice']['cgst']),
              "SgstAmt": Number(this.pdfAllData['invoice']['sgst']),
              "IgstAmt": Number(this.pdfAllData['invoice']['igst']),
              "CesRt": 0,
              "CesAmt": 0,
              "CesNonAdvlAmt": 0,
              "StateCesRt": 0,
              "StateCesAmt": 0,
              "StateCesNonAdvlAmt": 0,
              "OthChrg": 0,
              "TotItemVal": this.pdfAllData['invoice']['tamount'].toString(),  //ass +tax
              "OrdLineRef": null,
              "OrgCntry": null,
              "PrdSlNo": null
            }
          ],

          "ValDtls": {    // will take from itemlist
            "AssVal": poInvoice2Amount,
            "CgstVal": Number(this.pdfAllData['invoice']['cgst']),
            "SgstVal": Number(this.pdfAllData['invoice']['sgst']),
            "IgstVal": Number(this.pdfAllData['invoice']['igst']),
            "CesVal": 0,
            "StCesVal": 0,
            "Discount": "0.00",
            "OthChrg": "0.00",
            "RndOffAmt": "0.00",
            "TotInvVal": this.pdfAllData['invoice']['tamount'].toString()
          }
        }
      ]
    }
    return json;

    this.commonService.spinner.show();
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res.invoices && res.invoices[0]?.['Status']) {
        if (res['invoices'][0]['Irn']) {
          this.pdfAllData['invoice']['irn'] = res['invoices'][0]['Irn'];
          this.qrCodeImageUrl = res['invoices'][0]['QrCodeImage'];
          this.printChildCopy = true;
        } else {
          this.toastMsg = res['invoices'][0]['Message'];
        }
      }
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
    })
  }

  sendJsonForEmail() {
    console.log('sendJsonForEmail');

    /* let plantData = this.plantCodeArr.find((item:any)=>{
      return item['plantCode'] == this.conditionalForm.value.plant_code
    }) */

    let url = `triggerMailForAll`;
    let json = {
      "plant": this.conditionalForm.value.plant_code,
      "poNo": this.conditionalForm.value.po_number,
      "vendorName": this.userdata['NAME'],
      "invoiceNo": this.conditionalForm.value.invoice_number,
      "period": moment(this.selectedCreatedCondition.fromDate).format('DD-MMM-YYYY') + ' to ' + moment(this.selectedCreatedCondition.toDate).format('DD-MMM-YYYY'),
      "valueRs": this.pdfChildData['invoice']['tamount'].toString(),
      "attach": this.uploadedDigitalSigned,
      "plantName": this.conditionalForm.value.plant_code,
    }

    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
    }, err => {
      console.log(err);
    })
  }

  updateConditionStatus() {
    // console.log('updateConditionStatus');

    let url = `postConditionRequest`;
    this.selectedCreatedCondition.status = 'submitted';

    this.selectedCreatedCondition.updatedBy = this.username;
    this.selectedCreatedCondition.updatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

    this.selectedCreatedCondition.transporterPoId = this.submitStatus.transporterPoId;

    if(this.selectedCreatedCondition.allPoId == 0){
      this.selectedCreatedCondition.allPoId = this.submitStatus.allPoId;
    }

    this.commonService.dataPost(url, this.selectedCreatedCondition).subscribe((res: any) => {
      // console.log(res);
      this.commonService.spinner.hide();
      if (res && res.status == 'Success') {
        console.log('Condition Status Updated');
      }
    }, err => {
      this.commonService.spinner.hide();
    })
  }

  getVendorsList() {
    // console.log('getVendorsList');

    this.commonService.spinner.show();
    let url = `getVendorList`;

    this.commonService.dataGet(url).subscribe((res: any) => {
      // console.log(res);
      this.commonService.spinner.hide();
      if (this.viewConditional == false) {
        this.commonService.spinner.hide();
      }
      if (res && res['status'] == 'Success' && res['data'].length > 0) {
        this.vendorArray = res['data'];
      } else {
        this.vendorArray = [];
      }
    }, err => {
      this.commonService.spinner.hide();
      // console.log(err);
    })
  }

  // submitBothInvoiceTransactional() {
  //   console.log('submitBothInvoiceTransactional');

  //   let selected = this.createdConditionData.find((item: any) => {
  //     return item['conditionType'] == this.conditionalForm.value.condition_type && item['poItemNo'] == this.conditionalForm.value.po_item_no && item['poNumber'] == this.conditionalForm.value.po_number && item['quantityType'] == this.conditionalForm.value.quantity_type
  //   })

  //   if (this.conditionalForm.valid == false) {
  //     this.errorToast = true;
  //     this.toastMsg = 'Form is invalid';
  //     return;
  //   }

  //   let url = `postPOInvoice`;
  //   let json: any = {
  //     'poInvoice1': {
  //       invoiceType: this.conditionalForm['controls']['invoice_type'].value ? this.conditionalForm['controls']['invoice_type'].value : null,
  //       // poNumber : this.conditionalForm['controls']['po_number'].value,
  //       poNumber: this.selectedALLPO.po_number, //this.allPoNumber,
  //       // poALLItemNumber: this.selectedALLPO.po_line_item,
  //       // poItemNumber: this.conditionalForm['controls']['po_item_no'].value,
  //       poItemNumber: this.selectedALLPO.po_line_item,
  //       invoiceNumber: this.conditionalForm['controls']['invoice_number'].value,
  //       invoiceDate: moment(new Date(this.conditionalForm['controls']['invoice_date'].value)).format('YYYY-MM-DD HH:mm:ss'),

  //       invoiceAmount: this.conditionalForm['controls']['invoice_amount'].value,
  //       totalInvoiceAmount: this.conditionalForm['controls']['invoice_amount'].value,

  //       paymentMode: this.conditionalForm['controls']['payment_mode'].value ? this.conditionalForm['controls']['payment_mode'].value : null,
  //       // receiverGST: this.conditionalForm['controls']['rece_gst_no'].value?this.conditionalForm['controls']['rece_gst_no'].value:null,
  //       receiverGST: this.pdfAllData['self']['GST'] ? this.pdfAllData['self']['GST'] : null,
  //       supplierGST: this.conditionalForm['controls']['supp_gst_no'].value ? this.conditionalForm['controls']['supp_gst_no'].value : null,
  //       supplierChildGST: this.conditionalForm['controls']['child_gst'].value ? this.conditionalForm['controls']['child_gst'].value : null,
  //       childVendorCode: this.childVendorCode ? this.childVendorCode : null,
  //       childVendorName: this.selectedGRNArr[0]['childVendorName'] ? this.selectedGRNArr[0]['childVendorName'] : null,

  //       poGRNItems: this.selectedGRNArr,

  //       materialGroup: '', // this.poDetail.materialGroup,
  //       sapStatus: 0,
  //       companyCode: this.selectedCreatedCondition.companyCode,
  //       plantCode: this.conditionalForm.value.plant_code,
  //       status: 'submitted',
  //       // status: 'pending',
  //       createdBy: this.userdata['ACCOUNTNUMBER'],
  //       createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  //       updatedBy: this.username,
  //       updatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  //       conditionId: selected['conditionId'],
  //       submissionTo: selected['createdBy'],

  //       matDescription: 'Freight Bill-Goods Transportation',
  //       sacCode: this.userdata.SACCODE,
  //       rate: this.selectedGRNArr[0]['rate'],
  //       // quantity: this.totalGRNQuantity,
  //       quantity: Number(this.totalGRNQuantity.toFixed(3)),
  //       uom: 'MT',
  //       netAamount: this.totalGRNAmount,
  //       cgst: this.pdfChildData?.['invoice']?.['cgst'] ? this.pdfChildData['invoice']['cgst'] : 0,
  //       sgst: this.pdfChildData?.['invoice']?.['sgst'] ? this.pdfChildData['invoice']['sgst'] : 0,
  //       igst: this.pdfChildData?.['invoice']?.['igst'] ? this.pdfChildData['invoice']['igst'] : 0,
  //       tax: this.pdfChildData?.['invoice']?.['ttax'] ? this.pdfChildData['invoice']['ttax'] : 0,
  //       totalAmount: this.pdfChildData?.['invoice']?.['tamount'] ? this.pdfChildData['invoice']['tamount'] : 0,
  //       reverseCharge: this.pdfChildData?.['invoice']?.['reversecharge'] ? this.pdfChildData['invoice']['reversecharge'] : '',
  //       irnNo: '',
  //       itemMaterialDes: this.selectedGRNArr[0]['materialDes'],
  //       remarks: this.conditionalForm.value.invoice_number + '-' + this.pdfAllData['invoice']['invoice_number'],
  //       isALLInvoice: 1,
  //       attach: this.uploadedDigitalSigned,
  //     },
  //     'poInvoice2': {
  //       invoiceType: this.conditionalForm['controls']['invoice_type'].value ? this.conditionalForm['controls']['invoice_type'].value : null,
  //       poItemNumber: this.conditionalForm['controls']['po_item_no'].value,
  //       poNumber: this.conditionalForm['controls']['po_number'].value,
  //       // invoiceNumber: this.conditionalForm['controls']['invoice_number'].value,
  //       // poNumber : this.allPoNumber,
  //       invoiceNumber: this.pdfAllData['invoice']['invoice_number'],
  //       invoiceDate: moment(new Date(this.conditionalForm['controls']['invoice_date'].value)).format('YYYY-MM-DD HH:mm:ss'),

  //       invoiceAmount: this.conditionalForm['controls']['invoice_amount'].value,
  //       totalInvoiceAmount: this.conditionalForm['controls']['invoice_amount'].value,

  //       paymentMode: this.conditionalForm['controls']['payment_mode'].value ? this.conditionalForm['controls']['payment_mode'].value : null,

  //       receiverGST: this.pdfAllData['other']['GST'] ? this.pdfAllData['other']['GST'] : null,
  //       supplierGST: this.pdfAllData['self']['GST'] ? this.pdfAllData['self']['GST'] : null,
  //       supplierChildGST: this.pdfAllData['self']['GST'] ? this.pdfAllData['self']['GST'] : null,
  //       childVendorCode: this.selectedGRNArr[0]['childVendorCode'] ? this.selectedGRNArr[0]['childVendorCode'] : null,
  //       childVendorName: this.selectedGRNArr[0]['childVendorName'] ? this.selectedGRNArr[0]['childVendorName'] : null,

  //       poGRNItems: this.selectedGRNArr,

  //       materialGroup: '', //this.poDetail.materialGroup,
  //       sapStatus: 0,
  //       companyCode: this.selectedCreatedCondition.companyCode,
  //       plantCode: this.conditionalForm.value.plant_code,
  //       status: 'pending',

  //       createdBy: this.selectedGRNArr[0]['parentVendorCode'],
  //       createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  //       updatedBy: this.selectedGRNArr[0]['parentVendorCode'],
  //       updatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  //       conditionId: selected['conditionId'],
  //       submissionTo: selected['createdBy'],

  //       matDescription: 'Freight Bill-Goods Transportation',
  //       sacCode: 996791,
  //       rate: this.selectedGRNArr[0].rate,
  //       // quantity: this.totalGRNQuantity,
  //       quantity: Number(this.totalGRNQuantity.toFixed(3)),
  //       netAamount: this.totalGRNAmount,
  //       uom: 'MT',
  //       cgst: this.pdfAllData['invoice']['cgst'],
  //       sgst: this.pdfAllData['invoice']['sgst'],
  //       igst: this.pdfAllData['invoice']['igst'],
  //       tax: this.pdfAllData['invoice']['ttax'],
  //       totalAmount: this.pdfAllData['invoice']['tamount'],
  //       reverseCharge: this.pdfAllData['invoice']['reversecharge'],
  //       irnNo: this.pdfAllData['invoice']['irn'] ? this.pdfAllData['invoice']['irn'] : null,
  //       itemMaterialDes: this.selectedGRNArr[0]['materialDes'],
  //       remarks: this.conditionalForm.value.invoice_number + '-' + this.pdfAllData['invoice']['invoice_number'],

  //       attach: this.mergeALLAndSupportPDF,
  //       isALLInvoice: 2,
  //     }
  //   }


  //   // if(!json.poInvoice2.itemMaterialDes.toLowerCase().includes('coal')){
  //     if(Number((moment(this.selectedCreatedCondition.fromDate).format('MM')))<7 && Number((moment(this.selectedCreatedCondition.fromDate).format('YYYY'))) <= 2025 || this.selectedCreatedCondition.allPoId != 0){    // All invoice will not generate for period before Jul 2025
  //       // deleting json for all invoice
  //       delete json.poInvoice2;
  //     }
  //   // }
  //   this.commonService.spinner.show();
  //   this.commonService.dataPost(url, json).subscribe((res: any) => {
  //     console.log(res);
  //     this.commonService.spinner.hide();
  //     if (res && res['status'] == 'Success') {
  //       this.successToast = true;
  //       this.toastMsg = 'Records have been updated successfully';

  //       this.submitStatus = res.data;
  //       if (this.submitStatus.transporterPoId && this.submitStatus.allPoId) {
  //         // this.sendJsonForEmail();
  //         this.updateConditionStatus();
  //         this.generateSES();
  //         // this.genearteFIEntryJson();
  //         this.generateIRNAndFIRRequestJson();
  //         this.commonService.routeToPage('./dashboard');
  //       }else if(this.submitStatus.transporterPoId){
  //         // this.sendJsonForEmail();
  //         this.updateConditionStatus();
  //         this.generateSES();
  //         this.commonService.routeToPage('./dashboard');
  //       }

  //       setTimeout(() => {
  //         this.successToast = false;
  //       }, 2000);
  //     } else {
  //       this.errorToast = true;
  //       this.toastMsg = res['message'];
  //     }
  //   }, err => {
  //     console.log(err);
  //     this.commonService.spinner.hide();
  //     this.errorToast = true;
  //     this.toastMsg = err['message'];
  //   })
  // }

// ...existing code...

updateGRNArrayWithNewRates() {
  console.log('Available rates before update:');
  console.log('allRate:', this.allRate, 'isValid:', this.isValidRate(this.allRate));
  console.log('aaaRate:', this.aaaRate, 'isValid:', this.isValidRate(this.aaaRate));

  // Determine which rate to use - fallback to aaaRate if allRate is invalid
  let rateToUse: number; // Explicitly type as number
  if (this.isValidRate(this.allRate)) {
    rateToUse = Number(this.allRate);
    console.log('Using allRate:', rateToUse);
  } else if (this.isValidRate(this.aaaRate)) {
    rateToUse = Number(this.aaaRate);
    console.log('Using aaaRate as fallback:', rateToUse);
  } else if (this.selectedGRNArr.length > 0 && this.isValidRate(this.selectedGRNArr[0]?.rate)) {
    rateToUse = Number(this.selectedGRNArr[0].rate);
    console.log('Using GRN rate as final fallback:', rateToUse);
  } else {
    rateToUse = 0; // or some default value
    console.log('No valid rate found, using default:', rateToUse);
    this.errorToast = true;
    this.toastMsg = 'No valid rate found. Please check rate configuration.';
    setTimeout(() => {
      this.errorToast = false;
    }, 3000);
  }

  // Update the selectedGRNArr with the appropriate rate
  this.selectedGRNArr = this.selectedGRNArr.map((item: any) => ({
    ...item,
    rate: rateToUse,
    amount: Number(Number(item['quantity']) * Number(rateToUse)).toFixed(2)
  }));

  // Recalculate total amounts
  this.totalGRNAmount = 0;
  this.totalGRNQuantity = 0;

  this.selectedGRNArr.map((item: any) => {
    this.totalGRNQuantity = Number(this.totalGRNQuantity) + Number(item['quantity']);
    this.totalGRNAmount = Number(Number(this.totalGRNAmount) + Number(item['amount'])).toFixed(2);
  });

  // Update the form controls
  this.conditionalForm['controls']['invoice_amount'].setValue(this.totalGRNAmount);
  this.conditionalForm['controls']['invoice_quantity'].setValue(this.totalGRNQuantity);

  console.log('After update - totalGRNAmount:', this.totalGRNAmount, 'totalGRNQuantity:', this.totalGRNQuantity);
}

getGRNArrayWithAllRate() {
  // Determine which rate to use - fallback to aaaRate if allRate is invalid
  let rateToUse: number; // Explicitly type as number
  if (this.isValidRate(this.allRate)) {
    rateToUse = Number(this.allRate);
  } else if (this.isValidRate(this.aaaRate)) {
    rateToUse = Number(this.aaaRate);
  } else if (this.selectedGRNArr.length > 0 && this.isValidRate(this.selectedGRNArr[0]?.rate)) {
    rateToUse = Number(this.selectedGRNArr[0].rate);
  } else {
    rateToUse = 0;
  }

  const AllRate = this.selectedGRNArr.map((item: any) => ({
    ...item,
    rate: rateToUse,
    amount: Number(Number(item['quantity']) * Number(rateToUse)).toFixed(2)
  }));
  return AllRate;
}

getGRNArrayWithAAARate() {
  const rateToUse: number = this.isValidRate(this.aaaRate) ? Number(this.aaaRate) : Number(this.selectedGRNArr[0]?.rate || 0);

  const AAARate = this.selectedGRNArr.map((item: any) => ({
    ...item,
    rate: rateToUse,
    amount: Number(Number(item['quantity']) * Number(rateToUse)).toFixed(2)
  }));
  return AAARate;
}

calculateTotalAmountWithRate(rate: number) {
  let totalAmount = 0;

  // Determine which rate to use for calculation
  let rateToUse: number; // Explicitly type as number
  if (this.isValidRate(rate)) {
    rateToUse = Number(rate);
  } else if (this.isValidRate(this.aaaRate)) {
    rateToUse = Number(this.aaaRate);
  } else if (this.selectedGRNArr.length > 0 && this.isValidRate(this.selectedGRNArr[0]?.rate)) {
    rateToUse = Number(this.selectedGRNArr[0].rate);
  } else {
    rateToUse = 0;
  }

  this.selectedGRNArr.forEach((item: any) => {
    totalAmount += Number(Number(item['quantity']) * Number(rateToUse));
  });
  return Number(totalAmount).toFixed(2);
}

isValidRate(rate: any): boolean {
  if (rate === null || rate === undefined || rate === '') {
    return false;
  }

  const numericRate = Number(rate);
  if (isNaN(numericRate)) {
    return false;
  }

  return numericRate >= 1;
}


submitBothInvoiceTransactional() {

  console.log('submitBothInvoiceTransactional');
  this.updateGRNArrayWithNewRates();

  const selected = this.createdConditionData.find((item: any) =>
    item.conditionType === this.conditionalForm.value.condition_type &&
    item.poItemNo === this.conditionalForm.value.po_item_no &&
    item.poNumber === this.conditionalForm.value.po_number &&
    item.quantityType === this.conditionalForm.value.quantity_type
  );

  if (!this.conditionalForm.valid) {
    this.errorToast = true;
    this.toastMsg = 'Form is invalid';
    return;
  }

  const cgst = Number(this.pdfChildData?.invoice?.cgst || 0);
  const sgst = Number(this.pdfChildData?.invoice?.sgst || 0);
  const igst = Number(this.pdfChildData?.invoice?.igst || 0);
  const taxSplit = (cgst + sgst + igst) / this.totalGRNQuantity;

  const poInvoice1GRNItems = this.isValidRate(this.allRate)
    ? this.selectedGRNArr.map((item: any) => {
        const quantity = Number(item.quantity);
        const rate = Number(this.allRate);
        const amount = quantity * rate;
        const itemTax = quantity * taxSplit;

        return {
          ...item,
          rate,
          amount: amount.toFixed(2),
          cgst: (cgst ? (quantity * (cgst / this.totalGRNQuantity)).toFixed(2) : 0),
          sgst: (sgst ? (quantity * (sgst / this.totalGRNQuantity)).toFixed(2) : 0),
          igst: (igst ? (quantity * (igst / this.totalGRNQuantity)).toFixed(2) : 0),
          totalAmount: (amount + itemTax).toFixed(2)
        };
      })
    : this.selectedGRNArr;

  const poInvoice2GRNItems = this.isValidRate(this.aaaRate)
    ? this.selectedGRNArr.map((item: any) => {
        const quantity = Number(item.quantity);
        const rate = Number(this.aaaRate);
        const amount = quantity * rate;
        const itemTax = quantity * taxSplit;

        return {
          ...item,
          rate,
          amount: amount.toFixed(2),
          cgst: (cgst ? (quantity * (cgst / this.totalGRNQuantity)).toFixed(2) : 0),
          sgst: (sgst ? (quantity * (sgst / this.totalGRNQuantity)).toFixed(2) : 0),
          igst: (igst ? (quantity * (igst / this.totalGRNQuantity)).toFixed(2) : 0),
          totalAmount: (amount + itemTax).toFixed(2)
        };
      })
    : this.selectedGRNArr;

  const poInvoice1Amount = this.isValidRate(this.allRate)
    ? this.calculateTotalAmountWithRate(this.allRate)
    : this.totalGRNAmount;

  const poInvoice2Amount = this.isValidRate(this.aaaRate)
    ? this.calculateTotalAmountWithRate(this.aaaRate)
    : this.totalGRNAmount;

  this.commonService.spinner.show();

  const poInvoice1 = {
    rate: this.isValidRate(this.allRate) ? this.allRate : this.selectedGRNArr[0].rate,
    invoiceAmount: poInvoice1Amount,
    totalInvoiceAmount: poInvoice1Amount,
    poGRNItems: poInvoice1GRNItems,
    netAamount: poInvoice1Amount,
    invoiceType: this.conditionalForm['controls']['invoice_type'].value ? this.conditionalForm['controls']['invoice_type'].value : null,
    poNumber: this.selectedALLPO.po_number,
    poItemNumber: this.selectedALLPO.po_line_item,
    invoiceNumber: this.conditionalForm['controls']['invoice_number'].value,
    invoiceDate:  moment(new Date(this.conditionalForm['controls']['invoice_date'].value)).format('YYYY-MM-DD HH:mm:ss'),
    paymentMode: this.conditionalForm['controls']['payment_mode'].value ? this.conditionalForm['controls']['payment_mode'].value : null,
    receiverGST: this.pdfAllData['self']['GST'] ? this.pdfAllData['self']['GST'] : null,
    supplierGST: this.conditionalForm['controls']['supp_gst_no'].value ? this.conditionalForm['controls']['supp_gst_no'].value : null,
    supplierChildGST: this.conditionalForm['controls']['child_gst'].value ? this.conditionalForm['controls']['child_gst'].value : null,
    childVendorCode: this.childVendorCode ? this.childVendorCode : null,
    childVendorName: this.selectedGRNArr[0]['childVendorName'] ? this.selectedGRNArr[0]['childVendorName'] : null,
    materialGroup: '',
    sapStatus: 0,
    companyCode: this.selectedCreatedCondition.companyCode,
    plantCode: this.conditionalForm.value.plant_code,
    status: 'submitted',
    createdBy: this.userdata.ACCOUNTNUMBER,
    createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    updatedBy: this.username,
    updatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    conditionId: selected['conditionId'],
    submissionTo: selected['createdBy'],
    matDescription: 'Freight Bill-Goods Transportation',
    sacCode: this.userdata.SACCODE,
    quantity: Number(this.totalGRNQuantity.toFixed(3)),
    uom: 'MT',
    cgst: this.pdfChildData?.['invoice']?.['cgst'] ? this.pdfChildData['invoice']['cgst'] : 0,
    sgst: this.pdfChildData?.['invoice']?.['sgst'] ? this.pdfChildData['invoice']['sgst'] : 0,
    igst: this.pdfChildData?.['invoice']?.['igst'] ? this.pdfChildData['invoice']['igst'] : 0,
    tax: this.pdfChildData?.['invoice']?.['ttax'] ? this.pdfChildData['invoice']['ttax'] : 0,
    totalAmount: this.pdfChildData?.['invoice']?.['tamount'] ? this.pdfChildData['invoice']['tamount'] : 0,
    reverseCharge: this.pdfChildData?.['invoice']?.['reversecharge'] ? this.pdfChildData['invoice']['reversecharge'] : '',
    irnNo: '',
    itemMaterialDes: this.selectedGRNArr[0]['materialDes'],
    remarks: this.conditionalForm.value.invoice_number + '-' + this.pdfAllData['invoice']['invoice_number'],
    isALLInvoice: 1,
    attach: this.uploadedDigitalSigned,
  };

  // Prepare poInvoice2 (ALL Invoice)   AAA PO
  const poInvoice2 = {
        rate: this.isValidRate(this.aaaRate) ? this.aaaRate : this.selectedGRNArr[0].rate,
        invoiceAmount: poInvoice2Amount,
        totalInvoiceAmount: poInvoice2Amount,
        poGRNItems: poInvoice2GRNItems,
        netAamount: poInvoice2Amount,
        invoiceType: this.conditionalForm['controls']['invoice_type'].value ? this.conditionalForm['controls']['invoice_type'].value : null,
        poItemNumber: this.conditionalForm['controls']['po_item_no'].value,
        poNumber: this.conditionalForm['controls']['po_number'].value,
        // invoiceNumber: this.conditionalForm['controls']['invoice_number'].value,
        // poNumber : this.allPoNumber,
        invoiceNumber: this.pdfAllData['invoice']['invoice_number'],
        invoiceDate: moment(new Date(this.conditionalForm['controls']['invoice_date'].value)).format('YYYY-MM-DD HH:mm:ss'),
        paymentMode: this.conditionalForm['controls']['payment_mode'].value ? this.conditionalForm['controls']['payment_mode'].value : null,
        receiverGST: this.pdfAllData['other']['GST'] ? this.pdfAllData['other']['GST'] : null,
        supplierGST: this.pdfAllData['self']['GST'] ? this.pdfAllData['self']['GST'] : null,
        supplierChildGST: this.pdfAllData['self']['GST'] ? this.pdfAllData['self']['GST'] : null,
        childVendorCode: this.selectedGRNArr[0]['childVendorCode'] ? this.selectedGRNArr[0]['childVendorCode'] : null,
        childVendorName: this.selectedGRNArr[0]['childVendorName'] ? this.selectedGRNArr[0]['childVendorName'] : null,
        materialGroup: '', //this.poDetail.materialGroup,
        sapStatus: 0,
        companyCode: this.selectedCreatedCondition.companyCode,
        plantCode: this.conditionalForm.value.plant_code,
        status: 'pending',
        createdBy: this.selectedGRNArr[0]['parentVendorCode'],
        createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        updatedBy: this.selectedGRNArr[0]['parentVendorCode'],
        updatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        conditionId: selected['conditionId'],
        submissionTo: selected['createdBy'],
        matDescription: 'Freight Bill-Goods Transportation',
        sacCode: 996791,
        // quantity: this.totalGRNQuantity,
        quantity: Number(this.totalGRNQuantity.toFixed(3)),
        uom: 'MT',
        cgst: this.pdfAllData['invoice']['cgst'],
        sgst: this.pdfAllData['invoice']['sgst'],
        igst: this.pdfAllData['invoice']['igst'],
        tax: this.pdfAllData['invoice']['ttax'],
        totalAmount: this.pdfAllData['invoice']['tamount'],
        reverseCharge: this.pdfAllData['invoice']['reversecharge'],
        irnNo: this.pdfAllData['invoice']['irn'] ? this.pdfAllData['invoice']['irn'] : null,
        itemMaterialDes: this.selectedGRNArr[0]['materialDes'],
        remarks: this.conditionalForm.value.invoice_number + '-' + this.pdfAllData['invoice']['invoice_number'],
        attach: this.mergeALLAndSupportPDF,
        isALLInvoice: 2,
      };


  poInvoice1.poGRNItems = poInvoice1GRNItems;
  poInvoice2.poGRNItems = poInvoice2GRNItems;

  // Prepare conData (Condition Data)
  const conData = {
    conditionId: this.selectedCreatedCondition.conditionId,
    vendorNumber: this.selectedCreatedCondition.vendorNumber,
    vendorName: this.selectedCreatedCondition.vendorName,
    plantCode: this.selectedCreatedCondition.plantCode,
    poItemNo: this.selectedCreatedCondition.poItemNo,
    conditionType: this.selectedCreatedCondition.conditionType,
    quantityType: this.selectedCreatedCondition.quantityType,
    poNumber: this.selectedCreatedCondition.poNumber,
    parentVendorNo: this.selectedCreatedCondition.parentVendorNo,
    createdDate: this.selectedCreatedCondition.createdDate,
    createdBy: this.selectedCreatedCondition.createdBy,
    updatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    updatedBy: this.username,
    fromDate: this.selectedCreatedCondition.fromDate,
    toDate: this.selectedCreatedCondition.toDate,
    status: 'submitted',
    actualPOVendor: this.selectedCreatedCondition.actualPOVendor,
    companyCode: this.selectedCreatedCondition.companyCode,
    transporterPoId: 0,
    allPoId: 0,
    poGrnData: this.selectedCreatedCondition.poGrnData,
  };

    const sortedGRN = [...this.selectedGRNArr].sort((a: any, b: any) => {
      const [dayA, monthA, yearA] = a.date.split('-').map(Number);
      const [dayB, monthB, yearB] = b.date.split('-').map(Number);
      return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
    });

    // Debug dates
    // console.log('====================================');
    // console.log('Selected GRN Dates:',sortedGRN);
    // console.log('====================================');
    // console.log('Sorted GRN Dates:', sortedGRN.map(grn => grn.date));
    // console.log('From Date:', sortedGRN[0]?.date);
    // console.log('To Date:', sortedGRN[sortedGRN.length - 1]?.date);


  const ses_json = {
    record: {
      system_id: "VSPEED",
      vendor_number: this.userdata.CUSTOMERCODE,
      invoice_number: this.conditionalForm.value.invoice_number.trim(),
      invoice_date: moment(new Date(this.conditionalForm.value.invoice_date)).format('YYYYMMDD'),
      fiscal_year: new Date().getFullYear(),
      po_number: this.selectedALLPO.po_number,
      po_line_item: this.selectedALLPO.po_line_item,
      service_period_date_from: this.formatDateForSES(sortedGRN[0]?.date),
      service_period_date_to: this.formatDateForSES(sortedGRN[sortedGRN.length - 1]?.date),
      quantity: this.selectedALLPO.gross_price == 1 ? this.totalGRNAmount : Number(this.totalGRNQuantity.toFixed(3)),
      commodity_code:
        this.selectedGRNArr[0]?.materialDes.replace(/\s*-\s*/g, '-').replace(/\s/g, '') +
        '-' + moment(this.selectedCreatedCondition.toDate).format('MMM-YY') +
        '-' + this.conditionalForm.value.plant_code,
      gr_ir_details: this.returnGrnForSes(),
      invoice_pdf: '',
    }
  };
  const sesData = {
    poinvoiceId: 0,
    sesRequest: JSON.stringify(ses_json).replace(/"/g, '\\"'),
    createdBy: this.userdata.ACCOUNTNUMBER,
    createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    updatedBy: this.userdata.ACCOUNTNUMBER,
    updatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  };

  // Prepare irnFiData (IRN & FI Data)
  const irnFiData = {
    poinvoiceId: 0,
    irnRequest: JSON.stringify(this.getALLIRNNumber()).replace(/"/g, '\\"'),
    fiRequest: JSON.stringify(this.genearteFIEntryJson()).replace(/"/g, '\\"'),
    irnStatus: "",
    irnMessage: "",
    irnNo: "",
    createdBy: this.userdata.ACCOUNTNUMBER,
    createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    updatedBy: "",
    updatedDate: "",
  };

  // Final payload
  const payload = {
    invData: {
      poInvoice1,
      poInvoice2
    },
    conData,
    sesData,
    irnFiData
  };

  // remove coal changes 3 month filter
  // if (Number(moment(this.selectedCreatedCondition.fromDate).format('MM')) < 7 &&
  //   Number(moment(this.selectedCreatedCondition.fromDate).format('YYYY')) <= 2025 ||
  //   this.selectedCreatedCondition.allPoId != 0
  // ) {
  //   if (payload && payload.invData && (payload.invData as any)['poInvoice2']) {
  //     delete (payload.invData as any)['poInvoice2'];
  //   }
  // }


    if(!payload.invData.poInvoice2.itemMaterialDes.toLowerCase().includes('coal')){
      if(Number((moment(this.selectedCreatedCondition.fromDate).format('MM')))<7 && Number((moment(this.selectedCreatedCondition.fromDate).format('YYYY'))) <= 2025 || this.selectedCreatedCondition.allPoId != 0){    // All invoice will not generate for period before Jul 2025
        // deleting json for all invoice
         if (payload && payload.invData && (payload.invData as any)['poInvoice2']) {
      delete (payload.invData as any)['poInvoice2'];
    }
      }
    }

  // Call the single API
  this.commonService.dataPost('postInvoice', payload).subscribe(
    (res: any) => {
      this.commonService.spinner.hide();
      if (res && res.status === 'Success') {
        this.successToast = true;
        this.toastMsg = 'Records have been updated successfully';
        setTimeout(() => {
          this.successToast = false;
          this.commonService.routeToPage('./dashboard');
        }, 2000);
      } else {
        this.errorToast = true;
        this.toastMsg = res?.message || 'Submission failed';
        setTimeout(() => {
          this.errorToast = false;
        }, 2000);
      }
    },
    (err: any) => {
      this.commonService.spinner.hide();
      this.errorToast = true;
      this.toastMsg = err?.error?.message || err?.invData?.poInvoice1?.invoiceNumber || 'Error occurred';
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
    }
  );
}
// ...existing code...

  getFIEntryFromPlantCode(plant_code?: any) {
    let url = `getFiReqDetails?plantCode=${this.conditionalForm.controls.plant_code.value}`

    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      if (res.status == 'Success' && res.data.length > 0) {
        this.plantFIJson = res.data[0];
      }else{
        this.plantFIJson = {};
        this.conditionalForm.controls.po_number.disable();
        this.errorToast = true;
        this.toastMsg = 'Failed to get Plant FI Json';
        setTimeout(() => {
          this.errorToast = false;
        }, 6000);
      }
    }, err => {
      console.log(err.error.message);
      this.conditionalForm.controls.po_number.disable();
      console.log('fetching fi entry failed');
      this.errorToast = true;
      this.toastMsg = 'Failed to get Plant FI Json';
      setTimeout(() => {
        this.errorToast = false;
      }, 6000);
    })
  }

  genearteFIEntryJson() {
    console.log('genearteFIEntryJson');

    let url = `postFIEntryRequest`;
    let json = {
      "row": [
        {
          "PTY_CD": this.plantFIJson.customerCode,
          "INVC_CRDT_DTTM": moment(this.conditionalForm.controls.invoice_date.value).format('DD.MM.YYYY'),
          "POST_DATE": moment(this.conditionalForm.controls.invoice_date.value).format('DD.MM.YYYY'),
          "TCODE": "FB70",
          "TXN_INVC_NO": this.pdfAllData['invoice']['invoice_number'],
          // "TOT_INVC_AMT_PTY_CRNCY": this.totalGRNAmount, //this.pdfAllData['invoice']['tamount'],
          "TOT_INVC_AMT_PTY_CRNCY": this.pdfAllData['invoice']['tamount'].toString(),
          "GL_AMOUNT": this.pdfAllData['invoice']['tamount'].toString(),
          "CRNCY_CD": "INR",
          "GL_CODE": "41011370",
          // "GL_AMOUNT": this.totalGRNAmount,
          // "TAX_CD": this.plantFIJson.taxCode,  //d
          "TAX_CD": this.pdfAllData['self']['STCODE'] == this.pdfAllData['other']['STCODE'] ? '&2' : '&3',  //d
          "PROFIT_CTR": this.plantFIJson.profitCenterALL, //d
          "UNIT_QTY": "",
          "UOM": "MT",
          "CUST_ID": this.plantFIJson.customerCode,
          "VIA_NO": "",
          "BASE_STS": "",
          "CRG_TYPE": "",
          "CMDT_CD": "",
          "BERTH_NO": "",
          "ACTVTY_TYPE": null,
          "SRV_CD": "",
          "BUS_AREA": this.plantFIJson.businessArea, //d
          "REMARK": "1001",
          "TERM_CD": "",
          "COMPANY_CODE": this.plantFIJson.sapCompanyCode,
          "SC_DESC": "1001",
          "SR_SYSTEM": "VSPEED",
          "IO_CODE": null,
          "STATE_CD": this.pdfAllData['self']['STCODE'],
          "PTY_GSTIN": this.pdfAllData['other']['GST'], //aaa
          "COMPANY_GSTIN": this.pdfAllData['self']['GST'], //all
          "SAC_CD": "996791",
          "SGST_AMOUNT": this.pdfAllData['invoice']['sgst'],
          "CGST_AMOUNT": this.pdfAllData['invoice']['cgst'],
          "IGST_AMOUNTT": this.pdfAllData['invoice']['igst'],
          "CGST_PRCNTG": "9",
          "SGST_PRCNTG": "9",
          "IGST_PRCNTG": "18",
          "PLANT_CD": this.plantFIJson.plantCodeALL,
          "IRN": this.pdfAllData['invoice']['irn'],
          "INVTC": "B2B",
          "INVSTC": "INV",
          "INR_CANCEL": null,
          "PREINV": null,
          "PREINVDT": null,
          "PROCESS_REJECT": null,
          "REMARKS": "Fi Entry",
        }
      ]
    }
    return json;

    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      if (res.status == 'Success') {
        console.log(res.message);
      }
    }, err => {
      console.log(err);
    })
  }

  getOpenServiceALLPO() {
    let url = `postOpenServicePO`;
    let json = {
      "record": {
        "vendor": this.userdata.CUSTOMERCODE, // "174696",
        "plant": this.apiBilltoData.aaaCustomerCode, // "2703"
      }
    }

    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      if (res.status == 'Success' && res['data'] && res['data']?.record && res['data']?.record?.length > 0) {
        this.allPOAPIRes = res['data']['record'];
        res['data']['record'].map((ele: any) => {
          if (!this.allPOArray.includes(ele.po_number)) {
            this.allPOArray.push(ele.po_number)
          }
        })
        if(this.viewConditional==true){
          this.selectAllPOLineItem();
        }
      } else if (res.status == 'Failed') {
        this.toastMsg = res['data']['status'];
      }
    }, err => {
      console.log(err);
    })
  }

  selectAllPO(event?: any) {
    this.allAndGRNRateMatched = false;
    this.allPOLineItemArray = this.allPOAPIRes.filter((ele: any) => {
      return ele.po_number == event.target.value;
    })
    // this.resetALLForm();
    this.allForm.controls.rate.setValue();
    this.allForm.controls.remain_qty.setValue();
    this.allForm.controls.validity_date.setValue();
    this.allForm.controls.po_item_no.setValue('choose');
    /*  setTimeout(() => {
       this.allForm.controls.po_number.setValue(event.target.value);
     }, 0); */
  }

selectAllPOLineItem(event?: any) {
  if(this.viewConditional == true){
    this.allPOLineItemArray = this.allPOAPIRes.filter((ele: any) => {
      return ele.po_number == this.allForm.value.po_number;
    })
    this.selectedALLPO = this.allPOAPIRes.find((ele: any) => {
      return ele.po_number == this.allForm.value.po_number && ele.po_line_item == this.allForm.value.po_item_no;
    })
  } else {
    this.selectedALLPO = this.allPOLineItemArray.find((ele: any) => {
      return ele.po_line_item == event.target.value;
    })
  }

  this.selectedALLPO.po_validity_end_data_ = this.selectedALLPO?.po_validity_end_date?.toString()?.slice(0, 4) + '-' + this.selectedALLPO?.po_validity_end_date?.toString()?.slice(4, -2) + '-' + this.selectedALLPO?.po_validity_end_date?.toString()?.slice(6);

  // Set the rate in the form - use allRate if valid, otherwise use the PO's gross_price
  // const rateToDisplay: number = this.isValidRate(this.allRate) ? Number(this.allRate) : Number(this.selectedALLPO?.gross_price || 0);
  const rateToDisplay: number = Number(this.selectedALLPO?.gross_price || 0);
  this.allForm.controls.rate.setValue(rateToDisplay);

  this.allForm.controls.remain_qty.setValue(this?.selectedALLPO?.open_qty);
  this.allForm.controls.validity_date.setValue(moment(this.selectedALLPO?.po_validity_end_data_).format('DD-MM-YYYY'));
   if(this.roleName != 'AAA_T'){
      this.compareRateOfGRNAndALLPO();
    }
}

compareRateOfGRNAndALLPO() {
  console.log('compareRateOfGRNAndALLPO');

  // Use isValidRate to check if allRate is valid
  if (this.isValidRate(this.allRate)) {
    if (this.selectedGRNArr.length > 0 && this.selectedALLPO) {
      const currentGRNRate = this.allRate; // allRate is valid, use it
      const allPORate = this.selectedALLPO.gross_price;

      if (allPORate == 1) {
        // If ALL PO rate is 1, it means it's a fixed amount PO, so rate matching is not required
        this.allAndGRNRateMatched = true;
        this.errorToast = false;
      } else if (currentGRNRate == allPORate) {
        this.allAndGRNRateMatched = true;
        this.errorToast = false;
      } else if (currentGRNRate != allPORate) {
        this.allAndGRNRateMatched = false;
        this.toastMsg = `ALL PO Rate not matched to GRN rate, Kindly contact Uttamsingh.Sarki@adani.com & Atri.Bhatt@adani.com & Plant Team, share screenshot`;
        this.errorToast = true;
      }

      if (this.allAndGRNRateMatched == true) {
        if (allPORate == 1 && Number(this.selectedALLPO.open_qty) < Number(this.conditionalForm.controls.invoice_amount.value)) {
          this.allAndGRNRateMatched = false;
          this.toastMsg = 'Invoice amount exceeds ALL remaining quantity, Kindly contact Uttamsingh.Sarki@adani.com & Atri.Bhatt@adani.com for PO extension, share screenshot';
          this.errorToast = true;
        } else if (Number(this.totalGRNQuantity) > Number(this.selectedALLPO.open_qty)) {
          this.allAndGRNRateMatched = false;
          this.toastMsg = 'Total GRN quantity exceeds to ALL remaining quantity, Kindly contact Uttamsingh.Sarki@adani.com & Atri.Bhatt@adani.com for PO extension, share screenshot';
          this.errorToast = true;
        }
      }
    } else {
      this.allAndGRNRateMatched = false;
    }
  } else {
    // Fall back to original logic when allRate is not valid
    if (this.selectedGRNArr.length > 0 && this.selectedALLPO.gross_price) {
      if (this.selectedALLPO.gross_price == 1) {
        this.allAndGRNRateMatched = true;
        this.errorToast = false;
      } else if (this.selectedGRNArr[0].rate == this.selectedALLPO.gross_price) {
        this.allAndGRNRateMatched = true;
        this.errorToast = false;
      } else if (this.selectedGRNArr[0].rate != this.selectedALLPO.gross_price) {
        this.allAndGRNRateMatched = false;
        this.toastMsg = 'ALL PO Rate not matched to GRN rate, Kindly contact Uttamsingh.Sarki@adani.com & Atri.Bhatt@adani.com & Plant Team, share screenshot';
        this.errorToast = true;
      }

      if (this.allAndGRNRateMatched == true) {
        if (this.selectedALLPO.gross_price == 1 && Number(this.selectedALLPO.open_qty) < Number(this.conditionalForm.controls.invoice_amount.value)) {
          this.allAndGRNRateMatched = false;
          this.toastMsg = 'Invoice amount exceeds ALL remaining quantity, Kindly contact Uttamsingh.Sarki@adani.com & Atri.Bhatt@adani.com for PO extension, share screenshot';
          this.errorToast = true;
        } else if (Number(this.totalGRNQuantity) > Number(this.selectedALLPO.open_qty)) {
          this.allAndGRNRateMatched = false;
          this.toastMsg = 'Total GRN quantity exceeds to ALL remaining quantity, Kindly contact Uttamsingh.Sarki@adani.com & Atri.Bhatt@adani.com for PO extension, share screenshot';
          this.errorToast = true;
        }
      }
    } else {
      this.allAndGRNRateMatched = false;
    }
  }

  if(this.selectedALLPO.po_validity_end_data_ && this.allAndGRNRateMatched == true){
    if(+new Date(this.selectedCreatedCondition.fromDate) > +new Date(this.selectedALLPO.po_validity_end_data_) || +new Date(this.selectedCreatedCondition.toDate) > +new Date(this.selectedALLPO.po_validity_end_data_)){
      this.allAndGRNRateMatched = false;
      this.toastMsg = 'GRN date exceeds PO validity date';
      this.errorToast = true;
    }else{
      this.allAndGRNRateMatched = true;
      this.errorToast = false;
    }
  }
}

//   generateSES() {
//     console.log('generateSES');

//     let selectedGRN:any = [] = this.selectedGRNArr.sort((a:any,b:any)=>{
//       return +new Date(a.date.split('-').reverse().join('-')) - +new Date(b.date.split('-').reverse().join('-'))
//     })

//     let url = `postSesRequest`;
//     let json = {
//       "record": {
//         "system_id":"VSPEED",
//         // "vendor_number": this.userdata.ACCOUNTNUMBER,
//         "vendor_number": this.userdata.CUSTOMERCODE,
//         "invoice_number": this.conditionalForm.controls.invoice_number.value,
//         // "invoice_number": this.pdfAllData['invoice']['invoice_number'],
//         "invoice_date": moment(new Date(this.conditionalForm['controls']['invoice_date'].value)).format('YYYYMMDD'),
//         "fiscal_year": new Date().getFullYear(),
//         "po_number": this.selectedALLPO.po_number,
//         "po_line_item": this.selectedALLPO.po_line_item,

//         //"service_period_date_from": moment().startOf('month').format('YYYYMMDD'),
//         //"service_period_date_to": moment().format('YYYYMMDD'),

//         "service_period_date_from": selectedGRN[0].date.split('-').reverse().join(''),
//         "service_period_date_to": selectedGRN[selectedGRN.length-1].date.split('-').reverse().join(''),

//         // "checklist_creation_name": "",
//         // "quantity": this.selectedALLPO.gross_price == 1 ? this.totalGRNAmount : this.totalGRNQuantity,
//         "quantity": this.selectedALLPO.gross_price == 1 ? this.totalGRNAmount : Number(this.totalGRNQuantity.toFixed(3)),
//         // 'commodity_code': this.selectedGRNArr[0]['materialDes'].slice(0, 4),
//         'commodity_code': this.selectedGRNArr[0]['materialDes']+'-'+moment(this.selectedCreatedCondition.toDate).format('MMM-yyyy') +'-'+this.conditionalForm.value.plant_code,
//         // "gr_ir_details": this.grn_arrr,
//         "gr_ir_details": this.returnGrnForSes(),
//         // "invoice_pdf": this.mergeALLAndSupportPDF[0].fileBase64,
//         "invoice_pdf": this.uploadedDigitalSigned[0].fileBase64,
//         // "invoice_pdf": this.mergeALLAndSupportPDF,  //all pdf base64
//         // "checklist_creation_date": moment(new Date(this.conditionalForm['controls']['invoice_date'].value)).format('YYYY-MM-DD HH:mm:ss'),
//         // "checklist_creator_name": "",
//         // "value_of_checklist": this.conditionalForm.controls.invoice_amount.value,
//       }
//     }

//     let ses_json = JSON.parse(JSON.stringify(json));
//     this.saveSESDataToDB(ses_json);
//     console.log('postSesRequestjson', json);
//     this.commonService.dataPost(url, json).subscribe(res => {
//       console.log(res);
//     }, err => {
//       console.log(err);
//     })
// }

// Helper method to parse date strings consistently
private parseDateString(dateString: string): Date {
  if (!dateString) return new Date();

  // format is "DD-MM-YYYY"
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JavaScript
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  return new Date(dateString); // Fallback
}

// Helper method to format dates for SES
private formatDateForSES(dateString: string): string {
  if (!dateString) return moment().format('YYYYMMDD');

  const date = this.parseDateString(dateString);
  return moment(date).format('YYYYMMDD');
}

  saveSESDataToDB(ses_json:any){
    let url =  `postSesDetails`;
    ses_json.record.invoice_pdf = '';
    let json = {
      "poinvoiceId" : this.submitStatus.transporterPoId,
      "sesRequest" : JSON.stringify(ses_json).replace(/"/g, '\\"'),
      "createdBy" : this.userdata['ACCOUNTNUMBER'],
      "createdDate" : moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      "updatedBy" : this.userdata['ACCOUNTNUMBER'],
      "updatedDate" : moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    }
    this.commonService.dataPost(url, json).subscribe(res => {
      console.log(res);
    }, err => {
      console.log(err);
    })
  }

  returnGrnForSes(){
    let grn_ :any = [];
    this.selectedGRNArr.map((ele:any)=>{
      grn_.push({
        "grn_posting_date": ele.documentDate ? moment(ele.documentDate, 'DD-MM-YYYY').format('YYYYMMDD') : '',
        "material_desc": ele.materialDes,
        "plant": this.conditionalForm.value.plant_code,
        // "grn_number": ele.materialDocumentNumber,
        "grn_ses_number": ele.materialDocumentNumber,
        "po_number": ele.poNumber,
        "do_number": ele.doNumber,
        "vehicle_number": ele.truckId?ele.truckId:'',
        "challan_shipment_number": ele.challanNo,
        // "challan_number": ele.challanNo,
        "challan_date": ele.challanDate ? moment(ele.challanDate, 'DD-MM-YYYY').format('YYYYMMDD') : '',
        "lr_number": ele.lrNo,
        "lr_date": ele.lrDate ? moment(ele.lrDate, 'DD-MM-YYYY').format('YYYYMMDD') : '',
        "rate": ele.rate,
        "challan_quantity": ele.challanQty,
        "actual_quantity": ele.actualQty,
        "grn_quantity": ele.grnquantity,
        "lesser_quantity": ele.lesserQty,
        "freight_billing_quantity": ele.quantity,
        "amount": ele.amount,
      })
    })
    return grn_;
  }

  generateIRNAndFIRRequestJson() {
    console.log('generateIRNAndFIRRequestJson');

    let url = `postIrnFiRequest`;
    let json = {
      "poinvoiceId": this.submitStatus.allPoId,
      "irnRequest": JSON.stringify(this.getALLIRNNumber()).replace(/"/g, '\\"'),
      "fiRequest": JSON.stringify(this.genearteFIEntryJson()).replace(/"/g, '\\"'),
      "irnStatus": "",
      "irnMessage": "",
      "irnNo": "",
      "createdBy": this.userdata['ACCOUNTNUMBER'],
      "createdDate": moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      "updatedBy": "",
      "updatedDate": "",
    }

    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
    }, err => {
      console.log(err);
    })
  }

  resetALLForm() {
    this.allForm.reset();
    this.selectedALLPO = {};
    this.allAndGRNRateMatched = false;
  }

  performAction(message: any) {
    this.errorToast = false;
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
    let url = `InvoiceVendorValidation?createdBy=${this.userdata['ACCOUNTNUMBER']}&invoiceNumber=${value}`
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      this.invoiceNoExist = false;
      this.conditionalForm['controls']['invoice_number'].setErrors();
      this.conditionalForm['controls']['invoice_number'].clearValidators();
    }, err => {
      console.log(err.error.message);
      this.errorToast = true;
      this.toastMsg = err.error.message;
      this.invoiceNoExist = true;
      this.conditionalForm['controls']['invoice_number'].setErrors({ 'invoice_exist': true });
    })
  }

  ngOnDestroy() {
    this.commonService.updatePurchase = false;
    this.conditionalForm.reset();
  }
}
