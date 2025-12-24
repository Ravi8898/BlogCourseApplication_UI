import { Component } from '@angular/core';
import { FormArray, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';

@Component({
  selector: 'app-service-sitecontroller',
  templateUrl: './service-sitecontroller.component.html',
  styleUrls: ['./service-sitecontroller.component.scss']
})
export class ServiceSitecontrollerComponent {

  barcodeValue = '';
  editPurchaseData: any = {};
  purchaseForm: any;
  serviceForm1!: FormGroup;
  serviceForm: any
  dynamicSearchForm: any;
  dynamicFilterForm: any;
  toastMsg: any = '';
  errorToast: any = false;
  successToast: any = false;
  currentDate = new Date();
  selectedSupportingDocument: any;
  selectedAllAttachment: any = [];

  items: any[] = [];
  apipoGrnDetails: any = [];
  poGrnDetails: any = [];
  filterGrnDetails: any = [];
  poSesDetails: any = [];
  sesSubList: any = [];
  apisesSubList: any = [];
  selectedSesSubItems: any = [];
  selectedChips: any[] = [];
  logintype: any;
  username: any;
  siteTable: any = [];
  selectedAll = false;
  selectedItemsArr: any = [];
  selectedItemsDataArr: any = [];
  selectedGRNArr: any = [];
  selectedSESArr: any = [];
  confirmModalMessage = '';
  submissionArr: any = [];
  childGSTArr: any = [];
  userdata: any;
  contractNoExist = false;
  totalGRNQuantity = 0;

  pages: number[] = [];
  totalPages: number = 0;
  currentPage: number = 1
  itemsPerPage: number = 5;
  totalItems: number = 0;
  visiblePages: number[] = [];
  public pagedData: any[] = [];
  public apiPagedData: any[] = [];
  public data: any[] = [];
  siteControllerAction: any;
  supportDocument: any = []
  createSES: any = false;
  sesTotalNetAmount: any = 0;
  sesTotalTax: any = 0;
  sesTotalGrossAmount: any = 0;
  // serviceFormArray: any;
  constructor(private commonService: CommonService, private brearcumbService: BreadcrumbService, private fb: FormBuilder) {
    this.logintype = localStorage.getItem('logintype');
    this.username = localStorage.getItem('username');
    this.userdata = JSON.parse(localStorage.getItem('userdata') || '{}');
    this.brearcumbService.setBreadcrumbUrl();
    this.serviceForm1 = this.fb.group({
      services: this.fb.array([])
    })
  }

  ngOnInit(): void {
    this.loadPurchaseForm();
    //  this.serviceForm = new FormGroup({
    //   serviceFormArray: new FormArray([])
    // });

    // Example: Add one empty group initially
    // this.addServiceFormGroup();
    this.loadSESForm();
    this.loadDynamicFilterForm();
    this.purchaseForm.reset();
    if (this.commonService.updatePurchase == true) {
      this.updateInvoice();
    }
  }
  get services(): FormArray {
    return this.serviceForm1.get('services') as FormArray;
  }
  createServiceGroup(): FormGroup {
    return this.fb.group({
      po_number: [{ value: '', disabled: true }],
      po_item_no: [{ value: '', disabled: true }],
      quantity: [{ value: '', disabled: true }],
      gr_price: [{ value: '', disabled: true }],
      amount: [{ value: '', disabled: true }],
      service_sheet_no: [{ value: '', disabled: true }]
    });
  }
  createServiceGroup1(data: any): FormGroup {
  const totalQuantity = data.items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);
  const totalAmount = data.items.reduce((sum: number, item: any) => sum + Number(item.grossAmount || 0), 0);

  return this.fb.group({
    po_number: [{ value: data.items[0].poNumber, disabled: true }],
    po_item_no: [{ value: data.items[0].purchaseOrderItemNo, disabled: true }],
    quantity: [{ value: totalQuantity, disabled: true }],
    gr_price: [{ value: data.items[0].grPrice, disabled: true }],
    pckgNo:[{ value: data.items[0].pckgNo, disabled: true }],
    amount: [{ value: totalAmount, disabled: true }],
    service_sheet_no: [{ value: '', disabled: true }]
  });
}

   populateServices(dataArray: any[]): void {
    dataArray.forEach((group:any) => {
      if (group.items && group.items.length > 0) {
        const serviceGroup = this.createServiceGroup1(group);
        this.services.push(serviceGroup);
      }
    });
  }
   addServiceFormGroup(): void {
    const group = new FormGroup({
      po_number: new FormControl('', Validators.required),
      po_item_no: new FormControl('', Validators.required),
      quantity: new FormControl('', Validators.required)
    });

    this.serviceFormArray.push(group);
  }
    get serviceFormArray(): FormArray {
    return this.serviceForm.get('serviceFormArray') as FormArray;
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

      department: new FormControl('', [Validators.required]),
      supp_gst_no: new FormControl('', [Validators.required]),
      child_gst: new FormControl('', [Validators.required]),
      rece_gst_no: new FormControl(''), /* [Validators.required] */
      currency: new FormControl(''),

      // bank_detail: new FormControl('', [Validators.required]),
      payment_mode: new FormControl('', [Validators.required]),
      adani_contact: new FormControl(''),
      submission_to: new FormControl('', [Validators.required]),

      material_group: new FormControl(''),
      payment_term: new FormControl(''),

      series_type: new FormControl('', [Validators.required]),
      attach: new FormControl('', [Validators.required]),
      attach_data: new FormControl('', [Validators.required]),

      remarks: new FormControl('', [Validators.maxLength(256)]),
      reviewer_remarks: new FormControl('', [Validators.required, Validators.maxLength(256)]),

      items_arr: new FormControl('', [Validators.required]),
      grn_arr: new FormControl('', [Validators.required]),
      ses_arr: new FormControl('', [Validators.required]),
      // entry_date: new FormControl(new Date(), [Validators.required]),
      // lr_number: new FormControl(''),
    })
    // this.purchaseForm['controls']['entry_date'].setValue(moment(new Date()).format('YYYY-MM-DD'));
    this.purchaseForm['controls']['po_number'].disable();
    this.purchaseForm['controls']['invoice_number'].disable();
    this.purchaseForm['controls']['invoice_type'].disable();
    this.purchaseForm['controls']['invoice_date'].disable();

    this.purchaseForm['controls']['invoice_amount'].disable();
    this.purchaseForm['controls']['invoice_amount_line'].disable();
    this.purchaseForm['controls']['company'].disable();
    this.purchaseForm['controls']['plant_code'].disable();

    this.purchaseForm['controls']['department'].disable();
    this.purchaseForm['controls']['supp_gst_no'].disable();
    this.purchaseForm['controls']['child_gst'].disable();
    this.purchaseForm['controls']['rece_gst_no'].disable();
    this.purchaseForm['controls']['currency'].disable();

    // this.purchaseForm['controls']['bank_detail'].disable();
    this.purchaseForm['controls']['payment_mode'].disable();
    this.purchaseForm['controls']['adani_contact'].disable();
    this.purchaseForm['controls']['submission_to'].disable();

    this.purchaseForm['controls']['material_group'].disable();
    this.purchaseForm['controls']['payment_term'].disable();


    this.purchaseForm['controls']['remarks'].disable();
    this.purchaseForm['controls']['items_arr'].disable();
  }

  allowInvoiceChars(event: KeyboardEvent): boolean {
    const allowedChars = /^[a-zA-Z0-9\-\/]$/;
    const key = event.key;
    return allowedChars.test(key);
  }

createServiceFormGroup(item:any): FormGroup {
  return new FormGroup({
    po_number: new FormControl(item.poNumber || '', [Validators.required]),
    po_item_no: new FormControl(item.purchaseOrderItemNo || '', [Validators.required]),
    quantity: new FormControl(item.quantity || '', [Validators.required]),
    gr_price: new FormControl(item.grPrice || '', [Validators.required]),
    amount: new FormControl(item.amount || '', [Validators.required]),
    service_sheet_no: new FormControl(item.serviceSheetNo || ''),
  });
}

  loadSESForm() {
    this.serviceForm = new FormGroup({
      po_number: new FormControl('', [Validators.required]),
      po_item_no: new FormControl('', [Validators.required]),
      quantity: new FormControl('', [Validators.required]),
      gr_price: new FormControl('', [Validators.required]),
      amount: new FormControl('', [Validators.required]),
      service_sheet_no: new FormControl(''),
    })
    // this.serviceForm = this.fb.group([
    //   this.createServiceFormGroup(), // Add one or more groups as needed
    // ]);
  }

  loadDynamicFilterForm() {
    this.dynamicFilterForm = new FormGroup({
      'ref_number': new FormControl(''),
    })
  }

  resetPurchaseForm() {
    this.purchaseForm.reset();
  }

  updateInvoice() {
    console.log('updateInvoice');

    let url = `POInvoiceDetailsSubmitTo?submissionTo=${this.username}`;
    // this.commonService.getSiteControllerOrderList(this.username).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      if (res && res['status'] == 'Success' && res['data'].length > 0) {
        this.editPurchaseData = res['data'].find((item: any) => {
          return (item['invoiceNumber'] == this.commonService['editPurchaseData']['Invoice No.'] && item['poNumber'] == this.commonService['editPurchaseData']['PO No.']);
        })
        if (Object.keys(this.editPurchaseData).length > 0) {
          this.getPODetail(this.editPurchaseData['poNumber']);
        }
      } else {
        console.log();
      }
    }, err => {
      console.log(err);
    })

  }


  fillPurchaseForm() {
    this.purchaseForm['controls']['po_number'].setValue(this.editPurchaseData['poNumber']);
    this.purchaseForm['controls']['invoice_number'].setValue(this.editPurchaseData['invoiceNumber']);
    this.purchaseForm['controls']['invoice_type'].setValue(this.editPurchaseData['invoiceType']);
    this.purchaseForm['controls']['invoice_date'].setValue(moment(this.editPurchaseData['invoiceDate']).format("YYYY-MM-DD"));

    this.purchaseForm['controls']['invoice_amount'].setValue(this.editPurchaseData['invoiceAmount']);
    this.purchaseForm['controls']['invoice_amount_line'].setValue(this.editPurchaseData['lineItermsAmount']);
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
    this.purchaseForm['controls']['items_arr'].setValue(this.editPurchaseData['poInvoiceItems']);
    this.purchaseForm['controls']['remarks'].setValue(this.editPurchaseData['remarks']);

    this.purchaseForm['controls']['reviewer_remarks'].setValue(this.editPurchaseData['reviewerRemarks']);
    this.purchaseForm['controls']['series_type'].setValue('normal');

    setTimeout(() => {
      this.refresItemsList();
    }, 0);

    this.purchaseForm['controls']['attach'].clearValidators();
    this.purchaseForm['controls']['attach'].updateValueAndValidity();
    this.purchaseForm['controls']['invoice_number'].disable();

    this.purchaseForm['controls']['attach'].disable();
    this.purchaseForm['controls']['attach_data'].disable();

    this.selectedItemsArr = this.editPurchaseData.poInvoiceItems;
    // this.selectedItemsDataArr = this.editPurchaseData['poCalculateItem'];
    // this.selectedSesSubItems = this.editPurchaseData['poCalculateItem'];
    this.selectedSesSubItems = this.editPurchaseData['poCalculateItem'].map((item: any) => ({
      ...item,
      poNumber: this.editPurchaseData.poNumber
    }));
    this.supportDocument = JSON.parse(this.editPurchaseData['invoiceAttachment'][0]['supportattachmentfilepath']);

    if (this.editPurchaseData.poSubSesDetails) {
      this.apisesSubList = [];
      this.sesSubList = [];
      this.editPurchaseData.poSubSesDetails.map((item: any) => {
      const remQtyData = String(item['remQty'])
        this.apisesSubList.push({
          checked: true,
          extLineNo: item['extLineNo'],
          matlGroup: item['matlGroup'],
          netValue: item['netValue'],
          pckgNo: item['pckgNo'],
          quantity: item['quantity'],
          shortText: item['shortText'],
          subPackageNo: item['subPackageNo'],
          taxCode: item['taxCode'],
          taxCodeTariff: item['taxCodeTariff'],
          poNumber:item['poNumber'],
          remQty: remQtyData
          // poNumber: this.purchaseForm.value.po_number
        });
      })
      this.sesSubList = [...this.apisesSubList];
      // this.selectedSesSubItems = this.editPurchaseData.poSubSesDetails;
    }
    this.sesCalculateTotal();
    // this.serviceForm.controls.po_number.setValue(this.editPurchaseData.poNumber)
    // this.serviceForm.controls.po_item_no.setValue(this.editPurchaseData.poCalculateItem[0].purchaseOrderItemNo);
    // this.serviceForm.controls.gr_price.setValue(this.editPurchaseData.poCalculateItem[0].grPrice);

    setTimeout(() => {
      this.calculateServiceAmount();
    }, 100);

    if (this.editPurchaseData['status'] == 'accept' && this['editPurchaseData']['seriesType']) {
      this.purchaseForm['controls']['series_type'].setValue(this['editPurchaseData']['seriesType']);
      this.purchaseForm['controls']['series_type'].disable();
      this.purchaseForm['controls']['reviewer_remarks'].disable();
    } else if (this.editPurchaseData.status == 'processing' || this.editPurchaseData.status == 'accept') {
      let poInvoiceId = this.editPurchaseData.poInvoiceID;
      let url = `getService?poInvoiceId=${poInvoiceId}`;

      this.commonService.dataGet(url).subscribe((res: any) => {
        console.log(res);
        if (res?.data.length > 0) {
          // this.serviceForm.controls.quantity.setValue(res?.data[0]?.quantity);
          // this.serviceForm.controls.amount.setValue(res?.data[0]?.amount);
          // this.serviceForm.controls.service_sheet_no.setValue(res?.data[0]?.serviceSheetNo);

          // this.serviceForm.controls.quantity.disable();
          this.serviceForm1 = this.fb.group({
            services: this.fb.array(
              res?.data.map((item: any) =>
                this.fb.group({
                  po_number: [item.poNumber],
                  po_item_no: [item.poItemNo],
                  quantity: [item.quantity],
                  gr_price: [null],
                  amount: [item.amount],
                  service_sheet_no: [item.serviceSheetNo]
                })
              )
            )
          });
          this.createSES = true;
        }
      }, err => {
        console.log(err);
      })
    }
    else if (this.editPurchaseData.status === 'pending') {
      this.sesCalculateTotal();
    }
  }

  onCreateServiceClick() {
    console.log("CreateSES is called")
  this.createSES = true;
  // Give a small delay for the form to render, then calculate
  setTimeout(() => {
    this.calculateServiceAmount();
  }, 100);
}

  sesCalculateTotal() {
    console.log('calculateTotal');
    this.sesTotalNetAmount = 0;
    this.sesTotalTax = 0;
    this.sesTotalGrossAmount = 0;
    this.selectedSesSubItems.map((item: any) => {
      this.sesTotalNetAmount = Number(Number(this.sesTotalNetAmount) + Number(item['netAmount'])).toFixed(2);
      this.sesTotalTax = Number(Number(this.sesTotalTax) + Number(item['tax'])).toFixed(2);
      this.sesTotalGrossAmount = Number(Number(this.sesTotalGrossAmount) + Number(item['grossAmount'])).toFixed(2);
    })

    this.purchaseForm['controls']['invoice_amount_line'].setValue(this.sesTotalGrossAmount);

    // Recalculate service amounts when totals change - only if createSES is true
    if (this.createSES && this.selectedSesSubItems && this.selectedSesSubItems.length > 0) {
      setTimeout(() => {
        this.calculateServiceAmount();
      }, 100);
    }
  }


  /* Attachment */
  onImageCapture(evt: any) {
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
    console.log(btoa(binaryString));
  }


  /* Invoice Submit */
  /* submitPurchaseForm(event:any){
    console.log('submitPurchaseForm');

    let json:any = {
      attach: this.purchaseForm['controls']['attach_data'].value,
      companyCode: this.purchaseForm['controls']['company'].value,
      entryDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      invoiceType: this.purchaseForm['controls']['invoice_type'].value,
      invoiceNumber: this.purchaseForm['controls']['invoice_number'].value,
      invoiceDate: moment(new Date(this.purchaseForm['controls']['invoice_date'].value)).format('YYYY-MM-DD HH:mm:ss'),
      invoiceAmount: this.purchaseForm['controls']['invoice_amount'].value,
      lrNumber: this.purchaseForm['controls']['lr_number'].value?this.purchaseForm['controls']['lr_number'].value:null,
      plantCode: this.purchaseForm['controls']['plant_code'].value?this.purchaseForm['controls']['plant_code'].value:null,
      poInvoiceItems: this.selectedItemsArr,
      poNumber: this.purchaseForm['controls']['po_number'].value,
      remarks: this.purchaseForm['controls']['remarks'].value?this.purchaseForm['controls']['remarks'].value:null,
      submissionTo: this.purchaseForm['controls']['submission_to'].value,

      materialGroup: this.purchaseForm['controls']['material_group'].value,
      paymentTerm: this.purchaseForm['controls']['payment_term'].value,
    }
    if(this.commonService.updatePurchase == true){
      if(this.purchaseForm.controls['attach_data'].value){
        json.attach = this.purchaseForm['controls']['attach_data'].value;
      }else{
        json.attach = null;
      }
      json.status = this.editPurchaseData.status;
      json.createdBy = this.editPurchaseData.createdBy;
      json.createdDate = moment(this.editPurchaseData.createdDate).format('YYYY-MM-DD HH:mm:ss');
      json.updatedBy = this.username;
      json.updatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      json.poInvoiceID = this.editPurchaseData.poInvoiceID;
    }else{
      json.attach = this.purchaseForm['controls']['attach_data'].value,
      json.status = 'pending';
      json.createdBy = this.userdata['VENDORNUMBER'];
      json.createdDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      json.updatedBy = this.username;
      json.updatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }

    this.commonService.spinner.show();
    this.commonService.purchaseOrder(json).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success'){
        this.successToast = true;
        this.toastMsg = res['message'];
        this.commonService.routeToDashboard();
      }else{
        this.errorToast = true;
        this.toastMsg = res['message'];
      }
    },err=>{
      console.log(err);
      this.commonService.spinner.hide();
      this.errorToast = true;
      this.toastMsg = err['message'];
      setTimeout(() => {
        this.errorToast = false;
      }, 1000);
    })
  } */


  getPODetail(po_number?: any) {
    console.log('getPODetail');

    this.commonService.spinner.show();
    let url = `getPODetails?poNumber=${po_number}&invoiceType=''`
    // this.commonService.getPODetail(po_number, invoice_type).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      // this.items = res['purchaseOrderItems'];
      if (res['data'] && res['data']['poItems'].length > 0) {
        this.items = res['data']['poItems'];
        this.items = this.structureItems(res['data']['poItems']);
        this.purchaseForm['controls']['plant_code'].setValue(res['data']['poItems'][0]['plantCode']);
        this.getSubmissionTo(res['data']['poItems'][0]['plantCode'], this.editPurchaseData['invoiceType']);
      }
      if (res['data'] && res['data']['poGrnItems'].length > 0) {
        this.apipoGrnDetails = res['data']['poGrnItems'];
        this.apipoGrnDetails.forEach((item: any) => {
          item.checked = false;
        })
        // this.poGrnDetails = res['data']['poGrnItems'];
        this.poGrnDetails = [...this.apipoGrnDetails];
        this.filterGrnDetails = [...this.apipoGrnDetails];
      }
      if (res['data'] && res['data']['poSesItems'].length > 0) {
        this.poSesDetails = res['data']['poSesItems'];
      }
      // this.purchaseForm['controls']['plant_code'].enable();
      // this.purchaseForm['controls']['submission_to'].enable();
      // this.purchaseForm['controls']['items_arr'].enable();
      this.updateItems();
      if (this.editPurchaseData.status == 'accept') {
        this.getGRNSES(this.editPurchaseData['poInvoiceID']);
      }
      this.totalPages = Math.ceil(this.poGrnDetails.length / this.itemsPerPage);
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      this.updateVisiblePages();
      this.updatePagedData();
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
      this.purchaseForm['controls']['plant_code'].enable();
      this.purchaseForm['controls']['submission_to'].enable();
      this.purchaseForm['controls']['items_arr'].enable();
      this.purchaseForm['controls']['plant_code'].setValue('NE24');
      this.getSubmissionTo('NE24');
      // return;
      // this.items = [
      //   {
      //     "purchaseOrderItemNo": "123",
      //     "itemDesciption": "cement",
      //     "materialNumber": "1234",
      //     "plantCode": "NE24",
      //     "quantity": "11",
      //     "unitOfMeasure": "kg",
      //     "netPrice": "100",
      //     "pricePerUnit": "50",
      //     "taxCode": "",
      //     "isNoMoreGR": "",
      //     "isFinalInvoice": "",
      //     "contractNo": "",
      //     "contractItemNo": "",
      //     "hsnCode": "",
      //     "packageNo": "0075948163",
      //     "subPackageNo": "0075948184",
      //     /* "createdBy": "John Doe",
      //     "createdDate": "2024-01-21 16:43:55",
      //     "updatedBy": "Jane Doe",
      //     "updatedDate": "2024-01-22 16:43:55" */
      //   },
      //   {
      //     "purchaseOrderItemNo": "987",
      //     "itemDesciption": "cment",
      //     "materialNumber": "9876",
      //     "plantCode": "NE24",
      //     "quantity": "200",
      //     "unitOfMeasure": "kg",
      //     "netPrice": "100",
      //     "pricePerUnit": "50",
      //     "taxCode": "",
      //     "isNoMoreGR": "",
      //     "isFinalInvoice": "",
      //     "contractNo": "",
      //     "contractItemNo": "",
      //     "hsnCode": "",
      //     "packageNo": "0075948163",
      //     "subPackageNo": "0075948184",
      //     /* "createdBy": "John Doe",
      //     "createdDate": "2024-01-21 16:43:55",
      //     "updatedBy": "Jane Doe",
      //     "updatedDate": "2024-01-22 16:43:55" */
      //   }
      // ]
      // this.items = [
      //   {
      //     "purchaseOrderItemNo": "123",
      //     "itemDesciption": "cement",
      //     "materialNumber": "1234",
      //     "plantCode": "NE24",
      //     "quantity": "11",
      //     "unitOfMeasure": "kg",
      //     "netPrice": "100",
      //     "pricePerUnit": "50",
      //     "taxCode": "",
      //     "isNoMoreGR": "",
      //     "isFinalInvoice": "",
      //     "contractNo": "",
      //     "contractItemNo": "",
      //     "hsnCode": "",
      //     "packageNo": "0075948163",
      //     "subPackageNo": "0075948184",
      //     /* "createdBy": "John Doe",
      //     "createdDate": "2024-01-21 16:43:55",
      //     "updatedBy": "Jane Doe",
      //     "updatedDate": "2024-01-22 16:43:55" */
      //   },
      //   {
      //     "purchaseOrderItemNo": "987",
      //     "itemDesciption": "cment",
      //     "materialNumber": "9876",
      //     "plantCode": "NE24",
      //     "quantity": "200",
      //     "unitOfMeasure": "kg",
      //     "netPrice": "100",
      //     "pricePerUnit": "50",
      //     "taxCode": "",
      //     "isNoMoreGR": "",
      //     "isFinalInvoice": "",
      //     "contractNo": "",
      //     "contractItemNo": "",
      //     "hsnCode": "",
      //     "packageNo": "0075948163",
      //     "subPackageNo": "0075948184",
      //     /* "createdBy": "John Doe",
      //     "createdDate": "2024-01-21 16:43:55",
      //     "updatedBy": "Jane Doe",
      //     "updatedDate": "2024-01-22 16:43:55" */
      //   }
      // ]
    })
  }

  getSubmissionTo(plant_code: any, invoice_type?: any) {
    console.log('getSubmissionTo');

    let url = `plantDetails?plantCode=${plant_code}&invoiceType=${invoice_type}&preqNo=''`;
    // this.commonService.getSubmissionTo(plant_code, invoice_type).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      if (res && res['status'] == 'Success') {
        this.submissionArr = res['data']['employeeData'];
        if (this.commonService.updatePurchase == true) {
          this.fillPurchaseForm();
        }
      } else {
        console.log('error');
      }
    }, err => {
      console.log(err);
    })
  }

  getGRNSES(po_number?: any) {
    console.log('getGRNSES');

    let url = `getPOSesAndGrnDetails?poInvoiceID=${po_number}`
    this.commonService.spinner.show();
    // this.commonService.getGRNSES(po_number).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      this.updateGRNSES(res['data'][0]);
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
    })
  }

  selectChips(event: any) {
    console.log('selectChips');
    // this.selectedChips.push(event.target.value);
    this.selectedChips = event.value;
  }

  deleteChip(event: any) {
    console.log('deleteChip');
    this.selectedChips.splice(this.selectedChips.indexOf(event), 1);
    this.refresItemsList();
  }

  refresItemsList() {
    this.items = this.items.map(element => {
      return element;
    })
    let pop = this.items.pop();
    setTimeout(() => {
      this.items.push(pop);
    }, 0)
  }

  siteOrderAction(action: any) {
    console.log('siteAction');
    this.errorToast = false;
    // this.editPurchaseData.status = action;
    if (action == 'accept') {
      this.editPurchaseData.status = action;
      this.siteControllerAction = action;
      this.submitSiteController(event);
      return
    }
    if (this.purchaseForm['controls']['reviewer_remarks'].value == null || this.purchaseForm['controls']['reviewer_remarks'].value == '') {
      this.confirmModalMessage = '';
      this.errorToast = true;
      this.toastMsg = `Please give reason for ${action} in reviewer remark box`;
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
      return;
    } else {
      this.selectedGRNArr = [];
      this.selectedSESArr = [];
      this.purchaseForm['controls']['series_type'].setValue('');
      if (action == 'reject') {
        this.confirmModalMessage = 'Are you sure, you want to Reject ?';
      } else if (action == 'sent-back') {
        this.confirmModalMessage = 'Are you sure, you want to Sent Back ?';
      } else if (action == 'onhold') {
        this.confirmModalMessage = 'Are you sure, you want to OnHold ?';
      }
      // this.editPurchaseData.status = action;
      this.siteControllerAction = action;
      document.getElementById('confirmModalButton')?.click();
    }
  }

  submitSiteController(event: any) {
    console.log('submitSiteController');

    let json: any = {
      poNumber: this.purchaseForm['controls']['po_number'].value,
      invoiceNumber: this.purchaseForm['controls']['invoice_number'].value,
      invoiceType: this.purchaseForm['controls']['invoice_type'].value,
      invoiceDate: moment(new Date(this.purchaseForm['controls']['invoice_date'].value)).format('YYYY-MM-DD HH:mm:ss'),

      invoiceAmount: this.purchaseForm['controls']['invoice_amount'].value,
      lineItermsAmount: this.purchaseForm['controls']['invoice_amount_line'].value,
      companyCode: this.purchaseForm['controls']['company'].value,
      plantCode: this.purchaseForm['controls']['plant_code'].value ? this.purchaseForm['controls']['plant_code'].value : null,

      department: this.purchaseForm['controls']['department'].value ? this.purchaseForm['controls']['department'].value : null,
      supplierGST: this.purchaseForm['controls']['supp_gst_no'].value ? this.purchaseForm['controls']['supp_gst_no'].value : null,
      supplierChildGST: this.purchaseForm['controls']['child_gst'].value ? this.purchaseForm['controls']['child_gst'].value : null,
      receiverGST: this.purchaseForm['controls']['rece_gst_no'].value ? this.purchaseForm['controls']['rece_gst_no'].value : null,
      currency: this.purchaseForm['controls']['currency'].value ? this.purchaseForm['controls']['currency'].value : null,

      // bankAccountNo: this.purchaseForm['controls']['bank_detail'].value?this.purchaseForm['controls']['bank_detail'].value:null,
      paymentMode: this.purchaseForm['controls']['payment_mode'].value ? this.purchaseForm['controls']['payment_mode'].value : null,
      adaniContactNo: this.purchaseForm['controls']['adani_contact'].value ? this.purchaseForm['controls']['adani_contact'].value : null,
      submissionTo: this.purchaseForm['controls']['submission_to'].value,

      materialGroup: this.purchaseForm['controls']['material_group'].value,
      paymentTerm: this.purchaseForm['controls']['payment_term'].value,

      // entryDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      // lrNumber: this.purchaseForm['controls']['lr_number'].value?this.purchaseForm['controls']['lr_number'].value:null,
      // poInvoiceItems: this.selectedItemsArr,
      // attach: null,
      seriesType: this.purchaseForm['controls']['series_type'].value,
      remarks: this.purchaseForm['controls']['remarks'].value ? this.purchaseForm['controls']['remarks'].value : null,
      reviewerRemarks: this.purchaseForm['controls']['reviewer_remarks'].value ? this.purchaseForm['controls']['reviewer_remarks'].value : null,

      poGrnDetails: this.selectedGRNArr,
      poSesDetails: this.selectedSESArr,
      // status : this.editPurchaseData.status,
      status: this.siteControllerAction,
      sapStatus: this.editPurchaseData.sapStatus,
      createdBy: this.editPurchaseData.createdBy,
      childVendorCode: this.editPurchaseData.childVendorCode,
      createdDate: moment(this.editPurchaseData.createdDate).format('YYYY-MM-DD HH:mm:ss'),
      updatedBy: this.username,
      updatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      poInvoiceID: this.editPurchaseData.poInvoiceID,
      attachmentFilePath: this.editPurchaseData.invoiceAttachment[0].attachmentFilePath,
      attach: [],
    }

    let url = `postPOSesAndGrnDetails`;
    this.commonService.spinner.show();

    // this.commonService.updateSiteController(json).subscribe((res:any)=>{
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res && res['status'] == 'Success') {
        this.successToast = true;
        this.toastMsg = 'Records have been updated successfully';
        if (res['data']) {
          this.barcodeValue = res['data'];
          document.getElementById('barcodeModalButton')?.click();
        } else {
          /* this.successToast = true;
          this.toastMsg = res['message']; */
          // this.commonService.routeToDashboard();
          this.commonService.routeToPage('./dashboard');
        }
        setTimeout(() => {
          this.successToast = false;
        }, 2000);
      } else {
        this.errorToast = true;
        this.toastMsg = res['message'];
        setTimeout(() => {
          this.errorToast = false;
        }, 2000);
      }
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
      this.errorToast = true;
      this.toastMsg = err['message'];
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
    })
  }

  redirectToDashboard() {
    console.log('redirectToDashboard');
    // this.commonService.routeToDashboard();
    this.commonService.routeToPage('./dashboard');
  }

  checkAll(event: any) {
    console.log('checkAll');
    if (event.target.checked) {
      this.filterGrnDetails.forEach((item: any) => {
        if (item['checked'] == false) {
          item['checked'] = true;
          item['status'] = 'done';
          item['updatedBy'] = this.username;
          item['updatedDate'] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
          this.selectedGRNArr.push(item);
        }
      })
      this.selectedAll = true;
      this.totalGRNQuantity = 0;
      this.selectedGRNArr.map((item: any) => {
        this.totalGRNQuantity = this.totalGRNQuantity + Number(item['quantity'])
      })
      this.compareGRNSES();
    } else {
      this.selectedAll = false;
      this.filterGrnDetails.forEach((item: any) => {
        item['checked'] = false;
      })
      this.filterGrnDetails.map((element: any) => {
        this.selectedGRNArr.map((item: any, i: any) => {
          if (item['refInvoiceNumber'] == element['refInvoiceNumber']) {
            this.selectedGRNArr.splice(i, 1);
          }
        })
      })

      this.totalGRNQuantity = 0;
      this.selectedGRNArr.map((item: any) => {
        this.totalGRNQuantity = this.totalGRNQuantity + Number(item['quantity'])
      })
      this.compareGRNSES();
    }
  }

  updateItems() {
    this.items.forEach(item => {
      item.checked = false;
    })
    if (this.editPurchaseData['poInvoiceItems']) {
      this.selectedItemsArr = this.editPurchaseData['poInvoiceItems'];
      this.items.forEach(element => {
        this.selectedItemsArr.map((item: any) => {
          if (element['purchaseOrderItemNo'] == item['purchaseOrderItemNo']) {
            element['checked'] = true;
          }
        })
      });
    }
    this.items = this.items.filter(item => {
      return item.checked == true
    })

    let showGRN: any = []
    this.items.map((element: any) => {
      this.apipoGrnDetails.filter((item: any) => {
        if (Number(item['purchaseOrderItemNo']) == Number(element['purchaseOrderItemNo'])) {
          showGRN.push(item);
        }
      })
    })
    this.apipoGrnDetails = showGRN;
    this.poGrnDetails = showGRN;
    this.filterGrnDetails = showGRN;
  }

  updateGRNSES(data: any) {
    console.log('updateGRNSES');

    if (data['poGrnDetails'].length > 0) {
      this.poGrnDetails = data['poGrnDetails'];
      this.poGrnDetails.forEach((item: any) => {
        item.checked = false;
      })
      let acceptedGrn: any = [];
      this.selectedGRNArr = data['poGrnDetails'];
      this.poGrnDetails.forEach((element: any) => {
        this.selectedGRNArr.map((item: any) => {
          if (element['materialDocumentNumber'] == item['materialDocumentNumber']) {
            element['checked'] = true;
            element['disabled'] = true;
            acceptedGrn.push(element);
            this.totalGRNQuantity = this.totalGRNQuantity + Number(item['quantity'])
          }
        })
      });
      this.poGrnDetails = acceptedGrn;
    }

    if (data['poSesDetails'].length > 0) {
      this.poSesDetails = data['poSesDetails'];
      this.poSesDetails.forEach((item: any) => {
        item.checked = false;
      })
      let acceptedSes: any = [];
      this.selectedSESArr = data['poSesDetails'];
      this.poSesDetails.forEach((element: any) => {
        this.selectedSESArr.map((item: any) => {
          if (element['purchaseOrderItemNo'] == item['purchaseOrderItemNo']) {
            element['checked'] = true;
            element['disabled'] = true;
            acceptedSes.push(element);
          }
        })
      });
      this.poSesDetails = acceptedSes;
    }
    this.fillPurchaseForm();
  }

  poSelect(event: any, row: any) {
    console.log('poSelect', event.target.checked);
    let checked = event.target.checked;
    if (checked) {
      this.items.map((item: any) => {
        if (item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']) {
          item['checked'] = true;
          this.selectedItemsArr.push(item)
        }
      })
      this.purchaseForm['controls']['items_arr'].clearValidators();
      this.purchaseForm['controls']['items_arr'].updateValueAndValidity();
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
    }
  }

  grnSelect(event: any, row: any) {
    console.log('poSelect', event.target.checked);
    let checked = event.target.checked;
    if (checked) {
      this.poGrnDetails.map((item: any) => {
        if (item['materialDocumentNumber'] == row['materialDocumentNumber']) {
          item['checked'] = true;
          item['status'] = 'done';
          item['updatedBy'] = this.username;
          item['updatedDate'] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
          this.selectedGRNArr.push(item);
          this.totalGRNQuantity = Number(this.totalGRNQuantity) + Number(item['quantity']);
        }
      })
      this.purchaseForm['controls']['grn_arr'].clearValidators();
      this.purchaseForm['controls']['grn_arr'].updateValueAndValidity();
      if (this.poGrnDetails.length == this.selectedGRNArr.length) {
        this.selectedAll = true;
      }
    } else {
      this.selectedAll = false;
      this.selectedGRNArr.map((item: any, i: any) => {
        if (item['materialDocumentNumber'] == row['materialDocumentNumber']) {
          item['checked'] = false;
          this.selectedGRNArr.splice(i, 1);
          this.totalGRNQuantity = Number(this.totalGRNQuantity) - Number(item['quantity']);
        }
        if (this.selectedGRNArr.length > 0) {
          this.purchaseForm['controls']['grn_arr'].clearValidators();
          this.purchaseForm['controls']['grn_arr'].updateValueAndValidity();
        } else {
          this.purchaseForm['controls']['grn_arr'].setValidators([Validators.required]);
          this.purchaseForm['controls']['grn_arr'].updateValueAndValidity();
        }
      })
    }
    this.compareGRNSES();
  }

  sesSelect(event: any, row: any) {
    console.log('poSelect', event.target.checked);
    let checked = event.target.checked;
    if (checked) {
      this.poSesDetails.map((item: any) => {
        if (item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']) {
          item['checked'] = true;
          item['status'] = 'done';
          item['updatedBy'] = this.username;
          item['updatedDate'] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
          this.selectedSESArr.push(item)
        }
      })
      this.purchaseForm['controls']['ses_arr'].clearValidators();
      this.purchaseForm['controls']['ses_arr'].updateValueAndValidity();
    } else {
      this.selectedSESArr.map((item: any, i: any) => {
        if (item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']) {
          item['checked'] = false;
          this.selectedSESArr.splice(i, 1);
        }
        if (this.selectedSESArr.length > 0) {
          this.purchaseForm['controls']['ses_arr'].clearValidators();
          this.purchaseForm['controls']['ses_arr'].updateValueAndValidity();
        } else {
          this.purchaseForm['controls']['ses_arr'].setValidators([Validators.required]);
          this.purchaseForm['controls']['ses_arr'].updateValueAndValidity();
        }
      })
    }
    this.compareGRNSES();
  }

  compareGRNSES() {
    console.log('compareGRNSES');
    if (this.selectedSESArr.length > 0 || this.selectedGRNArr.length > 0) {
      this.purchaseForm['controls']['grn_arr'].clearValidators();
      this.purchaseForm['controls']['grn_arr'].updateValueAndValidity();
      this.purchaseForm['controls']['ses_arr'].clearValidators();
      this.purchaseForm['controls']['ses_arr'].updateValueAndValidity();
    } else {
      this.purchaseForm['controls']['grn_arr'].setValidators([Validators.required]);
      this.purchaseForm['controls']['grn_arr'].updateValueAndValidity();
      this.purchaseForm['controls']['ses_arr'].setValidators([Validators.required]);
      this.purchaseForm['controls']['ses_arr'].updateValueAndValidity();
    }
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

  viewSuppAttachment(suppData: any) {
    console.log('viewAttachment');
    let filePath = suppData.fileBase64;
    filePath = this.commonService.getEncryptPath(filePath);

    let url = `getBase64FromPath?filePath=${filePath}`;
    // this.commonService.viewAttachment(filePath).subscribe((res:any)=>{
    this.commonService.spinner.show();
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res && res['status'] == 'Success' && res['data']) {
        let link = document.createElement('a');
        link.href = `data:application/${suppData['fileName'].split('.')[1]};base64,${res['data']}`;
        link.download = `${suppData['fileName']}`;
        link.click();
      } else {
        console.log('viewAttachmenterror');
      }
    }, err => {
      this.commonService.spinner.hide();
      console.log(err);
    })
  }

  deleteAttachment(event: any) {
    console.log('deleteAttachment');
    delete (this.editPurchaseData['invoiceAttachment']);
    this.purchaseForm['controls']['attach'].enable();
    this.purchaseForm['controls']['attach_data'].enable();
  }

  structureItems(items: any) {
    console.log('structureItems');

    items.forEach((item: any) => {
      item['netPrice'] = Number(item['netPrice']).toFixed(2);
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
    this.selectedAll = false;
    console.log('resetFilter');
    this.loadDynamicFilterForm();
    this.filterGrnDetails = this.apipoGrnDetails;
    this.poGrnDetails = this.apipoGrnDetails;
    this.updatePagination();
  }

  applyFilter() {
    console.log('applyFilter');
    this.selectedAll = false;
    let filtered: any = [];
    let filter_item_number = this.dynamicFilterForm.value.ref_number;
    if (filter_item_number == '') {
      this.filterGrnDetails = this.apipoGrnDetails;
      this.poGrnDetails = this.apipoGrnDetails;
      this.updatePagination();
    } else {
      filter_item_number = filter_item_number.split(',');
      filter_item_number.map((element: any) => {
        this.apipoGrnDetails.filter((item: any) => {
          if (element == item['refInvoiceNumber']) {
            filtered.push(item);
          }
        })
      })
      console.log(filtered);
      this.filterGrnDetails = filtered;
      this.poGrnDetails = filtered;

      let status = this.poGrnDetails.every((item: any) => {
        return item['checked'] == true
      })
      if (status == true) { this.selectedAll = true }

      this.updatePagination();
    }
  }
  updatePagination() {
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.poGrnDetails.length / this.itemsPerPage);
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
    if (Object.values(this.apipoGrnDetails[0])[0] != '') { }
    this.poGrnDetails = this.filterGrnDetails ? this.filterGrnDetails.slice(this.startIndex, this.endIndex) : [];
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

  calculateServiceAmount() {
    const totalQuantity = this.calculateTotalQuantity();
    const grPrice = this.serviceForm.value.gr_price || 0;
    this.serviceForm.controls.quantity.setValue(totalQuantity);
    this.serviceForm.controls.amount.setValue(this.sesTotalGrossAmount);
    this.serviceForm.controls.quantity.disable();
    this.serviceForm.controls.amount.disable();

    if (this.serviceForm.controls.amount.value == this.sesTotalGrossAmount) {
      this.serviceForm.status = 'VALID';
      this.serviceForm.controls['amount'].setErrors(null);
    } else {
      this.serviceForm.status = 'INVALID';
      this.serviceForm.controls['amount'].setErrors({ 'mismatch': true });
    }
    console.log('Service Form Valid:', this.serviceForm.valid);
  }

calculateTotalQuantity(): number {
  let totalQuantity = 0;
  const groupedByPckgNo: { [key: string]: any[] } = {};
this.selectedSesSubItems.forEach((item:any) => {
  (groupedByPckgNo[item.pckgNo] ||= []).push(item);
});

const groupedArray = Object.entries(groupedByPckgNo).map(([pckgNo, items]) => ({
  pckgNo,
  items
}));
 this.populateServices(groupedArray);
  if (this.selectedSesSubItems && this.selectedSesSubItems.length > 0) {
    this.selectedSesSubItems.forEach((item: any) => {
      totalQuantity += Number(item['quantity']) || 0;
    });
  }
  return totalQuantity;
}

  submitServiceForm() {
    console.log('submitServiceForm');

    if (this.purchaseForm.value.reviewer_remarks == '' || this.purchaseForm.value.reviewer_remarks == null) {
      this.errorToast = true;
      this.toastMsg = 'Please enter remarks';
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
      return;
    }

    //   const lineItem = this.selectedSesSubItems.map((item: any) => {
    //     return {
    //       subPackNo: item['pckgNo'] || '',
    //       lineNo: item['extLineNo'] || '',
    //       qty: item['quantity'] || ''
    //     };
    //   });

    // console.log('Generated lineItem:', lineItem);
    //   console.log("serviceformvalue 1",this.serviceForm1.value);
    //   let url = 'postService';
    //   let json = {
    //     poInvoiceId: this.editPurchaseData.poInvoiceID,
    //     poNumber: this.serviceForm.controls.po_number.value,
    //     poItemNo: this.serviceForm.controls.po_item_no.value,
    //     quantity: this.serviceForm.controls.quantity.value,
    //     amount: this.serviceForm.controls.amount.value,
    //     lineItem: lineItem,
    //     createdBy: this.username,
    //     createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    //     updatedBy: this.username,
    //     updatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    //     status: 'processing',
    //     remarks: this.purchaseForm.value.reviewer_remarks
    //   }
    this.processSequentially();

    // this.commonService.dataPost(url, jsonArray).subscribe((res: any) => {
    //   console.log(res);
    //   if (res?.status == 'Success') {
    //     // this.commonService.routeToDashboard();
    //     this.commonService.routeToPage('./dashboard');
    //     this.successToast = true;
    //     this.toastMsg = 'Service created successfully';
    //     setTimeout(() => {
    //       this.successToast = false;
    //     }, 2000);
    //   } else {
    //     this.errorToast = true;
    //     this.toastMsg = 'Something wrong';
    //     setTimeout(() => {
    //       this.errorToast = false;
    //     }, 2000);
    //   }
    // }, err => {
    //   console.log(err);
    // })
    // console.log("jsonArray", jsonArray);

    // jsonArray.forEach((json, index) => {
    //   this.commonService.dataPost(url, json).subscribe(
    //     (res: any) => {
    //       console.log(`Response for item ${index}:`, res);

    //       if (res?.status === 'Success') {
    //         this.successToast = true;
    //         this.toastMsg = 'Service created successfully';
    //         setTimeout(() => {
    //           this.successToast = false;
    //         }, 2000);

    //         // Optional: Navigate only after last item succeeds
    //         // if (index === jsonArray.length - 1) {
    //         //   this.commonService.routeToPage('./dashboard');
    //         // }
    //       } else {
    //         this.errorToast = true;
    //         this.toastMsg = 'Something wrong';
    //         setTimeout(() => {
    //           this.errorToast = false;
    //         }, 2000);
    //       }
    //     },
    //     err => {
    //       console.log(`Error for item ${index}:`, err);
    //       this.errorToast = true;
    //       this.toastMsg = 'Something wrong';
    //       setTimeout(() => {
    //         this.errorToast = false;
    //       }, 2000);
    //     }
    //   );
    // });



  }
  processSequentially(index: number = 0) {
    let url = 'postService';
    const lineItem = this.selectedSesSubItems.map((item: any) => {
      return {
        subPackNo: item['pckgNo'] || '',
        lineNo: item['extLineNo'] || '',
        qty: item['quantity'] || ''
      };
    });

    const jsonArray = this.services.controls.map((group: any) => {
      return {
        poInvoiceId: this.editPurchaseData.poInvoiceID,
        poNumber: group.get('po_number')?.value,
        poItemNo: group.get('po_item_no')?.value,
        quantity: group.get('quantity')?.value,
        amount: group.get('amount')?.value,
        lineItem: lineItem.filter(
          (item: any) => item.subPackNo === group.get('pckgNo')?.value), // Replace with your logic to get lineItem
        createdBy: this.username,
        createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        updatedBy: this.username,
        updatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        status: 'processing',
        remarks: this.purchaseForm.value.reviewer_remarks
      };
    });
    console.log("jsonArray", jsonArray)
    if (index >= jsonArray.length) {
      // All API calls succeeded
      this.commonService.routeToPage('./dashboard');
      return;
    }

    const json = jsonArray[index];
    this.commonService.dataPost(url, json).subscribe(
      (res: any) => {
        console.log(`Response for item ${index}:`, res);

        if (res?.status === 'Success') {
          this.successToast = true;
          this.toastMsg = 'Service created successfully';
          setTimeout(() => {
            this.successToast = false;
          }, 2000);

          // Proceed to next item
          this.processSequentially(index + 1);
        } else {
          this.errorToast = true;
          this.toastMsg = 'Something went wrong';
          setTimeout(() => {
            this.errorToast = false;
          }, 2000);
        }
      },
      err => {
        console.log(`Error for item ${index}:`, err);
        this.errorToast = true;
        this.toastMsg = 'Something went wrong';
        setTimeout(() => {
          this.errorToast = false;
        }, 2000);
      }
    );
  }

  ngOnDestroy() {
    this.commonService.updatePurchase = false;
    this.purchaseForm.reset();
  }
}
