import { ChangeDetectorRef, Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { FileUploadComponent } from 'src/app/common/file-upload/file-upload.component';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-contract-invoice',
  templateUrl: './contract-invoice.component.html',
  styleUrls: ['./contract-invoice.component.scss']
})
export class ContractInvoiceComponent {
  @ViewChildren(FileUploadComponent) fileUploadComponents!: QueryList<FileUploadComponent>;

  cjpcForm!: FormGroup;
  selectedFiles_invoice: File[] = [];
  selectedFiles_document: File[] = [];
  errorMessage: string = '';
  pages: number[] = [];
  totalPages: number = 0;
  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  public pagedData: any[] = [];
  visiblePages: number[] = [];
  filterTableData: any[] = [];
  billInvoiceNumber: any;
  Documentcolumns = [
    { header: 'Document Upload Date', field: 'uploaddate', date: true },
    { header: 'Document Name', field: 'documentname' },
    { header: 'Document Link', field: '' },
    { header: 'Action', field: 'action', value: ['delete'] }
  ];

  DocumentDetails: any[] = []
  // DocumentDetails = [
  //   {
  //     uploadDate: '01 - Dec - 2024',
  //     docName: 'Name of document',
  //     docLink: 'Click Here',
  //     action: ''
  //   },
  //   {
  //     uploadDate: '01 - Dec - 2024',
  //     docName: 'Name of document',
  //     docLink: 'Click Here',
  //     action: ''
  //   },
  // ]

  optionDocumentDetails: any[] = []
  status: boolean = false;
  invoicetypeId: string = "";
  invoiceTypeName: string = "";
  openDocumentListModal: boolean = false;
  recoveryDocuments: any[] = []
  items: any[] = [
    { id: '00001', itemDescription: 'GYPSUM - CHEMICAL', materialNumber: '108000000046', plantCode: 'NE02', netPrice: 50, pricePerUnit: 1, contractNo: '2750043892' },
    { id: '00002', itemDescription: 'GYPSUM - CHEMICAL', materialNumber: '108000000047', plantCode: 'NE03', netPrice: 50, pricePerUnit: 1, contractNo: '2750043892' },
    { id: '00003', itemDescription: 'GYPSUM - CHEMICAL', materialNumber: '108000000048', plantCode: 'NE04', netPrice: 50, pricePerUnit: 1, contractNo: '2750043892' },
    { id: '00004', itemDescription: 'GYPSUM - CHEMICAL', materialNumber: '108000000049', plantCode: 'NE05', netPrice: 50, pricePerUnit: 1, contractNo: '2750043892' }
  ];

  selectedItems: any[] = [];
  selectedRequiredDocId: any;
  selectedRequiredDoc: string = '';
  optionInvoiceCategory: any[] = [];
  submitted: boolean = false;
  isLoader: boolean = false;
  poNumber: string = '';
  isPODetail: boolean = false;
  documenttypeid: string = '';
  successPopup: boolean = false;
  popupMessage: string = '';
  isDocumentModalOpen: boolean = false;
  base64String: string | null | undefined;
  totalGrossAmount: any;
  totalNetPrice: any;
  billForm!: FormGroup;
  contractDetails: any;
  userdata: any;
  errorMessageForSubmit!: string;
  DocLink: any;
  documentError: boolean = false;
  paymentDueDate!: string;
  inValidPO: boolean = false;
  allSelected: boolean = false;
  docViewModelOpen: boolean = false;
  bash64String: any;
  recoveryId: any;
  releaseRemarks: any;
  releaseAmount: any;
  openReleaseModal: boolean = false;
  oversizedFile: any;
  fileErrorExists: string = '';
  isSubmitLoader: boolean = false;
  currentDate: string = moment(new Date()).format('YYYY-MM-DD');
  POServiceItemList: any[] = [];
  expiredDocList: any[] = [];
  isExpired: any;
  ExpiredModalOpen: boolean = false;
  isAbgIsExist: boolean = false;
  isError: boolean = false;
  constructor(
    private breadcrumbService: BreadcrumbService, private commonService: CommonService, private router: Router,
    private cdr: ChangeDetectorRef, private fb: FormBuilder, private fs: FormService, private apiService: ApiService
  ) {

    this.breadcrumbService.setBreadcrumbUrl();
    this.cjpcForm = this.fb.group({
      ProjectName: [{ value: '', disabled: true }, Validators.required],
      projectCode: [{ value: '', disabled: true }, Validators.required],
      package: [{ value: '', disabled: true }, Validators.required],
      ContractorName: [{ value: '', disabled: true }, Validators.required],
      vendorCode: [{ value: '', disabled: true }, Validators.required],
      ContractWO: [{ value: '', disabled: true }, Validators.required],
      WODate: [{ value: '', disabled: true }, Validators.required],
      DateLastAmt: [{ value: '', disabled: true }, Validators.required],
      completionValue: [{ value: '', disabled: true }, Validators.required],
      amendedContact: [{ value: '', disabled: true }, Validators.required],
      finalWork: [{ value: '', disabled: true }, Validators.required],
      OriginalDate: [{ value: '', disabled: true }, Validators.required],
      LastAmndDate: [{ value: '', disabled: true }, Validators.required],
      ActualComDate: [{ value: '', disabled: true }, Validators.required],
    })
    this.billForm = this.fb.group({
      billType: ['', Validators.required],
      billNumber: ['', Validators.required],
      invoicePeriodStart: ['', Validators.required],
      invoicePeriodEnd: ['', Validators.required],
      billRef: ['', Validators.required],
      dated: [{ value: this.currentDate, disabled: false }, Validators.required],
      invoiceAmount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      amountAsPerLineItems: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      billReceiptDate: ['', Validators.required],
      paymentDueDate: [{ value: '', disabled: true }], // Auto Populated
      sesDprNo: ['']
    },
      { validator: [this.dateRangeValidator, this.invoiceAmountValidator] });
    this.userdata = JSON.parse(localStorage.getItem('userdata') || '');
  }

  ngOnInit() {
    this.getInvoiceCategory()
  }
  validateAmountInput(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    const charStr = String.fromCharCode(charCode);
    const currentValue = (event.target as HTMLInputElement).value;

    // Allow only numbers and a single dot
    if (!/^\d*\.?\d{0,2}$/.test(currentValue + charStr)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  dateRangeValidator(group: AbstractControl) {
    const start = group.get('invoicePeriodStart')?.value;
    const end = group.get('invoicePeriodEnd')?.value;
    return start && end && new Date(start) > new Date(end) ? { dateInvalid: true } : null;
  }
  invoiceAmountValidator(group: AbstractControl) {
    const invoiceAmount = group.get('invoiceAmount')?.value;
    const amountAsPerLineItems = group.get('amountAsPerLineItems')?.value;
    const billType = group.get('billType')?.value;
    if (billType == '13') {
      return invoiceAmount && amountAsPerLineItems && (invoiceAmount != amountAsPerLineItems) ? { invalidAmount: true } : false;
    }
    else {
      return null
    }

  }
  getInvoiceCategory() {
    const url = 'master/getBillInvoiceType'
    this.apiService.dataPost(url, { "id": 0 }).subscribe(
      (response: any) => {
        this.optionInvoiceCategory = response.data
      },
      (error: any) => {
        this.apiService.handleError(error)
      }
    )
  }

  async clickEvent() {
    this.submitted = false

    if (this.invoicetypeId == '') {
      this.submitted = true
      return
    }

    if (this.poNumber == '') {
      this.submitted = true
      return
    }

    this.getRequiredDocument()
    // this.checkPONumber(this.poNumber)
    this.checkFinalBillExists(Number(this.poNumber))
  }

  checkFinalBillExists(contractNumber: number): boolean {
    let finalBillExists = false;
    const url = 'contract/isFinalBillExist'
    let passParams = {
      "contractNumber": contractNumber,
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (response: any) => {
        finalBillExists = response?.data?.finalBillexist;
        if (finalBillExists) {
          this.isError = true;
          this.errorMessage = 'Final bill already exists for this contract number.';
        } else {
          this.isError = false;
          this.checkPONumber(this.poNumber)
        }
      },
      error => {
        this.apiService.handleError(error)
      }
    )
    return finalBillExists;
  }

  checkPONumber(PONumber: any) {
    //
    this.apiService.dataGet(`contract/checkVendorPoValidation?poNumber=${PONumber}&vendorCode=${this.userdata.ACCOUNTNUMBER}`).subscribe((res: any) => {
      // console.log('res', res);
      if (res.status.toLowerCase() === ('Failed').toLowerCase()) {
        this.isPODetail = false
        this.inValidPO = true

      }
      else {
        // this.isPODetail = true
        // this.inValidPO = false
        // this.status = !this.status;

        if (this.invoiceTypeName == 'DPR') {
          const url = 'contract/getAbgIsExist'
          let passParams = {
            "contractNumber": this.poNumber,
          }
          this.apiService.dataPost(url, passParams).subscribe(
            (response: any) => {
              this.isAbgIsExist = false;

              this.isPODetail = true
              this.inValidPO = false
              this.status = !this.status;

              this.getPODetails(this.poNumber)
              this.getContractDetailsByPoNumber(this.poNumber);
            },
            (error: any) => {
              this.isAbgIsExist = true;
              this.errorMessageForSubmit = error.error?.message || 'An error occurred while checking ABG existence.';
              this.apiService.handleError(error)

              return;
            }
          )
        }

        if (this.invoiceTypeName != 'DPR') {
          this.isPODetail = true
          this.inValidPO = false
          this.status = !this.status;

          this.getPODetails(this.poNumber)
          this.getContractDetailsByPoNumber(this.poNumber);
        }

      }

    },
      error => {
        this.apiService.handleError(error)
        this.isPODetail = false
      })
  }
  getLatestBillNumber(contractId: number) {
    this.isLoader = true
    this.apiService.dataGet(`contract/getLatestBillSequenceNumber?contractId=${contractId}`).subscribe(
      (response: any) => {
        this.billForm.get('billNumber')?.setValue(response.billSequenceNumber);
        this.billForm.get('billNumber')?.disable()
        this.billInvoiceNumber = response.billSequenceNumber
        console.log('this.billInvoiceNumber', this.billInvoiceNumber);
        this.getDocumentList()
        this.isLoader = false
      },
      error => {
        this.isLoader = false
        this.apiService.handleError(error)
      })
  }
  getPODetails(PONumber: any) {
    let PoNumber = PONumber
    this.apiService.dataGet(`contract/getPODetails?poNumber=${PoNumber}`).subscribe(
      (response: any) => {
        // console.log((response.data));
        this.items = response.data?.poItems;
        const poInvoiceItems = this.items.map((item: any) => ({
          poInvoiceItemID: null,
          purchaseOrderItemNo: item.purchaseOrderItemNo,
          itemDescription: item.itemDescription,
          materialNumber: item.materialNumber,
          plantCode: item.plantCode,
          quantity: item.quantity,
          unitOfMeasure: item.unitOfMeasure,
          netPrice: item.netPrice,
          pricePerUnit: item.pricePerUnit,
          taxCode: item.taxCode,
          isNoMoreGR: "N",
          isFinalInvoice: item.isFinalInvoice || "Y",
          contractNo: item.contractNo,
          contractItemNo: item.contractItemNo,
          hsnCode: null,
          packageNo: item.packageNo,
          subPackageNo: null,
          taxRate: null,
          rate: null,
          poNumber: this.poNumber,
          createdBy: this.userdata.NAME,
          createdDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updatedBy: this.userdata.NAME,
          updatedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
          storageLocation: null,
          materialGroup: null,
          remainingQuantity: null,
          maxAllowQty: null,
          itemCat: item.itemCat,
          preqNo: item.preqNo,
          preqItem: item.preqItem,
          subSesDetails: item.subSesDetails
        }));

        // console.log(poInvoiceItems);
        this.items = poInvoiceItems
        this.totalItems = this.items.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.updatePagination();
      },
      error => {
        this.apiService.handleError(error)
      }
    )
  }

  getContractDetailsByPoNumber(poNumber: any) {
    this.isLoader = true;
    this.apiService.dataGet(`contract/getContractDetailsByPoNumber?poNumber=${poNumber}`).subscribe(
      (response: any) => {
        // console.log((response.data));
        this.setData(response.data);
        this.contractDetails = response?.data;
        this.setContractId(response?.data?.contractId);
        this.findComplianceDocumentExpired(response?.data?.contractId);
        this.isLoader = false;
        if (this.invoiceTypeName == 'RA Bill') {
          this.getLatestBillNumber(this.contractDetails.contractId)
        }
      },
      error => {
        this.isLoader = false;
        this.apiService.handleError(error)
      }
    )
  }

  setContractId(id: any) {
    localStorage.setItem('contractId', id);
  }

  getContractId(): string | null {
    return localStorage.getItem('contractId');
  }

  onFilesUploaded(files: File[]) {
    const maxSizeInBytes = 500 * 1024 * 1024; // 500 MB
    this.selectedFiles_document = files;
    this.errorMessage = ''
    // Check if any file exceeds the size
    this.oversizedFile = files.find(file => file.size > maxSizeInBytes);

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
    this.errorMessage = ''
    this.oversizedFile = files.find(file => file.size > maxSizeInBytes);
    if (this.oversizedFile) {
      this.fileErrorExists = `The file exceeds the 500 MB limit.`;
    } else {
      this.fileErrorExists = '';
    }
  }

  invoiceTypeSelect(event?: any, invoicetype?: any) {

    let invoice_type = event.target?.value ? event.target.value : invoicetype;
    if (invoice_type == 'Material') {
      this.commonService.routeToPage('./dashboard/material-invoice');
    } else if (invoice_type == 'Service') {
      this.commonService.routeToPage('./dashboard/service-invoice');
    } else if (invoice_type == 'SLA') {
      this.commonService.routeToPage('./dashboard/sla-invoice');
    } else if (invoice_type == 'Freight-Inbound') {
      this.commonService.routeToPage('./dashboard/conditional-invoice');
    } else if (invoice_type == 'Reward') {
      this.commonService.routeToPage('./dashboard/reward-invoice');
    } else if (invoice_type == 'Contracts') {
      this.commonService.routeToPage('./CAD/contract/invoice');
    } else {
      /* this.purchaseForm.controls['submission_to'].enable();
      this.purchaseForm.controls['submission_to'].setValidators([Validators.required]);
      this.purchaseForm.controls['submission_to'].updateValueAndValidity();
      this.purchaseForm.controls['attach_data_supp'].setErrors();
      this.purchaseForm.controls['attach_data_supp'].setValidators();
      this.purchaseForm.controls['attach_data_supp'].updateValueAndValidity(); */
    }
  }

  // toggleSelectionForService(item: any, event?: any) {
  //   if (event.target.checked) {
  //     this.POServiceItemList.map((i: any) => {
  //       if (i.purchaseOrderItemNo === item.purchaseOrderItemNo) {
  //         i.isSelected = true;
  //       }
  //     });
  //     this.selectedItems.push({ ...item, updatedQuantity: item.quantity, grossAmount: 0, isSelected: true });

  //   } else {
  //     this.POServiceItemList.map((i: any) => {
  //       if (i.purchaseOrderItemNo === item.purchaseOrderItemNo) {
  //         i.isSelected = false;
  //       }
  //     });
  //     this.selectedItems = this.selectedItems.filter(i => i.purchaseOrderItemNo !== item.purchaseOrderItemNo);
  //   }
  // }
  //   toggleSelection(item: any, event?: any) {
  //   if (event.target.checked) {
  //     this.pagedData.forEach((i: any) => i.isSelected = false);
  //     this.selectedItems = [];

  //     this.pagedData.forEach((i: any) => {
  //       if (i.purchaseOrderItemNo === item.purchaseOrderItemNo) {
  //         i.isSelected = true;
  //       }
  //     });

  //     // Add the selected item
  //     // this.selectedItems.push({
  //     //   ...item,
  //     //   updatedQuantity: item.quantity,
  //     //   grossAmount: 0,
  //     //   isSelected: true
  //     // });

  //     // Update POServiceItemList
  //     // let data = {...item['subSesDetails'],purchaseOrderItemNo: item.purchaseOrderItemNo}
  //     let data = item.subSesDetails.map((subItem: any) => ({
  //       ...subItem,
  //       purchaseOrderItemNo: item.purchaseOrderItemNo
  //     }));

  //     this.POServiceItemList =data;
  //     console.log('POServiceItemList', this.POServiceItemList);

  //   } else {
  //     // Unchecking the item - remove from selectedItems
  //     this.POServiceItemList =[]
  //     this.selectedItems = []
  //     this.pagedData.forEach((i: any) => {
  //       if (i.purchaseOrderItemNo === item.purchaseOrderItemNo) {
  //         i.isSelected = false;
  //       }
  //     });

  //     // this.selectedItems = this.selectedItems.filter(
  //     //   i => i.purchaseOrderItemNo !== item.purchaseOrderItemNo
  //     // );
  //     // this.POServiceItemList = this.
  //     // Optionally clear POServiceItemList if needed
  //     if (this.selectedItems.length === 0) {
  //       this.POServiceItemList = [];
  //     }
  //   }
  //   // this.isAllSelected()
  // }
  toggleSelectionForService(item: any, event?: any) {
    const isChecked = event?.target?.checked;

    item.isSelected = isChecked;
    console.log('item.isSelected', item);
    if (isChecked) {
      this.selectedItems.push({
        ...item,
        updatedQuantity: item.remainingQuantity,
        grossAmount: 0
      });
      // }
    } else {
      // Uncheck
      this.selectedItems = this.selectedItems.filter(
        i => i.itemNumber !== item.itemNumber
      );
    }

    this.isAllSelected();
  }

  toggleSelection(item: any, event?: any) {
    const isChecked = event?.target?.checked;
    console.log('item', item);

    // Reset selection state
    this.pagedData.forEach(i => i.isSelected = false);
    this.selectedItems = [];
    this.POServiceItemList = [];

    if (isChecked) {
      item.isSelected = true;

      // Populate POServiceItemList
      const subItems = item.subSesDetails[0]?.subDetails.map((subItem: any, index: any) => ({
        ...subItem,
        purchaseOrderItemNo: item.purchaseOrderItemNo,
        isSelected: false,// initially not selected,
        itemNumber: index,
      }));

      this.POServiceItemList = subItems;
    }
  }



  isAllSelected(): boolean {
    this.allSelected = this.POServiceItemList.length > 0 &&
      this.POServiceItemList.every(item => item.isSelected === true);
    this.cdr.detectChanges()
    return this.allSelected
  }

  disableAllSelection() {
    const allQuantityZero = this.POServiceItemList.every(item => Number(item.quantity) <= 0);
    if (allQuantityZero) {
      return true;
    }
    else {
      return false
    }
  }

  disableSelection() {
    const allQuantityZero = this.POServiceItemList.every(item => Number(item.quantity) <= 0);
    if (allQuantityZero) {
      return true;
    }
    else {
      return false
    }
  }


  // Toggle all selections for current page
  // toggleAllSelection(event: Event) {
  //   const checked = (event.target as HTMLInputElement).checked;

  //   this.POServiceItemList.forEach(item => {
  //     if (checked) {
  //       if (!this.selectedItems.some(i => i.purchaseOrderItemNo === item.purchaseOrderItemNo)) {
  //         if (item.quantity > 0) {
  //           item.isSelected = true;
  //         }

  //       }
  //           this.selectedItems.push({ ...item, updatedQuantity: item.quantity, grossAmount: 0, isSelected: true });

  //     } else {
  //       item.isSelected = false;
  //       this.selectedItems = this.selectedItems.filter(i => i.purchaseOrderItemNo !== item.purchaseOrderItemNo);
  //     }
  //   });
  //   console.log('slected',this.selectedItems)
  // }
  toggleAllSelection(event: any) {
    const isChecked = event.target.checked;

    this.allSelected = isChecked;
    this.selectedItems = [];

    this.POServiceItemList.forEach(item => {
      if (item.quantity > 0) {
        item.isSelected = isChecked;
        if (isChecked) {
          this.selectedItems.push({
            ...item,
            updatedQuantity: item.remainingQuantity,
            grossAmount: 0
          });
        }
      }
    });
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const key = event.key;
    return /^\d$/.test(key); // Allows only digits (0-9)
  }

  getRequiredDocument() {
    let data = {
      "id": this.invoicetypeId
    }
    this.apiService.dataPost('master/getInvoiceDocumentType', data).subscribe(
      (response: any) => {
        let result = response?.data[0]?.documentList

        this.optionDocumentDetails = response.data.length ? result.filter((item: any) => item.doctypename != 'Invoice') : []
      },
      error => {
        this.apiService.handleError(error)
      }
    )
  }

  getDocumentList() {
    this.billInvoiceNumber = this.billForm.get('billNumber')?.value
    let data = {
      "contratInvoiceRefNo": this.billInvoiceNumber + '-' + this.contractDetails.vendorCode + '-' + this.contractDetails?.contractNumber,
    }
    this.apiService.dataPost('contract/getInvoiceDocument', data).subscribe(
      (response: any) => {
        this.DocumentDetails = response.data.length ? response.data : []
      },
      error => {
        this.apiService.handleError(error)
      })
  }

  onView(value: any) {

    console.log('on view', value);
    this.openDocumentModal()
    this.openDocument(value)
  }

  openDocument(value: any) {
    console.log('openDocument', value);
    this.isLoader = true
    let data = {
      "Url": value.rowData.location
    }
    this.apiService.dataPost('contract/DocumentDownload', data).subscribe(
      (response: any) => {
        this.base64String = response?.data?.Base64String
        this.isLoader = false
        console.log('this.base64String ', this.base64String);
      },
      error => {
        this.apiService.handleError(error)
        this.isLoader = false
      }
    )
  }

  onChangeRequiredDocument(value: any) {
    // this.selectedRequiredDoc = value.target.value;
    const selectElement = value.target as HTMLSelectElement;
    this.selectedRequiredDoc = selectElement.options[selectElement.selectedIndex].text;
    if (this.selectedRequiredDoc == '') {
      this.fileUploadComponents.toArray()[1].cleanFile()
    }

    this.documenttypeid = this.optionDocumentDetails.filter((item: any) => item.invoicedocumenttypeid == this.selectedRequiredDocId)[0].fkdocumenttypeid
    console.log('documenttypeid', this.documenttypeid);
    this.errorMessage = ''
    this.fileErrorExists = ''
  }

  invoiceCategorySelect(value: any) {
    const selectElement = value.target as HTMLSelectElement;
    this.invoiceTypeName = selectElement.options[selectElement.selectedIndex].text;
    this.invoicetypeId = value.target.value;

    this.selectedRequiredDocId = ''
    if (this.invoiceTypeName == 'RA Bill') {
      this.billForm?.get('amountAsPerLineItems')?.setValidators([Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]);
      this.billForm?.get('amountAsPerLineItems')?.updateValueAndValidity();
    }
    else {
      this.billForm?.get('amountAsPerLineItems')?.clearValidators();
      this.billForm?.get('amountAsPerLineItems')?.updateValueAndValidity();
    }
  }

  uploadDocument(docType?: string) {
    this.documentError = false;
    this.errorMessageForSubmit = ''

    this.billInvoiceNumber = this.billForm.get('billNumber')?.value;
    if (this.billForm.invalid) {
      this.errorMessage = 'Please Enter Bill Details';
      return
    }
    const docAlreadyExists = this.DocumentDetails.some(doc => doc.documentname === this.selectedRequiredDoc)
    if (docAlreadyExists) {
      this.errorMessage = 'Document Already Exists'
      return
    }
    if (this.oversizedFile) {
      this.fileErrorExists = `The file exceeds the 500 MB limit.`;
      return
    }
    this.errorMessage = ''

    const url = 'contract/addInvoiceDocument'
    let files: File
    let data = {
      "invoicenumber": this.billInvoiceNumber,
      "contractid": this.getContractId(),
      "fkdocumenttypeid": this.documenttypeid,
      "doctypename": this.selectedRequiredDoc,
      "invoicedocumenttypeid": this.selectedRequiredDocId,
      "invoiceTypeName": this.invoiceTypeName,
      "documentid": 0,
      "loginuser": this.apiService.getUserName(),
      "contractinvoicerefno": this.billInvoiceNumber + '-' + this.contractDetails.vendorCode + '-' + this.contractDetails?.contractNumber, //invoicenumber + contractNumber
    }
    if (docType === 'invoiceUpload') {
      // const docAlreadyExists = this.DocumentDetails.some(doc => doc.documentname === 'Attachment')
      // if(docAlreadyExists){
      //   this.errorMessage = 'Document Already Exists'
      //   return
      // }
      data['fkdocumenttypeid'] = '1',
        data["doctypename"] = 'Invoice',
        data["invoicedocumenttypeid"] = '1'
      files = this.selectedFiles_invoice[0]
    }
    else {
      files = this.selectedFiles_document[0]
    }
    this.isLoader = true
    this.apiService.uploadInvoiceDocument(url, data, files).subscribe(
      (response: any) => {
        this.getDocumentList();
        this.isLoader = false
        this.successPopup = true;
        this.popupMessage = 'File uploaded successfully'

        setTimeout(() => {
          this.successPopup = false;
        }, 2000);

        this.selectedRequiredDocId = ''
        this.selectedRequiredDoc = ''
        this.fileErrorExists = ''
        this.selectedFiles_document = []
        this.selectedFiles_invoice = []
        this.selectedFiles_invoice
        // if (this.selectedRequiredDoc == '') {
        this.fileUploadComponents.toArray()[1].cleanFile()
        // }
        // else{
        this.fileUploadComponents.toArray()[0].cleanFile()
        // }
      },
      error => {
        this.errorMessage = this.apiService.handleError(error)
        this.isLoader = false
      }
    )

  }

  resetForm() {
    this.selectedRequiredDocId = ''
    this.selectedRequiredDoc = ''
    this.selectedFiles_document = []
    this.selectedFiles_invoice = []
    this.invoiceTypeName = ''
    this.invoicetypeId = ''
    this.poNumber = ''
    this.status = false
    this.isPODetail = false
    this.billForm.reset();
    this.cjpcForm.reset();
    this.items = []
    this.errorMessageForSubmit = '';
  }

  openDocumentModal() {
    this.isDocumentModalOpen = true
  }

  closeDocumentModal() {
    this.isDocumentModalOpen = false;
  }
  setData(data: any) {
    if (!this.cjpcForm) return;

    this.cjpcForm.patchValue({
      ProjectName: data?.wbsCcProjectName || '',
      projectCode: data?.projectCode || '',
      package: data?.contractPackage || '',
      ContractorName: data?.vendorName || '',
      vendorCode: data?.vendorCode || '',
      ContractWO: data?.contractNumber || '',
      WODate: data?.contractDate ? moment(data?.contractDate).format('DD-MM-YYYY') : 'NA',
      DateLastAmt: data?.amendmentCompletionDate ? moment(data?.amendmentCompletionDate).format('DD-MM-YYYY') : 'NA',
      completionValue: data?.amendmentValue || '',
      amendedContact: data?.amendmentValue || '',
      finalWork: data?.contractValue,
      OriginalDate: data?.contractCompletionDate ? moment(data?.contractCompletionDate).format('DD-MM-YYYY') : 'NA',
      LastAmndDate: data?.amendmentCompletionDate ? moment(data?.amendmentCompletionDate).format('DD-MM-YYYY') : 'NA',
      ActualComDate: data?.contractActualCompletionDate ? moment(data?.contractActualCompletionDate).format('DD-MM-YYYY') : 'NA',
    });
    this.billForm.get('billType')?.setValue(this.invoicetypeId);
    const selectedTypeId = this.optionInvoiceCategory.filter((item: any) => item.billInvoiceTypeId == this.invoicetypeId);
    this.billForm.get('paymentDueDate')?.setValue(this.getPaymentDueDate(selectedTypeId[0]?.stdPaymentDay));
    this.billForm.get('billType')?.disable()
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
  getPaymentDueDate(tdpaymentday: number): string {
    const currentDate = new Date(); // Get the current date
    currentDate.setDate(currentDate.getDate() + tdpaymentday); // Add the tdpaymentday
    let date = moment(currentDate.toISOString().split('T')[0]).format('DD-MM-YYYY')
    this.paymentDueDate = moment(currentDate.toISOString().split('T')[0]).format('YYYY-MM-DD')
    return date; // Return date in YYYY-MM-DD format
  }

  updatePagedData(): void {
    let tableData = []
    if (this.filterTableData.length > 0) {
      tableData = this.filterTableData ? this.filterTableData.slice(this.startIndex, this.endIndex) : [];
    } else {
      tableData = this.items ? this.items.slice(this.startIndex, this.endIndex) : [];

    }
    this.pagedData = tableData;
  }

  onPageChange(event: any): void {
    const selectedPage = event.target.value;
    this.currentPage = parseInt(selectedPage);
    this.updatePagedData();
    this.updateVisiblePages();
    this.isAllSelected()
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
    this.pagedData = this.items.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );

    this.generatePageNumbers();
  }

  generatePageNumbers() {
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.visiblePages = this.getVisiblePages();
  }

  getVisiblePages(): number[] {
    const range = 2; // Show 2 pages before and after the current page
    let start = Math.max(1, this.currentPage - range);
    let end = Math.min(this.totalPages, this.currentPage + range);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      this.updatePagedData();
      this.updateVisiblePages();
      // this.toggleAllSelection()
      this.isAllSelected()
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
    this.isAllSelected()
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
    this.isAllSelected()
  }

  calculateGrossAmount(item: any, index: number) {
    const quantity = Number(item.updatedQuantity) || 0;
    const netPrice = Number(item.grPrice) || 0;
    item.netPrice = netPrice.toFixed(2);
    item.grossAmount = (quantity * netPrice).toFixed(2);

    this.getTotalNetPrice()
    this.getTotalGrossAmount()

    return parseFloat(item.grossAmount);
  }

  getTotalNetPrice(): number {
    const totalNetPrice = this.selectedItems.reduce((sum, item) => sum + (Number(item.grPrice) || 0), 0);
    const totalNetP = totalNetPrice.toFixed(2)
    return parseFloat(totalNetP);
  }

  getTotalGrossAmount() {
    const totalGrossAmount = this.selectedItems.reduce((sum, item) => sum + (Number(item.grossAmount) || 0), 0);
    this.billForm.get('amountAsPerLineItems')?.setValue(parseFloat(totalGrossAmount.toFixed(2)));
    return parseFloat(totalGrossAmount.toFixed(2));
  }

  isQuantityValid(): boolean {
    return this.selectedItems.every(item => item.updatedQuantity <= item.quantity);
  }

  checkIfAllRequiredDocsUploaded(documentList: any[], uploadedDocs: any[]): boolean {
    if (!documentList?.length || !uploadedDocs?.length) return false;

    // Normalize and compare
    return documentList.every(requiredDoc => {
      const requiredName = requiredDoc.doctypename?.trim().toLowerCase();
      return uploadedDocs.some(uploadedDoc =>
        uploadedDoc.documentname?.trim().toLowerCase() === requiredName
      );
    });
  }



  finalSubmit() {
    this.submitted = true
    if (this.billForm.invalid) {
      this.billForm.markAllAsTouched();
      return;
    }
    if (!this.isQuantityValid()) {
      // this.errorMessageForSubmit ="Some items have exceeded the original quantity. Please correct them before submitting."
      // alert("Some items have exceeded the original quantity. Please correct them before submitting.");
      return;
    }
    if (this.submitted && this.selectedItems.length <= 0 && this.invoiceTypeName == 'RA Bill') {
      return
    }
    const allDocsUploaded = this.checkIfAllRequiredDocsUploaded(this.optionDocumentDetails, this.DocumentDetails,);
    if (!allDocsUploaded) {
      this.documentError = true;
      return;
    } else {
      this.documentError = false;
    }
    // let updatedArray = this.selectedItems.map((item: any) => {
    //   return {
    //     ...item,
    //     quantity: item.updatedQuantity,
    //     netPrice: this.calculateGrossAmount(item, item.updatedQuantity),
    //   };
    // });
    let updatedArray: any = this.pagedData.filter((item: any) => item.isSelected)
    let poSubSesDetails = this.selectedItems.map((item: any) => {
      return {
        // ...item,
        extLineNo: item.extLineNo,
        materialGroup: item.materialGroup,
        netValue: this.calculateGrossAmount(item, item.updatedQuantity),  //item.netValue,
        packageNo: item.packageNo,
        quantity: item.updatedQuantity,
        itemDescription: item.itemDescription,
        subPackageNo: item.subPackageNo,
        taxCode: item.taxCode,
        taxTariffCode: item.taxTariffCode,
        grPrice: this.calculateGrossAmount(item, item.updatedQuantity),
        poNumber: this.poNumber,
        purchaseOrderItemNo: item.purchaseOrderItemNo,
        tax: 0,
        createdBy: this.userdata.NAME,
        createdDate: null,
        updatedBy: null,
        updatedDate: null
      };
    })
    if (updatedArray.length > 0) {
      updatedArray[0]['poSubSesDetails'] = poSubSesDetails;
      delete updatedArray[0]['subSesDetails']
      delete updatedArray[0]['isSelected']
      updatedArray[0]['poSubSesDetails'].forEach((item: any) => delete item['isSelected'])
    }
    console.log('poSubSesDetails', poSubSesDetails);
    console.log('updatedArray', updatedArray);

    const formData = this.billForm.getRawValue();
    let json =
    {
      "billinvoiceid": null,
      "fkcontractid": this.contractDetails.contractId,
      "fkvendorid": this.userdata.VENDORID,
      "vendorCode": this.userdata.ACCOUNTNUMBER,
      "fkbillinvoicetypeid": Number(this.invoicetypeId),
      "runningaccbillno": formData.billRef,
      "runningaccbilldt": new Date().toISOString().split('T')[0],//need to discuss 
      "invoicenumber": formData.billNumber,
      "invoicedate": this.currentDate, //formData.dated,
      "invoicefromdate": formData.invoicePeriodStart,
      "invoicetodate": formData.invoicePeriodEnd,
      "invoicegrossamount": Number(formData.amountAsPerLineItems),
      "cgst": 0.000, //need to discuss
      "sgst": 0.000,//need to discuss
      "isgs": 0.000,//need to discuss
      "netpayableamount": Number(formData.invoiceAmount),
      "sesnumber": "1",
      "invoicereceiveddate": formData.billReceiptDate,
      "invoiceprocessdate": moment(this.paymentDueDate).format('YYYY-MM-DD'),
      "status": "Pending",
      "isactive": true,
      "contractinvoicerefno": this.billInvoiceNumber + '-' + this.contractDetails.vendorCode + '-' + this.contractDetails?.contractNumber,
      "createdby": this.userdata.NAME,
      "createddate": new Date().toISOString().replace('T', ' ').substring(0, 19),
      // "updatedby": "",
      // "updateddate": "",
      "poInvoiceItems": updatedArray,
      "additionalInfo":
      {
        "dprNumber": formData.sesDprNo,
      }
    }
    // console.log('json', json);
    // return
    // console.log('json', json)
    this.isSubmitLoader = true
    this.isLoader = true
    this.apiService.dataPost('contract/setInvoice', json).subscribe((res: any) => {

      this.successPopup = true;
      this.popupMessage = res?.message ? res.message : 'Invoice Has Been Generated';
      setTimeout(() => {
        this.submitted = false;
        this.isSubmitLoader = false;
        this.billForm.reset();
        this.router.navigate(['CAD/vendor/home']);
      }, 3000);

      this.isLoader = false

    }, error => {
      this.isSubmitLoader = false;
      this.submitted = false;
      this.isLoader = false
      this.errorMessageForSubmit = this.apiService.handleError(error)
    })
  }
  // onClickHere(item:any){
  //   console.log('item',item)
  // }
  validateDocument(data: any[]): boolean {
    if (!data || data.length === 0) return false;

    const doc = data[0]; // or loop if multiple entries
    return !!(doc.documentname && doc.invoicedocumentid);
  }
  onDelete(item: any) {

    //  return ;
    // if(this.DocumentDetails.length <=0 && !docAlreadyExists){
    this.apiService.dataGet(`contract/removeDocument?invoiceDocumentId=${item.invoicedocumentid}`).
      subscribe(
        response => {
          this.successPopup = true;
          this.popupMessage = 'Document Deleted Successfully'
          setTimeout(() => {
            this.successPopup = false;
          }, 2000);

          this.getDocumentList()
        },
        error => {
          console.log('Error while deleting data', error);
          this.errorMessage = error?.error?.message
          // this.deletePopup = false
        }
      )
    // }

  }
  onClickHere(value: any) {
    console.log('histoy', value);
    this.DocLink = value.location
    this.openDocumentModal();
  }
  findComplianceDocumentExpired(contractId: any) {

    let data = {
      "contractId": contractId
    }
    this.apiService.dataPost('contract/findComplianceDocumentExpire', data).subscribe(
      (response: any) => {
        this.expiredDocList = response.data.docList ? response.data.docList : []
        this.expiredDocList = this.expiredDocList.map((item: any) => {
          return {
            ...item,
            validityenddate: moment(item.expiryDate).format('DD-MM-YYYY'),
          }
        })
        this.isExpired = response.data.isExpired ? response.data.isExpired : false;
        if (this.isExpired == true) {
          this.ExpiredModalOpen = true;
        }
      },
      error => {
        this.apiService.handleError(error)
      })
  }
  closeExpiredModal() {
    this.ExpiredModalOpen = false;
  }

  goBack() {
    this.router.navigate(['CAD/vendor/home']);
  }
}
