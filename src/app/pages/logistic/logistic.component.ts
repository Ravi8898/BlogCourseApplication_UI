import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-logistic',
  templateUrl: './logistic.component.html',
  styleUrls: ['./logistic.component.scss']
})
export class LogisticComponent {

  tableTitle = 'Freight Invoice';
  apitableData: any[] = [];
  tableData: any[] = [];
  tableSearchObject: any[] = [];
  url: string = '';
  
  successToast: boolean = false;
  errorToast: boolean = false;
  toastMsg: string = '';
  modalName: string = '';

  errorMsg: string = '';
  isLoader: boolean = false;
  selectedFile: File | null = null;

  role: string | null = ''
  username: string | null = ''
  searchModal: string = 'approvalModal'
  loginType:any = '';
  userdata:any = {};

  doList :any = []
  mode = 'approval';
  approveRejectValue = ''
  pdfSrc = '';
  remark = '';

  EXCEL_TYPE :any = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

  constructor(private commonService:CommonService, private router:Router){
    this.role = localStorage.getItem('role');
    this.username = localStorage.getItem('username');
    this.loginType = localStorage.getItem('logintype');
  }

  ngOnInit():void{
    this.getLogisticData();
    this.setFilterField();
  }

  setFilterField(){
    this.tableSearchObject = [
      {
        forLabel: "Invoice Number",
        forContrl: "Invoice Number",
        forPlace: "Enter Invoice Number"
      }, 
      {
        forLabel: "Invoice Date",
        forContrl: "Invoice Date",
        forPlace: "Enter PO Number"
      }, 
      {
        forLabel: "Vendor Code",
        forContrl: "Vendor Code",
        forPlace: "Enter Vendor Code"
      },
      {
        forLabel: "Vendor Name",
        forContrl: "Vendor Name",
        forPlace: "Enter Vendor Name"
      },
      {
        forLabel: "SAP Invoice Document No.",
        forContrl: "SAP Invoice Document No.",
        forPlace: "Enter SAP Invoice Document No."
      },
    ]
  }

  getLogisticData(){
    console.log('getLogisticData');
    this.commonService.spinner.show();
    this.commonService.getLogisticData().subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res && res['status']=='Success' && res['data'].length>0){
        // res['data'][0]['Invoice Status'] = 'Pending';
        this.apitableData = res['data'];
        let tableData :any = [];
        res['data'].map((item:any)=>{
          tableData.push(
            {
              'Invoice Number': item['Invoice Number'], 
              'Invoice Date': item['Invoice Date'], 
              'Vendor Code': item['Vendor Code'], 
              'Vendor Name': item['Vendor Name'], 
              'SAP Invoice Document No.': item['SAP Invoice Document No.']?item['SAP Invoice Document No.']:'-',
              'Status': item['Invoice Status']?item['Invoice Status']:''
            }
          )
        })
        this.tableData = tableData;
      }else{

      }
    },err=>{
      console.log(err);
      this.commonService.spinner.hide();
      
    })
  }

  /* Filter */
  applyTableFilter(data:any){
    console.log('applyTableFilter'); 
    
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

    this.commonService.getLogisticData().subscribe((res:any) => {
      console.log(res);
      if(res['status']=='Success' && res['data'].length>0){
        indexOfFilter.map((item:any)=>{
          res['data'] = res['data'].filter((ele:any)=>{
            if(ele[keys[item]].includes(values[item])){
              return ele;
            }
          })
        })

        this.tableData = [];
        res['data'].map((item:any)=>{
          this.tableData.push(
            {
              'Invoice Number': item['Invoice Number'], 
              'Invoice Date': item['Invoice Date'], 
              'Vendor Code': item['Vendor Code'], 
              'Vendor Name': item['Vendor Name'], 
              'SAP Invoice Document No.': item['SAP Invoice Document No.']?item['SAP Invoice Document No.']:'-',
              'Status': item['Invoice Status']?item['Invoice Status']:''
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

  /* Edit */
  getTableEditId(event:any){
    console.log('getTableEditId');
    this.mode = 'approval';
    this.doList = this.apitableData.find(item=>{
      return item['Invoice Number'] == event['Invoice Number']
    })
    if(this.doList['Invoice Status'] != ''){
      this.remark = this.doList['Remark'];
    }
    document.getElementById('approvalModalButton')?.click();
  }

  /* Delete */
  onDeleteConfirmedTable(event:any){
    console.log('onDeleteConfirmedTable');
    
  }

  viewDO(DO_data:any){
    console.log('viewDO', DO_data);
    this.mode = 'doview';
    let file = {
      // 'URL': DO_data['Doc Path']+'/'+DO_data['Doc Name']+'.'+DO_data['Doc Type']
      'Url': DO_data['Doc Path']+'/'+DO_data['Doc Name']
    }

    this.pdfSrc = '';
    this.commonService.getPDFFile(file).subscribe((res:any)=>{
      console.log(res);
      if(res && res['data']){
        let blob_data = res['data'];
        // this.pdfSrc = 'data:application/pdf;base64,' + this.staticbase64;
        // this.pdfSrc = this.staticbase64;
        this.pdfSrc = res['data']['Base64String'];
      }else{
        this.errorToast = true;
        this.toastMsg = 'PDF file not exist';
        setTimeout(()=>{
          this.errorToast = false;
        },2000);
      }      
    },err=>{
      this.errorToast = true;
      this.toastMsg = 'PDF file not exist';
      setTimeout(()=>{
        this.errorToast = false;
      },2000);
    })
  }

  viewdocument(){
    console.log('viewdocument');
    this.mode = 'doview';
    
    let file = {
      'Url': this.doList['Doc Path']+'/'+this.doList['Doc Name']
    }

    this.pdfSrc = '';
    this.commonService.getPDFFile(file).subscribe((res:any)=>{
      console.log(res);
      if(res && res['data']){
        let blob_data = res['data'];
        this.pdfSrc = res['data']['Base64String'];
      }else{
        this.errorToast = true;
        this.toastMsg = 'PDF file not exist';
        setTimeout(()=>{
          this.errorToast = false;
        },2000);
      }
    },err=>{
      this.errorToast = true;
      this.toastMsg = 'PDF file not exist';
      setTimeout(()=>{
        this.errorToast = false;
      },2000);
    })
  }

  openapproveReject(value:any){
    console.log(value);
    this.approveRejectValue = value;
    this.remark = '';
    this.mode = 'alert';
    // document.getElementById('alertModalButton')?.click();
  }

  submitapproveReject(){
    console.log('submitapproveReject');

    // document.querySelector('body')?.classList.remove('modal-open');
    if(this.remark == ''){
      return
    }

    let json = {
      "remark": this.remark,
      "docStatus": this.approveRejectValue=='approve'?'Invoice Approved':'Invoice Rejected',
      "invoiceNumber": this.doList['Invoice Number'],
      "transPorterCode": this.doList['Vendor Code']
    }

    this.commonService.spinner.show();
    this.commonService.updateVsandEpStatus(json).subscribe((res:any)=>{
      console.log(res);
      this.commonService.spinner.hide();
      if(res.status=='Success'){
        this.getLogisticData();
        this.successToast = true;
        this.toastMsg = 'Records saved successfully';
        this.remark = '';
        this.openModal('approval');
        setTimeout(() => {
          // this.closeModal();
          document.getElementById('closeModalButton')?.click();
        }, 0);
        setTimeout(()=>{
          this.successToast = false;
        },2000);
      }else{
        this.errorToast = true;
        this.toastMsg = 'Failed';
        setTimeout(()=>{
          this.errorToast = false;
        },2000)
      }
    },err=>{
      this.commonService.spinner.hide();
      this.errorToast = true;
      this.toastMsg = 'Failed';
      setTimeout(()=>{
        this.errorToast = false;
      },2000)
    })
  }

  closeapproveReject(){
    console.log('closeapproveReject');
    this.openModal('approval');
  }

  closeModal(){
    let modal = document.getElementById('approvalModal');
    let closeModal = document.getElementById('closeModalButton');
    if(closeModal){
      closeModal.click();
    }
    return;
    if(modal){
      // modal.style.display = 'none';
    }
    document.getElementById('approveModal')?.classList.remove('show');
    document.getElementById('approveModal')?.classList.remove('fade');
    document.querySelector('.modal-backdrop')?.classList.remove('modal-backdrop');
  }

  openModal(modal:any){
    console.log('openModal', modal);
    this.mode = modal;
  }


  /* Download */
  ExportToExcel(): void {  
    let json:any = [];
    this.apitableData.map(item=>{
      item['Action'].map((ele:any)=>{
        json.push(
          {
            'Invoice Number' : item['Invoice Number'],
            'Invoice Date' : item['Invoice Date'],
            'Delivery No.' : ele['Do No'],
            'LR No.': ele['LR No'],
            'SAP Invoice Document No.' : item['SAP Invoice Document No.']?item['SAP Invoice Document No.']:'-',
            'Vendor Code' : item['Vendor Code'],
            'Vendor Name' : item['Vendor Name'],
            'Plant' : ele['Plant'],
            'Destination' : ele['Destination'],
            'Ship to party' : ele['Ship to Party'],
            'PGI Date' : ele['Pgi Date'],
          }
        )
      })
    });
    let excelfileName = "freight_list_";
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);  
    const workbook: XLSX.WorkBook = { Sheets : {'data':worksheet}, SheetNames:['data'] };  
    const excelBuffer: any = XLSX.write(workbook, {bookType: 'xlsx', type:'array'});
    this.saveAsExcelFile(excelBuffer, excelfileName);
  }  

  saveAsExcelFile(buffer:any, fileName:string): void{
    const data: Blob = new Blob([buffer], {type: this.EXCEL_TYPE});
    FileSaver.saveAs(data, fileName  + new Date().getTime() + '.xlsx');
  }
}
