import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { FileUploader } from 'ng2-file-upload';
const URL = '/api/';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  activeTab = 'on';
  // searchText :any = '0916005228';
  searchText :any = '';
  vendorDetails :any = [];
  vendorExist :any = '';
  vendorsList :any = [];
  apivendorsList :any = [];
  tableData: any = [];
  username :any = '';

  errorToast:any = false;
  successToast:any = false;
  toastMsg:any = '';

  pages: number[] = [];
  totalItems: number = 0;
  totalPages: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pagedData: any[] = [];
  visiblePages: number[] = [];

  isLoader = false;
  errorMsg: string = '';
  ExceptionErrorMsg: any[] = [];
  selectedFile: File | null = null;
  selectedValue: number = 1;
  vendorUploadStatus :any = [];

  @ViewChild('fileInput') 'fileInput' :ElementRef;

  constructor(private commonService:CommonService){
    this.username = localStorage.getItem('username');
  }

  ngOnInit():void {
    this.testAdminApi()
  }

  changeTab(tab:any){
    console.log('changeTab');
    this.activeTab = tab;
    if(tab=='on'){
      this.vendorDetails = [];
      this.vendorExist = '';
      // this.searchText = '';
    }else if(tab=='off'){
      setTimeout(() => {
        this.getVendorsList();
      }, 100);
    }
  }

  searchVendor(){
    console.log('searchVendor');
    let searchText = this.searchText;

    this.vendorExist = '';
    this.vendorDetails = [];
    this.commonService.spinner.show();

    let url = `getVendorDetails?vendorNo=${searchText}`;
    // this.commonService.getVendorDetails(searchText).subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success' && res['message']=='Vendor Already Exist'){
        this.vendorDetails = [];
        this.vendorExist = `Vendor Number ${this.searchText} is active.`;
      // }else if(res && res['status']=="Success" && res['message'].includes('Vendor Is InActive Stage')){
      }else if(res && res['status']=="Success" && res['message'].includes('SAP Vendor Details Fetched Successfully') || res['message'].includes('Vendor Is InActive Stage')){
        /* this.vendorDetails.push({
          name: res['data']['name'],
          email: res['data']['email'],
          mobile: res['data']['telephone'],
          company: res['data']['companyCode']=='IN10'?'ACC':res['data']['companyCode']=='IN20'?'Ambuja':res['data']['companyCode'],
          status: res['data']['active']
        }) */
        this.vendorDetails.push(res['data']);
      }else{
        this.errorToast = true;
        this.toastMsg = 'Vendor Details not found';
        setTimeout(() => {
          this.errorToast = false;
        }, 2000);
      }
    },err=>{
      console.log(err);
      this.commonService.spinner.hide();
      this.errorToast = true;
      this.toastMsg = err.error.message;
      setTimeout(() => {
        this.errorToast = false;
      }, 2000);
    })

  }

  testAdminApi() {
    let url = `testapp`;
    this.commonService.dataAdminGet(url).subscribe((res: any) => {
      console.log("TEST APP", res);
      this.commonService.spinner.hide();
      if (res && res['status'] == 'Success') {
        console.log();
      }
      else {

      }
    }, err => {

    })
  }

  activateVendor(event:any){
    console.log('activateVendor', event.target.checked);
    let checked = event.target.checked;

    let json = this.vendorDetails[0];
    json.active = checked;

    this.commonService.spinner.show();
    let url = `setVendorDetails`;
    // this.commonService.setVendorDetails(json).subscribe((res:any)=>{
    this.commonService.dataPost(url, json).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success'){
        this.vendorDetails = [];
        this.searchText = '';
        this.successToast = true;
        this.toastMsg = 'Records have been updated successfully';
        setTimeout(() => {
          this.successToast = false;
        }, 3000);
      }else{
        this.errorToast = true;
        this.toastMsg = 'Something went wrong';
        setTimeout(() => {
          this.errorToast = false;
        }, 3000);
      }
    },err=>{
      console.log(err);
      this.errorToast = true;
      this.toastMsg = err.error.message;
      setTimeout(() => {
        this.errorToast = false;
      }, 3000);
    })
  }


  getVendorsList(){
    console.log('getVendorsList');

    /* this.apivendorsList = [];
    this.vendorsList = [];
    this.tableData = [];
    this.pagedData = []; */
    // this.tableData = [{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"mohul@igsorc.com","telephone":"9845928481","city":"GURGAON","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Cash","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"mohul@igsorc.com","telephone":"9845928482","city":"Mumbai","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Cheque","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"mohul@igsorc.com","telephone":"9845928483","city":"Delhi","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Bank Transfer","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"rahul@igsorc.com","telephone":"9845928484","city":"Pune","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Bank Transfer","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"test@igsorc.com","telephone":"9845928485","city":"Mumbai","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Cheque","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"mohul@igsorc.com","telephone":"9845928486","city":"Pune","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Cash","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"service@igsorc.com","telephone":"9845928487","city":"GURGAON","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"DD","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"employee@igsorc.com","telephone":"9845928488","city":"Delhi","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Bank Transfer","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"test@igsorc.com","telephone":"9845928489","city":"Pune","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Cash","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"test@igsorc.com","telephone":"9845928491","city":"GURGAON","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Bank Transfer","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"employee@igsorc.com","telephone":"9845928492","city":"Delhi","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Cheque","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"service@igsorc.com","telephone":"9845928493","city":"GURGAON","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Bank Transfer","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"rahul@igsorc.com","telephone":"9845928494","city":"GURGAON","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Bank Transfer","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"rahul@igsorc.com","telephone":"9845928495","city":"Mumbai","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Cash","active":false,"vendorId":1},{"vendorNumber":"0918049938","name":"I G SOURCE PVT LTD","region":"HR","district":null,"postalCode":"122001","email":"mohul@igsorc.com","telephone":"9845928497","city":"GURGAON","gst":"06AAGCI4336J1ZI","taxNumber":"AAGCI4336J","chargeMechanism":null,"cinNumber":null,"createdOn":"2024-02-23 13:18:59.14","address":"47P FIRST FLOOR SECTOR 40    GURGAON 122001","vendorAccountGroup":"ZN17","customerCode":null,"companyCode":"IN10","paymentTerm":"ZN55","paymentTermDesc":"100 % payment within 30 days","paymentMethod":"T","paymentMethodDesc":"Cash","active":false,"vendorId":1}];
    this.commonService.spinner.show();

    let url = `getVendorList`;
    // this.commonService.getVendorsList().subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success' && res['data'].length>0){
        // res['data'].map((item:any)=>{
          this.apivendorsList = res['data'];
          // this.vendorsList = res['data'];
          // res['data'].map((item:any)=>{
          this.tableData = [];
          // this.vendorsList.map((item:any)=>{
          this.apivendorsList.map((item:any)=>{
            this.tableData.push({
              vendorNumber: item['vendorNumber'],
              name: item['name'],
              email: item['email'],
              telephone: item['telephone'],
              company: item['companyCode']=='IN10'?'ACC':item['companyCode']=='IN20'?'Ambuja':item['companyCode'],
            })
          })

          // this.totalItems = this.vendorsList.length;
          this.totalItems = this.apivendorsList.length;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
          this.updateVisiblePages()
          this.updatePagedData();
        // })
      }else{
        this.vendorsList = [];
        this.vendorExist = 'No Vendor Found.'
      }
    },err=>{
      console.log(err);

    })
  }

  deactivateVendor(event:any, json:any){
    console.log('deactivateVendor', event.target.checked);
    let checked = event.target.checked;

    json = this.apivendorsList.find((item:any)=>{
      return item['vendorNumber'] == json['vendorNumber']
    })
    json.active = checked;
    this.commonService.spinner.show();
    let url = `setVendorDetails`;
    // this.commonService.setVendorDetails(json).subscribe((res:any)=>{
    this.commonService.dataPost(url, json).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success'){
        this.successToast = true;
        this.toastMsg = 'Records have been updated successfully';
        setTimeout(() => {
          this.successToast = false;
        }, 3000);
        this.getVendorsList();
      }else{
        this.errorToast = true;
        this.toastMsg = 'Something went wrong';
        setTimeout(() => {
          this.errorToast = false;
        }, 3000);
      }
    },err=>{
      console.log(err);
      this.errorToast = true;
      this.toastMsg = err.error.message;
      setTimeout(() => {
        this.errorToast = false;
      }, 3000);
    })
  }

  /* common */
  searchList(event:any){
    console.log('searchList');

    this.currentPage = 1;
    let searchText = event.target.value;
    // this.vendorsList = this.apivendorsList;

    this.tableData = [];
    this.pagedData = [];
    // this.vendorsList.map((item:any)=>{
    this.apivendorsList.map((item:any)=>{
      this.tableData.push({
        vendorNumber: item['vendorNumber'],
        name: item['name'],
        email: item['email'],
        telephone: item['telephone'],
        company: item['companyCode']=='IN10'?'ACC':item['companyCode']=='IN20'?'Ambuja':item['companyCode'],
      })
    })

    let table :any= [];
    this.tableData.map((item:any)=>{
      if(Object.values(item).toString().toLowerCase().includes(searchText.toLowerCase())){
        table.push(item)
      }
    })
    this.pagedData = table;
    this.tableData = table;

    this.totalItems = this.tableData.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages();
    this.pagedData = this.tableData ? this.tableData.slice(this.startIndex, this.endIndex) : [];
  }

  exportToExcel(){
    console.log('exportToExcel');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('datatable'));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    const allData = this.tableData;
    const allDataWs: XLSX.WorkSheet = XLSX.utils.json_to_sheet(allData);

    XLSX.utils.book_append_sheet(wb, allDataWs, 'Sheet1');
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Format date and create filename
    // let date = formatDate(new Date(), 'yyyy-MM-dd-hh-mm-ss', 'en');
    let filename = "VendorsList.xlsx";

    // Save the workbook to a file
    XLSX.writeFile(wb, filename);
  }

  /* Table */
  updatePagedData(): void {
    this.pagedData = [];
    this.pagedData = this.tableData ? this.tableData.slice(this.startIndex, this.endIndex) : [];
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

  get serialNumberStart(): number {
    return this.startIndex + 1;
  }

  /* Upload Excel -Start */
  downLoadTemplate() {
    this.commonService.getExcelFile('assets/excel/VendorDetails.xlsx').subscribe((excelBlob: Blob) => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(excelBlob);
      link.download = 'Add Vendor.xlsx';
      link.click();
    });
  }

  public uploader: FileUploader = new FileUploader({
    url: 'http://localhost:4000/upload',
    itemAlias: 'file'
  });

  uploadFile() {
    console.log('uploadFile');

    if(this.selectedFile && this.selectedValue != 0) {
      this.isLoader = true
      let url = `/api/fileUpload/vendorBulkUpload?pi_operation=I&pi_entity=VendorDetails&pi_user=${this.username}`;

      this.vendorUploadStatus = [];
      this.commonService.uploadFile(url, this.selectedFile).subscribe(response => {
        console.log(response);
        if (response['status'] == 'Success') {
          // this.vendorUploadStatus = response['data'];
          response['data'].map((item:any)=>{
            // if(item['message'] != 'Vendor Added Successfully' || item['message'] != 'Vendor Activated Successfully'){
            if(!item['message'].includes('Successfully')){
                this.vendorUploadStatus.push(item);
            }
          })
          if(this.vendorUploadStatus.length>0){
            document.getElementById('vendorStatusModalButton')?.click();
          }
          this.uploader.clearQueue();
          this.fileInput.nativeElement.value = null;
          this.isLoader = false;
          this.successToast = true;
          this.toastMsg = 'Vendor added successfully';
          this.closeModal('UploadModal');
          this.getVendorsList();
          setTimeout(() => {
            this.successToast = false;
          }, 3000);
        }
      },error => {
        console.log('Error uploading file:', error);
        this.errorMsg = error.error.message ? 'Error uploading file : ' + error.error.message : 'Error : File can not uploaded!';
        if(error.error.exception){

          let arr :any = [];
          for (const property in error.error.exception) {
            console.log(`${property}: ${error.error.exception[property]}`);
            arr.push(`${property}: ${error.error.exception[property]}`)
          }
          this.ExceptionErrorMsg = arr;
        }else{
          this.ExceptionErrorMsg = [];
        }
        // this.ExceptionErrorMsg = error.error.exception ? error.error.exception : []
        this.isLoader = false;
      });
    } else {
      console.warn('No file selected.');
      this.errorMsg = 'No file selected.'
    }
  }

  public hasBaseDropZoneOver: boolean = false;
  public mimeType: string = '';

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  public onFileSelected(event: any) {
    const file: File = event[0];
    this.selectedFile = event[0];

    // console.log(this.selectedFile);

    this.errorMsg = '';
    this.ExceptionErrorMsg = [];

    // readBase64(file)
    //   .then(function (data) {
    //     console.log(data);
    //   })

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

  cancelData(){
    this.uploader.clearQueue();
    this.fileInput.nativeElement.value = null;
  }

  /* Upload Excel -End */
}
