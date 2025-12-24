import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-advance-type',
  templateUrl: './advance-type.component.html',
  styleUrls: ['./advance-type.component.scss']
})
export class AdvanceTypeComponent {
  advanceTypeModal: boolean = false;
  documentsModal: boolean = false;
  documentStatus: string = 'Deactivate';
  advance_remarks: string = '';
  document_remarks: string = '';
  charCount_advance: number = 0;
  charCount_document: number = 0;

  columns = [
    { header: 'Advance Type ID', field: 'advanceTypeId' },
    { header: 'Advance Type Name', field: 'advanceTypeName' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: [  'edit'] }
  ];

  advanceTypeDetails: any[] = []
  document_columns = [
    { header: 'Document ID', field: 'advancedocumenttypeid' },
    { header: 'Document', field: 'doctypename' },
    { header: 'Action', field: 'action', value: [ 'delete doc'] }
  ];

  documentDetails: any[] = []
  isLoader: boolean = false;
  isLoaderDoc: boolean = false;

  advanceTypeForm: any;
  submitted: boolean = false;
  advanceTypeId: number = 0;
  successPopup: boolean = false;
  errorMessage: string = '';
  isEdit: boolean = false;
  optionDocumentType: any[] = []
  documentsForm: any;
  documentId: number = 0;
  deletePopup: boolean = false;
  deletedItem: any;
  isUpdated:boolean = false;
  popupMessage!: string;
  originalFormValues: any = {};
  constructor(
    private apiservice: ApiService,
    private fb: FormBuilder,
    private formService: FormService
  ) {
    this.advanceTypeForm = this.fb.group({
      advanceTypeName: ['', Validators.required],
      description: ['', Validators.required]
    })

    this.documentsForm = this.fb.group({
      documentType: ['', Validators.required],
      remarkDoc: ['', Validators.required]
    })
  }

  ngOnInit() {
    this.getAdvanceType()
    this.advanceTypeForm.valueChanges.subscribe(() => {
      if(this.isEdit){
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.advanceTypeForm);
      }
    });
  }
  toggleStatus() {
    this.documentStatus = this.documentStatus === 'Activate' ? 'Deactivate' : 'Activate';
    console.log('Current Status:', this.documentStatus);
  }
  getAdvanceType() {
    this.isLoader = true
    const data = {
      "id": 0
    }
    this.apiservice.dataPost('master/getAdvanceType', data).subscribe(
      (response: any) => {
        // this.advanceTypeDetails = response?.data.map((item: any) => { item.isActive = item.isActive == true ? 'Active' : 'Inactive'; return item });
        this.advanceTypeDetails = response?.data
        this.isLoader = false

      },
      error => {
        console.log('Error :', error);
        this.isLoader = false
      }
    )
  }

  openAdvanceModal() {
    this.advanceTypeModal = true;
  }


  onEdit(value: any) {
    console.log('Edit', value);
    this.isEdit = true;
    this.advanceTypeModal = true;
    this.advanceTypeId = value.advanceTypeId

    this.advanceTypeForm.patchValue({
      advanceTypeName: value.advanceTypeName,
      description: value.description
    })
    this.advance_remarks = value.description;
    this.charCount_advance = this.advance_remarks.trim().length
    this.originalFormValues = this.advanceTypeForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.advanceTypeForm);
  }

  onView(value: any) {
    console.log('View', value);
    this.documentsModal = true;

    this.advanceTypeId = value.advanceTypeId
    this.getAdvanceTypeDocument();
    this.getDocumentTypeDropDown();
  }

  getDocumentTypeDropDown() {
    this.apiservice.dataPost('master/getActiveAndInactiveDocumentTypeList/true', {}).subscribe(
      (response: any) => {
        this.optionDocumentType = response?.data
      },
      error => {
        console.log('Error :', error);
      });

  }

  getAdvanceTypeDocument() {
    this.isLoaderDoc = true
    const data = {
      "id": this.advanceTypeId
    }
    this.apiservice.dataPost('master/getAdvanceDocumentType', data).subscribe(
      (response: any) => {
     this.documentDetails = response.data.length ?  response.data[0]?.documentList  : []
        this.isLoaderDoc = false
      },
      error => {
        console.log('Error :', error);
        this.isLoaderDoc = false
      }
    )

  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const key = event.key;
    return /^\d$/.test(key); // Allows only digits (0-9)
  }

  updateCharCount_Advance(): void {
    this.charCount_advance = this.advance_remarks.trim().length;
  }

  updateCharCount_Document(): void {
    this.charCount_document = this.document_remarks.trim().length;
  }

  opendocumentsModal() {
    this.documentsModal = true;
  }

  closedocumentsModal() {
    this.documentsModal = false;
    this.charCount_document = 0;
    this.document_remarks = ''
    this.resetFormDoc()
  }

  saveData() {

    this.submitted = true;
    this.formService.trimFormValues(this.advanceTypeForm);
    if (this.advanceTypeForm.invalid) {
      this.advanceTypeForm.markAllAsTouched()
      return;
    }

    let formData = this.advanceTypeForm.value;
    const data = {
      "advanceTypeId": this.advanceTypeId ? this.advanceTypeId : 0,
      "advanceTypeName": formData.advanceTypeName,
      "description": formData.description,
      "isActive": true,
      "loginuser": this.apiservice.getUserName()
    }

    this.isLoader = true;
    this.apiservice.dataPost('master/addAdvanceType', data).subscribe(response => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true;
      this.popupMessage = this.isEdit ? 'Advance Type Updated Successfully': 'Advance Type Saved Successfully'
      this.isEdit = false;
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);
      this.closeAdvanceModal()
      this.getAdvanceType();

    }, error => {
      this.errorMessage = this.apiservice.handleError(error);
      this.isLoader = false;
      this.submitted = false;

    });
  }
  resetForm() {
    this.advanceTypeId = 0
    this.errorMessage = ''
    this.submitted = false
    // this.advanceTypeModal = false
    this.advanceTypeForm.reset()
    this.isEdit = false
  }

 
  closeAdvanceModal() {
    this.advanceTypeModal = false;
    this.isEdit = false;
    this.advance_remarks = '';
    this.charCount_advance = 0
    this.resetForm()
  }

  onDelete(value: any) {
    console.log('Delete', value);
    let json = {
      "advanceTypeId": value.advanceTypeId,
      "isActive": false,
      "loginuser": this.apiservice.getUserName()
    }
    this.apiservice.dataPost('master/addAdvanceType', json).subscribe(response => {
      this.getAdvanceType();
    }, error => {
      console.log('Error while deleting data', error);

    });
  }

  saveDocument() {
    this.submitted = true
    if (this.documentsForm.invalid) {
      return;
    }

    let formData = this.documentsForm.value
    this.isLoaderDoc = true
    let json = {
      "advanceDocumentTypeId": this.documentId ? this.documentId : 0,
      "fkAdvanceTypeId": this.advanceTypeId,
      "fkDocumentTypeId": formData.documentType,
      "remark": formData.remarkDoc,
      "isActive": true,
      "loginuser": this.apiservice.getUserName()
    }
    this.apiservice.dataPost('master/addAdvanceDocumentType', json).subscribe(
      response => {
        console.log('Data saved successfully', response);
        this.getAdvanceTypeDocument();
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
  }

  onEditDoc(value: any) {
    console.log('value', value);
    this.documentId = value.advancedocumenttypeid
    this.documentsForm.patchValue({
      documentType: value.fkdocumenttypeid,
      remarkDoc: value.remark
    })
    this.document_remarks = value.remark
    this.charCount_document = this.document_remarks.trim().length
  }

  deleteDoc(value: any) {
    this.deletedItem = value
    this.deletePopup = true
  }

  confirmDelete() {
    console.log('Delete onDeleteDoc', this.deletedItem);
    let json = {
      "advanceDocumentTypeId": this.deletedItem.advancedocumenttypeid,
      "isActive": false,
      "loginuser": this.apiservice.getUserName()
    }
    this.apiservice.dataPost('master/addAdvanceDocumentType', json).
      subscribe(
        response => {
          console.log('Data deleted successfully', response);
          this.getAdvanceTypeDocument();
          this.deletePopup = false

        },
        error => {
          console.log('Error while deleting data', error);
          this.errorMessage = error?.error?.message
          this.deletePopup = false
        }
      )
  }

  closeDelectPopup(){
    this.deletePopup = false
  }
}