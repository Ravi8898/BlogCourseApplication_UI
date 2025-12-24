import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AllMaterService } from 'src/app/services/all-mater.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-add-fi-data',
  templateUrl: './add-fi-data.component.html',
  styleUrls: ['./add-fi-data.component.scss']
})
export class AddFiDataComponent implements OnInit {
  fiDataForm!: FormGroup;
  isEdit = false;
  successToast = false;
  errorToast = false;
  toastMsg = '';
  fiFields = [
    { key: 'ALL_FIMappingId', label: 'ALL_FIMappingId', required: true, type: 'text' },
    { key: 'Business', label: 'Business', required: true, type: 'text' },
    { key: 'Plant_location', label: 'Plant Location', required: true, type: 'text' },
    { key: 'PlantCode_AAA', label: 'PlantCode AAA', required: true, type: 'text' },
    { key: 'PlantCode_ALL', label: 'PlantCode ALL', required: true, type: 'text' },
    { key: 'ProfitCenter_ALL', label: 'ProfitCenter ALL', required: true, type: 'text' },
    { key: 'CostCenter_ALL', label: 'CostCenter ALL', required: true, type: 'text' },
    { key: 'SAP_TCODE', label: 'SAP TCODE', required: true, type: 'text' },
    { key: 'GLAccount', label: 'GL Account', required: true, type: 'text' },
    { key: 'TaxCode', label: 'Tax Code', required: true, type: 'text' },
    { key: 'ProfitCenter', label: 'Profit Center', required: true, type: 'text' },
    { key: 'CustomerCode1', label: 'Customer Code1', required: true, type: 'text' },
    { key: 'SERVICE_CODE', label: 'Service Code', required: true, type: 'text' },
    { key: 'BusinessArea', label: 'Business Area', required: true, type: 'text' },
    { key: 'SAP_COMPANY_CODE', label: 'SAP Company Code', required: true, type: 'text' },
    { key: 'SENDING_APPLICATION_NAME', label: 'Sending Application Name', required: true, type: 'text' },
    { key: 'SAP_STATE_CODE', label: 'SAP State Code', required: true, type: 'text' },
    { key: 'PARTY_GSTIN_Number', label: 'Party GSTIN Number', required: true, type: 'text' },
    { key: 'Company_GSTIN', label: 'Company GSTIN', required: true, type: 'text' },
    { key: 'SAC_CODE', label: 'SAC Code', required: true, type: 'text' },
    { key: 'SGST_PRCNTG', label: 'SGST Percentage', required: true, type: 'number' },
    { key: 'CGST_PRCNTG', label: 'CGST Percentage', required: true, type: 'number' },
    { key: 'IGST_PRCNTG', label: 'IGST Percentage', required: true, type: 'number' },
    { key: 'PLANT_CD', label: 'Plant Code', required: true, type: 'text' },
    { key: 'IsActive', label: 'Is Active', required: true, type: 'text' },
    { key: 'CreatedBy', label: 'Created By', required: true, type: 'text' },
    { key: 'CreatedDate', label: 'Created Date', required: true, type: 'text' },
    { key: 'CustomerCode', label: 'Customer Code', required: true, type: 'text' },
    { key: 'SAP_TRANSACTION_CODE', label: 'SAP Transaction Code', required: true, type: 'text' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private allService: AllMaterService,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.initForm();
    // Check for edit mode and patch form if needed
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        // Simulate fetching data for edit (replace with API call when available)
        const editData = history.state && history.state.editData ? history.state.editData : null;
        if (editData) {
          this.patchEditData(editData);
        }
      } else {
        this.isEdit = false;
      }
    });
  }
  patchEditData(data: any) {
    if (!data) return;
    this.fiDataForm.patchValue(data);
    this.fiDataForm.markAsTouched();
    this.fiDataForm.markAsDirty();
  }

  initForm() {
    const group: any = {};
    this.fiFields.forEach(field => {
      group[field.key] = ['', field.required ? Validators.required : []];
    });
    this.fiDataForm = this.fb.group(group);
  }

  submitForm() {
    if (this.fiDataForm.valid) {
      const formValue = this.fiDataForm.value;
      // Map form fields to API payload keys
      const payload: any = {
        business: formValue.Business,
        businessArea: formValue.BusinessArea,
        cgstPrcntg: formValue.CGST_PRCNTG,
        companyGstin: formValue.Company_GSTIN,
        costCenterAll: formValue.CostCenter_ALL,
        createdBy: formValue.CreatedBy,
        customerCode: formValue.CustomerCode,
        customerCode1: formValue.CustomerCode1,
        glAccount: formValue.GLAccount,
        igstPrcntg: formValue.IGST_PRCNTG,
        isActive: formValue.IsActive === true || formValue.IsActive === 'true' ? true : false,
        partyGstinNumber: formValue.PARTY_GSTIN_Number,
        plantCode: formValue.PLANT_CD,
        plantCodeAaa: formValue.PlantCode_AAA,
        plantCodeAll: formValue.PlantCode_ALL,
        plantLocation: formValue.Plant_location,
        profitCenter: formValue.ProfitCenter,
        profitCenterAll: formValue.ProfitCenter_ALL,
        sacCode: formValue.SAC_CODE,
        sapCompanyCode: formValue.SAP_COMPANY_CODE,
        sapStateCode: formValue.SAP_STATE_CODE,
        sapTCode: formValue.SAP_TCODE,
        sapTransactionCode: formValue.SAP_TRANSACTION_CODE,
        sendingApplicationName: formValue.SENDING_APPLICATION_NAME,
        serviceCode: formValue.SERVICE_CODE,
        sgstPrcntg: formValue.SGST_PRCNTG,
        taxCode: formValue.TaxCode
      };
      if (this.isEdit) {
        // For update, add the id (ALL_FIMappingId)
        payload.ALL_FIMappingId = formValue.ALL_FIMappingId;
        this.allService.updateFiMapping(payload).subscribe({
          next: () => {
            this.successToast = true;
            this.toastMsg = 'FI Data updated successfully!';
            setTimeout(() => this.gotoFiDataListing(), 1200);
          },
          error: () => {
            this.errorToast = true;
            this.toastMsg = 'Failed to update FI Data.';
          }
        });
      } else {
        this.allService.createFiMapping(payload).subscribe({
          next: () => {
            this.successToast = true;
            this.toastMsg = 'FI Data added successfully!';
            setTimeout(() => this.gotoFiDataListing(), 1200);
          },
          error: () => {
            this.errorToast = true;
            this.toastMsg = 'Failed to add FI Data.';
          }
        });
      }
    } else {
      this.errorToast = true;
      this.toastMsg = 'Please fill all required fields.';
      this.fiDataForm.markAllAsTouched();
    }
  }

  deleteFiData() {
    // Only allow delete in edit mode
    if (!this.isEdit) return;
    const id = this.fiDataForm.value.ALL_FIMappingId;
    if (!id) return;
    if (!confirm('Are you sure you want to delete this FI Data record?')) return;
    this.allService.deleteFiMapping(id).subscribe({
      next: () => {
        this.successToast = true;
        this.toastMsg = 'FI Data deleted successfully!';
        setTimeout(() => this.gotoFiDataListing(), 1200);
      },
      error: () => {
        this.errorToast = true;
        this.toastMsg = 'Failed to delete FI Data.';
      }
    });
  }

  // Utility to always provide table headers even if no data
  getTableDataWithHeaders(data: any[]): any[] {
    if (data && data.length > 0) return data;
    // Return a single empty object with all columns as keys
    const emptyRow: any = {};
    this.fiFields.forEach(f => { emptyRow[f.key] = ''; });
    return [emptyRow];
  }

  resetForm() {
    this.fiDataForm.reset();
    this.fiDataForm.markAsUntouched();
    this.fiDataForm.markAsPristine();
  }

  gotoFiDataListing() {
    this.router.navigate(['All-Master/all-master-data'], { queryParams: { tab: 'fi' } });
  }
}
