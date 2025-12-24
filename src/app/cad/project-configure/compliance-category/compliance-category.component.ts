import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-compliance-category',
  templateUrl: './compliance-category.component.html',
  styleUrls: ['./compliance-category.component.scss']
})
export class ComplianceCategoryComponent {
  complianceModal: boolean = false;
  errorMessage: string = '';
  successPopup: boolean = false;
  popupMessage:string = ''
  isUpdated:boolean = false;
  columns = [
    { header: 'Compliance Category ID', field: 'compliancecategoryid' },
    { header: 'Compliance Category Name', field: 'compliancecategoryname' },
    // { header: 'Status', field: 'isActive' },
    { header: 'Action', field: 'action', value: [ 'edit'] }
  ];

  complianceCategoryDetails = [];
  complianceForm!: FormGroup;
  isLoader: boolean = false ;
  submitted: boolean = false;
  isEdit: boolean = false;
  originalFormValues: any = {};
  complianceCategoryId: number = 0;

  constructor(private fb: FormBuilder, private apiService: ApiService, private formService: FormService) {}

  ngOnInit(){
    this.getComplianceCategoryList()
    this.complianceForm = this.fb.group({
      complianceCategoryName: ['', [Validators.required, Validators.maxLength(250)]],
    });
    this.complianceForm.valueChanges.subscribe(() => {
      if(this.isEdit){
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.complianceForm);
      }
    });
  }
  openComplianceModal(){
    this.complianceModal = true;
  }

  closeComplianceModal(){
    this.complianceModal = false;
    this.isEdit = false
    this.resetForm()
  }

  onEdit(value: any) {
    this.isEdit =true
    this.complianceModal = true;
    this.complianceCategoryId = value.compliancecategoryid
    this.complianceForm.patchValue({
      complianceCategoryName: value.compliancecategoryname,
    })
    console.log(this.complianceForm.value)
    this.originalFormValues = this.complianceForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.complianceForm);
  }

  get f() {
    return this.complianceForm.controls;
  }
  onSubmit() {
    this.formService.trimFormValues(this.complianceForm); 
    console.log('Form Submitted:', this.complianceForm.value);
    if (this.complianceForm.invalid) {
      this.complianceForm.markAllAsTouched()
      return; 
    }
    
    let formData = this.complianceForm.value;
    console.log('for value',this.complianceForm.value)
    let json = {
      'complianceCategoryId': this.complianceCategoryId ? this.complianceCategoryId :0,
      'complianceCategoryName': formData.complianceCategoryName,
      'isActive':true,
      'loginuser': this.apiService.getUserName()
    }
    this.isLoader = true;
    this.apiService.dataPost('master/addComplianceCategory', json).subscribe(response => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true;
       this.popupMessage = this.isEdit ? 'Compliance Category Updated Successfully': 'Compliance Category Saved Successfully'
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);
      this.closeClauseModal();
      this.getComplianceCategoryList();
    }, error => {
      this.errorMessage = this.apiService.handleError(error);
      this.isLoader = false;
      this.submitted = false;

    });
  }

  
  resetForm() {
    this.errorMessage = ''
    this.submitted = false
    this.complianceForm.reset()
    this.isEdit = false
    this.complianceCategoryId = 0
  }

  
  closeClauseModal() {
    this.complianceModal = false;
    this.isEdit = false;
    this.complianceCategoryId =0
    this.resetForm()
  }

  getComplianceCategoryList() {
    this.isLoader = true;
    const json = {
      "id": 0
    }
    this.apiService.dataPost('master/getComplianceCategory', json).subscribe(
      (res: any) => {
        // this.complianceCategoryDetails = res.data.map((item: any) => { item.isActive = item.isActive == true ? 'Active' : 'Inactive'; return item });
        this.complianceCategoryDetails = res.data
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
      "complianceCategoryId": value.compliancecategoryid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    //  console.log('Data deleted successfully', json);
    this.apiService.dataPost('master/addComplianceCategory', json).subscribe(response => {
      this.getComplianceCategoryList();

    }, error => {
      console.log('Error while deleting data', error);

    });
  }
}
