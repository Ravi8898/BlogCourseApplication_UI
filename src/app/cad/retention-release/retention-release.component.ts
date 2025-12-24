import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-retention-release',
  templateUrl: './retention-release.component.html',
  styleUrls: ['./retention-release.component.scss']
})
export class RetentionReleaseComponent {
  @Input() retentionReleaseModal: boolean = false;
  @Input() retentionId: number = 0;
  @Input() retentionStatus: string = '';
  @Input() viewMode: string = '';

  @Output() closeModal = new EventEmitter<boolean>();


  retentionReleaseForm: any;
  errorMessage: string = '';
  retentionDetails: any;
  isDocumentModalOpen: boolean = false;
  isLoader: boolean = false;
  base64String: string | null | undefined;
  isEnabled: boolean = true;
  // successMessage: string = '';
  loginType: string | null;
  selectedFiles: File[] = [];
  roleName: string | null;
  successPopup: boolean = false;
  popupMessage: string = '';
  retentionFor: string = '';
  bankDetails: any[] = [];

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
  ) {
    this.loginType = localStorage.getItem('logintype')
    this.roleName = localStorage.getItem('roleName')

    this.retentionReleaseForm = this.fb.group({
      retentionAmount: [''],
      vendorCode: [''],
      woNumber: [''],
      accountNo: [''],
      bankName: [''],
      ifsc: [''],

    })
  }

  ngOnInit() {
    // Any initialization logic can go here

  }

  ngOnChanges() {
    // Handle changes to input properties if needed
    if (this.retentionReleaseModal) {
      // Modal opened, you can perform actions here if needed
      this.getRetetionReleaseDetails()
    }
  }

  getRetetionReleaseDetails() {
    // console.log('Retention Release Modal opened with ID:', this.retentionId);
    const url = 'contract/findContractReleaseDetailsById';
    const params = {
      "retentionreleaseId": this.retentionId
    }
    this.apiService.dataPost(url, params).subscribe(
      (res: any) => {
        // console.log('Retention Release Details:', res);
        this.retentionDetails = res?.data[0] || {};
        this.retentionReleaseForm.patchValue({
          retentionAmount: this.retentionDetails?.TotalRetentionAmount || '',
          vendorCode: this.retentionDetails?.VendorCode || '',
          woNumber: this.retentionDetails?.ContractNumber || '',
        });
        this.isEnabled = this.retentionDetails?.Location == null ? true : false
        this.retentionFor = this.retentionDetails?.releasefor

        this.getBankDetailsByVendor()
      },
      (error: any) => {
        console.error('Error fetching retention release details:', error);
        this.errorMessage = 'An error occurred while fetching retention release details.';
      }
    );
  }

  getBankDetailsByVendor() {
    const url = 'contract/getBankDetailsByVendor';
    const params = {
      "PO": this.retentionReleaseForm.get('woNumber').value || '',
      "Vendor": this.retentionReleaseForm.get('vendorCode').value || ''
    }
    this.apiService.dataPost(url, params).subscribe(
      (res: any) => {
        // console.log('Bank Details:', res);
        this.bankDetails = res?.data;
      },
      (error: any) => {
        console.error('Error fetching bank details:', error);
        this.errorMessage = 'An error occurred while fetching bank details.';
      }
    )
  }

  onBankChange(value: string) {
    // console.log('Bank selected:', value);
    if (value != "") {
      this.retentionReleaseForm.patchValue({
        bankName: this.bankDetails.find(b => b.Bank_Account === value)?.Partner_BankType || '',
        ifsc: this.bankDetails.find(b => b.Bank_Account === value)?.IFSC_Code || '',
      })
    } else {
      this.retentionReleaseForm.patchValue({
        accountNo: '',
        // bankName: '',
        ifsc: '',
      })
    }

  }

  onSubmitRetentionRelease(value: any) {
    // console.log('form value', this.retentionReleaseForm.value);
    const url = 'contract/retentionReleaseProcess'
    const formData = new FormData();
    formData.append('file', this.selectedFiles[0]);
    formData.append('releaseId', this.retentionId.toString());
    formData.append('status', value);
    formData.append('loginuser', this.apiService.getUserName());
    formData.append('bankname', this.retentionReleaseForm.value.bankName);
    formData.append('accountnumber', this.retentionReleaseForm.value.accountNo);
    formData.append('bankifsc', this.retentionReleaseForm.value.ifsc);

    this.isLoader = true;
    this.apiService.postFormData(url, formData).subscribe(
      (res: any) => {
        // console.log('response', res);
        // this.successMessage = 'Retention release request submitted successfully.';
        this.isLoader = false;
        this.successPopup = true;
        this.popupMessage = 'Data submitted successfully.';

        setTimeout(() => {
          this.successPopup = false;
        }, 2000);


        this.onCloseModal()
        this.getRetetionReleaseDetails()
      }, error => {
        this.errorMessage = this.apiService.handleError(error)
        this.isLoader = false;
      }
    )
  }

  onCloseModal() {
    this.retentionReleaseModal = false;
    this.closeModal.emit(this.retentionReleaseModal);
  }

  closeDocumentModal() {
    this.isDocumentModalOpen = false;
  }

  openDocument() {
    this.isDocumentModalOpen = true;
    this.isLoader = true
    let data = {
      "Url": this.retentionDetails?.Location || ''
    }
    this.apiService.dataPost('contract/DocumentDownload', data).subscribe(
      (response: any) => {
        this.base64String = response?.data?.Base64String
        this.isLoader = false
        console.log('this.base64String ', this.base64String);
      },
      error => {
        this.apiService.handleError(error)
        this.isLoader = false
      }
    )
  }

  onFilesUploaded(files: File[]) {
    // console.log('Files received in parent component:', files);
    this.selectedFiles = files;
    this.errorMessage = ''
  }

}
