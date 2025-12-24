import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-hold-type',
  templateUrl: './hold-type.component.html',
  styleUrls: ['./hold-type.component.scss']
})
export class HoldTypeComponent {
  isHoldTypeModalOpen: boolean = false;
  HoldTypeDetails: any[] = [];

  columns = [
    { header: 'Hold Type ID', field: 'holdtypeid' },
    { header: 'Name', field: 'holdtypename' },
    { header: 'Max %', field: 'maxpercent' },
    // { header: 'Max Value', field: 'maxvalue' },
    { header: 'Department', field: 'departmentname' },
    { header: 'Compliance Type', field: 'compliancetypename' },
    { header: 'Is Payment Term', field: 'ispaymentterm' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: ['view', 'edit'] }
  ];
  holdTypeForm!: FormGroup;
  isLoader: boolean = false;
  departments: any[] = [];
  complianceTypes: any = []
  errorMessage: string = '';
  successPopup: boolean = false;
  submitted: boolean = false;
  documentsModal: boolean = false;
  loginUser: string | null = ''
  document_columns = [
    { header: 'Document Id', field: 'holddocumenttypeid' },
    { header: 'Document', field: 'doctypename' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: [ 'delete doc'] },
  ]

  documentDetails: any[] = [];
  charCount: number = 0;
  document_remarks: string = '';
  charCount_document: number = 0;
  holdTypeId: number = 0;
  optionDocumentType: any[] = [];
  documentsForm: any;
  isloaderDoc: boolean = false;
  documentId: number = 0;
  deletedItem: any;
  deletePopup: boolean = false;
  isEdit: boolean = false;
  isUpdated: any;
  originalFormValues: any = {};
  popupMessage: string = '';
  constructor(private fb: FormBuilder, private apiService: ApiService, private formService: FormService) {
    this.loginUser = this.apiService.getUserName();
  }

  ngOnInit(): void {
    this.getHoldTypeList()
    this.getDepartments()
    this.getComplianceTypes()
    this.holdTypeForm = this.fb.group({
      holdTypeName: ['', [Validators.required, Validators.maxLength(250)]],
      fkComplianceTypeId: [null, Validators.required],
      maxPercent: ['', [Validators.required, Validators.pattern(/^[0-9]{1,2}(\.[0-9]{1,3})?$/)]],
      maxValue: [0 , [Validators.pattern('^[0-9]+$')]],
      fkDepartmentId: [null, Validators.required],
      // remark: ['', [Validators.required, Validators.maxLength(250)]],
      isPaymentTerm: [false],
    });
    this.holdTypeForm.valueChanges.subscribe(() => {
      if (this.isEdit) {
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.holdTypeForm);
      }
    });
    this.documentsForm = this.fb.group({
      documentType: ['', Validators.required],
      remarkDoc: ['', Validators.required]
    })
  }

  get f() {
    return this.holdTypeForm.controls;
  }

  updateCharCount_Document() {
    this.charCount = this.document_remarks.length;
  }
  openHoldTypeModal() {
    this.isHoldTypeModalOpen = true
  }
  onEdit(event: any) {
    console.log('event', event);
    this.isEdit = true;
    this.holdTypeId = event.holdtypeid
    this.isHoldTypeModalOpen = true;
    this.holdTypeForm.patchValue({
      holdTypeName: event.holdtypename,
      fkComplianceTypeId: event.fkcompliancetypeid || null,
      maxPercent: event.maxpercent,
      maxValue: event.maxvalue,
      fkDepartmentId: event.fkdepartmentid || null,
      isPaymentTerm: event.ispaymentterm,
    })
    this.originalFormValues = this.holdTypeForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.holdTypeForm);
    console.log('this.form', this.holdTypeForm.value)
  }
  onView(value: any) {
    console.log('view', value);
    this.documentsModal = true;
    this.holdTypeId = value.holdtypeid
    this.getHoldDocument()
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
  getHoldDocument() {
    let data = {
      "id": this.holdTypeId
    }
    this.apiService.dataPost('master/getHoldDocumentType', data).subscribe(
      (response: any) => {
        this.documentDetails = response.data.length ? response.data[0]?.documentList : []
      },
      error => {
        console.log('Error: ', error);
      }
    )
  }
  openComplianceModal() {
    this.isHoldTypeModalOpen = true
  }
  closeHoldTypeModal() {
    this.isHoldTypeModalOpen = false;
    this.errorMessage = ''
    this.isEdit = false;
    this.resetForm()
  }

  resetForm() {
    this.holdTypeForm.reset()
    this.errorMessage = ''
  }
  getHoldTypeList() {
    this.isLoader = true;
    const json = {
      "id": 0
    }
    this.apiService.dataPost('master/getHoldType', json).subscribe(
      (res: any) => {
        // this.HoldTypeDetails = res.data.map((item: any) => { item.isActive = item.isActive == true ? 'Active' : 'Inactive'; return item });
        this.HoldTypeDetails = res.data
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
      "id": 0
    }
    this.apiService.dataPost('master/getDepartment', json).subscribe(
      (res: any) => {
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
  getComplianceTypes() {
    this.isLoader = true;
    const json = {
      "id": 0
    }
    this.apiService.dataPost('master/getActiveAndInactiveComplianceType/true', json).subscribe(
      (res: any) => {
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

  closeDocumentsModal() {
    this.documentsModal = false
    this.resetFormDoc()
  }


  saveData() {

    this.submitted = true;
    this.formService.trimFormValues(this.holdTypeForm)
    if (this.holdTypeForm.invalid) {
      this.holdTypeForm.markAllAsTouched();
      return;
    }

    let formData = this.holdTypeForm.value;
    let json = {
      'holdTypeId': this.holdTypeId ? this.holdTypeId : 0,
      'holdTypeName': formData.holdTypeName,
      'fkComplianceTypeId': formData.fkComplianceTypeId,
      'maxPercent': formData.maxPercent,
      'maxValue': formData.maxValue,
      'fkDepartmentId': formData.fkDepartmentId,
      'isPaymentTerm': formData.isPaymentTerm,
      'isActive': true,
      'loginuser': this.apiService.getUserName()
    }
    console.log('for value', this.holdTypeForm.value)
    this.isLoader = true;
    this.apiService.dataPost('master/addHoldType', json).subscribe(response => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true;
      this.popupMessage = this.isEdit ? 'Hold Type Updated Successfully' : 'Hold Type Added Successfully'
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);

      this.closeHoldTypeModal();
      this.getHoldTypeList();
    }, error => {
      this.errorMessage = this.apiService.handleError(error);
      this.isLoader = false;
      this.submitted = false;
    });
  }

  onDelete(value: any) {
    console.log('Delete', value);
    let json = {
      "holdTypeId": value.holdtypeid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    //  console.log('Data deleted successfully', json);
    this.apiService.dataPost('master/addHoldType', json).subscribe(response => {
      this.getHoldTypeList();

    }, error => {
      console.log('Error while deleting data', error);

    });
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const key = event.key;
    return /^\d$/.test(key); // Allows only digits (0-9)
  }

  saveDocument() {
    this.submitted = true
    this.formService.trimFormValues(this.documentsForm)
    if (this.documentsForm.invalid) {
      return;
    }

    let formData = this.documentsForm.value
    this.isloaderDoc = true
    let json = {
      "holdDocumentTypeId": this.documentId ? this.documentId : 0,
      "fkHoldTypeId": this.holdTypeId,
      "fkDocumentTypeId": formData.documentType,
      "remark": formData.remarkDoc,
      "isActive": true,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addHoldDocumentType', json).subscribe(
      response => {
        console.log('Data saved successfully', response);
        this.getHoldDocument();

        this.isloaderDoc = false
        this.submitted = false
        this.resetFormDoc()
      },
      error => {
        console.log('Error while saving data', error);
        this.errorMessage = error?.error?.message
        this.isloaderDoc = false
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
    this.documentId = value.holddocumenttypeid
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

  closeDelectPopup() {
    this.deletePopup = false
  }

  confirmDelete() {
    console.log('Delete onDeleteDoc', this.deletedItem);
    let json = {
      "holdDocumentTypeId": this.deletedItem.holddocumenttypeid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addHoldDocumentType', json).
      subscribe(
        response => {
          console.log('Data deleted successfully', response);
          this.getHoldDocument();
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
