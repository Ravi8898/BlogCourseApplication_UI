import { ChangeDetectionStrategy } from '@angular/compiler';
import { ChangeDetectorRef, Component, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { FileUploadComponent } from 'src/app/common/file-upload/file-upload.component';
import { CommonService } from 'src/app/services/common.service';
import { PaperlessService } from 'src/app/services/paperless.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-vendor-upload-invoice',
  templateUrl: './vendor-upload-invoice.component.html',
  styleUrls: ['./vendor-upload-invoice.component.scss'],
})
export class VendorUploadInvoiceComponent {
  @ViewChildren(FileUploadComponent)
  fileUploadComponents!: QueryList<FileUploadComponent>;
  successPopup: boolean = false;
  popupMessage: string = '';
  invoicetypeId: number | null = null;
  optionInvoiceCategory: any[] = [];
  optionSubmittionToCategory: any[] = [];
  isPODetail: boolean = false;
  poNumber!: any;
  submitted: boolean = false;
  inValidPO: any;
  status: string = '';
  invoiceForm!: FormGroup;
  pages: number[] = [];
  totalPages: number = 0;
  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  isLoader: boolean = false;
  errorMessage: string = '';
  errorMessage1: string = '';
  fileErrorExists: string = '';
  selectedRequiredDocId: any;
  optionDocumentDetails: any[] = [];
  selectedFiles_invoice: File[] = [];
  selectedFiles_document: File[] = [];
  DocumentDetails: any[] = [];
  selectedRequiredDoc: string = '';
  oversizedFile: any;
  documenttypeid: string = '';
  base64String: string | null | undefined;
  errorMessageForSubmit: string = '';
  viewVendorInvoice: boolean = false;
  openDocumentListModal: boolean = false;
  Documentcolumns = [
    { header: '#', field: 'blobId' },
    { header: 'Document Upload Date', field: 'uploaddate', date: true },
    { header: 'Document Name', field: 'fileName' },
    { header: 'Document Type', field: 'fileType' },
    { header: 'Action', field: 'action', value: ['eye', 'delete'] },
  ];
  poItemsTableColumns = [
    { header: 'Purchase Order Number', field: 'purchaseOrderItemNo' },
    { header: 'Item Description', field: 'itemDescription' },
    { header: 'Material Number', field: 'materialNumber' },
    { header: 'Plant Code', field: 'plantCode' },
    { header: 'Unit Of Measure', field: 'unitOfMeasure', },
    { header: 'Net Price', field: 'netPrice', },
    // { header: 'Price Per Unit', field: 'pricePerUnit' },
    { header: 'Quantity', field: 'quantity', }
  ];
  panels = [
    { title: 'PO Items', isOpen: true },
    { title: 'Documents', isOpen: true },
  ]
  poItems: any[] = [];
  visiblePages: number[] = [];
  filterTableData: any[] = [];
  allSelected: boolean = false;
  selectedItems: any[] = [];
  items: any[] = []
  isDocumentModalOpen: boolean = false;
  documentError: boolean = false;
  showUploadModal: boolean = false;
  filterErrorMessage: string = '';
  selectedSignFiles_document: File[] = [];
  poType: string = 'PO';
  userdata: any;
  ipAddress: string = '';
  invoiceExistErrorMsg: string = '';
  docErrorMessage: string = '';
  invoiceData: any;
  invoicePDFDocuments: any;
  supportedDocuments: any;
  poInvoiceId: any;
  InvoicefileErrorExists: string = '';
  division: string = '';
  disable: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private apiService: PaperlessService,
    private router: Router,
    private commonService: CommonService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbService.setBreadcrumbUrl();
    this.userdata = this.apiService.getUserData();
    let state = this.router.getCurrentNavigation()?.extras?.state;

    if (state) {
      this.poInvoiceId = state?.['InvoiceID'];
      this.viewVendorInvoice = this.commonService.viewVendorInvoice
      localStorage.setItem('InvoiceID', this.poInvoiceId || '');
      localStorage.setItem('viewVendorInvoice', String(this.viewVendorInvoice) || '');

    }
    if (localStorage.getItem('InvoiceID')) {
      this.poInvoiceId = localStorage.getItem('InvoiceID')
      this.viewVendorInvoice = Boolean(localStorage.getItem('viewVendorInvoice'))

    }
    this.division = localStorage.getItem('division') || '';

  }
  togglePanel(panel: any) {
    this.panels.forEach(p => {
      p.isOpen = (p === panel) ? !p.isOpen : false;
    });
  }

  ngOnInit(): void {

    this.invoiceForm = this.fb.group(
      {
        poType: ['PO', Validators.required],
        invoiceType: ['', Validators.required],
        poNumber: ['', Validators.required],
        invoiceNumber: ['', Validators.required],
        invoiceDate: ['', Validators.required],
        amountAsPerInvoice: [
          '',
          [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)],
        ],
        amountPerLineItems: [
          '',
          [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)],
        ],
        company: ['', Validators.required],
        plantCode: ['', Validators.required],
        supplierGST: ['', Validators.required],
        // currency: ['', Validators.required],
        adaniContact: [''],
        submissionTo: ['', Validators.required],
        remark: [''],
      },
      {
        validators: this.amountMatchValidator,
      }
    );
    this.getIpAddress();
    this.disable = false
    if (this.viewVendorInvoice) {
      this.disable = true
      this.getInvoiceByInvoiceId()
    }
  }

  ngOnDestroy() {
    localStorage.removeItem('viewVendorInvoice');
    localStorage.removeItem('InvoiceID')
  }
  getSummitionToOptions(plantCode: string) {
    const url = 'upload/findSubmitToDetails';
    let passParam = {
      plantCode: plantCode, //this.invoiceForm.get('plantCode')?.value || '',
      division: this.division == 'AEML' ? 'AEML' : 'GROUP',
      invoiceType: this.invoiceForm.get('invoiceType')?.value || '',
    };
    this.apiService.dataPost(url, passParam).subscribe(
      (res: any) => {
        this.optionSubmittionToCategory = res?.data || [];
      },
      (error) => {
        this.errorMessage1 = this.apiService.handleError(error);
      }
    );
  }


  getIpAddress() {
    let production = environment.production;
    if (production) {
      this.apiService.getPublicIpAddressSecure().then((ip) => {
        this.ipAddress = ip;
        console.log('ip address', this.ipAddress);

      });
    } else {
      this.apiService.getPublicIpAddressNonSecure().then((ip) => {
        this.ipAddress = ip;
        console.log('ip address', this.ipAddress);

      });
    }

  }
  // Custom validator to check if invoice amount matches line item amount
  amountMatchValidator(form: FormGroup) {
    const invoiceAmount = form.get('amountAsPerInvoice')?.value;
    const lineItemControl = form.get('amountPerLineItems');

    if (!lineItemControl) {
      return null;
    }

    // Check if the control has a required validator
    const validator = lineItemControl.validator ? lineItemControl.validator({} as any) : null;
    const isRequired = validator && validator['required'] === true;

    if (isRequired) {
      return invoiceAmount == lineItemControl.value ? null : { invalidAmount: true };
    }

    // If not required, skip validation
    return null;
  }

  toggleSelectionForService(item: any, event?: any) {
    const isChecked = event?.target?.checked;

    item.isSelected = isChecked;
    if (isChecked) {
      this.selectedItems.push({
        ...item,
        updatedQuantity: item.PO_Quantity,
        grossAmount: 0,
      });
      // }
    } else {
      // Uncheck
      this.selectedItems = this.selectedItems.filter(
        (i) => i.itemNumber !== item.itemNumber
      );
    }

    this.isAllSelected();
  }

  toggleSelection(item: any, event?: any) {
    if (event.target.checked) {
      this.poItems.forEach((i: any) => {
        if (i.PO_ItemNo === item.PO_ItemNo) {
          i.isSelected = true;
        }
      });

      this.selectedItems.push({
        ...item,
        updatedQuantity: Number(item.PO_Quantity),
        grossAmount: 0,
        isSelected: true,
      });
    } else {
      this.poItems.forEach((i: any) => {
        if (i.PO_ItemNo === item.PO_ItemNo) {
          i.isSelected = false;
        }
      });

      this.selectedItems = this.selectedItems.filter(
        (i) => i.PO_ItemNo !== item.PO_ItemNo
      );

    }
  }

  isAllSelected(): boolean {
    this.allSelected =
      this.poItems.length > 0 &&
      this.poItems.every((item) => item.isSelected === true);
    this.cdr.detectChanges();
    return this.allSelected;
  }

  disableAllSelection() {
    const allQuantityZero = this.poItems.every(
      (item) => Number(item.PO_Quantity) <= 0
    );
    if (allQuantityZero) {
      return true;
    } else {
      return false;
    }
  }

  disableSelection() {
    const allQuantityZero = this.poItems.every(
      (item) => Number(item.PO_Quantity) <= 0
    );
    if (allQuantityZero) {
      return true;
    } else {
      return false;
    }
  }

  toggleAllSelection(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    this.poItems.forEach((item) => {
      if (checked) {
        // Only add if not already selected AND quantity > 0
        if (
          !this.selectedItems.some((i) => i.PO_ItemNo === item.PO_ItemNo) &&
          item.PO_Quantity > 0
        ) {
          item.isSelected = true;
          this.selectedItems.push({
            ...item,
            updatedQuantity: item.PO_Quantity,
            grossAmount: 0,
            isSelected: true,
          });
        }
      } else {
        // Unselect and remove from selectedItems
        item.isSelected = false;
        this.selectedItems = this.selectedItems.filter(
          (i) => i.PO_ItemNo !== item.PO_ItemNo
        );
      }
    });
    console.log('slected', this.selectedItems);
  }
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      this.updatePagedData();
      this.updateVisiblePages();
      // this.toggleAllSelection()
      this.isAllSelected();
    }
  }
  updatePagedData(): void {
    let tableData = [];
    if (this.filterTableData.length > 0) {
      tableData = this.filterTableData
        ? this.filterTableData.slice(this.startIndex, this.endIndex)
        : [];
    } else {
      tableData = this.items
        ? this.items.slice(this.startIndex, this.endIndex)
        : [];
    }
    this.poItems = tableData;
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
  updateVisiblePages() {
    const range = 2; // Number of pages to show before and after the current page
    let start = Math.max(1, this.currentPage - range);
    let end = Math.min(this.totalPages, this.currentPage + range);

    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);
    }
  }

  updatePagination() {
    this.totalItems = this.items.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.poItems = this.items.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );

    this.generatePageNumbers();
  }
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
    this.isAllSelected();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
    this.isAllSelected();
  }

  calculateGrossAmount(item: any, index: number) {
    const PO_Quantity = Number(item.updatedQuantity) || 0;
    const Net_Price = Number(item.Net_Price) || 0;
    item.Net_Price = Net_Price.toFixed(2);
    item.grossAmount = (PO_Quantity * Net_Price).toFixed(2);
    this.getTotalNetPrice();
    this.getTotalGrossAmount();

    return parseFloat(item.grossAmount);
  }
  generatePageNumbers() {
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.visiblePages = this.getVisiblePages();
  }
  getTotalNetPrice(): number {
    const totalNetPrice = this.selectedItems.reduce(
      (sum, item) => sum + (Number(item.Net_Price) || 0),
      0
    );
    const totalNetP = totalNetPrice.toFixed(2);
    return parseFloat(totalNetP);
  }
  getVisiblePages(): number[] {
    const range = 2; // Show 2 pages before and after the current page
    let start = Math.max(1, this.currentPage - range);
    let end = Math.min(this.totalPages, this.currentPage + range);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  getTotalGrossAmount() {
    const totalGrossAmount = this.selectedItems.reduce(
      (sum, item) => sum + (Number(item.grossAmount) || 0),
      0
    );
    this.invoiceForm.get('amountPerLineItems')?.setValue(parseFloat(totalGrossAmount.toFixed(2)));
    return parseFloat(totalGrossAmount.toFixed(2));
  }

  isQuantityValid(): boolean {
    return this.selectedItems.every(
      (item) => item.updatedQuantity <= item.PO_Quantity
    );
  }
  onPageChange(event: any): void {
    const selectedPage = event.target.value;
    this.currentPage = parseInt(selectedPage);
    this.updatePagedData();
    this.updateVisiblePages();
    this.isAllSelected();
  }
  onFilesUploaded(files: File[]) {
    const maxSizeInBytes = 500 * 1024 * 1024; // 500 MB
    this.selectedFiles_document = files;
    this.errorMessage = '';
    // Check if any file exceeds the size
    this.oversizedFile = files.find((file) => file.size > maxSizeInBytes);
    const invalidFile = files.find((file) => file.type !== 'application/pdf');
    if (invalidFile) {
      this.fileErrorExists = `Only PDF files are allowed.`;
      return;
    }
    if (this.oversizedFile) {
      this.fileErrorExists = `The file exceeds the 500 MB limit.`;
      // this.selectedFiles_document = []; // Optional: clear files
    } else {
      this.fileErrorExists = '';
    }
  }

  onFilesUploadedInvoice(files: File[]) {
    const maxSizeInBytes = 500 * 1024 * 1024; // 500 MB
    this.selectedFiles_invoice = files;
    this.errorMessage = '';
    this.docErrorMessage = ''
    this.oversizedFile = files.find((file) => file.size > maxSizeInBytes);
    const invalidFile = files.find((file) => file.type !== 'application/pdf');
    if (invalidFile) {
      this.InvoicefileErrorExists = `Only PDF files are allowed.`;
      return;
    }
    if (this.oversizedFile) {
      this.InvoicefileErrorExists = `The file exceeds the 500 MB limit.`;
    } else {
      this.InvoicefileErrorExists = '';
    }
  }
  uploadDocument(docType: string) {
    this.documentError = false;
    this.errorMessage = '';
    const docAlreadyExists = this.DocumentDetails.some(
      (doc) => doc.documentname === this.selectedRequiredDoc
    );
    const invoiceDoc = this.DocumentDetails.some(
      (doc) => doc.fileType === 'Invoice'
    );
    if (docType == 'Invoice' && invoiceDoc) {
      this.errorMessage = 'Document Already Exists';
      return;
    }
    if (docAlreadyExists) {
      this.errorMessage = 'Document Already Exists';
      return;
    }
    if (this.oversizedFile) {
      this.fileErrorExists = `The file exceeds the 500 MB limit.`;
      return;
    }

    const url = 'upload/uploadInvoiceDocument';
    const formData = new FormData();
    if (docType == 'Invoice') {
      formData.append('file', this.selectedFiles_invoice[0]);
    } else {
      this.selectedFiles_document.forEach((file) => {
        formData.append('file', file);
      });
    }
    formData.append('fileType', docType);
    formData.append('poNumber', this.invoiceForm.get('poNumber')?.value);
    formData.append('vendorCode', this.userdata.ACCOUNTNUMBER);
    formData.append('poType', this.invoiceForm.get('poType')?.value);

    this.isLoader = true;
    this.apiService.postFormData(url, formData).subscribe(
      (response: any) => {
        // console.log('response', response);

        const newDocs = response?.data.map((item: any) => ({
          blobId: item?.blobId,
          invoiceAttachmentId: item?.invoiceAttachmentId,
          fileName: item?.fileName,
          fileType: docType,
          uploaddate: moment(new Date()).format('DD-MMM-YYYY'),
        }));

        this.DocumentDetails.push(...newDocs);

        this.isLoader = false;
        this.successPopup = true;
        this.popupMessage = 'File uploaded successfully';

        setTimeout(() => {
          this.successPopup = false;
        }, 2000);

        this.selectedRequiredDocId = '';
        this.selectedRequiredDoc = '';
        this.fileErrorExists = '';
        this.selectedFiles_document = [];
        this.selectedFiles_invoice = [];
        this.selectedFiles_invoice;
        // if (this.selectedRequiredDoc == '') {
        this.fileUploadComponents.toArray()[1].cleanFile();
        // }
        // else{
        this.fileUploadComponents.toArray()[0].cleanFile();
        // }
      },
      (error) => {
        this.errorMessage = this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }
  onChangeRequiredDocument(value: any) {
    // this.selectedRequiredDoc = value.target.value;
    const selectElement = value.target as HTMLSelectElement;
    this.selectedRequiredDoc =
      selectElement.options[selectElement.selectedIndex].text;
    if (this.selectedRequiredDoc == '') {
      this.fileUploadComponents.toArray()[1].cleanFile();
    }

    this.documenttypeid = this.optionDocumentDetails.filter(
      (item: any) => item.invoicedocumenttypeid == this.selectedRequiredDocId
    )[0].fkdocumenttypeid;
    this.errorMessage = '';
    this.fileErrorExists = '';
  }
  onView(value: any) {
    this.openDocumentModal();
    this.openDocument(value);
  }

  openDocumentModal() {
    this.isDocumentModalOpen = true;
  }

  closeDocumentModal() {
    this.isDocumentModalOpen = false;
  }

  openDocument(value: any) {
    this.isDocumentModalOpen = true
    this.isLoader = true;
    let data = {
      blobId: value.blobId,
    };
    this.apiService.dataPost('upload/documentDownload', data).subscribe(
      (response: any) => {
        this.base64String = response?.data?.Base64String;
        this.isLoader = false;
      },
      (error) => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }
  onDelete(item: any) {
    this.DocumentDetails = this.DocumentDetails.filter(
      (doc) => doc.blobId !== item.blobId
    );
  }
  getPODetails() {
    if (this.invoiceForm.get('poNumber')?.invalid) {
      this.invoiceForm.get('poNumber')?.markAsTouched();
      return;
    }

    if (this.invoiceForm.get('poType')?.value == '') {
      this.invoiceForm.get('poType')?.markAsTouched();
      return;
    }

    if (this.invoiceForm.get('invoiceType')?.value == '') {
      this.invoiceForm.get('invoiceType')?.markAsTouched();
      return;
    }

    let PoNumber = this.invoiceForm.get('poNumber')?.value
    
    let data = {
      "poNumber": PoNumber
    }
    // this.items =  [
    // {
    //   "PO_ItemNo": 1,
    //   "itemDescription": "Steel Rods",
    //   "materialNumber": "MAT001",
    //   "plantCode": "PLANT-01",
    //   "PO_Quantity": 100,
    //   "unitOfMeasure": "KG",
    //   "Net_Price": 25000.50,
    //   "taxCode": "GST18",
    //   "contractNo": "CN-101",
    //   "contractItemNo": "CITEM-001",
    //   "hsnCode": "7207",

    //   "storageLocation": "STR-001",
    //   "materialGroupItem": "GRP-001",
    //   "remainingQuantity": 50,
    //   "maxAllowedQuantity": 200,
    //   "itemCategory": "STANDARD",
    //   "prNumber": "PR-001",
    //   "prNumberItem": "PRITEM-001"
    // },
    // {
    //   "PO_ItemNo": 2,
    //   "itemDescription": "Iron Sheets",
    //   "materialNumber": "MAT002",
    //   "plantCode": "PLANT-01",
    //   "PO_Quantity": 50,
    //   "unitOfMeasure": "PCS",
    //   "Net_Price": 30000.25,
    //   "taxCode": "GST18",
    //   "contractNo": "CN-102",
    //   "contractItemNo": "CITEM-002",
    //   "hsnCode": "7208",

    //   "storageLocation": "STR-002",
    //   "materialGroupItem": "GRP-002",
    //   "remainingQuantity": 20,
    //   "maxAllowedQuantity": 100,
    //   "itemCategory": "STANDARD",
    //   "prNumber": "PR-002",
    //   "prNumberItem": "PRITEM-002"
    // }
    //     {
    //           "PO_ItemNo": "00010",
    //           "Item_Desc": "LED OUTDOOR WALL LIGHT",
    //           "Material_No": "6964901461",
    //           "Plant": "5282",
    //           "PO_Quantity": "100.000",
    //           "PO_UOM": "EA",
    //           "Net_Price": "100.00 ",
    //           "Tax_Code": "&A",
    //           "Contract_Item": "0000000000",
    //           "HSN_Code": "94054090",
    //           "Storage_Location": "CS01",
    //           "Material_Group": "9999",
    //           "Item_Category": "0",
    //           "PR_No": "1000238238",
    //           "PR_No_Item": "00010"
    //       },
    //       {
    //           "PO_ItemNo": "00020",
    //           "Item_Desc": "LED OUTDOOR WALL LIGHT",
    //           "Material_No": "6964901461",
    //           "Plant": "5282",
    //           "PO_Quantity": "50.000",
    //           "PO_UOM": "EA",
    //           "Net_Price": "100.00 ",
    //           "Tax_Code": "&A",
    //           "Contract_Item": "0000000000",
    //           "HSN_Code": "94054090",
    //           "Storage_Location": "CS01",
    //           "Material_Group": "9999",
    //           "Item_Category": "0",
    //           "PR_No": "1000238238",
    //           "PR_No_Item": "00020"
    //       }
    // ]

    // this.updatePagination();

    this.apiService.dataPost(`upload/getPODetails`, data).subscribe(
      (response: any) => {
        const invoicedata = response.data?.Header;
        const poItems = response.data?.Item;

        this.inValidPO = false;
        if(this.userdata?.ACCOUNTNUMBER != invoicedata?.Vendor_Code){
          this.inValidPO = true;
          return;
        }

        this.invoiceForm.patchValue({
          company: invoicedata?.Company_Code,
          plantCode: poItems[0]?.Plant,
          supplierGST: this.userdata?.GST //'GST-27ABCDE1234F1Z5',
          // currency: 'INR',
          // adaniContact: 'NA',
        });

        this.items = response.data?.Item;
        const poInvoiceItems = this.items.map((item: any) => ({

          "PO_ItemNo": item?.PO_ItemNo,
          "itemDescription": item?.Item_Desc,
          "materialNumber": item?.Material_No,
          "plantCode": item?.Plant,
          "PO_Quantity": item?.PO_Quantity,
          "unitOfMeasure": item?.PO_UOM,
          "Net_Price": item?.Net_Price,
          "taxCode": item?.Tax_Code,
          "contractNo": item?.Contract_No,
          "contractItemNo": item?.Contract_Item,
          "hsnCode": item?.HSN_Code,
          "storageLocation": item?.Storage_Location,
          "materialGroupItem": item?.Material_Group,
          "remainingQuantity": item?.Remaining_Quantity,
          "maxAllowedQuantity": item?.Max_Quantity,
          "itemCategory": item?.Item_Category,
          "prNumber": item?.PR_No,
          "prNumberItem": item?.PR_No_Item

        }));
        this.poItems = poInvoiceItems

        let plantCode = this.invoiceForm.get('plantCode')?.value || '';
        this.getSummitionToOptions(plantCode);

        this.totalItems = this.items.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.updatePagination();

        this.errorMessage = '';
        this.errorMessage1 = '';
      },
      error => {
        this.errorMessage = this.apiService.handleError(error)
      }
    )
  }

  checkInvoiceNumberExist() {
    let data = {
      invoiceNo: this.invoiceForm.controls['invoiceNumber'].value,
    };
    this.isLoader = true;
    this.apiService.dataPost('upload/isExistsByInvoiceNo', data).subscribe(
      (res: any) => {
        // this.successPopup = true;
        if (res?.data == false) {
          this.invoiceExistErrorMsg = ''
        } else {
          this.invoiceExistErrorMsg =
            'An invoice with this invoice number already exists';
        }
        this.isLoader = false;
      },
      (error) => {
        this.submitted = false;
        this.isLoader = false;
        this.invoiceExistErrorMsg = this.apiService.handleError(error);
      }
    );
  }
  validateAttachments(data: any[]): string | null {
    const hasInvoice = data.some((item) => item.fileType == 'Invoice');
    // const hasSupporting = data.some((item) => item.fileType == 'Supporting');
    if (data.length <= 0) {
      return 'Please upload all the documents.';
    }
    // if (!hasInvoice && !hasSupporting) {
    //   return 'Invoice and Supporting Documents are required.';
    // }
    if (!hasInvoice) {
      return 'Please Upload Invoice file.';
    }
    // if (!hasSupporting) {
    //   return 'Please Upload Supporting Document.';
    // }
    return null;
  }

  finalSubmit() {

    this.submitted = true;
    const formData = this.invoiceForm.getRawValue();
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }
    let documentError = this.validateAttachments(this.DocumentDetails);
    if (documentError) {
      this.docErrorMessage = documentError;
      return;
    } else {
      this.docErrorMessage = '';
    }
    if (this.selectedItems.length <= 0 && this.invoiceForm.get('poType')?.value == 'PO') {
      return
    }

    let json = {
      invoiceType: formData.invoiceType,
      poNumber: formData.poNumber,
      invoiceNo: formData.invoiceNumber,
      invoiceDate:
        new Date(formData.invoiceDate).toISOString().split('T')[0] +
        'T00:00:00',
      invcAmount: formData.amountAsPerInvoice,
      company: formData.company,
      plantCode: formData.plantCode,
      supplierGst: formData.supplierGST,
      // currency: formData.currency,
      adaniContactDetails: formData.adaniContact,
      submissionTo: formData.submissionTo.adId,
      vendorName: this.userdata.NAME,
      vendorCode: this.userdata.ACCOUNTNUMBER,
      remark: formData.remark,
      poType: formData.poType,
      vendorIp: this.ipAddress,
      vendorEmail: this.userdata.EMAIL,
      checkerEmail: formData.submissionTo.emailId,
      poItemDetails: this.mapPOItems(this.selectedItems),
      documentId: this.DocumentDetails.map(
        (doc: any) => doc.invoiceAttachmentId
      ),
    };
    this.isLoader = true;

    // console.log('final submit json', this.userdata,json);
    // return
    
    this.apiService.dataPost('upload/addInvoice', json).subscribe(
      (res: any) => {
        this.successPopup = true;
        this.submitted = false;
        this.popupMessage = res?.message
          ? res.message
          : 'Invoice Has Been Generated';
        this.invoiceForm.reset();
        setTimeout(() => {
          this.router.navigate(['paperless-work/vendor-home']);
        }, 2000);

        this.isLoader = false;
      },
      (error) => {
        // this.isSubmitLoader = false;
        this.submitted = false;
        this.isLoader = false;
        this.errorMessageForSubmit = this.apiService.handleError(error);
      }
    );
  }

  closeUploadModal() {
    this.showUploadModal = false;
  }
  mapPOItems(sourceItems: any[]) {
    return sourceItems.map(source => ({
      purchaseOrderItemNo: source.PO_ItemNo,
      itemDescription: source.Item_Desc,
      materialNumber: source.Material_No,
      plantCode: source.Plant,
      quantity: parseFloat(source.updatedQuantity),
      unitOfMeasure: source.PO_UOM,
      netPrice: parseFloat(source.Net_Price),
      taxCode: source.Tax_Code,
      contractNo: "", // not in source
      contractItemNo: source.Contract_Item,
      hsnCode: source.HSN_Code,
      storageLocation: source.Storage_Location,
      materialGroupItem: source.Material_Group,
      // remainingQuantity: 0, // default
      maxAllowedQuantity: parseFloat(source.PO_Quantity),
      itemCategory: source.Item_Category,
      prNumber: source.PR_No,
      prNumberItem: source.PR_No_Item,
    }));
  }

  openUploadModal() {
    this.showUploadModal = true;
  }

  onUploadFileUploaded(files: File[]) {
    const maxSizeInBytes = 500 * 1024 * 1024; // 500 MB
    this.selectedSignFiles_document = files;
    this.filterErrorMessage = '';
    // Check if any file exceeds the size
    this.oversizedFile = files.find((file) => file.size > maxSizeInBytes);

    if (this.oversizedFile) {
      this.filterErrorMessage = `The file exceeds the 500 MB limit.`;
      // this.selectedFiles_document = []; // Optional: clear files
    } else {
      this.filterErrorMessage = '';
    }
  }

  onPOTypeChange(event: any) {
    this.poType = event.target.value;
  }

  getInvoiceByInvoiceId() {
    let url = `upload/findInvoiceById`;
    let json = {
      poInvoiceId: this.poInvoiceId
    }
    this.apiService.dataPost(url, json).subscribe((res: any) => {
      this.invoiceData = res.data?.[0];
      this.setFormData(this.invoiceData);
      this.poItems = this.invoiceData.poItemDetails;
      this.poItems = this.poItems
      this.invoicePDFDocuments = this.invoiceData?.docDetails.filter((doc: any) => doc.filetype == 'Invoice')
      this.supportedDocuments = this.invoiceData?.docDetails.filter((doc: any) => doc.filetype != 'Invoice')

    }, (error) => {
      this.apiService.handleError(error);
    }
    )
  }
  setFormData(invoiceData: any) {
    this.invoiceForm.controls['invoiceType']?.setValue(invoiceData?.invoiceType);
    this.invoiceForm.controls['poType']?.setValue(invoiceData?.poType);
    this.invoiceForm.controls['poNumber']?.setValue(invoiceData?.poNumber);
    this.invoiceForm.controls['invoiceNumber']?.setValue(invoiceData?.invoiceNo);
    this.invoiceForm.controls['invoiceDate']?.setValue(moment(invoiceData?.invoiceDate).format('DD-MMM-YYYY'));
    this.invoiceForm.controls['amountAsPerInvoice']?.setValue(invoiceData?.invcAmount);
    this.invoiceForm.controls['amountPerLineItems']?.setValue(invoiceData?.invcAmount);
    this.invoiceForm.controls['company']?.setValue(invoiceData?.company);
    this.invoiceForm.controls['plantCode']?.setValue(invoiceData?.plantCode);
    this.invoiceForm.controls['supplierGST']?.setValue(invoiceData?.supplierGst);
    // this.invoiceForm.controls['currency']?.setValue(invoiceData?.currency);
    this.invoiceForm.controls['adaniContact']?.setValue(invoiceData?.adaniContactDetails);
    this.invoiceForm.controls['remark']?.setValue(invoiceData?.remark);

    let subTo = this.optionSubmittionToCategory.find((ele: any) => ele.adId == invoiceData?.submissionTo)
    this.invoiceForm.get('submissionTo')?.setValue(subTo);
    this.invoiceForm.get('submissionTo')?.disable();
    this.invoiceForm.get('invoiceType')?.disable();
    this.invoiceForm.get('poNumber')?.disable();
    this.invoiceForm.get('invoiceNumber')?.disable();
    this.invoiceForm.get('invoiceDate')?.disable();
    this.invoiceForm.get('amountAsPerInvoice')?.disable();
    this.invoiceForm.get('amountPerLineItems')?.disable();
    this.invoiceForm.get('poType')?.disable();
    this.invoiceForm.get('company')?.disable();
    this.invoiceForm.get('plantCode')?.disable();
    this.invoiceForm.get('supplierGST')?.disable();
    // this.invoiceForm.get('currency')?.disable();
    this.invoiceForm.get('adaniContact')?.disable();
    this.invoiceForm.get('remark')?.disable();

    let plantCode = this.invoiceForm.get('plantCode')?.value || '';
    this.getSummitionToOptions(plantCode);
    this.invoiceForm.controls['submissionTo']?.setValue(invoiceData?.submissionTo);
  }

  onInvoiceTypeChange(event: any) {
    this.optionSubmittionToCategory = [];

    const invoiceType = event.target.value;

    if (invoiceType === 'Advance') {
      this.invoiceForm.controls['invoiceNumber']?.enable();
      this.invoiceForm.controls['invoiceNumber']?.setValue('');

      this.invoiceForm.controls['invoiceDate']?.enable();

      this.invoiceForm.controls['amountPerLineItems']?.setValue('NA');
      this.invoiceForm.controls['amountPerLineItems']?.clearValidators();
      this.invoiceForm.controls['amountPerLineItems']?.updateValueAndValidity();

      this.invoiceForm.controls['company']?.disable();
      this.invoiceForm.controls['company']?.setValue('NA');
      this.invoiceForm.controls['company']?.clearValidators();
      this.invoiceForm.controls['company']?.updateValueAndValidity();

      this.invoiceForm.controls['poNumber']?.disable();
      this.invoiceForm.controls['poNumber']?.setValue('NA');
      this.invoiceForm.controls['poNumber']?.clearValidators();
      this.invoiceForm.controls['poNumber']?.updateValueAndValidity();

      // this.invoiceForm.controls['adaniContact']?.clearValidators();
      // this.invoiceForm.controls['adaniContact']?.updateValueAndValidity();

      // this.invoiceForm.controls['currency']?.setValue('INR');
      // this.invoiceForm.controls['currency']?.clearValidators();
      // this.invoiceForm.controls['currency']?.updateValueAndValidity();

      this.invoiceForm.controls['plantCode']?.setValue('NA');
      this.invoiceForm.controls['plantCode']?.clearValidators();
      this.invoiceForm.controls['plantCode']?.updateValueAndValidity();

    } else if (invoiceType === 'Retention') {
      this.invoiceForm.controls['poNumber']?.disable();
      this.invoiceForm.controls['poNumber']?.setValue('NA');
      this.invoiceForm.controls['poNumber']?.clearValidators();
      this.invoiceForm.controls['poNumber']?.updateValueAndValidity();

      this.invoiceForm.controls['invoiceNumber']?.disable();
      this.invoiceForm.controls['invoiceNumber']?.setValue('NA');
      this.invoiceForm.controls['invoiceNumber']?.clearValidators();
      this.invoiceForm.controls['invoiceNumber']?.updateValueAndValidity();

      this.invoiceForm.controls['invoiceDate']?.disable();
      this.invoiceForm.controls['invoiceDate']?.setValue('NA');
      this.invoiceForm.controls['invoiceDate']?.clearValidators();
      this.invoiceForm.controls['invoiceDate']?.updateValueAndValidity();

      this.invoiceForm.controls['amountPerLineItems']?.disable();
      this.invoiceForm.controls['amountPerLineItems']?.setValue('NA');
      this.invoiceForm.controls['amountPerLineItems']?.clearValidators();
      this.invoiceForm.controls['amountPerLineItems']?.updateValueAndValidity();

      this.invoiceForm.controls['company']?.disable();
      this.invoiceForm.controls['company']?.setValue('NA');
      this.invoiceForm.controls['company']?.clearValidators();
      this.invoiceForm.controls['company']?.updateValueAndValidity();

      // this.invoiceForm.controls['adaniContact']?.setValue('NA');
      // this.invoiceForm.controls['adaniContact']?.clearValidators();
      // this.invoiceForm.controls['adaniContact']?.updateValueAndValidity();

      // this.invoiceForm.controls['currency']?.setValue('INR');
      // this.invoiceForm.controls['currency']?.clearValidators();
      // this.invoiceForm.controls['currency']?.updateValueAndValidity();

      this.invoiceForm.controls['plantCode']?.setValue('NA');
      this.invoiceForm.controls['plantCode']?.clearValidators();
      this.invoiceForm.controls['plantCode']?.updateValueAndValidity();

    } else {

      this.invoiceForm.controls['poNumber']?.enable();
      this.invoiceForm.controls['poNumber']?.setValue('');
      this.invoiceForm.controls['poNumber']?.setValidators([Validators.required]);
      this.invoiceForm.controls['poNumber']?.updateValueAndValidity();

      this.invoiceForm.controls['invoiceNumber']?.enable();
      this.invoiceForm.controls['invoiceNumber']?.setValidators([Validators.required]);
      this.invoiceForm.controls['invoiceNumber']?.updateValueAndValidity();

      this.invoiceForm.controls['invoiceDate']?.enable();
      this.invoiceForm.controls['invoiceDate']?.setValidators([Validators.required]);
      this.invoiceForm.controls['invoiceDate']?.updateValueAndValidity();

      this.invoiceForm.controls['amountAsPerInvoice']?.setValidators([Validators.required]);
      this.invoiceForm.controls['amountAsPerInvoice']?.updateValueAndValidity();

      this.invoiceForm.controls['amountPerLineItems']?.setValidators([Validators.required]);
      this.invoiceForm.controls['amountPerLineItems']?.updateValueAndValidity();

      this.invoiceForm.controls['company']?.enable();
      this.invoiceForm.controls['company']?.setValue('');
      this.invoiceForm.controls['company']?.setValidators([Validators.required]);
      this.invoiceForm.controls['company']?.updateValueAndValidity();

      this.invoiceForm.controls['plantCode']?.setValue('');
      this.invoiceForm.controls['plantCode']?.setValidators([Validators.required]);
      this.invoiceForm.controls['plantCode']?.updateValueAndValidity();

      this.invoiceForm.controls['department']?.setValidators([Validators.required]);
      this.invoiceForm.controls['department']?.updateValueAndValidity();

      this.invoiceForm.controls['supplierGST']?.setValidators([Validators.required]);
      this.invoiceForm.controls['supplierGST']?.updateValueAndValidity();

      // this.invoiceForm.controls['currency']?.setValidators([Validators.required]);
      // this.invoiceForm.controls['currency']?.updateValueAndValidity();

      // this.invoiceForm.controls['adaniContact']?.setValidators([Validators.required]);
      // this.invoiceForm.controls['adaniContact']?.updateValueAndValidity();
    }
  }
  isRequired(controlName: string): boolean {
    const control = this.invoiceForm.get(controlName);
    if (!control || !control.validator) {
      return false;
    }

    const validator = control.validator({} as any);
    return (validator && validator['required'] === true ? validator && validator['required'] === true : false);
  }


  openInvoiceDocumentModal() {

    this.isDocumentModalOpen = true
    let finalDOC = this.supportedDocuments.filter((doc: any) => doc.filetype == 'Finalupload')
    this.openDocument(finalDOC[0]);

  }

  rowAction() {
    this.openDocumentListModal = true
  }

  onChangePlant(event: any) {
    let plantCode = event.target.value;
    this.getSummitionToOptions(plantCode);
  }
}
