import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import domtoimage from 'dom-to-image';

import jsPDF from 'jspdf';
import * as moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { BorderColorService } from 'src/app/common/services/border-color.service';
import { ApiService } from 'src/app/services/api.service';
import { NumberToWordsService } from 'src/app/services/number-to-words.service';

@Component({
  selector: 'app-cjpc-details',
  templateUrl: './cjpc-details.component.html',
  styleUrls: ['./cjpc-details.component.scss']
})
export class CjpcDetailsComponent {
  columns: any[] = [
    { header: 'Bill Type', field: 'invoicetypename' },
    { header: 'Bill Number', field: 'invoicenumber' },
    { header: 'Invoice Period', field: 'invoicePeriod' },
    { header: "Contractor's Bill Ref.", field: 'runningaccbillno' },
    { header: 'Date', field: 'date' },
    { header: 'Invoice Amount', field: 'netpayableamount' },
    { header: 'Complete Bill Receipt Date', field: 'completeBillReceiptDate' },
    { header: 'Payment Due Time & Date', field: 'paymentDueDate' },
    { header: 'DPR No.', field: 'dprNumber' },
    { header: 'SES No.', field: 'servicesheetno' }
  ];
  invoiceFinalBillColumns: any[] = [
    { header: 'Bill Type', field: 'invoicetypename' },
    { header: 'Bill Number', field: 'invoicenumber' },
    { header: 'Invoice Period', field: 'invoicePeriod' },
    { header: "Contractor's Bill Ref.", field: 'runningaccbillno' },
    { header: 'Date', field: 'date' },
    { header: 'Invoice Amount', field: 'netpayableamount' },
    { header: 'Complete Bill Receipt Date', field: 'completeBillReceiptDate' },
    { header: 'Payment Due Time & Date', field: 'paymentDueDate' },
    { header: 'DPR No.', field: 'dprNumber' },
    { header: 'Barcode', field: 'barcode' }
  ];
  Paymentcolumns: any[] = [
    { header: 'Gross amount against work done (SITC)', field: 'netAmt' },
    { header: 'Mobilisation Advance', field: 'advRecovery' },
    { header: 'Hold Amount', field: 'holdAmt' },
    { header: 'Hold Release Amount', field: 'holdRelAmt' },
    { header: 'Recovery Amount', field: 'recoveryAmt' },
    { header: "Adhoc Payment", field: 'adhocPay' },
    { header: 'CGST (Payable in addition to Contract Price)', field: 'cgstRate' },
    { header: 'SGST (Payable in addition to Contract Price)', field: 'sgstRate' },
    { header: 'IGST (Payable in addition to Contract Price)', field: 'igstRate' },
    { header: 'TCS/TDS Amount', field: 'TDSAmount' },
  ];

  Recoverycolumns: any[] = [
    { header: 'Department', field: 'departmentname' },
    { header: 'Recoveries For', field: 'recoverytypename' },
    // { header: 'Max Value', field: 'maxValue' },
    { header: 'Recovery Amount', field: 'recoveryamount' },
    // { header: 'Already Recovered', field: 'alreadyRec' },
    // { header: 'Total', field: 'total' },
    { header: 'Remarks', field: 'recoverydescription' },
    // { header: 'Hold Release', field: 'holdRelease' },
  ]
  Holdcolumns: any[] = [
    { header: 'Department', field: 'departmentname' },
    { header: 'Holds For', field: 'holdtypename' },
    // { header: 'Max Value', field: 'maxvalue' },
    { header: 'Hold Amount', field: 'holdamount' },
    // { header: 'Document Uploaded', field: 'docUpload' },
    { header: 'Remarks', field: 'remark' },
    // { header: 'Hold Release Amount', field: 'holdRelease' },
  ]
  Releasecolumns: any[] = [
    { header: 'Department', field: 'departmentname' },
    { header: 'Release For', field: 'holdtypename' },
    // { header: 'Max Value', field: 'maxvalue' },
    { header: 'Release Amt.', field: 'releaseamount' },
    // { header: 'Document Uploaded', field: 'docUpload' },
    { header: 'Remarks', field: 'remark' },
  ]
  ReleaseDetails: any[] = [];
  ReleaseAmountDetails: any[] = [];
  HoldDetails: any[] = [];
  billDetails: any[] = [];
  projectData: any
  CJPCID: string = '';
  contractNumber: string = '';
  currentDate: any = moment().format('YYYY-MM-DD');
  OriginalDate_clr: string = '';
  blink_OriginalDate: boolean = false;
  LastAmndDate_clr: string = '';
  blink_LastAmndDate: boolean = false;
  ActualComDate_clr: string = '';
  blink_ActualComDate: boolean = false;
  clauseAndComplianceDetails: any;
  clauses: any[] = [];
  compliances: any[] = [];
  billingDetails: any[] = [];
  paymentDetails: any[] = [];
  RecoveriesList: any[] = [];
  statusDetails: any[] = [];
  error_message: string = '';
  remarkModal: boolean = false;
  remark: string = '';
  successPopup: boolean = false;
  popupMessage: string = '';
  roleName: string;
  isApproved: boolean = false;
  showStatus: boolean = false;
  trackData: any[] = [
    // { status: 'Approved', dept: 'HR Status', desc: 'Work order approved but hold amount did not enterd' },
    // { status: 'Pending', dept: 'QA Status', desc: 'Work order approved but hold amount did not enterd' },
    // { status: 'Pending', dept: 'Safety Status', desc: 'Work order approved but hold amount did not enterd' },
  ];
  invoiceId: string = '';
  isDisable: boolean = false;
  docViewModelOpen: boolean = false;
  isLoader: boolean = false;
  bash64String: any;
  invoicePDFDocuments: any[] = []
  recoveryDocuments: any;
  openDocumentListModal: boolean = false;
  invoicenumber: any;
  isChecklistSent: boolean = false;
  checkListDocumentLocation: string = '';
  pdfUrl: string = '';
  cjpcType: string = '';
  ContractId: any;
  cjpcStatus: string = ''; blink_ValidityEndDate: boolean = false;
  advanceDetails: any;
  invoiceTypeName: string = '';
  ReleaseId: string = '';
  SummaryDetailsA: any[] = [];
  recoveryTable: any[] = [];
  holdsTable: any[] = [];
  retentionReleaseData: any[] = [];
  totalRetentionAmount: number = 0;
  totalRetentionAmountWithWords: string = '';
  retentionType: string = '';
  pbgAmountDetails: any;
  cpbgAmountDetails: any;
  invoiceDetailsSummary: any[] = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private activeRoute: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private borderColorService: BorderColorService,
    private toWordsService: NumberToWordsService
  ) {
    this.breadcrumbService.setBreadcrumbUrl();

    this.roleName = localStorage.getItem('roleName') || '';
    let state = this.router.getCurrentNavigation()?.extras?.state;
    if (state) {
      console.log('State:', state);

      this.cjpcStatus = state?.['status']
      localStorage.setItem('cjpcStatus', this.cjpcStatus)
      this.cjpcType = state?.['CJPCData']?.['CJPC Type'] || '';
      localStorage.setItem('cjpcType', this.cjpcType)
      this.ReleaseId = state?.['CJPCData']?.['holdreleaserequestid'] || '';
      localStorage.setItem('ReleaseId', this.ReleaseId)
      this.retentionType = state?.['CJPCData']?.['Retention Type'] || '';
      localStorage.setItem('RetentionType', this.retentionType)
    }
    else {
      if (localStorage.getItem('cjpcStatus')) {
        this.cjpcStatus = localStorage.getItem('cjpcStatus') ?? ''
        this.cjpcType = localStorage.getItem('cjpcType') ?? '';
        this.ReleaseId = localStorage.getItem('ReleaseId') ?? '';
        this.retentionType = localStorage.getItem('RetentionType') ?? '';
      }
    }
  }

  ngOnInit() {
    this.CJPCID = this.activeRoute.snapshot.queryParamMap.get('id') || '';

    this.getClauseAndComplianceDetails();

    this.getRecoveriesList();
    this.getListingOfHoldDetails()
    this.getStatusDetails();
    this.getCheckListDocument()

    this.getContractDetails();

    this.getData()
  }
  async getData() {
    // console.log('this.invoiceId', this.invoiceId);

    await this.getReleaseAmountDetails();
    // await this.getRetentionReleaseDetails();
    await this.viewCJPCHistory();
  }

  viewCJPCHistory() {
    this.apiService.dataPost(`checker/getCjpcHistoryByCjpcId`, { "cjpcid": this.CJPCID }).subscribe(
      (response: any) => {
        // console.log('Response :', response);
        let result = response ? response : []

        const timeline = [];

        // 1. Invoice Data
        result.data.invoice.forEach((inv: any) => {
          timeline.push({
            type: 'Invoice',
            date: inv.createddate,
            title: `Invoice Status: ${inv.status}`,
            details: inv
          });
        });

        // 2. CJPC Data
        // result.data.cjpc.forEach((cj:any) => {
        //   timeline.push({
        //     type: 'CJPC',
        //     date: cj.createddate,
        //     title: `CJPC Status: ${cj.status}`,
        //     details: cj
        //   });
        // });

        // 3. Checker Data
        result.data.checker.forEach((chk: any) => {
          timeline.push({
            type: 'Checker',
            date: chk.validatedon,
            title: `Checker: ${chk.departmentname} - ${chk.validationstatus}`,
            details: chk
          });
        });

        // 4. Project Manager
        timeline.push({
          type: 'Project Manager',
          date: result?.data["project manager"]?.validatedon,
          title: `Project Manager: ${result?.data["project manager"]?.validationstatus}`,
          details: result.data["project manager"]
        });

        // 5. CAD Admin
        timeline.push({
          type: 'CAD Admin',
          date: result?.data["cad Admin"]?.validatedon,
          title: `CAD Admin: ${result?.data["cad Admin"]?.validationstatus}`,
          details: result?.data["cad Admin"]
        });

        // Sort by date (optional)
        // timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        this.trackData = timeline;
        console.log('TrackData:', this.trackData);

      },
      error => {
        console.log('Error :', error);
      });
  }

  getReleaseAmountDetails() {
    if (this.cjpcType == 'Hold Release') {
      const url = 'contract/getHoldRelrequestDetailsById';
      let params = {
        "releasedId": this.ReleaseId
      };
      this.apiService.dataPost(url, params).subscribe(
        (response: any) => {
          // console.log('Response :', response);
          this.ReleaseAmountDetails = response?.data ? response?.data : []
        },
        error => {
          console.log('Error :', error);
        });
    }
  }

  async getContractDetails() {
    try {
      const response: any = await firstValueFrom(
        this.apiService.dataGet(`checker/getContractDetails?cjpcid=${this.CJPCID}`)
      );
      this.projectData = response?.data[0];
      this.ContractId = this.projectData?.contractid;
      this.contractNumber = this.projectData?.contractnumber;

      this.getBillDetails(this.contractNumber);

      let days_1 = moment(this.projectData?.ogCompletionDate).diff(this.currentDate, 'days');
      this.OriginalDate_clr = this.borderColorService.getClassName(days_1);
      if (days_1 <= -7) {
        this.blink_OriginalDate = true
      } else {
        this.blink_OriginalDate = false
      }

      let days_2 = moment(this.projectData.lastAmndCompletionDate).diff(this.currentDate, 'days');
      this.LastAmndDate_clr = this.borderColorService.getClassName(days_2);
      if (days_2 <= -7) {
        this.blink_LastAmndDate = true
      } else {
        this.blink_LastAmndDate = false
      }

      let days_3 = moment(this.projectData.contractactualcompletiondate).diff(this.currentDate, 'days');
      this.ActualComDate_clr = this.borderColorService.getClassName(days_3);
      if (days_3 <= -7) {
        this.blink_ActualComDate = true
      } else {
        this.blink_ActualComDate = false
      }

    } catch (error) {
      console.log('Error:', error);
    };
  }

  getClauseAndComplianceDetails() {
    this.apiService.dataGet(`checker/getClouseAndComplianceDetails?cjpcid=${this.CJPCID}`).subscribe(
      (response: any) => {
        console.log('Response :', response);
        this.clauseAndComplianceDetails = response?.data[0];
        this.clauses = this.clauseAndComplianceDetails?.clause;
        let result = this.clauseAndComplianceDetails?.compliance;
        // this.setDynamicValues(this.clauseAndComplianceDetails)
        // this.updateFormValues(this.contractDetails);
        this.compliances = result && result.map((item: any) => {
          let days_1 = moment(item.validityenddate).diff(this.currentDate, 'days')
          if (days_1 <= -7) {
            this.blink_ValidityEndDate = true
          } else {
            this.blink_ValidityEndDate = false
          }
          return {
            ...item,
            validation_clr: this.borderColorService.getClassName(days_1),
          }
        })
      },
      error => {
        // console.log('Error :', error);
        this.apiService.handleError(error);
      });
  }

  getBillDetails(contractNumber: string) {
    this.apiService.dataGet(`checker/getInvoiceBillDetails?cjpcid=${this.CJPCID}`).subscribe(
      (response: any) => {
        this.billingDetails = response?.data;

        this.invoiceTypeName = response?.data?.invoicetypename || '';
        this.invoicenumber = response?.data?.invoicenumber;
        this.invoiceId = response?.data?.billinvoiceid || '';

        this.getPaymentadmittedDetails(this.invoiceTypeName, this.invoiceId, contractNumber);
        this.AdvanceRecoveryCalculation(this.invoiceId, contractNumber);
        this.AdvanceRetentionCalculation(this.invoiceId, contractNumber);
        this.getInvoiceDocument(this.invoicenumber, this.projectData?.vendorcode, contractNumber);
        this.getRetentionReleaseDetails(contractNumber);

        if (this.invoiceTypeName == 'Final Bill') {
          this.getInvoiceDetailsSummary(contractNumber);
        }

        this.billDetails = [this.billingDetails].map((item: any) => {
          return {
            ...item,
            invoicePeriod: `${moment(item?.invoicefromdate).format('DD-MMM-YYYY')} To ${moment(item?.invoicetodate).format('DD-MMM-YYYY')}`,
            date: moment(item?.dated).format('DD-MMM-YYYY') || '',
            completeBillReceiptDate: moment(item?.completebillrectdate).format('DD-MMM-YYYY') || '',
            paymentDueDate: moment(item?.paymentdueDate).format('DD-MMM-YYYY') || '',
          }
        })
      },
      error => {
        console.log('Error :', error);
      });
  }

    getInvoiceDetailsSummary(contractNumber: string) {
    let url = 'contract/getInvoiceDetailsSummary'
    let passParams = {
      "contractNumber": contractNumber,
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        // console.log('response', res.data);
        let result = res.data || [];
        this.invoiceDetailsSummary = result.map((item: any) => {
          return {
            ...item,
            invoicePeriod: `${moment(item?.invoicefromdate).format('DD-MMM-YYYY')} To ${moment(item?.invoicetodate).format('DD-MMM-YYYY')}`,
            date: moment(item?.dated).format('DD-MMM-YYYY') || '',
            completeBillReceiptDate: moment(item?.completebillrectdate).format('DD-MMM-YYYY') || '',
            paymentDueDate: moment(item?.paymentdueDate).format('DD-MMM-YYYY') || '',
          }
        })
      }, error => {
        this.apiService.handleError(error)
      }
    )
  }

  getPaymentadmittedDetails(invoiceTypeName: string, invoiceId: string, contractNumber: string) {
    let url = 'checker/getcjpcPaymentDetails'
    let passParams = {
      "cjpcid": this.CJPCID,
      "billtype": this.cjpcType == 'Hold Release' ? 'Release' : invoiceTypeName,
      "invoiceId": invoiceId,
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        console.log('response', res.data, passParams);
        this.paymentDetails = res.data

      }, error => {
        this.apiService.handleError(error)
      }
    )

    let url1 = 'checker/paymentSummaryByContractNumber'
    let passParams1 = {
      "contractnumber": contractNumber,
      "cjpcId": this.CJPCID,
      "invoiceId": invoiceId,
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

  getRecoveriesList() {
    let url = 'checker/getrecoveryList'
    let params = {
      "cjpcid": this.CJPCID
    }
    this.apiService.dataPost(url, params).subscribe((data: any) => {
      this.RecoveriesList = data.data

    }, error => {
      this.apiService.handleError(error);
    }
    )
  }
  getListingOfHoldDetails() {
    this.apiService.dataGet(`checker/getListingOfHoldDetails?cjpcid=${this.CJPCID}`).subscribe(
      (response: any) => {
        // console.log('Response :', response);
        this.HoldDetails = response?.data ? response?.data.filter((item: any) => item.status == 'Created') : []
        this.ReleaseDetails = response?.data ? response?.data.filter((item: any) => item.status == 'Release') : []

      },
      error => {
        console.log('Error :', error);
      });
  }

  getStatusDetails() {
    let params = {
      cjpcid: this.CJPCID,
    };
    this.apiService.dataPost(`checker/getCjpcStatusByCjpcId`, params).subscribe(
      (response: any) => {
        // console.log('Response :', response);
        this.statusDetails = response?.data;

        // this.trackData = this.statusDetails.map((item: any) => {
        //   return {
        //     status: item.validationstatus,
        //     dept: item.entityname,
        //     desc: item.username,
        //   }
        // });

        this.isApproved = this.statusDetails.some(
          entry => entry.adid === this.apiService.getUserName() && entry.validationstatus === "Approved"
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
        // console.log('isDisable:', this.isDisable);

      },
      error => {
        this.apiService.handleError(error);
      });
  }

  closeRemarkModal() {
    this.remarkModal = false;
  }

  submitRemark() {
    let dvsId = 0;
    let cvsId = 0;

    if (this.roleName == 'Checker') {
      // dvsId = this.statusDetails && this.statusDetails.find((item: any) => item.validationstatusid == userId);
      dvsId = this.statusDetails && this.statusDetails.find(item => item.adid == this.apiService.getUserName())?.validationstatusid

    }

    if (this.roleName == 'Project Manager') {
      // cvsId = this.statusDetails && this.statusDetails.find((item: any) => item.validationstatusid == userId);
      cvsId = this.statusDetails && this.statusDetails.find((item: any) => item.adid == this.apiService.getUserName())?.validationstatusid;
    }

    if (this.roleName == 'CAD Admin') {
      // cvsId = this.statusDetails && this.statusDetails.find((item: any) => item.validationstatusid == userId);
      cvsId = this.statusDetails && this.statusDetails.find((item: any) => item.adid == this.apiService.getUserName())?.validationstatusid;
    }

    this.isLoader = true;
    let params = {
      "dvsId": dvsId,
      "cvsId": cvsId,
      "status": "Approved",
      "remarks": this.remark.trim(),
      "user": this.apiService.getUserName(),
    }
    this.apiService.dataPost(`contract/cjpcDepartmentManagerApproval`, params).subscribe(
      (response: any) => {
        // console.log('Response :', response);

        // this.router.navigate(['CAD/cjpc-list'], { queryParams: { wo: this.WONumber } });
        // window.history.back();
        this.remarkModal = false;
        this.remark = '';

        this.getStatusDetails();
        // this.getCheckListDocument()

        if (this.roleName != 'CAD Admin') {
          this.successPopup = true;
          this.popupMessage = 'Data submitted successfully';
          setTimeout(() => {
            this.successPopup = false;
          }, 2000);

        }

        if (this.roleName == 'CAD Admin') {
          this.savePaymentSummary();
          this.checklist() // Call the checklist function
        }
        this.isLoader = false;
      },
      error => {
        this.error_message = this.apiService.handleError(error);
        this.isLoader = false;
      });
  }

  checkedOrApproved() {
    this.remarkModal = true;
    this.remark = '';
  }

  goBack() {
    // this.router.navigate(['CAD/cjpc-list'], { queryParams: { wo: this.WONumber } });
    window.history.back();
  }
  openViewStatus() {
    this.showStatus = true
  }
  closeStatusDialog() {
    this.showStatus = false
  }
  generatePDF(callbackType: 'download' | 'file'): Promise<{ file?: File, fileName: string }> {
    this.isLoader = true;
    return new Promise((resolve, reject) => {
      const node = document.getElementById('page1');
      const pdf = new jsPDF("p", "mm", "a4");

      if (!node) return reject('Element not found');

      domtoimage.toJpeg(node, {
        quality: 1,
        width: node.scrollWidth * 2,
        height: node.scrollHeight * 2,
        style: {
          transform: "scale(2)",
          transformOrigin: "top left",
          paddingTop: '0px',
          paddingBottom: '0px',
        }
      }).then((imgData: any) => {
        const img1 = new Image();
        img1.src = imgData;
        img1.onload = () => {
          const imgWidth = 210;
          const imgHeight = (img1.height / img1.width) * imgWidth;
          const pageHeight = 297;
          let y = 0;

          let pageCount = Math.ceil(imgHeight / pageHeight);
          for (let i = 0; i < pageCount; i++) {
            if (i > 0) pdf.addPage();
            pdf.addImage(img1, "JPEG", 0, -y, imgWidth, imgHeight);
            y += pageHeight;
          }

          // ✍️ Add signature note on the last page
          pdf.setFontSize(5);
          pdf.setTextColor(100);
          const note = "Note: This is a computer generated document and it does not require a signature.";
          const dateTime = "Print Date & Time : " + moment().format('DD-MMM-YYYY HH:mm:ss');

          const marginLeft = 10;
          const marginBottom = 10;
          const textY = 297 - marginBottom;

          pdf.text(note + ' ' + dateTime, marginLeft, textY - 5); // 5mm above bottom
          // pdf.text(dateTime, marginLeft, textY); // Bottom line

          const fileName = "CJPC_" + this.CJPCID + ".pdf";

          if (callbackType === 'download') {
            pdf.save(fileName);
            resolve({ fileName });
          } else if (callbackType === 'file') {
            const blob = pdf.output('blob');
            const file = new File([blob], fileName, { type: 'application/pdf' });
            resolve({ file, fileName });
          }
        };
        this.isLoader = false;
      }).catch((err) => {
        console.error("PDF generation failed:", err);
        reject(err);
        this.isLoader = false;
      });
    });

  }
  downloadPDF(): void {
    this.generatePDF('download');

  }

  pdfdownload(): void {
    this.generatePDF('file');
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
    this.onViewDocument(this.invoicePDFDocuments[0]?.location);

  }
  getInvoiceDocument(invoicenumber: string, vendorCode: string, contractNumber: string) {
    let data = {
      "contratInvoiceRefNo": invoicenumber + '-' + vendorCode + '-' + contractNumber,
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
  getCheckListDocument() {
    let data = {
      "cjpcId": this.CJPCID,
    }
    const url = `contract/getChecklistFileBycjpcId`
    this.apiService.dataPost(url, data).subscribe(
      (response: any) => {
        this.checkListDocumentLocation = response.data[0]?.location
      },
      (error: any) => {
        this.apiService.handleError(error)
      }
    )
  }

  savePaymentSummary() {
    let url = 'checker/savecjpcPaymentDetails'
    let passParams = {
      "cjpcid": this.CJPCID,
      "billtype": this.cjpcType == 'Hold Release' ? 'Release' : this.invoiceTypeName,
      "contractnumber": this.contractNumber,
      "finalapproval": true, //true false,
      "invoiceId": this.invoiceId,
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        console.log('savePaymentSummary Response', res);
      }, error => {
        this.apiService.handleError(error)
      }
    )
  }

  async checklist() {
    this.isChecklistSent = true
    // await  this.generatePDF('blob');
    // let passParams = {
    //   "invoiceId": this.invoiceId,
    //   "status": "Accept",
    //   "remarks": "Send for Checklist",
    //   "user": this.apiService.getUserName(),
    //   "date": new Date()
    // }
    const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const { file, fileName } = await this.generatePDF('file');
    const formData = new FormData();
    formData.append('file', file!, fileName);
    formData.append('invoiceId', this.invoiceId);
    formData.append('status', 'Accept');
    formData.append('remarks', 'Send for Checklist');
    formData.append('cjpcId', this.CJPCID);
    formData.append('currencyCode', this.projectData.currencycode);
    formData.append('vendorCode', this.projectData.vendorcode);
    formData.append('date', currentDate);
    formData.append('user', this.apiService.getUserName());
    formData.append('cjpcType', this.cjpcType);

    this.apiService.dataPost(`contract/setCJPC`, formData).subscribe(
      (response: any) => {
        console.log('Response :', response);

        this.successPopup = true;
        this.popupMessage = 'Checklist sent successfully';
        setTimeout(() => {
          this.successPopup = false;
        }, 2000);

        this.isChecklistSent = false
        this.getCheckListDocument()


      },
      error => {
        console.log('Error :', error);

        this.isChecklistSent = false
        this.error_message = this.apiService.handleError(error);

        this.getStatusDetails();
      });
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
  ngOnDestroy() {
    localStorage.removeItem('cjpcStatus');
    localStorage.removeItem('cjpcType');
  }
  AdvanceRecoveryCalculation(invoiceId: string, contractNumber: string) {
    let url = 'contract/AdvanceRecoveryCal'
    let passParams = {
      "cjpcId": this.CJPCID,
      "contractNumber": contractNumber,
      "billId": invoiceId,
      "userName": this.apiService.getUserName()
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        console.log('response', res);

        this.advanceDetails = res

      }, error => {
        this.apiService.handleError(error)
      }
    )
  }

  AdvanceRetentionCalculation(invoiceId: string, contractNumber: string) {
    let url = 'contract/pbgretentionCal'
    let passParams = {
      "cjpcId": this.CJPCID,
      "contractNumber": contractNumber || "",
      "billId": invoiceId,
      "userName": this.apiService.getUserName()
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        // console.log('response', res);
        this.pbgAmountDetails = res
      }, error => {
        this.apiService.handleError(error)
      }
    )

    let url1 = 'contract/cpbgretentionCal'
    let passParams1 = {
      "cjpcId": this.CJPCID,
      "contractNumber": contractNumber || "",
      "billId": invoiceId,
      "userName": this.apiService.getUserName()
    }
    this.apiService.dataPost(url1, passParams1).subscribe(
      (res: any) => {
        // console.log('response', res);
        this.cpbgAmountDetails = res
      }, error => {
        this.apiService.handleError(error)
      }
    )
  }

  getRetentionReleaseDetails(contractNumber: string) {
    if (this.cjpcType == 'Retention Release') {
      const url = 'contract/findRetentionHistory';
      let params = {
        "contractNumber": contractNumber,
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

}
