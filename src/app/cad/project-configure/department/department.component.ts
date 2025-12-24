import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent {
  departmentModal: boolean = false;
  departmentForm: any;
  submitted: boolean = false;
  isLoader: boolean = false;
  isUpdated: boolean = false;
  successPopup: boolean = false;
  departmentId: number = 0;
  errorMessage: string = '';

  columns = [
    { header: 'Department ID', field: 'departmentId' },
    { header: 'Department', field: 'departmentName' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: ['edit'] }
  ];

  departmentDetails: any[] = [];
  isEdit: boolean = false;
  originalFormValues: any = {}
  popupMessage!: string;
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private fs: FormService
  ) {
    this.departmentForm = this.fb.group({
      departmentName: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getDepartmentDetails();
    this.departmentForm.valueChanges.subscribe(() => {
      if (this.isEdit) {
        this.isUpdated = this.fs.isFormUpdated(this.originalFormValues, this.departmentForm);
        console.log('this.isUpdated', this.isUpdated)
      }
    });
  }

  getDepartmentDetails() {
    // API call to get department details
    this.isLoader = true;
    const data = {
      "id": 0
    }
    this.apiService.dataPost('master/getDepartment', data).subscribe((response: any) => {
      // this.departmentDetails = response.data.map((item: any) => { item.isActive = item.isActive == true ? 'Active' : 'Inactive'; return item; });
      this.departmentDetails = response.data
      this.isLoader = false;

    }, error => {
      console.log('Error:', error);
      this.isLoader = false;
    });
  }

  resetForm() {
    this.departmentId = 0;
    this.errorMessage = '';
    this.submitted = false
    this.departmentForm.reset();
    this.isEdit = false;
  }

  openDepartmentModal() {
    this.departmentModal = true;
  }
  closeDepartmentModal() {
    this.departmentModal = false;
    this.resetForm()
    this.errorMessage = ''
  }
  cancel() {
    this.departmentModal = false;
    this.resetForm()
  }

  onEdit(value: any) {
    console.log('Edit', value);
    this.departmentModal = true;
    this.isEdit = true;

    this.departmentId = value.departmentId;
    this.departmentForm.patchValue({
      departmentName: value.departmentName
    });
    this.originalFormValues = this.departmentForm.value
    this.isUpdated = this.fs.isFormUpdated(this.originalFormValues, this.departmentForm);
  }

  AddDepartment() {
    this.departmentId = 0;
    this.departmentModal = true;
    this.departmentForm.reset();
  }

  saveData() {
    // API call to save data
    this.submitted = true;
    this.fs.trimFormValues(this.departmentForm)
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched()
      return;
    }
    let formData = this.departmentForm.value;
    const data = {
      "departmentId": this.departmentId ? this.departmentId : 0,
      "departmentName": formData.departmentName.trim(),
      "isActive": true,
      "loginuser": this.apiService.getUserName()
    }

    this.isLoader = true;
    this.apiService.dataPost('master/addDepartment', data).subscribe((response: any) => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true;
      this.popupMessage = this.isEdit ? 'Department Updated Successfully' : 'Department Added Successfully'
      this.closeDepartmentModal()
      this.getDepartmentDetails();

      this.isEdit = false;
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);

    }, error => {
      console.log('Error:', error);
      this.errorMessage = this.apiService.handleError(error);

      this.submitted = false;
      this.isLoader = false;
    });
  }

  onDelete(value: any) {
    // console.log('Delete', value);
    // API call to delete data
    const data = {
      "departmentId": value.departmentId,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }

    this.isLoader = true;
    this.apiService.dataPost('master/addDepartment', data).subscribe((response: any) => {
      // console.log('Data deleted successfully:', response);

      this.isLoader = false;
      this.getDepartmentDetails();

    }, error => {
      console.log('Error:', error);
      this.isLoader = false;
    });
  }
}
