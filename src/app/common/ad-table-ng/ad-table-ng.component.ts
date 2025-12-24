



import { formatDate } from '@angular/common';
import { FileUploader } from 'ng2-file-upload';
import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { CommonService } from 'src/app/services/common.service';
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
  selector: 'app-ad-table-ng',
  templateUrl: './ad-table-ng.component.html',
  styleUrls: ['./ad-table-ng.component.scss']
})
export class AdTableNgComponent {
  @ViewChildren('tooltipTrigger') tooltipTriggers!: QueryList<ElementRef>;

  @Input() tableData: any[] = [];
  @Input() columns: any[] = [];

  @Input() tableId: string = ''
  @Input() title: string = ''
  @Input() pageName: string = ''

  @Output() deleteConfirmed = new EventEmitter();
  @Output() goToEditing = new EventEmitter<any>();
  @Output() goToDocument = new EventEmitter<any>();
  @Output() checkedValues = new EventEmitter<any>();
  @Output() goToViewPage = new EventEmitter<any>();
  @Output() goToInvoiceAction = new EventEmitter<any>();
  @Input() resetSelection: boolean = false;

  @Output() iconClick = new EventEmitter<{ columnName: string, rowData: any }>();

  excelTableData: any[] = [];
  filterTableData: any[] = [];
  totalItems: number = 0;
  pages: number[] = [];
  jumpPage: number = 1
  deleteItem: any;

  dynamicSearchForm: any;
  settingColumnForm: any;
  dynamicSearchValues: any;

  searchGroupItem: any[] = []
  displayedColumns: string[] = [];
  displayedColumns_constant: string[] = [];

  isViewModalOpen: boolean = false;
  isHistoryModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isInvoiceModalOpen: boolean = false;
  isViewInvoiceModal: boolean = false;

  isAddMode: boolean = true;

  selectedInvoice: any;

  artworkDocumentName: string = ''
  optionArtworkDate: any[] = []
  selectedArtworkDate: string = ''

  pdfForm!: FormGroup;

  fileType: any = '';
  selectedFile: any;
  isLoader: boolean = false;
  documentNameM: string = '';
  documentPathM: string = '';
  ExceptionErrorMsg: string = '';
  fileErrorMsg: string = '';
  errorMsg: string = '';
  pdfbash64: any = '';
  pdfbash64_I: any = '';
  // username: string | null;
  spinner: boolean = false;
  pdfUrl: string = '';
  pdfUrl_I: string = '';

  showValidationModal: boolean = false;
  validationMessage: string = '';
  loaderVisible: boolean = false;
  isEmployeeRole: boolean = false;

  roletype: string | null = ''
  role: string | null = ''
  searchText: string = ''
  roleName: string = '';

  // public hasBaseDropZoneOver: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private commonService: CommonService,

  ) {

  }

  ngOnInit() {
    this.roleName = localStorage.getItem('roleName') || '';
    this.roletype = localStorage.getItem('logintype') || '';
    // Load dynamic form
    this.loadDynamicSearchForm();

  }



  ngOnChanges() {
    // console.log('this.selectedItems', this.tableData);
    this.currentPage = 1
    this.selectedItems = []
    this.searchGroupItem = []
    this.filterTableData = []
    this.searchText = ''

    this.loadDynamicSearchForm();

    this.excelTableData = this.tableData
    this.totalItems = this.tableData ? this.tableData.length : 0;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    this.updateVisiblePages()
    this.updatePagedData();

    let savedColumnSetting = localStorage.getItem('columnSetting_' + this.router.url + '_' + this.title);
    if (savedColumnSetting) {
      this.columns = JSON.parse(savedColumnSetting)
    }

    // for column setting
    const formControls: any = {};
    this.columns.forEach(column => {
      formControls[column?.name] = new FormControl(!column.hide_col); // Default all columns to visible
    });
    this.settingColumnForm = this.fb.group(formControls);

    // this.displayedColumns_constant = Object.keys(this.data[0] ? this.data[0] : {}) // Assign value for column hide and show    

    // console.log("check checked", this.pagedData);



  }



  getKeys(item: { [key: string]: string }): string[] {
    return Object.keys(item);
  }

  loadDynamicSearchForm(): void {
    const outputObject = this.columns.reduce((acc, curr) => {
      acc[curr.name] = "";
      return acc;
    }, {});

    this.dynamicSearchForm = this.fb.group(outputObject)

  }




  toggleColumnVisibility(columnName: string) {

    const column = this.columns.find(col => col.name === columnName);
    if (column) {
      column.col_expand == 'out' ? column.col_expand = 'in' : column.col_expand = 'out'
    }
    // console.log('column name', column);

    const values = this.columns.filter(col => col.groupOf === columnName);

    // console.log('column name', values);

    values.forEach(item => {
      item.hide_col = !item.hide_col;
    });

  }

  goToEdit(value: any) {
    this.goToEditing.emit(value);
    // console.log(value);
  }
  goToInvoiceActionPage(value:any){
    this.goToInvoiceAction.emit(value);
  }

  goToView(value: any) {
    this.goToViewPage.emit(value);
  }
  goToDoc(value: any) {
    this.goToDocument.emit(value);
    // console.log(value);
  }

  goToDelete(value: any) {
    this.deleteItem = value;
    // console.log('goToDelete',value);
  }


  searchList(event: any) {

    let searchText = event.target.value.toLowerCase();
    // console.log('searchList', searchText);

    this.searchGroupItem = []
    this.currentPage = 1

    let table: any[] = [];

    this.tableData.map((item: any) => {
      if (Object.values(item).toString().toLowerCase().includes(searchText.toLowerCase())) {
        table.push(item)
      }
    })

    this.filterTableData = table
    // console.log('table ',table);

    // const groupedData = table.reduce((acc, curr) => {
    //   const poNumber = curr["ID"];
    //   if (!acc[poNumber]) {
    //     acc[poNumber] = { collapsed: false, data: [] };
    //   }
    //   acc[poNumber].data.push(curr);
    //   return acc;
    // }, {});

    // this.pagedData = Object.keys(groupedData).map(key => ({
    //   ...groupedData[key],
    //   collapsed: groupedData[key].data.length > 1
    // }));

    this.excelTableData = this.filterTableData
    let tableData = this.filterTableData ? this.filterTableData.slice(this.startIndex, this.endIndex) : [];
    this.pagedData = tableData;

    this.totalItems = searchText.trim() ? this.filterTableData.length : this.tableData.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages()
  }

  exportToExcel(): void {

    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('datatable'));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Assuming you have a function to get all data (including paginated data) from your source
    // const allData = this.excelTableData.length > 0 ? this.excelTableData : this.tableData;
    // const allData = this.excelTableData

    // Get the filtered columns based on the hide_col property
    const visibleColumns = this.columns.filter(column => !column.hide_col).map(column => column.name);

    // Transform the data to include only the visible columns
    const allData = this.excelTableData.map(row => {
      const filteredRow: any = {};
      visibleColumns.forEach(column => {
        filteredRow[column] = row[column];
      });
      return filteredRow;
    });

    // Convert all data to worksheet
    const allDataWs: XLSX.WorkSheet = XLSX.utils.json_to_sheet(allData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, allDataWs, 'Sheet1');

    // Format date and create filename
    let date = formatDate(new Date(), 'yyyy-MM-dd-hh-mm-ss', 'en');
    let filename = this.title + "-" + date + ".xlsx";

    // Save the workbook to a file
    XLSX.writeFile(wb, filename);

  }

  // Start Pagination

  totalPages: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  public pagedData: any[] = [];
  visiblePages: number[] = [];

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return this.currentPage * this.itemsPerPage;
  }

  get serialNumberStart(): number {
    return this.startIndex + 1;
  }

  updatePagedData(): void {
    // this.pagedData = this.tableData ? this.tableData.slice(this.startIndex, this.endIndex) : [];
    let tableData = []
    // console.log('this.filterTableData', this.filterTableData);

    if (this.filterTableData.length > 0) {
      tableData = this.filterTableData ? this.filterTableData.slice(this.startIndex, this.endIndex) : [];
    } else {
      tableData = this.tableData ? this.tableData.slice(this.startIndex, this.endIndex) : [];

    }


    // const groupedData = tableData
    //   .reduce((acc, curr) => {
    //     const poNumber = 0;
    //     if (!acc[poNumber]) {
    //       acc[poNumber ] = { collapsed: false, data: [] };
    //     }

    //     acc[poNumber].data.push(curr);
    //     return acc;
    //   }, {});

    // console.log(groupedData, 'groupedData');

    // this.pagedData = Object.keys(groupedData).map(key => ({
    //   ...groupedData[key],
    //   collapsed: groupedData[key].data.length > 1
    // }));

    // this.pagedData = tableData.map(key => ({
    //   ...tableData[key],
    //   collapsed: tableData[key].data.length > 1
    // }));
    this.pagedData = tableData;

    // console.log(this.pagedData, 'adng table data');

  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedData();
      this.updateVisiblePages();
      this.checkHeaderCheckboxState()
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedData();
      this.updateVisiblePages();
      this.checkHeaderCheckboxState()
    }
  }

  goToPage(page: number): void {
    console.log('goToPage', page);

    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedData();
      this.updateVisiblePages();
      this.checkHeaderCheckboxState()
    }
  }

  onPageChange(event: any): void {
    // Update the currentPage in PaginationService when the dropdown changes
    const selectedPage = event.target.value;
    // this.goToPage(selectedPage);
    this.currentPage = parseInt(selectedPage);
    this.updatePagedData();
    this.updateVisiblePages();
    this.checkHeaderCheckboxState();
  }

  updateVisiblePages() {
    const range = 2; // Number of pages to show before and after the current page
    let start = Math.max(1, this.currentPage - range);
    let end = Math.min(this.totalPages, this.currentPage + range);

    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);

    }
    // console.log("currentPage", this.currentPage,range,this.currentPage + range);
    // console.log("visiblePages", this.visiblePages,start,end,this.totalPages);
  }

  // End Pagination

  applySearch() {
    if (this.tableData && this.tableData.length == 0) {
      return
    }
    this.searchText = ''
    this.dynamicSearchValues = this.dynamicSearchForm.value
    this.currentPage = 1

    this.filterTableData = this.filterTable(this.tableData, this.dynamicSearchValues);
    // console.log('filteredTable', this.filterTableData);



    // const groupedData = filteredTable.reduce((acc, curr) => {
    //   const poNumber = curr["ID"];
    //   if (!acc[poNumber]) {
    //     acc[poNumber] = { collapsed: false, data: [] };
    //   }
    //   acc[poNumber].data.push(curr);
    //   return acc;
    // }, {});

    // this.pagedData = Object.keys(groupedData).map(key => ({
    //   ...groupedData[key],
    //   collapsed: groupedData[key].data.length > 1
    // }));

    this.excelTableData = this.filterTableData
    let tableData = this.filterTableData ? this.filterTableData.slice(this.startIndex, this.endIndex) : [];
    this.pagedData = tableData
    // console.log('this.pagedData', this.pagedData, tableData);


    this.totalItems = this.filterTableData.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages()

    this.loadDynamicSearchForm()

    const getFilledKeyValuePairs = (obj: any) => {
      return Object.entries(obj)
        .filter(([key, value]) => value !== "")
        .map(([key, value]) => ({ [key]: value }));
    };

    this.searchGroupItem = getFilledKeyValuePairs(this.dynamicSearchValues);

    // console.log('applySearch', this.dynamicSearchValues);
  }

  filterTable = (table: any[], searchKey: { [key: string]: string }): any[] => {
    return table.filter(entry => {
      return Object.keys(searchKey).every(key => {
        const searchValue = (searchKey[key] || "").toString().toLowerCase().trim();
        const entryValue = (entry[key] || "").toString().toLowerCase().trim();

        // console.log("searchValue :" + searchValue, "entryValue :" + entryValue);

        return searchValue === "" || entryValue.includes(searchValue);
      });
    });
  };


  resetSearch() {

    // const groupedData = this.tableData.reduce((acc, curr) => {
    //   const poNumber = curr["ID"];
    //   if (!acc[poNumber]) {
    //     acc[poNumber] = { collapsed: false, data: [] };
    //   }
    //   acc[poNumber].data.push(curr);
    //   return acc;
    // }, {});

    // this.pagedData = Object.keys(groupedData).map(key => ({
    //   ...groupedData[key],
    //   collapsed: groupedData[key].data.length > 1
    // }));

    this.searchGroupItem = []
    this.filterTableData = []

    this.excelTableData = this.tableData
    let tableData = this.tableData ? this.tableData.slice(this.startIndex, this.endIndex) : [];
    this.pagedData = tableData;

    this.totalItems = this.tableData.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages()

    this.loadDynamicSearchForm()
  }

  onClickCross(item: any) {

    let _data = this.dynamicSearchValues

    // Get the key and value from the child object
    let [childKey, childValue] = Object.entries(item)[0];

    // Filter the parent array
    this.searchGroupItem = this.searchGroupItem.filter(item => {
      // Check if the item has a matching key and value
      return item[childKey] !== childValue;
    });

    // Iterate over the keys in resultKey
    Object.keys(item).forEach(key => {
      // Check if the key exists in searchKey and the value matches
      if (_data.hasOwnProperty(key) && _data[key] === item[key]) {
        // Set the value in searchKey to empty
        _data[key] = "";
      }
    });


    this.filterTableData = this.filterTable(this.tableData, _data);
    // console.log("item", this.filterTableData);



    // const groupedData = filteredTable.reduce((acc, curr) => {
    //   const poNumber = curr["ID"];
    //   if (!acc[poNumber]) {
    //     acc[poNumber] = { collapsed: false, data: [] };
    //   }
    //   acc[poNumber].data.push(curr);
    //   return acc;
    // }, {});

    // this.pagedData = Object.keys(groupedData).map(key => ({
    //   ...groupedData[key],
    //   collapsed: groupedData[key].data.length > 1
    // }));

    this.excelTableData = this.filterTableData
    let tableData = this.filterTableData ? this.filterTableData.slice(this.startIndex, this.endIndex) : [];
    this.pagedData = tableData

    this.totalItems = this.searchGroupItem.length > 0 ? this.filterTableData.length : this.tableData.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages()
  }

  ClearSearchCard() {
    // console.log('searchGroupItem', this.searchGroupItem);

    this.searchGroupItem = []
    this.filterTableData = []

    // const groupedData = this.tableData.reduce((acc, curr) => {
    //   const poNumber = curr["ID"];
    //   if (!acc[poNumber]) {
    //     acc[poNumber] = { collapsed: false, data: [] };
    //   }
    //   acc[poNumber].data.push(curr);
    //   return acc;
    // }, {});

    // this.pagedData = Object.keys(groupedData).map(key => ({
    //   ...groupedData[key],
    //   collapsed: groupedData[key].data.length > 1
    // }));
    this.excelTableData = this.tableData
    let tableData = this.tableData ? this.tableData.slice(this.startIndex, this.endIndex) : [];
    this.pagedData = tableData;

    this.totalItems = this.tableData.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateVisiblePages()

  }

  applySetting() {

    let _form = this.settingColumnForm.value


    this.columns.forEach(column => {
      if (_form.hasOwnProperty(column.name)) {
        column.hide_col = !_form[column.name];
      }
    });

    localStorage.setItem('columnSetting_' + this.router.url + '_' + this.title, JSON.stringify(this.columns));


    console.log('form', this.columns);

  }

  resetSetting() {
    localStorage.removeItem('columnSetting_' + this.router.url + '_' + this.title);

    window.location.reload();

  }

  confirmDelete(value: any) {
    this.deleteConfirmed.emit(value);
  }

  isIndeterminate = false;
  selectedRows: any[] = []
  // Toggle all checkboxes when header checkbox is clicked
  toggleAllCheckboxes(event: any) {
    const isChecked = event.target.checked;
    // console.log(isChecked,this.isIndeterminate);


    if (isChecked && this.isIndeterminate == false) {
      // console.log('isChecked', isChecked);
      if (this.selectedItems.length === 25) {
        this.validationMessage = 'You can select up to 25 Delivery Orders only.';
        this.showValidationModal = true;
        return; // Exit the function if the max limit is reached.
      }

      if (this.selectedItems.length < 25) {
        const limit = Math.min(25 - this.selectedItems.length, this.pagedData.filter(item => item.DisableRow == false).length);
        // console.log('limit', limit,this.selectedItems.length,this.pagedData.filter(item => item.DisableRow == false).length);

        for (let i = 0; i < limit; i++) {
          if (this.pagedData[i].DisableRow == false) {
            this.pagedData[i].checked = true;
          }
        }
      }
    } else if (isChecked && this.isIndeterminate) {
      this.pagedData.forEach(data => data.checked = false);

    } else {
      console.log('isChecked', isChecked);

      this.pagedData.forEach(data => data.checked = false);
    }

    // Update the state of isAnyChecked and selectedRowCount.
    // this.isAnyChecked = this.pagedData.some(data => data.checked);
    // this.selectedRowCount = this.pagedData.filter(data => data.checked).length;

    this.emitCheckedValues();
    this.checkHeaderCheckboxState(); // Check the state of the header checkbox.
  }


  // Handle individual row checkbox click
  toggleCheckboxes(data: any, event: any) {
    if (event.target.checked) {
      // Check if adding this checkbox would exceed the limit of 25
      if (this.selectedItems.length >= 25) {
        event.target.checked = false;
        data.checked = false;
        this.validationMessage = 'You can select up to 25 Delivery Orders only.';
        this.showValidationModal = true; // Show the modal with the validation message
      } else {
        data.checked = true; // Allow checking if under the limit
      }
    } else {
      // Allow unchecking without validation message
      data.checked = false;
    }

    this.emitCheckedValues();
    this.checkHeaderCheckboxState();  // Check the state of the header checkbox
  }



  isRowSelected(data: any): boolean {
    let result = this.selectedItems.some(selectedRow => selectedRow["DO Number"] == data["DO Number"]);
    // console.log('result', result);
    return result

  }
  // Emit checked values (up to 25)
  emitCheckedValues() {
    console.log('this.selectedItems', this.selectedItems);
    this.pagedData.forEach(item => this.updateSelectedItems(item));
    // const result = this.pagedData.filter((e: any) => e.checked === true);
    this.checkedValues.emit(this.selectedItems);
  }

  selectedItems: any[] = [];
  updateSelectedItems(item: any) {

    // console.log('item', item);

    // Check if item is already in the selectedItems array
    const index = this.selectedItems.findIndex(selectedItem => selectedItem["DO Number"] === item["DO Number"]);

    if (item.checked) {
      // If checked and not already in the array, add it
      if (index === -1) {
        this.selectedItems.push(item);
      }
    } else {
      // If unchecked and already in the array, remove it
      if (index !== -1) {
        this.selectedItems.splice(index, 1);
      }
    }
  }

  // Check if all checkboxes are selected or not
  checkHeaderCheckboxState() {
    // Select the header checkbox element
    const headerCheckbox = document.getElementById('header-checkbox') as HTMLInputElement;

    if (headerCheckbox) {
      const totalChecked = this.pagedData.filter((data: any) => data.checked).length;
      // console.log('totalChecked', totalChecked);

      if (totalChecked === this.pagedData.length || (this.pagedData.length > 25 && totalChecked === 25)) {
        headerCheckbox.checked = true;  // All checkboxes are selected, check the header checkbox
        headerCheckbox.indeterminate = false;
        this.isIndeterminate = false
      } else if (totalChecked > 0) {
        headerCheckbox.indeterminate = true;  // Some checkboxes are selected, set indeterminate
        headerCheckbox.checked = false;
        this.isIndeterminate = true
      } else {
        headerCheckbox.checked = false;  // No checkboxes are selected, uncheck the header checkbox
        headerCheckbox.indeterminate = false;
        this.isIndeterminate = false
      }
    }
  }








  // viewArtwork() {
  // this.selectedArtwork = item;
  // console.log(this.selectedArtwork, 'artwork data');
  // this.isViewModalOpen = true;

  // this.getArtworkDocumentView(item['Artwork Document Id'])
  // this.getArtworkDateList()
  // }


  // closeDoc() {
  //   this.documentNameM = "";
  //   this.documentPathM = "";
  //   this.selectedFile = null;
  // }

  closeViewModal() {
    this.isViewModalOpen = false;
  }
  closeEditModal() {
    this.isEditModalOpen = false;
  }
  openUploadModal() {
    this.isHistoryModalOpen = true
    this.isViewModalOpen = false
  }
  closeHistoryModal() {
    this.isHistoryModalOpen = false;
  }
  artworkDownload() {

    //For download
    let documentType: string | undefined = ''
    documentType = this.artworkDocumentName ? this.artworkDocumentName.split('.').pop() : '';

    // const a = document.createElement('a');
    // // const url = this.pdfUrl;
    // a.href = url;
    // a.download = 'artwork' + '.' + documentType;
    // a.click();
    // window.URL.revokeObjectURL(url);

  }
  closeForm() {
    this.clearForm()

    this.isInvoiceModalOpen = false;


  }
  clearForm() {

    // this.documentNameM = "";
    // this.documentPathM = "";

    // this.selectedMaterialCode = ''
    // this.selectedItemDesc = ''
    // this.selectedSupplierName = ''
    // this.selectedSupplierCode = ''

    // this.selectedMaterialCodeR = ''
    // this.selectedItemDescR = ''
    // this.selectedSupplierNameR = ''
    // this.selectedSupplierCodeR = ''

    // this.loadPDFForm();
  }

  // closeAddModal() {
  //   this.isInvoiceModalOpen = false;
  // }

  // closeViewInvoice() {
  //   this.isViewInvoiceModal = false;
  // }

  // openViewInvoiceModal() {
  //   this.isViewInvoiceModal = true;

  //   this.documentNameM = ''
  //   this.documentPathM = ''
  //   this.selectedFile = null
  // }

  // onInvoiceSubmit() {

  //   console.log('view data', this.selectedInvoice);

  //   let url = '/transporterAPI/uploadSignedDocument'
  //   let passParam = {
  //     "invoiceId": this.selectedInvoice['_ID'],
  //     "lrDocumentDetail": [
  //       {
  //         "invoiceNumber": this.selectedInvoice['Invoice No.'],
  //         "lrDocumentPath": this.documentPathM,
  //         "lrDocumentName": this.documentNameM,
  //         "lrDocumentType": "pdf"
  //       }
  //     ]
  //   }

  //   this.isLoader = true;
  //   this.service.postData(url, passParam).subscribe((res) => {
  //     console.log("response", res);

  //     this.isLoader = false;
  //     this.isInvoiceModalOpen = false;

  //   },
  //     error => {
  //       this.errorMsg = error.error.message;
  //       this.isLoader = false;

  //       console.log('Error fetching:', error);

  //       if (error?.status == 401) {
  //         localStorage.removeItem('username');
  //         localStorage.removeItem('token');
  //         localStorage.removeItem('role');

  //         this.router.navigate(['/login']);
  //       }
  //     })



  // }

  //  Begin Upload Invoice

  // public uploader: FileUploader = new FileUploader({
  //   url: 'http://localhost:4000/upload',
  //   itemAlias: 'file'
  // });

  // uploadFile() {
  //   console.log('this.selectedFile', this.selectedFile);

  //   if (this.selectedFile) {
  //     this.isLoader = true
  //     let url = '/blobAPI/uploadDocument?prefixName=Invoiced'


  //     this.service.uploadFile(url, this.selectedFile)
  //       .subscribe(
  //         response => {
  //           console.log('File uploaded successfully:', response);

  //           this.documentNameM = response?.data?.fileName;
  //           this.documentPathM = response?.data?.filePath

  //           this.uploader.clearQueue();

  //           this.isLoader = false;

  //         },
  //         error => {
  //           console.error('Error uploading file:', error);
  //           this.errorMsg = error.error.message ? 'Error uploading file : ' + error.error.message : 'Error : File can not uploaded!';
  //           this.ExceptionErrorMsg = error.error.exception ? error.error.exception : []
  //           this.isLoader = false;
  //         }
  //       );
  //   } else {
  //     console.warn('No file selected.');
  //     this.errorMsg = 'No file selected.'
  //   }
  // }

  // public hasBaseDropZoneOver: boolean = false;
  // public mimeType: string = '';

  // public fileOverBase(e: any): void {
  //   this.hasBaseDropZoneOver = e;
  // }

  // public onFileSelected(event: any) {
  //   const file: File = event[0];
  //   this.selectedFile = event[0];

  //   this.documentNameM = "";
  //   this.documentPathM = "";

  //   // readBase64(file)
  //   //   .then(function (data) {
  //   //     console.log(data);
  //   //   })

  //   this.errorMsg = '';

  // }

  // setMimeType(mimeType: any) {
  //   this.mimeType = mimeType;
  // }

  // upload() {
  //   this.uploader = new FileUploader({
  //     url: URL,
  //     disableMultipart: true,
  //     allowedMimeType: ['pdf']
  //   });
  // }
  //  End Upload Invoice

  resetSelectedItems() {
    this.selectedItems = []

    // Uncheck all items in pagedData
    this.pagedData.forEach(data => {
      data.checked = false;
    });

    // Emit the updated checked values (empty array)
    this.emitCheckedValues();
    this.checkHeaderCheckboxState();
  }

  goToPageView(value: any) {
    // this.commonService.routeToPage(value)
    console.log(value, 'value');

    this.router.navigate(['CAD/vendor/home/hold-list'], { queryParams: { inv: value['Invoice ID'] }, skipLocationChange: false, state: { invoiceData: value } })

  }

  goToApprover(value: any) {
    // console.log(value);
    this.commonService.routeToPage('CAD/contract/approvers')
    localStorage.setItem('contractId', value['contractId']);
  }

  goToCJPCPayment(value: any) {
    // console.log(value);
    this.router.navigate(['CAD/cjpc-list'], { queryParams: { wo: value['WO No'] } })
    localStorage.setItem('contractId', value['contractId']);

  }

  goToCJPCAction(value: any) {
    console.log(value);
    // if(value['Status'] == 'Complete'){
    //    this.router.navigate(['CAD/cjpc'], { queryParams: { id: value['CJPC Id'] }, skipLocationChange: false ,state:{status:value['Status']}})
    // }
    // else{
    this.router.navigate(['CAD/cjpc-action'], { queryParams: { id: value['CJPC Id'] }, skipLocationChange: false, state: { status: value['Status'], CJPCData: value } })
    // }

  }

  goToCJPCDetails(value: any) {
    // console.log(value);
    this.router.navigate(['CAD/cjpc'], { queryParams: { id: value['CJPC Id'] }, skipLocationChange: false, state: { status: value['Status'], CJPCData: value } })
  }
  goToReleaseHoldRequest(value: any) {
    this.iconClick.emit({ columnName: 'Release Hold Request', rowData: value });
  }
  goToRetentionRelease(value: any) {
    this.iconClick.emit({ columnName: 'Retention Release / SCC', rowData: value });
  }
}
