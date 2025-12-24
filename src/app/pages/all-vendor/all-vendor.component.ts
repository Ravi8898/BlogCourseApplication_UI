import { formatDate } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import jsPDF from 'jspdf';

import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-all-vendor',
  templateUrl: './all-vendor.component.html',
  styleUrls: ['./all-vendor.component.scss']
})
export class AllVendorComponent {

  successToast: boolean = false;
  errorToast: boolean = false;
  toastMsg: string = '';
  showHistory :any = '';

  @ViewChild('htmlData') htmlData!: ElementRef;

  @Input() isTableTile: boolean = true;
  @Input() isTableFilter: boolean = true;
  @Input() isSearchShow: boolean = true;
  @Input() isNoDataContent: boolean = false;
  @Input() tableData: any[] = [];
  @Input() searchObject: any[] = [];
  @Input() modalElementId: string = '';
  @Input() searchModal : string='';
  @Input() loginType : string='';
  @Input('tableTitle') tableTitle: any;
  @Input() showAction :any = false;

  @Output() searchParamObj = new EventEmitter<any>();
  @Output() editId = new EventEmitter<any>();
  @Output() deleteConfirmed = new EventEmitter();
  @Output() activateTab = new EventEmitter();
  @Output() excelDownload = new EventEmitter();
  @Output() uploadedPDF = new EventEmitter();
  @Output() submitData = new EventEmitter();

  dynamicSearchForm!: FormGroup;
  columnForm!: FormGroup;
  sapStatus :any = {};

  apiData :any;
  public apiPagedData: any[] = [];
  public pagedData: any[] = [];
  public data: any[] = [];
  isSuccess: boolean = true
  displayedColumns: string[] = [];
  displayedData: any = [];
  displayedColumns_constant: string[] = [];
  columnDataTypes: string[] = [];

  pages: number[] = [];
  totalPages: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  deleteItemId: number = 0;

  visiblePages: number[] = [];
  searchText :any = '';
  searchList :any = [];
  trackData :any[] = [];
  roleName :any = '';
  roleType :any = '';
  userdata : any = '';
  username :any = '';
  allDigitalSigned :any;
  seletedInvoice :any;

  // plantFilter :any= [];
  // vendorFilter :any= [];
  materialFilter :any= [];
  plantFilter :any= {};
  vendorFilter :any= {};
  plantCodeArr: any = [];
  statusFilter :any= [];

  minDate = moment(+new Date - 7776000000).format('yyyy-MM-DD');
  endMinDate = moment(+new Date - 7776000000).format('yyyy-MM-DD');
  endMaxDate = moment(new Date()).format('YYYY-MM-DD');
  maxDate = moment(new Date()).format('YYYY-MM-DD');
  invoiceStatus :any = {};
  apiexcelData :any = [];
  excelData :any = [];

  constructor(private fb: FormBuilder, private route: Router, private commonService:CommonService) {
    this.roleName = localStorage.getItem('roleName')?localStorage.getItem('roleName'):''
    this.roleType = localStorage.getItem('roleType')?localStorage.getItem('roleType'):'';
    this.userdata = localStorage.getItem('userdata')?JSON.parse(localStorage.getItem('userdata') || ''):'';
    if(!this.roleName){
      this.roleName = this.userdata?.['ROLE'];
    }
    this.userdata = JSON.parse(localStorage.getItem('userdata') || '{}');
    this.username = localStorage.getItem('username');
    this.currentPage = 1;
  }

  ngOnInit():void{
    // this.displayedColumns = ['Date', 'Vendor Code', 'PO Number', 'Invoice No.', 'Amount', 'Quantity', 'Material Desc', 'Download Invoice', 'Upload Invoice', 'Status', 'Checklist'];
    this.displayedColumns = ['Invoice ID', 'Date', 'Vendor Code', 'Vendor Name', 'SAP Doc', 'Plant', 'PO Number', 'Invoice No.', 'IRN No', 'Material Desc', 'Rate', 'Quantity', 'BAmount', 'GST', 'TAmount', 'Invoice', 'Status', 'Upload Invoice', 'Checklist' ];
    this.getParentVendorInvoiceList();
    this.getPlantDetails();
    this.setFilterField();
    this.loadFilterForm();
  }

  getParentVendorInvoiceList(){
    console.log('getParentVendorInvoiceList');
    // this.currentPage = 1;
    
    let user = this.userdata['ACCOUNTNUMBER'];
    this.showHistory = false;
    // let url = `POInvoiceDetails?createdBy=${user}`;
    let url = `allInvoiceDetails`;

    this.commonService.spinner.show();
    this.commonService.dataPost(url, {}).subscribe((res:any)=>{
      // console.log(res);
      this.commonService.spinner.hide();

      if(res && res['status']=='Success' && res['data'].length>0){
      
        res['data'].forEach((ele:any)=>{
          ele.rate = Number(ele.netAamount / ele.quantity).toFixed(2)
        })

        this.apiData = res['data'];
        this.data = [];
        this.pagedData = [];

        this.data = this.contructDataStructure(res['data']);
        this.excelData = this.contructDataForExcelDownload(res['data']);
        
      }else{
        this.data = [];
      }
      this.apiPagedData = this.data;
      this.tableData = this.data;
      this.setALLPagination();
      this.constructorFilterOption();
      if(this.searchText!=''){
        this.applySearch();
      }
    },err=>{
      console.log(err);
      this.commonService.spinner.hide();
      this.data = [];
    })
  }

  getPlantDetails() {
    console.log('getPlantDetails');

    let url = `getPlantDetails`;

    this.commonService.dataGet(url).subscribe((res: any) => {
      console.log(res);
      if (res && res['status'] == 'Success' && res['data'].length > 0) {
        this.plantCodeArr = res['data'];
        this.constructorFilterOption();
      }
    }, err => {
      console.log(err);
    })
  }

  constructorFilterOption(){
    console.log('constructorFilterOption');
    
    this.materialFilter = []; this.plantFilter = []; this.vendorFilter = []; this.statusFilter = [];
    if(this.tableData.length>0 && this.plantCodeArr.length>0){
      this.tableData.map((ele:any)=>{
        if(!this.materialFilter.includes(ele['Material Desc'])){
          this.materialFilter.push(ele['Material Desc'])
        }

        if(!this.statusFilter.includes(ele['Status'])){
          this.statusFilter.push(ele['Status']);
        }
    
        if(!this.plantFilter[ele['Plant']]){
          let resp = this.plantCodeArr.find((item:any)=>{
            return item['plantCode'] == ele['Plant']
          }) 
          this.plantFilter[ele['Plant']] = resp['plantCode']+'-'+resp['plantName']
        }
     
        if(!this.vendorFilter[ele['Vendor Code']]){
          this.vendorFilter[ele['Vendor Code']] = ele['Vendor Code']+'-'+ele['Vendor Name']
        }
      })
    }
  }

  contructDataStructure(data_json:any){
    let data :any = []
    data_json.map((item:any)=>{
      data.push(
        {
          "Date": item['createdDate'],
          "Invoice ID": item['poInvoiceID'],
          "Vendor Code": item['childVendorCode'],
          "Vendor Name": item['childVendorName'],
          "SAP Doc": item['sapDocNo'],
          "Plant": item['plantCode'],
          "PO Number": item['poNumber'],
          "Invoice No.": item['invoiceNumber'],
          "IRN No": item['irnNo']?item['irnNo']:'',
          "Material Desc": item['itemMaterialDes'],
          "Rate": item['rate']?item['rate']:'',
          "Quantity": Number(item['quantity']).toFixed(2),
          "BAmount": item['netAamount'],
          "GST": item['tax'],
          "TAmount": item['totalAmount'],
          "Invoice":item['invoiceAttachment'],
          "Status": item['status']?item['status']:'pending',
          "Upload Invoice":item['invoiceAttachment'],
          "Checklist": item['barCode']?item['barCode']:'',
          "doaction": item['barCode']?false:true
        }
      )
    }) 

    this.invoiceStatus['pending'] = data.filter((ele:any)=>{ return ele.Status == 'pending'}).length;
    this.invoiceStatus['irn'] = data.filter((ele:any)=>{ return ele['IRN No'] == ''}).length;
    this.invoiceStatus['fi'] = data.filter((ele:any)=>{ return ele['SAP Doc'] == 'failed'}).length;
    return data;
  }

  contructDataForExcelDownload(data_json:any){
    let data :any = []
    data_json.map((item:any)=>{
      data.push({
        'PlantCode' : item['plantCode'],
        'InvoiceNumber' : item['invoiceNumber'],
        'SapDocNo' : item['sapDocNo'],
        'FI_Status' : item['sapDocNo']!='failed'?'':item['fiErrorMessage']?item['fiErrorMessage']:'pending',
        'InvoiceDate' : item['createdDate'],
        'CustomerCode' : item['customerCode'],
        'PartyName' : item['partyName'],
        'All_CompanyName' : item['allCompanyName'],
        'AAA_PlantName' : item['aaaPlantName'],
        'Cust_GSTNo' : item['custGSTNo'],
        'Cust_GSTStateCode' : item['custGSTStateCode'],
        'Cust_GSTStateName' : item['custGSTStateName'],
        'Material_Desc' : item['itemMaterialDes'],
        'Rate' : item['rate']?item['rate']:'',
        'Quantity' : Number(item['quantity']).toFixed(2),
        'Basic_Amount' : item['netAamount'],
        'CGST_Amount' : item['cgst'],
        'SGST_Amount' : item['sgst'],
        'IGST_Amount' : item['igst'],
        'TAmount' : item['totalAmount'],
        'CompanyGst' : item['companyGSTNo'],
        'Company_GSTStateCode' : item['companyGSTStateCode'],
        'Company_GSTStateName' : item['companyGSTStateName'],
        'Invoice_ID' : item['poInvoiceID'],
        'Vendor_Code' : item['childVendorCode'],
        'Vendor_Name' : item['childVendorName'],
        'PO_Number' : item['poNumber'],
        'IRN_No' : item['irnNo'],    
        'IRN_Status' :  item['irnNo']?'':item['irnMessage']?item['irnMessage']:'pending',    
        'Checklist' : item['barCode']?item['barCode']:''
      })
    })

    this.apiexcelData = JSON.parse(JSON.stringify(data));
    return data;
  }

  setFilterField(){
    this.searchObject = [
      {
        forLabel: "From Date",
        forContrl: "fromCreatedDate",
        forPlace: "Enter from Date"
      },
      {
        forLabel: "To Date",
        forContrl: "toCreatedDate",
        forPlace: "Enter To Date"
      },
      /* {
        forLabel: "To Date",
        forContrl: "createdDate",
        forPlace: "Enter Date"
      }, */
      {
        forLabel: "Material",
        forContrl: "itemMaterialDes",
        forPlace: "Select Material"
      }, 
      {
        forLabel: "Plant",
        forContrl: "plantCode",
        forPlace: "Select Plant"
      },
      {
        forLabel: "Transporter",
        forContrl: "childVendorCode",
        forPlace: "Select Transporter"
      },
      {
        forLabel: "Status",
        forContrl: "status",
        forPlace: "Select Status"
      }
    ]
  }

  loadFilterForm(){
    this.dynamicSearchForm = new FormGroup({
      'fromCreatedDate': new FormControl(''),
      'toCreatedDate': new FormControl(''),
      'itemMaterialDes': new FormControl(''),
      'childVendorCode': new FormControl(''),
      'plantCode': new FormControl(''),
      'status': new FormControl(''),
    })
    this.dynamicSearchForm.controls['toCreatedDate'].disable()
  }
  
  selectedStartDate(event?:any){
    console.log('selectStartDate');
    this.endMinDate = this.dynamicSearchForm.value.fromCreatedDate;
    this.endMaxDate = moment([new Date(this.endMinDate).getFullYear(), new Date(this.endMinDate).getMonth()]).endOf('month').format('YYYY-MM-DD');
    // this.endMaxDate = this.endMaxDate > this.maxDate ? this.maxDate:this.endMaxDate
    this.dynamicSearchForm.controls['toCreatedDate'].enable();
    this.dynamicSearchForm.controls['toCreatedDate'].setValue(this.endMinDate);
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.searchText = '';
    this.currentPage = 1;

    const outputObject = this.searchObject.reduce((acc, curr) => {
      acc[curr.forContrl] = "";
      return acc;
    }, {});

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
    this.data = _data;

    this.displayedColumns_constant = Object.keys(this.data[0] ? this.data[0] : {}) // Assign value for column hide and show

    if(this.displayedColumns_constant.includes('History')){
      this.displayedColumns_constant.splice(this.displayedColumns_constant.indexOf('History'),1);
    }


    let savedColumnSetting = localStorage.getItem('columnSetting'+ this.searchModal);
    const currentUrl = this.route.url;
    console.log('displayedColumns_constant', currentUrl);
    if (savedColumnSetting) {
      this.displayedColumns = JSON.parse(savedColumnSetting)
    } else {
      this.displayedColumns = Object.keys(this.data[0] ? this.data[0] : {});

    }
    
    const formControls: any = {};
    this.displayedColumns_constant.forEach(column => {
      formControls[column] = new FormControl(true); // Default all columns to visible
    });

    let savedColumnCheck = localStorage.getItem('columnCheck'+ this.searchModal);
    if (savedColumnCheck) {
      this.columnForm = this.fb.group(JSON.parse(savedColumnCheck));
    } else {
      this.columnForm = this.fb.group(formControls);

    }

    this.apply_ColumnDatatype();

    // console.log("displayedColumns", this.displayedColumns, this.columnDataTypes);


    this.totalItems = this.data.length;
    // Set the totalItems in the PaginationService

    // Calculate total pages and populate the 'pages' array
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages()

    // Update pagedData based on the current page
    // this.pagedData = data && data.slice(this.paginationService.startIndex, this.paginationService.endIndex);
    this.updatePagedData();


  }

  setALLPagination(){
    this.totalItems = this.apiPagedData.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages()
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

  resetFilter(){
    this.loadFilterForm();
    this.currentPage = 1;
    this.getParentVendorInvoiceList();
  }

  applyFilter() {
    console.log("applyFilter");
    this.currentPage = 1;
    // console.log(this.dynamicSearchForm.value);

    let url = 'allInvoiceDetails';
    let val = this.dynamicSearchForm.value;

    this.commonService.spinner.show();
    this.commonService.dataPost(url, val).subscribe((res:any)=>{
      // console.log(res);
      this.commonService.spinner.hide();

      res['data'].forEach((ele:any)=>{
        ele.rate = Number(ele.netAamount / ele.quantity).toFixed(2)
      })

      this.apiData = res['data'];
      this.data = [];
      this.pagedData = [];

      this.data = this.contructDataStructure(res['data']);
      this.excelData = this.contructDataForExcelDownload(res['data']);

      this.apiPagedData = this.data;
      this.tableData = this.data;
      // this.constructorFilterOption();
      if(this.searchText!=''){
        this.applySearch();
      }else{
        this.setALLPagination();
      }
    },err=>{
      console.log(err);
      this.commonService.spinner.hide();
    })
  }

  applySetting() {

    let columnSetting = this.columnForm.value;
    this.displayedColumns = Object.keys(columnSetting).filter(key => columnSetting[key]);

    //Temporary Comment

    localStorage.setItem('columnSetting' + this.searchModal, JSON.stringify(this.displayedColumns));
    localStorage.setItem('columnCheck' + this.searchModal, JSON.stringify(columnSetting));

    this.apply_ColumnDatatype()
  }

  applySearch(_event?:any) {
    console.log('applySearch');
    this.currentPage = 1;

    // let searchText = _event.target.value;
    let searchText = this.searchText.trim();
    // this.searchText = _event.target.value;
    // this.pagedData = this.apiPagedData;
    // this.pagedData = this.data;
    let table :any= [];
    this.excelData = [];
    /* this.pagedData.map((item:any)=>{
      if(Object.values(item).toString().toLowerCase().includes(this.searchText.toLowerCase())){
        table.push(item)
      }
    })  */

    this.apiexcelData.map((item:any)=>{
      if(Object.values(item).toString().toLowerCase().includes(searchText.toLowerCase())){
        this.excelData.push(item)
      }
    })
    
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

  resetSearch() {
    console.log("resetSearch", this.dynamicSearchForm.value);

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
    if(this.data.length>0 && Object.values(this.data[0])[0] != ''){
      /* this.apiPagedData = this.data ? this.data.slice(this.startIndex, this.endIndex) : [];
      this.pagedData = this.data ? this.data.slice(this.startIndex, this.endIndex) : []; */
      this.apiPagedData = this.tableData ? this.tableData.slice(this.startIndex, this.endIndex) : [];
      this.pagedData = this.tableData ? this.tableData.slice(this.startIndex, this.endIndex) : [];
    }
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
    this.currentPage = Number(selectedPage);
    this.updatePagedData();
    this.updateVisiblePages();
  }

  exportToExcel(): void {
  
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('datatable'));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // const allData = this.tableData;
    const allData = this.excelData;
    allData.forEach((ele:any)=>{
      delete(ele.Invoice); delete(ele['Upload Invoice']); delete(ele.doaction);
    })
    // const allData = this.apiPagedData;
    const allDataWs: XLSX.WorkSheet = XLSX.utils.json_to_sheet(allData);

    XLSX.utils.book_append_sheet(wb, allDataWs, 'Sheet1');
    let date = formatDate(new Date(), 'yyyy-MM-dd-hh-mm-ss', 'en');
    let filename = (this.route.url.includes("employee")?"EmployeeList":"ALLInvoiceList") + "-" + date + ".xlsx";

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

  viewAttachment(data:any){
    console.log('viewAttachment');
    
    document.querySelectorAll('._upload').forEach((element:any) => {
      element.style.visibility='hidden'
    });
    document.querySelectorAll('._submit').forEach((element:any) => {
      element.style.visibility='hidden'
    });
    
    let filePath =data?.['Invoice']? data?.['Invoice']?.[0]['attachmentFilePath']:data?.['Attachment']?.[0]['attachmentFilePath'];
    filePath = this.commonService.getEncryptPath(filePath);
    
    let url = `getBase64FromPath?filePath=${filePath}`;

    this.commonService.spinner.show();
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success' && res['data']){
        if(data.Status=='pending'){
          let file = [{
          'fileBase64': res['data'],
          'fileName': "generated.pdf"
          }]
          let json:any = {}
          json.attach = file;
          json.barcode = this.userdata.ACCOUNTNUMBER+data['Invoice No.'];
          let url = `mergePDFwithBarcode`;

          this.commonService.spinner.show();
          this.commonService.dataPost(url, json).subscribe((res:any)=>{
            console.log(res);
            this.commonService.spinner.hide();
            if(res['status']=='Success' && res['data']!=''){
              let link = document.createElement('a');
              link.href = `data:application/pdf;base64,${res.data}`;
              link.download = `${data['Invoice No.']}.pdf`;
              link.click();
              let s = (document.getElementById(data['Invoice No.']+'_upload'));
              this.seletedInvoice = data['Invoice No.'];
              if(s){
                s.style.visibility='visible';
              }
            }
          },err=>{
            console.log(err);
            this.commonService.spinner.hide();
          })
        }else{
          let link = document.createElement('a');
          link.href = `data:application/pdf;base64,${res['data']}`;
          link.download = `${data['Invoice No.']}.pdf`;
          link.click();        
        }
      }else{
        console.log('viewAttachmenterror');
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

    this.commonService.spinner.show();
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success' && res['data']){
        let link = document.createElement('a');
        link.href = `data:application/pdf;base64,${res['data']}`;
        link.download = `${data['Invoice No.']}_checklist.pdf`;
        link.click();
      }else{
        console.log('viewChecklistError');
      }
    },err=>{
      console.log(err);
      this.commonService.spinner.hide();
    })
  }

  uploadPDF(){
    document.getElementById('upload_pdf')?.click();
  }

  uploadPDFFile(event:any){
    let file = event.target.files[0];

    let file_name = file['name'];
    let file_extension = file_name.split('.').pop();

    if(file) {
      var reader = new FileReader();
      reader.onload = this._onImageCapture.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  _onImageCapture(readerEvt:any, file?:any) {
    var binaryString = readerEvt.target.result;
    let base64 = btoa(binaryString);
    let attach_json = {
      fileName : 'digital.pdf',
      fileBase64 : base64
    }
    this.allDigitalSigned = [];
    this.commonService.spinner.show();
    this.errorToast = false;

    let url = `checkDigitalSignature`;
    this.commonService.dataPost(url, attach_json).subscribe((res:any)=>{
      console.log(res);
      if(res['status']=='Success' && res['data']==true){
        this.allDigitalSigned.push(attach_json);
        this.commonService.spinner.hide();
        this.successToast = true;
        this.toastMsg = "PDF File is digitally Signed";

        // let s = (document.getElementById(this.seletedInvoice['Invoice No.']+'_submit'));
        let s = (document.getElementById(this.seletedInvoice+'_submit'));
        if(s){
          s.style.visibility='visible';
        }

        // readerEvt.target.nextSibling.innerText = 'test.pdf';
        setTimeout(() => {
          this.successToast = false;
        }, 2000);
      }else if(res['status']=='Success' && res['data']==false){
        this.commonService.spinner.hide();
        this.errorToast = true;
        this.toastMsg = "PDF File is not digitally Signed";
        setTimeout(() => {
          this.errorToast = false;
        }, 3000);
      }
    },err=>{
      console.log(err);
      this.commonService.spinner.hide();
    })
  }
  

  getInvoice(event:any){
    console.log('submitInvoice');
    
    let json = this.apiData.find((item:any)=>{
      return item['invoiceNumber'] == event['Invoice No.']
    })

    let url = `getPOSesAndGrnDetails?poInvoiceID=${json['poInvoiceID']}`
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      if(res.status=='Success' && res['data'].length>0){
        this.submitInvoice(res['data'][0], json.invoiceAttachment[0]['attachmentFilePath'])
      }
    },err=>{
      console.log(err);
      
    })
  }

  submitInvoice(json:any, attachmentFilePath:any){

    if(this.allDigitalSigned.length==0){
      this.errorToast = true;
      this.toastMsg = 'PLease upload digital signed file';
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
      return;
    }

    let url = `postPOSesAndGrnDetails`;
    json.attach = this.allDigitalSigned;
    json.attachmentFilePath = attachmentFilePath;

    this.commonService.spinner.show();
    // this.commonService.updateSiteController(json).subscribe((res:any)=>{
    this.commonService.dataPost(url, json).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success'){
        this.successToast = true;
        this.toastMsg = 'Records have been updated successfully';
        this.getParentVendorInvoiceList();
        if(res['data']){
          document.getElementById('barcodeModalButton')?.click();
        }else{
          // this.commonService.routeToPage('./dashboard');
        }
        setTimeout(() => {
          this.successToast = false;
        }, 2000);
      }else{
        this.errorToast = true;
        this.toastMsg = res['message'];
        setTimeout(() => {
          this.errorToast = false;
        }, 2000);
      }
    },err=>{
      console.log(err);
      this.commonService.spinner.hide();
      this.errorToast = true;
      this.toastMsg = err['message'];
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
    })
  }

  resendFiRequest(row:any){
    console.log('resendFiRequest');

    // let url = `postFIEntryRequest`;
    let url = `postFIEntryRequest111`;
    let firequestJson = this.apiData.find((ele:any)=>{
      return ele.poInvoiceID == row['Invoice ID']
    })
    firequestJson.fiRequest = JSON.parse(firequestJson.fiRequest.replace(/\\/g, ''));

    let s = (document.getElementById(row['Invoice No.']+'_retry'));
    if(s){
      s.style.visibility='hidden';
    }

    this.commonService.spinner.show();
    this.commonService.dataPost(url, firequestJson.fiRequest).subscribe((res: any) => {
      console.log(res);
      if (res.status == 'Success') {
        console.log(res.message);
        this.commonService.spinner.hide();
        this.getParentVendorInvoiceList();
      }
    }, err => {
      this.commonService.spinner.hide();
      console.log(err);
    })
  }
}
