import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CommonService } from 'src/app/services/common.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-master-ad-table',
  templateUrl: './master-ad-table.component.html',
  styleUrls: ['./master-ad-table.component.scss']
})
export class MasterAdTableComponent implements OnChanges {
   @Input() filterAppliedState: boolean = false;
  @Output() filterAppliedStateChange = new EventEmitter<boolean>();
  @ViewChild('htmlData') htmlData!: ElementRef;
  @Input() isTableTile: boolean = false;
  @Input() isTableFilter: boolean = false;
  @Input() isSearchShow: boolean = false;
  @Input() isNoDataContent: boolean = false;
  @Input() tableData: any[] = [];
  @Input() excelExportData: any[] = [];
  @Input() searchObject: any[] = [];
  @Input() modalElementId: string = '';
  @Input() searchModal: string = '';
  @Input() loginType: string = '';
  @Input('tableTitle') tableTitle: any;
  @Input() fiFields: any[] = [];
  @Input() showHistory: any;
  @Input() showAction: any = true;
  @Input() inactiveRowCondition: string = '';
  @Input() totalItemsInput: number = 0; // <-- Add this line
  @Input() currentPage: number = 1; // <-- Add this line
  @Input() originalData: any[] = []; // <-- Add this line
  @Input() filteredTable: any[] = [];

  @Output() searchParamObj = new EventEmitter<any>();
  @Output() editId = new EventEmitter<any>();
  @Output() historyItemID = new EventEmitter<any>();
  @Output() deleteConfirmed = new EventEmitter();
  @Output() activateTab = new EventEmitter();
  @Output() excelDownload = new EventEmitter();
  @Output() goToEditing = new EventEmitter<number>();
  @Output() editItem = new EventEmitter<any>();
  @Output() editNavigate = new EventEmitter<any>();
  @Output() editInline = new EventEmitter<any>();
  @Output() retryService = new EventEmitter();
  @Output() pageChange = new EventEmitter<number>();
  // @Output() goToEditing = new EventEmitter<number>();
  dynamicSearchForm!: FormGroup;
  columnForm!: FormGroup;
  sapStatus: any = {};
  sesData: any = {};
  isFilterApplied: boolean = false;
  public data: any[] = [];
  pagedData:any[]=[];
  totalPages: number = 0;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  deleteItemId: number = 0;
  visiblePages: number[] = [];
  searchText: any = '';
  searchList: any = [];
  trackData: any[] = [];
  roleName: any = '';
  roleType: any = '';
  userdata: any = '';
  isLoader: boolean = false;
  displayedColumns: string[] = [];
  displayedColumns_constant: string[] = [];
  columnDataTypes: string[] = [];
  pages: number[] = [];
  shownorecord: boolean = false;

  // private originalData: any[] = [];
  constructor(
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private route: Router,
    private commonService: CommonService
  ) {
    this.userdata = localStorage.getItem('userdata') ? JSON.parse(localStorage.getItem('userdata') || '') : '';
    
  }

  NavigateToedit(item: any) {
    this.route.navigate(['/All-Master/add-bill'], { queryParams: { Id: item.MappingId_hide } });
  }
  NavigateToVendoredit(item: any) {
    this.route.navigate(['/All-Master/all-master-data'], { queryParams: { Id: item.VendorId_hide } })
  }
  //   onEdit(row: any) {
  //   this.goToEditing.emit(row.frateId);
  // }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.tableData,"ngonchange");

    this.isLoader = true;
    this.roleName = localStorage.getItem('roleName') ? localStorage.getItem('roleName') : ''
    this.searchText = '';
    const outputObject = this.searchObject.reduce((acc, curr) => {
      acc[curr.forContrl] = "";
      return acc;
    }, {});
        if (changes['tableData'] && this.tableData) {
      // Store the complete original data
      // this.originalData = [...this.tableData];
    }

    if (this.tableData?.length) {
      if (this.tableTitle === 'FI Data' && Array.isArray((this as any).fiFields)) {
        const fiFields = (this as any).fiFields;
        this.displayedColumns = fiFields.map((f: any) => f.key).filter(
          (col: string) => col !== 'MappingId_hide' && col !== 'VendorId_hide'
        ).filter((col: string) => Object.keys(this.tableData[0]).includes(col));
        Object.keys(this.tableData[0]).forEach((col: string) => {
          if (!this.displayedColumns.includes(col) && col !== 'MappingId_hide' && col !== 'VendorId_hide') {
            this.displayedColumns.push(col);
          }
        });
      } else {
        this.displayedColumns = Object.keys(this.tableData[0]).filter(
          (col: string) => col !== 'MappingId_hide' && col !== 'VendorId_hide'
        );
      }
    }
    this.dynamicSearchForm = this.fb.group(outputObject);
    this.fillTableData(this.tableData);
    // Use totalItemsInput for totalItems
    this.totalItems = this.totalItemsInput;
    this.isLoader = false;
  }
  onEditClickedNavigate(item: any) {
    this.editNavigate.emit(item);
  }
  onEditClickedInline(item: any) {
    this.editInline.emit(item);
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

  fillTableData(_data: any) {

    this.isLoader = true;
    if (!_data || _data.length === 0) {
      this.data = [];
      this.isNoDataContent = true;
      if (this.tableTitle === 'FI Data' && this.fiFields && Array.isArray(this.fiFields) && this.fiFields.length > 0) {
        this.displayedColumns_constant = this.fiFields.map((f: any) => f.key);
        this.displayedColumns = [...this.displayedColumns_constant];
      }
    } else {
      this.data = _data;
      this.isNoDataContent = false;
      if (this.tableTitle === 'FI Data' && this.fiFields && Array.isArray(this.fiFields) && this.fiFields.length > 0) {
        this.displayedColumns_constant = this.fiFields.map((f: any) => f.key);
        this.displayedColumns = [...this.displayedColumns_constant];
      } else if (this.tableData.length > 0 && this.tableData[0]) {
        this.displayedColumns_constant = Object.keys(this.tableData[0]).filter(
          col => !col.endsWith('_hide') && col !== 'History'
        );
        this.displayedColumns = [...this.displayedColumns_constant];
      }
    }
    if (this.data?.[0]?.['AAA Rate'] == '') {
        this.shownorecord = true;
    }
    if (this.data.length > 0) {
    this.displayedColumns_constant = Object.keys(this.data[0]).filter(
      col => !col.endsWith('_hide') && col !== 'History'
    );
    this.displayedColumns = [...this.displayedColumns_constant];
  }
    let savedColumnSetting = localStorage.getItem('columnSetting' + this.searchModal);
    if (savedColumnSetting) {
      this.displayedColumns = JSON.parse(savedColumnSetting);
    } else {
      this.displayedColumns = this.displayedColumns_constant;
    }
    const formControls: any = {};
    this.displayedColumns_constant.forEach((column: any) => {
      formControls[column] = new FormControl(true);
    });
    let savedColumnCheck = localStorage.getItem('columnCheck' + this.searchModal);
    if (savedColumnCheck) {
      this.columnForm = this.fb.group(JSON.parse(savedColumnCheck));
    } else {
      this.columnForm = this.fb.group(formControls);
    }
    this.apply_ColumnDatatype();

      if (this.searchText && this.searchText.trim() !== '') {
    this.totalItems = this.data.length;
  } else {
    this.totalItems = this.totalItemsInput;
  }
    // Use totalItemsInput for totalItems
  this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  this.updateVisiblePages();

  this.apply_ColumnDatatype();
  this.isLoader = false;
  }
updateVisiblePages() {
  const range = 2;
  let start = Math.max(1, this.currentPage - range);
  let end = Math.min(this.totalPages, this.currentPage + range);
  this.visiblePages = [];
  for (let i = start; i <= end; i++) {
    this.visiblePages.push(i);
  }
}

goToPage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  this.updateVisiblePages();
  this.updatePagedData();

  // this.pageChange.emit(this.currentPage);
}

  apply_ColumnDatatype() {
    if (this.data.length > 0) {
      const firstItem = this.data[0];
      this.columnDataTypes = [];
      this.displayedColumns.forEach((column: any) => {
        const value = firstItem[column];
        if (typeof value === 'string') {
          this.columnDataTypes.push('string');
        } else if (typeof value === 'number') {
          this.columnDataTypes.push('number');
        } else {
          this.columnDataTypes.push('default');
        }
      });
    }
  }
  applySearch() {
    this.isLoader = true;
    this.currentPage = 1;
    // Always set isFilterApplied to true, regardless of filter content
    this.isFilterApplied = true;
    this.filterAppliedStateChange.emit(true);
    this.cdRef.detectChanges(); // Force UI update after modal closes
    const rawFilters = this.dynamicSearchForm.value;
    const filterJson: any = {};
    const fiDataKeyMap: { [key: string]: string } = {
      'ALL_FIMappingId': 'allFimappingId',
      'Business': 'business',
      'BusinessArea': 'businessarea',
      'CGST_PRCNTG': 'cgstPrcntg',
      'Company_GSTIN': 'companyGstin',
      'CostCenter_ALL': 'costcenterAll',
      'CreatedBy': 'createdBy',
      'CreatedDate': 'createdDate',
      'CustomerCode': 'customerCode',
      'CustomerCode1': 'customercode1',
      'GLAccount': 'glaccount',
      'IGST_PRCNTG': 'igstPrcntg',
      'IsActive': 'isActive',
      'PARTY_GSTIN_Number': 'partyGstinNumber',
      'PLANT_CD': 'plantCode',
      'Plant_location': 'plantLocation',
      'PlantCode_AAA': 'plantcodeAaa',
      'PlantCode_ALL': 'plantcodeAll',
      'ProfitCenter': 'profitcenter',
      'ProfitCenter_ALL': 'profitcenterAll',
      'SAC_CODE': 'sacCode',
      'SAP_COMPANY_CODE': 'sapCompanyCode',
      'SAP_STATE_CODE': 'sapStateCode',
      'SAP_TCODE': 'sapTcode',
      'SAP_TRANSACTION_CODE': 'sapTransactionCode',
      'SENDING_APPLICATION_NAME': 'sendingApplicationName',
      'SERVICE_CODE': 'serviceCode',
      'SGST_PRCNTG': 'sgstPrcntg',
      'TaxCode': 'taxcode',
      'updatedBy': 'updatedBy',
      'updatedDate': 'updatedDate',
    };
    for (const key in rawFilters) {
      if (!rawFilters.hasOwnProperty(key)) continue;
      let mappedKey = key;
      if (this.tableTitle === 'FI Data' && fiDataKeyMap[key]) {
        mappedKey = fiDataKeyMap[key];
      }
      let val = rawFilters[key];
      let arr: any[] = [];
      if (typeof val === 'string' && val.includes(',')) {
        arr = val.split(',').map(v => v.trim()).filter(v => v !== '');
        arr = arr.map(v => v.toString());
      } else if (Array.isArray(val)) {
        arr = val.map(v => v != null ? v.toString() : '');
      } else if (val !== '' && val !== null && val !== undefined) {
        arr = [val.toString()];
      }
      if (arr.length > 0) {
        filterJson[mappedKey] = arr;
      }
    }
    let passParam = {
      "pi_filterjson": filterJson,
    };
    this.searchParamObj.emit(passParam);


    // this.isFilterApplied = true; // Already set at the top
    this.isLoader = false;

    // this.visiblePages = [];
    // console.log(this.visiblePages,"vp");
    // this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    // this.updateVisiblePages();
    // this.updatePagedData();

  }




  applySetting() {
    let columnSetting = this.columnForm.value;
    this.displayedColumns = Object.keys(columnSetting).filter(key => columnSetting[key]);
    localStorage.setItem('columnSetting' + this.searchModal, JSON.stringify(this.displayedColumns));
    localStorage.setItem('columnCheck' + this.searchModal, JSON.stringify(columnSetting));
    this.apply_ColumnDatatype()
  }
//   setPagedData() {
//   const start = (this.currentPage - 1) * this.itemsPerPage;
//   const end = start + this.itemsPerPage;
//   this.pagedData = this.data.slice(start, end);
// }
applyFilter(_event: any) {
  // this.searchObject=[];
  this.isLoader = true;
  this.currentPage = 1;
  let searchText = this.searchText;

  if (!searchText || searchText.trim() === '') {
    // If search is empty, restore original data
    this.resetSearch();
      this.currentPage = 1;

    return;
  }

  // let filteredTable: any[] = [];
  // console.log(this.tableData)
  // Search in the complete original data, not just current page data
  this.filteredTable=[];
  this.originalData.forEach((item: any) => {
    if (Object.values(item).toString().toLowerCase().includes(searchText.toLowerCase())) {
      this.filteredTable.push(item);
    }
  });


  this.data = this.filteredTable; // Update the displayed data
  this.totalItems = this.filteredTable.length;
  console.log(this.totalItems,"total");

  this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

  this.updateVisiblePages();
      this.data = this.filteredTable ? this.filteredTable.slice(this.startIndex, this.endIndex) : [];

  this.updatePagedData();

  this.isLoader = false;
}

resetSearch() {
  this.isLoader = true;
    this.searchText = '';

    this.currentPage = 1;
    // Always set isFilterApplied to true, regardless of filter content
    this.isFilterApplied = true;
    this.filterAppliedStateChange.emit(true);
    this.cdRef.detectChanges(); // Force UI update after modal closes
    const rawFilters = this.dynamicSearchForm.value;
    const filterJson: any = {};
    const fiDataKeyMap: { [key: string]: string } = {
      'ALL_FIMappingId': 'allFimappingId',
      'Business': 'business',
      'BusinessArea': 'businessarea',
      'CGST_PRCNTG': 'cgstPrcntg',
      'Company_GSTIN': 'companyGstin',
      'CostCenter_ALL': 'costcenterAll',
      'CreatedBy': 'createdBy',
      'CreatedDate': 'createdDate',
      'CustomerCode': 'customerCode',
      'CustomerCode1': 'customercode1',
      'GLAccount': 'glaccount',
      'IGST_PRCNTG': 'igstPrcntg',
      'IsActive': 'isActive',
      'PARTY_GSTIN_Number': 'partyGstinNumber',
      'PLANT_CD': 'plantCode',
      'Plant_location': 'plantLocation',
      'PlantCode_AAA': 'plantcodeAaa',
      'PlantCode_ALL': 'plantcodeAll',
      'ProfitCenter': 'profitcenter',
      'ProfitCenter_ALL': 'profitcenterAll',
      'SAC_CODE': 'sacCode',
      'SAP_COMPANY_CODE': 'sapCompanyCode',
      'SAP_STATE_CODE': 'sapStateCode',
      'SAP_TCODE': 'sapTcode',
      'SAP_TRANSACTION_CODE': 'sapTransactionCode',
      'SENDING_APPLICATION_NAME': 'sendingApplicationName',
      'SERVICE_CODE': 'serviceCode',
      'SGST_PRCNTG': 'sgstPrcntg',
      'TaxCode': 'taxcode',
      'updatedBy': 'updatedBy',
      'updatedDate': 'updatedDate',
    };
    for (const key in rawFilters) {
      if (!rawFilters.hasOwnProperty(key)) continue;
      let mappedKey = key;
      if (this.tableTitle === 'FI Data' && fiDataKeyMap[key]) {
        mappedKey = fiDataKeyMap[key];
      }
      let val = rawFilters[key];
      let arr: any[] = [];
      if (typeof val === 'string' && val.includes(',')) {
        arr = val.split(',').map(v => v.trim()).filter(v => v !== '');
        arr = arr.map(v => v.toString());
      } else if (Array.isArray(val)) {
        arr = val.map(v => v != null ? v.toString() : '');
      } else if (val !== '' && val !== null && val !== undefined) {
        arr = [val.toString()];
      }
      if (arr.length > 0) {
        filterJson[mappedKey] = arr;
      }
    }
    let passParam = {
      "pi_filterjson": [],
    };
    this.searchParamObj.emit(passParam);

    // this.isFilterApplied = true; // Already set at the top
    this.isLoader = false;
}

  resetSetting() {
    this.isLoader = true;
    localStorage.removeItem('columnSetting' + this.searchModal);
    localStorage.removeItem('columnCheck' + this.searchModal);
    this.fillTableData(this.tableData);
    this.isLoader = false;
  }
  // Remove updatePagedData, prevPage, nextPage, goToPage, startIndex, endIndex, serialNumberStart
  // ...existing code...
  exportToExcel(): void {
    if (this.roleName == 'LogisticOfficer') {
      this.excelDownload.emit()
      return;
    }

    // console.log('excelExportData before export:', this.excelExportData);
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('datatable'));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const allData = this.excelExportData.length > 0 ? this.excelExportData : this.tableData;
    const allDataWs: XLSX.WorkSheet = XLSX.utils.json_to_sheet(allData);
    XLSX.utils.book_append_sheet(wb, allDataWs, 'Sheet1');
    let date = formatDate(new Date(), 'yyyy-MM-dd-hh-mm-ss', 'en');
    let filename = (this.route.url.includes("employee") ? "EmployeeList" : "InvoiceList") + "-" + date + ".xlsx";
    XLSX.writeFile(wb, filename);
  }
  openPDF(): void {
    let DATA: any = document.getElementById('htmlData');
    html2canvas(DATA).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('l', 'mm', 'a4');
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.table(1, 1, this.data, this.displayedColumns, { autoSize: true })
      PDF.save("invoicedetails" + formatDate(new Date(), 'yyyy-MM-dd-hh-mm-ss', 'en'));
    });
  }
  goToLinkPage(value: any) {
    this.route.navigate(['subscription/'], { queryParams: { icjNumber: value } });
  }
  goToVendorView(value: any) {
    this.commonService.viewPurchase = true;
    this.commonService.editPurchaseData = value;
    if (value['Invoice Type'] == 'Material') {
      this.commonService.routeToPage('./dashboard/material-invoice');
    } else if (value['Invoice Type'] == 'Service') {
      this.commonService.routeToPage('./dashboard/service-invoice');
    } else if (value['Invoice Type'] == 'SLA') {
      this.commonService.routeToPage('./dashboard/sla-invoice');
    } else if (value['Invoice Type'] == 'Freight-Inbound') {
      this.commonService.routeToPage('./dashboard/freight-inbound-invoice');
    } else if (value['Invoice Type'] == 'Reward') {
      this.commonService.routeToPage('./dashboard/reward-invoice');
    } else {
      this.commonService.routeToPage('./dashboard/material-invoice');
    }
  }
  goToEditNew(item: any) {

    this.goToEditing.emit(item);

  }

  // navigateToRoute(item: any) {
  //   const id = item.ID || item.id || item.Id || item.ID_hide;
  //   if (id) {
  //     this.route.navigate([this.routePath], {
  //       queryParams: { id: id },
  //     });
  //   } else {
  //     this.route.navigate([this.routePath]);
  //   }
  // }
  goToEdit(value: any, action?: any) {
    this.commonService.action = action;
    this.commonService.viewPurchase = false;
    this.commonService.updatePurchase = true;
    this.commonService.editPurchaseData = value;
    if (this.loginType == 'vendor') {
      if (value['Invoice Type'] == 'Material') {
        this.commonService.routeToPage('./dashboard/material-invoice');
      } else if (value['Invoice Type'] == 'Service') {
        this.commonService.routeToPage('./dashboard/service-invoice');
      } else if (value['Invoice Type'] == 'SLA') {
        this.commonService.routeToPage('./dashboard/sla-invoice');
      } else if (value['Invoice Type'] == 'Reward') {
        this.commonService.routeToPage('./dashboard/reward-invoice');
      } else {
        this.commonService.routeToPage('./dashboard/material-invoice');
      }
    } else if (this.loginType == 'sitecontroller' && this.roleName == 'LogisticOfficer') {
      this.editId.emit(value);
    } else if (this.loginType == 'sitecontroller' && this.roleName == 'RawMaterialIncharge') {
      this.commonService.viewPurchase = true;
      this.commonService.routeToPage('./dashboard/raw-material-incharge');
    } else {
      if (value['Invoice Type'] == 'Material') {
        this.commonService.routeToPage('./dashboard/material-incharge');
      } else if (value['Invoice Type'] == 'Service') {
        this.commonService.routeToPage('./dashboard/service-incharge');
      } else if (value['Invoice Type'] == 'SLA') {
        this.commonService.routeToPage('./dashboard/sla-incharge');
      } else if (value['Invoice Type'] == 'Reward') {
        this.commonService.routeToPage('./dashboard/reward-incharge');
      } else {
        this.commonService.routeToPage('./dashboard/material-incharge');
      }
    }
  }
  goToDelete(value: any) {
    this.deleteItemId = value['Invoice Number'];
  }
  openCustomHistoryModal(value: any) {
    this.historyItemID.emit(value);
  }
  goToViewHistory(value: any) {
    console.log(value);

    this.trackData = [];
    this.trackData.push(
      {
        "date": value['createdDate'],
        "status": "pending",
        "updatedby": value['vendorName'] ? value['vendorName'] : value['createdBy'],
        "content": value['remarks']
      },
    )
    if (value['status'] == 'accept') {
      this.trackData.push(
        {
          "date": value['updatedDate'],
          "status": value['status'],
          "updatedby": value['updatedBy'] ? value['updatedBy'] : value['createdBy'],
          "barcode": value['barCode'],
          "content": value['reviewerRemarks']
        }
      )
    } else if (value['status'] != 'pending') {
      this.trackData.push(
        {
          "date": value['updatedDate'],
          "status": value['status'],
          "updatedby": value['updatedBy'] ? value['updatedBy'] : value['createdBy'],
          "content": value['reviewerRemarks']
        }
      )
    }
    this.sapStatus = {};
    let url = `getSesUtrResDetails?invoiceNumber=${value['invoiceNumber']}`;
    this.commonService.dataGet(url).subscribe((res: any) => {
      if (res.status == 'Success' && res['data'].length > 0) {
        res['data'].map((ele: any) => {
          if (ele.sesStatus == 'S') {
            this.sesData = ele;
            this.sesData.creationDate_ = this.sesData.creationDate.toString().slice(6) + '-' + this.sesData.creationDate.toString().slice(4, -2) + '-' + this.sesData.creationDate.toString().slice(0, 4);
            this.sesData.checklistCreationTime_ = this.sesData.checklistCreationTime.toString().slice(0, 2) + ':' + this.sesData.checklistCreationTime.toString().slice(2, 4);
            this.sesData.sescreationDate_ = this.sesData.sesCreationDate.toString().slice(6) + '-' + this.sesData.sesCreationDate.toString().slice(4, -2) + '-' + this.sesData.creationDate.toString().slice(0, 4);
            this.sesData.sesCreationTime_ = this.sesData.sesCreationTime.toString().slice(0, 2) + ':' + this.sesData.sesCreationTime.toString().slice(2, 4);
            if (this.sesData.utrDate) {
              this.sesData.utrDate_ = this.sesData.utrDate.toString().slice(6) + '-' + this.sesData.utrDate.toString().slice(4, -2) + '-' + this.sesData.utrDate.toString().slice(0, 4);
            }
          }
        })
        this.sapStatus = res['data'];
      } else {
        this.sesData = {};
      }
    }, err => {
    })
  }
  confirmDelete(value: any) {
    this.deleteConfirmed.emit(value);
  }
  viewAttachment(data: any) {
    let filePath = data?.['Download Invoice'] ? data?.['Download Invoice']?.[0]['attachmentFilePath'] : data?.['Attachment']?.[0]['attachmentFilePath'];
    filePath = this.commonService.getEncryptPath(filePath);
    let url = `getBase64FromPath?filePath=${filePath}`;
    this.commonService.dataGet(url).subscribe((res: any) => {
      if (res && res['status'] == 'Success' && res['data']) {
        let link = document.createElement('a');
        link.href = `data:application/pdf;base64,${res['data']}`;
        link.download = `${data['Invoice No.'] ? data['Invoice No.'] : data['Invoice Number']}.pdf`;
        link.click();
      } else {
      }
    }, err => {
    })
  }
  viewChecklist(data: any) {
    this.commonService.spinner.show();
    let path = `D:/vendorportal-data/vendorportalFiles/${encodeURIComponent(data['Checklist'])}_checklist.pdf`;
    path = this.commonService.getEncryptPath(path);
    let url = `getBase64FromPath?filePath=${path}`;
    this.commonService.dataGet(url).subscribe((res: any) => {
      this.commonService.spinner.hide();
      if (res && res['status'] == 'Success' && res['data']) {
        let link = document.createElement('a');
        link.href = `data:application/pdf;base64,${res['data']}`;
        link.download = `checklist.pdf`;
        link.click();
      } else {
      }
    }, err => {
      this.commonService.spinner.hide();
    })
  }
  retrySES(row: any) {
    this.retryService.emit(row)
  }
  getCompactPages(): number[] {
    if (this.totalPages <= 7) return this.pages;
    const pages: number[] = [];
    pages.push(1);
    if (this.currentPage > 4) pages.push(-1); // -1 for ellipsis
    for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
      if (i > 1 && i < this.totalPages) pages.push(i);
    }
    if (this.currentPage < this.totalPages - 3) pages.push(-2); // -2 for ellipsis
    pages.push(this.totalPages);
    return pages;
  }

  updatePagedData(): void {

    if(this.data.length>0 && Object.values(this.data[0])[0] != ''){
      /* this.apiPagedData = this.data ? this.data.slice(this.startIndex, this.endIndex) : [];
      this.pagedData = this.data ? this.data.slice(this.startIndex, this.endIndex) : []; */
      if(this.filteredTable.length>0){
        this.data = this.filteredTable ? this.filteredTable.slice(this.startIndex, this.endIndex) : [];
      } else {
        this.data = this.originalData ? this.originalData.slice(this.startIndex, this.endIndex) : [];
      }
    }
    // console.log("pagedData", this.pagedData);

  }
}
