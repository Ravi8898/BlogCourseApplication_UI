import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sla-invoice',
  templateUrl: './sla-invoice.component.html',
  styleUrls: ['./sla-invoice.component.scss']
})

export class SlaInvoiceComponent {

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
  // poSesDetails :any[] = [];
  poGrnItems: any[] = [];
  // poSesItems :any[] = [];
  // poSesSubItems :any[] = [];
  // sesSubList :any = [];
  // apisesSubList :any = [];
  // selectedSesSubItems :any = [];
  // selectedChips :any[] = [];
  logintype: any;
  username: any;
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
  // pagesSes: number[] = [];
  totalPages: number = 0;
  // totalPagesSes: number = 0;
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
  poNumberArray: any = [];
  roleName:string|null
  @ViewChild('invoice') 'invoice': ElementRef;
  @ViewChild('suppportinvoice') 'suppportinvoice': ElementRef;
  @ViewChild('signedAttach') 'signedAttach': ElementRef;

  constructor(public commonService: CommonService, private brearcumbService: BreadcrumbService, private router: Router) {
    this.logintype = localStorage.getItem('logintype');
    this.username = localStorage.getItem('username');
    this.roleName = localStorage.getItem('roleName')
    this.userdata = JSON.parse(localStorage.getItem('userdata') || '');
    this.brearcumbService.setBreadcrumbUrl();
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.loadPurchaseForm();
    this.loadDynamicFilterForm();
    this.purchaseForm.reset();
    if (this.commonService.updatePurchase == true || this.commonService.viewPurchase == true) {
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
      this.purchaseForm['controls']['invoice_type'].setValue('SLA');
    }, 0);
  }

  loadDynamicFilterForm() {
    this.dynamicFilterForm = new FormGroup({
      'item_number': new FormControl(''),
    })
  }

  resetPurchaseForm() {
    console.log('resetPurchaseForm');
    // this.commonService.routeToPurchaseOrder();
    this.commonService.routeToPage('./dashboard/sla-invoice');
    return;
  }

  updateInvoice() {
    console.log('updateInvoice');
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

  allowInvoiceChars(event: KeyboardEvent): boolean {
    const allowedChars = /^[a-zA-Z0-9\-\/]$/;
    const key = event.key;
    return allowedChars.test(key);
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
      // this.commonService.validateInvoiceNumber(json).subscribe((res:any)=>{
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
    console.log('getPODetail');

    this.errorToast = false;
    this.selectedItemsArr = [];
    this.selectedItemsDataArr = [];
    this.submissionArr = [];
    this.poNumber = po_number;
    this.commonService.spinner.show();

    let url = `getSLADetails?slaNumber=${po_number}&invoiceType=SLA&invoiceDate=${this.purchaseForm.value.invoice_date}`;

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

      if (res?.status == 'Success') {
        this.purchaseForm['controls']['company'].setValue(res['data']['companyCode']);
        if (res['data'] && res['data']['slaItems'].length > 0) {
          this.apiitems = this.structureItems(res['data']['slaItems']);
          this.filterItems = [...this.apiitems];
          this.items = [...this.apiitems];
          this.purchaseForm['controls']['material_group'].setValue(res['data']['materialGroup'] ? res['data']['materialGroup'] : '');
          this.purchaseForm['controls']['payment_term'].setValue(res['data']['paymentTerm'] ? res['data']['paymentTerm'] : '');
          this.purchaseForm['controls']['supp_gst_no'].setValue(this.userdata.GST);
          this.purchaseForm['controls']['currency'].setValue('INR');
          this.purchaseForm['controls']['payment_mode'].setValue('rtgs');
          // this.getSubmissionTo(res['data']['slaItems'][0]['plantCode'], invoice_type, res['data']['slaItems'][0]['preqNo']);
          this.getSubmissionTo(res['data']['slaItems'][0]['plantCode'], invoice_type, '');
          this.getChildGST()
          this.globalHsnCode = res['data']['slaItems'][0]['hsnCode'] ? res['data']['slaItems'][0]['hsnCode'] : 995461;
        }

        this.purchaseForm['controls']['items_arr'].enable();
        this.updateItems();

        this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.updateVisiblePages();
        this.updatePagedData();
      } else {
        this.toastMsg = 'Something went wrong';
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 2000);
      }
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

    let url = `plantDetails?plantCode=${plant_code}&invoiceType=${invoice_type}&preqNo=''`;
    // this.commonService.getSubmissionTo(plant_code, invoice_type, preqNo).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      if (res && res['status'] == 'Success' && res['data']) {
        this.purchaseForm['controls']['plant_code'].setValue(res['data']['plantCode'] + '-' + res['data']['plantName']);
        this.purchaseForm['controls']['rece_gst_no'].setValue(res['data']['gstNumber'] ? res['data']['gstNumber'] : '');
        if (res['data']['employeeData']) {
          this.submissionArr = res['data']['employeeData'].filter((item: any) => {
            return (item['adminAccess'] == false && item.roleName == 'SiteController')
          });
          if (this.submissionArr.length == 1) {
            this.purchaseForm.controls.submission_to.setValue(this.submissionArr[0]['loginId']);
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
      // alert(`🚫 vSPEED Functionality Disabled
      // Due to updates introduced with GST 2.0, the vSPEED feature has been temporarily disabled.
      // We’re working to align with the new compliance standards and will notify you once functionality is restored.
      // Thank you for your understanding.`);
      this.commonService.routeToPage('./dashboard/freight-inbound-invoice');
       } else if (invoice_type == 'Contracts') {
      this.commonService.routeToPage('./CAD/vendor/home/invoice');
    } else if (invoice_type == 'Reward') {
      this.commonService.routeToPage('./dashboard/reward-invoice');
    }
  }

  selectChileVendorCode(item: any) {
    console.log(item);

    let select = this.childGSTArr.find((ele: any) => {
      return ele.gstNumber == item.target.value
    })
    this.childVendorCode = select.vendorCode;
  }

  /* Attachment  Start */
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
  }

  onImageCaptureSupport(evt: any) {
    this.selectedAllAttachmentSupport = [];
    var files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
      console.log(files[i]);

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
    this.selectedAllAttachmentSupport.push(attach_json);
    this.purchaseForm['controls']['attach_data_supp'].setValue(this.selectedAllAttachmentSupport);
    console.log(btoa(binaryString));
  }

  downloadMergedAttachment() {
    console.log('downloadMergedAttachment');
    this.commonService.spinner.show();
    let json = [...this.selectedAllAttachment, ...this.selectedAllAttachmentSupport]
    let url = `mergePDF`;
    // this.commonService.getMergedAttachment(json).subscribe((res:any)=>{
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res['status'] == 'Success' && res['data'] != '') {
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
  /* Attachment End */

  /* Invoice Submit */
  submitPurchaseForm(supp_attach?: any) {
    console.log('submitPurchaseForm');

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
      submissionTo: this.purchaseForm['controls']['submission_to'].value,

      materialGroup: this.purchaseForm['controls']['material_group'].value,
      paymentTerm: this.purchaseForm['controls']['payment_term'].value,
      uploadedByBusinessUser :this.roleName == 'BusinessUser' ? 1:0,
      attach: this.uploadedDigitalSigned,
      remarks: this.purchaseForm['controls']['remarks'].value ? this.purchaseForm['controls']['remarks'].value : null,
      poInvoiceItems: this.selectedItemsArr,
      poCalculateItem: this.selectedItemsDataArr,
      // poSubSesDetails: this.purchaseForm.value.invoice_type=='Service'?this.selectedSesSubItems:[]
    }

    if (this.commonService.updatePurchase == true) {
      if (this.purchaseForm.controls['attach_data'].value) {
        json.attach = this.purchaseForm['controls']['attach_data'].value;
        json.supportAttach = [];
      } else {
        json.attach = [];
        json.supportAttach = [];
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
        json.supportAttach = [],
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

    // this.commonService.purchaseOrder(json).subscribe((res:any)=>{
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
            this.addRemoveItemsDataArr(event, item);
            this.selectedItemsArr.push(item);
          }
          this.purchaseForm['controls']['items_arr'].clearValidators();
          this.purchaseForm['controls']['items_arr'].updateValueAndValidity();
        }
      })
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
      this.purchaseForm['controls']['items_arr'].setValidators([Validators.required]);
      this.purchaseForm['controls']['items_arr'].updateValueAndValidity();
      // this.apisesSubList = [];
      // this.sesSubList = [];
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
    this.addRemoveItemsDataArr(event, row);

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
      if ((row['hsnCode'] == '' || row['hsnCode'] == null) && (row['taxRate'] == '' || row['taxRate'] == null)) {
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
        hsnCode: row['hsnCode'] ? row['hsnCode'] : '',
        // quantity: Number(row['quantity']),
        quantity: Number(row['remainingQuantity']),
        actualquantity: Number(row['remainingQuantity']),
        maxAllowQty: Number(row['maxAllowQty']),
        netPrice: Number(row['rate']),
        netAmount: Number(Number(row['remainingQuantity']) * Number(row['rate'])).toFixed(2),
        taxRate: Number(row['taxRate']),
        tax: Number(Number(row['remainingQuantity']) * Number(row['rate']) * Number(row['taxRate'])).toFixed(2),
        // grossAmount: Number(Number(row['remainingQuantity'])*Number(row['rate'])+Number(row['remainingQuantity'])*Number(row['rate'])*Number(row['taxRate'])).toFixed(2),
        grossAmount: Number(Number(row['remainingQuantity']) * Number(row['rate'])).toFixed(2),
        materialNumber: row['materialNumber'],
        plantCode: row['plantCode']
      })

      /* if(!row['hsnCode'] || !row['taxRate'] && this.blankHsnCodeArray.indexOf(row['purchaseOrderItemNo']) == -1){
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

  /* Pagination Start */
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

  onPageChange(event: any): void {
    const selectedPage = event.target.value;
    this.currentPage = selectedPage;
    this.updatePagedData();
  }
  /* Pagination End */

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

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return this.currentPage * this.itemsPerPage;
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
          // if(element == item['purchaseOrderItemNo']){
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
}
