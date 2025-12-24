import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-clouse-type',
  templateUrl: './clouse-type.component.html',
  styleUrls: ['./clouse-type.component.scss']
})
export class ClouseTypeComponent {

  clauseTypeModal: boolean = false;
  documentsModal: boolean = false;
  clause_remarks: string = '';
  charCount_clause: number = 0;
  charCount_document: number = 0;
  document_remarks: string = '';
  errorMessage: string = '';
  columns = [
    { header: 'Clause Type Id', field: 'clausetypeid' },
    { header: 'Clause Type Name', field: 'clausetypename' },
    { header: 'Clause Type Description', field: 'description' },
    // { header: 'Document Type', field: 'documentType' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: ['view', 'edit'] }
  ];

  clauseTypeDetails: any[] = []
  document_columns = [
    { header: 'Document Id', field: 'clausedoctypeid' },
    { header: 'Document', field: 'doctypename' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: [ 'delete doc'] },

  ];
  documentDetails: any[] = []
  isLoader: boolean = false;
  clauseForm!: FormGroup;
  submitted: boolean = false;
  successPopup: boolean = false;
  popupMessage:string = ''
  isEdit: boolean = false;
  claudTypeId: number = 0;
  optionDocumentType: any[] = [];
  documentsForm: any;
  isLoaderDoc: boolean = false;
  documentId: number = 0;
  deletedItem: any;
  deletePopup: boolean = false;
  isUpdated :boolean = false;
  originalFormValues: any = {};
  constructor(private apiService: ApiService, private fb: FormBuilder, private formService: FormService) { }
  ngOnInit() {
    this.getClauseTypeList()
    this.clauseForm = this.fb.group({
      clauseTypeName: ['', [Validators.required, Validators.maxLength(250)]],
      description: ['', [Validators.required, Validators.maxLength(250)]],
      // remark: ['', [Validators.required, Validators.maxLength(2000)]]
    });
    this.documentsForm = this.fb.group({
      documentType: ['', Validators.required],
      remarkDoc: ['', Validators.required]
    })

    this.clauseForm.get('remark')?.valueChanges.subscribe((value) => {
      this.charCount_clause = value?.trim().length || 0;
    });
    this.clauseForm.valueChanges.subscribe(() => {
      if(this.isEdit){
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.clauseForm);
      }
    });
  }
  get f() {
    return this.clauseForm.controls;
  }

  onSubmit() {
    this.formService.trimFormValues(this.clauseForm);
    if (this.clauseForm.invalid) {
      this.clauseForm.markAllAsTouched()
      return;
    }
    let formData = this.clauseForm.value;
    let json ={
      'clauseTypeId': this.claudTypeId ? this.claudTypeId : 0,
      'clauseTypeName': formData.clauseTypeName,
      'description' : formData.description,
      'isActive': true,
      'loginuser': this.apiService.getUserName()
    }
    console.log('for value', this.clauseForm.value)
    this.isLoader = true;
    this.apiService.dataPost('master/addClauseType',json).subscribe(response => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true;
      this.popupMessage = this.isEdit ? 'Clause Type Updated Successfully': 'Clause Type Saved Successfully'
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);

      this.closeClauseModal();
      this.getClauseTypeList();

    }, error => {
      this.errorMessage = this.apiService.handleError(error);
      this.isLoader = false;
      this.submitted = false;

    });
  }


  resetForm() {
    this.claudTypeId = 0
    this.charCount_clause = 0;
    this.errorMessage = ''
    this.submitted = false
    // this.advanceTypeModal = false
    this.clauseForm.reset()
    this.isEdit = false
  }


  closeClauseModal() {
    this.clauseTypeModal = false;
    this.isEdit = false;
    this.resetForm()
  }


  openClauseModal() {
    this.clauseTypeModal = true;

  }



  onEdit(value: any) {
    console.log('Edit', value);
    this.clauseTypeModal = true;
    this.isEdit = true;
    this.claudTypeId = value.clausetypeid,
    this.clauseForm.patchValue({
      clauseTypeName: value.clausetypename,
      description: value.description,
    });
    this.originalFormValues = this.clauseForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.clauseForm);
  }

  onView(value: any) {
    console.log('View', value);
    this.documentsModal = true;
    this.claudTypeId = value.clausetypeid
    this.getClauseDocument()
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
  getClauseDocument() {
    let data = {
      "id": this.claudTypeId
    }
    this.apiService.dataPost('master/getClauseDocumentType', data).subscribe(
      (response: any) => {
        this.documentDetails = response.data.length ?  response.data[0]?.documentList  : []
      },
      error => {
        console.log('Error: ', error);
      }
    )
  }
  updateCharCount_Document() {
    this.charCount_document = this.document_remarks.trim().length;

  }
  closeDocumentsModal() {
    this.documentsModal = false;
    this.resetFormDoc()
  }

  getClauseTypeList() {
    this.isLoader = true;
    const json = {
      "id": 0
    }
    this.apiService.dataPost('master/getClauseType', json).subscribe(
      (res: any) => {
        // this.clauseTypeDetails = res.data.map((item: any) => { item.isActive = item.isActive == true ? 'Active' : 'Inactive'; return item });
        this.clauseTypeDetails = res.data;
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
      "clauseTypeId": value.clausetypeid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addClauseType', json).subscribe(response => {
      this.getClauseTypeList();
    }, error => {
      console.log('Error while deleting data', error);

    });
  }

  saveDocument() {
    this.submitted = true
    this.formService.trimFormValues(this.documentsForm)
    if (this.documentsForm.invalid) {
      return;
    }

    let formData = this.documentsForm.value
    this.isLoaderDoc = true
    let json = {
      "clauseDocTypeId": this.documentId ? this.documentId : 0,
      "fkClauseTypeId": this.claudTypeId,
      "fkDocumentTypeId": formData.documentType,
      "remark": formData.remarkDoc,
      "isActive": true,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addClauseDocumentType', json).subscribe(
      response => {
        console.log('Data saved successfully', response);
        this.getClauseDocument();
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
    this.charCount_document = 0;
  }

  onEditDoc(value: any) {
    console.log('value', value);
    this.documentId = value.clausedoctypeid
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

  closeDeletePopup(){
    this.deletePopup = false
  }

  confirmDelete() {
    console.log('Delete onDeleteDoc', this.deletedItem);
    let json = {
      "clauseDocTypeId": this.deletedItem.clausedoctypeid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addClauseDocumentType', json).
      subscribe(
        response => {
          console.log('Data deleted successfully', response);
          this.getClauseDocument();
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
