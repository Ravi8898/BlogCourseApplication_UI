import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AllMaterService } from 'src/app/services/all-mater.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-add-bill',
  templateUrl: './add-bill.component.html',
  styleUrls: ['./add-bill.component.scss'],
})
export class AddBillComponent implements OnInit {
  successToast = false;
  errorToast = false;
  toastMsg = '';
  itemData: any;
  addBillForm!: FormGroup;
  fiDataForm!: FormGroup;
  mode: 'bill' | 'fi' = 'bill';
  editId: string | null = null;
  plants: any[] = [];
  MappingId: string = '';
  originalData: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private allService: AllMaterService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const typeParam = params.get('type');
      this.mode = (typeParam === 'fi') ? 'fi' : 'bill';
      this.MappingId = params.get('Id') || '';
      this.initForms();
      if (this.MappingId) {
        this.getBillById();
      }
    });
    this.getplantsDropDownList();
  }

  initForms() {
    this.addBillForm = this.fb.group({
      aaaPlantCode: ['', Validators.required],
      aaaPlantName: ['', Validators.required],
      aaaPlantAddress: ['', Validators.required],
      aaaLocation: ['', Validators.required],
      aaaPincode: ['', Validators.required],
      aaaGstNo: ['', [Validators.required, Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')]],
      aaaPanNo: ['', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
      aaaCustomerCode: ['', Validators.required],
      allCompanyName: ['', Validators.required],
      allGstNo: ['', [Validators.required, Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')]],
      allCustomerCode: ['', Validators.required],
      rcmFcm: ['', Validators.required],
      allLocation: ['', Validators.required],
      allPincode: ['', Validators.required],
      allGstAddress: ['', Validators.required],
      rcmGstPercentage: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      fcmGstPercentage: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      allPanNo: ['', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
    });

    this.fiDataForm = this.fb.group({
      ALL_FIMappingId: ['', Validators.required],
      Business: ['', Validators.required],
      Plant_location: ['', Validators.required],
      PlantCode_AAA: ['', Validators.required],
      PlantCode_ALL: ['', Validators.required],
      ProfitCenter_ALL: ['', Validators.required],
      CostCenter_ALL: ['', Validators.required],
      SAP_TCODE: ['', Validators.required],
      GLAccount: ['', Validators.required],
      TaxCode: ['', Validators.required],
      ProfitCenter: ['', Validators.required],
      CustomerCode1: ['', Validators.required],
      SERVICE_CODE: ['', Validators.required],
      BusinessArea: ['', Validators.required],
      SAP_COMPANY_CODE: ['', Validators.required],
      SENDING_APPLICATION_NAME: ['', Validators.required],
      SAP_STATE_CODE: ['', Validators.required],
      PARTY_GSTIN_Number: ['', Validators.required],
      Company_GSTIN: ['', Validators.required],
      SAC_CODE: ['', Validators.required],
      SGST_PRCNTG: ['', Validators.required],
      CGST_PRCNTG: ['', Validators.required],
      IGST_PRCNTG: ['', Validators.required],
      PLANT_CD: ['', Validators.required],
      IsActive: ['', Validators.required],
      CreatedBy: ['', Validators.required],
      CreatedDate: ['', Validators.required],
      CustomerCode: ['', Validators.required],
      SAP_TRANSACTION_CODE: ['', Validators.required],
    });

    this.addBillForm.get('aaaGstNo')?.valueChanges.subscribe(() => {
      this.checkGstNoMismatch();
    });
    this.addBillForm.get('allGstNo')?.valueChanges.subscribe(() => {
      this.checkGstNoMismatch();
    });
    this.addBillForm.get('aaaCustomerCode')?.valueChanges.subscribe(() => {
      this.checkCustomerCodeMismatch();
    });
    this.addBillForm.get('allCustomerCode')?.valueChanges.subscribe(() => {
      this.checkCustomerCodeMismatch();
    });
  }

  paste() {
    setTimeout(() => {
      this.addBillForm.controls['allPincode'].setValue(this.addBillForm.value.allPincode.trim())
    }, 0);
  }

  trimSpaces(field: string) {
    // Implementation for trimming spaces if needed
  }

  getBillById() {
    this.allService.getBillToMappingById(this.MappingId).subscribe({
      next: (res: any) => {
        const data = res?.data;
        this.originalData = { ...data };
        if (data && typeof data === 'object') {
          this.addBillForm.patchValue({
            aaaPlantCode: data.aaaPlantCode || '',
            aaaPlantName: data.aaaPlantName || '',
            aaaPlantAddress: data.aaaPlantAddress || '',
            aaaLocation: data.aaaLocation || '',
            aaaPincode: data.aaaPinCode ? String(data.aaaPinCode).trim() : '',
            aaaGstNo: data.aaaGstNo || '',
            aaaPanNo: data.aaaPanNo || '',
            aaaCustomerCode: data.aaaCustomerCode || '',
            allCompanyName: data.allCompanyName || '',
            allGstNo: data.allGstNo || '',
            allCustomerCode: data.allCustomerCode || '',
            rcmFcm: data.rcmFcm || '',
            allLocation: data.allLocation || '',
            allPincode: data.allPinCode ? String(data.allPinCode).trim() : '',
            allGstAddress: data.allGstAddress || '',
            rcmGstPercentage: data.rcmGst || '',
            fcmGstPercentage: data.fcmGst || '',
            allPanNo: data.allPanNo || ''
          });
        }
      },
      error: (err) => {
        console.error('Error fetching bill by ID:', err);
        this.toastMsg = 'Error fetching bill details';
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 5000);
      }
    });
  }

  onPlantCodeChange(selectedPlantCode: string) {
    const selectedPlant = this.plants.find(p => p.plantCode === selectedPlantCode);
    this.addBillForm.patchValue({
      aaaPlantName: selectedPlant ? selectedPlant.plantName : ''
    });
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const inputChar = event.key;
    const allowedControlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (!/^[0-9]$/.test(inputChar) && !allowedControlKeys.includes(inputChar)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  allowGSTINCharacters(event: KeyboardEvent): boolean {
    const pattern = /^[A-Z0-9]$/;
    const inputChar = event.key.toUpperCase();
    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  resetForm() {
    if (this.MappingId && this.originalData) {
      const cleanedData = { ...this.originalData };
      Object.keys(cleanedData).forEach(key => {
        if (typeof cleanedData[key] === 'string') {
          cleanedData[key] = cleanedData[key].trim();
        }
      });
      this.addBillForm.patchValue(cleanedData);
      this.addBillForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    } else {
      this.addBillForm.reset();
      this.addBillForm.markAsUntouched();
      this.addBillForm.markAsPristine();
      this.addBillForm.updateValueAndValidity();
    }
  }

  getplantsDropDownList() {
    this.allService.dataGetMaster('common/getPlantDetails').subscribe(
      (response: any) => {
        this.plants = response?.data;
      },
      error => {
        this.toastMsg = 'Error fetching plant details';
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 5000);
      });
  }

  submitForm() {
    if (this.addBillForm.valid) {
      let formData = this.addBillForm.value;
      const data = {
        ...formData,
        billToMappingId: this.MappingId
      };
      const isEdit = !!this.MappingId;
      const url = `allBillToMapping/InsertBillData`;
      this.commonService.spinner.show();
      const request = this.allService.dataPostMaster(url, data);
      request.subscribe(
        (response: any) => {
          this.successToast = true;
          this.toastMsg = isEdit ? 'Bill updated successfully' : 'Bill submitted successfully';
          setTimeout(() => {
            this.successToast = false;
            this.router.navigate(['/All-Master/all-master-data']);
            this.commonService.spinner.hide();
          }, 5000);
        },
        (error: any) => {
          this.commonService.spinner.hide();
          console.error('Error submitting bill:', error.error.message);
          this.errorToast = true;
          this.toastMsg = error.error.message || 'Error submitting bill';
          setTimeout(() => {
            this.errorToast = false;
          }, 5000);
        }
      );
    } else {
      this.commonService.spinner.hide();
      this.addBillForm.markAllAsTouched();
      this.toastMsg = 'Please fill all required fields correctly';
      this.errorToast = true;
      setTimeout(() => {
        this.errorToast = false;
      }, 5000);
    }
  }

  gotoMasterdata() {
    this.router.navigate(['All-Master/all-master-data']);
  }

  checkGstNoMismatch() {
    const aaaGstNo = this.addBillForm.get('aaaGstNo')?.value?.trim();
    const allGstNo = this.addBillForm.get('allGstNo')?.value?.trim();
    if (aaaGstNo && allGstNo && aaaGstNo === allGstNo) {
      this.addBillForm.get('allGstNo')?.setErrors({ gstMatch: true });
    } else {
      const allGstControl = this.addBillForm.get('allGstNo');
      if (allGstControl?.hasError('gstMatch')) {
        allGstControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
    }
  }

  checkCustomerCodeMismatch() {
    const aaaCustomerCode = this.addBillForm.get('aaaCustomerCode')?.value?.trim();
    const allCustomerCode = this.addBillForm.get('allCustomerCode')?.value?.trim();
    if (aaaCustomerCode && allCustomerCode && aaaCustomerCode === allCustomerCode) {
      this.addBillForm.get('allCustomerCode')?.setErrors({ customerCodeMatch: true });
    } else {
      const allCustomerControl = this.addBillForm.get('allCustomerCode');
      if (allCustomerControl?.hasError('customerCodeMatch')) {
        const errors = { ...allCustomerControl.errors };
        delete errors['customerCodeMatch'];
        if (Object.keys(errors).length === 0) {
          allCustomerControl.setErrors(null);
        } else {
          allCustomerControl.setErrors(errors);
        }
      }
    }
  }
}
