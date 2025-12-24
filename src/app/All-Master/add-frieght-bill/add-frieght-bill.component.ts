import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../services/common.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-add-frieght-bill',
  templateUrl: './add-frieght-bill.component.html',
  styleUrls: ['./add-frieght-bill.component.scss']
})
export class AddFrieghtBillComponent implements OnInit {
  addfrieghtform!: FormGroup;
  plants: any[] = [];
  commodityIds: any[] = [];
  vendorCodes: any[] = [];
  vendorNames: any[] = [];
  childVendors: any[] = [];
  selectedVendors: any[] = [];
  vendors: any[] = [];
  childVendorCodes: any[] = [];
  childVendorNames: any[] = [];
  conditionIds: any[] = [];
  conditionTypes: any[] = [];
  poItems: any[] = [];
  poNumberToPoVendorMap: { poNumber: string; vendorName: string }[] = []; poNumbers: any[] = [];
  actualPOVendor: any;
  actualPOVendorCode: any;
  poVendors: any[] = [];
  conditions: any[] = [];
  commodities: any[] = [];
  isLoader: boolean = false;
  frateId: number = 0;
  fId: string = ''
  userData: any;
  originalFormData: any = {};
  tableData: any[] = [];
  username: any;
  toastMsg: any = '';
  errorToast: any = false;
  successToast: any = false;
  vendorCodeList: string[] = [];
  selectedLifnr: string | null = null; // user-selected vendor


  columns = [
    { header: 'Plant', field: 'plant' },
    { header: 'PO Number', field: 'poNumber' },
    { header: 'PO Item Number', field: 'poItem' },
    { header: 'Vendor Name', field: 'vendorName' },
    { header: 'Commodity', field: 'commodity' },
    { header: 'AAA Rate', field: 'aaarate' },
    { header: 'ALL Rate', field: 'allrate' },
    { header: 'Child Vendor', field: 'childVendorName' },
    { header: 'Child Vendor Code', field: 'childVendorCode' },
    { header: 'Vendor Code', field: 'vendorCode' },
    { header: 'Condition Type', field: 'conditionType' },

  ];
  commodity: string = '';
  condition: string = '';
  childVendor: string = '';
  vendor: string = '';
  // selectedLifnr: string = '';
  selectedWerks: string = '';


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private commonService: CommonService,
    private activeRoute: ActivatedRoute,
    public spinner: NgxSpinnerService
  ) {
    // this.userdata = JSON.parse(localStorage.getItem('userdata') || '');
  }


  ngOnInit(): void {
    this.isLoader = true;
    this.username = localStorage.getItem('username') ? localStorage.getItem('username') : '';
    this.addfrieghtform = this.fb.group({
      plant: ['', Validators.required],

      vendorName: ['', Validators.required],

      poNumber: ['', Validators.required],
      poItem: ['', Validators.required],
      commodity: ['', Validators.required],

      aaarate: ['', Validators.required],
      // allrate:  ['', Validators.required],
      childVendor: [[], Validators.required],
      allrate: ['', [Validators.required, this.nonZeroValidator]], // ✅ Custom validator added

      conditiontype: ['', Validators.required],

    });

    this.getplantsDropDownList();

    this.fId = this.activeRoute.snapshot.queryParamMap.get('id')!;
    console.log(this.fId);
    if (this.fId) {
      this.addfrieghtform.controls['plant'].disable();
      this.addfrieghtform.controls['vendorName'].disable();
      this.addfrieghtform.controls['poNumber'].disable();
      this.addfrieghtform.controls['poItem'].disable();
      this.addfrieghtform.controls['commodity'].disable();
      this.addfrieghtform.controls['aaarate'].disable();
      this.addfrieghtform.controls['conditiontype'].disable();
      this.addfrieghtform.controls['childVendor'].disable();
      this.loadFreightById(this.fId); // ✅ call this function
    }
    this.isLoader = false;
  }
  gotoFrieght() {
    this.router.navigate(['All-Master/frieght']);
  }


  selectAllVendors() {
    const allVendorCodes = this.childVendors.map(v => v.childVendorCode);
    this.addfrieghtform.get('childVendor')?.setValue(allVendorCodes);
  }




  loadFreightById(id: string) {
    const url = 'inboundALLFreightRates/get/' + this.fId;
    this.commonService.getDataForAll(url).subscribe(
      (res: any) => {
        let result = res.data;
        this.frateId = result.frateId;

        this.originalFormData = {
          plant: result.plant,
          poNumber: result.poNumber,
          // poVendorName:result.actualPOVendor,
          poItem: result.poItem,
          commodity: result.commodity,
          aaarate: result.aaarate,
          allrate: result.allrate,
          // childVendor: result.childVendorName,
          // childVendor: [result.childVendorCode],
          // childVendorCode: result.childVendorCode,
          // vendorName: result.vendorName,
          // conditiontype: result.conditionId,
          childVendor: [result.childVendorName],
          vendorName: result.vendorCode || result.vendorName,
          conditiontype: result.conditionType,
        };
        this.actualPOVendor = result.poVendorName || '';

        this.onPlantSelected(result.plant)
        // ✅ patch to form
        this.addfrieghtform.patchValue(this.originalFormData);

      },
      () => {
        this.isLoader = false;
        this.toastMsg = 'Error fetching data';
        this.errorToast = true;
      }
    );
  }
  onPoItemChange(selectedPoItem: string) {
    const match = this.poItems.find(p => p.poItem === selectedPoItem);

    if (match) {
      this.addfrieghtform.patchValue({
        aaarate: match.aaarate
      });
    }
  }

  clearDropdownData() {
    this.poNumbers = [];
    this.poItems = [];
    this.commodities = [];
    this.conditionTypes = [];
    this.conditions = [];
    this.childVendors = [];
    this.vendors = [];
    this.poVendors = [];
    this.vendorCodeList = [];
    this.poNumberToPoVendorMap = [];
    this.tableData = [];
    this.actualPOVendor = '';
    this.actualPOVendorCode = '';
    this.selectedLifnr = null;
  }


  onPoNumberChange(selectedPo: any) {
    console.log(selectedPo);

    const selectedVendor = this.poNumberToPoVendorMap.find(
      (item) => item.poNumber === selectedPo
    );
    this.actualPOVendor = selectedVendor?.vendorName?.toString()

    this.actualPOVendorCode = this.poVendors.find(item => item.poVendorName == this.actualPOVendor)?.poVendorCode
    this.isLoader = false;
  }


  getplantsDropDownList() {
    this.isLoader = true;
    this.commonService.dataGetMaster('common/getPlantDetails').subscribe(
      (response: any) => {
        this.plants = response?.data;
        this.isLoader = false;
      },
      error => {
        this.isLoader = false;
        this.toastMsg = 'Error fetching plant list';
        this.errorToast = true;
      }
    );
  }


  // onPlantSelected(plantCode: string) {
  //   if (!plantCode) return;
  //   this.isLoader = true;
  //   // this.resetForm();
  //     const plantValue = plantCode;

  //   this.addfrieghtform.reset();
  //   this.addfrieghtform.patchValue({ plant: plantValue });

  //   const url = `inboundALLFreightRates/getVendorByPlantCode/${plantCode}`;

  //   this.commonService.dataGetMaster(url).subscribe(
  //     (res: any) => {
  //       if (res?.status === 'Success') {
  //         const lifnr = res?.data?.lifnr;
  //         this.selectedLifnr = lifnr;
  //         this.selectedWerks = plantCode;

  //         console.log('Selected Lifnr:', this.selectedLifnr);
  //         console.log('Selected Werks:', this.selectedWerks);
  //         this.fetchAllDropdowns(lifnr, plantCode);
  //       }
  //       this.isLoader = false;
  //     },
  //     (error) => {
  //       this.isLoader = false;
  //       this.toastMsg = 'No data configured for the selected plant code';
  //       this.errorToast = true;
  //     }
  //   );
  // }


   onPlantSelected(plantCode: string) {
    if (!plantCode) return;
    this.clearDropdownData();

    this.addfrieghtform.reset();
    this.actualPOVendor = '';
    this.addfrieghtform.patchValue({ plant: plantCode });

    const url = `inboundALLFreightRates/getVendorByPlantCode/${plantCode}`;

    this.commonService.dataGetMaster(url).subscribe(
      (res: any) => {
        if (res?.status === 'Success') {

          // Extract vendor codes
          this.vendorCodeList = Object.values(res.data) as string[];

          this.selectedWerks = plantCode;

          console.log('Vendor List:', this.vendorCodeList);
        }
      },
      () => {
        this.toastr.error('No data configured for the selected plant code');
      }
    );
  }

  onVendorSelected(vendor: string) {
    this.selectedLifnr = vendor;
    console.log("Selected Vendor:", vendor);

    this.fetchAllDropdowns(vendor, this.selectedWerks);
  }

  fetchAllDropdowns(lifnr: string, werks: string) {
    this.isLoader = true;
    const url = '/inboundALLFreightRates/dropdown/fetch/all';
    const payload = {
      lifnr: lifnr,
      werks: werks,
      "createdBy": this.username,
      //  createdBy:this.userData,
    };

    this.commonService.postDataForALL(url, payload).subscribe(
      (res: any) => {
        if (res?.status === 'Success') {
          const data = res.data;

          this.poNumberToPoVendorMap = Object.entries(data.poNumberToPoVendorMap || {}).map(
            ([poNumber, vendorName]) => ({
              poNumber: poNumber as string,
              vendorName: vendorName as string
            })
          );
          // console.log(this.poNumberToPoVendorMap);


          // this.poItems = data.poItems;
          this.poVendors = data.poVendors || [];
          this.vendors = data.vendors || [];
          this.childVendors = data.childVendors;
          this.conditionTypes = data.conditions;
          this.conditions = data.conditions;
          this.commodities = data.commodities;

        }
        this.isLoader = false;
      },
      (error) => {
        this.isLoader = false;
        this.toastMsg = 'Error fetching dropdown data';
        this.errorToast = true;
      }
    );
  }
  getPoItemRates() {
    const formValue = this.addfrieghtform.value;

    if (!formValue.poNumber || !formValue.childVendor || formValue.childVendor.length === 0) {
      // this.toastr.warning('Please select PO Number and Child Vendor(s)');
      return;
    }


    const payload = {
      lifnr: this.selectedLifnr,
      werks: this.selectedWerks,
      createdBy: this.username,
      poNumber: formValue.poNumber,
      childVendorCode: formValue.childVendor.map((v: any) => v.childVendorCode || v)
    };
    console.log('Payload:', payload);

    const url = 'consume/sap/getPoItemRates';

    this.commonService.postDataForALL(url, payload).subscribe({
      next: (res: any) => {
      //  this.isLoader = false;
        if (res.status === 'Success' && res.data?.length > 0) {
          console.log('Fetched Rates:', res.data);
          this.poItems = res.data;
          // const totalRate = res.data.reduce((sum: number, item: any) => sum + (item.aaarate || 0), 0);

          this.addfrieghtform.patchValue({
            // aaarate: totalRate,
            poItem: '',

          });

          this.isLoader = false;
          // this.toastMsg = 'AAA Rate fetched successfully';
          // this.successToast = true;
        } else {
          this.isLoader = false;
          this.toastMsg = 'No rate data found for selected vendor/PO';
          this.errorToast = true;
        }
      },
      error: (err) => {
        this.isLoader = false;
        this.toastMsg = 'Rates not defined for these child vendor';
        this.errorToast = true;
        console.error(err);
      },
    });
  }

  // fetchByFilter() {
  //   const formValue = this.addfrieghtform.value;

  //   const url = 'inboundALLFreightRates/fetchByFilter';
  //   const payload = {
  //     lifnr: this.selectedLifnr,
  //     werks: this.selectedWerks,
  //     createdBy: this.username,
  //     filterBy: {
  //       vendorCode: formValue.vendorName || '',
  //       childVendorCode: formValue.childVendor?.length ? formValue.childVendor : [],
  //       conditionType: this.conditions.find(c => c.conditionId === formValue.conditiontype)?.conditionType || '',
  //       poItem: formValue.poItem || '',
  //       poNumber: formValue.poNumber || '',
  //       commodityId: formValue.commodity || ''
  //     }
  //   };

  //   console.log('fetchByFilter payload:', payload);

  //   this.commonService.postDataForALL(url, payload).subscribe({
  //     next: (res: any) => {
  //       if (res.status === 'Success' && res.data?.length > 0) {
  //         this.tableData = res.data;
  //         console.log('Fetched table data:', this.tableData);
  //         this.isLoader = false;
  //         this.toastMsg = 'Filtered data fetched successfully';
  //         this.successToast = true;
  //       } else {
  //         this.tableData = [];
  //         this.isLoader = false;
  //         this.toastMsg = 'No data found for the selected filter';
  //         this.errorToast = true;
  //       }
  //     },
  //     error: (err) => {
  //       this.spinner.hide();
  //       this.isLoader = false;
  //       this.toastMsg = 'Error fetching filtered data';
  //       this.errorToast = true;
  //       console.error('Error in fetchByFilter:', err);
  //     }
  //   });
  // }


submitForm() {
  console.log('Submit button clicked');

  if (!this.addfrieghtform.valid) {
    this.toastMsg = 'Please fill all required fields';
    this.errorToast = true;
    return;
  }

  this.isLoader = true; // Start loader immediately

  setTimeout(() => {

    let formData = this.addfrieghtform.value;

    // Get readable values for dropdowns
    const selectedCommodity = this.commodities.find((key: any) => key.commodityId == formData.commodity);
    const selectedCondition = this.conditions.find((key: any) => key.conditionId == formData.conditiontype);
    const selectedVendor = this.vendors.find((key: any) => key.vendorCode == formData.vendorName);
    const selectedChildVendor = this.childVendors.find((key: any) => key.vendorCode == formData.childVendor);

    this.commodity = selectedCommodity?.commodityType || '';
    this.condition = selectedCondition?.conditionType || '';
    this.vendor = selectedVendor?.vendorName || '';
    this.childVendor = selectedChildVendor?.vendorName || '';

    // UPDATE CASE
    if (this.frateId && this.frateId !== 0) {
      const url = 'inboundALLFreightRates/updateAllRate';
      const payload = {
        frateId: this.frateId,
        allRate: formData.allrate,
        remarks: '',
        updatedBy: this.username
      };

      this.commonService.postDataForALL(url, payload).subscribe(
        (res: any) => {
          this.isLoader = false;
          this.toastMsg = 'Data updated successfully';
          this.successToast = true;
          setTimeout(() => {
            this.successToast = false;
            this.gotoFrieght();
          }, 500);
        },
        (err: any) => {
          this.isLoader = false;
          this.toastMsg = 'Error updating data';
          this.errorToast = true;
        }
      );
    }
    // ADD CASE
    else {
      const url = 'inboundALLFreightRates/saveOrUpdate';

      let payload = formData.childVendor.map((code: string) => {
        const vendor = this.childVendors.find(v => v.childVendorCode === code);
        const conditionObj = this.conditions.find(c => c.conditionId === formData.conditiontype);

        return {
          childVendorCode: code,
          childVendorName: vendor?.childVendorName || '',
          frateId: null,
          plant: formData.plant,
          poNumber: formData.poNumber,
          poItem: formData.poItem,
          commodity: this.commodity,
          commodityId: formData.commodity,
          aaarate: formData.aaarate,
          allrate: formData.allrate,
          vendorCode: formData.vendorName,
          vendor: this.vendor,
          isActive: true,
          remarks: "",
          createdBy: this.username,
          condition: this.condition,
          conditionType: conditionObj?.conditionType || '',
          conditionId: formData.conditiontype,
          poVendorName: this.actualPOVendor,
          poVendor: this.actualPOVendorCode,
        };
      });

      this.commonService.postDataForALL(url, payload).subscribe(
        (res: any) => {
          this.isLoader = false;
          if (res.status === 'Success') {
            const skipped = res.data?.skipped || [];
            if (skipped.length > 0) {
              this.toastMsg = 'Duplicate entries are not allowed';
              this.errorToast = true;
            } else {
              this.toastMsg = 'Data added successfully';
              this.successToast = true;
            }
            this.gotoFrieght();
            this.resetForm();
          } else {
            this.isLoader = false;
            this.toastMsg = res.message || 'Error adding data';
            this.errorToast = true;
          }
        },
        (err: any) => {
          this.isLoader = false;
          this.toastMsg = 'Error adding data';
          this.errorToast = true;
        }
      );
    }

  }, 2000); // Delay API call for 2 seconds
}



  resetForm() {
    this.isLoader = true;
    if (this.frateId && this.frateId !== 0) {
      // ✅ Edit mode: restore original data
      this.addfrieghtform.patchValue(this.originalFormData);
    } else {
      // ✅ Add mode: completely clear form
      this.addfrieghtform.reset();
      this.commodities = [];
      this.childVendorNames = [];
      this.poItems = [];
      this.poNumbers = [];
      this.conditionTypes = [];
      this.actualPOVendor = '';
      // this.vendorNames=[];

    }
    this.addfrieghtform.markAsUntouched();
    this.addfrieghtform.markAsPristine();
    this.isLoader = false;
  }

  onCommodity(value: any) {
    this.commodity = value;
  }
  // onChildVendorChange(selectedValues: any[]) {
  //   const control = this.addfrieghtform.get('childVendor');
  //   const allCodes = this.childVendors.map(v => v.childVendorCode);

  //   if (selectedValues.includes('all')) {
  //     const isAllSelected = allCodes.every(code => selectedValues.includes(code));

  //     if (isAllSelected) {
  //       // If already all selected → deselect all
  //       control?.setValue([]);
  //     } else {
  //       // Select all vendor codes
  //       control?.setValue(allCodes);
  //     }
  //   }
  // }
  onChildVendorChange(selectedValues: any[]) {
    const control = this.addfrieghtform.get('childVendor');
    const allVendorCodes = this.childVendors.map(v => v.childVendorCode);

    // If "Select All" option was chosen
    const isSelectAllChosen = selectedValues.includes('all');

    if (isSelectAllChosen) {
      const allSelected = allVendorCodes.every(code => selectedValues.includes(code));

      if (allSelected) {
        // ✅ Deselect all if all were already selected
        control?.setValue([]);
      } else {
        // ✅ Select all vendor codes
        control?.setValue(allVendorCodes);
      }
    }
  }

    nonZeroValidator(control: AbstractControl): ValidationErrors | null {
    const value = parseFloat(control.value);
    if (isNaN(value)) return null; // If it's empty or not a number, let required handle it
    return value === 0 ? { nonZero: true } : null;
  }




}
