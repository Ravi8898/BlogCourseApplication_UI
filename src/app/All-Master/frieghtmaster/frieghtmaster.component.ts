import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { CommonService } from '../../services/common.service';
import { AllMaterService } from 'src/app/services/all-mater.service';
@Component({
  selector: 'app-frieghtmaster',
  templateUrl: './frieghtmaster.component.html',
  styleUrls: ['./frieghtmaster.component.scss']
})
export class FrieghtmasterComponent implements OnInit {
  poNumberToPoVendorMap: { poNumber: string; vendorName: string }[] = []; poNumbers: any[] = [];

  isFilterApplied: boolean = false;
  listingData: any[] = [];
  exportData: any[] = []
  isAddModal: boolean = false;
  plants: any[] = [];
  frateId: number = 0;
  username: any;
  frieghtSearchObject: any = {};
  addfrieghtform!: FormGroup;
  showHistoryModal:boolean=false;
  isLoader: boolean = false;
  active: string = '/All-Master/frieght';
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
   totalPages: number = 0;
   pages: number[] = [];
  toastMsg: any = '';
  errorToast: any = false;
  successToast: any = false;
  isUpdateModal: boolean = false;
  allRecords: any[] = []; // Store all fetched records
  originalData: any[] = []; // Store original unfiltered data

  constructor(
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private allService: AllMaterService,
    private toastr: ToastrService,
    public spinner: NgxSpinnerService,
  ) {

  }
  ngOnInit(): void {
    this.username=localStorage.getItem('username')?localStorage.getItem('username'):'';
    this.addfrieghtform = this.fb.group({
      plant: ['', Validators.required],
      plantName: ['', Validators.required],
      vendorName: ['', Validators.required],
      poNumber: ['', Validators.required],
      poItem: ['', Validators.required],
      commodity: ['', Validators.required],
      aaarate: ['', Validators.required],
      allrate: ['', Validators.required],
      childVendor: ['', Validators.required]
    });
    this.initializeSearchObjects();
    this.getListingData(this.currentPage);
    // this.getplantsDropDownList();
  }
  closeAddModal() {
    this.isAddModal = false;
  }
  closeshowHistoryModal() {
    this.showHistoryModal = false;
  }

  onPageChange(page: number) {
    const pageNum = Number(page); // Ensure it's a number
    if (pageNum < 1 || pageNum > this.totalPages) return;
    this.currentPage = pageNum;
    // Slice from allRecords for the new page
    const startIdx = (this.currentPage - 1) * this.pageSize;
    const endIdx = startIdx + this.pageSize;
    const pageRecords = this.allRecords.slice(startIdx, endIdx);
    if (pageRecords.length === 0) {
      this.listingData = [{
        "Frieght ID": "",
        "Plant Name": "",
        "Plant": "",
        "PO Vendor Name": "",
        "PO Number": "",
        "PO Item Number": "",
        "Commodity": "",
        "Child Vendor Name": "",
        "AAA Rate": "",
        "ALL Rate": ""
      }];
    } else {
      this.listingData = pageRecords.map((item: any) => ({
        frateId_hide: item.frateId,
        "Frieght ID": item.frateId,
        "Plant Name": item.plantName,
        "Plant": item.plant,
        "PO Vendor Name": item.poVendorName,
        "PO Number": item.poNumber,
        "PO Item Number": item.poItem,
        "Commodity": item.commodity,
        "Child Vendor Name": item.childVendorName,
        "AAA Rate": item.aaarate,
        "ALL Rate": item.allrate,
      }));
    }
    this.exportData = pageRecords.map((item: any) => ({
      frateId_hide: item.frateId,
      "Frieght ID": item.frateId,
      'Plant': item.plant,
      'Plant Name': item.plantName,
      'PO Number': item.poNumber,
      'PO Item': item.poItem,
      "PO Vendor Name": item.poVendorName,
      'Commodity': item.commodity,
      "AAA Rate": item.aaarate,
      "ALL Rate": item.allrate,
    }));
  }
getListingData(page: number = 1) {
  this.isLoader = true;
  this.listingData = []; // Clear existing data immediately
  this.exportData = []; // Clear export data

  // Always fetch all records (up to 10000)
  const url = `inboundALLFreightRates/search/1/10000`;
  let json = { "chilVendorCode": [], "chilVendorName": [] };

  this.allService.postDataForALL(url, json).subscribe(
    (res: any) => {
      let result = res.data?.content || [];

      this.allRecords = result;
      this.totalItems = this.allRecords.length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

      this.currentPage = page;
      const startIdx = (this.currentPage - 1) * this.pageSize;
      const endIdx = startIdx + this.pageSize;
      const pageRecords = this.allRecords.slice(startIdx, endIdx);

      // Only set listingData if we have records
      if (pageRecords.length > 0) {
        this.listingData = pageRecords.map((item: any) => ({
          frateId_hide: item.frateId,
          "Frieght ID": item.frateId,
          "Plant Name": item.plantName,
          "Plant": item.plant,
          "PO Vendor Name": item.poVendorName,
          "PO Number": item.poNumber,
          "PO Item Number": item.poItem,
          "Commodity": item.commodity,
          "Child Vendor Name": item.childVendorName,
          "AAA Rate": item.aaarate,
          "ALL Rate": item.allrate,
        }));

        this.exportData = pageRecords.map((item: any) => ({
          frateId_hide: item.frateId,
          "Frieght ID": item.frateId,
          "Plant Name": item.plantName,
          "Plant": item.plant,
          "PO Vendor Name": item.poVendorName,
          "PO Number": item.poNumber,
          "PO Item Number": item.poItem,
          "Commodity": item.commodity,
          "Child Vendor Name": item.childVendorName,
          "AAA Rate": item.aaarate,
          "ALL Rate": item.allrate,
        }));

        this.originalData = result.map((item: any) => ({
          frateId_hide: item.frateId,
          "Frieght ID": item.frateId,
          "Plant Name": item.plantName,
          "Plant": item.plant,
          "PO Vendor Name": item.poVendorName,
          "PO Number": item.poNumber,
          "PO Item Number": item.poItem,
          "Commodity": item.commodity,
          "Child Vendor Name": item.childVendorName,
          "AAA Rate": item.aaarate,
          "ALL Rate": item.allrate,
        }));
      } else {
        // Set empty arrays instead of placeholder data
        this.listingData = [];
        this.exportData = [];
        this.originalData = [];
      }

      this.isLoader = false;
    },
    (err: any) => {
      // On error, set empty arrays
      this.listingData = [];
      this.exportData = [];
      this.originalData = [];
      this.allRecords = [];
      this.totalItems = 0;
      this.totalPages = 1;
      this.pages = [1];
      this.isLoader = false;
    }
  );
}
  openUpdateModal() {

  }
  // onDeleteConfirmedEmployee(row: any) {
  // }

  openHistoryModal(val:any){
    console.log(val);
    // set the variable true;
    this.frateId = val.frateId_hide;
    this.showHistoryModal=true;
  }
  goToAddBill() {
      this.active = '/All-Master/frieght';  // Keep tab highlighted

    this.router.navigate(['/All-Master/add-frieght-bill'])
    // this.isAddModal = true;
  }
  submitForm() {
    if (this.addfrieghtform.valid) {
      let formData = this.addfrieghtform.value;
      let url = 'inboundALLFreightRates/saveOrUpdate'
      let json = {
        "frateId": this.frateId || 0,

        "vendorName": formData.vendorName,
        "plant": formData.plant,
        "poNumber": formData.poNumber,
        "poItem": formData.poItem,
        "commodity": formData.commodity,
        "aaarate": formData.aaarate,
        "allrate": formData.allrate,
        "vendorCode": formData.vendorCode,
        "isActive": true,
        "remarks": "keyur tresting",
        "updatedBy": "kechota",

      }

      this.allService.postDataForALL(url, json).subscribe(
        (res: any) => {
          // Show success toast
          this.successToast = true;
          this.toastMsg = 'Data added successfully';
          setTimeout(() => {
            this.isAddModal = false;
            this.successToast = false;
          }, 1200);
          // After add, fetch last page to show the new record
          setTimeout(() => {
            // Fetch total count from backend
            this.allService.postDataForALL(`inboundALLFreightRates/search/1/1`, {}).subscribe((countRes: any) => {
              const total = countRes?.data?.totalElements || 0;
              const lastPage = Math.ceil(total / this.pageSize) || 1;
              this.currentPage = lastPage;
              this.getListingData(this.currentPage);
              this.resetForm();
            });
          }, 100); // slight delay to ensure backend is updated
        },
        (err: any) => {
          // Show error toast
          this.errorToast = true;
          this.toastMsg = 'Error adding data';
          setTimeout(() => {
            this.errorToast = false;
          }, 1200);
        }
      )
    }

  }
  getplantsDropDownList() {
    this.allService.dataGetMaster('common/getPlantDetails').subscribe(
      (response: any) => {
        this.plants = response?.data;
      },
      error => {
        this.toastr.error('Error fetching plant list');
      });
  }
  resetForm() {
    this.isLoader = true;
    this.addfrieghtform.reset();
    this.addfrieghtform.markAsUntouched();
    this.addfrieghtform.markAsPristine();
    this.addfrieghtform.updateValueAndValidity();

    this.frateId = 0;
    this.isLoader = false;
  }
 initializeSearchObjects() {
    this.frieghtSearchObject = [
      { forLabel: "Vendor Name", forContrl: "vendorName", forPlace: "Enter Vendor Name" },
      { forLabel: "PoItem", forContrl: "poItem", forPlace: "Enter PO Item" },
      {forLabel: "Commodity", forContrl: "commodity", forPlace: "Enter Commodity" },
      {forLabel:"PO Number",forContrl:"poNumber",forPlace:"Enter PO Number"}

    ];
  }
 applyFreightFilter(data: any) {
    this.isLoader = true;
  console.log(data);

    const paramData = data['pi_filterjson'];
    const allValuesEmpty = Object.values(paramData).every(
      value => value === '' || value === null || value === undefined
    );
    console.log(paramData,allValuesEmpty)
    if (allValuesEmpty) {
      // this.getListingData(this.currentPage);
      this.getListingData(1);
      return;
    }

    // ✅ Map frontend keys to backend field names
    const filterKeyMap: { [key: string]: string } = {
       "Frieght ID": "",
            "Plant Name": "",
            "Plant": "",
            "PO Vendor Name": "",
            "PO Number": "",
            "PO Item Number": "",
            "Commodity": "",
            "Child Vendor Name": "",
            "AAA Rate": "",
            "ALL Rate": ""

    };

    const filterBy: any = {};
    Object.keys(paramData).forEach(key => {
      const backendKey = filterKeyMap[key] || key.charAt(0).toLowerCase() + key.slice(1);
      const value = paramData[key];
      if (value !== '' && value !== null && value !== undefined) {
        filterBy[backendKey] = value.toString();
      }
    });
     const url = 'inboundALLFreightRates/search/1/10000'
    const payload = {
    //  poNumber:this.,
    };
    this.spinner.show();
    this.isLoader = true;
    this.currentPage = 1; // Reset to first page on new filter
    this.allService.postDataForALL(url, filterBy).subscribe({
      next: (res: any) => {
        this.isLoader = false;

        // const data = res?.data;
        // const result = Array.isArray(data) ? data : (data?.content || []);

        let result = res.data?.content || [];
this.allRecords = result;
        this.totalItems = this.allRecords.length; // Use allRecords length for total
        this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

        this.currentPage = 1;
        const startIdx = (this.currentPage - 1) * this.pageSize;
        const endIdx = startIdx + this.pageSize;
        const pageRecords = this.allRecords.slice(startIdx, endIdx);

        if (pageRecords.length === 0) {

          this.listingData = [{
            "Frieght ID": "",
            "Plant Name": "",
            "Plant": "",
            "PO Vendor Name": "",
            "PO Number": "",
            "PO Item Number": "",
            "Commodity": "",
            "Child Vendor Name": "",
            "AAA Rate": "",
            "ALL Rate": ""
          }];
        } else {
          this.listingData = pageRecords.map((item: any) => ({
            frateId_hide: item.frateId,
            "Frieght ID": item.frateId,
            "Plant Name": item.plantName,
            "Plant": item.plant,
            "PO Vendor Name": item.poVendorName,
            "PO Number": item.poNumber,
            "PO Item Number": item.poItem,
            "Commodity": item.commodity,
            "Child Vendor Name": item.childVendorName,
            "AAA Rate": item.aaarate,
            "ALL Rate": item.allrate,
          }));

    this.originalData = result.map((item: any) => ({
          frateId_hide: item.frateId,
            "Frieght ID": item.frateId,
            "Plant Name": item.plantName,
            "Plant": item.plant,
            "PO Vendor Name": item.poVendorName,
            "PO Number": item.poNumber,
            "PO Item Number": item.poItem,
            "Commodity": item.commodity,
            "Child Vendor Name": item.childVendorName,
            "AAA Rate": item.aaarate,
            "ALL Rate": item.allrate,
        }));

        }
        this.spinner.hide();
      },
      error: (err) => {
        this.isLoader = false;
        this.listingData = [{
          "Frieght ID": "",
          "Plant Name": "",
          "Plant": "",
          "PO Vendor Name": "",
          "PO Number": "",
          "PO Item Number": "",
          "Commodity": "",
          "Child Vendor Name": "",
          "AAA Rate": "",
          "ALL Rate": ""
        }];
        this.spinner.hide();
      }
    });
  }
  getfrightById(value: any) {
    console.log(value);
    this.frateId= value?.frateId_hide;
    console.log(this.frateId,"fid");
    // this.isAddModal = true;
    // this.router.navigate(['/All-Master/add-frieght-bill']);
     this.router.navigate(['/All-Master/add-frieght-bill'], { queryParams: { id: value['frateId_hide'] } })
    let url = 'inboundALLFreightRates/get/' + value?.frateId_hide
    let json = {}
    this.allService.getDataForAll(url).subscribe(
      (res: any) => {
        let result = res.data
        this.addfrieghtform.patchValue({
          plant: result.plant,
          vendorName: result.vendorName,
          poNumber: result.poNumber,
          poItem: result.poItem,
          commodity: result.commodity,
          aaarate: result.aaarate,
          allrate: result.allrate,
          // vendorCode: result.vendorCode,
        })
        // this.frateIddata = res.data.frateId
      },
      (err: any) => {
        this.toastr.error("Error fetching data");
      }

    )


  }
 onDeleteFreightRate(row: any) {

  if (!row || !row.frateId_hide) return;

  if (!confirm('Are you sure you want to delete this Freight Rate?')) return;

  this.isLoader = true;
  const url ='inboundALLFreightRates/delete';
  const passParam = {

    "deletedBy": this.username,
    "id": row.frateId_hide,
    "remarks": "delete test"

  }

  this.allService.postDataForALL(url,passParam).subscribe({
    next: () => {
      this.getListingData(this.currentPage);
      this.successToast = true;
      this.toastMsg = 'Freight Rate deleted successfully!';
      setTimeout(() => {
        this.successToast = false;
      }, 1200);
      this.isLoader = false;
      this.toastr.success('Freight Rate deleted successfully!');
    },
    error: (err) => {
      this.errorToast = true;
      this.toastMsg = 'Something went wrong!';
      setTimeout(() => {
        this.errorToast = false;
      }, 1200);
      this.isLoader = false;
      this.toastr.error('Something went wrong!');
      console.error('Delete Error:', err);
    }
  });
}



}
