import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FileUploadComponent } from 'src/app/common/file-upload/file-upload.component'; // Replace with the correct path
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import * as e from 'cors';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-cjpc-holds',
  templateUrl: './cjpc-holds.component.html',
  styleUrls: ['./cjpc-holds.component.scss']
})
export class CjpcHoldsComponent {
  @ViewChild(FileUploadComponent) fileUploadComponents!: FileUploadComponent;

  @Input() CJPCID: string = '';
  @Input() contractId: string = '';
  @Input() cjpcStatus: string = '';
  @Input() contractDetails: any;
  @Input() cjpcType: string = ''
  @Input() holdsTable: any[] = [];
  @Output() updatePaymentDetails: EventEmitter<any> = new EventEmitter<any>();


  isAddRecoveryModelOpen: boolean = false
  ReleaseModelOpen: boolean = false
  isEdit: boolean = false
  isLoader: boolean = false;
  isUpdated: boolean = false;
  errorMessage: string = ''
  submitted: boolean = false;
  recoveryForList: any[] = []
  documentsList: any[] = [];
  username: string | null;
  popupMessage: string = '';
  successPopup: boolean = false;
  optionsDepatment: any[] = [];
  errorMessage_afterSubmit: string = '';
  departmentId: number = 0;
  holdId: number = 0;
  totalHoldAmount: number = 0;
  totalReleaseAmount: number = 0;
  releaseForm!: FormGroup;
  holdDocumentList: any[] = [];
  selectedFiles_document: File[] = [];
  invoiceTypeName: string = '';
  invoiceId: number | null = null;

  documentColumns = [
    { header: "Document", field: 'documentname' },
    { header: "File", field: 'location', },
    // { header: "Action", field: 'Action', value: ['edit', 'delete'] }
  ]
  openDocumentListModal: boolean = false;
  holdDocuments: any[] = [];
  docViewModelOpen: boolean = false;
  bash64String: string = '';
  remainingAmount: number = 0;
  holdAmount: number = 0;
  holdStatus: any;
  remarkModal: boolean = false; contractAmountExceedsRecovery: boolean = false;
  remark: string = '';
  error_message: string = '';
  editData: any;
  netpayableamount: any;
  totalRemainingAmount: any;
  editedRemainingAmount: any;
  departmentModal: boolean = false;
  holdForModal: boolean = false;

  closeRecoveryModal() {
    this.isAddRecoveryModelOpen = false;
    this.isEdit = false;
    this.holdId = 0;
    this.holdStatus = ''
    this.errorMessage = ''
    this.recoveryForm.reset();
    this.documentsList = []
    this.recoveryForm.get('recoveryfor')?.enable();
    this.recoveryForm.get('department')?.enable();
    this.editedRemainingAmount = 0
  }

  getBillDetails() {
    this.apiService.dataGet(`checker/getInvoiceBillDetails?cjpcid=${this.CJPCID}`).subscribe(
      (response: any) => {
        console.log('Response :', response);

        this.invoiceTypeName = response?.data?.invoicetypename
        this.invoiceId = response?.data?.billinvoiceid
        this.netpayableamount = response?.data?.netpayableamount
      },
      error => {
        console.log('Error :', error);
      });
  }
  openRecoveryModal() {
    this.isAddRecoveryModelOpen = true;
    this.errorMessage = ''
    this.holdId = 0;
    this.holdStatus = ''
    this.recoveryForm.get('cjpcId')?.setValue(this.CJPCID);
    // this.recoveryForm.reset();
  }
  closeReleaseModal() {
    this.ReleaseModelOpen = false;
    this.releaseForm.reset();
    this.selectedFiles_document = [];
    this.holdId = 0;
    this.holdStatus = ''
    this.errorMessage_afterSubmit = ''
  }
  openReleaseModal() {
    this.ReleaseModelOpen = true;
  }
  recoveryForm!: FormGroup;
  constructor(private fb: FormBuilder, private fs: FormService, private apiService: ApiService) {
    this.recoveryForm = this.fb.group({
      cjpcId: [{ value: this.CJPCID, disabled: true }],
      invoiceId: [{ value: null, disabled: true }],
      department: [{ value: null, disabled: false },],
      recoveryfor: [null, Validators.required],
      maxvalue: [null],
      recAmt: [null, Validators.required],
      remark: [null],
      // holds: [null, Validators.required],
      // amount: [null],
      releaseAmt: [null],
      documentList: this.fb.array([]),
      remarkRelease: [null],
      holdtypeid: [null],
    },)
    console.log('contract details', this.recoveryForm.value);

    this.releaseForm = this.fb.group({
      holdRelease: [null],
      docType: [null, Validators.required],
      releaseAmount: [null],
    })

    this.username = localStorage.getItem('username');
  }
  ngOnInit() {
    console.log('contractDetails', this.contractDetails);
    this.getListingOfHoldDetails()
    this.getDepartmentList()
    this.getBillDetails()
    if (this.cjpcType === 'Release') {
      this.holdcolumns = [
        { header: 'Hold ID', field: 'holdid' },
        { header: 'Department', field: 'departmentname' },
        { header: 'Holds For', field: 'holdtypename' },
        // { header: 'Max Value', field: 'maxpercent' },
        { header: 'Hold Amount', field: 'holdamount' },
        { header: 'Remaining Amount', field: 'remainingamount' },
        { header: 'Remarks', field: 'remark' },
        { header: "Updated By", field: 'updatedby' },
        { header: 'Updated Date', field: 'updateddate' },
        { header: 'Status', field: 'status' },
        { header: 'Hold Release', field: 'holdRelease' },
      ]
    }
    else {
      this.holdcolumns = [
        { header: 'Hold ID', field: 'holdid' },
        { header: 'Department', field: 'departmentname' },
        { header: 'Holds For', field: 'holdtypename' },
        // { header: 'Max Value', field: 'maxpercent' },
        { header: 'Hold Amount', field: 'holdamount' },
        { header: 'Remaining Amount', field: 'remainingamount' },
        { header: 'Remarks', field: 'remark' },
        { header: "Updated By", field: 'updatedby' },
        { header: 'Updated Date', field: 'updateddate' },
        { header: 'Status', field: 'status' },
        { header: 'Hold Release', field: 'holdRelease' },
        { header: 'Action', field: 'action', value: ['edit', 'deleteWRemarks'] }
      ]
    }
    console.log('Release', this.cjpcType);
  }

  onAmountChange(event: any) {

    const netpayableamount = this.netpayableamount; // maxvalue = contract amount

    const recoveryAmount = this.recoveryForm.get('recAmt')?.value;
    if (this.HoldList.length > 0) {

      let maxValue = netpayableamount - this.totalRemainingAmount
      if (this.isEdit) {
        maxValue = netpayableamount - (this.totalRemainingAmount - this.editedRemainingAmount)
      }
      if (maxValue < recoveryAmount) {
        this.contractAmountExceedsRecovery = true
        // return;
      }
      else {
        this.contractAmountExceedsRecovery = false
      }
    }
    else {
      if (netpayableamount != null && recoveryAmount != null && netpayableamount < recoveryAmount) {

        this.contractAmountExceedsRecovery = true
      }
      else {
        this.contractAmountExceedsRecovery = false
      }
    }


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

  holdcolumns = [
    { header: 'Hold ID', field: 'holdid' },
    { header: 'Department', field: 'departmentname' },
    { header: 'Holds For', field: 'holdtypename' },
    // { header: 'Max Value', field: 'maxpercent' },
    { header: 'Hold Amount', field: 'holdamount' },
    { header: 'Remaining Amount', field: 'remainingamount' },
    { header: 'Remarks', field: 'remark' },
    { header: "Updated By", field: 'updatedby' },
    { header: 'Updated Date', field: 'updateddate' },
    { header: 'Status', field: 'status' },
    { header: 'Hold Release', field: 'holdRelease' },
    { header: 'Action', field: 'action', value: ['edit', 'deleteWRemarks'] }
  ]

  HoldList: any[] = []
  // HoldList = [
  //   {
  //     'department': 'Xyz',
  //     'recoveries': 'Hold for HR/IR COM/BOCW/INSURANCE',
  //     'maxvalue': '123456',
  //     'recoveryAmount': '123456',
  //     'documentUpload': 'View Document',
  //     'remarks': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
  //     'holdRelease': '',
  //     'action': '',
  //   },
  // ]

  releasecolumns = [
    { header: 'Hold ID', field: 'holdid' },
    { header: 'Department', field: 'departmentname' },
    { header: 'Release For', field: 'holdtypename' },
    // { header: 'Max Value', field: 'maxvalue' },
    { header: 'Released Amount', field: 'releaseamount' },
    { header: 'Document Upload', field: 'documentUpload' },
    { header: 'Remarks', field: 'remark' },
    // { header: 'Action', field: 'action', value: [] }
  ]

  ReleaseList: any[] = []
  // ReleaseList = [
  //   {
  //     'department': 'Xyz',
  //     'recoveries': 'Hold for HR/IR COM/BOCW/INSURANCE',
  //     'maxvalue': '123456',
  //     'recoveryAmount': '123456',
  //     'alreadyRecovered': '123456',
  //     'remarks': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
  //     'action': '',
  //   },
  // ]

  onDepartmentChange(value: any) {
    if (value) {
      this.departmentId = value
      this.getRecoveryForDetails()
    } else {
      this.departmentId = 0
      this.recoveryForList = []
      this.documentsList = []
      this.recoveryForm.controls['recoveryfor'].setValue(null)
    }
  }
  get documentArray(): FormArray {
    return this.recoveryForm.get('documentList') as FormArray;
  }
  saveData() {

    this.submitted = true;
    const selectedDocs = this.documentArray.controls
      .map((control: AbstractControl, index: number) =>
        control.value ? {
          documentTypeId: this.documentsList[index].documenttypeid,
          documentName: this.documentsList[index].doctypename
        } : null
      )
      .filter((doc: any) => doc !== null);
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched()
      return;
    }
    // console.log('selectedDocs', selectedDocs);
    if (selectedDocs.length == 0) {
      this.errorMessage = 'Please select at least one document.';
      return;
    }
    if (this.contractAmountExceedsRecovery) {
      this.errorMessage = 'Recovery amount should be less than contract amount';
      return
    }
    this.errorMessage = '';

    const formData = this.recoveryForm.value
    const json = {
      "holdId": this.holdId ? this.holdId : 0,
      "fkHoldTypeId": formData.holdtypeid,
      "fkCjpcId": this.CJPCID,
      "holdAmount": formData.recAmt,
      "holdRemark": formData.remark,
      "heldBy": 12, //userid
      "loginUser": this.apiService.getUserName(),
      "contractId": this.contractId,
      "documentRequiredList": selectedDocs
    }
    // console.log('formvalue', json);
    this.isLoader = true;
    this.apiService.dataPost('contract/addHold', json).subscribe((response: any) => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true;
      this.holdId = 0;
      this.popupMessage = this.isEdit ? 'Data Updated Successfully' : 'Data saved successfully';
      this.isEdit = false
      this.resetForm();
      this.closeRecoveryModal()
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);

      this.getListingOfHoldDetails()
      this.updatePaymentDetails.emit(true);
    }, error => {
      this.errorMessage = this.apiService.handleError(error);
      this.isLoader = false;
      this.submitted = false;

    });
  }

  resetForm() {

    // const currentValues = this.recoveryForm.getRawValue();
    // const resetValues: any = {};
    // Object.keys(currentValues).forEach(key => {
    //   const control = this.recoveryForm.get(key);
    //   if (control?.disabled) {
    //     resetValues[key] = currentValues[key]; // Keep disabled values
    //   } else {
    //     resetValues[key] = null; // Reset enabled values
    //   }
    // });
    // this.recoveryForm.reset(resetValues);
    this.recoveryForm.reset();
    this.holdId = 0;
    this.holdStatus = ''
    this.contractAmountExceedsRecovery = false
    this.recoveryForm.get('cjpcId')?.setValue(this.CJPCID);

  }
  getRecoveryForDetails() {
    const data = {
      "departmentId": this.departmentId
    }
    this.isLoader = true
    this.recoveryForm.controls['recoveryfor'].setValue(null);
    this.documentsList = []
    this.apiService.dataPost('contract/getHoldTypeByDepartmentId', data).subscribe(
      (response: any) => {
        this.recoveryForList = response?.data
        this.isLoader = false
        if (this.editData) {
          let doc = this.recoveryForList.filter((item: any) => item.holdtypeid == this.editData.holdtypeid)
          console.log('doc', doc);
          this.onRecoveryChange(doc[0])
        }


      },
      error => {
        console.log('Error :', error);
      });
  }
  getListingOfHoldDetails() {
    // const data = {
    //   "departmentId": 13
    // }
    this.isLoader = true
    this.apiService.dataGet(`checker/getListingOfHoldDetails?cjpcid=${this.CJPCID}`).subscribe(
      (response: any) => {
        // console.log('Response :', response);
        this.HoldList = response?.data ? response?.data.filter((item: any) => item.status == 'HOLD' || item.status == 'Done' || item.status == 'Partial') : []
        this.ReleaseList = response?.data ? response?.data.filter((item: any) => item.status == 'Release' || item.status == 'Approved') : []
        this.isLoader = false

        this.totalHoldAmount = 0;
        for (let i = 0; i < this.HoldList.length; i++) {
          this.totalHoldAmount += this.HoldList[i].holdamount;
        }

        this.totalReleaseAmount = 0;
        for (let i = 0; i < this.ReleaseList.length; i++) {
          this.totalReleaseAmount += this.ReleaseList[i].releaseamount;
        }
        this.totalRemainingAmount = 0;
        for (let i = 0; i < this.HoldList.length; i++) {
          this.totalRemainingAmount += this.HoldList[i].remainingamount
        }
        console.log('remaining amount', this.totalRemainingAmount);
      },
      error => {
        console.log('Error :', error);
      });
  }

  onRecoveryChange(event: any) {
    console.log(event, 'event');
    this.recoveryForm.patchValue({
      department: event?.departmentname,
      maxvalue: event?.maxpercent,
      holdtypeid: event?.holdtypeid
    })
    this.documentsList = []
    this.documentsList = event?.documentsList
    const docArray = this.recoveryForm.get('documentList') as FormArray;
    docArray.clear()
    if (this.editData) {
      this.documentsList.forEach((doc: any) => {
        const isChecked = this.editData?.documents?.some(
          (d: any) => d.documentname === doc.doctypename
        );
        docArray.push(this.fb.control(isChecked));
      });
    }
    else {
      this.documentsList.forEach((doc: any) => {
        docArray.push(this.fb.control(false));
      });
    }

  }

  releaseAmt(value: any) {
    console.log('value', value);
    this.holdStatus = value.status
    // this.billType = value['Bill Type'];
    this.holdId = value.holdid;
    // this.optionDocumentType = value.recovery_documents;
    this.setHoldAmountValidation(value)
    this.openReleaseModal();
    this.getHoldDocLict(this.holdId);
    this.getBillDetails();

  }
  onEditHold(value: any) {
    console.log('value', value);
    this.isEdit = true;
    this.editedRemainingAmount = value.remainingamount
    this.holdStatus = value.status
    this.holdId = value.holdid;
    this.recoveryForm.get('recoveryfor')?.disable();
    this.recoveryForm.get('department')?.disable();
    this.openRecoveryModal()
    this.getHoldById(value)
    // this.recoveryForm.patchValue({
    //   cjpcId: this.CJPCID,
    //   maxvalue: value.maxpercent,
    //   recAmt: value.remainingamount,
    //   remark: value.remark,
    //   releaseAmt: value.releaseamount,
    //   // documentList:,
    //   // remarkRelease: ,
    //   holdtypeid: value.fkHoldTypeId
    // })
  }
  getHoldDocLict(value: any) {
    let data = {
      "holdid": value
    }
    this.apiService.dataPost('contract/getHoldDocList', data).subscribe((res: any) => {
      this.holdDocumentList = res.data.map((item: any) => {
        // let lastSegment = item.location ? item.location.split('/').pop() : null;
        return {
          ...item,
          location: item.location != null ? item.location.split('/').pop() : ''
        };
      });
    }, error => {
      this.apiService.handleError(error)
    })
  }

  async getHoldById(value: any) {
    let data = {
      "holdId": value.holdid
    }
    this.apiService.dataPost('contract/getHoldDetails', data).subscribe((res: any) => {
      this.onDepartmentChange(res.data[0].departmentid)
      // this.onRecoveryChange(res.data[0])
      this.editData = res.data[0]
      this.holdId = res.data[0].holdid
      this.holdStatus = res.data[0].status
      this.holdAmount = res.data[0].holdamount
      this.recoveryForm.patchValue({
        cjpcId: this.CJPCID,
        maxvalue: value.maxpercent,
        recAmt: value.holdamount,
        remark: value.remark,
        releaseAmt: value.releaseamount,
        department: res.data[0].departmentid,
        recoveryfor: res.data[0].holdtypeid,
        holdtypeid: res.data[0].holdtypeid
      })

    }, error => {
      this.apiService.handleError(error)
    })
  }

  onFilesUploaded(files: File[]) {
    this.selectedFiles_document = files;
  }

  uploadDocument() {
    this.submitted = true;

    if (this.releaseForm.invalid) {
      this.releaseForm.markAllAsTouched()
      return;
    }
    this.isLoader = true;
    let data = {
      "documentid": this.releaseForm.value.docType,
      "contractid": this.contractId,
      "invoiceid": this.invoiceId,
      "invoiceTypeName": this.invoiceTypeName,
      "loginuser": this.apiService.getUserName(),
    }
    this.apiService.uploadReleaseDocument('contract/addHoldReleaseDocument', data, this.selectedFiles_document[0]).subscribe((res: any) => {
      this.isLoader = false;
      this.submitted = false;

      this.getHoldDocLict(this.holdId);
      this.selectedFiles_document = [];
      this.fileUploadComponents.cleanFile();
      this.releaseForm.reset();
      this.errorMessage_afterSubmit = ''
    }, error => {
      this.isLoader = false;
      this.submitted = false;

      this.errorMessage = this.apiService.handleError(error)
    })
  }

  onSubmit() {
    // onSubmit
    let result = false
    if (this.holdStatus.toLowerCase() == 'partial') {
      result = this.holdDocumentList.some(doc => doc.location !== "");
    }
    else {
      result = this.holdDocumentList.every(doc => doc.location !== "");
    }
    // const result = this.holdDocumentList.every(doc => doc.location !== "");
    if (!result) {
      this.isLoader = false;
      if (this.holdStatus.toLowerCase() != 'partial') {
        this.errorMessage_afterSubmit = 'Please upload all documents before saving.';
      }
      else {
        this.errorMessage_afterSubmit = 'Please upload atleast one document before saving.';
      }
      return;
    }

    if (Number(this.releaseForm.value.releaseAmount.trim()) <= 0) {
      this.errorMessage_afterSubmit = 'Please enter release amount';
      return;
    }

    // if (this.releaseForm.value.releaseAmount > this.remainingAmount) {
    //   this.errorMessage_afterSubmit = 'Release amount should be less than remaining amount';
    //   return
    // }

    this.isLoader = true;
    let data = {
      "holdReleaseRequestId": 0,
      "fkHoldId": this.holdId,
      "releaseAmount": Number(this.releaseForm.value.releaseAmount),
      "loginuser": this.apiService.getUserName(),
    }
    this.apiService.dataPost('contract/addHoldReqRels', data).subscribe((res: any) => {
      this.isLoader = false;
      this.submitted = false;
      this.releaseForm.reset();
      this.closeReleaseModal();

      this.getListingOfHoldDetails();
      this.updatePaymentDetails.emit(true);
    }, error => {
      this.isLoader = false;
      this.submitted = false;
      this.errorMessage_afterSubmit = this.apiService.handleError(error)
    })
  }
  onReleaseAmountChange(event: any) {
    if (this.releaseForm.value.releaseAmount != null) {
      this.errorMessage_afterSubmit = '';
      return;
    }
  }

  reset() {
    this.releaseForm.reset();
    this.selectedFiles_document = [];
    this.fileUploadComponents.cleanFile();
    this.isLoader = false;
    this.submitted = false;
    this.errorMessage = '';
    this.errorMessage_afterSubmit = '';
    this.closeReleaseModal();

  }

  onDelete(value: any) {
    console.log('ondelete', value);
    this.remarkModal = true;
    this.remark = value.remark
    this.holdId = value.holdid;
    // this.submitRemark(value);
    // const url = 'contract/deleteHoldReq'
    // let data = {
    //   "id": value.holdid,
    //   "isActive": false,
    //   "loginuser": this.apiService.getUserName(),
    // }
    // this.apiService.dataPost(url, data).subscribe((res: any) => {
    //   this.isLoader = false;
    //   this.getListingOfHoldDetails()
    // }, error => {
    //   this.isLoader = false;
    //   this.apiService.handleError(error)
    // })
  }

  onViewDocument(value: any) {
    console.log('value', value);

    this.docViewModelOpen = true
    this.apiService.dataPost('contract/DocumentDownload', { "Url": value }).subscribe((res: any) => {
      console.log('res', res);
      this.bash64String = res.data.Base64String
    },
      (error: any) => {
        this.apiService.handleError(error);
        this.bash64String = ''
      }
    )

  }

  rowAction(value: any) {
    console.log('value', value);

    if (value?.columnName == 'Document Upload') {
      this.openDocumentListModal = true
      this.errorMessage = ''
      this.errorMessage_afterSubmit = ''

      this.holdDocuments = value?.rowData?.document.map((item: any) => ({
        ...item,
        name: item.location != null ? item.location.split('/').pop() : ''

      }));
      console.log('this.datacof', this.holdDocuments);
    }
  }
  checkedOrApproved() {
    this.remarkModal = true;
    this.remark = '';
  }

  closeRemarkModal() {
    this.remarkModal = false;
  }

  submitRemark(value?: any) {
    this.isLoader = true;
    const url = 'contract/deleteHoldReq'
    let data = {
      "id": this.holdId,
      "isActive": false,
      "remark": this.remark.trim(),
      "loginuser": this.apiService.getUserName(),
    }
    this.successPopup = false;
    this.apiService.dataPost(url, data).subscribe((res: any) => {
      this.isLoader = false;
      this.remarkModal = false;
      this.successPopup = true;
      this.popupMessage = 'Data deleted successfully';
      this.getListingOfHoldDetails();
      this.updatePaymentDetails.emit(true);
    }, error => {
      this.isLoader = false;
      this.errorMessage = this.apiService.handleError(error);
    })
  }
  releaseAmountValidator(remainingamount: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value !== null && remainingamount !== null && value > remainingamount) {
        return { exceedRemaningAmount: true };
      }
      return null;
    };
  }
  setHoldAmountValidation(value: any) {
    const remainingamount = value?.remainingamount;
    const control = this.releaseForm.get('releaseAmount');

    if (control) {
      // Clear old validators and set new one with the holdamount
      control.setValidators([
        this.releaseAmountValidator(remainingamount)
      ]);
      control.updateValueAndValidity();
    }
  }

  openDepartmentModal() {
    this.departmentModal = true;
  }

  closeDepartmentModal() {
    this.departmentModal = false;
    this.getDepartmentList();
  }

  openHoldForModal() {
    this.holdForModal = true;
  }

  closeHoldForModal() {
    this.holdForModal = false;
    this.getRecoveryForDetails()
  }
}
