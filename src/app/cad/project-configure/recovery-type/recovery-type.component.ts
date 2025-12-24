import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-recovery-type',
  templateUrl: './recovery-type.component.html',
  styleUrls: ['./recovery-type.component.scss']
})
export class RecoveryTypeComponent {
  isRecoveryTypeModalOpen: boolean = false;

  RecoveryTypeDetails: any[] = []
  // RecoveryTypeDetails = [
  //   {
  //     recoveryTypeId: '010000020',
  //     recoveryTypeName: 'Xyz',
  //     department: '--',
  //     status: '--',
  //     action: ''
  //   },
  //   {
  //     recoveryTypeId: '010000021',
  //     recoveryTypeName: 'Xyz',
  //     department: '--',
  //     status: '--',
  //     action: ''
  //   }
  // ];

  columns = [
    { header: 'Recovery Type ID', field: 'recoverytypeid' },
    { header: 'Recovery Type Name', field: 'recoverytypename' },
    { header: 'Department', field: 'departmentname' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: ['view', 'edit'] }
  ];
  recoveryTypeForm!: FormGroup;
  isLoader: boolean = false;
  errorMessage: string = '';
  successPopup: boolean = false;
  submitted: boolean = false;
  documentsModal: boolean = false;
  loginUser: string | null = '';
  departments: any[] = []
  isEdit!: boolean;
  documentsForm: any;
  document_remarks: string = '';
  documentId: number = 0;
  optionDocumentType: any[] = [];
  charCount: number = 0;
  charCount_document: number = 0;
  isLoaderDoc: boolean = false;
  recoveryTypeId: number = 0;
  document_columns = [
    { header: 'Document Id', field: 'recoverydocumenttypeid' },
    { header: 'Document', field: 'doctypename' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: [ 'delete doc'] },
  ]

  documentDetails: any[] = [];
  deletedItem: any;
  deletePopup: boolean = false;
  originalFormValues: any = {};
  isUpdated: boolean = false;
  popupMessage: string = '';

  constructor(private fb: FormBuilder, private apiService: ApiService,private formService: FormService) { }

  ngOnInit(): void {
    this.getRecoveryTypeList()
    this.getDepartments()
    this.recoveryTypeForm = this.fb.group({
      // recoveryTypeId: [0],
      recoveryTypeName: ['', Validators.required],
      fkDepartmentId: [null, Validators.required],
      // remark: ['', [Validators.required, Validators.maxLength(250)]],
      // isActive: [true],
      // loginuser: [this.apiService.username]
    });
    this.documentsForm = this.fb.group({
      documentType: ['', Validators.required],
      remarkDoc: ['', Validators.required]
    })
    this.recoveryTypeForm.valueChanges.subscribe(() => {
      if(this.isEdit){
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.recoveryTypeForm);
        console.log('this.isUpdated',this.isUpdated)
      }
    });
  }

  get f() {
    return this.recoveryTypeForm.controls;
  }



  onSubmit(): void {
    if (this.recoveryTypeForm.invalid) {
      this.recoveryTypeForm.markAllAsTouched();
      return;
    }
    let formData = this.recoveryTypeForm.value;
    let json ={
      'recoveryTypeId': this.recoveryTypeId,
      'recoveryTypeName': formData.recoveryTypeName,
      'fkDepartmentId': formData.fkDepartmentId,
      'isActive': true,
      'loginuser': this.apiService.getUserName()
    }
    console.log('for value', this.recoveryTypeForm.value)
    this.isLoader = true;
    this.apiService.dataPost('master/addRecoveryType', json).subscribe(response => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true;
      this.popupMessage = this.isEdit ? 'Recovery Type Updated Successfully': 'Recovery Type Saved Successfully'
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);

      this.closeRecoveryModal();
      this.getRecoveryTypeList();

      this.resetForm();
    }, error => {
      this.errorMessage = this.apiService.handleError(error);
      this.isLoader = false;
      this.submitted = false;

    });
    console.log(this.recoveryTypeForm.value);
  }
  openRecoveryTypeModal() {
    this.isRecoveryTypeModalOpen = true
  }
  onEdit(event: any) {
    console.log('event', event)
    this.isEdit = true;
    this.isRecoveryTypeModalOpen = true;
    this.recoveryTypeId =event.recoverytypeid
    this.recoveryTypeForm.patchValue({
      // recoveryTypeId: event.recoverytypeid,
      recoveryTypeName: event.recoverytypename,
      fkDepartmentId: event.fkdepartmentid,
      // isActive: true,
      // loginuser: this.apiService.username
      // remark: event.remark
    })
    this.originalFormValues = this.recoveryTypeForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.recoveryTypeForm);

  }
  onView(event: any) {
    console.log('View', event);
    this.documentsModal = true;
    this.recoveryTypeId = event.recoverytypeid
    this.getRecoveryDocument()
    this.getDocumentTypeDropDown();
  }
  getRecoveryDocument() {
    let data = {
      "id": this.recoveryTypeId
    }
    this.apiService.dataPost('master/getRecoveryDocumentType', data).subscribe(
      (response: any) => {
        // this.documentDetails = response.data[0]?.documentList.map((item: any) => { item.isActive = item.isActive == true ? 'Active' : 'Inactive'; return item });
        this.documentDetails = response.data.length ?  response.data[0]?.documentList  : []
      },
      error => {
        console.log('Error: ', error);
      }
    )
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
  openComplianceModal() {
    this.isRecoveryTypeModalOpen = true
  }
  closeRecoveryModal() {
    this.isRecoveryTypeModalOpen = false;
    this.isEdit = false
    this.resetForm()
    this.recoveryTypeId =0
    this.errorMessage = ''
  }
 
  resetForm() {
    this.recoveryTypeForm.reset()
    this.isEdit = false
    this.recoveryTypeId =0 
  }

  getRecoveryTypeList() {
    this.isLoader = true;
    const json = {
      // "lookUpName": "currency",
      "id": 0
    }
    this.apiService.dataPost('master/getRecoveryType', json).subscribe(
      (res: any) => {
        // console.log(res.data);
        // this.RecoveryTypeDetails = res.data.map((item: any) => { item.isActive = item.isActive == true ? 'Active' : 'Inactive'; return item });
        this.RecoveryTypeDetails = res.data
        this.isLoader = false;
      },
      (error: any) => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }

  getDepartments() {
    this.isLoader = true;
    const json = {
      // "lookUpName": "currency",
      "id": 0
    }
    this.apiService.dataPost('master/getDepartment', json).subscribe(
      (res: any) => {
        // console.log(res.data);
        // this.departments = res.data.map((item: any) => { item.isActive = item.isActive == true ? 'Active' : 'Inactive'; return item });
        this.departments = res.data
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
      "recoveryTypeId": value.recoverytypeid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    //  console.log('Data deleted successfully', json);
    this.apiService.dataPost('master/addRecoveryType', json).subscribe(response => {


      this.getRecoveryTypeList();

    }, error => {
      console.log('Error while deleting data', error);

    });
  }


  closeDocumentsModal() {
    this.documentsModal = false

    this.resetFormDoc()
  }
  resetFormDoc() {
    this.documentsForm.reset()
    this.submitted = false
    this.errorMessage = ''
    this.document_remarks = ''
    this.documentId = 0
  }
  updateCharCount_Document() {
    this.charCount = this.document_remarks.length;
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
      "recoveryDocumentTypeId": this.documentId ? this.documentId : 0,
      "fkRecoveryTypeId": this.recoveryTypeId,
      "fkDocumentTypeId": formData.documentType,
      "remark": formData.remarkDoc,
      "isActive": true,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addRecoveryDocumentType', json).subscribe(
      response => {
        console.log('Data saved successfully', response);
        this.getRecoveryDocument();

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

  onEditDoc(value: any) {
    console.log('value', value);
    this.documentId = value.recoverydocumenttypeid
    this.documentsForm.patchValue({
      documentType: value.fkdocumenttypeid,
      remarkDoc: value.remark
    })
    this.document_remarks = value.remark
  }

  deleteDoc(value: any) {
    this.deletedItem = value
    this.deletePopup = true
  }

  confirmDelete() {
    console.log('Delete onDeleteDoc', this.deletedItem);
    let json = {
      "recoveryDocumentTypeId": this.deletedItem.recoverydocumenttypeid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addRecoveryDocumentType', json).
      subscribe(
        response => {
          console.log('Data deleted successfully', response);
          this.getRecoveryDocument();
          this.deletePopup = false

        },
        error => {
          console.log('Error while deleting data', error);
          this.errorMessage = error?.error?.message
          this.deletePopup = false
        }
      )
  }

  closeDelectPopup() {
    this.deletePopup = false
  }
}
