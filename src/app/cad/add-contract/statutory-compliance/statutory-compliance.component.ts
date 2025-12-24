import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { FileUploadComponent } from 'src/app/common/file-upload/file-upload.component';
import { BorderColorService } from 'src/app/common/services/border-color.service';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-statutory-compliance',
  templateUrl: './statutory-compliance.component.html',
  styleUrls: ['./statutory-compliance.component.scss']
})
export class StatutoryComplianceComponent {
  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent;
  statutoryColumn = [
    { header: 'Category Name', field: 'compliancecategoryname' },
    { header: 'Type Name', field: 'compliancetypename' },
    { header: 'Identifier', field: 'identifier' },
    { header: 'Description', field: 'description' },
    { header: 'Start Date', field: 'validitystartdate', date: true },
    { header: 'Expiry Date', field: 'validityenddate', date: true },
    { header: 'Action', field: 'action', value: ['view', 'edit', 'delete'] }

  ];

  documentColumns = [
    { header: "Document", field: 'documentname' },
    { header: "Date", field: 'createddate', date: true },
    { header: "Version", field: 'documentversion' },
    { header: "Action", field: 'Action', value: ['edit', 'download'] }
  ]
  activeTab: string = 'Policy'
  pdfUrl: string = '';
  var_version: number = 0.0;
  roleName: string;
  categoryModal: boolean = false;
  categoryTypeModal: boolean = false;

  changeTab(value: string) {
    this.activeTab = value
    this.getStatutoryList(value)
  }
  StatutoryCompliancesModal: boolean = false;

  closeStatutoryCompliancesModal() {
    this.StatutoryCompliancesModal = false;
    this.isEdit = false
  }

  openStatutoryCompliancesModal() {
    this.StatutoryCompliancesModal = true;
  }

  addStatutoryCompliance() {
    this.StatutoryCompliancesModal = true;
  }

  currentDate: string = '';
  minExpiresDate: string = '';
  submitted: boolean = false;
  complainceForm!: FormGroup;
  CategroyList: any[] = [];
  TypeList: any[] = [];
  isLoader: boolean = false;
  isLoaderDoc: boolean = false;
  successPopup: boolean = false;
  popupMessage: string = '';
  isEdit: boolean = false;
  errorMessage: string = '';
  complainceId: number = 0
  isUpdated: boolean = false;
  StatutoryList: any[] = [];
  originalFormValues: any = {}
  optionDocumentType: any[] = [];
  documentDetails: any[] = []
  selectedFiles: File[] = [];
  documentForm!: FormGroup;
  documentId: number = 0;
  documentViewModal: boolean = false;
  isloader: boolean = false;
  spinner: boolean = false;
  contractId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private apiService: ApiService,
    private borderColorService: BorderColorService,
    // private sanitizer: DomSanitizer
  ) {
    this.currentDate = moment(new Date).format("YYYY-MM-DD");
    this.minExpiresDate = moment(new Date()).add(0, 'days').format('YYYY-MM-DD');
    this.roleName = localStorage.getItem('roleName') || '';
    if (this.roleName == 'Project Manager') {
      this.statutoryColumn = [
        { header: 'Category Name', field: 'compliancecategoryname' },
        { header: 'Type Name', field: 'compliancetypename' },
        { header: 'Identifier', field: 'identifier' },
        { header: 'Description', field: 'description' },
        { header: 'Start Date', field: 'validitystartdate', date: true },
        { header: 'Expires On', field: 'validityenddate', date: true },
        // { header: 'Action', field: 'action', value: ['view', 'edit', 'delete'] }
      ];
    }
    if (this.roleName == 'Checker') {
      this.statutoryColumn = [
        { header: 'Category Name', field: 'compliancecategoryname' },
        { header: 'Type Name', field: 'compliancetypename' },
        { header: 'Identifier', field: 'identifier' },
        { header: 'Description', field: 'description' },
        { header: 'Start Date', field: 'validitystartdate', date: true },
        { header: 'Expires On', field: 'validityenddate', date: true },
        { header: 'Action', field: 'action', value: ['view'] }
      ];
      this.documentColumns = [
        { header: "Document", field: 'documentname' },
        { header: "Date", field: 'createddate', date: true },
        { header: "Version", field: 'documentversion' },
        { header: "Action", field: 'Action', value: ['download'] }
      ]
    }
    this.complainceForm = this.fb.group({
      Identifier: ['', Validators.required],
      value: ['', Validators.required],
      Description: ['', Validators.required],
      startDate: [this.currentDate, [Validators.required, Validators.pattern(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)]],
      expires: [this.minExpiresDate, [Validators.pattern(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)]],
      CType: [null, Validators.required],
      Category: [null, Validators.required],

    },
      { validator: this.dateValidation }
    )
    this.documentForm = this.fb.group({
      documentType: ['', Validators.required],
      // docVersion: [{ value: 0.0, disabled: true }, [Validators.required, Validators.pattern(/^[0-9]{1}(\.[0-9]{1})?$/)]],
      docVersion: [{ value: '', disabled: true }, [Validators.required]],
    })
  }
  restrictDateInput(event: any) {
    let inputValue = event.target.value;

    // Ensure input follows YYYY-MM-DD and restricts year to 4 digits
    let match = inputValue.match(/^(\d{0,4})-(\d{0,2})-(\d{0,2})$/);

    if (match) {
      event.target.value = `${match[1]}-${match[2]}-${match[3]}`;
    }
  }
  onStartDateChange() {
    // const startDateValue = this.complainceForm.get('startDate')?.value;
    // if (startDateValue) {
    //   const startDate = new Date(startDateValue);
    //   startDate.setDate(startDate.getDate() + 1);
    //   this.minExpiresDate = moment(startDate).format('YYYY-MM-DD');
    //   this.complainceForm.get('expires')?.setValue(this.minExpiresDate);
    // }
  }

  dateValidation(form: FormGroup) {
    const startDate = form.get('startDate')?.value;
    const expires = form.get('expires')?.value;

    if (startDate && expires && new Date(expires) < new Date(startDate)) {
      form.get('expires')?.setErrors({ invalidDate: true });
    } else {
      form.get('expires')?.setErrors(null);
    }
  }
  getCategoryDropDown() {
    this.apiService.dataPost('master/getActiveAndInactiveComplianceCategoryList/true', {}).subscribe(
      (response: any) => {
        this.CategroyList = response?.data
      },
      error => {
        console.log('Error :', error);
      });
  }

  onCategoryChange(categoryId: string) {
    if (categoryId) {
      this.getTypeDropDown(categoryId);
    } else {
      this.TypeList = []; // Reset type dropdown when category is cleared
      this.complainceForm.controls['CType'].setValue(null); // Clear the type dropdown value
    }
  }

  getTypeDropDown(categoryId: string) {
    this.apiService.dataGet(`contract/getCategoryType/${categoryId}`).subscribe(
      (response: any) => {
        this.TypeList = response?.data
      },
      error => {
        console.log('Error :', error);
      });
  }

  getStatutoryList(category: string) {
    this.isLoader = true;
    const json = {
      "contractid": this.contractId,
      "category": category
    }
    this.apiService.dataPost('contract/getStatutoryCompliance', json).subscribe(
      (res: any) => {
        console.log('res', res);

        this.StatutoryList = res.data.map((item: any) => {
          let day_1 = moment(item.validityenddate).diff(this.currentDate, 'days');
          return {
            ...item,
            expirydate_fclr: this.borderColorService.getClassName(day_1),
            blink_expirydate: day_1 <= -7 ? true : false,

          };
        });
        this.isLoader = false;
      },
      (error: any) => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }

  getContractId(): string {
    this.contractId = localStorage.getItem('contractId') || '';
    return this.contractId;
  }

  ngOnInit() {
    this.getContractId();
    this.getCategoryDropDown();
    this.getStatutoryList('Policy')
    // this.complainceForm.get('Category')?.valueChanges.subscribe(categoryId => {
    //   if (categoryId) {
    //     this.complainceForm.controls['CType'].setValue(null); // Clear the type dropdown value
    //     this.getTypeDropDown(categoryId);
    //   } else {
    //     this.complainceForm.controls['CType'].setValue(null); // Clear the type dropdown value
    //     this.TypeList = []; // Reset type dropdown when category is cleared
    //   }
    // });
    this.complainceForm.valueChanges.subscribe(() => {
      if (this.isEdit) {
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.complainceForm);
      }
    });
    // this.minExpiresDate = this.minExpiresDate
  }

  saveData() {
    this.submitted = true;
    this.formService.trimFormValues(this.complainceForm)
    if (this.complainceForm.invalid) {
      this.complainceForm.markAllAsTouched()
      return;
    }

    let formData = this.complainceForm.value;
    let data = {
      "statutoryComplianceId": this.complainceId ? this.complainceId : 0,
      "fkComplianceTypeId": formData.CType,
      "fkContractId": this.contractId,
      "description": formData.Description,
      "identifier": formData.Identifier,
      "value": formData.value,
      "validityStartDate": formData.startDate,
      "validityEndDate": formData.expires,
      "status": "Active",
      "isActive": true,
      "loginuser": this.apiService.getUserName()

    }

    this.isLoader = true;
    this.apiService.dataPost('contract/setStatutoryCompliance', data).subscribe(response => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true;
      this.popupMessage = this.isEdit ? 'Data Updated Successfully' : 'Data Saved Successfully'
      this.isEdit = false
      this.closeStatutoryCompliancesModal();
      this.getStatutoryList(this.activeTab);
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
    this.complainceForm.reset()
    this.submitted = false
    this.errorMessage = ''
    this.complainceId = 0
  }

  onEdit(value: any) {
    this.getTypeDropDown(value.compliancecategoryid);

    this.StatutoryCompliancesModal = true;
    this.isEdit = true
    this.complainceId = value.statutorycomplianceid;
    this.complainceForm.patchValue({
      Identifier: value.identifier,
      value: value.value,
      Description: value.description,
      startDate: moment(value.validitystartdate).format('YYYY-MM-DD'),
      expires: moment(value.validityenddate).format('YYYY-MM-DD'),
      CType: value.compliancetypeid,
      Category: value.compliancecategoryid,
    });
    this.originalFormValues = this.complainceForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.complainceForm);
  }

  onDelete(value: any) {
    let json = {
      "id": value.statutorycomplianceid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('contract/deleteStatutoryCompliance', json).subscribe(response => {

      this.getStatutoryList(this.activeTab);
    }, error => {
      console.log('Error while deleting data', error);

    });
  }
  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const key = event.key;
    return /^\d$/.test(key); // Allows only digits (0-9)
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
  getDocumentList() {
    let json = {
      "contractid": this.contractId,
      "complianceid": this.complainceId
    }
    this.apiService.dataPost('contract/getComplianceDocument', json).subscribe((resposne: any) => {
      this.documentDetails = resposne?.data;
      // if (this.documentDetails && this.documentDetails.length > 0) {
      //   let maxVersion = Math.max(...this.documentDetails.map((doc: any) => doc.documentversion || 0));
      //   console.log('maxVersion', maxVersion + 0.1, this.isEdit);

      //   this.var_version = maxVersion + 1.0;
      // } else {
      //   this.var_version = 1.0; // Default value if no documents exist
      // }
    });
  }
  openDocumentModal(value: any) {
    console.log('value', value);

    this.documentViewModal = true
    this.complainceId = value.statutorycomplianceid;

    this.getOptionDocumentType();
    this.getDocumentList()
  }

  closeDocumentModal() {
    this.documentViewModal = false;
    this.resetFormDocument()
    this.isEdit = false
  }

  resetFormDocument() {
    this.complainceForm.reset()
    this.submitted = false
    this.errorMessage = ''
    this.selectedFiles = []
    this.documentId = 0
    this.isEdit = false

    this.fileUpload.cleanFile()
  }

  onFilesUploaded(files: File[]) {
    console.log('Files received in parent component:', files);
    this.selectedFiles = files;
    this.errorMessage = ''
  }

  uploadDocument() {
    console.log('selectedFile of clause', this.selectedFiles[0]);

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
      complianceid: this.complainceId,
      documenttypeid: formData.documentType,
      documentname: result,
      documentversion: this.var_version,
      loginuser: this.apiService.getUserName(),
    }


    console.log('clause json', json);


    this.isLoaderDoc = true
    this.apiService.uploadComplainceDocument('contract/addComplianceDocument', json, this.selectedFiles[0]).subscribe((response: any) => {
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
  onEditDoc(value: any) {
    console.log('onEditDoc', value);
    // this.getDocumentList()
    // const formValues = this.documentForm.getRawValue();
    // console.log('onEditDoc', formValues);

    this.isEdit = true
    this.documentId = value.documentid
    this.documentForm.patchValue({
      documentType: value.fkdocumenttypeid,
      docVersion: value.documentversion
    });
    // this.documentForm.get('docVersion')?.disable({ emitEvent: false });
    this.var_version = value.documentversion + 0.1
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

  openCategoryModal() {
    this.categoryModal = true;
  }

  closeCategoryModal() {
    this.categoryModal = false;
    this.getCategoryDropDown();
  }

  openCategoryTypeModal() {
    this.categoryTypeModal = true;
  }

  closeCategoryTypeModal() {
    this.categoryTypeModal = false;
    this.getTypeDropDown(this.complainceForm.get('Category')?.value);
  }
}


