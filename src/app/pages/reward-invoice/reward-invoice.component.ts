import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reward-invoice',
  templateUrl: './reward-invoice.component.html',
  styleUrls: ['./reward-invoice.component.scss']
})

export class RewardInvoiceComponent {

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
  selectedSupportFormData: any;

  apiitems: any = [];
  filterItems: any = [];
  items: any = [];
  poGrnDetails: any[] = [];
  poGrnItems: any[] = [];
  logintype: any;
  username: any;
  siteTable: any = [];
  selectedAll = false;
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
  totalPages: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  visiblePages: number[] = [];
  public pagedData: any[] = [];
  public apiPagedData: any[] = [];
  public data: any[] = [];
  poNumber: any;
  childVendorCode: any;
  invoiceNoExist = false;

  viewPurchase = false;
  poNumberArray: any = [];

  supportDocument: any = []
  uploadSupportMode: any = 'upload'
  roleName:string|null
  @ViewChild('invoice') 'invoice': ElementRef;
  @ViewChild('suppportinvoice') 'suppportinvoice': ElementRef;
  @ViewChild('signedAttach') 'signedAttach': ElementRef;

  constructor(public commonService: CommonService, private brearcumbService: BreadcrumbService, private router: Router) {
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
    console.log('ngOnInit', this.apiitems, this.items);

    this.loadPurchaseForm();
    this.loadDynamicFilterForm();
    this.loadDynamicFilterForm1()
    this.purchaseForm.reset();
    if (this.commonService.updatePurchase == true) {
      this.updateInvoice();
    }
    if (this.commonService.viewPurchase == true) {
      this.updateInvoice();
    }
  }

  disabledAllField() {
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
      rece_gst_no: new FormControl(''),
      currency: new FormControl(''),

      payment_mode: new FormControl('', [Validators.required]),
      adani_contact: new FormControl(''),
      submission_to: new FormControl('', [Validators.required]),

      material_group: new FormControl(''),
      payment_term: new FormControl(''),

      attach: new FormControl('', [Validators.required]),
      attach_data: new FormControl('', [Validators.required]),
      attach_data_supp: new FormControl(''),

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
      this.purchaseForm['controls']['invoice_type'].setValue('Reward');
    }, 0);
  }

  allowInvoiceChars(event: KeyboardEvent): boolean {
    const allowedChars = /^[a-zA-Z0-9\-\/]$/;
    const key = event.key;
    return allowedChars.test(key);
  }


  resetPurchaseForm() {
    console.log('resetPurchaseForm');
    // this.commonService.routeToPurchaseOrder();
    this.commonService.routeToPage('./dashboard/reward-invoice');
  }

  updateInvoice() {
    console.log('updateInvoice');

    if(this.commonService['editPurchaseData']['History']){
      this.editPurchaseData = this.commonService['editPurchaseData']['History'];
      if(Object.keys(this.editPurchaseData).length > 0) {
        this.getPODetail(this.editPurchaseData['poNumber'], this.editPurchaseData['invoiceType']);
      }
    }else{
      let url = `POInvoiceDetails?createdBy=${this.userdata['ACCOUNTNUMBER']}`;
      // this.commonService.getPurchaseOrderList(this.userdata['ACCOUNTNUMBER']).subscribe((res:any)=>{
      this.commonService.dataGet(url).subscribe((res: any) => {
        console.log(res);
        if (res && res['status'] == 'Success' && res['data'].length > 0) {
          this.editPurchaseData = res['data'].find((item: any) => {
            return item['invoiceNumber'] == this.commonService['editPurchaseData']['Invoice Number'];
          })
          if (Object.keys(this.editPurchaseData).length > 0) {
            this.getPODetail(this.editPurchaseData['poNumber'], this.editPurchaseData['invoiceType']);
          }
        } else {
          console.log();
        }
      }, err => {
        console.log(err);
      })
    }
  }


  fillPurchaseForm() {
    console.log('fillPurchaseForm');

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
    this.purchaseForm['controls']['remarks'].setValue(this.editPurchaseData['remarks']);
    this.purchaseForm['controls']['items_arr'].setValue(this.editPurchaseData['poInvoiceItems']);

    setTimeout(() => {
      this.refresItemsList();
    }, 0);

    this.purchaseForm['controls']['attach'].clearValidators();
    this.purchaseForm['controls']['attach'].updateValueAndValidity();
    this.purchaseForm['controls']['invoice_number'].disable();
    this.purchaseForm['controls']['po_number'].disable();
    this.purchaseForm['controls']['company'].disable();
    this.purchaseForm['controls']['attach'].disable();
    this.purchaseForm['controls']['attach_data'].disable();
    this.selectedItemsArr = this.editPurchaseData.poInvoiceItems;
    this.uploadedDigitalSigned = this.editPurchaseData.invoiceAttachment;
    this.selectedAllAttachmentSupport = this.editPurchaseData.invoiceAttachment;
    // this.selectedAllAttachmentSupport = JSON.parse(this.editPurchaseData['invoiceAttachment'][0]['supportattachmentfilepath']);
    this.supportDocument = JSON.parse(this.editPurchaseData['invoiceAttachment'][0]['supportattachmentfilepath']);
    this.uploadSupportMode = this.editPurchaseData['status'] == 'sent-back' ? 'edit' : 'view';
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
      /* alert(`🚫 vSPEED Functionality Disabled
      Due to updates introduced with GST 2.0, the vSPEED feature has been temporarily disabled.
      We’re working to align with the new compliance standards and will notify you once functionality is restored.
      Thank you for your understanding.`); */
      this.commonService.routeToPage('./dashboard/freight-inbound-invoice');
    } else if (invoice_type == 'Reward') {
      this.commonService.routeToPage('./dashboard/reward-invoice');
    } else if (invoice_type == 'Contracts') {
      this.commonService.routeToPage('./CAD/vendor/home/invoice');
    } else {
      this.commonService.routeToPage('./dashboard/purchase');
    }
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

  getPODetail(po_number?: any, invoice_type?: any) {
    console.log('getPODetail', this.items, this.apiitems, this.filterItems);

    this.errorToast = false;
    this.selectedAll = false
    this.selectedItemsArr = [];
    this.selectedItemsDataArr = [];
    this.submissionArr = [];
    this.poNumber = po_number;
    this.commonService.spinner.show();

    let url = `getPODetails?poNumber=${po_number}&invoiceType=${invoice_type}`
    // this.commonService.getPODetail(po_number, invoice_type).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();

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
        this.purchaseForm['controls']['material_group'].setValue(res['data']['materialGroup'] ? res['data']['materialGroup'] : '');
        this.purchaseForm['controls']['payment_term'].setValue(res['data']['paymentTerm'] ? res['data']['paymentTerm'] : '');
        this.purchaseForm['controls']['supp_gst_no'].setValue(this.userdata.GST);
        this.purchaseForm['controls']['currency'].setValue('INR');
        this.purchaseForm['controls']['payment_mode'].setValue('rtgs');
        this.getSubmissionTo(res['data']['poItems'][0]['plantCode'], invoice_type, res['data']['poItems'][0]['preqNo']);
        this.getChildGST()
        this.globalHsnCode = res['data']['poItems'][0]['hsnCode'] ? res['data']['poItems'][0]['hsnCode'] : 995461;
      }

      if (res['data'] && res['data']['poGrnItems'].length > 0) {
        this.poGrnDetails = res['data']['poGrnItems'];
      }

      this.purchaseForm['controls']['items_arr'].enable();
      this.updateItems();

      this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      this.updateVisiblePages();
      this.updatePagedData();
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
      this.purchaseForm['controls']['plant_code'].enable();
      this.purchaseForm['controls']['items_arr'].enable();
      return;
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
        this.purchaseForm['controls']['submission_to'].enable();
        if (res['data']['employeeData']) {
          /* this.submissionArr = res['data']['employeeData'].filter((item:any)=>{
            return item['adminAccess']==false
          }); */
          this.submissionArr = res['data']['employeeData'];
          if (this.submissionArr.length == 1) {
            this.purchaseForm.controls.submission_to.setValue(this.submissionArr[0]['createdBy']);
            this.purchaseForm.controls.submission_to.disable();
          }
        }
        if (this.commonService.updatePurchase == true || this.commonService.viewPurchase == true) {
          this.fillPurchaseForm();
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
      if (this.commonService.updatePurchase == true || this.commonService.viewPurchase == true) {
        this.fillPurchaseForm();
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

  selectChildVendorCode(item: any) {
    console.log(item);

    let select = this.childGSTArr.find((ele: any) => {
      return ele.gstNumber == item.target.value
    })
    this.childVendorCode = select.vendorCode;
  }

  /* Attachment Start */
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
    /* this.selectedAllAttachment.push(attach_json);
    this.purchaseForm['controls']['attach_data'].setValue(this.selectedAllAttachment); */
  }

  onImageCaptureSupport(evt: any) {
    this.selectedAllAttachmentSupport = [];
    var files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
      console.log(files[i]);

      let file = files[i];
      let extension_list = ['pdf', 'xls', 'csv', 'xlsx', 'zip', 'doc'];
      let file_name = file['name'];
      let file_extension = file_name.split('.').pop();
      if (!extension_list.includes(file_extension.toLowerCase())) {
        this.purchaseForm.controls['attach'].setValue('');
        this.toastMsg = "file with extension ." + file_extension + " not allowed";
        this.errorToast = true;
        return;
      }

      this.selectedSupportFormData = file;

      if (files && file) {
        var reader = new FileReader();
        reader.onload = this._onImageCaptureSupport.bind(this, file);
        reader.readAsBinaryString(file);
      }
    }
  }

  _onImageCaptureSupport(readerEvt: any, file?: any) {
    var binaryString = file.target.result;
    let base64 = btoa(binaryString);
    let attach_json = {
      fileName: readerEvt.name,
      fileBase64: base64
    }
    this.selectedAllAttachmentSupport.push(attach_json);
    this.purchaseForm['controls']['attach_data_supp'].setValue(this.selectedAllAttachmentSupport);
    console.log(btoa(binaryString));
  }

  downloadMergedAttachment() {
    console.log('downloadMergedAttachment');
    this.commonService.spinner.show();
    let json = [...this.selectedAllAttachment, ...this.selectedAllAttachmentSupport];
    let url = `mergePDF`;
    // this.commonService.getMergedAttachment(json).subscribe((res:any)=>{
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res['status'] == 'Success' && res['data'] != '') {
        /* this.uploadedDigitalSigned.push({
          fileName : 'signed.pdf',
          fileBase64 : res['data']
        }) */
        this.enableUploadDigital = true;
        let a = document.createElement('a');
        a.href = `data:application/pdf;base64,${res.data}`;
        a.download = 'mergefile.pdf';
        a.click();
      }
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
    })
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
  /* Attachment End*/

  /* Invoice Submit */
  submitPurchaseSuppAttachment() {
    console.log('submitPurchaseSuppAttachment');

    if (this.selectedSupportFormData) {
      const formData = new FormData();
      formData.append('supportFile', this.selectedSupportFormData, this.selectedSupportFormData.name)

      let url = `uploadLargeFile`;

      this.commonService.spinner.show();
      this.commonService.dataPostAttach(url, formData).subscribe((res: any) => {
        console.log(res);
        this.commonService.spinner.hide();
        if (res && res['status'] == 'Success' && res['message'] == 'File has been uploaded') {
          this.submitPurchaseForm(res['data']);
        } else {
          this.errorToast = true;
          this.toastMsg = res['message'];
        }
      }, err => {
        console.log(err);
        this.commonService.spinner.hide();
        this.errorToast = true;
        this.toastMsg = err['error']['message'] ? err['error']['message'] : 'File Upload Fail';
        setTimeout(() => {
          this.errorToast = false;
        }, 2000);
      })
    } else {
      this.submitPurchaseForm();
    }
  }


  submitPurchaseForm(supportFile?: any) {
    console.log('callSubmitPurchaseFormApi');

    let submission_to: any = []
    this.submissionArr.map((ele: any) => {
      if (ele.createdBy == this.purchaseForm['controls']['submission_to'].value) {
        /* submission_to.push({
          "createdBy": ele.loginId,
          "name": ele.employeeName,
          "email": ele.email
        }) */
        submission_to.push(ele)
      }
    });

    let json: any = {
      poNumber: this.purchaseForm['controls']['po_number'].value,
      invoiceNumber: this.purchaseForm['controls']['invoice_number'].value,
      invoiceType: this.purchaseForm['controls']['invoice_type'].value,
      invoiceDate: moment(new Date(this.purchaseForm['controls']['invoice_date'].value)).format('YYYY-MM-DD HH:mm:ss'),

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
      // submissionTo: this.purchaseForm['controls']['submission_to'].value,
      submissionTo: JSON.stringify(submission_to).replace(/"/g, '\\"'),

      materialGroup: this.purchaseForm['controls']['material_group'].value,
      paymentTerm: this.purchaseForm['controls']['payment_term'].value,
      uploadedByBusinessUser :this.roleName == 'BusinessUser' ? 1:0,
      attach: this.uploadedDigitalSigned,
      remarks: this.purchaseForm['controls']['remarks'].value ? this.purchaseForm['controls']['remarks'].value : null,
      poInvoiceItems: this.selectedItemsArr,
      poCalculateItem: this.selectedItemsDataArr,
    }

    if (this.commonService.updatePurchase == true) {
      if (this.purchaseForm.controls['attach_data'].value) {
        json.attach = this.purchaseForm['controls']['attach_data'].value;
        // json.supportAttach = this.uploadSupportMode == 'upload' ? this.selectedAllAttachmentSupport : [];
        json.supportAttach = this.uploadSupportMode == 'upload' ? [{ "fileName": supportFile.split('/').pop(), "fileBase64": supportFile }] : [];
      } else {
        json.attach = [];
        // json.supportAttach = this.uploadSupportMode == 'upload' ? this.selectedAllAttachmentSupport : [];
        json.supportAttach = this.uploadSupportMode == 'upload' ? [{ "fileName": supportFile.split('/').pop(), "fileBase64": supportFile }] : [];
      }
      json.status = 'pending';
      json.sapStatus = this.editPurchaseData.sapStatus;
      json.pdfTransferredSap = null;
      json.createdBy = this.editPurchaseData.createdBy;
      json.createdDate = moment(this.editPurchaseData.createdDate).format('YYYY-MM-DD HH:mm:ss');
      json.updatedBy = this.username;
      json.updatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      json.poInvoiceID = this.editPurchaseData.poInvoiceID;
      json.reviewerRemarks = this.editPurchaseData['reviewerRemarks'];
    } else {
      json.attach = this.uploadedDigitalSigned,
        // json.supportAttach = this.purchaseForm.value.attach_data_supp?this.purchaseForm.value.attach_data_supp:[];
        // json.supportAttach = this.selectedAllAttachmentSupport ? this.selectedAllAttachmentSupport : [];
        json.supportAttach = [
          { "fileName": supportFile.split('/').pop(), "fileBase64": supportFile }
        ];
      json.status = 'pending';
      json.sapStatus = 0;
      json.pdfTransferredSap = null;
      json.createdBy = this.userdata['ACCOUNTNUMBER'];
      json.createdDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      json.updatedBy = this.username;
      json.updatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }

    let url = `PostPOInvoice`;
    this.commonService.spinner.show();
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res && res['status'] == 'Success') {
        this.successToast = true;
        this.toastMsg = res['message'];
        // this.commonService.routeToDashboard();
        this.commonService.routeToPage('./dashboard');
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

  refresItemsList() {
    this.items = this.items.map((element: any) => {
      return element;
    })
    let pop = this.items.pop();
    setTimeout(() => {
      this.items.push(pop);
    }, 0)
  }





  checkAll(event: any) {
    this.selectedAll = event.target.checked;

    if (event.target.checked) {
      this.filterItems.forEach((item: any) => {
        if (item['remainingQuantity'] !== "0") {
          item['checked'] = true;
          item['status'] = 'done';
          item['updatedBy'] = this.username;
          item['updatedDate'] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

          let existingItem = this.selectedItemsArr.find((selected: any) => selected.purchaseOrderItemNo === item.purchaseOrderItemNo);

          if (!existingItem) {
            let newQuantity = Number(item.newQuantity) || Number(item.quantity) || 1;

            let newItem = {
              ...item,
              newQuantity,
              netAmount: (newQuantity * Number(item.netPrice || 0)).toFixed(2),
              tax: (newQuantity * Number(item.netPrice || 0) * (item.taxRate || 0)).toFixed(2),
              grossAmount: (newQuantity * Number(item.netPrice || 0)).toFixed(2)
            };

            this.selectedItemsArr.push(newItem);
          }
        }
      });

      this.purchaseForm['controls']['items_arr'].clearValidators();
    } else {
      this.filterItems.forEach((item: any) => {
        item['checked'] = false;
      });
      this.selectedItemsArr = [];
      this.purchaseForm['controls']['items_arr'].setValidators([Validators.required]);
    }

    this.selectedItemsDataArr = [...this.selectedItemsArr];
    this.totalNetAmount = this.selectedItemsDataArr.reduce((sum: any, item: any) => sum + Number(item.netAmount || 0), 0).toFixed(2);
    this.totalGrossAmount = this.selectedItemsDataArr.reduce((sum: any, item: any) => sum + Number(item.grossAmount || 0), 0).toFixed(2);

    this.purchaseForm['controls']['invoice_amount_line'].setValue(this.totalGrossAmount);
    this.purchaseForm['controls']['items_arr'].updateValueAndValidity();
    this.updatePagedData();
    this.updateSelectAllCheckbox(this.filterItems);
  }



  calculateTotals() {
    this.totalNetAmount = this.selectedItemsArr.reduce((sum: any, item: any) => sum + Number(item.netAmount), 0).toFixed(2);
    this.totalGrossAmount = this.selectedItemsArr.reduce((sum: any, item: any) => sum + Number(item.grossAmount), 0).toFixed(2);
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

      this.selectedItemsDataArr.map((ele:any)=>{
        this.items.map((item:any)=>{
          if(ele.purchaseOrderItemNo == item.purchaseOrderItemNo){
            ele.maxAllowQty = item.maxAllowQty;
          }
        })
      })

      this.calculateTotal();
    }
  }



  poSelect(event: any, row: any) {
    if (row['remainingQuantity'] === "0") {
      event.target.checked = false;
      this.errorToast = true;
      this.toastMsg = 'PO Item remaining quantity is 0';

      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
      return;
    }

    let checked = event.target.checked;
    this.addRemoveItemsDataArr(event, row);

    if (checked) {
      let exists = this.selectedItemsArr.some((item: any) => item.purchaseOrderItemNo === row.purchaseOrderItemNo);
      if (!exists) {
        this.apiitems.forEach((item: any) => {
          if (item['purchaseOrderItemNo'] === row['purchaseOrderItemNo']) {
            item['checked'] = true;
            this.selectedItemsArr.push(item);
          }
        });
      }
      this.purchaseForm['controls']['items_arr'].clearValidators();
    } else {
      this.selectedItemsArr = this.selectedItemsArr.filter((item: any) =>
        item.purchaseOrderItemNo !== row.purchaseOrderItemNo
      );

      this.apiitems.forEach((item: any) => {
        if (item['purchaseOrderItemNo'] === row['purchaseOrderItemNo']) {
          item['checked'] = false;
        }
      });

      if (this.selectedItemsArr.length === 0) {
        this.purchaseForm['controls']['items_arr'].setValidators([Validators.required]);
      }
    }

    this.purchaseForm['controls']['items_arr'].updateValueAndValidity();
    this.updateSelectAllCheckbox(this.apiitems);
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
        itemDescription: row['itemDescription'],
        taxCode: row['taxCode'],
        // hsnCode: row['hsnCode']?row['hsnCode']:this.globalHsnCode,
        hsnCode: row['hsnCode'] ? row['hsnCode'] : '',
        // quantity: Number(row['quantity']),
        quantity: Number(row['remainingQuantity']),
        actualquantity: Number(row['remainingQuantity']),
        maxAllowQty: Number(row['maxAllowQty']),
        netPrice: Number(row['netPrice']),
        // netAmount: Number(Number(row['quantity'])*Number(row['netPrice'])).toFixed(2),
        netAmount: Number(Number(row['remainingQuantity']) * Number(row['netPrice'])).toFixed(2),
        taxRate: Number(row['taxRate']) ? Number(row['taxRate']) : '',
        tax: Number(row['taxRate']) ? (Number(Number(row['remainingQuantity']) * Number(row['netPrice']) * Number(row['taxRate'])).toFixed(2)) : '',
        // grossAmount: Number(Number(row['remainingQuantity'])*Number(row['netPrice'])+Number(row['remainingQuantity'])*Number(row['netPrice'])*Number(row['taxRate'])).toFixed(2),
        grossAmount: Number(Number(row['remainingQuantity']) * Number(row['netPrice'])).toFixed(2),
        materialNumber: row['materialNumber'],
        plantCode: row['plantCode']
      })
      // if(!row['hsnCode'] || !row['taxRate'] && this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']) == -1){
      /* if(!row['hsnCode'] && this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']) == -1){
        this.blankHsnCodeArray.push(row['purchaseOrderItemNo']);
      } */
    } else {
      this.selectedItemsDataArr.map((item: any, index: any) => {
        if (item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']) {
          this.selectedItemsDataArr.splice(index, 1);
        }
      })
      if (this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']) > -1) {
        this.blankHsnCodeArray.splice(this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']), 1);
      }
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
        item['tax'] = Number(Number(item['quantity']) * Number(item['netPrice']) * Number(item['taxRate'])).toFixed(2);
        // item['grossAmount'] =  Number(Number(item['quantity'])*Number(item['netPrice'])+Number(item['quantity'])*Number(item['netPrice'])*Number(item['taxRate'])).toFixed(2);
        item['grossAmount'] = Number(Number(item['quantity']) * Number(item['netPrice'])).toFixed(2);
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
      this.totalNetAmount = Number(Number(this.totalNetAmount) + Number(item['netAmount'])).toFixed(2);
      this.totalTax = Number(Number(this.totalTax) + Number(item['tax'])).toFixed(2);
      this.totalGrossAmount = Number(Number(this.totalGrossAmount) + Number(item['grossAmount'])).toFixed(2);
    })
    this.purchaseForm['controls']['invoice_amount_line'].setValue(this.totalGrossAmount);
  }

  compareAmount(event?: any) {
    console.log('compareAmount');
    if (Number(this.purchaseForm['controls']['invoice_amount'].value) && Number(this.purchaseForm['controls']['invoice_amount_line'].value)) {
      if (Number(this.purchaseForm['controls']['invoice_amount'].value) == Number(this.purchaseForm['controls']['invoice_amount_line'].value)) {
        console.log('match');
        this.purchaseForm['controls']['invoice_amount'].setErrors();
        this.purchaseForm['controls']['invoice_amount'].clearValidators();
      } else {
        console.log('mismatch');
        this.purchaseForm['controls']['invoice_amount'].setErrors({ 'amount_mismatch': true });
      }
    } else {
      console.log('value mismatch');
      this.purchaseForm['controls']['invoice_amount'].setErrors({ 'amount_mismatch': true });
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
    let exten = filePath.split('.').pop();

    if (exten == 'txt') {
      filePath = this.commonService.getEncryptPath(filePath);
      let url = `getBase64FromPath?filePath=${filePath}`;
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
    } else {
      let url = `downloadFile?filePath=${filePath}`;
      this.commonService.spinner.show();
      this.commonService.dataGetAttach(url).subscribe((blob: any) => {
        this.commonService.spinner.hide();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${suppData['fileName']}`;
        link.click();
      }, err => {
        this.commonService.spinner.hide();
        console.log(err);
      })
    }

    return;

    /* let url = `getBase64FromPath?filePath=${filePath}`;
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
    }) */
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
    this.filterItems = this.apiitems;
    this.items = this.apiitems;
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

  /* --Pagination Start*/
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
  /* Pagination-- End*/

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

  ngOnDestroy() {
    this.commonService.updatePurchase = false;
    this.purchaseForm.reset();
  }

  @ViewChild('uploadExcel') 'uploadExcel': ElementRef;
  dynamicFilterForm1: any;
  filterGrnDetails: any = [];

  loadDynamicFilterForm1() {
    this.dynamicFilterForm1 = new FormGroup({
      'Contract_item_Number': new FormControl(''),
    })
  }

  updateSelectAllCheckbox(item: any[]) {
    console.log('items', item);
    this.selectedAll = item.length > 0 && item.every((item: any) => item.checked);

  }



  uploadExcelFile(event: any) {
    console.log('function worked');

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const sheetData: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      console.log(sheetData[0]);


      const requiredKeys = ['Contract Item Number', 'Quantity', 'PO Number'];

      const normalizedSheetData = sheetData.map((row: any) => {
        const normalizedRow: any = {};
        Object.keys(row).forEach((key) => {
          const matchedKey = requiredKeys.find(reqKey => reqKey.toLowerCase() === key.toLowerCase()); // Match case-insensitively
          if (matchedKey) {
            normalizedRow[matchedKey] = row[key];
          }
        });
        return normalizedRow;
      });

      const allKeysPresent = normalizedSheetData.every((obj: any) =>
        requiredKeys.every(key => obj.hasOwnProperty(key))
      );

      if (allKeysPresent) {
        console.log("All keys are present in the objects.");
        this.processExcelData(normalizedSheetData);
      } else {
        console.log("Some keys are missing.");
        this.errorToast = true;
        this.toastMsg = "Excel Format is not proper or some values are empty";
        setTimeout(() => {
          this.errorToast = false;
        }, 5000);
      }
      if (!Array.isArray(sheetData) || sheetData.length === 0) {
        console.error('Invalid Excel format');
        return;
      }


    };
    reader.readAsArrayBuffer(file);
    setTimeout(() => {
      this.uploadExcel.nativeElement.value = null;
    }, 100);
  }


  // processExcelData(excelData: any[]) {
  //   console.log('Excel Data:', excelData);
  //   console.log('Table Items (Before Update):', this.apiitems);

  //   let missingContracts: string[] = [];
  //   let missingPO: string[] = [];

  //   excelData.forEach((row: any) => {
  //     const contractNumber = String(row['Contract Item Number']).padStart(5, '0');
  //     const existsInTable = this.apiitems.some((item: any) =>
  //       String(item.contractItemNo) === contractNumber
  //     );
  //     const existsInTablePO = this.apiitems.some((item: any) =>
  //       String(row['PO Number']) === String(this.poNumber)
  //     );
  //     if (!existsInTable) {
  //       missingContracts.push(contractNumber);
  //     }
  //     if (!existsInTablePO) {
  //       missingPO.push(row['PO Number']);
  //     }
  //   });

  //   if (missingContracts.length > 0) {
  //     this.errorToast = true;
  //     this.toastMsg = `${missingContracts.length > 1 ? `Contract Item Numbers: ${missingContracts.join(', ')} are missing in the table` : `Contract Item Number: ${missingContracts.join(', ')} is missing in the table`}`;
  //     setTimeout(() => { this.errorToast = false; }, 5000);
  //     return;
  //   }
  //   if (missingPO.length > 0) {
  //     this.errorToast = true;
  //     this.toastMsg = `${missingPO.length > 1 ? `PO Numbers: ${missingPO.join(', ')} are Mismatched` : `PO Number: ${missingPO.join(', ')} is Mismatched`}`;
  //     setTimeout(() => { this.errorToast = false; }, 5000);
  //     return;
  //   }

  //   excelData.forEach((row: any) => {
  //     const contractNumber = String(row['Contract Item Number']).padStart(5, '0');
  //     const newQuantity = Number(row['Quantity']);

  //     const existingItemIndex = this.apiitems.findIndex((item: any) =>
  //       String(item.contractItemNo) === contractNumber &&
  //       String(row['PO Number']) === String(this.poNumber)
  //     );

  //     if (existingItemIndex !== -1) {
  //       const existingItem = this.apiitems[existingItemIndex];

  //       if (newQuantity > Number(existingItem.remainingQuantity)) {
  //         this.errorToast = true;
  //         this.toastMsg = `Max allowed Qty is ${existingItem.remainingQuantity} for ${contractNumber}`;
  //         setTimeout(() => { this.errorToast = false; }, 5000);
  //         return;
  //       }

  //       this.apiitems[existingItemIndex] = {
  //         ...existingItem,
  //         checked: true,
  //         newQuantity: newQuantity,
  //         netAmount: (newQuantity * Number(existingItem.netPrice || existingItem.netAmount || 0)).toFixed(2),
  //         tax: (newQuantity * Number(existingItem.netPrice || 0) * (existingItem.taxRate || 0)).toFixed(2),
  //         grossAmount: (newQuantity * Number(existingItem.netPrice || 0)).toFixed(2),
  //       };
  //     } else {
  //       const newItem = {
  //         contractItemNo: contractNumber,
  //         checked: true,
  //         newQuantity: newQuantity,
  //         netPrice: Number(row['Net Price'] || 0),
  //         taxRate: Number(row['Tax Rate'] || 0),
  //         netAmount: (newQuantity * Number(row['Net Price'] || 0)).toFixed(2),
  //         tax: (newQuantity * Number(row['Net Price'] || 0) * (row['Tax Rate'] || 0)).toFixed(2),
  //         grossAmount: (newQuantity * Number(row['Net Price'] || 0)).toFixed(2),
  //         itemDescription: row['Item Description'],
  //       };

  //       this.apiitems.push(newItem);
  //     }
  //   });

  //   this.selectedItemsArr = this.apiitems
  //     .filter((item: any) => item.checked)
  //     .map((item: any) => ({
  //       purchaseOrderItemNo: item.purchaseOrderItemNo,
  //       itemDescription: item.itemDescription,
  //       taxCode: item.taxCode,
  //       hsnCode: item.hsnCode,
  //       quantity: Number(item.newQuantity || item.quantity || 0),
  //       actualquantity: Number(item.quantity || 0),
  //       maxAllowQty: Number(item.maxAllowQty || 0),
  //       netPrice: Number(item.netPrice || 0),
  //       netAmount: Number(item.netAmount || (item.quantity * item.netPrice || 0)).toFixed(2),
  //       taxRate: Number(item.taxRate || 0),
  //       tax: Number(item.tax || (item.quantity * item.netPrice * item.taxRate || 0)).toFixed(2),
  //       grossAmount: Number(item.grossAmount || (item.quantity * item.netPrice || 0)).toFixed(2),
  //       materialNumber: item.materialNumber,
  //       plantCode: item.plantCode
  //     }));

  //   this.selectedItemsDataArr = this.selectedItemsArr;

  //   this.totalNetAmount = this.selectedItemsDataArr.reduce((sum: any, item: any) => sum + Number(item.netAmount), 0).toFixed(2);
  //   this.totalGrossAmount = this.selectedItemsDataArr.reduce((sum: any, item: any) => sum + Number(item.grossAmount), 0).toFixed(2);
  //   this.purchaseForm['controls']['invoice_amount_line'].setValue(this.totalGrossAmount);

  //   this.items = this.apiitems;
  //   this.filterItems = this.apiitems;
  //   this.updateSelectAllCheckbox(this.apiitems);
  //   this.updatePagination();
  // }
  missingContracts: string[] = [];
  missingPO: string[] = [];
  quantityError = false;
  quantityErrors: string[] = [];
  errorFlag = false;

  processExcelData(excelData: any[]) {
    excelData.forEach((row: any) => {
      const contractNumber = String(row['Contract Item Number']).padStart(5, '0');
      const existsInTable = this.apiitems.some((item: any) =>
        String(item.contractItemNo) === contractNumber
      );
      const existsInTablePO = this.apiitems.some((item: any) =>
        String(row['PO Number']) === String(this.poNumber)
      );
      if (!existsInTable) {
        this.missingContracts.push(contractNumber);
        this.errorFlag = true;
      }
      if (!existsInTablePO) {
        this.missingPO.push(row['PO Number']);
        this.errorFlag = true;
      }
    });

    // if (this.missingContracts.length > 0) {
    //   document.getElementById('refNotFoundModalButton')?.click();
    //   // this.errorToast = true;
    //   // this.toastMsg = `${missingContracts.length > 1 ? `Contract Item Numbers: ${missingContracts.join(', ')} are missing in the table` : `Contract Item Number: ${missingContracts.join(', ')} is missing in the table`}`;
    //   // setTimeout(() => { this.errorToast = false; }, 5000);
    //   console.log('missingContracts', this.quantityErrors);
    //   return;
    // }
    // if (this.missingPO.length > 0) {
    //   document.getElementById('refNotFoundModalButton')?.click();
    //   // this.errorToast = true;
    //   // this.toastMsg = `${this.missingPO.length > 1 ? `PO Numbers: ${this.missingPO.join(', ')} are Mismatched` : `PO Number: ${this.missingPO.join(', ')} is Mismatched`}`;
    //   // setTimeout(() => { this.errorToast = false; }, 5000);
    //   console.log('missingPO', this.quantityErrors);
    //   return;
    // }


    // if (this.quantityErrors.length > 0) {
    //   document.getElementById('refNotFoundModalButton')?.click();
    //   return;
    // }

    excelData.forEach((row: any) => {
      const contractNumber = String(row['Contract Item Number']).padStart(5, '0');
      const newQuantity = Number(row['Quantity']);

      const existingItemIndex = this.apiitems.findIndex((item: any) =>
        String(item.contractItemNo) === contractNumber &&
        String(row['PO Number']) === String(this.poNumber)
      );

      if (existingItemIndex !== -1) {
        const existingItem = this.apiitems[existingItemIndex];

        // if (newQuantity > Number(existingItem.remainingQuantity)) {
        //   this.errorToast = true;
        //   this.toastMsg = `Max allowed Qty is ${existingItem.remainingQuantity} for ${contractNumber}`;
        //   setTimeout(() => { this.errorToast = false; }, 5000);
        //   this.quantityError = true;
        //   return;
        // }
        if (newQuantity > Number(existingItem.remainingQuantity)) {
          this.quantityErrors.push(`Max allowed Qty is ${existingItem.remainingQuantity} for ${contractNumber}`);
          this.quantityError = true;
          this.errorFlag = true;
          // return;
        }
        console.log('quantityErrors', this.quantityErrors);

        if (this.errorFlag) {
          document.getElementById('refNotFoundModalButton')?.click();
          return;
        }

        this.apiitems[existingItemIndex] = {
          ...existingItem,
          checked: true,
          newQuantity: newQuantity,
          netAmount: (newQuantity * Number(existingItem.netPrice || existingItem.netAmount || 0)).toFixed(2),
          tax: (newQuantity * Number(existingItem.netPrice || 0) * (existingItem.taxRate || 0)).toFixed(2),
          grossAmount: (newQuantity * Number(existingItem.netPrice || 0)).toFixed(2),
        };
      } else {
        const newItem = {
          contractItemNo: contractNumber,
          checked: true,
          newQuantity: newQuantity,
          netPrice: Number(row['Net Price'] || 0),
          taxRate: Number(row['Tax Rate'] || 0),
          netAmount: (newQuantity * Number(row['Net Price'] || 0)).toFixed(2),
          tax: (newQuantity * Number(row['Net Price'] || 0) * (row['Tax Rate'] || 0)).toFixed(2),
          grossAmount: (newQuantity * Number(row['Net Price'] || 0)).toFixed(2),
          itemDescription: row['Item Description'],
        };

        this.apiitems.push(newItem);
      }
    });

    // if (this.quantityError) {
    //   return;
    // }


    this.selectedItemsArr = this.apiitems
      .filter((item: any) => item.checked)
      .map((item: any) => ({
        purchaseOrderItemNo: item.purchaseOrderItemNo,
        itemDescription: item.itemDescription,
        taxCode: item.taxCode,
        hsnCode: item.hsnCode,
        quantity: Number(item.newQuantity || item.quantity || 0),
        actualquantity: Number(item.quantity || 0),
        maxAllowQty: Number(item.maxAllowQty || 0),
        netPrice: Number(item.netPrice || 0),
        netAmount: Number(item.netAmount || (item.quantity * item.netPrice || 0)).toFixed(2),
        taxRate: Number(item.taxRate || 0),
        tax: Number(item.tax || (item.quantity * item.netPrice * item.taxRate || 0)).toFixed(2),
        grossAmount: Number(item.grossAmount || (item.quantity * item.netPrice || 0)).toFixed(2),
        materialNumber: item.materialNumber,
        plantCode: item.plantCode
      }));

    this.selectedItemsDataArr = this.selectedItemsArr;

    this.totalNetAmount = this.selectedItemsDataArr.reduce((sum: any, item: any) => sum + Number(item.netAmount), 0).toFixed(2);
    this.totalGrossAmount = this.selectedItemsDataArr.reduce((sum: any, item: any) => sum + Number(item.grossAmount), 0).toFixed(2);
    this.purchaseForm['controls']['invoice_amount_line'].setValue(this.totalGrossAmount);

    this.items = this.apiitems;
    this.filterItems = this.apiitems;
    this.updateSelectAllCheckbox(this.apiitems);
    this.updatePagination();
    this.purchaseForm['controls']['items_arr'].clearValidators();
    this.purchaseForm['controls']['items_arr'].updateValueAndValidity();
    this.compareAmount();
  }

  ngAfterViewInit() {
    const refNotFoundModal = document.getElementById('refNotFoundModal');
    if (refNotFoundModal) {
      refNotFoundModal.addEventListener('hidden.bs.modal', () => {
        this.clearErrors();
      });
    }
  }

  clearErrors() {
    this.missingContracts = [];
    this.missingPO = [];
    this.quantityErrors = [];
    this.quantityError = false;
  }

}
