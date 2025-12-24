import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileUploadComponent } from 'src/app/common/file-upload/file-upload.component';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-cjpc-recoveries',
  templateUrl: './cjpc-recoveries.component.html',
  styleUrls: ['./cjpc-recoveries.component.scss']
})
export class CjpcRecoveriesComponent {
  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent;

  @Input() CJPCID: string = '';
  @Input() contractId: string = '';
  @Input() cjpcStatus: string = '';
  @Input() contractDetails: any;
  @Input() recoveryTable: any[] = [];
  @Output() updatePaymentDetails: EventEmitter<any> = new EventEmitter<any>();


  isAddRecoveryModelOpen: boolean = false
  docViewModelOpen: boolean = false
  isEdit: boolean = false
  isLoader: boolean = false;
  isUpdated: boolean = false;
  errorMessage: string = ''
  submitted: boolean = false;
  openDocumentModal: boolean = false;
  selectedFiles: File[] = [];
  uploading: boolean = false;
  // contractId: string = '';
  documentName: string = '';
  invoiceTypeName: any;
  invoiceId: any;
  documentListId: any[] = [];
  targetDocumentTypeId: any;
  successPopup: boolean = false;
  popupMessage: string = '';
  openDocumentListModal: boolean = false;
  recoveryDocuments: any[] = []
  bash64String: string = '';
  openReleaseModal: boolean = false;
  releaseRemarks: string = '';
  releaseAmount: string = '';
  recoveryId: number = 0;
  originalFormValues: any
  totalRecoveryAmount: number = 0;
  departmentModal: boolean = false;
  recoveryForModal: boolean = false;
  creditNoteDocModal: boolean = false;
  creditNoteStatus: string = '';
  creditNoteId: any;

  closeRecoveryModal() {
    this.isAddRecoveryModelOpen = false;
    this.isEdit = false;
  }
  openRecoveryModal() {
    this.isAddRecoveryModelOpen = true;
  }
  closeDoceModal() {
    this.docViewModelOpen = false;
  }
  openDoceModal(value: string) {
    this.docViewModelOpen = true;
    this.onViewDocument(value)
  }

  recoveryForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private fs: FormService,
    private apiService: ApiService
  ) {
    // this.contractId = localStorage.getItem('contractId') || ''
  }


  columns = [
    { header: 'Recoveries For', field: 'recoverytypename' },
    { header: 'Recovery Amount', field: 'recoveryamount' },
    { header: 'Document Upload', field: '' },
    { header: 'Remarks', field: 'recoverydescription' },
    { header: 'Credit Note Doc.', field: '' },
    { header: 'Credit Note Status', field: 'creditnotestatus' },
    { header: 'Action', field: 'action', value: ['delete'] }
  ]

  RecoveriesList: any[] = []
  optionsDepatment: any[] = []
  optionsRecoveries: any[] = []
  documentList: any[] = []

  ngOnInit() {
    this.recoveryForm = this.fb.group({
      cjpcId: [this.CJPCID, Validators.required],
      invoiceId: [null],
      department: [null, Validators.required],
      recoveryfor: [null, Validators.required],
      maxvalue: [null],
      recAmt: [null, Validators.required],
      remark: [null],
    })

    this.getRecoveriesList()
    this.getDepartmentList()

    this.recoveryForm.valueChanges.subscribe(() => {
      if (this.isEdit) {
        this.isUpdated = this.fs.isFormUpdated(this.originalFormValues, this.recoveryForm);
      }
    });
  }

  AddRecovery() {
    this.openRecoveryModal()
    this.getBillDetails()
    this.recoveryId = 0
  }

  getRecoveriesList() {
    let url = 'checker/getrecoveryList'
    let params = {
      "cjpcid": this.CJPCID
    }
    this.apiService.dataPost(url, params).subscribe((data: any) => {
      this.RecoveriesList = data.data

      this.totalRecoveryAmount = 0;
      for (let i = 0; i < this.RecoveriesList.length; i++) {
        this.totalRecoveryAmount += this.RecoveriesList[i].recoveryamount;
      }
    }, error => {
      this.apiService.handleError(error);
    }
    )
  }

  getDepartmentList() {
    let url = 'contract/getDepartmentByContractNumber'
    let params = {
      "contractNumber": this.contractDetails?.contractnumber,
    }
    this.apiService.dataPost(url, params).subscribe((res: any) => {
      this.optionsDepatment = res.data
    }, error => {
      this.apiService.handleError(error);
    })
  }

  onChangeDepartment(value: any) {
    let url = 'checker/getrecoveryDocListByDepartmentId'
    let params = {
      "departmentId": value
    }
    this.apiService.dataPost(url, params).subscribe((res: any) => {
      this.optionsRecoveries = res.data
    }, error => {
      this.apiService.handleError(error);
    })
  }

  onChangeRecoveryFor(value: any) {
    if (value) {
      let result = this.optionsRecoveries.filter((item: any) => item.recoverytypeid == value)[0]
      this.documentList = result.documentsList.map((item: any) => ({
        ...item,
        docId: 0
      }));
      console.log('this.documentList', result);
      this.documentName = result.holdtypename

    } else {
      this.documentList = []
    }

  }
  saveData() {
    this.submitted = true;
    if (this.recoveryForm.invalid) {
      return;
    }
    this.isLoader = true;
    const allDocIdsNotZero = this.documentList.every(doc => doc.docId !== 0);
    if (!allDocIdsNotZero) {
      this.isLoader = false;
      this.errorMessage = 'Please upload all documents before saving.';
      return;
    }

    this.documentListId = []
    this.documentListId = this.documentList.map(doc => doc.docId);

    let formData = this.recoveryForm.value
    let json = {
      "recoveryId": this.recoveryId ? this.recoveryId : 0,
      "contractId": this.contractId,
      "fkRecoveryTypeId": formData.recoveryfor,
      "fkCjpcId": this.CJPCID,
      "fkUserRecoveredById": "1",
      "recoveryDescription": formData.remark,
      "recoveryAmount": formData.recAmt,
      "loginUser": this.apiService.getUserName(),
      "documentListId": this.documentListId,
    }
    this.apiService.dataPost('checker/addrecovery', json).subscribe((res: any) => {
      console.log('res', res);
      this.isLoader = false;

      this.successPopup = true;
      this.popupMessage = this.isEdit ? 'Data Updated Successfully' : 'Data Saved Successfully'
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);
      this.resetForm()

      this.isAddRecoveryModelOpen = false;
      this.getRecoveriesList()
      this.updatePaymentDetails.emit(true)
    }
      , error => {
        this.isLoader = false;
        this.errorMessage = this.apiService.handleError(error);
      }
    )
  }
  onEdit(value: any) {
    console.log('value', value);

    this.recoveryForm.patchValue({
      department: value.fkdepartmentid,
      recoveryfor: value.recoverytypename,
      recAmt: value.recoveryamount,
      remark: value.recoverydescription
    });

    this.isEdit = true
    this.isAddRecoveryModelOpen = true
    this.recoveryId = value.recoveryid

    this.originalFormValues = this.recoveryForm.value
    this.isUpdated = this.fs.isFormUpdated(this.originalFormValues, this.recoveryForm);

  }
  rowAction(value: any) {
    if (value?.columnName == 'Document Upload') {
      this.openDocumentListModal = true

      this.recoveryDocuments = value?.rowData?.recovery_documents.map((item: any) => ({
        ...item,
        name: item.location != null ? item.location.split('/').pop() : ''

      }));
    }

    if (value?.columnName == 'Release Amount') {
      this.openReleaseModal = true

      this.recoveryId = value?.rowData?.recoveryid
      this.releaseRemarks = value?.rowData?.releaseremark
      this.releaseAmount = value?.rowData?.recoveryamount
    }

    if (value?.columnName == 'Credit Note Doc.') {
      this.creditNoteDocModal = true
      this.creditNoteStatus = value?.rowData?.creditnotestatus
      this.creditNoteId = value?.rowData?.recoverycreditnoteid
      this.onViewDocument(value?.rowData?.creditnotelocation)
    }
  }
  resetForm() {
    this.submitted = false;
    this.recoveryForm.reset();
    this.documentList = []

  }

  openDocumentModal_f(targetDocumentTypeId: any) {
    this.openDocumentModal = true;
    this.targetDocumentTypeId = targetDocumentTypeId
  }

  closeDocumentModal() {
    this.openDocumentModal = false;
  }

  onFilesUploaded(files: File[]) {
    console.log('Files received in parent component:', files);
    this.selectedFiles = files;
    this.errorMessage = ''
  }

  getBillDetails() {
    this.apiService.dataGet(`checker/getInvoiceBillDetails?cjpcid=${this.CJPCID}`).subscribe(
      (response: any) => {
        console.log('Response :', response);

        this.invoiceTypeName = response?.data?.invoicetypename
        this.invoiceId = response?.data?.billinvoiceid
      },
      error => {
        console.log('Error :', error);
      });
  }


  onUploadDocument() {
    if (this.selectedFiles.length > 0) {

      this.uploading = true;
      let json = {
        "contractId": this.contractId,
        "fkdocumenttypeid": this.recoveryForm.get('recoveryfor')?.value,
        "documentName": this.documentName,
        "invoiceid": this.invoiceId,
        "invoiceTypeName": this.invoiceTypeName,
        "docUploadId": 0,
        "loginuser": this.apiService.getUserName(),
      }
      this.apiService.uploadRecoveryDocument('checker/addrecoveryDocument', json, this.selectedFiles[0]).subscribe((res: any
      ) => {
        this.uploading = false;
        console.log('res', res);
        //   {
        //     "fileName": "Bank Guarantee_380.pdf",
        //     "docId": 519,
        //     "response": "Success",
        //     "documentTypeId": 12,
        //     "message": "Success",
        //     "respcode": "200"
        // }

        // let targetDocumentTypeId = res?.documentTypeId

        const updatedDocuments = this.documentList.map(doc =>
          doc.documenttypeid === this.targetDocumentTypeId
            ? { ...doc, docId: res?.docId }
            : doc
        );

        this.documentList = updatedDocuments;
        console.log('this.documentList', this.documentList);


        this.openDocumentModal = false;
        this.fileUpload.cleanFile()
        this.selectedFiles = []
        this.errorMessage = ''
      },
        (error: any) => {
          this.uploading = false;
          this.errorMessage = this.apiService.handleError(error);
        }
      );
    }
  }

  onViewDocument(value: any) {
    // console.log('value', value);

    // this.docViewModelOpen = true
    this.apiService.dataPost('contract/DocumentDownload', { "Url": value }).subscribe((res: any) => {
      // console.log('res', res);
      this.bash64String = res.data.Base64String
    },
      (error: any) => {
        this.apiService.handleError(error);
        this.bash64String = ''
      }
    )

  }

  onReleaseAmount() {
    this.submitted = true;
    if (this.releaseRemarks == '') {
      return
    }

    let url = 'checker/addrecoveryrelease'
    let passParam = {
      "recoveryId": this.recoveryId,
      "releaseRemark": this.releaseRemarks,
      "loginUser": this.apiService.getUserName(),
    }
    this.apiService.dataPost(url, passParam).subscribe((res: any) => {
      console.log('res', res);
      this.releaseRemarks = ''
      this.releaseAmount = ''
      this.submitted = false
      this.openReleaseModal = false

      this.getRecoveriesList()
    }, error => {
      this.errorMessage = this.apiService.handleError(error);
      this.submitted = false
    })
  }

  onDelete(value: any) {
    console.log('value', value);
    let url = 'checker/deleteRecovery'
    let params = {
      "id": value?.recoveryid,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost(url, params).subscribe((res: any) => {
      // console.log('res', res);
      this.getRecoveriesList()
      this.updatePaymentDetails.emit(true)
    }
      , error => {
        this.apiService.handleError(error);
      }
    )
  }

  openDepartmentModal() {
    this.departmentModal = true;
  }

  closeDepartmentModal() {
    this.departmentModal = false;
    this.getDepartmentList()
  }

  openRecoveryForModal() {
    this.recoveryForModal = true;
  }

  closeRecoveryForModal() {
    this.recoveryForModal = false;
    this.onChangeDepartment(this.recoveryForm.get('department')?.value);
  }

  approveRejectCN(status: string) {
    this.isLoader = true;
    let url = 'checker/approveNRejectCreditNote'
    let params = {
      "id": this.creditNoteId,
      "status": status,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost(url, params).subscribe((res: any) => {
      this.isLoader = false;
      this.successPopup = true;
      this.popupMessage = status == 'Approved' ? 'Credit Note Approved Successfully' : 'Credit Note Rejected Successfully'
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);
      this.getRecoveriesList()
      this.creditNoteDocModal = false;
    },
      error => {
        this.isLoader = false;
        this.errorMessage = this.apiService.handleError(error);
      }
    )
  }
}
