import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';

@Component({
  selector: 'app-sla-incharge',
  templateUrl: './sla-incharge.component.html',
  styleUrls: ['./sla-incharge.component.scss']
})

export class SlaInchargeComponent {

  barcodeValue = '';
  editPurchaseData: any = {};
  purchaseForm: any;
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

  constructor(private commonService: CommonService, private brearcumbService: BreadcrumbService) {

    this.logintype = localStorage.getItem('logintype');
    this.username = localStorage.getItem('username');
    this.userdata = JSON.parse(localStorage.getItem('userdata') || '{}');
    this.brearcumbService.setBreadcrumbUrl();
  }

  ngOnInit(): void {
    this.loadPurchaseForm();
    this.loadDynamicFilterForm();
    this.purchaseForm.reset();
    if (this.commonService.updatePurchase == true) {
      this.updateInvoice();
    }
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
      rece_gst_no: new FormControl(''),
      currency: new FormControl(''),

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
      // ses_arr: new FormControl('', [Validators.required]),
    })
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
    this.selectedItemsDataArr = this.editPurchaseData['poCalculateItem'];

    if (this.editPurchaseData['status'] == 'accept' && this['editPurchaseData']['seriesType']) {
      this.purchaseForm['controls']['series_type'].setValue(this['editPurchaseData']['seriesType']);
      this.purchaseForm['controls']['series_type'].disable();
      this.purchaseForm['controls']['reviewer_remarks'].disable();
    }
    this.updateVisiblePages();
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

  getPODetail(po_number?: any) {
    console.log('getPODetail');

    let url = `getSLADetails?slaNumber=${po_number}&invoiceType=SLA&invoiceDate=${this.editPurchaseData.invoiceDate.split(' ')[0]}`;

    this.commonService.spinner.show();
    // this.commonService.getPODetail(po_number).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res['data'] && res['data']['slaItems'].length > 0) {
        this.items = res['data']['slaItems'];
        this.items = this.structureItems(res['data']['slaItems']);
        this.purchaseForm['controls']['plant_code'].setValue(res['data']['slaItems'][0]['plantCode']);
        this.getSubmissionTo(res['data']['slaItems'][0]['plantCode'], this.editPurchaseData['invoiceType']);
      }
      if (res['data'] && res['data']['slaGrnItems'].length > 0) {
        this.apipoGrnDetails = res['data']['slaGrnItems'];
        this.apipoGrnDetails.forEach((item: any) => {
          item.checked = false;
        });
        this.poGrnDetails = [...this.apipoGrnDetails];
        this.filterGrnDetails = [...this.apipoGrnDetails];
      }
      /* if(res['data'] && res['data']['poSesItems'].length>0){
        this.poSesDetails = res['data']['poSesItems'];
      } */
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

  refresItemsList() {
    this.items = this.items.map(element => {
      return element;
    })
    let pop = this.items.pop();
    setTimeout(() => {
      if(pop)
      this.items.push(pop);
    }, 0)
  }

  siteOrderAction(action: any) {
    console.log('siteAction');
    this.errorToast = false;
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

      paymentMode: this.purchaseForm['controls']['payment_mode'].value ? this.purchaseForm['controls']['payment_mode'].value : null,
      adaniContactNo: this.purchaseForm['controls']['adani_contact'].value ? this.purchaseForm['controls']['adani_contact'].value : null,
      submissionTo: this.purchaseForm['controls']['submission_to'].value,

      materialGroup: this.purchaseForm['controls']['material_group'].value,
      paymentTerm: this.purchaseForm['controls']['payment_term'].value,

      seriesType: this.purchaseForm['controls']['series_type'].value,
      remarks: this.purchaseForm['controls']['remarks'].value ? this.purchaseForm['controls']['remarks'].value : null,
      reviewerRemarks: this.purchaseForm['controls']['reviewer_remarks'].value ? this.purchaseForm['controls']['reviewer_remarks'].value : null,

      poGrnDetails: this.selectedGRNArr,
      poSesDetails: this.selectedSESArr,
      status: this.siteControllerAction,
      sapStatus: this.editPurchaseData.sapStatus,
      createdBy: this.editPurchaseData.createdBy,
      childVendorCode: this.editPurchaseData.childVendorCode,
      createdDate: moment(this.editPurchaseData.createdDate).format('YYYY-MM-DD HH:mm:ss'),
      updatedBy: this.username,
      updatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      poInvoiceID: this.editPurchaseData.poInvoiceID,
      attachmentFilePath: this.editPurchaseData.invoiceAttachment[0].attachmentFilePath,
      attach : [],
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
        // return Number(item['purchaseOrderItemNo']) == Number(element['purchaseOrderItemNo'])
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
      // this.poGrnDetails = acceptedGrn;
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
          // if(item['purchaseOrderItemNo'] == row['purchaseOrderItemNo']){
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

  compareGRNSES() {
    console.log('compareGRNSES');
    if (this.selectedSESArr.length > 0 || this.selectedGRNArr.length > 0) {
      this.purchaseForm['controls']['grn_arr'].clearValidators();
      this.purchaseForm['controls']['grn_arr'].updateValueAndValidity();
      // this.purchaseForm['controls']['ses_arr'].clearValidators();
      // this.purchaseForm['controls']['ses_arr'].updateValueAndValidity();
    } else {
      this.purchaseForm['controls']['grn_arr'].setValidators([Validators.required]);
      this.purchaseForm['controls']['grn_arr'].updateValueAndValidity();
      // this.purchaseForm['controls']['ses_arr'].setValidators([Validators.required]);
      // this.purchaseForm['controls']['ses_arr'].updateValueAndValidity();
    }
  }

  siteselect(event: any, row: any) {
    console.log('');
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

  deleteAttachment(event: any) {
    console.log('deleteAttachment');
    delete (this.editPurchaseData['invoiceAttachment']);
    this.purchaseForm['controls']['attach'].enable();
    this.purchaseForm['controls']['attach_data'].enable();
  }

  structureItems(items: any) {
    console.log('structureItems');

    items.forEach((item: any) => {
      item['netPrice'] = Number(item['rate']).toFixed(2);
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
          // if(element == item['purchaseOrderItemNo']){
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
    if (Object.values(this.apipoGrnDetails[0])[0] != '') {
      // this.apiPagedData = this.data ? this.data.slice(this.startIndex, this.endIndex) : [];
      // this.pagedData = this.data ? this.data.slice(this.startIndex, this.endIndex) : [];
    }
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

  ngOnDestroy() {
    this.commonService.updatePurchase = false;
    this.purchaseForm.reset();
  }
}
