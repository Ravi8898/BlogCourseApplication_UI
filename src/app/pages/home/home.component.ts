import { Component, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { CommonService } from 'src/app/services/common.service';
import * as XLSX from 'xlsx';

function readBase64(file: any): Promise<any> {
  var reader = new FileReader();
  var future = new Promise((resolve, reject) => {
    reader.addEventListener("load", function () {
      resolve(reader.result);
    }, false);

    reader.addEventListener("error", function (event) {
      reject(event);
    }, false);

    reader.readAsDataURL(file);
  });
  return future;
}

const URL = '/api/';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  activeTab: any = 'SiteIncharge';
  showHistory = true;
  purchaseSearchObject: any[] = [];

  currentDate: any;

  url: string = '';
  data: any[] = [];

  successToast: boolean = false;
  errorToast: boolean = false;
  toastMsg: string = '';

  modalName: string = '';

  errorMsg: string = '';
  isLoader: boolean = false;

  roleNameArray :any = [];
  roleName: any = ''
  username: string | null = ''
  searchModal: string = ''
  loginType:any = '';
  purchaseListAPI:any = [];
  purchaseList:any = [];
  userdata:any = {};

  constructor(
    private breadcrumbService: BreadcrumbService, private fb: FormBuilder, private commonService: CommonService) {
    this.userdata = JSON.parse(localStorage.getItem('userdata') || '{}');
    this.breadcrumbService.setBreadcrumbUrl();

    this.roleNameArray = localStorage.getItem('roleNameArray');
    // this.roleName = localStorage.getItem('roleName');
    this.username = localStorage.getItem('username');
    this.loginType = localStorage.getItem('logintype');
    this.roleName = localStorage.getItem('roleName');
    this.searchModal = this.loginType;
  }


  ngOnInit() {
    if(this.loginType == 'vendor'){
      if(this.userdata.ROLE=='PRIMARY'){
        this.commonService.routeToPage('./dashboard/all');
      }else{
        this.getPurchaseOrderList();
        this.roleName = 'vendor';
      }
    }else{
      this.roleNameArray = this.roleNameArray && this.roleNameArray.split(',');
      if(localStorage.getItem('roleName')){
        this.roleName = localStorage.getItem('roleName');
        // this.activeTab = localStorage.getItem('roleName');
        if (this.roleName.includes('SiteController')) {
          this.activeTab = 'SiteController'
        } else {
          this.activeTab = localStorage.getItem('roleName')
        }
      } else {
      // if(!(localStorage.getItem('roleName'))){
        // this.roleNameArray = this.roleNameArray.split(',');
        this.roleName = this.roleNameArray?.[0];
        this.activeTab = this.roleNameArray?.[0];
        localStorage.setItem('roleName', this.roleName);
      }
      /* this.roleNameArray = this.roleNameArray.split(',');
      this.roleName = this.roleNameArray[0];
      this.activeTab = this.roleNameArray[0]; */

      if(this.roleName.includes('RawMaterialIncharge')){
        this.showHistory = false;
        this.activeTab = 'RawMaterialIncharge';
        this.getCreatedCondition();
      }
      else if(this.roleName == 'BusinessUser'){
      this.getPurchaseOrderListByEmployee()
      }else{
        this.getSiteControllerOrderList();
      }
    }

    // this.setModalToAdTable();

    this.successToast = false;
    this.errorToast = false;
    this.toastMsg = '';
  }

  setVendorFilterField(){
    this.purchaseSearchObject = [
      {
        forLabel: "Reference ID",
        forContrl: "referenceId",
        forPlace: "Enter Reference ID"
      },
      {
        forLabel: "Invoice Number",
        forContrl: "invoiceNumber",
        forPlace: "Enter Invoice Number"
      },
      {
        forLabel: "Invoice Date",
        forContrl: "invoiceDate",
        forPlace: "Enter PO Number"
      },
      {
        forLabel: "Invoice Amount",
        forContrl: "invoiceAmount",
        forPlace: "Enter Invoice Amount"
      },
      {
        forLabel: "PO Number",
        forContrl: "poNumber",
        forPlace: "Enter PO Number"
      },
      {
        forLabel: "Status",
        forContrl: "status",
        forPlace: "Choose"
      },
    ]
  }

  getPurchaseOrderList(){
    console.log('getPurchaseOrderList');

    let user;
    if(this.loginType == 'vendor'){
      user = this.userdata['ACCOUNTNUMBER'];
    }
    let url = `POInvoiceDetails?createdBy=${user}`;
    // this.commonService.getPurchaseOrderList(user).subscribe((res:any)=>{

    this.commonService.spinner.show();
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      // res['data'][0].status = 'error';
      this.commonService.spinner.hide();
      if(res && res['status']=='Success' && res['data'].length>0){
        this.purchaseListAPI = [];
        this.purchaseListAPI = res['data'];
        this.purchaseList = [];
        res['data'].map((item:any)=>{
          this.purchaseList.push(
            {
              "Reference ID": item['referenceId'],
              "Entry Date": item['createdDate'],
              "Invoice Type": item['invoiceType'],
              "Invoice Number": item['invoiceNumber'],
              "Invoice Date": item['invoiceDate'],
              // "Invoice Amount (Rs)": item['invoiceAmount'],
              "Invoice Amount (Rs)": item['invoiceType']=='Freight-Inbound'?item['totalAmount']:item['invoiceAmount'],
              "PO Number": item['poNumber'],
              "Submission To": item['submissionTo'],
              // "Remark": item['remarks'],
              "Attachment":item['invoiceAttachment'],
              "Status": item['status'].toLowerCase(),
              // "Checklist":item['barCode']?item['barCode']:'',
              "History": item
            }
          )
        })
        this.setVendorFilterField();
      }else{
        this.purchaseList = [
          {
            "Reference ID":"",
            "Entry Date": "",
            "Invoice Number": "",
            "Invoice Date": "",
            "Invoice Amount (Rs)": "",
            "PO Number": "",
            "Submission To": "",
            // "Remark": "",
            "Attachment": "",
            "Status": "",
            "Checklist": "",
            "History": ""
          }
        ];
      }
    },err=>{
      this.commonService.spinner.hide();
      console.log(err)
    })
  }

   getPurchaseOrderListByEmployee(){
    let url = `getPOInvoiceByEmployee?employeeID=${this.username}`;
    this.commonService.spinner.show();
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success' && res['data'].length>0){
        this.purchaseListAPI = [];
        this.purchaseListAPI = res['data'];
        this.purchaseList = [];
        res['data'].map((item:any)=>{
          this.purchaseList.push(
            {
              "Reference ID": item['referenceId'],
              "Entry Date": item['createdDate'],
              "Invoice Type": item['invoiceType'],
              "Invoice Number": item['invoiceNumber'],
              "Invoice Date": item['invoiceDate'],
              // "Invoice Amount (Rs)": item['invoiceAmount'],
              "Invoice Amount (Rs)": item['invoiceType']=='Freight-Inbound'?item['totalAmount']:item['invoiceAmount'],
              "PO Number": item['poNumber'],
              "Submission To": item['submissionTo'],
              "createdBy":item['createdBy'],
              "bankAccount":item['bankAccount'],
              // "Remark": item['remarks'],
              "Attachment":item['invoiceAttachment'],
              "Status": item['status'].toLowerCase(),
              // "Checklist":item['barCode']?item['barCode']:'',
              "History": item
            }
          )
        })
        this.setVendorFilterField();
      }else{
        this.purchaseList = [
          {
            "Reference ID":"",
            "Entry Date": "",
            "Invoice Number": "",
            "Invoice Date": "",
            "Invoice Amount (Rs)": "",
            "PO Number": "",
            "Submission To": "",
            // "Remark": "",
            "Attachment": "",
            "Status": "",
            "Checklist": "",
            "History": ""
          }
        ];
      }
    },err=>{
      this.commonService.spinner.hide();
      console.log(err)
    })
  }
  navigateToPurchase(){
    this.commonService.updatePurchase = false;
    this.commonService.viewPurchase = false;
    // this.commonService.routeToPurchaseOrder();
    this.commonService.routeToPage('./dashboard/material-invoice');
  }

  activateTab(tab: string): void {
    this.activeTab = tab;
    this.roleName = tab;
    localStorage.setItem('roleName', this.roleName);
    if(tab=='RawMaterialIncharge'){
      this.getCreatedCondition();
    }else{
      this.getSiteControllerOrderList();
    }
  }

  applyPurchaseSearch(data: any) {
    console.log("applyPurchaseSearch", data);

    if(data['pi_filterjson']['companyCode']){
      data['pi_filterjson']['companyCode'] = data['pi_filterjson']['companyCode'] == 'Ambuja'?'IN20':'IN10';
    }

    if(this.loginType == 'sitecontroller' && this.roleName =='RawMaterialIncharge'){
      this.applyCreateConditionSearch(data);
    }else if(this.loginType == 'sitecontroller'){
      this.applyPurchaseSearchSiteController(data);;
      return;
    }

    let filter_data = data['pi_filterjson'];
    let keys = Object.keys(filter_data);
    let values = Object.values(filter_data);
    let indexOfFilter:any = []
    values.map((item, i)=>{
      if(item != ''){
          indexOfFilter.push(i);
      }
    })
    this.isLoader = true;
    this.commonService.spinner.show();

    let url = `POInvoiceDetails?createdBy=${this.userdata['ACCOUNTNUMBER']}`;
    // this.commonService.getPurchaseOrderList(this.userdata['ACCOUNTNUMBER']).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res['status']=='Success' && res['data'].length>0){
        /* this.purchaseList = res['data'].filter((item:any)=>{
          return item
        }) */
        indexOfFilter.map((item:any)=>{
          res['data'] = res['data'].filter((ele:any)=>{
            if(ele[keys[item]].includes(values[item])){
              return ele;
            }
          })
        })

        this.purchaseList = [];
        res['data'].map((item:any)=>{
          this.purchaseList.push(
            {
              "Reference ID": item['referenceId'],
              "Entry Date": item['createdDate'],
              "Invoice Type": item['invoiceType'],
              "Invoice Number": item['invoiceNumber'],
              "Invoice Date": item['invoiceDate'],
              "Invoice Amount (Rs)": item['invoiceAmount'],
              "PO Number": item['poNumber'],
              "Submission To": item['submissionTo'],
              "Attachment":item['invoiceAttachment'],
              "Status": item['status'].toLowerCase(),
              "Checklist":item['barCode']?item['barCode']:'',
              "History": item
            }
          )
        })
        this.setVendorFilterField();
      }
        this.isLoader = false
      },err => {
        this.isLoader = false
        this.commonService.spinner.hide();
        console.log('Error fetching:', err);
      }
    );
  }


  onDeleteConfirmedPurchase(invoice_no: any) {
    console.log('onDeleteConfirmedPurchase');

    let delete_invoice = this.purchaseListAPI.find((item:any)=>{
      return item['invoiceNumber'] == invoice_no;
    })
    delete_invoice['attach'] = [];
    delete_invoice['status'] = 'Deleted';

    let url = `PostPOInvoice`;
    this.commonService.spinner.show();

    // this.commonService.purchaseOrder(json).subscribe((res:any)=>{
    this.commonService.dataPost(url, delete_invoice).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success'){
        this.successToast = true;
        this.toastMsg = res['message'];
        setTimeout(() => {
          this.successToast = false;
        },1000);
        this.getPurchaseOrderList();
      }else{
        this.errorToast = true;
        this.toastMsg = res['message'];
        setTimeout(() => {
          this.errorToast = false;
        },1000);
      }
    },err=>{
      console.log(err);
      this.commonService.spinner.hide();
      this.errorToast = true;
      this.toastMsg = err['error']['message'];
      setTimeout(() => {
        this.errorToast = false;
      }, 1000);
    })
  }

  closeModal(modalName: string) {
    const modal = document.getElementById(modalName);
    if (modal) {
      modal.style.display = 'none';
      modal?.classList.remove('show');
      modal?.setAttribute('aria-hidden', 'true');
      modal?.removeAttribute('aria-modal');
      modal?.removeAttribute('role');
    }

    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.parentNode?.removeChild(backdrop);
    }

    const backdrop0 = document.querySelector('.modal-backdrop');
    if (backdrop0) {
      backdrop0.parentNode?.removeChild(backdrop0);
    }

    document.body.className = '';
    document.body.removeAttribute('style');
    document.body.removeAttribute('data-bs-overflow');
    document.body.removeAttribute('data-bs-padding-right');

    setTimeout(() => {
      this.successToast = false;
    }, 2000)
  }


  /* Site Controller */
  getSiteControllerOrderList(){
    console.log('getSiteControllerOrderList');

    let user = this.username;
    let url = `POInvoiceDetailsSubmitTo?submissionTo=${this.username}`
    // this.commonService.getSiteControllerOrderList(user).subscribe((res:any)=>{

    this.commonService.spinner.show();
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success' && res['data'].length>0){
        this.purchaseListAPI = [];
        this.purchaseListAPI = res['data'];
        this.purchaseList = [];
        res['data'].map((item:any)=>{
          this.purchaseList.push(
            {
              "Reference ID": item['referenceId']?item['referenceId']:'',
              "Invoice Type": item['invoiceType']?item['invoiceType']:'',
              "Invoice No.": item['invoiceNumber']?item['invoiceNumber']:'',
              "Invoice Date": item['invoiceDate']?moment(item['invoiceDate']).format('DD-MMM-YYYY'):'',
              "Invoice Amount (Rs)": item['invoiceAmount']?item['invoiceAmount']:'',
              "PO No.": item['poNumber']?item['poNumber']:'',
              "Vendor Code": item['createdBy']?item['createdBy']:'',
              "Vendor Name": item['vendorName']?item['vendorName']:'',
              "Status": item['status'].toLowerCase(),
              "Checklist":item['barCode']?item['barCode']:'',
              "History": item
            }
          )
          this.setSiteControllerFilterField();
        })
      }else{
        this.purchaseList = [
          {
            "Document No.": '',
            "Invoice Type": '',
            "Invoice No.": '',
            "Invoice Date": '',
            "Invoice Amount": '',
            "PO No.": '',
            "Vendor Code": '',
            "Vendor Name": '',
            "Checklist":'',
            "History": ''
          }
        ];
      }
    },err=>{
      this.commonService.spinner.hide();
      console.log(err)
    })
  }

  applyPurchaseSearchSiteController(data: any) {
    console.log("applyPurchaseSearch", data);

    let filter_data = data['pi_filterjson'];
    let keys = Object.keys(filter_data);
    let values = Object.values(filter_data);
    let indexOfFilter:any = []
    values.map((item, i)=>{
      if(item != ''){
          indexOfFilter.push(i);
      }
    })
    this.isLoader = true;

    let url = `POInvoiceDetailsSubmitTo?submissionTo=${this.username}`;
    // this.commonService.getSiteControllerOrderList(this.username).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      if(res['status']=='Success' && res['data'].length>0){
        indexOfFilter.map((item:any)=>{
          res['data'] = res['data'].filter((ele:any)=>{
            if(ele[keys[item]].toString().includes(values[item])){
              return ele;
            }
          })
        })

        this.purchaseList = [];
        res['data'].map((item:any)=>{
          this.purchaseList.push(
            {
              "Reference ID": item['referenceId'],
              "Invoice Type": item['invoiceType'],
              "Invoice No.": item['invoiceNumber'],
              "Invoice Date": item['invoiceDate'],
              "Invoice Amount (Rs)": item['invoiceAmount'],
              "PO No.": item['poNumber'],
              "Vendor Code": item['poNumber'],
              "Vendor Name": item['vendorName'],
              "Status": item['status'].toLowerCase(),
              "Checklist":item['barCode']?item['barCode']:'',
              "History": item
            }
          )
          this.setSiteControllerFilterField();
        })
      }
        this.isLoader = false
      },err => {
        this.isLoader = false
        console.log('Error fetching:', err);
      }
    );
  }

  setSiteControllerFilterField(){
    console.log('setSiteControllerFilterField');
    this.purchaseSearchObject = [
      {
        forLabel: "Reference ID.",
        forContrl: "referenceId",
        forPlace: "Enter Document No."
      },
      {
        forLabel: "Invoice Type",
        forContrl: "invoiceType",
        forPlace: "Enter Type"
      },
      {
        forLabel: "Invoice No.",
        forContrl: "invoiceNumber",
        forPlace: "Enter Invoice No."
      },
      {
        forLabel: "Invoice Date",
        forContrl: "invoiceDate"
      },
      {
        forLabel: "Invoice Amount",
        forContrl: "invoiceAmount",
        forPlace: "Enter Invoice Amount"
      },
      {
        forLabel: "PO No.",
        forContrl: "poNumber",
        forPlace: "Enter PO No."
      },
      {
        forLabel: "Vendor Code",
        forContrl: "poNumber",
        forPlace: "Enter Vendor Code"
      },
      {
        forLabel: "Vendor Name",
        forContrl: "vendorName",
        forPlace: "Enter Vendor Name"
      },
      {
        forLabel: "Status",
        forContrl: "status",
        forPlace: "Choose"
      },
    ]
  }

  /* Conditional Raw Material Incharge */
  getCreatedCondition(){
    console.log('getCreatedCondition');

    let url = `getConditionRequestDetails?createdBy=${this.username}`;
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);

      if(res && res['status']=='Success' && res.data.length>0){
        this.purchaseList = [];
        res['data'].map((item:any)=>{
          this.purchaseList.push(
            {
              "Condition ID": item['conditionId']?item['conditionId']:'',
              "Created Date": item['createdDate']?moment(item['createdDate']).format('DD-MMM-YYYY'):'',
              "Vendor Number": item['parentVendorNo']?item['parentVendorNo']:item['vendorNumber'],
              "Child Vendor Number": item['vendorNumber']?item['vendorNumber']:'',
              "Child Vendor Name": item['vendorName']?item['vendorName']:'',
              "Plant Code": item['plantCode']?item['plantCode']:'',
              "PO Number": item['poNumber']?item['poNumber']:'',
              "PO Item No.": item['poItemNo']?item['poItemNo']:'',
              "Condition Type": item['conditionType']?item['conditionType']:'',
              "Quantity Type": item['quantityType']?item['quantityType']:'',
              "Status": item['status']?item['status']:'pending',
            }
          )
        })

        this.purchaseList.sort().reverse();
        localStorage.setItem('conditionList', JSON.stringify(this.purchaseList));
        localStorage.setItem('conditionListJson', JSON.stringify(res['data']));
        this.setRawMaterialControllerFilterField();
      }else{
        this.purchaseList = [];
        this.purchaseList.push(
          {
            "Condition ID": '',
            "Created Date": '',
            "Vendor Number": '',
            "Child Vendor Number": '',
            "Child Vendor Name": '',
            "Plant Code": '',
            "PO Number": '',
            "PO Item No.": '',
            "Condition Type": '',
            "Quantity Type": '',
            "Status": ''
          }
        )
      }
    },err=>{
      console.log(err);

    })
  }

  setRawMaterialControllerFilterField(){
    console.log('setRawMaterialControllerFilterField');
    this.purchaseSearchObject = [
      {
        forLabel: "Child Vendor Number",
        forContrl: "vendorNumber",
        forPlace: "Enter Child Vendor Number"
      },
      {
        forLabel: "PO Number",
        forContrl: "poNumber",
        forPlace: "Enter PO Number"
      },
      {
        forLabel: "PO Item Number",
        forContrl: "poItemNo",
        forPlace: "Enter PO Item No."
      },
      {
        forLabel: "Quantity Type",
        forContrl: "quantityType",
        forPlace: "Enter Quantity Type"
      },
    ]
  }

  applyCreateConditionSearch(data: any) {
    console.log("applyPurchaseSearch", data);

    let filter_data = data['pi_filterjson'];
    let keys = Object.keys(filter_data);
    let values = Object.values(filter_data);
    let indexOfFilter:any = []
    values.map((item, i)=>{
      if(item != ''){
          indexOfFilter.push(i);
      }
    })
    this.isLoader = true;

    let url = `getConditionRequestDetails?createdBy=${this.username}`;
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      if(res['status']=='Success' && res['data'].length>0){
        indexOfFilter.map((item:any)=>{
          res['data'] = res['data'].filter((ele:any)=>{
            if(ele[keys[item]].toString().includes(values[item])){
              return ele;
            }
          })
        })

        this.purchaseList = [];
        res['data'].map((item:any)=>{
          if(this.roleName == 'RawMaterialIncharge'){
            this.purchaseList.push({
              "Condition ID": item['conditionId']?item['conditionId']:'',
              "Created Date": item['createdDate']?moment(item['createdDate']).format('DD-MMM-YYYY'):'',
              "Vendor Number": item['parentVendorNo']?item['parentVendorNo']:item['vendorNumber'],
              "Child Vendor Number": item['vendorNumber']?item['vendorNumber']:'',
              "Child Vendor Name": item['vendorName']?item['vendorName']:'',
              "Plant Code": item['plantCode']?item['plantCode']:'',
              "PO Number": item['poNumber']?item['poNumber']:'',
              "PO Item No.": item['poItemNo']?item['poItemNo']:'',
              "Condition Type": item['conditionType']?item['conditionType']:'',
              "Quantity Type": item['quantityType']?item['quantityType']:'',
              "Status": item['status']?item['status']:'pending',
            })
          }else{
            this.purchaseList.push({
              "Reference ID": item['referenceId'],
              "Invoice Type": item['invoiceType'],
              "Invoice No.": item['invoiceNumber'],
              "Invoice Date": item['invoiceDate'],
              "Invoice Amount (Rs)": item['invoiceAmount'],
              "PO No.": item['poNumber'],
              "Vendor Code": item['poNumber'],
              "Vendor Name": item['vendorName'],
              "Status": item['status'].toLowerCase(),
              "History": item
            })
          }

          if(this.roleName == 'RawMaterialIncharge'){
            this.purchaseList.sort().reverse();
            localStorage.setItem('conditionList', JSON.stringify(this.purchaseList));
            localStorage.setItem('conditionListJson', JSON.stringify(res['data']));
            this.setRawMaterialControllerFilterField();
          }else{
            this.setSiteControllerFilterField();
          }
        })
      }
        this.isLoader = false
      },err => {
        this.isLoader = false
        console.log('Error fetching:', err);
      }
    );
  }

  retrySes(row:any){
    console.log('retrySes');
    if(row['Status'] != 'error'){
      return;
    }

    let json = this.purchaseListAPI.find((ele:any)=>{
      return ele['referenceId'] == row['Reference ID'];
    })

    this.commonService.spinner.show();
    let url = `getSesDetails?poinvoiceId=${json.poInvoiceID}`;
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      this.getPurchaseOrderList();
    },err=>{
      this.commonService.spinner.hide();
      console.log(err);
    })

  }

  downloadRewardItemData(){
    console.log('downloadRewardItemData');

    let url = `getPoInvoiceSummary?createdBy=${this.userdata.ACCOUNTNUMBER}`;

    this.commonService.spinner.show();
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();

      // let json :any = [{"name": "John", "age": 30}, {"name": "Jane", "age": 25}];
      let json :any = res['data'];
      let columns = Object.keys(json[0]);

      const worksheet = XLSX.utils.json_to_sheet(json, { header: columns });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, 'data.xlsx');
    },err=>{
      console.log(err);
      this.commonService.spinner.hide();
    })
  }

  routeToPage(){
    // console.log('showAlert');
    // alert(`🚫 vSPEED Functionality Disabled
    //   Due to updates introduced with GST 2.0, the vSPEED feature has been temporarily disabled.
    //   We’re working to align with the new compliance standards and will notify you once functionality is restored.
    //   Thank you for your understanding.`);

    this.commonService.routeToPage('/dashboard/raw-material-incharge');
  }
}
