import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { BorderColorService } from 'src/app/common/services/border-color.service';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';
import { NumberToWordsService } from 'src/app/services/number-to-words.service';

@Component({
  selector: 'app-cjpc-action',
  templateUrl: './cjpc-action.component.html',
  styleUrls: ['./cjpc-action.component.scss']
})
export class CjpcActionComponent {

  cjpcForm!: FormGroup;

  contractDetails: any;
  statusDetails: any[] = [];
  CJPCID: string = '';
  ContractId: string = '';
  WONumber: any;
  OriginalDate_clr: string = '';
  ActualComDate_clr: string = '';
  LastAmndDate_clr: string = '';
  currentDate: any = moment(new Date).format("YYYY-MM-DD");
  blink_OriginalDate: boolean = false;
  blink_LastAmndDate: boolean = false;
  blink_ActualComDate: boolean = false;
  error_message: string = '';
  roleName: string = '';
  remarkModal: boolean = false;
  remark: string = '';
  username: string = ''
  isApproved: boolean = false;
  popupMessage: string = '';
  successPopup: boolean = false;
  billingDetails: any;
  invoiceTypeName: string = '';
  isLoader: boolean = false;
  invoiceId: number = 0;
  isDisable: boolean = false;

  docViewModelOpen: boolean = false;
  bash64String: any;
  invoicePDFDocuments: any[] = []
  recoveryDocuments: any;
  openDocumentListModal: boolean = false;
  invoicenumber: any;
  success_message: string = '';
  isChecklistSent: boolean = false;
  cjpcStatus: string = ''
  paymentDetails: any;
  checkListDocumentLocation: string = '';
  pdfUrl: string = '';
  cjpcType: any;
  ReleaseAmountDetails: any[] = [];
  ReleaseId: string = '';
  retentionReleaseData: any[] = [];
  totalRetentionAmount: number = 0;
  totalRetentionAmountWithWords: string = '';
  retentionType: string = '';
  SummaryDetailsA: any[]= [];
  recoveryTable:any[] = [];
  holdsTable: any[] = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private fb: FormBuilder,
    private fs: FormService,
    private apiService: ApiService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private borderColorService: BorderColorService,
    private toWordsService: NumberToWordsService

  ) {
    let state = this.router.getCurrentNavigation()?.extras?.state;
    if (state) {
      console.log('State:', state);

      this.cjpcStatus = state?.['status']
      localStorage.setItem('cjpcStatus', this.cjpcStatus)
      this.cjpcType = state?.['CJPCData']?.['CJPC Type'] || '';
      localStorage.setItem('cjpcType', this.cjpcType)
      this.ReleaseId = state?.['CJPCData']?.['holdreleaseid'] || state?.['CJPCData']?.['holdreleaserequestid'] || '';
      localStorage.setItem('ReleaseId', this.ReleaseId)
      this.retentionType = state?.['CJPCData']?.['Retention Type'] || '';
      localStorage.setItem('retentionType', this.retentionType)

    }
    else {
      if (localStorage.getItem('cjpcStatus')) {
        this.cjpcStatus = localStorage.getItem('cjpcStatus') ?? ''
        this.cjpcType = localStorage.getItem('cjpcType') ?? '';
        this.ReleaseId = localStorage.getItem('ReleaseId') ?? '';
        this.retentionType = localStorage.getItem('retentionType')?? '';
      }
    }
    this.breadcrumbService.setBreadcrumbUrl();
    this.cjpcForm = this.fb.group({
      ProjectName: [{ value: '', disabled: true }, Validators.required],
      projectCode: [{ value: '', disabled: true }, Validators.required],
      package: [{ value: '', disabled: true }, Validators.required],
      ContractorName: [{ value: '', disabled: true }, Validators.required],
      vendorCode: [{ value: '', disabled: true }, Validators.required],
      ContractWO: [{ value: '', disabled: true }, Validators.required],
      WODate: [{ value: '', disabled: true }, Validators.required],
      LastAmndDate: [{ value: '', disabled: true }, Validators.required],
      completionValue: [{ value: '' }, Validators.required],
      amendedContact: [{ value: '' }, Validators.required],
      finalWork: [{ value: '' }, Validators.required],
      ogCompletionDate: [{ value: '', disabled: true }, Validators.required],
      lastAmndCompletionDate: [{ value: '', disabled: true }, Validators.required],
      ActualComDate: [{ value: '', disabled: true }, Validators.required],
      DLPDate: [{ value: '', disabled: true }, Validators.required],
    })

    this.roleName = localStorage.getItem('roleName') || '';
    this.username = localStorage.getItem('username') || '';
  }

  panels = [
    { title: 'Advance and Retention', isOpen: false, visible: true },
    { title: 'Clause and Compliance Documents', isOpen: false, visible: true },
    { title: 'Bill Details', isOpen: false, visible: true },
    { title: 'Payments Admitted', isOpen: false, visible: true },
    { title: 'Recoveries', isOpen: false, visible: true },
    { title: 'Holds and Releases', isOpen: false, visible: true },
    { title: 'Documents', isOpen: false, visible: true },
    { title: 'Deduction of Taxes', isOpen: false, visible: true },

  ];
  ngOnInit() {
    this.CJPCID = this.activeRoute.snapshot.queryParamMap.get('id') || '';

    // this.getContractDetails();
    this.getStatusDetails();
    // this.getBillDetails();
    this.getData()

    this.getCheckListDocument();
  }
  
  async getData() {
    await this.getContractDetails();
    await this.getBillDetails();
    await this.getPaymentadmittedDetails();
    await this.getInvoiceDocument()
    if (this.cjpcType == 'Hold Release') {
      this.getReleaseAmountDetails()
    }
    await this.getRetentionReleaseDetails();
  }

  getReleaseAmountDetails() {
    const url = 'contract/getHoldRelrequestDetailsById';
    let params = {
      "releasedId": this.ReleaseId
    };
    this.apiService.dataPost(url, params).subscribe(
      (response: any) => {
        console.log('Response :', response);
        this.ReleaseAmountDetails = response?.data || [];
      },
      error => {
        this.apiService.handleError(error);
      });
  }

  async getBillDetails() {
    try {
      const response: any = await firstValueFrom(
        this.apiService.dataGet(`checker/getInvoiceBillDetails?cjpcid=${this.CJPCID}`)
      );

      this.billingDetails = response?.data;
      console.log('Response :', this.billingDetails);

      this.invoiceTypeName = this.billingDetails?.invoicetypename || '';
      this.invoicenumber = this.billingDetails?.invoicenumber || '';
      this.invoiceId = this.billingDetails?.billinvoiceid || 0;
      if (this.billingDetails?.invoicetypename === 'DPR') {
        this.panels = [
          { title: 'Advance and Retention', isOpen: false, visible: false },
          { title: 'Clause and Compliance Documents', isOpen: false, visible: true },
          { title: 'Bill Details', isOpen: false, visible: true },
          { title: 'Payments Admitted', isOpen: false, visible: true },
          { title: 'Documents', isOpen: false, visible: true },
          { title: 'Deduction of Taxes', isOpen: false, visible: true },

        ];
      }
      else if (this.cjpcType == 'Retention Release') {
        this.panels = [
        ]
      }
      else {

        let vsisible_value = this.cjpcType == 'Hold Release' ? false : true;
        this.panels = [
          { title: 'Advance and Retention', isOpen: false, visible: vsisible_value },
          { title: 'Clause and Compliance Documents', isOpen: false, visible: vsisible_value },
          { title: 'Bill Details', isOpen: false, visible: true },
          { title: 'Payments Admitted', isOpen: false, visible: vsisible_value },
          { title: 'Recoveries', isOpen: false, visible: vsisible_value },
          { title: 'Holds and Releases', isOpen: false, visible: vsisible_value },
          { title: 'Documents', isOpen: false, visible: true },
          { title: 'Deduction of Taxes', isOpen: false, visible: vsisible_value },

        ];
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }
  getStatusDetails() {
    let params = {
      cjpcid: this.CJPCID,
    };
    this.apiService.dataPost(`checker/getCjpcStatusByCjpcId`, params).subscribe(
      (response: any) => {
        // console.log('Response :', response);
        this.statusDetails = response?.data?.sort((a: any, b: any) => {
          if (a.rolename === "Checker" && b.rolename !== "Checker") return -1;
          if (b.rolename === "Checker" && a.rolename !== "Checker") return 1;

          if (a.rolename === "CAD Admin" && b.rolename !== "CAD Admin") return 1;
          if (b.rolename === "CAD Admin" && a.rolename !== "CAD Admin") return -1;

          return a.rolename.localeCompare(b.rolename);
        });

        this.isApproved = this.statusDetails.some(
          entry => entry.adid === this.username && entry.validationstatus === "Approved"
        );

        if (this.roleName == 'Project Manager') {
          {
            this.isDisable = this.statusDetails.some(
              entry => entry.rolename == 'Checker' && entry.validationstatus === "Pending"
            );
          }
        } else if (this.roleName == 'CAD Admin') {
          this.isDisable = this.statusDetails.some(
            entry => entry.rolename == 'Project Manager' && entry.validationstatus === "Pending"
          );
        }

      },
      error => {
        this.apiService.handleError(error);
      });
  }

  checklist() {
    this.isChecklistSent = true

    let passParams = {
      "invoiceId": this.invoiceId,
      "status": "Accept",
      "remarks": "Send for Checklist",
      "user": this.apiService.getUserName(),
      "date": new Date(),
      "cjpcType":this.cjpcType
    }
    this.apiService.dataPost(`contract/setCJPC`, passParams).subscribe(
      (response: any) => {
        console.log('Response :', response);

        this.successPopup = true;
        this.popupMessage = 'Checklist sent successfully';
        setTimeout(() => {
          this.successPopup = false;
        }, 2000);

        this.isChecklistSent = false


      },
      error => {
        console.log('Error :', error);

        this.isChecklistSent = false
        this.error_message = this.apiService.handleError(error);

      });
  }

  togglePanel(panel: any) {
    this.panels.forEach(p => {
      p.isOpen = (p === panel) ? !p.isOpen : false;
    });
  }

  //need to add params cjpcid should be dynamic
  async getContractDetails() {
    try {
      const response: any = await firstValueFrom(
        this.apiService.dataGet(`checker/getContractDetails?cjpcid=${this.CJPCID}`)
      );

      this.contractDetails = response?.data[0];
      this.ContractId = this.contractDetails.contractid || '';
      this.updateFormValues(this.contractDetails);
    } catch (error) {
      console.log('Error:', error);
    }
  }

  updateFormValues(data: any) {
    this.cjpcForm.patchValue({
      ProjectName: data?.wbsccprojectname || 'NA',
      projectCode: data?.projectcode || 'NA',
      package: data.contractpackage || 'NA',
      ContractorName: data.vendorname || 'NA',
      vendorCode: data.vendorcode || 'NA',
      ContractWO: data.contractnumber || 'NA',
      WODate: data.contractdate ? moment(data.contractdate).format('DD-MMM-YYYY') : 'NA',
      LastAmndDate: data.LastAmndDate ? moment(data.LastAmndDate).format('DD-MMM-YYYY') : 'NA',
      completionValue: data.contractvalue || 'NA',
      amendedContact: data.amendmentvalue || 'NA',
      finalWork: data.amendmentvalue || 'NA',
      ogCompletionDate: data.ogCompletionDate ? moment(data.ogCompletionDate).format('DD-MMM-YYYY') : 'NA',
      lastAmndCompletionDate: data.lastAmndCompletionDate ? moment(data.lastAmndCompletionDate).format('DD-MMM-YYYY') : 'NA',
      ActualComDate: data.contractactualcompletiondate ? moment(data.contractactualcompletiondate).format('DD-MMM-YYYY') : 'NA',
      DLPDate: data.dlpDate? moment(data.dlpDate).format('DD-MMM-YYYY') : 'NA',
    });
    this.WONumber = data.contractnumber || 'NA'

    let days_1 = moment(data.ogCompletionDate).diff(this.currentDate, 'days');
    this.OriginalDate_clr = this.borderColorService.getColor(days_1);
    if (days_1 <= -7) {
      this.blink_OriginalDate = true
    } else {
      this.blink_OriginalDate = false
    }

    let days_2 = moment(data.lastAmndCompletionDate).diff(this.currentDate, 'days');
    this.LastAmndDate_clr = this.borderColorService.getColor(days_2);
    if (days_2 <= -7) {
      this.blink_LastAmndDate = true
    } else {
      this.blink_LastAmndDate = false
    }

    let days_3 = moment(data.contractactualcompletiondate).diff(this.currentDate, 'days');
    this.ActualComDate_clr = this.borderColorService.getColor(days_3);
    if (days_3 <= -7) {
      this.blink_ActualComDate = true
    } else {
      this.blink_ActualComDate = false
    }
  }

  convertToDateFormat(dateArray: number[]): string {
    if (!dateArray || dateArray.length < 3) return '';

    const [year, month, day] = dateArray;
    const date = new Date(year, month - 1, day); // Month is 0-based in JS Date

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(/ /g, '-').toUpperCase() // Ensure uppercase month

  }

  goBack() {
    // this.router.navigate(['CAD/cjpc-list'], { queryParams: { wo: this.WONumber } });
    window.history.back();
  }

  checkedOrApproved() {
    this.remarkModal = true;
    this.remark = '';
  }

  closeRemarkModal() {
    this.remarkModal = false;
  }

  submitRemark() {
    let dvsId = 0;
    let cvsId = 0;

    if (this.roleName == 'Checker') {
      // dvsId = this.statusDetails && this.statusDetails.find((item: any) => item.validationstatusid == userId);
      dvsId = this.statusDetails && this.statusDetails.find(item => item.adid == this.username)?.validationstatusid

    }

    if (this.roleName == 'Project Manager') {
      // cvsId = this.statusDetails && this.statusDetails.find((item: any) => item.validationstatusid == userId);
      cvsId = this.statusDetails && this.statusDetails.find((item: any) => item.adid == this.username)?.validationstatusid;
    }

    if (this.roleName == 'CAD Admin') {
      // cvsId = this.statusDetails && this.statusDetails.find((item: any) => item.validationstatusid == userId);
      cvsId = this.statusDetails && this.statusDetails.find((item: any) => item.adid == this.username)?.validationstatusid;
    }

    let params = {
      "dvsId": dvsId,
      "cvsId": cvsId,
      "status": "Approved",
      "remarks": this.remark.trim(),
      "user": this.apiService.getUserName(),
    }
    this.apiService.dataPost(`contract/cjpcDepartmentManagerApproval`, params).subscribe(
      (response: any) => {
        console.log('Response :', response);

        // this.router.navigate(['CAD/cjpc-list'], { queryParams: { wo: this.WONumber } });
        // window.history.back();
        this.remarkModal = false;
        this.remark = '';

        this.getStatusDetails();

        this.successPopup = true;
        this.popupMessage = 'Data submitted successfully';
        setTimeout(() => {
          this.successPopup = false;
        }, 2000);

        if (this.roleName == 'CAD Admin') {
          this.checklist() // Call the checklist function
        }

      },
      error => {
        this.error_message = this.apiService.handleError(error);
      });
  }

  rejectCJPC() {

    const url = 'contract/rejectHoldReleaseCjpc';
    let params = {
      "holdrelId": this.ReleaseId,
      "cjpcId": this.CJPCID,
      "status": "Rejected",
      "remark": this.remark.trim(),
      "loginuser": this.apiService.getUserName(),
      "contractNumber": this.WONumber
    };
    this.apiService.dataPost(url, params).subscribe(
      (response: any) => {
        console.log('Response :', response);

        this.remarkModal = false;
        this.remark = '';

        this.getStatusDetails();

        this.successPopup = true;
        this.popupMessage = 'CJPC Rejected successfully';
        setTimeout(() => {
          this.successPopup = false;
        }, 2000);

        // this.router.navigate(['CAD/cjpc-list'], { queryParams: { wo: this.WONumber } });
        window.history.back();

      },
      error => {
        this.error_message = this.apiService.handleError(error);
      });
  }

  rowAction() {
    this.openDocumentListModal = true
  }
  onViewDocument(value: any) {
    console.log('value', value);
    this.docViewModelOpen = true
    this.isLoader = true
    this.apiService.dataPost('contract/DocumentDownload', { "Url": value }).subscribe((res: any) => {
      console.log('res', res);
      this.bash64String = res.data.Base64String
      this.isLoader = false
    },
      (error: any) => {
        this.apiService.handleError(error);
        this.bash64String = ''
      }
    )

  }
  openInvoiceDocumentModal() {

    this.docViewModelOpen = true
    this.onViewDocument(this.invoicePDFDocuments[0].location);

  }
  getInvoiceDocument() {
    let data = {
      "contratInvoiceRefNo": this.invoicenumber + '-' + this.contractDetails.vendorcode + '-' + this.contractDetails.contractnumber,
    }
    const url = `contract/getInvoiceDocument`
    this.apiService.dataPost(url, data).subscribe(
      (response: any) => {
        this.recoveryDocuments = response.data.map((item: any) => ({
          ...item,
          name: item.location != null ? item.location.split('/').pop() : ''

        }));
        this.invoicePDFDocuments = this.recoveryDocuments.filter((item: any) => item.documentname == 'Invoice');
        console.log('invoice document', this.invoicePDFDocuments);
        this.recoveryDocuments = this.recoveryDocuments.filter((item: any) => item.documentname != 'Invoice');
      },
      (error: any) => {
        this.apiService.handleError(error)
      }
    )
  }

  getPaymentadmittedDetails() {
    let url = 'checker/getcjpcPaymentDetails'
    let passParams = {
      "cjpcid": this.CJPCID,
      "billtype": this.cjpcType == 'Hold Release' ? 'Release' : this.invoiceTypeName,
      "invoiceId": this.invoiceId
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        console.log('response', res);
        this.paymentDetails = res.data[0]

      }, error => {
        this.apiService.handleError(error)
      }
    )

    let url1 = 'checker/paymentSummaryByContractNumber'
    let passParams1 = {
      "contractnumber": this.WONumber,
      "cjpcId": this.CJPCID,
      "invoiceId": this.invoiceId,
    }
    this.apiService.dataPost(url1, passParams1).subscribe(
      (res: any) => {
        // console.log('response', res.data, passParams1);
        this.SummaryDetailsA = res.data?.paymentsummary

        const previous = res.data?.recoverysummary || [];
        const current = res.data?.currentCjpcrecoverysummary || [];

        const previoushold = res.data?.holdsummary || [];
        const currenthold = res.data?.currentCjpcholdsummary || [];

        const allTypes = [
          ...new Set([
            ...previous.map((p: any) => p.recoverytypename),
            ...current.map((c: any) => c.recoverytypename)
          ])
        ];

        const allTypeshold = [
          ...new Set([
            ...previoushold.map((p: any) => p.holdtypename),
            ...currenthold.map((c: any) => c.holdtypename)
          ])
        ];

        this.recoveryTable = allTypes.map(type => {
          const prev = previous.find((p: any) => p.recoverytypename === type);
          const curr = current.find((c: any) => c.recoverytypename === type);

          return {
            recoverytypename: type,
            uptoPreviousBill: prev ? prev.recoveryamount : 0,
            thisBill: curr ? curr.recoveryamount : 0,
            cumulative: (prev ? prev.recoveryamount : 0) + (curr ? curr.recoveryamount : 0)
          };
        });

        this.holdsTable = allTypeshold.map(type => {
          const prev = previoushold.find((p: any) => p.holdtypename === type);
          const curr = currenthold.find((c: any) => c.holdtypename === type);

          return {
            holdtypename: type,
            uptoPreviousBill: prev ? prev.holdamount : 0,
            thisBill: curr ? curr.holdamount : 0,
            cumulative: (prev ? prev.holdamount : 0) + (curr ? curr.holdamount : 0)
          };
        });

      }, error => {
        this.apiService.handleError(error)
      }
    )
  }
  DownloadChecklist() {
    // this.spinner = true;
    if (this.checkListDocumentLocation !== null && this.checkListDocumentLocation !== '') {
      let url = 'contract/DocumentDownload';
      let passParam = {
        "Url": `${this.checkListDocumentLocation}`
      }
      this.apiService.dataPost(url, passParam).subscribe(
        (res: any) => {
          console.log('res', res);

          this.pdfUrl = 'data:application/pdf;base64,' + res['data']['Base64String'];

          let documentType = res.data?.BlobName ? res.data?.BlobName.split('.').pop() : '';

          const a = document.createElement('a');
          a.href = this.pdfUrl;
          a.download = 'Checklist' + '_' + this.CJPCID
          a.click();
          window.URL.revokeObjectURL(this.pdfUrl);

          // this.spinner = false;
          // this.isloader = false;
          this.error_message = '';
          console.log('pdfUrl', this.pdfUrl);
        },
        error => {
          // this.spinner = false;
          // this.isloader = false;
          console.log('Error : ', error);
        }
      );
    }
    else {
      this.error_message = 'No CheckList Document Found'
    }
  }
  getCheckListDocument() {
    let data = {
      "cjpcId": this.CJPCID,
    }
    const url = `contract/getChecklistFileBycjpcId`
    this.apiService.dataPost(url, data).subscribe(
      (response: any) => {
        this.checkListDocumentLocation = response?.data[0]?.location
      },
      (error: any) => {
        this.apiService.handleError(error)
      }
    )
  }

  getRetentionReleaseDetails() {
    if (this.cjpcType == 'Retention Release') {
      const url = 'contract/findRetentionHistory';
      let params = {
        "contractNumber": this.WONumber,
        "releasefor": this.retentionType
      };
      this.apiService.dataPost(url, params).subscribe(
        (response: any) => {
          this.retentionReleaseData = response?.data ? response?.data : []

          this.totalRetentionAmount = this.retentionReleaseData.reduce((sum, item) => sum + item.retentionamount, 0);
          this.totalRetentionAmountWithWords = this.toWordsService.convertToWords(this.totalRetentionAmount);
        },
        error => {
          console.log('Error :', error);
        });
    }
  }

  ngOnDestroy() {
    localStorage.removeItem('cjpcStatus');
    localStorage.removeItem('cjpcType');
  }
} 
