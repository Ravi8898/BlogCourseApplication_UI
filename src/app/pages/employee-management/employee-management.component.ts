import { Component, ElementRef, ViewChild } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { CommonService } from 'src/app/services/common.service';
const URL = '/api/';

@Component({
  selector: 'app-employee-management',
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.scss']
})

export class EmployeeManagementComponent {

  activeTab = 'on';
  username :any = '';
  isLoader = false;
  errorToast:any = false;
  successToast:any = false;
  toastMsg:any = '';
  selectedFile: File | null = null;
  selectedValue: number = 1;
  employeeUploadStatus :any = [];
  errorMsg: string = '';
  ExceptionErrorMsg: any[] = [];

  employeeList :any = [];
  employeeSearchObject :any = {};
  modalName = 'employeeModal';
  loginType :any = '';

  @ViewChild('fileInput') 'fileInput' :ElementRef;

  constructor(private commonService:CommonService){
    this.username = localStorage.getItem('username');
    this.loginType = localStorage.getItem('logintype');
  }

  ngOnInit():void {
    this.searchObject();
    this.getEmployeesList();
  }
  
  searchObject(){
    this.employeeSearchObject = [
      {
        forLabel: "Employee Code",
        forContrl: "employeeCode",
        forPlace: "Enter Employee Code"
      }, 
      {
        forLabel: "Employee Name",
        forContrl: "employeeName",
        forPlace: "Enter Employee Name"
      }, 
      {
        forLabel: "Email",
        forContrl: "email",
        forPlace: "Enter Email"
      }, 
      {
        forLabel: "Role",
        forContrl: "roleName",
        forPlace: "Enter Role"
      },
      {
        forLabel: "Plant Name",
        forContrl: "plantName",
        forPlace: "Enter Plant Name"
      },
    ]
  }

  getEmployeesList(){
    console.log('getEmployeesList');
    
    let url = `getEmployeeList`;
    // this.commonService.getEmployeesList().subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      if(res.status == 'Success' && res['data'] && res['data'].length>0){
        let employeeList :any = [];
        res['data'].map((item:any)=>{
          employeeList.push(
            {
              'Employee Code': item['employeeCode'], 
              'Employee Name': item['employeeName'],
              'Email': item['email'],
              'Role': item['roleName'],
              'Plant Name': item['plantName'],
              'Plant Code': item['plantCode'],
            }
          )
        })
        this.employeeList = employeeList;
      }
    },err=>{
      console.log(err);
      
    })
  }

  changeTab(tab:any){

  }

  applyEmployeeSearch(data:any){
    console.log('applyEmployeeSearch');
    
    if(data['pi_filterjson']['companyCode']){
      data['pi_filterjson']['companyCode'] = data['pi_filterjson']['companyCode'] == 'Ambuja'?'IN20':'IN10';
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

    let url = `getEmployeeList`;
    // this.commonService.getEmployeesList().subscribe((res:any)=>{
    this.commonService.dataGet(url).subscribe((res:any)=>{
      console.log(res);
      if(res['status']=='Success' && res['data'].length>0){

        indexOfFilter.map((item:any)=>{
          res['data'] = res['data'].filter((ele:any)=>{
            if(ele[keys[item]].includes(values[item])){
              return ele;
            }
          })
        })

        this.employeeList = [];
        res['data'].map((item:any)=>{
          this.employeeList.push(
            {
              'Employee Code': item['employeeCode'], 
              'Employee Name': item['employeeName'],
              'Email': item['email'],
              'Role': item['roleName'],
              'Plant Name': item['plantName'],
              'Plant Code': item['plantCode'],
            }
          )
        })
      }
        this.isLoader = false
      },err => {
        this.isLoader = false
        console.log('Error fetching:', err);
      }
    );
  }

  onDeleteConfirmedEmployee(event:any){
    console.log('onDeleteConfirmedEmployee');
  }

  /* Upload Excel -Start */
  downLoadTemplate() {
    this.commonService.getExcelFile('assets/excel/EmployeeDetails.xlsx').subscribe((excelBlob: Blob) => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(excelBlob);
      link.download = 'Add Employee.xlsx';
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
      let url = `/api/fileUpload/employeeBulkUpload?pi_operation=I&pi_entity=EmployeeDetails&pi_user=${this.username}`;

      this.employeeUploadStatus = [];
      this.commonService.uploadFile(url, this.selectedFile).subscribe(response => {
        console.log(response);
        if (response['status'] == 'Success') {
          // this.employeeUploadStatus = response['data'];
          response['data'].map((item:any)=>{
            // if(item['message'] != 'Vendor Added Successfully' || item['message'] != 'Vendor Activated Successfully'){
            if(!item['message'].includes('Successfully')){
              this.employeeUploadStatus.push(item);
            }
          })
          if(this.employeeUploadStatus.length>0){
            document.getElementById('vendorStatusModalButton')?.click();
          }
          this.uploader.clearQueue();
          this.fileInput.nativeElement.value = null;
          this.isLoader = false;
          this.successToast = true;
          this.toastMsg = 'Employee added successfully';
          this.getEmployeesList();
          this.closeModal('UploadModal');
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
