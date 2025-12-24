import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';

function readBase64(file: any): Promise<any> {
  var reader = new FileReader();
  var future = new Promise((resolve, reject) => {
    reader.addEventListener("load", function () {
      resolve(reader.result);
    }, false);

    reader.addEventListener("error", function (event) {
      reject(event);
    }, false);

    reader.readAsDataURL(file);
  });
  return future;
}

const URL = '/api/';

@Component({
  selector: 'app-cad-admin-home',
  templateUrl: './cad-admin-home.component.html',
  styleUrls: ['./cad-admin-home.component.scss']
})
export class CadAdminHomeComponent {

  purchaseSearchObject: any[] = [];
  url: string = '';
  data_cjpc: any[] = [];
  data_invoice: any[] = [];
  data_release: any[] = [];
  data_release_cjpc: any[] = [];

  successToast: boolean = false;
  errorToast: boolean = false;
  toastMsg: string = '';

  isLoader: boolean = false;

  role: string | null = ''
  username: string | null = ''
  searchModal: string = ''
  loginType: any = '';
  roleName: any = ''
  purchaseListAPI: any = [];
  purchaseList: any = [];
  userdata: any = {};
  modalName = '';

  columns_cjpc: any[] = []
  columns_invoice: any[] = []
  columns_release: any[] = []
  activeTab: any = "tab1";
  showReleaseModal: boolean = false;
  holdReleaseId: string = '';
  holdFor: string = '';
  Department: string = '';
  holdReleaseAmount: string = '';
  columns_document: any[] = [];
  releaseDocumentList: any[] = [];
  bash64String: string = '';
  docViewModelOpen: boolean = false;
  errorMessage: string = '';
  holdReleaseRemark: string = '';
  holdId: string = '';
  columns_retention: any[] = [];
  data_retention: any[] = [];
  retentionReleaseModal: boolean = false;
  retentionId: number = 0;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private commonService: CommonService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.userdata = JSON.parse(localStorage.getItem('userdata') || '{}');
    this.breadcrumbService.setBreadcrumbUrl();

    this.role = localStorage.getItem('role');
    this.username = localStorage.getItem('username');
    this.loginType = localStorage.getItem('logintype');
    this.roleName = localStorage.getItem('roleName')

    this.searchModal = this.loginType;
  }

  ngOnInit() {
    this.columns_cjpc = [
      { name: 'CJPC Date', hide_col: false, isFilter: false, },
      { name: 'CJPC Id', hide_col: false, isFilter: false, },
      { name: 'Project Name and Location', hide_col: false, isFilter: true },
      { name: 'Project Code', hide_col: true, isFilter: false },
      { name: 'Bill Type', hide_col: false, isFilter: true },
      { name: 'Package', hide_col: false, isFilter: false },
      { name: 'Contractors Name', hide_col: false, isFilter: true },
      { name: 'Vendor Code', hide_col: false, isFilter: true },
      { name: 'Amount', hide_col: false, isFilter: false },
      { name: 'Status', hide_col: false, isFilter: false },
      { name: 'CJPC Type', hide_col: false, isFilter: true },
      { name: 'View Details', hide_col: false, isFilter: false },
      { name: 'holdreleaserequestid', hide_col: true, isFilter: false },
      { name: 'Retention Type', hide_col: true, isFilter: false },
    ];

    this.columns_invoice = [
      { name: 'WO No.', hide_col: false, isFilter: false },
      { name: 'Bill Type', hide_col: false, isFilter: true, col_expand: 'out', color: '#0B74B009' },
      { name: 'RA Bill No.', hide_col: false, isFilter: true, groupOf: 'Bill Type', color: '#0B74B009' },
      { name: 'RA Bill Date', hide_col: false, isFilter: false, groupOf: 'Bill Type', color: '#0B74B009' },
      { name: 'Vendor', hide_col: false, isFilter: true, col_expand: 'in', color: '#9e9e9e1a' },
      { name: 'Invoice No.', hide_col: true, isFilter: false, groupOf: 'Vendor', color: '#9e9e9e1a' },
      { name: 'Invoice Date', hide_col: true, isFilter: false, groupOf: 'Vendor', color: '#9e9e9e1a' },
      { name: 'Received On', hide_col: false, isFilter: false, col_expand: 'in', color: '#0B74B009' },
      { name: 'Period', hide_col: true, isFilter: false, groupOf: 'Received On', color: '#0B74B009' },
      // { name: 'SES No.', hide_col: true, isFilter: true, groupOf: 'Received On', color: '#0B74B009' },
      // { name: 'Invoice Rec. In CAD - HD', hide_col: true, isFilter: false, groupOf: 'Received On', color: '#0B74B009' },
      { name: 'Bill Process Date', hide_col: false, isFilter: false, col_expand: 'in', color: '#9e9e9e1a' },
      { name: 'No of Days', hide_col: true, isFilter: false, groupOf: 'Bill Process Date', color: '#9e9e9e1a' },
      { name: 'Status', hide_col: false, isFilter: false },
      { name: 'History', hide_col: true, isFilter: false },
      { name: 'Action', hide_col: false, isFilter: false, value: ['forward'], view: 'edit' },
    ]

    this.columns_release = [
      { name: 'Release No.', hide_col: true, isFilter: false },
      { name: 'Release ID', hide_col: false, isFilter: false },
      { name: 'WO No.', hide_col: false, isFilter: true },
      { name: 'Bill Type', hide_col: false, isFilter: true, col_expand: 'in', color: '#0B74B009' },
      { name: 'RA Bill No.', hide_col: true, isFilter: true, groupOf: 'Bill Type', color: '#0B74B009' },
      { name: 'RA Bill Date', hide_col: true, isFilter: false, groupOf: 'Bill Type', color: '#0B74B009' },
      { name: 'Vendor', hide_col: false, isFilter: true, col_expand: 'in', color: '#9e9e9e1a' },
      { name: 'Invoice No.', hide_col: true, isFilter: false, groupOf: 'Vendor', color: '#9e9e9e1a' },
      { name: 'Invoice Date', hide_col: true, isFilter: false, groupOf: 'Vendor', color: '#9e9e9e1a' },
      { name: 'Received On', hide_col: false, isFilter: false, col_expand: 'in', color: '#0B74B009' },
      { name: 'Period', hide_col: true, isFilter: false, groupOf: 'Received On', color: '#0B74B009' },
      { name: 'SES No.', hide_col: true, isFilter: false, groupOf: 'Received On', color: '#0B74B009' },
      { name: 'Invoice Rec. In CAD - HD', hide_col: true, isFilter: false, groupOf: 'Received On', color: '#0B74B009' },
      { name: 'Bill Process Date', hide_col: false, isFilter: false, col_expand: 'in', color: '#9e9e9e1a' },
      { name: 'No of Days', hide_col: true, isFilter: false, groupOf: 'Bill Process Date', color: '#9e9e9e1a' },
      { name: 'Release Hold Request', hide_col: false, isFilter: false },
    ]

    this.columns_document = [
      { header: 'Sr.', field: 'sr', },
      { header: 'Document', field: 'document', },
      { header: 'Action', field: '', value: ['eye'] },
    ]

    this.columns_retention = [
      { name: 'Entry Date', hide_col: false, isFilter: false },
      { name: 'Work Order Number', hide_col: false, isFilter: true },
      { name: 'Vendor Code', hide_col: false, isFilter: true },
      { name: 'Vendor Name', hide_col: false, isFilter: true },
      { name: 'Retention Amount', hide_col: false, isFilter: false },
      { name: 'Retention Release / SCC', hide_col: false, isFilter: false },
      { name: 'Retention For', hide_col: false, isFilter: false },
      { name: 'Status', hide_col: false, isFilter: false },
      { name: 'contractreleasedetailsid', hide_col: true, isFilter: false },
    ];

    this.successToast = false;
    this.errorToast = false;
    this.toastMsg = '';
    this.getCadData();
  }

  getCadData() {

    this.isLoader = true
    const url = 'contract/getPendingCJPCList'
    let passParam = {
      "fetchType": this.apiService.getRoleName(),
      "adID": this.apiService.getUserName()
    }
    this.apiService.dataPost(url, passParam).subscribe(
      (res: any) => {
        this.data_cjpc = res.data && res.data.map((key: any) => {
          let cjpcType = ''
          if (key.fkholdreleaserequestid) {
            cjpcType = 'Hold Release'
          } else if (key.fkretentionreleaseid) {
            cjpcType = 'Retention Release'
          } else if (key.invoicetypename == 'DPR') {
            cjpcType = 'DPR'
          } else {
            cjpcType = 'Invoice'
          }
          return {
            'CJPC Date': moment(key.createddate).format('DD-MMM-YYYY'),
            'CJPC Id': key.cjpcid,
            'Project Name and Location': key.projectname,
            'Project Code': key.projectcode,
            'Bill Type': key.invoicetypename,
            'Package': key.contractpackage,
            'Contractors Name': key.customername,
            'Vendor Code': key.vendorcode,
            'Amount': key.netpayableamount,
            'Status': key.status,
            'CJPC Type': cjpcType, //key.fkholdreleaserequestid ? 'Hold Release' : 'Invoice',
            'holdreleaserequestid': key.fkholdreleaserequestid,
            'View Details': '',
            'Retention Type': key.retentionreleasefor,
            // 'retentionreleseId': key.retentionreleseId,
            // 'retentionrelese': key.retentionrelese
          }
        })
        this.isLoader = false;
      },
      error => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    )

    this.isLoader = true
    const url1 = 'contract/getPendingInvoiceList'
    let data = {
      "adID": this.apiService.getUserName()
    }
    if (this.roleName != 'Checker') {
      this.apiService.dataPost(url1, data).subscribe(
        (res: any) => {
          this.data_invoice = res.data.filter((item: any) => item.status === 'Pending')
          this.data_invoice = this.data_invoice && this.data_invoice.map((key: any) => {
            return {
              'WO No.': key.contractnumber,
              'Bill Type': key.invoicetypename,
              'RA Bill No.': key.invoicenumber,
              'RA Bill Date': moment(key.invoicedate).format('DD-MMM-YYYY'),
              'Vendor': key.vendorname,
              'Invoice No.': key.invoicenumber,
              'Invoice Date': moment(key.invoicedate).format('DD-MMM-YYYY'),
              'Received On': moment(key.invoicereceiveddate).format('DD-MMM-YYYY'),
              'Period': 'From ' + moment(key.invoicefromdate).format('DD-MMM-YYYY') + ' To ' + moment(key.invoicetodate).format('DD-MMM-YYYY'),
              'SES No.': key.sesnumber,
              'Invoice Rec. In CAD - HD': '-',
              'Bill Process Date': moment(key.invoiceprocessdate).format('DD-MMM-YYYY'),
              'No of Days': key?.days,
              'Status': key?.status,
              'History': '',
              'invoiceid': key.billinvoiceid
            }
          })
          this.isLoader = false;
        },
        error => {
          this.apiService.handleError(error);
          this.isLoader = false;
        }
      )
    }


    this.isLoader = true
    const url2 = 'contract/getPendingHoldRelrequestList'
    let passParam1 = {
      "adID": this.apiService.getUserName()
    }
    if (this.roleName != 'Checker') {
      this.apiService.dataPost(url2, passParam1).subscribe(
        (res: any) => {
          this.data_release = res?.data && res?.data.map((key: any) => {
            return {
              'Release No.': key.runningaccbillno,
              'Release ID': key.holdreleaserequestid,
              'WO No.': key.contractnumber,
              'Bill Type': key.invoicetypename,
              'RA Bill No.': key.invoicenumber,
              'RA Bill Date': moment(key.runningaccbilldt).format('DD-MMM-YYYY'),
              'Vendor': key.vendorname,
              'Invoice No.': key.invoicenumber,
              'Invoice Date': moment(key.invoicedate).format('DD-MMM-YYYY'),
              'Received On': moment(key.invoicereceiveddate).format('DD-MMM-YYYY'),
              'Period': 'From ' + moment(key.invoicefromdate).format('DD-MMM-YYYY') + ' To ' + moment(key.invoicetodate).format('DD-MMM-YYYY'),
              'SES No.': key.sesnumber,
              'Invoice Rec. In CAD - HD': '-',
              'Bill Process Date': moment(key.invoiceprocessdate).format('DD-MMM-YYYY'),
              'Release Hold Request': '',
            }
          })
          this.isLoader = false;
        },
        error => {
          this.apiService.handleError(error);
          this.isLoader = false;
        }
      )
    }

    this.isLoader = true
    let data1 = {
      "userName": this.apiService.getUserName()
    }
    this.apiService.dataPost('contract/retentionReleaseList', data1).subscribe(
      (response: any) => {
        // console.log('Retention Release Response :', response);
        let result = response.data && response.data.map((item: any) => {
          return {
            'Entry Date': moment(item.createddate).format('DD-MMM-YYYY'),
            'Work Order Number': item.contractnumber,
            'Vendor Code': item.vendorcode,
            'Vendor Name': item.vendorname,
            'Retention Amount': item.totalretentionamount,
            'Retention For': item.retentionreleasefor,
            'Status': item.status,
            'contractreleasedetailsid': item.contractreleasedetailsid,

          }
        })
        this.data_retention = result;
      },
      error => {
        console.log('Error :', error);
      });
  }



  setVendorFilterField() {
    this.purchaseSearchObject = [
      {
        forLabel: "Reference ID",
        forContrl: "referenceId",
        forPlace: "Enter Reference ID"
      },
      {
        forLabel: "Invoice Number",
        forContrl: "invoiceNumber",
        forPlace: "Enter Invoice Number"
      },
      {
        forLabel: "Invoice Date",
        forContrl: "invoiceDate",
        forPlace: "Enter PO Number"
      },
      {
        forLabel: "Invoice Amount",
        forContrl: "invoiceAmount",
        forPlace: "Enter Invoice Amount"
      },
      {
        forLabel: "PO Number",
        forContrl: "poNumber",
        forPlace: "Enter PO Number"
      },
      {
        forLabel: "Status",
        forContrl: "status",
        forPlace: "Choose"
      },
    ]
  }

  getStatus(value: string): string {
    let status = ''
    if (value == '1') {
      status = 'Created'
    } else if (value == '2') {
      status = 'Department Review'
    } else if (value == '3') {
      status = 'Project Manager'
    } else if (value == '4') {
      status = 'CAD Admin'
    } else if (value == '5') {
      status = 'Payment completed'
    }
    return status;
  }

  navigateToPurchase() {
    this.commonService.viewPurchase = false;
    this.commonService.routeToPage('./dashboard/material-invoice');
  }

  closeModal(modalName: string) {
    const modal = document.getElementById(modalName);
    if (modal) {
      modal.style.display = 'none';
      modal?.classList.remove('show');
      modal?.setAttribute('aria-hidden', 'true');
      modal?.removeAttribute('aria-modal');
      modal?.removeAttribute('role');
    }

    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.parentNode?.removeChild(backdrop);
    }

    const backdrop0 = document.querySelector('.modal-backdrop');
    if (backdrop0) {
      backdrop0.parentNode?.removeChild(backdrop0);
    }

    document.body.className = '';
    document.body.removeAttribute('style');
    document.body.removeAttribute('data-bs-overflow');
    document.body.removeAttribute('data-bs-padding-right');

    setTimeout(() => {
      this.successToast = false;
    }, 2000)
  }

  applyPurchaseSearch(event: any) {

  }

  activateTab(tab: string): void {
    this.activeTab = tab;
    this.getCadData();
  }
  handleIconClick(columnName: string, rowData: any) {
    console.log(`Clicked on ${columnName}:`, rowData);
    // alert(`You clicked on "${columnName}" for ${rowData['Status']}`);
    if (columnName === 'Action') {
      // console.log('action column')
      this.router.navigate(['CAD/invoice/purchase-order'], { state: { invoiceid: rowData['invoiceid'] } })
    }
    if (columnName === 'Release Hold Request') {
      this.showReleaseModal = true;
      // You can pass the rowData to the modal if needed
      // console.log('Release Hold Request clicked for:', rowData);

      let url = 'contract/getHoldRelrequestDetails'
      let passParam = { releasedId: rowData['Release ID'] }
      this.apiService.dataPost(url, passParam).subscribe(
        (response: any) => {

          this.holdId = response.data[0]?.holdid;
          this.holdReleaseId = response.data[0]?.holdreleaserequestid;
          this.holdFor = response.data[0]?.holdtypename;
          this.Department = response.data[0]?.departmentname || '-';
          this.holdReleaseAmount = response.data[0]?.relaeaseamount;
          this.releaseDocumentList = response.data && response.data.map((item: any, index: number) => {
            return {
              sr: index + 1,
              document: item.doctypename,
              attachments: item.location
            }
          });

        }
        ,
        (error: any) => {
          this.apiService.handleError('Error fetching hold release details');
        }
      );
    }

    if (columnName == 'Retention Release / SCC') {
      this.retentionReleaseModal = true;
      this.retentionId = rowData['contractreleasedetailsid'];
    }
  }
  closeReleaseModal() {
    this.showReleaseModal = false;
  }

  documentView(value: any) {
    console.log('value', value);
    this.onViewDocument(value.attachments);

  }

  onViewDocument(value: any) {
    // console.log('value', value);
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

  approveReleaseHold(value: string = '') {
    if (this.holdReleaseRemark.trim() === '') {
      this.errorMessage = 'Please enter a remark for hold release.';
      return;
    }

    this.isLoader = true;
    const url = 'checker/approveNRejectRelreq';
    const passParam = {
      "holdrelId": this.holdReleaseId,
      "holdId": this.holdId,
      "status": value, // Requested, Approved, Rejected, Released
      "releaseamount": this.holdReleaseAmount,
      "remark": this.holdReleaseRemark,
      "loginuser": this.apiService.getUserName(),
    }

    this.apiService.dataPost(url, passParam).subscribe(
      (res: any) => {
        this.isLoader = false;
        this.successToast = true;
        this.toastMsg = 'Hold release request approved successfully.';
        this.closeReleaseModal();
        this.getCadData();
        this.errorMessage = '';
        setTimeout(() => {
          this.successToast = false;
        }, 2000);
        this.holdReleaseRemark = ''; // Clear the remark field after successful approval

      },
      error => {
        this.apiService.handleError(error);
        this.isLoader = false;
        this.errorMessage = 'An error occurred while approving hold release request.';
      }
    );
  }

  closeRetentionModal($event: any) {
    this.retentionReleaseModal = false;
    this.getCadData()
  }
}
