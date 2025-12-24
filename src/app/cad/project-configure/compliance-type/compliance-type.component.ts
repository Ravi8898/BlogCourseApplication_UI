import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-compliance-type',
  templateUrl: './compliance-type.component.html',
  styleUrls: ['./compliance-type.component.scss']
})
export class ComplianceTypeComponent {

  complianceModal: boolean = false;
  compliance_remarks: string = '';
  document_remarks: string = '';
  charCount_compliance: number = 0;
  charCount_document: number = 0;
  documentsModal: boolean = false;
  errorMessage: string = '';
  successPopup: boolean = false;
  columns = [
    { header: 'Compliance Type ID', field: 'compliancetypeid' },
    { header: 'Compliance Type Name', field: 'compliancetypename' },
    { header: 'Compliance Category', field: 'compliancecategoryname' },
    { header: 'Identifier', field: 'identifiername' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: ['view', 'edit'] }
  ];

  complianceTypeDetails: any[] = [];
  document_columns = [
    { header: 'Document Id', field: 'compliancedocumenttypeid' },
    { header: 'Document', field: 'doctypename' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: [ 'delete doc'] },
  ]

  documentDetails: any[] = [];
  isLoader: boolean = false;
  submitted: boolean = false;
  isEdit: boolean = false;
  complianceForm!: FormGroup;
  complianceTypes: any;
  documentsForm: any;
  complianceTypeId: number = 0;
  optionDocumentType: any[]=[];
  isLoaderDoc: boolean = false;
  documentId: number = 0;
  deletedItem: any;
  deletePopup: boolean = false;
  isUpdated: boolean = false;
  originalFormValues: any = {};
  popupMessage: string ='';
  constructor(private fb: FormBuilder, private apiService: ApiService, private formService: FormService) { }
  ngOnInit() {
    this.getComplianceTypeList()
    this.getComplianceTypes()
    this.complianceForm = this.fb.group({
      complianceTypeName: ['', [Validators.required, Validators.maxLength(250)]],
      fkComplianceCategoryId: [null, Validators.required],
      identifierName: ['', Validators.required],
    });
    this.documentsForm = this.fb.group({
      documentType: ['', Validators.required],
      remarkDoc: ['', Validators.required]
    })
    this.complianceForm.valueChanges.subscribe(() => {
      if(this.isEdit){
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.complianceForm);
      }
    });
  }
  openComplianceModal() {
    this.complianceModal = true;
  }

  closeComplianceTypeModal() {
    this.complianceModal = false;
    this.complianceTypeId = 0
    this.isEdit = false
    this.resetForm()
  }

  onEdit(value: any) {
    // console.log('Edit', value);
    this.isEdit = true
    this.complianceModal = true;
    this.complianceTypeId = value.compliancetypeid
    this.complianceForm.patchValue({
      complianceTypeName: value.compliancetypename,
      fkComplianceCategoryId: value.fkcompliancecategoryid,
      identifierName: value.identifiername,
    })
    console.log(this.complianceForm.value)
    this.originalFormValues = this.complianceForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.complianceForm);

  }
  updateCharCount_Document(): void {
    this.charCount_document = this.document_remarks.trim().length;
  }

  onView(value: any) {
    console.log('view', value);
    this.documentsModal = true;
    this.complianceTypeId = value.compliancetypeid
    this.getComplianceDocument()
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
  getComplianceDocument() {
    let data = {
      "id": this.complianceTypeId
    }
    this.apiService.dataPost('master/getComplianceDocumentType', data).subscribe(
      (response: any) => {
        this.documentDetails = response.data.length ?  response.data[0]?.documentList  : []
      },
      error => {
        console.log('Error: ', error);
      }
    )
  }

  get f() {
    return this.complianceForm.controls;
  }
  // Form Submission
  onSubmit() {
    this.formService.trimFormValues(this.complianceForm);
    if (this.complianceForm.invalid) {
      this.complianceForm.markAllAsTouched()
      return;
    }
    let formData = this.complianceForm.value;
    console.log('formdata',formData)
    let json = {
      'complianceTypeId': this.complianceTypeId,
      'complianceTypeName': formData.complianceTypeName,
      'fkComplianceCategoryId': formData.fkComplianceCategoryId,
      'identifierName': formData.identifierName,
      'isActive': true,
      'loginuser': this.apiService.getUserName()
    }
    this.isLoader = true;
    this.apiService.dataPost('master/addComplianceType', json).subscribe(response => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true;
      this.popupMessage = this.isEdit ? 'Compliance Type Updated Successfully': 'Compliance Type Saved Successfully'
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);
      this.closeClauseModal();
      this.getComplianceTypeList();

    }, error => {
      this.errorMessage = this.apiService.handleError(error);
      this.isLoader = false;
      this.submitted = false;

    });
  }
  getComplianceTypes() {
    this.isLoader = true;
    const json = {
      // "lookUpName": "currency",
      "id": 0
    }
    this.apiService.dataPost('master/getComplianceCategory', json).subscribe(
      (res: any) => {
        // console.log(res.data);
        // this.complianceTypes = res.data.map((item: any) => { item.isActive = item.isActive == true ? 'Active' : 'Inactive'; return item });
        this.complianceTypes = res.data 
        this.isLoader = false;
      },
      (error: any) => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }


  resetForm() {
    this.complianceTypeId = 0
    this.errorMessage = ''
    this.submitted = false
    this.complianceForm.reset()
    this.isEdit = false
  }


  closeClauseModal() {
    this.complianceModal = false;
    this.complianceTypeId = 0
    this.isEdit = false;
    this.resetForm()
  }

  getComplianceTypeList() {
    this.isLoader = true;
    const json = {
      "id": 0
    }
    this.apiService.dataPost('master/getComplianceType', json).subscribe(
      (res: any) => {
        // this.complianceTypeDetails = res.data.map((item: any) => { item.isActive = item.isActive == true ? 'Active' : 'Inactive'; return item });
        this.complianceTypeDetails = res.data
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
      "complianceTypeId": value.compliancecategoryid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addComplianceType', json).subscribe(response => {
      this.getComplianceTypeList();
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
      "complianceDocumentTypeId": this.documentId ? this.documentId : 0,
      "fkComplianceTypeId": this.complianceTypeId,
      "fkDocumentTypeId": formData.documentType,
      "remark": formData.remarkDoc,
      "isActive": true,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addComplianceDocumentType', json).subscribe(
      response => {
        console.log('Data saved successfully', response);
        this.getComplianceDocument();
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
    this.documentId = value.compliancedocumenttypeid
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

  closeDelectPopup(){
    this.deletePopup = false
  }

  confirmDelete() {
    console.log('Delete onDeleteDoc', this.deletedItem);
    let json = {
      "complianceDocumentTypeId": this.deletedItem.compliancedocumenttypeid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addComplianceDocumentType', json).
      subscribe(
        response => {
          console.log('Data deleted successfully', response);
          this.getComplianceDocument();
          this.deletePopup = false

        },
        error => {
          console.log('Error while deleting data', error);
          this.errorMessage = error?.error?.message
          this.deletePopup = false
        }
      )
  }

  closedocumentsModal() {
    this.documentsModal = false;
    this.resetFormDoc()
    this.errorMessage = ''
  }
}
