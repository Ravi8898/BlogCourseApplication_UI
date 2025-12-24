import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { CommonService } from '../../services/common.service';
import { AllMaterService } from 'src/app/services/all-mater.service';

@Component({
  selector: 'app-all-master-data',
  templateUrl: './all-master-data.component.html',
  styleUrls: ['./all-master-data.component.scss']
})
export class AllMasterDataComponent implements OnInit {
  fileInput!: HTMLInputElement;
  billToMappingList: any[] = [];
  vendorList: any[] = [];
  originalVendorList: any[] = [];
  employeeList: any[] = [];
  columns: any[] = [];
  employeeSearchObject: any = {};
  vendorSearchObject: any = {};
  fiSearchObject: any = {};
  addVendorForm!: FormGroup;
  vendorUpdateFormData: any;
  formData: any = {
    CustomerCode: '',
    Mechanism: '',
    Email: '',
    Mobilenumber: '',
  };
  isLoader: boolean = false;
  isUpdateModal: boolean = false;
  showAddForm: boolean = false;
  activeTab: string = 'on';
  employeeData: any;
  VendorId: string = '';
  originalVendorData: any;
  selectedItem: any = null;
  loginType: string = 'All-Master';
  modalName: string = 'UploadModal';
  originalData: any[] = [];

  // FI Data related properties
  fiFields = [
    { key: 'ALL_FIMappingId', label: 'ALL FIMappingId' },
    { key: 'Business', label: 'Business' },
    { key: 'Plant_location', label: 'Plant Location' },
    { key: 'PlantCode_AAA', label: 'PlantCode AAA' },
    { key: 'PlantCode_ALL', label: 'PlantCode ALL' },
    { key: 'ProfitCenter_ALL', label: 'ProfitCenter ALL' },
    { key: 'CostCenter_ALL', label: 'CostCenter ALL' },
    { key: 'SAP_TCODE', label: 'SAP TCODE' },
    { key: 'GLAccount', label: 'GL Account' },
    { key: 'TaxCode', label: 'Tax Code' },
    { key: 'ProfitCenter', label: 'Profit Center' },
    { key: 'CustomerCode1', label: 'Customer Code1' },
    { key: 'SERVICE_CODE', label: 'Service Code' },
    { key: 'BusinessArea', label: 'Business Area' },
    { key: 'SAP_COMPANY_CODE', label: 'SAP Company Code' },
    { key: 'SENDING_APPLICATION_NAME', label: 'Sending Application Name' },
    { key: 'SAP_STATE_CODE', label: 'SAP State Code' },
    { key: 'PARTY_GSTIN_Number', label: 'Party GSTIN Number' },
    { key: 'Company_GSTIN', label: 'Company GSTIN' },
    { key: 'SAC_CODE', label: 'SAC Code' },
    { key: 'SGST_PRCNTG', label: 'SGST Percentage' },
    { key: 'CGST_PRCNTG', label: 'CGST Percentage' },
    { key: 'IGST_PRCNTG', label: 'IGST Percentage' },
    { key: 'PLANT_CD', label: 'Plant Code' },
    { key: 'IsActive', label: 'Is Active' },
    { key: 'CreatedBy', label: 'Created By' },
    { key: 'CreatedDate', label: 'Created Date' },
    { key: 'CustomerCode', label: 'Customer Code' },
    { key: 'SAP_TRANSACTION_CODE', label: 'SAP Transaction Code' }
  ];
  fiDataList: any[] = [];
  fiAllRecords: any[] = [];
  fiPagination = { page: 1, size: 10, total: 0 };
  fiCurrentPage: number = 1;
  fiPageSize: number = 10;
  fiTotalItems: number = 0;
  fiTotalPages: number = 0;
  fiPages: number[] = [];
  fiSearchObj: any = {};
  isFiNoData: boolean = false;
  showFiForm: boolean = false;
  editingFiRow: any = null;
  fiFormData: any = {};
  toastMsg: any = '';
  errorToast: any = false;
  successToast: any = false;

  // Pagination for Bill to mapping Listing
  billToMappingAllRecords: any[] = [];
  billToMappingCurrentPage: number = 1;
  billToMappingPageSize: number = 10;
  billToMappingTotalItems: number = 0;
  billToMappingTotalPages: number = 0;
  billToMappingPages: number[] = [];

  // Pagination for Vendor Update
  vendorAllRecords: any[] = [];
  vendorCurrentPage: number = 1;
  vendorPageSize: number = 10;
  vendorTotalItems: number = 0;
  vendorTotalPages: number = 0;
  vendorPages: number[] = [];

  constructor(
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private allService: AllMaterService,
    private fb: FormBuilder
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.employeeData = navigation?.extras?.state?.['employeeData'];
  }

  ngOnInit(): void {
    this.VendorId = this.route.snapshot.queryParamMap.get('Id') || '';
    const savedTab = localStorage.getItem('allMasterDataActiveTab');
    if (savedTab === 'on' || savedTab === 'off' || savedTab === 'fi') {
      this.activeTab = savedTab;
    } else {
      this.activeTab = 'on';
    }

    if (this.activeTab === 'off') {
      this.getVendorList();
    } else if (this.activeTab === 'fi') {
      this.fetchFiData(1, this.fiPagination.size, {});
    } else {
      this.getBillToMappingList();
    }

    this.addVendorForm = this.fb.group({
      Email: ['', Validators.required],
      CustomerCode: ['', Validators.required],
      Mechanism: ['', Validators.required],
      Mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    });

    this.initializeSearchObjects();
    this.initFiData();
  }

  ngAfterViewInit(): void {
    const input = document.querySelector<HTMLInputElement>("input[type='file'][accept='.xlsx, .xls']");
    if (input) this.fileInput = input;
  }

  initializeSearchObjects() {
    this.employeeSearchObject = [
      { forLabel: "AAA_PlantCode", forContrl: "AAA_PlantCode", forPlace: "Enter AAA_PlantCode" },
      { forLabel: "AAA_PlantName", forContrl: "AAA_PlantName", forPlace: "Enter AAA PlantName" },
      { forLabel: "AAA_CustomerCode", forContrl: "CustomerCode", forPlace: "Enter Customer Code" },
      { forLabel: "ALL_Location", forContrl: "ALL_Location", forPlace: "Enter plant location" },
      { forLabel: "ALL_GSTAddress", forContrl: "ALL_GSTAddress", forPlace: "Enter ALL_GSTAddress " },
    ];

    this.vendorSearchObject = [
      { forLabel: "Email", forContrl: "Email", forPlace: "Enter Email" },
      { forLabel: "Customer Code", forContrl: "CustomerCode", forPlace: "Enter Customer Code" },
      { forLabel: "Mechanism", forContrl: "Mechanism", forPlace: "Enter Mechanism" },
      { forLabel: "Mobile Number", forContrl: "Mobile Number", forPlace: "Enter Mobile Number" }
    ];

    this.fiSearchObject = [
      { forLabel: "ALL_FIMappingId", forContrl: "ALL_FIMappingId", forPlace: "Enter ALL_FIMappingId" },
      { forLabel: "Business", forContrl: "Business", forPlace: "Enter Business" },
      { forLabel: "Plant Location", forContrl: "Plant_location", forPlace: "Enter Plant Location" },
      { forLabel: "PlantCode AAA", forContrl: "PlantCode_AAA", forPlace: "Enter PlantCode AAA" },
      { forLabel: "PlantCode ALL", forContrl: "PlantCode_ALL", forPlace: "Enter PlantCode ALL" },
      { forLabel: "ProfitCenter ALL", forContrl: "ProfitCenter_ALL", forPlace: "Enter ProfitCenter ALL" },
      { forLabel: "CostCenter ALL", forContrl: "CostCenter_ALL", forPlace: "Enter CostCenter ALL" },
      { forLabel: "SAP TCODE", forContrl: "SAP_TCODE", forPlace: "Enter SAP TCODE" },
      { forLabel: "GL Account", forContrl: "GLAccount", forPlace: "Enter GL Account" },
      { forLabel: "Tax Code", forContrl: "TaxCode", forPlace: "Enter Tax Code" },
      { forLabel: "Profit Center", forContrl: "ProfitCenter", forPlace: "Enter Profit Center" },
      { forLabel: "Customer Code1", forContrl: "CustomerCode1", forPlace: "Enter Customer Code1" },
      { forLabel: "Service Code", forContrl: "SERVICE_CODE", forPlace: "Enter Service Code" },
      { forLabel: "Business Area", forContrl: "BusinessArea", forPlace: "Enter Business Area" },
      { forLabel: "SAP Company Code", forContrl: "SAP_COMPANY_CODE", forPlace: "Enter SAP Company Code" },
      { forLabel: "Sending Application Name", forContrl: "SENDING_APPLICATION_NAME", forPlace: "Enter Sending Application Name" },
      { forLabel: "SAP State Code", forContrl: "SAP_STATE_CODE", forPlace: "Enter SAP State Code" },
      { forLabel: "Party GSTIN Number", forContrl: "PARTY_GSTIN_Number", forPlace: "Enter Party GSTIN Number" },
      { forLabel: "Company GSTIN", forContrl: "Company_GSTIN", forPlace: "Enter Company GSTIN" },
      { forLabel: "SAC Code", forContrl: "SAC_CODE", forPlace: "Enter SAC Code" },
      { forLabel: "SGST Percentage", forContrl: "SGST_PRCNTG", forPlace: "Enter SGST Percentage" },
      { forLabel: "CGST Percentage", forContrl: "CGST_PRCNTG", forPlace: "Enter CGST Percentage" },
      { forLabel: "IGST Percentage", forContrl: "IGST_PRCNTG", forPlace: "Enter IGST Percentage" },
      { forLabel: "Plant Code", forContrl: "PLANT_CD", forPlace: "Enter Plant Code" },
      { forLabel: "Is Active", forContrl: "IsActive", forPlace: "Enter Is Active" },
      { forLabel: "Created By", forContrl: "CreatedBy", forPlace: "Enter Created By" },
      { forLabel: "Created Date", forContrl: "CreatedDate", forPlace: "Enter Created Date" },
      { forLabel: "Customer Code", forContrl: "CustomerCode", forPlace: "Enter Customer Code" },
      { forLabel: "SAP Transaction Code", forContrl: "SAP_TRANSACTION_CODE", forPlace: "Enter SAP Transaction Code" }
    ];
  }

  initFiData() {
    // No hardcoded data. Data will be loaded from API only.
    this.fiDataList = [];
  }

  fetchFiData(page = 1, size = 10, searchObj: any = {}) {
    this.isLoader = true;
    this.isFiNoData = false;
    // Always fetch all records (up to 10000)
    this.allService.searchFiMappings(1, 1000, searchObj).subscribe({
      next: (res: any) => {
        const data = res?.data;
        const result = Array.isArray(data) ? data : (data?.content || []);
        this.fiAllRecords = result.map((item: any) => ({
          ALL_FIMappingId: item.allFimappingId ?? '',
          Business: item.business ?? '',
          Plant_location: item.plantLocation ?? '',
          PlantCode_AAA: item.plantcodeAaa ?? '',
          PlantCode_ALL: item.plantcodeAll ?? '',
          ProfitCenter_ALL: item.profitcenterAll ?? '',
          CostCenter_ALL: item.costcenterAll ?? '',
          SAP_TCODE: item.sapTcode ?? '',
          GLAccount: item.glaccount ?? '',
          TaxCode: item.taxcode ?? '',
          ProfitCenter: item.profitcenter ?? '',
          CustomerCode1: item.customercode1 ?? '',
          SERVICE_CODE: item.serviceCode ?? '',
          BusinessArea: item.businessarea ?? '',
          SAP_COMPANY_CODE: item.sapCompanyCode ?? '',
          SENDING_APPLICATION_NAME: item.sendingApplicationName ?? '',
          SAP_STATE_CODE: item.sapStateCode ?? '',
          PARTY_GSTIN_Number: item.partyGstinNumber ?? '',
          Company_GSTIN: item.companyGstin ?? '',
          SAC_CODE: item.sacCode ?? '',
          SGST_PRCNTG: item.sgstPrcntg ?? '',
          CGST_PRCNTG: item.cgstPrcntg ?? '',
          IGST_PRCNTG: item.igstPrcntg ?? '',
          PLANT_CD: item.plantCode ?? '',
          IsActive: item.isActive ?? '',
          CreatedBy: item.createdBy ?? '',
          CreatedDate: item.createdDate ?? '',
          CustomerCode: item.customerCode ?? '',
          SAP_TRANSACTION_CODE: item.sapTransactionCode ?? ''
        }));
        this.fiTotalItems = data?.totalElements || this.fiAllRecords.length;
        this.fiTotalPages = Math.ceil(this.fiTotalItems / this.fiPageSize) || 1;
        this.fiPages = Array.from({ length: this.fiTotalPages }, (_, i) => i + 1);
        this.fiCurrentPage = page;
        this.fiDataList = this.getFiPagedData();
        this.isFiNoData = this.fiDataList.length === 0;
         this.originalData = [...this.fiDataList];
          this.originalData = [...this.fiAllRecords];
        this.isLoader = false;
      },
      error: (err) => {
        this.fiDataList = [];
        this.fiAllRecords = [];
        this.fiTotalItems = 0;
        this.fiTotalPages = 0;
        this.fiPages = [];
        this.isFiNoData = true;
        this.isLoader = false;
        this.toastMsg = 'Something went wrong!';
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 5000);
      }
    });
  }

  getFiPagedData() {
    const startIdx = (this.fiCurrentPage - 1) * this.fiPageSize;
    const endIdx = startIdx + this.fiPageSize;
    return this.fiAllRecords.slice(startIdx, endIdx);
  }

  onFiPageChange(page: number) {
    const pageNum = Number(page);
    if (pageNum < 1 || pageNum > this.fiTotalPages) return;
    this.fiCurrentPage = pageNum;
    this.fiDataList = this.getFiPagedData();
  }

  onDeleteFiRow(row: any) {
    if (!row || !row.ALL_FIMappingId) return;
    if (!confirm('Are you sure you want to delete this FI Mapping?')) return;
    this.isLoader = true;
    this.allService.deleteFiMapping(row.ALL_FIMappingId).subscribe({
      next: () => {
        this.fetchFiData(this.fiPagination.page, this.fiPagination.size, this.fiSearchObj);
        this.isLoader = false;
        this.toastMsg = 'FI Data deleted successfully!';
        this.successToast = true;
        setTimeout(() => {
          this.successToast = false;
        }, 5000);
      },
      error: () => {
        this.isLoader = false;
        this.toastMsg = 'Something went wrong!';
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 5000);
      }
    });
  }

  onDeleteConfirmedEmployee(row: any) {
    if (this.activeTab === 'on') {
      if (!row || !row.MappingId_hide) return;
      if (!confirm('Are you sure you want to delete this Bill To Mapping?')) return;
      this.isLoader = true;
      this.allService.deleteBillToMapping(row.MappingId_hide, 'allBillToMapping').subscribe({
        next: () => {
          this.getBillToMappingList();
          this.isLoader = false;
          this.toastMsg = 'Bill To Mapping deleted successfully!';
          this.successToast = true;
          setTimeout(() => {
            this.successToast = false;
          }, 5000);
        },
        error: () => {
          this.isLoader = false;
          this.toastMsg = 'Something went wrong!';
          this.errorToast = true;
          setTimeout(() => {
            this.errorToast = false;
          }, 5000);
        }
      });
    }
    else if (this.activeTab === 'off') {
      if (!row || !row.VendorId_hide) return;
      if (!confirm('Are you sure you want to delete this Vendor?')) return;
      this.isLoader = true;
      this.allService.deleteVendor(row.VendorId_hide).subscribe({
        next: () => {
          this.getVendorList();
          this.isLoader = false;
          this.toastMsg = 'Vendor deleted successfully!';
          this.successToast = true;
          setTimeout(() => {
            this.successToast = false;
          }, 5000);
        },
        error: () => {
          this.isLoader = false;
          this.toastMsg = 'Something went wrong!';
          this.errorToast = true;
          setTimeout(() => {
            this.errorToast = false;
          }, 5000);
        }
      });
    }
  }

  onAddFiBill() {
    this.editingFiRow = null;
    this.fiFormData = {};
    this.showFiForm = true;
  }

  onEditFiRow(row: any) {
    this.editingFiRow = row;
    this.fiFormData = { ...row };
    this.showFiForm = true;
  }

  onFiFormSubmit() {
    this.isLoader = true;
    if (this.editingFiRow && this.fiFormData.ALL_FIMappingId) {
      this.allService.updateFiMapping(this.fiFormData).subscribe({
        next: () => {
          this.showFiForm = false;
          this.fetchFiData(this.fiPagination.page, this.fiPagination.size, this.fiSearchObj);
          this.toastMsg = 'FI Data updated successfully!';
          this.successToast = true;
          setTimeout(() => {
            this.successToast = false;
          }, 5000);
          this.isLoader = false;
        },
        error: () => {
          this.isLoader = false;
          this.toastMsg = 'Something went wrong!';
          this.errorToast = true;
          setTimeout(() => {
            this.errorToast = false;
          }, 5000);
        }
      });
    } else {
      this.allService.createFiMapping(this.fiFormData).subscribe({
        next: () => {
          this.showFiForm = false;
          this.fetchFiData(this.fiPagination.page, this.fiPagination.size, this.fiSearchObj);
          this.toastMsg = 'FI Data added successfully!';
          this.successToast = true;
          setTimeout(() => {
            this.successToast = false;
          }, 5000);
          this.isLoader = false;
        },
        error: () => {
          this.isLoader = false;
          this.toastMsg = 'Something went wrong!';
          this.errorToast = true;
          setTimeout(() => {
            this.errorToast = false;
          }, 5000);
        }
      });
    }
  }

  onFiFormCancel() {
    this.showFiForm = false;
    this.fiFormData = {};
    this.editingFiRow = null;
  }

  onUploadClick() {
    if (!this.fileInput) {
      const input = document.querySelector<HTMLInputElement>("input[type='file'][accept='.xlsx, .xls']");
      if (input) this.fileInput = input;
    }
    if (this.fileInput) this.fileInput.value = '';
    if (this.fileInput) this.fileInput.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) {
      this.toastMsg = 'No file selected.';
      this.errorToast = true;
      setTimeout(() => {
        this.errorToast = false;
      }, 5000);
      return;
    }
    console.log('FI Upload: File selected:', file);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        this.isLoader = true;
        this.isFiNoData = false;
        const user = localStorage.getItem('username') || 'unknown';
        console.log('FI Upload: Calling fiBulkUpload API with file and user', user);

        this.allService.fiBulkUpload(file, user).subscribe({
          next: (res: any) => {
            console.log('FI Upload: API response:', res);
            if (res && res.status && (res.status === 'success' || res.status === true)) {
              this.fetchFiData(this.fiPagination.page, this.fiPagination.size, this.fiSearchObj);
              this.toastMsg = 'Bulk upload successful.';
              this.successToast = true;
              setTimeout(() => {
                this.successToast = false;
              }, 5000);
            } else {
              this.isFiNoData = true;
              this.toastMsg = res && res.message ? res.message : 'Bulk upload failed or returned no data.';
              this.errorToast = true;
              setTimeout(() => {
                this.errorToast = false;
              }, 5000);
            }
            this.isLoader = false;
          },
          error: (err) => {
            console.error('FI Upload: API error:', err);
            this.isLoader = false;
            this.isFiNoData = true;
            let msg = 'Bulk upload failed.';
            if (err && err.error && err.error.message) msg = err.error.message;
            this.toastMsg = msg;
            this.errorToast = true;
            setTimeout(() => {
              this.errorToast = false;
            }, 5000);
          }
        });
      } catch (ex) {
        console.error('FI Upload: Error reading Excel file:', ex);
        this.toastMsg = 'Error reading Excel file: ' + ex;
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 5000);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  getBillToMappingList() {
    this.isLoader = true;
    this.allService.getBillToMappingList().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.billToMappingAllRecords = res.data.reverse().map((item: any) => ({
            MappingId_hide: item.billToMappingId || '',
            AAA_PlantCode: item.aaaPlantCode || '',
            AAA_PlantName: item.aaaPlantName || '',
            CustomerCode: item.aaaCustomerCode ? item.aaaCustomerCode.toString() : '',
            RCM_FCM: item.rcmFcm || '',
            ALL_Location: item.allLocation || '',
            ALL_PinCode: item.allPincode || '',
            ALL_GSTAddress: item.allGstAddress || '',
            RCM_GST: item.rcmGstPercentage || '',
            FCM_GST: item.fcmGstPercentage || '',
            ALL_PanNo: item.allPanNo || '',
          }));
          this.billToMappingTotalItems = this.billToMappingAllRecords.length;
          this.billToMappingTotalPages = Math.ceil(this.billToMappingTotalItems / this.billToMappingPageSize) || 1;
          this.billToMappingPages = Array.from({ length: this.billToMappingTotalPages }, (_, i) => i + 1);
          this.billToMappingCurrentPage = 1;
          this.employeeList = this.getBillToMappingPagedData();
          this.originalData = [...this.employeeList];
          this.originalData = [...this.billToMappingAllRecords];
        } else {
          this.employeeList = [];
          this.billToMappingAllRecords = [];
          this.billToMappingTotalItems = 0;
          this.billToMappingTotalPages = 0;
          this.billToMappingPages = [];
        }
        this.isLoader = false;
      },
      error: (err) => {
        console.error('Error fetching bill to mapping list:', err);
        this.isLoader = false;
        this.toastMsg = 'Something went wrong!';
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 5000);
      }
    });
  }

  getBillToMappingPagedData() {
    const startIdx = (this.billToMappingCurrentPage - 1) * this.billToMappingPageSize;
    const endIdx = startIdx + this.billToMappingPageSize;
    return this.billToMappingAllRecords.slice(startIdx, endIdx);
  }

  onBillToMappingPageChange(page: number) {
    const pageNum = Number(page);
    if (pageNum < 1 || pageNum > this.billToMappingTotalPages) return;
    this.billToMappingCurrentPage = pageNum;
    this.employeeList = this.getBillToMappingPagedData();
  }

  getVendorList() {
    this.isLoader = true;
    this.allService.getVendorMasterData().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.vendorAllRecords = res.data.reverse().map((item: any) => ({
            VendorId_hide: item.VendorId || '',
            CustomerCode: item.CustomerCode || '',
            Mechanism: item.Mechanism || '',
            Email_ID: item.Email || '',
            MobileNumber: item.Mobilenumber || ''
          }));
          this.vendorTotalItems = this.vendorAllRecords.length;
          this.vendorTotalPages = Math.ceil(this.vendorTotalItems / this.vendorPageSize) || 1;
          this.vendorPages = Array.from({ length: this.vendorTotalPages }, (_, i) => i + 1);
          this.vendorCurrentPage = 1;
          this.vendorList = this.getVendorPagedData();
           this.originalData = [...this.vendorList];
          this.originalData = [...this.vendorAllRecords];
        } else {
          this.vendorList = [];
          this.vendorAllRecords = [];
          this.vendorTotalItems = 0;
          this.vendorTotalPages = 0;
          this.vendorPages = [];
        }
        this.isLoader = false;
      },
      error: (err) => {
        console.error('Error fetching vendor list:', err);
        this.isLoader = false;
        this.toastMsg = 'Something went wrong!';
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 5000);
      }
    });
  }

  getVendorPagedData() {
    const startIdx = (this.vendorCurrentPage - 1) * this.vendorPageSize;
    const endIdx = startIdx + this.vendorPageSize;
    return this.vendorAllRecords.slice(startIdx, endIdx);
  }

  onVendorPageChange(page: number) {
    const pageNum = Number(page);
    if (pageNum < 1 || pageNum > this.vendorTotalPages) return;
    this.vendorCurrentPage = pageNum;
    this.vendorList = this.getVendorPagedData();
  }

  getVendorById() {
    this.allService.getVendorDetailsById(this.VendorId).subscribe({
      next: (res: any) => {
        const data = res?.data?.[0];
        if (data) {
          this.originalVendorData = { ...data };
          this.addVendorForm.patchValue({
            email: data.email,
            customerCode: data.customerCode,
            chargeMechanism: data.chargeMechanism,
            telephone: data.telephone,
          });
        }
      },
      error: (err) => {
        console.error('Error fetching vendor details:', err);
        this.toastMsg = 'Something went wrong!';
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 5000);
      }
    });
  }

  updateVendorData() {
    if (!this.vendorUpdateFormData || !this.vendorUpdateFormData.VendorId) {
      this.toastMsg = 'Vendor ID is required for update!';
      this.errorToast = true;
      setTimeout(() => {
        this.errorToast = false;
      }, 5000);
      return;
    }

    const updatedData = {
      vendorId: this.vendorUpdateFormData.VendorId,
      vendorNumber: this.vendorUpdateFormData.vendorNumber || '',
      name: this.vendorUpdateFormData.name || '',
      region: this.vendorUpdateFormData.region || '',
      district: this.vendorUpdateFormData.district || '',
      postalCode: this.vendorUpdateFormData.postalCode || '',
      email: this.formData.Email,
      telephone: this.formData.Mobilenumber,
      city: this.vendorUpdateFormData.city || '',
      gst: this.vendorUpdateFormData.gst || '',
      taxNumber: this.vendorUpdateFormData.taxNumber || '',
      chargeMechanism: this.formData.Mechanism,
      cinNumber: this.vendorUpdateFormData.cinNumber || '',
      createdOn: this.vendorUpdateFormData.createdOn || '',
      address: this.vendorUpdateFormData.address || '',
      vendorAccountGroup: this.vendorUpdateFormData.vendorAccountGroup || '',
      customerCode: this.formData.CustomerCode,
      companyCode: this.vendorUpdateFormData.companyCode || '',
      paymentMethodDesc: this.vendorUpdateFormData.paymentMethodDesc || '',
      role: this.vendorUpdateFormData.role || '',
      active: this.vendorUpdateFormData.active || false,
      sacCode: this.vendorUpdateFormData.sacCode || ''
    };

    this.allService.updateVendorMaster(updatedData).subscribe({
      next: (res: any) => {
        this.toastMsg = 'Vendor updated successfully!';
        this.successToast = true;
        setTimeout(() => {
          this.successToast = false;
        }, 5000);
        this.isUpdateModal = false;
        this.getVendorList();
      },
      error: (err) => {
        this.toastMsg = 'Something went wrong!';
        this.errorToast = true;
        setTimeout(() => {
          this.errorToast = false;
        }, 5000);
      }
    });
  }

  applyEmployeeSearch(data: any) {
    let paramData = data['pi_filterjson'];
    const allValuesEmpty = Object.values(paramData).every(
      value => value === '' || value === null || value === undefined
    );

    if (allValuesEmpty) {
      this.getBillToMappingList();
      return;
    }

    this.employeeList = this.employeeList.filter(entry => {
      return Object.keys(paramData).every(key => {
        const searchValue = (paramData[key] || "").toString().toLowerCase().trim();
        const entryValue = (entry[key] || "").toString().toLowerCase().trim();
        return searchValue === "" || entryValue.includes(searchValue);
      });
    });
  }

  applyVendorSearch(data: any) {
    let paramData = data['pi_filterjson'];
    const allValuesEmpty = Object.values(paramData).every(
      value => value === '' || value === null || value === undefined
    );

    if (allValuesEmpty) {
      this.getVendorList();
      return;
    }

    this.vendorList = this.vendorList.filter(entry => {
      return Object.keys(paramData).every(key => {
        const searchValue = (paramData[key] || "").toString().toLowerCase().trim();
        const entryValue = (entry[key] || "").toString().toLowerCase().trim();
        return searchValue === "" || entryValue.includes(searchValue);
      });
    });
  }

  applyFiSearch(data: any) {
    let paramData = data['pi_filterjson'];
    const allValuesEmpty = Object.values(paramData).every(
      value => value === '' || value === null || value === undefined
    );

    if (allValuesEmpty) {
      this.fetchFiData(1, this.fiPagination.size, {});
      this.fiSearchObj = {};
      return;
    }

    this.fiSearchObj = paramData;
    this.fetchFiData(1, this.fiPagination.size, this.fiSearchObj);
  }

  changeTab(tab: string) {
    this.activeTab = tab;
    localStorage.setItem('allMasterDataActiveTab', tab);

    if (tab === 'off') {
      this.getVendorList();
    } else if (tab === 'fi') {
      this.fetchFiData(1, this.fiPagination.size, {});
    } else if (tab === 'on') {
      this.getBillToMappingList();
    }
  }

  goToAddBill(type: 'bill' | 'fi' = 'bill') {
    if (type === 'fi') {
      this.router.navigate(['/All-Master/add-fi-data']);
    } else {
      this.router.navigate(['/All-Master/add-bill'], { queryParams: { type } });
    }
  }

  goToEditFiData(row: any) {
    const id = row && row.id ? row.id : this.fiDataList.indexOf(row);
    this.router.navigate([`/All-Master/add-fi-data`, id], { state: { editData: row } });
  }

  openUpdateModal(value: any) {
    this.VendorId = value?.VendorId_hide ?? null;
    this.getVendorById();
    this.originalVendorList.forEach((item: any) => {
      if (item.VendorId == this.VendorId) this.vendorUpdateFormData = item;
    });
    this.fillVendorEditForm();
    this.isUpdateModal = true;
  }

  closeAddEditModal() {
    this.isUpdateModal = false;
  }

  onEditClickedInline(item: any) {
    this.selectedItem = item;
    this.showAddForm = true;
  }

  onEditClickedNavigate(item: any) {
    if (item) {
      this.router.navigate(['/All-Master/all-master-data', item.id], { queryParams: { Id: item.VendorId } });
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  fillVendorEditForm() {
    this.formData.CustomerCode = this.vendorUpdateFormData.CustomerCode;
    this.formData.Mechanism = this.vendorUpdateFormData.Mechanism;
    this.formData.Mobilenumber = this.vendorUpdateFormData.Mobilenumber;
    this.formData.Email = this.vendorUpdateFormData.Email;
  }

  resetForm(form: any) {
    this.fillVendorEditForm();
  }

  onSubmit(formRef: NgForm) {
    if (formRef.valid) {
      this.updateVendorData();
    } else {
      Object.keys(formRef.controls).forEach(field => {
        const control = formRef.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
    }
  }
}
