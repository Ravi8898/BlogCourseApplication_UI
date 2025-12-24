import { Component } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Route } from '@angular/router';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';
import { BorderColorService } from 'src/app/common/services/border-color.service';

@Component({
  selector: 'app-contract-information',
  templateUrl: './contract-information.component.html',
  styleUrls: ['./contract-information.component.scss']
})
export class ContractInformationComponent {
  submitted: boolean = false;
  isLoader: boolean = false;
  currentDate = moment(new Date).format("YYYY-MM-DD");
  contractForm!: FormGroup;
  successPopup: boolean = false;
  popupMessage: string = '';
  contractId: string = '';
  borderColor: string = '';
  isExist: boolean = false;

  OriginalDate_clr: string = '';
  LastAmndDate_clr: string = '';
  ActualComDate_clr: string = '';
  blink_ActualComDate: boolean = false;
  blink_LastAmndDate: boolean = false;
  blink_OriginalDate: boolean = false;
  showAlert: boolean = false;
  poHeaderTexts: any[] = []
  str_poHeaderTexts: string = '';
  contractModal: boolean = false;
  WOAmount: any;
  dlpList: any[] = [
    { 'label': '1 Month', 'value': 1 },
    { 'label': '2 Month', 'value': 2 },
    { 'label': '3 Month', 'value': 3 },
    { 'label': '4 Month', 'value': 4 },
    { 'label': '5 Month', 'value': 5 },
    { 'label': '6 Month', 'value': 6 },
    { 'label': '7 Month', 'value': 7 },
    { 'label': '8 Month', 'value': 8 },
    { 'label': '9 Month', 'value': 9 },
    { 'label': '10 Month', 'value': 10 },
    { 'label': '11 Month', 'value': 11 },
    { 'label': '12 Month', 'value': 12 },
    { 'label': '13 Month', 'value': 13 },
    { 'label': '14 Month', 'value': 14 },
    { 'label': '15 Month', 'value': 15 },
    { 'label': '16 Month', 'value': 16 },
    { 'label': '17 Month', 'value': 17 },
    { 'label': '18 Month', 'value': 18 },
    { 'label': '19 Month', 'value': 19 },
    { 'label': '20 Month', 'value': 20 },
    { 'label': '21 Month', 'value': 21 },
    { 'label': '22 Month', 'value': 22 },
    { 'label': '23 Month', 'value': 23 },
    { 'label': '24 Month', 'value': 24 },
  ];
  plantCode:string = '';

  constructor(
    private fb: FormBuilder,
    private fs: FormService,
    private apiService: ApiService,
    private borderColorService: BorderColorService,
  ) {
    this.contractForm = this.fb.group({
      WONumber: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.maxLength(18),]],
      plant: [{ value: '', disabled: false }, [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s\W]*$/), Validators.maxLength(250),]],
      company: [{ value: '', disabled: false }, [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s\W]*$/), Validators.maxLength(250),]],
      vendorCode: [{ value: '', disabled: false }, [Validators.required, Validators.pattern(/^\d+$/), Validators.maxLength(18),]],
      vendorName: [{ value: '', disabled: false }, [Validators.required]],
      WBSNo: [{ value: '', disabled: false }, [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s\W]*$/), Validators.maxLength(250)]],
      projectName: [{ value: '', disabled: false }, [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s\W]*$/), Validators.maxLength(250)]],
      Package: [{ value: '', disabled: false }, [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s\W]*$/), Validators.maxLength(250)]],
      tds: [{ value: '', disabled: false }, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      contractStartDate: ['', Validators.required],
      value: [{ value: '', disabled: false }, [Validators.required, Validators.maxLength(18),]],
      currency: [{ value: '', disabled: false }, [Validators.required, Validators.maxLength(18)]],
      LastAmndDate: [{ value: '', disabled: false }],
      WOValue: [{ value: '', disabled: false }, [Validators.pattern(/^\d+$/), Validators.maxLength(18)]],
      ogCompletionDate: ['', Validators.required],
      lastAmndCompletionDate: [''],
      VendorGSTN: [{ value: '', disabled: false }, [Validators.required, Validators.pattern(/^[0-9A-Z]{15}$/)]],
      ClientGSTN: [{ value: '', disabled: false }, [Validators.required, Validators.pattern(/^[0-9A-Z]{15}$/)]],
      dlpDate: [''],
    })
  }

  ngOnInit() {
    this.getContractId();

    if (this.contractId != '') {
      this.getContractDetails();
    }

  }

  saveData() {
    // console.log(this.contractForm);

    this.submitted = true;
    if (this.contractForm.invalid) {
      return;
    }

    if (this.contractForm.value.LastAmndDate && (this.contractForm.value.WOValue == '' || this.contractForm.value.WOValue == null)) {
      this.contractForm.get('WOValue')?.setErrors({ required: true });
      return;
    }

    if (this.contractForm.value.LastAmndDate && (this.contractForm.value.lastAmndCompletionDate == '' || this.contractForm.value.lastAmndCompletionDate == null)) {
      this.contractForm.get('lastAmndCompletionDate')?.setErrors({ required: true });
      return;
    }

    this.isLoader = true;
    let formData = this.contractForm.value;
    const url = 'contract/addContract';
    const data = {
      "contractId": this.contractId ? this.contractId : 0,
      "contractNumber": formData.WONumber,
      "plantName": formData.plant,
      "plantCode": this.plantCode,
      "companyName": formData.company,
      "vendorCode": formData.vendorCode,
      "vendorName": formData.vendorName,
      "costCenter": formData.WBSNo,
      "wbsCcProjectName": formData.projectName,
      "contractPackage": formData.Package,
      "tds": formData.tds,
      "contractDate": formData.contractStartDate,
      "contractValue": formData.value,
      "currencyCode": formData.currency,
      "lastAmndDate": formData.LastAmndDate,
      "amendmentValue": formData.WOValue,
      "ogCompletionDate": formData.ogCompletionDate,
      "lastAmndCompletionDate": formData.lastAmndCompletionDate,
      "contractActualCompletionDate": '',
      "vendorGstn": formData.VendorGSTN,
      "clientGstn": formData.ClientGSTN,
      "loginUser": this.apiService.getUserName(),
      "dlpDate": formData.dlpDate,
      "poHeaderTexts": this.str_poHeaderTexts,
    }

    this.apiService.dataPost(url, data).subscribe((res: any) => {
      this.isLoader = false;
      // console.log('res', res);
      this.popupMessage = this.contractId ? 'Data Updated Successfully' : 'Data Saved Successfully'
      this.setContractId(res?.contractid);

      this.successPopup = true;
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);

    }, (err) => {
      this.isLoader = false;
      console.log('err', err);
    });
  }

  isExistContract() {
    let contractId = this.contractForm.value.WONumber;
    const url = 'contract/isExistContract';
    const data = {
      "poNumber": contractId
    }
    this.apiService.dataPost(url, data).subscribe((res: any) => {
      console.log('res', res?.isExist);
      this.isExist = res?.isExist;
      if (this.isExist) {
        this.showAlert = true;
        this.popupMessage = 'Contract number already exists.\n If you want to proceed with this contract number, press Yes; otherwise, press No.';
      } else {
        this.getContractInfo_SAP();
      }
    }, (err) => {
      this.apiService.handleError(err);
    });
  }

  handleResponse(event: boolean) {
    this.showAlert = false;
    if (event) {
      this.getContractInfo_SAP();
    } else {
      this.contractForm.reset();
    }
  }

  setContractId(value: string) {
    localStorage.setItem('contractId', value);
    this.contractId = value;
  }

  getContractInfo_SAP() {
    // const dummyData = {
    //   "plantName": "Mumbai",
    //   "plantCode": "MUM01",
    //   "companyName": "Adani Cement",
    //   "vendorCode": "0910000051",
    //   "vendorName": "SUJAL LOGISTTICS PVT LTD",
    //   "costCenter": "CC100",
    //   "wbsCcProjectName": "Project A",
    //   "contractPackage": "Package A",
    //   "tds": "10",
    //   "contractDate": "2024-02-01",
    //   "contractValue": 5000000.750,
    //   "currencyCode": "INR",
    //   "amendmentDate": "2026-12-31",
    //   "amendmentValue": 1500000.500,
    //   "amendmentCompletionDate": "2026-11-30",
    //   "contractCompletionDate": "2026-10-30",
    //   "contractActualCompletionDate": "2024-12-31",
    //   "vendorGstn": "07DDIPA9391G1ZC",
    //   "clientGstn": "07DDIPA9391G1ZC",
    //   "loginUser": "admin_user"
    // }

    let passParams = {
      "poNumber": this.contractForm.value.WONumber
    }
    this.apiService.dataPost('contract/getWODetails', passParams).subscribe((res: any) => {
      this.str_poHeaderTexts = res?.data?.poHeaderTexts
      this.poHeaderTexts = res?.data?.poHeaderTexts && Object.entries(res?.data?.poHeaderTexts).map(([title, details]: [string, any]) => ({
        title,
        textLine: details.textLine,
        poNumber: details.poNumber
      }));
      // console.log('res', this.poHeaderTexts);

      let data = res.data;

      this.contractForm.patchValue({
        plant: data.plantName || data?.plantCode,
        company: data.companyCode,
        vendorCode: data.vendorCode,
        vendorName: data.vendorName,
        WBSNo: data.wbsNumber || data.costCenter,
        projectName: data.projectName,
        Package: data.packageName,
        tds: data.tds,
        contractStartDate: moment(data?.documentDate).format("YYYY-MM-DD"),
        value: data.value2,
        currency: data.currency,
        LastAmndDate: '',
        WOValue: '',
        ogCompletionDate: '',
        lastAmndCompletionDate: '',
        VendorGSTN: data.vendorGSTN,
        ClientGSTN: data.clientGSTN,
      })
      this.plantCode = data?.plantCode;
    }, error => {
      this.apiService.handleError(error);
    });

  }

  cancelData() {
    this.contractForm.reset();
    this.contractId = '';
    this.submitted = false;
  }

  getContractDetails() {
    const url = 'contract/getContractDetails';
    const data = {
      "contractid": this.contractId
    }
    this.apiService.dataPost(url, data).subscribe((response: any) => {
      // console.log(response.data[0]);

      let value = response.data[0];
      this.contractForm.patchValue({
        WONumber: value.contractnumber,
        plant: value.plantname,
        company: value.companyname,
        vendorCode: value.vendorcode,
        vendorName: value.vendorname,
        WBSNo: value.costcenter,
        projectName: value.wbsccprojectname,
        Package: value.contractpackage,
        tds: value.tds,
        contractStartDate: value.contractdate,
        value: value.contractvalue,
        currency: value.currencycode,
        LastAmndDate: value.LastAmndDate,
        WOValue: value.amendmentvalue,
        ogCompletionDate: value.ogCompletionDate,
        lastAmndCompletionDate: value.lastAmndCompletionDate,
        VendorGSTN: value.vendorgstn,
        ClientGSTN: value.clientgstn,
        dlpDate: value.dlpdate,
      })
      this.WOAmount = value.amendmentvalue;
      this.plantCode = value?.plantcode;

      // let result = response.data[0].poHeaderTexts;
      // // console.log('result', result);
      // this.poHeaderTexts = JSON.parse(result);
      // this.poHeaderTexts = this.poHeaderTexts && Object.entries(result).map(([title, details]: [string, any]) => ({
      //   title,
      //   textLine: details.textLine,
      //   poNumber: details.poNumber
      // }));

      // this.days = moment(this.contractForm.value.LastAmndDate).diff(this.currentDate, 'days');
      // console.log('days', this.days);

      let days_1 = moment(this.contractForm.value.ogCompletionDate).diff(this.currentDate, 'days');
      this.OriginalDate_clr = this.borderColorService.getColor(days_1);
      if (days_1 <= -7) {
        this.blink_OriginalDate = true
      } else {
        this.blink_OriginalDate = false
      }

      //Date Of Last LastAmndDate.
      let days_2 = moment(this.contractForm.value.LastAmndDate).diff(this.currentDate, 'days');
      this.LastAmndDate_clr = this.borderColorService.getColor(days_2);
      if (days_2 <= -7) {
        this.blink_LastAmndDate = true
      } else {
        this.blink_LastAmndDate = false
      }

      let days_3 = moment(this.contractForm.value.lastAmndCompletionDate).diff(this.currentDate, 'days');
      this.ActualComDate_clr = this.borderColorService.getColor(days_3);
      if (days_3 <= -7) {
        this.blink_ActualComDate = true
      } else {
        this.blink_ActualComDate = false
      }

      console.log('day_1', days_1, 'day_2', days_2, 'day_3', days_3);


    });
  }

  getContractId(): string {
    this.contractId = localStorage.getItem('contractId') || '';
    return this.contractId;
  }

  onChangeDLP(value: string) {

    let lastAmndCompletionDate = this.contractForm.controls['lastAmndCompletionDate'].value;
    let ogCompletionDate = this.contractForm.controls['ogCompletionDate'].value;

    if (lastAmndCompletionDate) {
      this.contractForm.controls['dlpDate'].setValue(moment(lastAmndCompletionDate).add(value, 'months').format('YYYY-MM-DD'));
    } else {
      this.contractForm.controls['dlpDate'].setValue(moment(ogCompletionDate).add(value, 'months').format('YYYY-MM-DD'));
    }
  }

}
