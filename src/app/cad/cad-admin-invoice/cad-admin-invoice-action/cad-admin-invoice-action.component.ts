import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-cad-admin-invoice-action',
  templateUrl: './cad-admin-invoice-action.component.html',
  styleUrls: ['./cad-admin-invoice-action.component.scss']
})
export class CadAdminInvoiceActionComponent {
  isLoader: boolean = false;
  submitted: boolean = false;
  documentModal: boolean = false;
  billForm!: FormGroup;
  invoiceDetails:any;
  popupMessage: string = '';
  successPopup : boolean = false
  panels = [
    { title: 'PO Items', isOpen: false },
    { title: 'Documents', isOpen: false },
  ]
  simpleTableDetails = []
  simpleTableColumns = [
    { header: 'PO Number', field: 'poNumber' },
    { header: 'PO Item Number', field: 'poItemNo' },
    { header: 'Quantity', field: 'quantity' },
    { header: 'Service Sheet Number', field: 'serviceSheetNo', },
  ];
  items: any;
  poItems:any[]=[]
  invoiceId:any
  optionInvoiceCategory: any[] = [];
  isDocumentModalOpen: boolean = false;
  base64String: string | null | undefined;
  openDocumentListModal:boolean = false;
  recoveryDocuments: any[] = []
  docViewModelOpen: boolean = false;
   bash64String:string ='';
   recoveryId: any;
   releaseRemarks: any;
   releaseAmount: any;
   openReleaseModal: boolean = false;
  invoiceTypeId: any;
  isSESGenerated: boolean = false;
  poSesDetails: any;
  invoicePDFDocuments: any[] = []
  remarksForm!:FormGroup
  document_remarks: any;
  charCount: number = 0;
  remarkModal: boolean = false;
  status: string = '';
  errorMessage: any;
  constructor(
    private breadcrumbService: BreadcrumbService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private router:Router,
    private formService:FormService
  ) {
    this.breadcrumbService.setBreadcrumbUrl();
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { invoiceid: string };
    this.invoiceId = state?.invoiceid
    if(this.invoiceId){
      localStorage.setItem('invoiceId',this.invoiceId)
    }
    console.log('invoice id',this.invoiceId)
    if(localStorage.getItem('invoiceId') != 'undefined'){
      this.invoiceId = localStorage.getItem('invoiceId')
    }
  }
 
  ngOnInit() {
    this.billForm = this.fb.group({
      billType: [{ value: '', disabled: true }, Validators.required],
      billNumber: [{ value: '', disabled: true }, Validators.required],
      invoicePeriodStart: [{ value: '', disabled: true }, Validators.required],
      invoicePeriodEnd: [{ value: '', disabled: true }, Validators.required],
      billRef: [{ value: '', disabled: true }, Validators.required],
      dated: [{ value: '', disabled: true }, Validators.required],
      invoiceAmount: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      amountAsPerLineItems: [{value:'',disabled: true}, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      billReceiptDate: [{ value: '', disabled: true }, Validators.required],
      paymentDueDate: [{ value: '', disabled: true }], // Auto Populated
      sesDprNo: [{ value: '', disabled: true }] // Auto Populated
    },)
    this.remarksForm = this.fb.group({
      remarks: ['', Validators.required]
    })
    this.getInvoiceDetails(this.invoiceId)
    this.getInvoiceCategory()
    this.getInvoiceDocument();
    this.getSESDetails()
  }
  updateCharCount_Document() {
    this.charCount = this.document_remarks.length;
  }
  invoiceCategorySelect(value: any) {
    const selectElement = value.target as HTMLSelectElement;
  }
  ngOnDestroy(){
    localStorage.removeItem('invoiceId')
  }
  togglePanel(panel: any) {
    this.panels.forEach(p => {
      p.isOpen = (p === panel) ? !p.isOpen : false;
    });
  }
  closeDocumentModal() {
    this.documentModal = false;
    // this.resetForm()
    // this.errorMessage = ''
  }
  openDocumentModal() {
    this.openDocumentListModal = true;
  }
  openInvoiceDocumentModal() {
    this.docViewModelOpen = true
    this.onViewDocument(this.invoicePDFDocuments[0].location);
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

  generateSES(){
    this.isLoader = true
    const url = 'contract/generateSES';
    let data ={
      "invoiceId": Number(this.invoiceId),
      "user":this.apiService.getUserName(),
      "date":new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    this.successPopup = false
    this.apiService.dataPost(url, data).subscribe(
      (response: any) => {
        this.isLoader = false
        this.successPopup = true
        this.popupMessage = 'SES Generated Successfully'
        this.poSesDetails = response.data
        if(this.poSesDetails.length > 0){
        this.isSESGenerated = true
        }
      },
      (error: any) => {
        this.apiService.handleError(error)
        this.isLoader = false
        this.errorMessage = error?.error?.message
      }
    )
  }

  setCJPC(status:string){
    this.remarkModal = true;
    this.status = status
  }
  setCJPCStatus(status:string){
    if(status != 'Created')
    {
      this.formService.trimFormValues(this.remarksForm);
      this.remarksForm.markAllAsTouched()
      if(this.remarksForm.invalid) {
        return;
      }
    }
    const url = 'contract/setCJPC';
    let data ={
      "invoiceId": Number(this.invoiceId),
      "status" : status,
      "user":this.apiService.getUserName(),
      "remarks": this.remarksForm.value.remarks,
      "date":new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    this.isLoader = true
    this.apiService.dataPost(url, data).subscribe(
      (response: any) => {
        this.successPopup = true
        this.popupMessage = status =='Reject' ? 'Invoice rejected.' : response.message;
        this.closeRemarkModal()
        setTimeout(() => {
          this.isLoader = false
          this.successPopup = false;
          this.popupMessage = ''
          //  this.router.navigate(['CAD/invoice']) 
          window.history.back()
        }
        , 5000)
        // if(status == 'Created'){
         
        // }
      },
      (error: any) => {
        this.apiService.handleError(error);
        this.isLoader = false
        this.errorMessage = error?.error?.message
      }
    )
  }

  resetRemarks(){
    this.remarksForm.reset()
    this.charCount = 0
    this.document_remarks = ''
    this.errorMessage = ''
  }
  closeRemarkModal(){
    this.remarkModal = false;
   this.resetRemarks()
  }

  getInvoiceDetails(invoiceId:any){
    this.apiService.dataGet(`contract/getInvoice?invoiceId=${invoiceId}`).subscribe(
      (response: any) => {
        console.log((response.data));
        this.invoiceDetails =response.data
        this.status = this.invoiceDetails.status
        this.setData(this.invoiceDetails)
        this.poItems = response.data?.poInvoiceItems
        this.poItems = response.data?.poInvoiceItems;
        const poInvoiceItems = this.poItems.map((item: any) => ({
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
          poNumber: item.poNumber,
          // createdBy: "admin",
          // createdDate: "2025-03-24 09:21:08",
          // updatedBy: "admin",
          // updatedDate: "2025-03-24 09:21:08",
          storageLocation: null,
          materialGroup: null,
          remainingQuantity: null,
          maxAllowQty: null,
          itemCat: item.itemCat,
          preqNo: item.preqNo,
          preqItem: item.preqItem,
          poSubSesDetails:item.poSubSesDetails
        }));
        
        console.log(poInvoiceItems);
        this.poItems = poInvoiceItems

      }
    )}

    setData(data:any){
      this.billForm.patchValue({
      billType:data.fkbillinvoicetypeid ,
      billNumber: data.invoicenumber,
      invoicePeriodStart: data.invoicefromdate,
      invoicePeriodEnd: data.invoicetodate,
      billRef: data.runningaccbillno,
      dated:data.invoicedate ,
      invoiceAmount:data.netpayableamount,
      amountAsPerLineItems: data.invoicegrossamount,
      billReceiptDate: data.invoicereceiveddate,
      paymentDueDate: moment(data.invoiceprocessdate).format('DD-MM-YYYY'), 
      })
      this.invoiceTypeId = data.fkbillinvoicetypeid
      if(this.invoiceTypeId != '1'){
        this.panels = [ { title: 'Documents', isOpen: true }]
      }
    }
    rowAction() {
        this.openDocumentListModal = true
    }
    onViewDocument(value: any) {
      console.log('value', value);
      this.docViewModelOpen = true
      this.isLoader = true
      this.apiService.dataPost('contract/DocumentDownload', { "Url": value }).subscribe((res: any) => {
        console.log('res', res);
        this.bash64String = res.data.Base64String
        this.isLoader = false
      },
        (error: any) => {
          this.apiService.handleError(error);
          this.bash64String = ''
        }
      )
  
    }
    getInvoiceDocument() {
      let data = {
        invoiceid: this.invoiceId,
      }
      const url = `contract/getInvoiceDocument`
      this.apiService.dataPost(url,data).subscribe(
        (response: any) => {
          this.recoveryDocuments =  response.data.map((item: any) => ({
            ...item,
            name: item.location != null ? item.location.split('/').pop() : ''
    
          }));
          this.invoicePDFDocuments = this.recoveryDocuments.filter((item: any) => item.documentname == 'Invoice');
          this.recoveryDocuments = this.recoveryDocuments.filter((item: any) => item.documentname != 'Invoice');
        },
        (error: any) => {
          this.apiService.handleError(error)
        }
      )
    }

    getSESDetails() {
      const url = `contract/getSESDetails?invoiceId=${this.invoiceId}`
      this.apiService.dataGet(url).subscribe(
        (response: any) => {
        this.poSesDetails = response.data
        if(this.poSesDetails.length > 0){
          this.isSESGenerated = true;
        }
        },
        (error: any) => {
          this.apiService.handleError(error);
          this.errorMessage = error?.error?.message
        }
      )
    }
}
