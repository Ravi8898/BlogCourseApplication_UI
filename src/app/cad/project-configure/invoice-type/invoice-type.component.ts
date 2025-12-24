import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-invoice-type',
  templateUrl: './invoice-type.component.html',
  styleUrls: ['./invoice-type.component.scss']
})
export class InvoiceTypeComponent {

  columns = [
    { header: 'Invoice Type Id', field: 'billInvoiceTypeId' },
    { header: 'Invoice Type Name', field: 'invoiceTypeName' },
    { header: 'Pay In Days', field: 'stdPaymentDay' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: ['view', 'edit'] }
  ];

  invoiceTypeDetails: any[] = [];

  document_columns = [
    { header: 'Document Id', field: 'invoicedocumenttypeid' },
    { header: 'Document', field: 'doctypename' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: [ 'delete doc'] },

  ];

  documentDetails: any[] = [];
  invoiceTypeModal: boolean = false;
  remark: string = '';
  charCount: number = 0;
  documentsModal: boolean = false;
  document_remarks: string = '';
  charCount_document: number = 0;
  isLoader: boolean = false;
  invoiceForm!: FormGroup;
  errorMessage: string = '';
  successPopup: boolean = false;
  popupMessage:string =''
  submitted: boolean = false;
  isEdit: boolean = false;
  initialFormData: any;
  isFormChanged: boolean = false;
  invoiceId: number = 0;
  optionDocumentType: any[] = [];
  documentsForm: any;
  isLoaderDoc: boolean = false;
  documentId: number = 0;
  deletedItem: any;
  deletePopup: boolean = false;
  isUpdated:boolean = false;
  originalFormValues: any = {};
  constructor(private apiService: ApiService, private fb: FormBuilder,private formService: FormService) {

  }
  ngOnInit() {
    this.getInvoiceTypeList()
    this.invoiceForm = this.fb.group({
      // billInvoiceTypeId: ['0', [Validators.required, Validators.maxLength(18)]],
      invoiceTypeName: ['', [Validators.required, Validators.maxLength(250)]],
      stdPaymentDay: ['', [Validators.required, Validators.maxLength(3)]],
      // isActive:[true],
      // loginuser :[this.apiService.username]
      // remark: ['', [Validators.required, Validators.maxLength(2000)]]
    });
    this.documentsForm = this.fb.group({
      documentType: ['', Validators.required],
      remarkDoc: ['', Validators.required]
    })
    this.invoiceForm.valueChanges.subscribe(() => {
      if(this.isEdit){
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.invoiceForm);
        console.log('this.isUpdated',this.isUpdated)
      }
    });
  }

  onEdit(value: any) {
    console.log('Edit', value);
    this.isEdit = true
    this.invoiceTypeModal = true;
    this.invoiceId = value?.billInvoiceTypeId

    this.invoiceForm.patchValue({
      billInvoiceTypeId: value?.billInvoiceTypeId,
      invoiceTypeName: value?.invoiceTypeName,
      stdPaymentDay: value?.stdPaymentDay,
      isActive: value?.isActive,
    })
    // this.initialFormData = { ...this.invoiceForm.value };
    this.originalFormValues = this.invoiceForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.invoiceForm);
  }

  openInvoiceTypeModal() {
    this.invoiceTypeModal = true;
  }

  closeInvoiceTypeModal() {
    this.invoiceTypeModal = false;
    this.errorMessage = ''
    this.resetForm()
    this.isEdit = false;
  }
  cancel() {
    this.invoiceTypeModal = false;
  }



  onView(value: any) {
    console.log('View', value);
    this.documentsModal = true;
    this.invoiceId = value.billInvoiceTypeId
    this.getInvoiceDocument()
    this.getDocumentTypeDropDown();
  }
  getDocumentTypeDropDown() {
    this.apiService.dataPost('master/getActiveAndInactiveDocumentTypeList/true', {}).subscribe(
      (response: any) => {
        this.optionDocumentType = response?.data
      },
      error => {
        console.log('Error: ', error);
      }
    )
  }
  getInvoiceDocument() {
    let data = {
      "id": this.invoiceId
    }
    this.apiService.dataPost('master/getInvoiceDocumentType', data).subscribe(
      (response: any) => {
        this.documentDetails = response.data.length ?  response.data[0]?.documentList  : []
      },
      error => {
        console.log('Error: ', error);
      }
    )
  }

  // allowOnlyNumbers(event: KeyboardEvent): boolean {
  //   const key = event.key;
  //   return /^\d$/.test(key); // Allows only digits (0-9)
  // }



  updateCharCount_Document() {
    this.charCount_document = this.document_remarks.trim().length;
  }
  resetForm() {
    this.invoiceForm.reset();
    this.invoiceId = 0
    this.charCount = 0
  }
  closedocumentsModal() {
    this.documentsModal = false;
    this.resetFormDoc()
  }

  updateCharacterCount() {
    this.charCount = this.invoiceForm.get('remark')?.value.trim().length || 0;
  }

  saveData() {
    this.formService.trimFormValues(this.invoiceForm)
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched()
      return
    }
    let formData = this.invoiceForm.value;
    let data = {
      "billInvoiceTypeId": this.invoiceId ? this.invoiceId : 0,
      "invoiceTypeName": formData.invoiceTypeName,
      "stdPaymentDay": formData.stdPaymentDay,
      "isActive": true,
      "loginuser": this.apiService.getUserName()
    }
    this.isLoader = true;
    this.apiService.dataPost('master/addBillInvoiceType', data).subscribe(response => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true;
      this.popupMessage = this.isEdit ? 'Invoice Type Updated Successfully': 'Invoice Type Added Successfully'
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);

      this.closeInvoiceTypeModal();
      this.getInvoiceTypeList();

      this.resetForm();

    }, error => {
      this.errorMessage = this.apiService.handleError(error);
      this.isLoader = false;
      this.submitted = false;

    });
  }

 
  getInvoiceTypeList() {
    this.isLoader = true;
    const json = {
      "id": 0
    }
    this.apiService.dataPost('master/getBillInvoiceType', json).subscribe(
      (res: any) => {
        // this.invoiceTypeDetails = res.data.map((item: any) => { item.isActive = item.isActive == true ? 'Active' : 'Inactive'; return item });
        this.invoiceTypeDetails = res.data
        this.isLoader = false;
      },
      (error: any) => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }
  onDelete(value: any) {
    console.log('Delete', value);
    let json = {
      "billInvoiceTypeId": value.billInvoiceTypeId,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    //  console.log('Data deleted successfully', json);
    this.apiService.dataPost('master/addBillInvoiceType', json).subscribe(response => {


      this.getInvoiceTypeList();

    }, error => {
      console.log('Error while deleting data', error);

    });
  }

  saveDocument() {
    this.submitted = true
    this.formService.trimFormValues(this.documentsForm);
    if (this.documentsForm.invalid) {
      this.documentsForm.markAllAsTouched()
      return;
    }

    let formData = this.documentsForm.value
    this.isLoaderDoc = true
    let json = {
      "invoiceDocumentTypeId": this.documentId ? this.documentId : 0,
      "fkInvoiceTypeid": this.invoiceId,
      "fkDocumentTypeid": formData.documentType,
      "remark": formData.remarkDoc,
      "isActive": true,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addInvoiceDocumentType', json).subscribe(
      response => {
        console.log('Data saved successfully', response);
        this.getInvoiceDocument();

        this.isLoaderDoc = false
        this.submitted = false
        this.resetFormDoc()
      },
      error => {
        console.log('Error while saving data', error);
        this.errorMessage = error?.error?.message
        this.isLoaderDoc = false
        this.submitted = false

      }
    )
  }

  resetFormDoc() {
    this.documentsForm.reset()
    this.submitted = false
    this.errorMessage = ''
    this.document_remarks = ''
    this.documentId = 0
    this.charCount_document = 0
  }

  onEditDoc(value: any) {
    console.log('value', value);
    this.documentId = value.invoicedocumenttypeid
    this.documentsForm.patchValue({
      documentType: value.fkdocumenttypeid,
      remarkDoc: value.remark
    })
    this.document_remarks = value.remark
    this.charCount_document = this.document_remarks.trim().length;
  }

  deleteDoc(value: any) {
    this.deletedItem = value
    this.deletePopup = true
  }
 
  closeDelectPopup(){
    this.deletePopup = false
  }

  confirmDelete() {
    console.log('Delete onDeleteDoc', this.deletedItem);
    let json = {
      "invoiceDocumentTypeId": this.deletedItem.invoicedocumenttypeid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addInvoiceDocumentType', json).
      subscribe(
        response => {
          console.log('Data deleted successfully', response);
          this.getInvoiceDocument();
          this.deletePopup = false

        },
        error => {
          console.log('Error while deleting data', error);
          this.errorMessage = error?.error?.message
          this.deletePopup = false
        }
      )
  }
  
}
