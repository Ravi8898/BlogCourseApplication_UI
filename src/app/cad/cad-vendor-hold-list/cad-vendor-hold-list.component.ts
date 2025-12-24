import { Component, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { FileUploadComponent } from 'src/app/common/file-upload/file-upload.component';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-cad-vendor-hold-list',
  templateUrl: './cad-vendor-hold-list.component.html',
  styleUrls: ['./cad-vendor-hold-list.component.scss']
})
export class CadVendorHoldListComponent {
  @ViewChild(FileUploadComponent) fileUploadComponents!: FileUploadComponent;

  columns_holdList: any[] = []
  data_holdList: any[] = []
  submitted: boolean = false;
  isAddReleaseModelOpen: boolean = false;
  optionDocumentType: any[] = []
  holdDocumentList: any[] = []
  billType: string = '';
  releaseForm!: FormGroup;
  holdId: number = 0;

  documentColumns = [
    { header: "Document", field: 'documentname' },
    { header: "File", field: 'location', },
    // { header: "Action", field: 'Action', value: ['edit', 'delete'] }
  ]
  selectedFiles_document: any[] = [];
  isLoader: boolean = false;
  errorMessage: string = '';
  errorMessage_afterSubmit: string = '';
  invoiceId: string = '';
  holdStatus: any;
  invoiceData: any;

  constructor(
    private fb: FormBuilder,
    private fs: FormService,
    private apiService: ApiService,
    private router: Router,
    private activeRoute: ActivatedRoute,
  ) {
    let state = this.router.getCurrentNavigation()?.extras?.state;
    if (state) {
      this.invoiceData = state['invoiceData'] || {};
      localStorage.setItem('invoiceData', JSON.stringify(this.invoiceData));

    }
    else {
      if (localStorage.getItem('invoiceData')) {
        this.invoiceData = JSON.parse(localStorage.getItem('invoiceData') || '{}');
      }
    }

    this.releaseForm = this.fb.group({
      holdRelease: [null],
      docType: [null, Validators.required],
      releaseAmount: [null],
    })
  }

  closeReleaseModal() {
    this.isAddReleaseModelOpen = false;
  }
  openReleaseModal() {
    this.isAddReleaseModelOpen = true;
  }

  ngOnInit() {
    this.columns_holdList = [
      { name: 'Hold ID', hide_col: false, isFilter: false, },
      { name: 'WO Number', hide_col: false, isFilter: false, },
      { name: 'Bill Type', hide_col: false, isFilter: false },
      { name: 'RA Bill Number', hide_col: false, isFilter: false },
      { name: 'RA Bill Date', hide_col: false, isFilter: false },
      { name: 'Invoice Number', hide_col: false, isFilter: false },
      { name: 'Inv Date', hide_col: false, isFilter: false },
      { name: 'Hold Date', hide_col: false, isFilter: false },
      { name: 'Hold Amount', hide_col: false, isFilter: false },
      { name: 'CJPC Status', hide_col: false, isFilter: false },
      { name: 'Release Amt.', hide_col: false, isFilter: false },
      { name: 'Action', hide_col: false, isFilter: false },
      { name: 'recovery_documents', hide_col: true, isFilter: false },
      // { name: 'Action', hide_col: false, isFilter: false, value: [ 'delete'] },
    ];

    this.invoiceId = this.activeRoute.snapshot.queryParamMap.get('inv') || '';

    this.getHoldList();
  }

  getHoldList() {
    let data = {
      "invoiceid": this.invoiceId
    }
    this.apiService.dataPost('contract/getHoldList', data).subscribe((res: any) => {

      let result = res.data && res.data.map((item: any) => {
        return {
          'Hold ID': item.holdid,
          'WO Number': item.contractnumber,
          'Bill Type': item.invoicetypename,
          'RA Bill Number': item.runningaccbillno,
          'RA Bill Date': moment(item.runningaccbilldt).format('DD-MMM-YYYY'),
          'Invoice Number': item.invoicenumber,
          'Inv Date': moment(item.invoicedate).format('DD-MMM-YYYY'),
          'Hold Date': moment(item.createddate).format('DD-MMM-YYYY'),
          'Hold Amount': item.holdamount,
          'CJPC Status': item.status,
          'Release Amt.': item.releaseamount ? item.releaseamount : 0,
          'recovery_documents': item.recovery_documents,
          // 'Action': ''
        }
      })
      this.data_holdList = result;

    }, error => {
      this.apiService.handleError(error)
    })
  }

  releaseAmt(value: any) {
    console.log('value', value);
    this.billType = value['Bill Type'];
    this.holdId = value['Hold ID'];
    this.holdStatus = value['CJPC Status'];
    this.optionDocumentType = value.recovery_documents;

    this.openReleaseModal();
    this.getHoldDocLict(value['Hold ID']);
  }
  onFilesUploaded(files: File[]) {
    this.selectedFiles_document = files;
  }

  goBack() {
    this.router.navigate(['CAD/vendor/home'])
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

  uploadDocument() {
    this.submitted = true;
    if (this.releaseForm.invalid) {
      return;
    }
    this.isLoader = true;
    let data = {
      "documentid": this.releaseForm.value.docType,
      "contractid": 57,
      "invoiceid": 3,
      "invoiceTypeName": this.billType,
      "loginuser": this.apiService.getUserName(),
    }
    this.apiService.uploadReleaseDocument('contract/addHoldReleaseDocument', data, this.selectedFiles_document[0]).subscribe((res: any) => {
      this.isLoader = false;
      this.submitted = false;

      this.getHoldDocLict(this.holdId);
      this.selectedFiles_document = [];
      this.fileUploadComponents.cleanFile();
      this.releaseForm.reset();
    }, error => {
      this.isLoader = false;
      this.submitted = false;

      this.errorMessage = this.apiService.handleError(error)
    })
  }

  reset() {
    this.releaseForm.reset();
    this.selectedFiles_document = [];
    this.fileUploadComponents.cleanFile();
    this.isLoader = false;
    this.submitted = false;
    this.errorMessage = '';
    this.errorMessage_afterSubmit = '';
    this.holdId = 0;
    this.holdStatus = '';
    this.errorMessage_afterSubmit = '';
    this.closeReleaseModal();

  }

  onSubmit() {

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
    this.isLoader = true;
    let data = {
      "holdReleaseRequestId": 0,
      "fkHoldId": this.holdId,
      "releaseAmount": Number(this.releaseForm.value.releaseAmount.trim()),
      "loginuser": this.apiService.getUserName(),
    }
    this.apiService.dataPost('contract/addHoldReqRels', data).subscribe((res: any) => {
      this.isLoader = false;
      this.submitted = false;

      this.getHoldList();
      this.releaseForm.reset();
      this.closeReleaseModal();

    }, error => {
      this.isLoader = false;
      this.submitted = false;
      this.errorMessage_afterSubmit = this.apiService.handleError(error)
    })
  }
}
