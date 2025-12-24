import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { FileUploadComponent } from 'src/app/common/file-upload/file-upload.component';
import { BorderColorService } from 'src/app/common/services/border-color.service';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-work-order-advance',
  templateUrl: './work-order-advance.component.html',
  styleUrls: ['./work-order-advance.component.scss']
})
export class WorkOrderAdvanceComponent {

  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent;

  currentDate = moment(new Date).format("YYYY-MM-DD");

  advanceColumns = [
    { header: 'Advance Type', field: 'advancetypename' },
    { header: 'Max Percentage %', field: 'maxpercentage' },
    { header: 'Max Value', field: 'maxvalue' },
    { header: 'Bank Guarantee', field: 'bankgaurantee' },
    { header: 'BG Reference No.', field: 'referencenumber' },
    { header: 'Issue Date', field: 'issuedate', date: true },
    { header: 'Expiry Date', field: 'expirydate', date: true },
    { header: 'Claim Date', field: 'claimdate', date: true },
    { header: 'Action', field: 'action', value: ['view', 'edit', 'delete'] }
  ];

  documentColumns = [
    { header: "Document", field: 'documentname' },
    { header: "Date", field: 'createddate', date: true },
    { header: "Version", field: 'documentversion' },
    { header: "Action", field: 'Action', value: ['edit', 'download'] }
  ]

  documentDetails: any[] = []


  WorkAdvanceModal: boolean = false;
  AdvanceTypesList: any;
  BankGuaranteeList: any;
  isLoader: boolean = false;
  submitted: boolean = false;
  isLoaderDoc: boolean = false;
  errorMessage: string = '';
  advanceId: number = 0;
  successPopup: boolean = false;
  popupMessage: string = '';
  isEdit: boolean = false;
  advanceDetails: any[] = [];
  isUpdated: boolean = false;
  originalFormValues: any = {}
  isloader: boolean = false;
  spinner: boolean = false;
  pdfUrl: string = '';
  sanitizer: any;

  WorkAdvanceForm!: FormGroup;
  documentViewModal: boolean = false;

  selectedFiles: File[] = [];
  optionDocumentType: any[] = [];
  documentForm!: FormGroup;
  documentId: number = 0;
  var_version: number = 0.0;
  contractId: number = 0;
  minExpiryDate: any;
  roleName: string;
  advanceTypeModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private fs: FormService,
    private apiService: ApiService,
    private formService: FormService,
    private borderColorService: BorderColorService
  ) {
    this.roleName = localStorage.getItem('roleName') || '';
    console.log('roleName', this.roleName);
    if (this.roleName == 'Project Manager') {
      this.advanceColumns = [
        { header: 'Advance Type', field: 'advancetypename' },
        { header: 'Max Percentage %', field: 'maxpercentage' },
        { header: 'Max Value', field: 'maxvalue' },
        { header: 'Bank Guarantee', field: 'bankgaurantee' },
        { header: 'BG Reference No.', field: 'referencenumber' },
        { header: 'Issue Date', field: 'issuedate', date: true },
        { header: 'Expiry Date', field: 'expirydate', date: true },
        { header: 'Claim Date', field: 'claimdate', date: true },
        // { header: 'Action', field: 'action', value: ['view', 'edit', 'delete'] }
      ];
    }
    if (this.roleName == 'Checker') {
      this.advanceColumns = [
        { header: 'Advance Type', field: 'advancetypename' },
        { header: 'Max Percentage %', field: 'maxpercentage' },
        { header: 'Max Value', field: 'maxvalue' },
        { header: 'Bank Guarantee', field: 'bankgaurantee' },
        { header: 'BG Reference No.', field: 'referencenumber' },
        { header: 'Issue Date', field: 'issuedate', date: true },
        { header: 'Expiry Date', field: 'expirydate', date: true },
        { header: 'Claim Date', field: 'claimdate', date: true },
        { header: 'Action', field: 'action', value: ['view'] }
      ];
      this.documentColumns = [
        { header: "Document", field: 'documentname' },
        { header: "Date", field: 'createddate', date: true },
        { header: "Version", field: 'documentversion' },
        { header: "Action", field: 'Action', value: ['download'] }
      ]
    }
    this.WorkAdvanceForm = this.fb.group({
      maxPercentage: ['', [Validators.required, Validators.pattern(/^[0-9]{1,2}(\.[0-9]{1,3})?$/)]],
      maxValue: ['', [Validators.required, Validators.pattern(/^[0-9]{1,12}(\.[0-9]{1,3})?$/)]],
      BGNumber: ['', Validators.required],
      // BGDate: [this.currentDate, Validators.required],
      IssueDate: [this.currentDate, [Validators.required, Validators.pattern(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)]],
      ExpiryDate: [this.currentDate, [Validators.required, this.expiryDateValidator.bind(this), Validators.pattern(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)]],
      ClaimDate: [this.currentDate, [Validators.required, Validators.pattern(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)]],
      AdvanceType: [null, Validators.required],
      BankGurantee: [null, Validators.required],
    })
    this.updateMinExpiryDate()

    this.documentForm = this.fb.group({
      documentType: ['', Validators.required],
      docVersion: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^[0-9]{1}(\.[0-9]{1})?$/)]],
    })
  }
  expiryDateValidator(control: FormControl) {
    const expiryDate = control.value;
    const issueDate = this.WorkAdvanceForm?.get('IssueDate')?.value;

    if (issueDate && expiryDate && new Date(expiryDate) < new Date(issueDate)) {
      return { expiryBeforeIssue: true };
    }
    return null;
  }
  updateMinExpiryDate() {
    const issueDate = this.WorkAdvanceForm.get('IssueDate')?.value;
    if (issueDate) {
      this.minExpiryDate = issueDate; // Set min expiry date equal to issue date
    }
  }
  closeWorkAdvanceModal() {
    this.WorkAdvanceModal = false;
    this.resetFormDoc()
    this.errorMessage = ''
    this.isEdit = false
  }

  openWorkAdvanceModal() {
    this.WorkAdvanceModal = true;
  }

  addworkAdvance() {
    this.WorkAdvanceModal = true;
  }

  getContractId(): number {
    this.contractId = Number(localStorage.getItem('contractId'));
    return this.contractId;
  }

  ngOnInit() {
    this.getContractId();
    this.getAdvanceTypes();
    this.getBankGuarantee();
    this.getWorkAdvanceDetails();

    this.WorkAdvanceForm.valueChanges.subscribe(() => {
      if (this.isEdit) {
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.WorkAdvanceForm);
      }
    });

    this.WorkAdvanceForm.controls['AdvanceType'].disable()
    this.WorkAdvanceForm.controls['maxPercentage'].disable()
    this.WorkAdvanceForm.controls['maxValue'].disable()

  }

  getDocumentList() {
    let json = {
      "contractid": this.contractId,
      "advanceid": this.advanceId
    }
    this.apiService.dataPost('contract/getAdvanceDocument', json).subscribe((resposne: any) => {
      this.documentDetails = resposne?.data;
      // if (this.documentDetails && this.documentDetails.length > 0) {
      //   let maxVersion = Math.max(...this.documentDetails.map((doc: any) => (doc.documentversion && doc.documentname == docName) || 0));
      //   console.log('maxVersion', maxVersion + 0.1, this.isEdit);

      //   this.var_version = maxVersion + 1.0;
      // } else {
      //   this.var_version = 1.0; // Default value if no documents exist
      // }
    });

  }

  getOptionDocumentType() {
    this.apiService.dataPost('master/getActiveAndInactiveDocumentTypeList/true', {}).subscribe(
      (response: any) => {
        this.optionDocumentType = response?.data
      },
      error => {
        console.log('Error: ', error);
      }
    )
  }

  getWorkAdvanceDetails() {
    this.isLoader = true;
    const json = {
      "contractid": this.contractId
    }
    this.apiService.dataPost('contract/getAdvance', json).subscribe(
      (res: any) => {

        this.advanceDetails = res.data.map((item: any) => {
          let day_1 = moment(item.expirydate).diff(this.currentDate, 'days')
          let day_2 = moment(item.claimdate).diff(this.currentDate, 'days')
          // console.log('day_1', day_1, 'day_2', day_2);

          return {
            ...item,
            expirydate_fclr: this.borderColorService.getClassName(day_1),
            claimdate_fclr: this.borderColorService.getClassName(day_2),
            blink_expirydate: day_1 <= -7 ? true : false,
            blink_claimdate: day_2 <= -7 ? true : false,
          };
        });
        this.isLoader = false;
        // console.log('advanceDetails', this.advanceDetails);

      },
      (error: any) => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }

  getAdvanceTypes() {
    this.isLoader = true;
    this.apiService.dataGet('contract/getActiveAdvanceType').subscribe(
      (res: any) => {
        this.AdvanceTypesList = res.data
        this.isLoader = false;
      },
      (error: any) => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }
  getBankGuarantee() {
    this.isLoader = true;
    let data = {
      "lookUpName": "bank",
      "id": 0
    }
    this.apiService.dataPost('master/getLookUpMaster', data).subscribe(
      (res: any) => {
        this.BankGuaranteeList = res.data
        this.isLoader = false;
      },
      (error: any) => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }
  restrictDateInput(event: any) {
    let inputValue = event.target.value;

    // Ensure input follows YYYY-MM-DD and restricts year to 4 digits
    let match = inputValue.match(/^(\d{0,4})-(\d{0,2})-(\d{0,2})$/);

    if (match) {
      event.target.value = `${match[1]}-${match[2]}-${match[3]}`;
    }
  }

  saveData() {
    console.log('this.form', this.WorkAdvanceForm)
    this.submitted = true;
    this.formService.trimFormValues(this.WorkAdvanceForm)

    if (this.WorkAdvanceForm.invalid) {
      this.WorkAdvanceForm.markAllAsTouched()
      return;
    }

    let formData = this.WorkAdvanceForm.value;
    let data = {
      "advanceId": this.advanceId ? this.advanceId : 0,
      "fkAdvanceTypeId": formData.BankGurantee == 'ABG' ? 7 : 0, //formData.AdvanceType,
      "fkContractId": this.contractId,
      "maxPercentage": formData.maxPercentage,
      "maxValue": formData.maxValue,
      "isActive": true,
      "status": "Active",
      "bankGuarantee": formData.BankGurantee,
      "referenceNumber": formData.BGNumber,
      "issueDate": formData.IssueDate,
      "expiryDate": formData.ExpiryDate,
      "claimDate": formData.ClaimDate,
      "loginuser": this.apiService.getUserName()
    }

    this.isLoader = true;
    this.apiService.dataPost('contract/addAdvance', data).subscribe(response => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true;
      this.popupMessage = this.isEdit ? 'Data Updated Successfully' : 'Data Saved Successfully'
      this.isEdit = false
      this.closeWorkAdvanceModal();
      this.getWorkAdvanceDetails();
      this.resetFormDoc();
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);
    }, error => {
      this.isLoader = false;
      this.submitted = false;
      this.errorMessage = this.apiService.handleError(error);

    });
  }
  resetFormDoc() {
    this.WorkAdvanceForm.reset()
    this.submitted = false
    this.errorMessage = ''
    this.advanceId = 0

    this.setDate()
  }

  setDate() {
    this.WorkAdvanceForm.controls['IssueDate'].setValue(this.currentDate)
    this.WorkAdvanceForm.controls['ExpiryDate'].setValue(this.currentDate)
    this.WorkAdvanceForm.controls['ClaimDate'].setValue(this.currentDate)
  }

  resetFormDocument() {
    this.documentForm.reset()
    this.submitted = false
    this.errorMessage = ''
    this.selectedFiles = []
    this.documentId = 0
    this.isEdit = false

    this.fileUpload.cleanFile()
  }

  onEdit(value: any) {
    this.WorkAdvanceModal = true;
    this.isEdit = true
    this.advanceId = value.advanceid;
    const selectedAdvanceType = this.AdvanceTypesList.find(
      (type: any) => type.advanceTypeName === value.advancetypename
    );
    const selectedBankGuarantee = this.BankGuaranteeList.find(
      (key: any) => key.bankName == value.bankgaurantee
    );

    this.WorkAdvanceForm.patchValue({
      maxPercentage: value.maxpercentage,
      maxValue: value.maxvalue,
      BGNumber: value.referencenumber,
      IssueDate: moment(value.issuedate).format('YYYY-MM-DD'),
      ExpiryDate: moment(value.expirydate).format('YYYY-MM-DD'),
      ClaimDate: moment(value.claimdate).format('YYYY-MM-DD'),
      AdvanceType: selectedAdvanceType ? selectedAdvanceType?.advanceTypeId : null,
      BankGurantee: value.bankgaurantee,
    });
    this.originalFormValues = this.WorkAdvanceForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.WorkAdvanceForm);

    this.controlDate(selectedBankGuarantee)
  }

  onDelete(value: any) {
    let json = {
      "id": value.advanceid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('contract/deleteAdvance', json).subscribe(response => {

      this.getWorkAdvanceDetails();
    }, error => {
      console.log('Error while deleting data', error);

    });
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const key = event.key;
    return /^\d$/.test(key); // Allows only digits (0-9)
  }

  closeDocumentModal() {
    this.documentViewModal = false;
    this.resetFormDocument()
  }

  openDocumentModal(value: any) {
    this.documentViewModal = true
    this.advanceId = value.advanceid;

    this.getOptionDocumentType();
    this.getDocumentList()
  }

  // File Upload Begin 

  onFilesUploaded(files: File[]) {
    console.log('Files received in parent component:', files);
    this.selectedFiles = files;
    this.errorMessage = ''
  }

  clearFile(files: File[]) {
    this.selectedFiles = files;
  }

  uploadDocument() {
    console.log('selectedFile', this.selectedFiles[0]);

    this.submitted = true;
    this.formService.trimFormValues(this.documentForm)
    if (this.documentForm.invalid) {
      this.documentForm.markAllAsTouched()
      return;
    }

    if (this.selectedFiles?.length == 0) {
      this.errorMessage = 'Document is required.'
      return;
    }
    let formData = this.documentForm.value;

    let result = this.optionDocumentType.find(item => item.documentTypeId == formData.documentType).documentTypeName;
    let json = {
      documentid: this.documentId ? this.documentId : 0,
      contractid: this.contractId,
      advanceid: this.advanceId,
      documenttypeid: formData.documentType,
      documentname: result,
      documentversion: this.var_version,
      loginuser: this.apiService.getUserName(),
    }

    this.isLoaderDoc = true
    this.apiService.uploadDocument('contract/addAdvanceDocument', json, this.selectedFiles[0]).subscribe((response: any) => {
      console.log(response);
      this.getDocumentList();
      this.resetFormDocument();
      this.isLoaderDoc = false;
    }, error => {
      console.log(error);
      this.isLoaderDoc = false
      this.errorMessage = this.apiService.handleError(error)
    });
  }
  //End FIle Upload

  onEditDoc(value: any) {
    console.log('onEditDoc', value);

    this.isEdit = true
    this.documentId = value.documentid
    this.documentForm.patchValue({
      documentType: value.fkdocumenttypeid,
      docVersion: value.documentversion
    });
    // this.documentForm.get('docVersion')?.disable();
    let version = parseFloat(value.documentversion + 0.1).toFixed(2);
    this.var_version = parseFloat(version);
  }

  DownloadDoc(value: any) {
    console.log('file downloaded', value);
    this.spinner = true;

    let url = 'contract/DocumentDownload';
    let passParam = {
      "Url": `${value.location}`
    }

    this.isloader = true;
    this.apiService.dataPost(url, passParam).subscribe(
      (res: any) => {
        console.log('res', res);

        // Correct way to sanitize a Base64 URL
        this.pdfUrl = 'data:application/pdf;base64,' + res['data']['Base64String'];

        // For download
        let documentType = res.data?.BlobName ? res.data?.BlobName.split('.').pop() : '';

        const a = document.createElement('a');
        a.href = this.pdfUrl;
        a.download = value.documentname + '_' + value.documentid + '.' + documentType;
        a.click();
        window.URL.revokeObjectURL(this.pdfUrl);

        this.spinner = false;
        this.isloader = false;
        console.log('pdfUrl', this.pdfUrl);
      },
      error => {
        this.spinner = false;
        this.isloader = false;
        console.log('Error : ', error);
      }
    );
  }

  downloadFile(value: any) {

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://10.212.87.140:8092/cad/api/getFile", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("PublicKey", "rIA_1vbatpDH0OV1QqxSppuBRuCTUgOtE8Q~M6.8");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log("Response:", xhr.responseText);
        var fileUrl = xhr.response;

        const a = document.createElement('a');
        a.href = 'http://10.212.87.140:8092/cad/api/getFile/rIA_1vbatpDH0OV1QqxSppuBRuCTUgOtE8Q~M6.8/cad/test%252F01%252FSettings_Base64_Test_setting2.png';
        a.download = 'fileName.pdf';
        a.click();
        window.URL.revokeObjectURL(a.href);

      }
    };

    var data = JSON.stringify({
      "container": "cad",
      "fileName": "CAD_WOClause_1739889904337_application.pdf",
      "path": "test/01"
    });
    xhr.send(data);

  }

  controlDate(event: any) {
    let selectedItem = event;

    if (this.isEdit == false) {
      this.WorkAdvanceForm.controls['maxPercentage'].setValue('')
      this.WorkAdvanceForm.controls['maxValue'].setValue('')
      this.WorkAdvanceForm.controls['AdvanceType'].setValue(null)
    }

    if (selectedItem.bankName == 'NA') {
      this.WorkAdvanceForm.controls['IssueDate'].disable()
      this.WorkAdvanceForm.controls['ExpiryDate'].disable()
      this.WorkAdvanceForm.controls['ClaimDate'].disable()
    } else if (selectedItem.bankName == 'ABG') {
      // this.WorkAdvanceForm.controls['AdvanceType'].enable()
      this.WorkAdvanceForm.controls['AdvanceType'].setValue(7)
      this.WorkAdvanceForm.controls['maxPercentage'].enable()
      this.WorkAdvanceForm.controls['maxValue'].enable()

      this.WorkAdvanceForm.controls['IssueDate'].enable()
      this.WorkAdvanceForm.controls['ExpiryDate'].enable()
      this.WorkAdvanceForm.controls['ClaimDate'].enable()
    } else if (selectedItem.bankName == 'PBG') {
      this.WorkAdvanceForm.controls['AdvanceType'].disable()
      this.WorkAdvanceForm.controls['maxPercentage'].disable()
      this.WorkAdvanceForm.controls['maxValue'].enable()

      this.WorkAdvanceForm.controls['IssueDate'].enable()
      this.WorkAdvanceForm.controls['ExpiryDate'].enable()
      this.WorkAdvanceForm.controls['ClaimDate'].enable()
    } else if (selectedItem.bankName == 'CPBG') {
      this.WorkAdvanceForm.controls['AdvanceType'].disable()
      this.WorkAdvanceForm.controls['maxPercentage'].disable()
      this.WorkAdvanceForm.controls['maxValue'].enable()

      this.WorkAdvanceForm.controls['IssueDate'].enable()
      this.WorkAdvanceForm.controls['ExpiryDate'].enable()
      this.WorkAdvanceForm.controls['ClaimDate'].enable()
    } else {
      this.WorkAdvanceForm.controls['IssueDate'].enable()
      this.WorkAdvanceForm.controls['ExpiryDate'].enable()
      this.WorkAdvanceForm.controls['ClaimDate'].enable()
    }

  }

  onDocumentTypeChange(value: any) {
    const filtered = this.documentDetails.filter(doc => doc.fkdocumenttypeid === value);
    if (filtered && filtered.length > 0) {
      let maxVersion = Math.max(...filtered.map((doc: any) => doc.documentversion || 0));
      console.log('maxVersion', maxVersion + 0.1, this.isEdit);

      this.var_version = parseInt(maxVersion.toFixed(0)) + 1.0;
    } else {
      this.var_version = 1.0; // Default value if no documents exist
    }
  }

  openAdvanceTypeModal() {
    this.advanceTypeModal = true;
  }

  closeAdvanceTypeModal() {
    this.advanceTypeModal = false;

    this.getAdvanceTypes();
  }
}
