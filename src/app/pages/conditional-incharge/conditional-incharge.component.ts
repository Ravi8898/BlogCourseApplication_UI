import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-conditional-incharge',
  templateUrl: './conditional-incharge.component.html',
  styleUrls: ['./conditional-incharge.component.scss']
})
export class ConditionalInchargeComponent {

  // currentDate =  new Date();
  // poNumber :any;
  // invoiceType:any;
  // totalItems: number = 0;
  companyCode: any;
  conditionalForm: any;
  dynamicFilterForm: any;
  toastMsg: any = '';
  errorToast: any = false;
  successToast: any = false;

  items: any[] = [];
  apipoGrnDetails: any = [];
  poGrnDetails: any = [];
  selectedGRN: any = [];
  filterGrnDetails: any = [];
  username: any;
  userdata: any;

  pages: number[] = [];
  totalPages: number = 0;
  currentPage: number = 1
  itemsPerPage: number = 10;
  visiblePages: number[] = [];

  poResponseJson: any = [];
  apipoResponseJson: any = [];
  selectedPOJson = [];
  childVendorCode: any;
  viewConditional = false;
  viewConditionalData: any;
  vendorArray: any = [];
  plantCodeArray: any = [];
  poArray: any = [];
  poItemArray: any = [];
  quantityArray: any = ['Challan', 'Actual', 'GRN', 'Lesser'];
  condDescArray: any = [];
  childVendorArray: any = [];
  conditionList: any;
  conditionListJson: any;
  checkExistCondition: any;
  action = 'create';

  minDate = moment(+new Date - 7776000000).format('yyyy-MM-DD');
  endMinDate = moment(+new Date - 7776000000).format('yyyy-MM-DD');
  endMaxDate = moment(new Date()).format('YYYY-MM-DD');
  maxDate = moment(new Date()).format('YYYY-MM-DD');
  totalQnty: any = { 'challan': 0, 'actual': 0, 'grn': 0, 'lesser': 0 }
  actualPOVendor: any;

  selectedAll: any;

  @ViewChild('uploadExcel') 'uploadExcel': ElementRef;

  constructor(private breadcrumbService: BreadcrumbService, private commonService: CommonService, private router: Router) {
    // this.userdata = localStorage.getItem('userdata')?JSON.parse(localStorage.getItem('userdata')) : '';
    this.username = localStorage.getItem('username');
    this.breadcrumbService.setBreadcrumbUrl();
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.action = this.commonService.action ? this.commonService.action : 'create';
    this.router.onSameUrlNavigation = 'reload';
    this.viewConditional = this.commonService.viewPurchase;
    this.conditionList = localStorage.getItem('conditionList');
    this.conditionListJson = JSON.parse(localStorage.getItem('conditionListJson') || '[]');
    if (localStorage.getItem('conditionList')) {
      try {
        if (typeof (this.conditionList) == 'string') {
          this.conditionList = JSON.parse(this.conditionList);
        }
      } catch (error) {
        this.conditionList = this.conditionList;
      }
    }
    if (localStorage.getItem('plantCode')) {
      this.plantCodeArray = localStorage.getItem?.('plantCode')?.split(',').sort();
    }
  }

  ngOnInit(): void {
    this.loadConditionalForm();
    this.loadDynamicFilterForm();
    this.getVendorsList();
    if (this.viewConditional == true) {
      this.commonService.spinner.hide();
      this.viewConditionalData = this.commonService.editPurchaseData;
      this.fillConditionalForm();
      this.formStatus();
      // this.getPOList(this.viewConditionalData['Vendor Number']);
    } else {
      this.disableField();
    }
  }

  loadDynamicFilterForm() {
    this.dynamicFilterForm = new FormGroup({
      'ref_number': new FormControl(''),
    })
  }

  loadConditionalForm() {
    this.conditionalForm = new FormGroup({
      vendor_no: new FormControl('', [Validators.required]),
      plant_code: new FormControl('', [Validators.required]),
      start_date: new FormControl('', [Validators.required]),
      end_date: new FormControl('', [Validators.required]),
      po_number: new FormControl('', [Validators.required]),
      po_item_no: new FormControl('', [Validators.required]),
      quantity_type: new FormControl('', [Validators.required]),
      child_vendor: new FormControl('', [Validators.required]),
      condition_type: new FormControl('', [Validators.required]),
    })
    this.conditionalForm.controls.start_date.disable('');
    this.conditionalForm.controls.end_date.disable('');
  }

  resetconditionalForm() {
    // console.log('resetconditionalForm');
    // this.commonService.routeToPage(['./dashboard/freight-inbound/invoice']);
    this.loadConditionalForm();
    this.selectedPOJson = [];
    this.apipoResponseJson = [];
    this.poGrnDetails = [];
    this.poArray = [];
    this.action = 'create';
    this.disableField();
    this.actualPOVendor = {};
  }

  disableField() {
    // this.conditionalForm.controls.po_number.disable();
    this.conditionalForm.controls.po_item_no.disable();
    this.conditionalForm.controls.quantity_type.disable();
    this.conditionalForm.controls.condition_type.disable();
    this.conditionalForm.controls.po_item_no.setValue('');
    this.conditionalForm.controls.quantity_type.setValue('');
    this.conditionalForm.controls.condition_type.setValue('');
    // this.poArray = []; this.poResponseJson = [];
    this.poItemArray = []; this.condDescArray = []; this.selectedPOJson = []; this.poGrnDetails = [];
    this.currentPage = 1;
  }

  getVendorsList() {
    // console.log('getVendorsList');

    this.commonService.spinner.show();
    let url = `getVendorList`;

    this.commonService.dataGet(url).subscribe((res: any) => {
      // console.log(res);
      if (this.viewConditional == false) {
        this.commonService.spinner.hide();
      }
      if (res && res['status'] == 'Success' && res['data'].length > 0) {
        /* for(var i=0; i<res['data'].length; i++){
          this.vendorArray.push(res['data'][i]['vendorNumber']+'-'+res['data'][i]['name'])
        } */
        this.vendorArray = res['data'];
      } else {
        this.vendorArray = [];
      }
    }, err => {
      // console.log(err);
    })
  }

  selectedPlantCode(event?: any) {
    console.log('selectedPlantCode');
    this.conditionalForm.controls.start_date.enable();
    this.conditionalForm.controls.start_date.setValue('');
    this.conditionalForm.controls.end_date.setValue('');
    this.conditionalForm.controls.end_date.disable();
    this.disableField()
  }

  selectedStartDate(event?: any) {
    console.log('selectStartDate');
    this.endMinDate = this.conditionalForm.value.start_date;
    this.endMaxDate = moment([new Date(this.endMinDate).getFullYear(), new Date(this.endMinDate).getMonth()]).endOf('month').format('YYYY-MM-DD');
    this.endMaxDate = this.endMaxDate > this.maxDate ? this.maxDate : this.endMaxDate
    this.conditionalForm.controls.end_date.enable();
    this.conditionalForm.controls.end_date.setValue('');
    this.disableField()
  }

  getPOList(event: any) {
    // console.log('getPOList');

    // let url = 'getCondVendorDetail';
    let url = 'getCondVendorDetailByDateRange';

    if (!this.conditionalForm.value.vendor_no) {
      this.errorToast = true;
      this.toastMsg = 'Please select Vendor Number';
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
      return;
      // }else if(!this.conditionalForm.value.plant_code){
    } else if (!this.conditionalForm.value.plant_code || !this.conditionalForm.value.start_date || !this.conditionalForm.value.end_date) {
      return;
    }

    let json = {
      "vendorCode": this.conditionalForm.value.vendor_no,
      "plantCode": this.conditionalForm.value.plant_code,
      "poNumber": '',
      "fromDate": moment(this.conditionalForm.value.start_date).format('DD-MM-yyyy'),
      "toDate": moment(this.conditionalForm.value.end_date).format('DD-MM-yyyy'),
    }

    this.commonService.spinner.show();
    this.conditionalForm.controls.po_number.setValue('');
    this.childVendorArray = [];
    this.actualPOVendor = {};
    this.apipoResponseJson = [];

    this.commonService.dataPost(url, json).subscribe((res: any) => {
      // console.log(res);
      this.conditionalForm.controls.po_number.enable();
      this.commonService.spinner.hide();
      // this.poResponseJson = res;
      res['data'].forEach((val: any) => this.apipoResponseJson.push(Object.assign({}, val)));
      this.poResponseJson = res['data'];

      if (this.viewConditional == true) {
        this.selectedPOJson = this.poResponseJson.filter((item: any) => {
          return item['poNumber'] == this.viewConditionalData['PO Number'];
        })
        this.fillConditionalForm();
        this.selectCondType(this.viewConditionalData['Condition Type']);
      } else {
        this.disableField();
        this.poArray = [];

        /* if(res.length>0){
          res.map((item:any)=>{
            if(this.poArray.indexOf(item.poNumber)==-1){
              this.poArray.push(item.poNumber)
            }
          })
        } */
        if (res['data'].length > 0) {
          res['data'].map((item: any) => {
            if (this.poArray.indexOf(item.poNumber) == -1) {
              this.poArray.push(item.poNumber)
            }
          })
        }
        setTimeout(() => {
          this.poArray = this.poArray.sort()
        }, 0);
      }
    }, err => {
      this.commonService.spinner.hide();
      this.toastMsg = 'No data found';
      this.errorToast = true;
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
      // console.log(err);
    })
  }

  getPOItemList(event: any) {
    // console.log('getPOItemList');

    this.disableField();
    this.conditionalForm.controls.po_item_no.enable();
    this.conditionalForm.controls.po_item_no.setValue('');
    this.conditionalForm.controls.child_vendor.setValue('');
    this.conditionalForm.controls.quantity_type.setValue('');
    this.poItemArray = [];
    this.condDescArray = [];
    this.childVendorArray = [];
    this.poGrnDetails = [];

    this.selectedPOJson = this.poResponseJson.filter((item: any) => {
      return item['poNumber'] == event;
    })

    if (this.selectedPOJson.length > 0) {
      /* this.companyCode = this.selectedPOJson[0]['company'];
      this.actualPOVendor = this.vendorArray.find((item:any)=>{
        return item['vendorNumber'] == this.selectedPOJson[0]['poVendor']
      }) */
      let grn: any = this.selectedPOJson.find((ele: any) => {
        if (ele.poVendor != '' && ele.poVendor != null) {
          return ele
        }
      })
      this.companyCode = grn?.company ?? ''; // handles undefined/null

      this.actualPOVendor = this.vendorArray?.find(
        (item: any) => item?.vendorNumber === grn?.poVendor
      ) || null; // if not found, fallback to null

    } else {
      this.companyCode = '';
      this.actualPOVendor = {}
    }

    // this.getPODetail();

    this.selectedPOJson.forEach((ele: any) => {
      ele['challanQty_'] = ele['challanQty']
      ele['actualQty_'] = ele['actualQty']
      ele['grnQty_'] = ele['grnQty']
    })

    this.selectedPOJson.map((item: any) => {
      if (this.poItemArray.indexOf(item.purchaseOrderItemNo) == -1 && item.poNumber == event) {
        this.poItemArray.push(item.purchaseOrderItemNo);
      }
    })
  }

  // getPODetail() {
isActualPOVendorValid(): boolean {
    if (!this.actualPOVendor) {
        return false;
    }
        if (Array.isArray(this.actualPOVendor) && this.actualPOVendor.length === 0) {
        return false;
    }

    if (typeof this.actualPOVendor === 'object' && Object.keys(this.actualPOVendor).length === 0) {
        return false;
    }

    if (!this.actualPOVendor.name || !this.actualPOVendor.city) {
        return false;
    }

    if (this.actualPOVendor.name.trim() === '' || this.actualPOVendor.city.trim() === '') {
        return false;
    }

    return true;
}

  getPODetail(){
    console.log('getPoDetail');

    this.commonService.spinner.show();
    // let url = `getPODetails?poNumber=${this.conditionalForm.value.po_number}&invoiceType=${this.invoiceType}`;
    let url = `getPODetailsForCondition?poNumber=${this.conditionalForm.value.po_number}`;
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      this.commonService.spinner.hide();
      if (res['status'] == 'Success' && res['data']) {
        this.companyCode = res['data']['companyCode'];
        this.actualPOVendor = this.vendorArray.find((item: any) => {
          return item['vendorNumber'] == res['data']['vendorCode']
          /* this.vendorArray.map((item:any)=>{
            if(item['vendorNumber'] == res['data']['vendorCode']){
              this.actualPOVendor = item['name']+', '+item['city']
            } */
        })
      }
    }, err => {
      console.log(err);
      this.commonService.spinner.hide();
    })
  }

  getConditionType(event: any) {
    // console.log('getConditionType');

    this.conditionalForm.controls.condition_type.enable();
    this.conditionalForm.controls.condition_type.setValue('');
    this.conditionalForm.controls.child_vendor.setValue('');
    this.conditionalForm.controls.quantity_type.setValue('');
    this.condDescArray = [];
    this.childVendorArray = [];
    this.poGrnDetails = [];

    this.selectedPOJson.map((ele: any) => {
      if (ele['purchaseOrderItemNo'] == event && this.condDescArray.indexOf(ele.conditionDescription) == -1) {
        this.condDescArray.push(ele.conditionDescription)
      }
    })
  }

  selectCondType(event: any) {
    // console.log('showGRNList');

    // this.conditionalForm.controls.quantity_type.setValue('');
    // this.conditionalForm.controls.quantity_type.enable();
    this.poGrnDetails = [];

    this.checkExistCondition = {};

    /* if(this.conditionList){
      this.checkExistCondition = this.conditionList.find((item:any)=>{
        return item['Vendor Number']==this.conditionalForm.value['vendor_no'] && item['PO Number']==this.conditionalForm.value['po_number'] && item['PO Item No.']==this.conditionalForm.value['po_item_no'] && item['Condition Type']==this.conditionalForm.value['condition_type']
      })
    } */

    /* if(this.conditionListJson){
      this.checkExistCondition = this.conditionListJson.find((item:any)=>{
        return item['parentVendorNo']==this.conditionalForm.value['vendor_no'] && item['poNumber']==this.conditionalForm.value['po_number'] && item['poItemNo']==this.conditionalForm.value['po_item_no'] && item['conditionType']==this.conditionalForm.value['condition_type']
      })
    }

    if(this.action=='create' && this.checkExistCondition && Object.keys(this.checkExistCondition).length>0){
      this.conditionalForm.controls.quantity_type.setValue('');
      this.conditionalForm.controls.quantity_type.disable();
      document.getElementById('refNotFoundModalButton')?.click();
      return
    } */

    this.conditionalForm.controls.quantity_type.enable();
    /* this.poGrnDetails = this.selectedPOJson.filter(item=>{
      return item['purchaseOrderItemNo']==this.conditionalForm.value.po_item_no && item['conditionDescription']==event;
    }) */

    let arr: any = [];
    this.selectedPOJson.map((item: any) => {
      if (arr.indexOf(item.childVendorCode) == -1) {
        arr.push(item.childVendorCode);
      }
    })

    this.childVendorArray = this.vendorArray.filter((item: any) => {
      return arr.includes(item['vendorNumber']);
    })

    // if (this.childVendorArray.length > 0) {
    // } else {
    //   this.selectChildVendor('')
    // };


    // this.getVendorNameFromVendorID(this.poGrnDetails[0]['childVendorCode']);

    /* this.poGrnDetails.forEach((ele:any) => {
      ele.createdBy = this.username;
      ele.createdDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      ele.updatedBy = this.username;
      ele.updatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    });

    this.apipoGrnDetails = [...this.poGrnDetails];
    this.totalPages = Math.ceil(this.poGrnDetails.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages();
    this.updatePagedData();
    this.formStatus(); */
  }

  selectChildVendor(option: any) {
    console.log('selectChildVendor', option);
    if (this.conditionListJson) {
      this.checkExistCondition = this.conditionListJson.find((item: any) => {
        return item['parentVendorNo'] == this.conditionalForm.value['vendor_no'] && item['poNumber'] == this.conditionalForm.value['po_number'] && item['poItemNo'] == this.conditionalForm.value['po_item_no'] && item['conditionType'] == this.conditionalForm.value['condition_type'] && item['vendorNumber'] == this.conditionalForm.value.child_vendor.vendorNumber && this.conditionListJson[0].fromDate == this.conditionalForm.value.start_date && this.conditionListJson[0].toDate == this.conditionalForm.value.end_date
      })
    }

    /* if(this.action=='create' && this.checkExistCondition && Object.keys(this.checkExistCondition).length>0){
      this.conditionalForm.controls.quantity_type.setValue('');
      this.conditionalForm.controls.quantity_type.disable();
      document.getElementById('refNotFoundModalButton')?.click();
      return
    } */

    this.selectedAll = false;
    this.selectedGRN = [];
    this.poGrnDetails = [];
    /* this.poGrnDetails = this.selectedPOJson.filter((item:any)=>{
      return item['purchaseOrderItemNo']==this.conditionalForm.value.po_item_no && item['conditionDescription']==this.conditionalForm.value.condition_type && item['childVendorCode']==option['vendorNumber'];
    })

    if(this.poGrnDetails.length==0){
      this.conditionalForm.controls.quantity_type.setValue('');
      this.conditionalForm.controls.quantity_type.disable();
      this.toastMsg = `GRN not available for ${option.name}`;
      this.errorToast = true;
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
      return
    }


    this.poGrnDetails.forEach((ele:any) => {
      ele.createdBy = this.username;
      ele.createdDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      ele.updatedBy = this.username;
      ele.updatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      ele.childVendorName = option['name'];
      ele['challanQty'] = ele['challanQty_']/1000
      ele['actualQty'] = ele['actualQty_']/1000
      ele['grnQty'] = ele['grnQty_']/1000
      ele['lesserQty'] = Math.min(Number(ele['challanQty']), Number(ele['actualQty']), Number(ele['grnQty']));
    }); */
    let grnToValidate: any = [];
    if (option == 'Not Applicable') {
      grnToValidate = this.selectedPOJson.filter((item: any) => {
        return item['purchaseOrderItemNo'] == (this.conditionalForm.value.po_item_no &&
          item['conditionDescription'] == this.conditionalForm.value.condition_type) && (item['childVendorCode'] == null || item['childVendorCode'] == '');
        // return item['purchaseOrderItemNo'] == this.conditionalForm.value.po_item_no && item['conditionDescription'] == this.conditionalForm.value.condition_type && item['childVendorCode'] == option['vendorNumber'];
      })
    } else {
      grnToValidate = this.selectedPOJson.filter((item: any) => {
        return item['purchaseOrderItemNo'] == this.conditionalForm.value.po_item_no && item['conditionDescription'] == this.conditionalForm.value.condition_type && item['childVendorCode'] == option['vendorNumber'];
      })
    }

// console.log('hhhh',grnToValidate);

    if (grnToValidate == 0) {
      this.conditionalForm.controls.quantity_type.setValue('');
      this.conditionalForm.controls.quantity_type.disable();
      this.toastMsg = `GRN not available for ${option.name}`;
      this.errorToast = true;
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
      return
    }

    grnToValidate.forEach((ele: any) => {
      ele.createdBy = this.username;
      ele.createdDate = moment(new Date())?.format('YYYY-MM-DD HH:mm:ss');
      ele.updatedBy = this.username;
      ele.updatedDate = moment(new Date())?.format('YYYY-MM-DD HH:mm:ss');
      ele.childVendorName = option['name'];
      ele['challanQty'] = ele['challanQty_'] / 1000
      ele['actualQty'] = ele['actualQty_'] / 1000
      ele['grnQty'] = ele['grnQty_'] / 1000
      ele['lesserQty'] = Math.min(Number(ele['challanQty']), Number(ele['actualQty']), Number(ele['grnQty']));
      ele['refrenceDoc'] = ele['refrenceDoc']?.toString();
      ele['lrNo'] = ele['lrNo']?.toString();
    });

    this.validateExistGRN(grnToValidate);

    /* this.totalQnty = {'challan':0, 'actual':0, 'grn':0, 'lesser':0}
    this.poGrnDetails.map((ele:any)=>{
      this.totalQnty['challan'] = Number(Number(this.totalQnty['challan'])+ele['challanQty']).toFixed(2)
      this.totalQnty['actual'] = Number(Number(this.totalQnty['actual'])+ele['actualQty']).toFixed(2)
      this.totalQnty['grn'] = Number(Number(this.totalQnty['grn'])+ele['grnQty']).toFixed(2)
      this.totalQnty['lesser'] = Number(Number(this.totalQnty['lesser'])+ele['lesserQty']).toFixed(2)
    })

    this.setPagination(); */
  }

  validateExistGRN(grn: any) {
    console.log('validateExistGRN');

    let url = `validateGrn`;
    this.commonService.dataPost(url, grn).subscribe((res: any) => {
      console.log(res);
      if (res.length == 0) {
        this.poGrnDetails = res;
        this.toastMsg = 'GRN already validated';
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 2000);
      } else if (res.length > 0) {
        this.poGrnDetails = res;
        this.poGrnDetails.forEach((ele: any) => {
          ele.checked = false;
        });

        this.totalQnty = { 'challan': 0, 'actual': 0, 'grn': 0, 'lesser': 0 }
        /* this.poGrnDetails.map((ele:any)=>{
          this.totalQnty['challan'] = Number(Number(this.totalQnty['challan'])+Number(ele['challanQty'])).toFixed(2)
          this.totalQnty['actual'] = Number(Number(this.totalQnty['actual'])+Number(ele['actualQty'])).toFixed(2)
          this.totalQnty['grn'] = Number(Number(this.totalQnty['grn'])+Number(ele['grnQty'])).toFixed(2)
          this.totalQnty['lesser'] = Number(Number(this.totalQnty['lesser'])+Number(ele['lesserQty'])).toFixed(2)
        }) */
        this.setPagination();
      }
    }, err => {
      console.log(err);
    })
  }

  setPagination() {
    this.apipoGrnDetails = [...this.poGrnDetails];
    this.totalPages = Math.ceil(this.poGrnDetails.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages();
    this.updatePagedData();
    this.formStatus();
  }

  getVendorNameFromVendorID(vendor_no?: any) {
    console.log('getVendorNameFromVendorID');

    let url = `getVendorDetails?vendorNo=${vendor_no}`;
    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      let name = res?.['data']?.[0]?.['name'];

      this.poGrnDetails.forEach((ele: any) => {
        ele.createdBy = this.username;
        ele.createdDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        ele.updatedBy = this.username;
        ele.updatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        ele.childVendorName = name;
      });

      this.apipoGrnDetails = [...this.poGrnDetails];
      this.totalPages = Math.ceil(this.poGrnDetails.length / this.itemsPerPage);
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      this.updateVisiblePages();
      this.updatePagedData();
      this.formStatus();
    }, err => {
      console.log(err)
    })
  }

  formStatus() {
    if (this.action == 'view') {
      this.conditionalForm.disable();
    } else if (this.action == 'edit') {
      this.conditionalForm.disable();
      this.conditionalForm.controls.quantity_type.enable();
    } else if (this.action == 'create') {
      this.conditionalForm.controls.quantity_type.enable();
      this.conditionalForm.controls.quantity_type.setValue('');
    }
  }

  submitConditionalForm(event: any) {
    // console.log('submitConditionalForm');

    let url = `postConditionRequest`;
    let json: any = {
      // vendorNumber : this.conditionalForm.controls.vendor_no.value,
      plantCode: this.conditionalForm.controls.plant_code.value,
      poNumber: this.conditionalForm.controls.po_number.value,
      poItemNo: this.conditionalForm.controls.po_item_no.value,
      conditionType: this.conditionalForm.controls.condition_type.value,
      quantityType: this.conditionalForm.controls.quantity_type.value,
      fromDate: moment(this.conditionalForm.controls.start_date.value).format('YYYY-MM-DD'),
      toDate: moment(this.conditionalForm.controls.end_date.value).format('YYYY-MM-DD'),
      actualPOVendor: JSON.stringify(this.actualPOVendor).replace(/"/g, '\\"'),
      companyCode: this.companyCode,
    }
    json.updatedBy = this.username;
    json.createdBy = this.username;
    json.updatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

    if (this.action == 'edit') {
      /* json.createdDate = moment(this.checkExistCondition['Created Date']).format('YYYY-MM-DD HH:mm:ss');
      json.conditionId = this.checkExistCondition['Condition ID']; */
      json.createdDate = moment(this.checkExistCondition['createdDate']).format('YYYY-MM-DD HH:mm:ss');
      json.conditionId = this.checkExistCondition['conditionId'];
    } else if (this.action == 'create') {
      json.createdDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    }

    /* if(this.poGrnDetails[0]['childVendorCode'] != this.poGrnDetails[0]['parentVendorCode']){
      json['vendorNumber'] = this.poGrnDetails[0]['childVendorCode'];
      json['vendorName'] = this.poGrnDetails[0]['childVendorName'];
      json['parentVendorNo'] = this.poGrnDetails[0]['parentVendorCode'];
    }else{
      json['vendorNumber'] = this.conditionalForm.controls.vendor_no.value;
      json['parentVendorNo'] = '';
    }
    json['poGrnData'] = this.apipoGrnDetails; */
    if (this.selectedGRN[0]['childVendorCode'] != this.selectedGRN[0]['parentVendorCode']) {
      let parentVendorName = this.vendorArray.find((item:any)=> item.vendorNumber ==this.selectedGRN[0]['parentVendorCode'] ) ;
      json['vendorNumber'] = this.selectedGRN[0]['childVendorCode']?  this.selectedGRN[0]['childVendorCode']:parentVendorName.vendorNumber;
      json['vendorName'] = this.selectedGRN[0]['childVendorName'] ? this.selectedGRN[0]['childVendorName'] : parentVendorName.name;
      json['parentVendorNo'] = this.selectedGRN[0]['parentVendorCode'];
    } else {
      json['vendorNumber'] = this.conditionalForm.controls.vendor_no.value;
      json['parentVendorNo'] = '';
    }
    json['poGrnData'] = this.selectedGRN;

    this.commonService.spinner.show();
    this.commonService.dataPost(url, json).subscribe((res: any) => {
      // console.log(res);
      if (res && res.status == 'Success') {
        this.toastMsg = 'Records have been inserted successfully';
        this.successToast = true;
        setTimeout(() => {
          this.commonService.spinner.hide();
          this.successToast = false;
          this.commonService.routeToPage('./dashboard');
        }, 2000);
      }
    }, err => {
      // console.log(err);
      this.commonService.spinner.hide();
    })
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

  updatePagedData(): void {
    /* if(Object.values(this.apipoGrnDetails[0])[0] != ''){

    } */
    // this.poGrnDetails = this.filterGrnDetails ? this.filterGrnDetails.slice(this.startIndex, this.endIndex) : [];
    this.poGrnDetails = this.apipoGrnDetails ? this.apipoGrnDetails.slice(this.startIndex, this.endIndex) : [];
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

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }
  get endIndex(): number {
    return this.currentPage * this.itemsPerPage;
  }
  /* Pagination End*/


  fillConditionalForm() {
    // console.log('fillConditionalForm');

    this.conditionalForm.controls.vendor_no.setValue(this.viewConditionalData['Vendor Number']);
    this.conditionalForm.controls.po_number.setValue(this.viewConditionalData['PO Number']);
    this.conditionalForm.controls.po_item_no.setValue(this.viewConditionalData['PO Item No.']);
    this.conditionalForm.controls.condition_type.setValue(this.viewConditionalData['Condition Type']);
    this.conditionalForm.controls.quantity_type.setValue(this.viewConditionalData['Quantity Type']);
    this.conditionalForm.controls.plant_code.setValue(this.viewConditionalData['Plant Code']);
    this.conditionalForm.controls.child_vendor.setValue(this.viewConditionalData['Child Vendor Number']);

    // this = JSON.parse(localStorage.getItem('conditionJson') || '');
    this.checkExistCondition = this.conditionListJson.find((item: any) => {
      return item['conditionId'] == this.viewConditionalData['Condition ID']
    })
    this.poGrnDetails = this.checkExistCondition['poGrnData'];
    this.selectedGRN = this.checkExistCondition['poGrnData'];
    this.actualPOVendor = JSON.parse(this.checkExistCondition.actualPOVendor.replace(/\\/g, ''));
    this.totalQnty = { 'challan': 0, 'actual': 0, 'grn': 0, 'lesser': 0 }
    this.poGrnDetails.map((ele: any) => {
      this.totalQnty['challan'] = Number(Number(this.totalQnty['challan']) + Number(ele['challanQty'])).toFixed(2)
      this.totalQnty['actual'] = Number(Number(this.totalQnty['actual']) + Number(ele['actualQty'])).toFixed(2)
      this.totalQnty['grn'] = Number(Number(this.totalQnty['grn']) + Number(ele['grnQty'])).toFixed(2)
      this.totalQnty['lesser'] = Number(Number(this.totalQnty['lesser']) + Number(ele['lesserQty'])).toFixed(2)
    })

    this.conditionalForm.controls['start_date'].setValue(moment(this.checkExistCondition['fromDate']).format('YYYY-MM-DD'));
    this.conditionalForm.controls['end_date'].setValue(moment(this.checkExistCondition['toDate']).format('YYYY-MM-DD'));
    this.setPagination();
  }

  downloadGRNExcelFile() {
    console.log('downloadGRNExcelFile');

    let data: any = [];
    // this.apipoGrnDetails.map((item:any)=>{
    this.apipoResponseJson.map((item: any) => {
      data.push({
        'GRN Posting Date': item.date,
        'Material Desc': item.materialDes,
        'Plant': this.conditionalForm.value.plant_code,
        'IGP No': item.igpNo,
        'Material Doc': item.materialDocumentNumber,
        'Gate Out Date': item.gateOutDate,
        'Po Number': item.poNumber,
        'PO Item Number': item.purchaseOrderItemNo,
        // 'Supplier Name': this.actualPOVendor.name,
        // 'Child Transporter Name': this.conditionalForm.value.child_vendor.name,
        'Child Vendor': item.childVendorCode,
        'Vehicle Number': item.truckId,
        'Challan No': item.challanNo,
        'Challan Date': item.challanDate,
        'LR No': item.lrNo,
        'LR Date': item.lrDate,
        'Rate': item.rate,
        'Challan Qnty': item.challanQty / 1000,
        'Actual Qnty': item.actualQty / 1000,
        'GRN Qnty': item.grnQty / 1000,
        'Lesser Qnty': (Math.min(Number(item['challanQty']), Number(item['actualQty']), Number(item['grnQty']))) / 1000,
      })
    })

    let filename = "grn_data.xlsx";
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const allDataWs: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, allDataWs, 'Sheet1');
    XLSX.writeFile(wb, filename);
  }

  checkAll(event?: any) {
    console.log('checkAll');
    if (event.target.checked) {
      this.apipoGrnDetails.forEach((item: any) => {
        if (item['checked'] == false) {
          item['checked'] = true;
        }
      })
      this.selectedAll = true;
      this.selectedGRN = [...this.apipoGrnDetails];

      this.totalQnty = { 'challan': 0, 'actual': 0, 'grn': 0, 'lesser': 0 }
      this.apipoGrnDetails.map((ele: any) => {
        this.totalQnty['challan'] = Number(Number(this.totalQnty['challan']) + Number(ele['challanQty'])).toFixed(2)
        this.totalQnty['actual'] = Number(Number(this.totalQnty['actual']) + Number(ele['actualQty'])).toFixed(2)
        this.totalQnty['grn'] = Number(Number(this.totalQnty['grn']) + Number(ele['grnQty'])).toFixed(2)
        this.totalQnty['lesser'] = Number(Number(this.totalQnty['lesser']) + Number(ele['lesserQty'])).toFixed(2)
      })
    } else {
      this.selectedAll = false;
      this.apipoGrnDetails.forEach((item: any) => {
        item['checked'] = false;
      })
      this.selectedGRN = [];
      this.totalQnty = { 'challan': 0, 'actual': 0, 'grn': 0, 'lesser': 0 }
    }
  }

  grnSelect(event?: any, row?: any) {
    let checked = event.target.checked;
    if (checked) {
      this.poGrnDetails.map((item: any) => {
        if (item['materialDocumentNumber'] == row['materialDocumentNumber']) {
          item['checked'] = true;
          this.selectedGRN.push(item);
        }
      })

      this.selectedAll = this.poGrnDetails.every((item: any) => {
        return item.checked == true
      })

      this.totalQnty['challan'] = Number(Number(this.totalQnty['challan']) + Number(row['challanQty'])).toFixed(2);
      this.totalQnty['actual'] = Number(Number(this.totalQnty['actual']) + Number(row['actualQty'])).toFixed(2);
      this.totalQnty['grn'] = Number(Number(this.totalQnty['grn']) + Number(row['grnQty'])).toFixed(2);
      this.totalQnty['lesser'] = Number(Number(this.totalQnty['lesser']) + Number(row['lesserQty'])).toFixed(2);
    } else {
      this.selectedAll = false;
      this.poGrnDetails.map((item: any, i: any) => {
        if (item['materialDocumentNumber'] == row['materialDocumentNumber']) {
          item['checked'] = false;
        }
      })
      this.selectedGRN.map((item: any, i: any) => {
        if (item['materialDocumentNumber'] == row['materialDocumentNumber']) {
          this.selectedGRN.splice(i, 1);
        }
      })
      this.totalQnty['challan'] = Number(Number(this.totalQnty['challan']) - Number(row['challanQty'])).toFixed(2);
      this.totalQnty['actual'] = Number(Number(this.totalQnty['actual']) - Number(row['actualQty'])).toFixed(2);
      this.totalQnty['grn'] = Number(Number(this.totalQnty['grn']) - Number(row['grnQty'])).toFixed(2);
      this.totalQnty['lesser'] = Number(Number(this.totalQnty['lesser']) - Number(row['lesserQty'])).toFixed(2);
    }
  }

  ngOnDestroy(): void {
    this.commonService.viewPurchase = false;
    this.commonService.action = '';
  }
}
