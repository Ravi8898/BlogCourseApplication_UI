import { formatDate } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import jsPDF from 'jspdf';

import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-ad-table',
  templateUrl: './ad-table.component.html',
  styleUrls: ['./ad-table.component.scss']
})
export class AdTableComponent implements OnChanges {
  @ViewChild('htmlData') htmlData!: ElementRef;

  @Input() isTableTile: boolean = false;
  @Input() isTableFilter: boolean = false;
  @Input() isSearchShow: boolean = false;
  @Input() isNoDataContent: boolean = false;
  @Input() tableData: any[] = [];
  @Input() searchObject: any[] = [];
  @Input() modalElementId: string = '';
  @Input() searchModal : string='';
  @Input() loginType : string='';
  @Input('tableTitle') tableTitle: any;
  @Input() showHistory:any;
  @Input() showAction :any = true;
  @Input() showActionColumn :any = false;
  correctionRequired:boolean = false;

  @Output() searchParamObj = new EventEmitter<any>();
  @Output() editId = new EventEmitter<any>();
  @Output() deleteConfirmed = new EventEmitter();
  @Output() activateTab = new EventEmitter();
  @Output() excelDownload = new EventEmitter();
  @Output() retryService = new EventEmitter();
  @Output() sendForApproval = new EventEmitter<any>();

  dynamicSearchForm!: FormGroup;
  columnForm!: FormGroup;
  sapStatus :any = {};
  sesData :any = {};
  public pagedData: any[] = [];
  public apiPagedData: any[] = [];
  public data: any[] = [];
  isSuccess: boolean = true
  displayedColumns: string[] = [];
  displayedColumns_constant: string[] = [];
  columnDataTypes: string[] = [];

  pages: number[] = [];
  totalPages: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  deleteItemId: number = 0;
  @Output() editValue = new EventEmitter<any>();

  visiblePages: number[] = [];
  searchText :any = '';
  searchList :any = [];
  trackData :any[] = [];
  roleName :any = '';
  roleType :any = '';
  userdata : any = '';
  toastMsg: any = '';
  errorToast: any = false;
  successToast: any = false;
  selectedInvoiceType: any;

  // formData = {
  //   icjNo: '',
  //   companyName: '',
  //   subscriberName: '',
  //   chequeDDUTRNumber: '',
  //   pinCode: '',
  //   mobileNumber: '',
  //   emailID: '',
  //   receiptNo: '',
  //   status: ''
  // };


  // getFormKeys(): string[] {
  //   return Object.keys(this.searchObject);
  // }


  constructor(private fb: FormBuilder, private route: Router, private commonService:CommonService) {
    // const currentUrl = this.route.url;
    // console.log('Current URL Path:', currentUrl);
    this.roleName = localStorage.getItem('roleName')?localStorage.getItem('roleName'):''
    this.roleType = localStorage.getItem('roleType')?localStorage.getItem('roleType'):'';
    this.userdata = localStorage.getItem('userdata')?JSON.parse(localStorage.getItem('userdata') || ''):'';
    if(!this.roleName){
      this.roleName = this.userdata?.['ROLE'];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.roleName = localStorage.getItem('roleName')?localStorage.getItem('roleName'):''
    this.searchText = '';
    this.currentPage = 1;
    // console.log("searchObject", this.searchObject);

    const outputObject = this.searchObject.reduce((acc, curr) => {
      acc[curr.forContrl] = "";
      return acc;
    }, {});


    // console.log("dynamicSearchForm",this.searchObject);
    this.dynamicSearchForm = this.fb.group(outputObject);


    this.fillTableData(this.tableData);

  }

  // Calculate start and end indexes for pagination
  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return this.currentPage * this.itemsPerPage;
  }

  get serialNumberStart(): number {
    return this.startIndex + 1;
  }

fillTableData(_data: any) {
  console.log('tableData', this.tableData);

  this.data = _data;
  this.displayedColumns_constant = Object.keys(this.data[0] ? this.data[0] : {});

  if (this.displayedColumns_constant.includes('History')) {
    this.displayedColumns_constant.splice(this.displayedColumns_constant.indexOf('History'), 1);
  }

  // Check if any row has "Material" as invoice type
  const hasMaterialInvoice = this.data.some(item =>
    item['Invoice Type'] === 'Material' ||
    item['invoiceType'] === 'Material'
  );

  // Hide "Submission To" column for Material invoice type
  if (hasMaterialInvoice && this.displayedColumns_constant.includes('Submission To')) {
    const submissionToIndex = this.displayedColumns_constant.indexOf('Submission To');
    if (submissionToIndex > -1) {
      this.displayedColumns_constant.splice(submissionToIndex, 1);
    }
  }

  let savedColumnSetting = localStorage.getItem('columnSetting' + this.searchModal);

  if (savedColumnSetting) {
    this.displayedColumns = JSON.parse(savedColumnSetting);

    // Also remove from displayedColumns if it exists and has material invoices
    if (hasMaterialInvoice && this.displayedColumns.includes('Submission To')) {
      const submissionToIndex = this.displayedColumns.indexOf('Submission To');
      if (submissionToIndex > -1) {
        this.displayedColumns.splice(submissionToIndex, 1);
      }
    }
  } else {
    this.displayedColumns = Object.keys(this.data[0] ? this.data[0] : {});

    // Remove "Submission To" from initial displayed columns for material invoices
    if (hasMaterialInvoice && this.displayedColumns.includes('Submission To')) {
      const submissionToIndex = this.displayedColumns.indexOf('Submission To');
      if (submissionToIndex > -1) {
        this.displayedColumns.splice(submissionToIndex, 1);
      }
    }
  }

  const formControls: any = {};
  this.displayedColumns_constant.forEach(column => {
    formControls[column] = new FormControl(true);
  });

  let savedColumnCheck = localStorage.getItem('columnCheck' + this.searchModal);
  if (savedColumnCheck) {
    this.columnForm = this.fb.group(JSON.parse(savedColumnCheck));
  } else {
    this.columnForm = this.fb.group(formControls);
  }

  this.apply_ColumnDatatype();
  this.totalItems = this.data.length;
  this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  this.updateVisiblePages();
  this.updatePagedData();
}

  updateVisiblePages() {
    const range = 2; // Number of pages to show before and after the current page
    let start = Math.max(1, this.currentPage - range);
    let end = Math.min(this.totalPages, this.currentPage + range);

    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);
      // console.log("visiblePages", this.visiblePages);

    }
  }

  apply_ColumnDatatype() {
    // Determine data types for each column
    if (this.data.length > 0) {
      const firstItem = this.data[0];
      this.columnDataTypes = [];
      this.displayedColumns.forEach(column => {
        const value = firstItem[column];
        // Check the data type and add it to the columnDataTypes array
        // console.log("value", typeof value, Date.parse(value));

        if (typeof value === 'string') {
          this.columnDataTypes.push('string');
        } else if (typeof value === 'number') {
          this.columnDataTypes.push('number');
          // } else if (Date.parse(typeof value) === -30610224000000) {
          //   this.columnDataTypes.push('datetime');
        } else {
          this.columnDataTypes.push('default'); // Use a default class for other data types
        }
      });

      // console.log("this.columnDataTypes",this.columnDataTypes.toString());

    }
  }

  applySearch() {
    console.log("dynamicSearchForm", this.dynamicSearchForm.value);
    // let passParam = {
    //   "pi_supplier": "",
    //   "pi_filterjson": this.dynamicSearchForm.value,
    //   "pi_user": "user"
    // }

    let passParam = {
      "pi_filterjson": this.dynamicSearchForm.value,

    }

    this.searchParamObj.emit(passParam)
  }

  applySetting() {

    let columnSetting = this.columnForm.value;
    this.displayedColumns = Object.keys(columnSetting).filter(key => columnSetting[key]);

    //Temporary Comment

    localStorage.setItem('columnSetting' + this.searchModal, JSON.stringify(this.displayedColumns));
    localStorage.setItem('columnCheck' + this.searchModal, JSON.stringify(columnSetting));

    this.apply_ColumnDatatype()
    // console.log("applySetting", this.columnForm.value,displayColumn);


  }

  applyFilter(_event: any) {
    console.log('applyFilter');

    this.currentPage = 1;

    // let searchText = _event.target.value;
    let searchText = this.searchText;
    // this.searchText = _event.target.value;
    // this.pagedData = this.apiPagedData;
    this.pagedData = this.data;
    let table :any= [];
    /* this.pagedData.map((item:any)=>{
      if(Object.values(item).toString().toLowerCase().includes(this.searchText.toLowerCase())){
        table.push(item)
      }
    })  */
    this.data.map((item:any)=>{
      if(Object.values(item).toString().toLowerCase().includes(searchText.toLowerCase())){
        table.push(item)
      }
    })
    this.pagedData = table;
    this.searchList = table;
    this.tableData = table;

    //search activity
    this.totalItems = this.searchList.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages();
    this.pagedData = this.searchList ? this.searchList.slice(this.startIndex, this.endIndex) : [];
  }

  applyFilter1(_event: Event) {
    let target = _event.target as HTMLSelectElement;
    let searchValue = target.value;


    const filterValue = searchValue.toLowerCase();
    if (filterValue !== '') {
      // console.log("searchValue", this.tableData);
      this.data = this.tableData.filter(item => {

        let supplierValue = item['Supplier'];
        let dateValue = item['Date'];
        let stockCodeValue = item['Stock Code'];
        let openingCodeValue = item['Opening'];
        let receivedCodeValue = item['Received'];
        let usedCodeValue = item['Used'];
        let balanceCodeValue = item['Balance'];

        let invoiceNumber = item['Invoice No/Challan No'];
        let bagType = item['BAG Type PP /BB'];
        let plantSupplied = item['Plant Supplied'];
        let supplier = item['Supplier Name'];
        let material = item['Material'];
        let itemDescription = item['Item Description'];


        // Check for null values and convert to empty string if necessary
        supplierValue = supplierValue === null ? '' : supplierValue;
        dateValue = dateValue === null ? '' : dateValue;
        stockCodeValue = stockCodeValue == null ? '' : stockCodeValue;
        openingCodeValue = openingCodeValue == null ? '' : openingCodeValue;
        receivedCodeValue = receivedCodeValue == null ? '' : receivedCodeValue;
        usedCodeValue = usedCodeValue == null ? '' : usedCodeValue;
        balanceCodeValue = balanceCodeValue == null ? '' : balanceCodeValue;

        invoiceNumber = invoiceNumber == null ? '' : invoiceNumber
        bagType = bagType == null ? '' : bagType;
        plantSupplied = plantSupplied == null ? '' : plantSupplied;
        material = material == null ? '' : material;
        itemDescription = itemDescription == null ? '' : itemDescription;
        supplier = supplier == null ? '' : supplier;

        if (this.modalElementId == '#AddStockModal') {

          let result = supplierValue.toLowerCase().includes(filterValue)
            || dateValue.toLowerCase().includes(filterValue)
            || stockCodeValue.toLowerCase().includes(filterValue)
          // || openingCodeValue.toLowerCase().includes(filterValue)
          // || receivedCodeValue.toLowerCase().includes(filterValue)
          // || usedCodeValue.toLowerCase().includes(filterValue)
          // || balanceCodeValue.toLowerCase().includes(filterValue)
          return result;
        } else {

          let result = invoiceNumber.toLowerCase().includes(filterValue)
            || bagType.toLowerCase().includes(filterValue)
            // || material.toLowerCase().includes(filterValue)
            || itemDescription.toLowerCase().includes(filterValue)
            || stockCodeValue.toLowerCase().includes(filterValue)
            || supplier.toLowerCase().includes(filterValue)

          return result;
        }



      });
    } else {
      this.data = this.tableData;
    }

    this.goToPage(1);
    this.fillTableData(this.data);
    // console.log("applyFilter", this.data);
  }

  resetSearch() {
    console.log("resetSearch", this.dynamicSearchForm.value);

    // let passParam = {
    //   "pi_supplier": "",
    //   "pi_filterjson": this.dynamicSearchForm.value,
    //   "pi_user": "user"
    // }

    let passParam = {
      "pi_filterjson": this.dynamicSearchForm.value,
    }

    this.searchParamObj.emit(passParam)
  }

  resetSetting() {
    localStorage.removeItem('columnSetting'+ this.searchModal);
    localStorage.removeItem('columnCheck'+ this.searchModal);

    this.fillTableData(this.tableData);
  }

  updatePagedData(): void {
    this.apiPagedData = [];
    this.pagedData = [];
    if(this.data.length>0 && Object.values(this.data[0])[0] != ''){
      /* this.apiPagedData = this.data ? this.data.slice(this.startIndex, this.endIndex) : [];
      this.pagedData = this.data ? this.data.slice(this.startIndex, this.endIndex) : []; */
      this.apiPagedData = this.tableData ? this.tableData.slice(this.startIndex, this.endIndex) : [];
      this.pagedData = this.tableData ? this.tableData.slice(this.startIndex, this.endIndex) : [];
    }
    // console.log("pagedData", this.pagedData);

  }

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
    // Update the currentPage in PaginationService when the dropdown changes
    const selectedPage = event.target.value;
    this.currentPage = selectedPage;
    this.updatePagedData();
  }

  exportToExcel(): void {
    // const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('datatable'));
    // const wb: XLSX.WorkBook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // let date = formatDate(new Date(), 'yyyy-MM-dd-hh-mm-ss', 'en');
    // let filename = "subscriber" + "-" + date + ".xlsx";

    // XLSX.writeFile(wb, filename);

    if(this.roleName == 'LogisticOfficer'){
      this.excelDownload.emit()
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('datatable'));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Assuming you have a function to get all data (including paginated data) from your source
    const allData = this.tableData;

    // Convert all data to worksheet
    const allDataWs: XLSX.WorkSheet = XLSX.utils.json_to_sheet(allData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, allDataWs, 'Sheet1');

    // Format date and create filename
    let date = formatDate(new Date(), 'yyyy-MM-dd-hh-mm-ss', 'en');
    // let filename = "InvoiceList" + "-" + date + ".xlsx";
    let filename = (this.route.url.includes("employee")?"EmployeeList":"InvoiceList") + "-" + date + ".xlsx";

    // Save the workbook to a file
    XLSX.writeFile(wb, filename);

  }

  openPDF(): void {
    let DATA: any = document.getElementById('htmlData');
    // console.log("htmlData", DATA);

    html2canvas(DATA).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('l', 'mm', 'a4');
      // var PDF = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" })
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.table(1, 1, this.data, this.displayedColumns, { autoSize: true })
      PDF.save("invoicedetails" + formatDate(new Date(), 'yyyy-MM-dd-hh-mm-ss', 'en'));
    });
  }

  goToLinkPage(value: any) {
    //  console.log("value", value);
    // this.route.navigate(['subscription/subscriberdetails'], { queryParams: { icjNumber: value } });
    this.route.navigate(['subscription/'], { queryParams: { icjNumber: value } });

  }

  goToVendorView(value: any){
    this.commonService.viewPurchase = true;
    this.commonService.editPurchaseData = value;
    if(value['Invoice Type']=='Material'){
      // this.commonService.routeToPage('./dashboard/purchase');
      this.commonService.routeToPage('./dashboard/material-invoice');
    }else if(value['Invoice Type']=='Service'){
      this.commonService.routeToPage('./dashboard/service-invoice');
    }else if(value['Invoice Type']=='SLA'){
      this.commonService.routeToPage('./dashboard/sla-invoice');
    }else if(value['Invoice Type']=='Freight-Inbound'){
      this.commonService.routeToPage('./dashboard/freight-inbound-invoice');
      // this.commonService.routeToPage('./dashboard/freight-inbound/invoice');
      // this.commonService.routeToPage('./dashboard/conditional-invoice');
    }else if(value['Invoice Type']=='Reward'){
      this.commonService.routeToPage('./dashboard/reward-invoice');
    }else{
      // this.commonService.routeToPurchaseOrder();
      this.commonService.routeToPage('./dashboard/material-invoice');
    }
  }

  goToEdit(value: any, action?:any) {
    console.log('goToEdit');
    const isCorrectionRequired = value['Status'] === 'correction_required';

    this.commonService.action = action;
    this.commonService.viewPurchase = false;
    this.commonService.updatePurchase = true;
    this.commonService.editPurchaseData = value;
    if(isCorrectionRequired){
       this.commonService.isCorrectionRequired = true;
       this.commonService.correctionRequiredData = value;
    } else {
       this.commonService.isCorrectionRequired = false;
       this.commonService.correctionRequiredData = null;
    }
    if(this.loginType=='vendor' || this.roleName == 'BusinessUser'){
      if(this.roleName == 'BusinessUser'){
      this.commonService.viewPurchase = true;
      this.commonService.updatePurchase = false;
      }
      if(value['Invoice Type']=='Material'){
        this.commonService.routeToPage('./dashboard/material-invoice');
      }else if(value['Invoice Type']=='Service'){
        this.commonService.routeToPage('./dashboard/service-invoice');
      }else if(value['Invoice Type']=='SLA'){
        this.commonService.routeToPage('./dashboard/sla-invoice');
      }else if(value['Invoice Type']=='Reward'){
        this.commonService.routeToPage('./dashboard/reward-invoice');
      }else {
        // this.commonService.routeToPurchaseOrder();
        this.commonService.routeToPage('./dashboard/material-invoice');
      }
    }else if(this.loginType=='sitecontroller' && this.roleName=='LogisticOfficer'){
      this.editId.emit(value);
    }else if(this.loginType=='sitecontroller' && this.roleName.includes('RawMaterialIncharge')){
      this.commonService.viewPurchase = true;
      // this.commonService.routeToPage('./dashboard/conditional-incharge');
      this.commonService.routeToPage('./dashboard/raw-material-incharge');
    }else{
      if(value['Invoice Type']=='Material'){
       this.editId.emit(value);
        this.commonService.routeToPage('./dashboard/material-incharge');
      }else if(value['Invoice Type']=='Service'){
        this.commonService?.routeToPage('./dashboard/service-incharge');
      }else if(value['Invoice Type']=='SLA'){
        this.commonService?.routeToPage('./dashboard/sla-incharge');
      }else if(value['Invoice Type']=='Reward'){
        this.commonService?.routeToPage('./dashboard/reward-incharge');
      }else{
        // this.commonService.routeToSiteController();
        this.commonService.routeToPage('./dashboard/material-incharge');
      }
    }
  }

  goToDelete(value: any) {
    // this.deleteItemId = value;
    this.deleteItemId = value['Invoice Number'];
  }

  goToViewHistory(value: any) {
    // this.activateTab.emit(value);
    console.log('goToViewHistory', value);
    this.selectedInvoiceType = value['invoiceType'];
    const poInvoiceId = value['poInvoiceID'] || value['poInvoiceId'];

    if ((value['invoiceType'] === 'Material' || value['invoiceType'] === 'Service') && poInvoiceId) {
      this.viewHistoryChecklist(poInvoiceId);
      return;
    }
    this.trackData = [];
    this.trackData.push(
      {
        "date": value['createdDate'],
        "status": "pending",
        // "title": "pending",
        "updatedby": value['vendorName']?value['vendorName']:value['createdBy'],
        "content": value['remarks']
      },
      /* {
        "date":"1705961034000",
        "status": "pending",
        "title": "vendor resubmit",
        "content": "t is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
      }, */
      /* {
        "date":"1705973465000",
        "status": "sent",
        "title": "sent",
        "content": "t is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
      },
      {
        "date":"1705983465000",
        "status": "accept",
        "title": "accept",
        "content": "t is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
      } */
    )
    // if(value['reviewerRemarks']){
    if(value['status']=='accept'){
      this.trackData.push(
        {
          "date": value['updatedDate'],
          "status": value['status'],
          "updatedby": value['updatedBy']?value['updatedBy']:value['createdBy'],
          "barcode": value['barCode'],
          "content": value['reviewerRemarks']
        }
      )
    }else if(value['status']!='pending'){
      this.trackData.push(
        {
          "date": value['updatedDate'],
          "status": value['status'],
          "updatedby": value['updatedBy']?value['updatedBy']:value['createdBy'],
          "content": value['reviewerRemarks']
        }
      )
    }
    /* this.commonService.getPOTrack().subscribe((res)=>{
      console.log(res);
    },err=>{
      console.log(err);
    }) */

    this.sapStatus = {};
    // let url = `getSapTrackingStatus?poInvoiceId=${value['poInvoiceID']}`;
    // this.commonService.getSapTrackingStatus(value['poInvoiceID']).subscribe((res:any)=>{
    let url = `getSesUtrResDetails?invoiceNumber=${value['invoiceNumber']}`;
    // let url = `getSesUtrResDetails?invoiceNumber=${value['remarks'].split('-')[1]}`;
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      if(res.status == 'Success' && res['data'].length>0){
        // res['data'] = JSON.parse(res['data']);
        res['data'].map((ele:any)=>{
          if(ele.sesStatus == 'S'){
            this.sesData = ele;
            this.sesData.creationDate_ = this.sesData.creationDate.toString().slice(6) + '-' + this.sesData.creationDate.toString().slice(4, -2) + '-' + this.sesData.creationDate.toString().slice(0, 4);
            this.sesData.checklistCreationTime_ = this.sesData.checklistCreationTime.toString().slice(0,2) + ':' + this.sesData.checklistCreationTime.toString().slice(2, 4);

            this.sesData.sescreationDate_ = this.sesData.sesCreationDate.toString().slice(6) + '-' + this.sesData.sesCreationDate.toString().slice(4, -2) + '-' + this.sesData.creationDate.toString().slice(0, 4);
            this.sesData.sesCreationTime_ = this.sesData.sesCreationTime.toString().slice(0,2) + ':' + this.sesData.sesCreationTime.toString().slice(2, 4);
            if(this.sesData.utrDate){
              this.sesData.utrDate_ = this.sesData.utrDate.toString().slice(6) + '-' + this.sesData.utrDate.toString().slice(4, -2) + '-' + this.sesData.utrDate.toString().slice(0, 4);
            }
          }
        })
        this.sapStatus = res['data'];
      }else{
        this.sesData = {};
      }
    },err=>{
      console.log(err);
    })

  }

viewHistoryChecklist(poInvoiceId: any) {
  this.trackData = [];  // reset

  const url = `getActivityTrackingDetails?fkPOInvoiceId=${poInvoiceId}`;
  this.commonService.dataGet(url).subscribe((res: any) => {

    if (res.status === 'Success' && res.data?.length > 0) {

      res.data.forEach((item: any) => {

        this.trackData.push({
          date: item.createdDate,
          status: item.status.toLowerCase(),       // submitted, sent-back etc.
          updatedby: item.updatedBy || item.userName,
          content: item.remarks
        });

      });

      console.log("TRACK DATA ---->", this.trackData);
    } else {
      this.trackData = [];
    }
  }, err => {
    this.trackData = [];
  });
}




  confirmDelete(value: any) {
    this.deleteConfirmed.emit(value);
  }

  viewAttachment(data:any){
    console.log('viewAttachment');
    this.commonService.spinner.show();
    /* let filePath = [];
    if(data?.['Download Invoice']){
      filePath = data?.['Download Invoice']?.[0]['attachmentFilePath']
    }else{
      filePath = data?.['Attachment']?.[0]['attachmentFilePath'];
    } */
    // let filePath = data?.['Attachment']?.[0]['attachmentFilePath'];
    let filePath =data?.['Download Invoice']? data?.['Download Invoice']?.[0]['attachmentFilePath']:data?.['Attachment']?.[0]['attachmentFilePath'];
    filePath = this.commonService.getEncryptPath(filePath);

    let url = `getBase64FromPath?filePath=${filePath}`;
    // this.commonService.viewAttachment(filePath).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success' && res['data']){
        let link = document.createElement('a');
        link.href = `data:application/pdf;base64,${res['data']}`;
        link.download = `${data['Invoice No.']?data['Invoice No.']:data['Invoice Number']}.pdf`;
        link.click();
      }else{
        console.log('viewAttachmenterror');
        this.commonService.spinner.hide();
      }
    },err=>{
      console.log(err);
      this.commonService.spinner.hide();
    })
  }

  viewChecklist(data:any){
    console.log('viewChecklist');
    this.commonService.spinner.show();

    // let path = `D:/vendorportal-data/vendorportalFiles/${encodeURIComponent(data['Checklist'])}`
    // let url = `getBase64FromPath?filePath=${encodeURIComponent(path)}_checklist.pdf`;
    let path = `D:/vendorportal-data/vendorportalFiles/${encodeURIComponent(data['Checklist'])}_checklist.pdf`;
    path = this.commonService.getEncryptPath(path);
    let url = `getBase64FromPath?filePath=${path}`;
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success' && res['data']){
        let link = document.createElement('a');
        link.href = `data:application/pdf;base64,${res['data']}`;
        link.download = `checklist.pdf`;
        link.click();
      }else{
        console.log('viewAttachmenterror');
      }
    },err=>{
      this.commonService.spinner.hide();
    })
  }

  retrySES(row:any){
    console.log(row);
    this.retryService.emit(row)
  }
}
