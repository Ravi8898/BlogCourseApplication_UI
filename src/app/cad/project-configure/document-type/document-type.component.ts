import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-document-type',
  templateUrl: './document-type.component.html',
  styleUrls: ['./document-type.component.scss']
})
export class DocumentTypeComponent {
  documentModal: boolean = false;
  isLoader: boolean = false;
  submitted: boolean = false;
  isUpdated:boolean = false;
  documentTypeForm: any;
  documentTypeId: number = 0;
  errorMessage: string = '';
  columns = [
    { header: 'Document Type ID', field: 'documentTypeId' },
    { header: 'Document Type Name', field: 'documentTypeName' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: ['edit'] }
  ];

  documentTypeDetails: any[] = [];
  successPopup: boolean = false;
  isEdit: boolean = false;
  originalFormValues: boolean = false;
  popupMessage!: string;
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private formService: FormService,
  ) {
    this.documentTypeForm = this.fb.group({
      documentTypeName: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getDocumentTypeDetails();
    this.documentTypeForm.valueChanges.subscribe(() => {
      if(this.isEdit){
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.documentTypeForm);
      }
    });
  }

  getDocumentTypeDetails() {
    this.isLoader = true;
    const data = {
      "id": 0
    }
    this.apiService.dataPost('master/getDocumentType', data).subscribe((response: any) => {
      // console.log(response);
      // this.documentTypeDetails = response.data.map((item: any) => { item.isActive = item.isActive == true ? 'Active' : 'Inactive'; return item; });
      this.documentTypeDetails = response.data
      this.isLoader = false;
    }, error => {
      console.log('Error : ', error);
      this.isLoader = false

    });
  }

  onEdit(value: any) {
    console.log('Edit', value);
    this.documentTypeId = value.documentTypeId
    this.documentModal = true;
    this.isEdit = true
    this.documentTypeForm.patchValue({
      documentTypeName: value.documentTypeName
    });
    this.originalFormValues = this.documentTypeForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.documentTypeForm);
  }

  openDocumentModal() {
    this.documentModal = true;
  }

  closeDocumentModal() {
    this.documentModal = false;
    this.isEdit = false;
    this.errorMessage = ''
    this.resetForm()
  }

  AddDocumentType() {
    this.documentModal = true;
    this.documentTypeId = 0;
    this.documentTypeForm.reset();
  }

  saveData() {
    this.submitted = true
    this.formService.trimFormValues(this.documentTypeForm)
    if (this.documentTypeForm.invalid) {
      this.documentTypeForm.markAllAsTouched()
      return;
    }

    this.isLoader = true
    let formData = this.documentTypeForm.value
    let data = {
      "documentTypeId": this.documentTypeId ? this.documentTypeId : 0,
      "docTypeName": formData.documentTypeName,
      "isActive": true,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addDocumentType', data).subscribe(
      response => {

        this.submitted = false
        this.isLoader = false
        this.successPopup = true;
        this.popupMessage = this.isEdit ? 'Document Type Updated Successfully': 'Document Type Added Successfully'
        this.isEdit = false
        this.closeDocumentModal()
        setTimeout(() => {
          this.successPopup = false;
        }, 2000);
        this.getDocumentTypeDetails()

      },
      error => {
        this.errorMessage = this.apiService.handleError(error);
        this.isLoader = false
        this.submitted = false
      }
    )
  }

  resetForm() {
    this.documentTypeId = 0
    this.submitted = false
    this.documentTypeForm.reset()
    this.errorMessage = ''
  }

  onDelete(value: any) {
    // console.log('Delete', value);
    // API call to delete data
    const data = {
      "documentTypeId": value.documentTypeId,
      "isActive" : false,
      "loginuser": this.apiService.getUserName()
    }

    this.isLoader = true;
    this.apiService.dataPost('master/addDocumentType', data).subscribe((response: any) => {
      // console.log('Data deleted successfully:', response);

      this.isLoader = false;
      this.getDocumentTypeDetails();

    }, error => {
      console.log('Error:', error);
      this.isLoader = false;
    });
  }
}
