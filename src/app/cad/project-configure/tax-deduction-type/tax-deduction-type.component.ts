import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-tax-deduction-type',
  templateUrl: './tax-deduction-type.component.html',
  styleUrls: ['./tax-deduction-type.component.scss']
})
export class TaxDeductionTypeComponent {
  isTaxDeductionTypeModalOpen: boolean = false;
  taxDeductionTypeDetails = [];

  columns = [
    { header: 'Tax Deduction Type ID', field: 'taxdeductiontypeid' },
    { header: 'Tax Deduction Type Name', field: 'taxdeducttypename' },
    { header: 'Rate', field: 'taxrate' },
    { header: 'Action', field: 'action', value: ['edit'] }
  ];
  taxDeductionTypeForm!: FormGroup;
  isLoader: boolean = false;
  errorMessage: string = '';
  successPopup: boolean = false;
  submitted: boolean = false;
  documentsModal: boolean = false;
  loginUser: string | null = ''
  isEdit!: boolean;
  isUpdated: boolean = false;
  originalFormValues: any = {};
  popupMessage: string = '';
  taxDeductionId: any;
  constructor(private fb: FormBuilder, private apiService: ApiService, private formService: FormService) { }

  ngOnInit(): void {
    this.getTaxDeductionType()
    this.taxDeductionTypeForm = this.fb.group({
      // taxDeductionTypeId: [0, [Validators.required, Validators.maxLength(250)]],
      taxDeductTypeName: ['', Validators.required],
      taxRate: [''],
      // isActive:[true],
      // loginuser :[this.apiService.username]
    });
    this.taxDeductionTypeForm.valueChanges.subscribe(() => {
      if (this.isEdit) {
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.taxDeductionTypeForm);
        console.log('this.isUpdated', this.isUpdated)
      }
    });
  }

  get f() {
    return this.taxDeductionTypeForm.controls;
  }




  onSubmit(): void {
    this.formService.trimFormValues(this.taxDeductionTypeForm)
    if (this.taxDeductionTypeForm.invalid) {
      this.taxDeductionTypeForm.markAllAsTouched();
      return;
    }
    let formData = this.taxDeductionTypeForm.value;
    let json = {
      'taxDeductionTypeId': this.taxDeductionId ? this.taxDeductionId : 0,
      'taxDeductTypeName': formData.taxDeductTypeName,
      "taxRate" : formData.taxRate,
      'isActive': true,
      'loginuser': this.apiService.getUserName()  
    }
    this.apiService.dataPost('master/addTaxDeductionType', json).subscribe(response => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true
      this.popupMessage = this.isEdit ? 'Tax Deduction Type Updated Successfully' : 'Tax Deduction Type Saved Successfully';
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);

      this.closeTaxDeductionModal();
      this.getTaxDeductionType();

      this.resetForm();
    }, error => {
      this.errorMessage = this.apiService.handleError(error);
      this.isLoader = false;
      this.submitted = false;

    });


    console.log(this.taxDeductionTypeForm.value);
  }
  openHoldTypeModal() {
    this.isTaxDeductionTypeModalOpen = true
  }
  onEdit(event: any) {
    this.isTaxDeductionTypeModalOpen = true
    this.isEdit = true;
    this.taxDeductionId = event.taxdeductiontypeid
    this.taxDeductionTypeForm.patchValue({
      taxDeductTypeName: event.taxdeducttypename,
      taxRate: event.taxrate
    })
    this.originalFormValues = this.taxDeductionTypeForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.taxDeductionTypeForm);

  }
  openTaxDeductionModal() {
    this.isTaxDeductionTypeModalOpen = true
  }
  closeTaxDeductionModal() {
    this.isTaxDeductionTypeModalOpen = false;
    this.isEdit = false;
    this.taxDeductionId = 0
    this.resetForm()
    this.errorMessage = ''
  }

  resetForm() {
    this.taxDeductionTypeForm.reset()
    this.isEdit = false;
    this.errorMessage = ''
  }

  getTaxDeductionType() {
    this.isLoader = true;
    const json = {
      // "lookUpName": "currency",
      "id": 0
    }
    this.apiService.dataPost('master/getTaxDeductionType', json).subscribe(
      (res: any) => {
        // console.log(res.data);
        // this.taxDeductionTypeDetails = res.data.map((item: any) => { item.isActive = item.isActive == true ? 'Active' : 'Inactive'; return item });
        this.taxDeductionTypeDetails = res.data
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
      "taxDeductionTypeId": value.taxdeductiontypeid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addTaxDeductionType', json).subscribe(response => {
      this.getTaxDeductionType();
    }, error => {
      console.log('Error while deleting data', error);
    });
  }


}
