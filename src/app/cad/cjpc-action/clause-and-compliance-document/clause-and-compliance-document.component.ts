import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { BorderColorService } from 'src/app/common/services/border-color.service';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-clause-and-compliance-document',
  templateUrl: './clause-and-compliance-document.component.html',
  styleUrls: ['./clause-and-compliance-document.component.scss']
})
export class ClauseAndComplianceDocumentComponent {
  form!: FormGroup;
  clauseAndComplianceDetails: any;
  CJPCID: string = '';
  clauses: any[] = [];
  compliances: any[] = [];
  currentDate: any = moment().format('YYYY-MM-DD');

  constructor(
    private breadcrumbService: BreadcrumbService,
    private fb: FormBuilder,
    private fs: FormService,
    private apiService: ApiService,
    private activeRoute: ActivatedRoute,
    private borderColorService: BorderColorService
  ) {
    // this.breadcrumbService.setBreadcrumbUrl();
    console.log('currentDate', this.currentDate);

    this.CJPCID = this.activeRoute.snapshot.queryParamMap.get('id') || '';
  }
  ngOnInit() {

    this.getClauseAndComplianceDetails();
    // const jsonData = [
    //   {
    //     "cjpcid": 1,
    //     "contractid": 1,
    //     "maxpercent": 10.000,
    //     "percent": 1.000,
    //     "duration": 7,
    //     "compliance": [
    //       {
    //         "complianceTypeName": "CAR Policy",
    //         "value": 0.000,
    //         "validityStartDate": "2025-03-03T00:00:00",
    //         "validityEndDate": "2026-03-04T00:00:00"
    //       },
    //       {
    //         "complianceTypeName": "PF Certificate",
    //         "value": 0.000,
    //         "validityStartDate": "2025-03-03T00:00:00",
    //         "validityEndDate": "2026-03-03T00:00:00"
    //       },
    //       {
    //         "complianceTypeName": "Labour License",
    //         "value": 0.000,
    //         "validityStartDate": "2025-03-03T00:00:00",
    //         "validityEndDate": "2026-03-04T00:00:00"
    //       }
    //     ]
    //   }
    // ];

    // this.createForm();
    // this.setDynamicValues(jsonData)

  }
  // createForm() {
  //   this.form = this.fb.group({
  //     perWeek: [{ value: '', disabled: true }, Validators.required],
  //     max: [{ value: '', disabled: true }, Validators.required],
  //     carPolicyValue: [{ value: '', disabled: true }, Validators.required],
  //     carPolicyValidityStart: [{ value: '', disabled: true }, Validators.required],
  //     carPolicyValidityEnd: [{ value: '', disabled: true }, Validators.required],
  //     carPolicyExtendedValidityEnd: [{ value: '', disabled: true }],
  //     wcPolicyValue: [{ value: '', disabled: true }, Validators.required],
  //     wcPolicyValidityStart: [{ value: '', disabled: true }, Validators.required],
  //     wcPolicyValidityEnd: [{ value: '', disabled: true }, Validators.required],
  //     labourLicenseNumber: [{ value: '', disabled: true }, Validators.required],
  //     labourLicenseValidityStart: [{ value: '', disabled: true }],
  //     labourLicenseValidityEnd: [{ value: '', disabled: true }],
  //     pfCertificate: [{ value: '', disabled: true }, Validators.required],
  //     pfValidityEnd: [{ value: '', disabled: true }],
  //     esicCertificate: [{ value: '', disabled: true }, Validators.required],
  //     esicValidityEnd: [{ value: '', disabled: true }]
  //   });
  // }
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
          return {
            ...item,
            validation_clr: this.borderColorService.getColor(moment(item.validityenddate).diff(this.currentDate, 'days')),
          }
        })
      },
      error => {
        // console.log('Error :', error);
        this.apiService.handleError(error);
      });
  }

  // setDynamicValues(data: any): void {
  //   const maxPercent = `${data[0].maxpercent}% of contract price`;
  //   const perWeek = `${data[0].percent}% Per Week`;
  //   const carPolicy = data[0].compliance.find((c: any) => c.complianceTypeName === "CAR Policy");
  //   const labourLicense = data[0].compliance.find((c: any) => c.complianceTypeName === "Labour License");
  //   const pfCertificate = data[0].compliance.find((c: any) => c.complianceTypeName === "PF Certificate");

  //   this.form.patchValue({
  //     perWeek: perWeek,
  //     max: maxPercent,
  //     carPolicyValue: carPolicy ? carPolicy.value.toFixed(2) : 'N/A',
  //     carPolicyValidityStart: carPolicy ? carPolicy.validityStartDate.split('T')[0] : '',
  //     carPolicyValidityEnd: carPolicy ? carPolicy.validityEndDate.split('T')[0] : '',
  //     labourLicenseNumber: labourLicense ? labourLicense.value.toFixed(2) : 'N/A',
  //     labourLicenseValidityStart: labourLicense ? labourLicense.validityStartDate.split('T')[0] : '',
  //     labourLicenseValidityEnd: labourLicense ? labourLicense.validityEndDate.split('T')[0] : '',
  //     pfCertificate: pfCertificate ? pfCertificate.value.toFixed(2) : 'N/A',
  //     pfValidityEnd: pfCertificate ? pfCertificate.validityEndDate.split('T')[0] : ''
  //   });
  // }
}
