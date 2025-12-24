import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { FileUploadComponent } from 'src/app/common/file-upload/file-upload.component';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-work-order-clause',
  templateUrl: './work-order-clause.component.html',
  styleUrls: ['./work-order-clause.component.scss']
})
export class WorkOrderClauseComponent {
  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent;

  clauseColumns = [
    { header: 'Clause Type', field: 'clausetypename' },
    { header: 'Clause Description', field: 'description' },
    { header: 'Pay Duration (Days)', field: 'penaltycheckduration' },
    { header: 'Max Pay %', field: 'penaltyvalue' },
    { header: 'Max Percentage %', field: 'maxpercent' },
    { header: 'Max Value', field: 'maxvalue' },
    { header: 'Action', field: 'action', value: ['view', 'delete'] }

  ];



  WorkOrderModal: boolean = false;
  documentViewModal: boolean = false;
  contractId: string | null = null;
  roleName: string;
  clauseTypeModal: boolean = false;

  closeWorkOrderModal() {
    this.WorkOrderModal = false;
    this.resetFormDoc();
    this.errorMessage = ''
    this.isEdit = false
  }

  openWorkOrderModal() {
    this.WorkOrderModal = true;
  }

  addworkOrder() {
    this.WorkOrderModal = true;
  }


  isLoader: boolean = false;
  submitted: boolean = false;
  isLoaderDoc: boolean = false;
  workOrderForm!: FormGroup;
  optionOrderClause: any[] = []
  errorMessage: string = '';
  successPopup: boolean = false;
  popupMessage: string = '';
  isEdit: boolean = false;
  isUpdated: boolean = false;
  originalFormValues: any = {}
  clauseId: string = '0'
  orderClauseDetails: any[] = [];
  optionDocumentType: any[] = [];
  documentDetails: any[] = []
  selectedFiles: File[] = [];
  documentForm!: FormGroup;
  documentId: number = 0;
  isloader: boolean = false;
  spinner: boolean = false;
  pdfUrl: string = '';
  sanitizer: any;
  var_version: number = 0.0;

  documentColumns = [
    { header: "Document", field: 'documentname' },
    { header: "Date", field: 'createddate', date: true },
    { header: "Version", field: 'documentversion' },
    { header: "Action", field: 'Action', value: ['edit','download'] }
  ]



  constructor(private fb: FormBuilder, private fs: FormService, private apiService: ApiService, private formService: FormService) {
    this.workOrderForm = this.fb.group({
      clauseDescription: ['', Validators.required],
      payDuration: ['', Validators.required],
      maxPay: ['', [Validators.required, Validators.pattern(/^[0-9]{1,2}(\.[0-9]{1,3})?$/)]],
      maxPercentage: ['', [Validators.required, Validators.pattern(/^[0-9]{1,2}(\.[0-9]{1,3})?$/)]],
      maxValue: ['', Validators.required],
      clauseType: [null, Validators.required],
    })
    this.roleName = localStorage.getItem('roleName') || '';
    if(this.roleName == 'Project Manager') {
      this.clauseColumns = [
        { header: 'Clause Type', field: 'clausetypename' },
        { header: 'Clause Description', field: 'description' },
        { header: 'Pay Duration (Days)', field: 'penaltycheckduration' },
        { header: 'Max Pay %', field: 'penaltyvalue' },
        { header: 'Max Percentage %', field: 'maxpercent' },
        { header: 'Max Value', field: 'maxvalue' },
        // { header: 'Action', field: 'action', value: ['view', 'delete'] }
      ];
    }
    if(this.roleName == 'Checker') {
      this.clauseColumns = [
        { header: 'Clause Type', field: 'clausetypename' },
        { header: 'Clause Description', field: 'description' },
        { header: 'Pay Duration (Days)', field: 'penaltycheckduration' },
        { header: 'Max Pay %', field: 'penaltyvalue' },
        { header: 'Max Percentage %', field: 'maxpercent' },
        { header: 'Max Value', field: 'maxvalue' },
        { header: 'Action', field: 'action', value: ['view'] }
      ];
      this.documentColumns = [
        { header: "Document", field: 'documentname' },
        { header: "Date", field: 'createddate', date: true },
        { header: "Version", field: 'documentversion' },
        { header: "Action", field: 'Action', value: ['download'] }
      ]
    }
    this.documentForm = this.fb.group({
      documentType: ['', Validators.required],
      docVersion: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^[0-9]{1}(\.[0-9]{1})?$/)]],
    })
    console.log('isedit', this.isEdit);
  }
  getDocumentTypeDropDown() {
    this.apiService.dataGet('contract/getActiveClauseType').subscribe(
      (response: any) => {
        this.optionOrderClause = response?.data
      },
      error => {
        console.log('Error :', error);
      });

  }

  getWorkOrderClauseDetails() {
    this.isLoader = true;
    const json = {
      "contractid": this.contractId
    }
    this.apiService.dataPost('contract/getClause', json).subscribe(
      (res: any) => {
        console.log('res', res);

        this.orderClauseDetails = res.data
        this.isLoader = false;
      },
      (error: any) => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }

  getContractId(): string {
    this.contractId = localStorage.getItem('contractId');
    return this.contractId?.toString() || '';
  }

  ngOnInit() {
    this.getContractId();
    this.getDocumentTypeDropDown()
    this.getWorkOrderClauseDetails()
    this.workOrderForm.valueChanges.subscribe(() => {
      if (this.isEdit) {
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.workOrderForm);
      }
    });
  }
  saveData() {
    this.submitted = true;
    this.formService.trimFormValues(this.workOrderForm)
    if (this.workOrderForm.invalid) {
      this.workOrderForm.markAllAsTouched()
      return;
    }

    let formData = this.workOrderForm.value;
    let data = {
      "clauseId": this.clauseId ? this.clauseId : 0,
      "fkClauseTypeId": formData.clauseType,
      "fkContractId": this.contractId,
      "description": formData.clauseDescription,
      "penaltyCheckDuration": formData.payDuration,
      "penaltyValue": formData.maxPay,
      "maxPercent": formData.maxPercentage,
      "maxValue": formData.maxValue,
      "status": "Active",
      "isActive": true,
      "loginuser": this.apiService.getUserName()

    }

    this.isLoader = true;
    this.apiService.dataPost('contract/addClause', data).subscribe(response => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true;
      this.popupMessage = this.isEdit ? 'Data Updated Successfully' : 'Data Saved Successfully'
      this.isEdit = false
      this.closeWorkOrderModal();
      this.getWorkOrderClauseDetails();
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
    this.workOrderForm.reset()
    this.submitted = false
    this.errorMessage = ''
  }

  onEdit(value: any) {
    this.WorkOrderModal = true;
    this.isEdit = true
    this.clauseId = value.clauseid;
    const selectedClauseType = this.optionOrderClause.find(
      (type: any) => type.clausetypename == value.clausetypename
    );
    // console.log('selectedClauseType', selectedClauseType,value);

    this.workOrderForm.patchValue({
      clauseDescription: value.description,
      payDuration: value.penaltycheckduration,
      maxPay: value.penaltyvalue,
      maxPercentage: value.maxpercent,
      maxValue: value.maxvalue,
      clauseType: selectedClauseType ? selectedClauseType.clausetypeid : null,
    });
    this.originalFormValues = this.workOrderForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.workOrderForm);
  }

  onDelete(value: any) {
    let json = {
      "id": value.clauseid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('contract/deleteClause', json).subscribe(response => {

      this.getWorkOrderClauseDetails();
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
      "clauseid": this.clauseId
    }
    this.apiService.dataPost('contract/getClauseDocument', json).subscribe((resposne: any) => {
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
    this.documentViewModal = true
    this.clauseId = value.clauseid;

    this.getOptionDocumentType();
    this.getDocumentList()
  }

  closeDocumentModal() {
    this.documentViewModal = false;
    this.resetFormDocument()
  }

  resetFormDocument() {
    this.workOrderForm.reset()
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
      clauseid: this.clauseId,
      documenttypeid: formData.documentType,
      documentname: result,
      documentversion: this.var_version,
      loginuser: this.apiService.getUserName(),
    }


    console.log('clause json', json);


    this.isLoaderDoc = true
    this.apiService.uploadClauseDocument('contract/addClauseDocument', json, this.selectedFiles[0]).subscribe((response: any) => {
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


    this.isEdit = true
    this.documentId = value.documentid
    this.documentForm.patchValue({
      documentType: value.fkdocumenttypeid,
      docVersion: value.documentversion
    });
    // this.documentForm.get('docVersion')?.disable();
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

  openCaluseTypeModal(){
    this.clauseTypeModal = true;
  }

  closeCaluseTypeModal() {
    this.clauseTypeModal = false;

    this.getDocumentTypeDropDown();
  }
}
