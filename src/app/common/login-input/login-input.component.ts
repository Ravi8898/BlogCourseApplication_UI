import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OTP_TIMER } from 'src/app/providers/constants';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login-input',
  templateUrl: './login-input.component.html',
  styleUrls: ['./login-input.component.scss']
})
export class LoginInputComponent {


  loginForm!: FormGroup;
  loginUserForm!: FormGroup;
  isProduction: boolean = false;
  divisonList: any[] = ['Cement', 'AEML', 'APSEZ']
  production: boolean = environment.production
  activeTab = 'tab1';
  errMsg = '';
  isLoader = false;
  isShown = true;
  otpErr = '';

  otpForm: any;
  otpUsername = false;
  siteLoginForm: any;
  showOTPField = false;
  vendorLoginForm: any;

  appName: string = '';
  loginErr: string = '';

  hideTimer: boolean = false;
  timeLeft: number = OTP_TIMER;
  otpCode: any = '';
  interval: any;
  toastMsg: any = '';
  errorToast: any = false;
  successToast: any = false;
  loginErrorMsg = '';

  namdId: string = ''
  vendorArr: any = [];

  constructor(
    private commonService: CommonService,
    private activeRoute: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.siteLoginForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      password: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      // division: new FormControl('Cement', Validators.required)
    })

    this.vendorLoginForm = new FormGroup({
      username: new FormControl('', [Validators.required, this.customTokenValidator]),
      vendor_number: new FormControl('', [Validators.required]),
      division: new FormControl('Cement', Validators.required),
      otp: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(6)])
    });
    this.vendorLoginForm.controls.vendor_number.disable();

    this.otpForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
    })

    this.namdId = this.activeRoute.snapshot.queryParamMap.get('user')!;
    this.checkSAMLLogin()
  }

  checkSAMLLogin() {

    // console.log('this.namdId', this.namdId);


    if (this.namdId != '' && this.namdId != null) {

      // this.commonService.spinner.show();
      const username = this.namdId.split('@')[0];

      this.http.get<{ nameID: string }>('https://vspeed.adani.com/saml/user')
        .subscribe(
          (response: any) => {
            // Access the nameID from the response
            const nameID = response.nameID;
            console.log('Extracted nameID:', nameID.split('@')[0].toLowerCase());

            if (nameID.split('@')[0].toLowerCase() != username.toLocaleLowerCase()) {
              // this.commonService.spinner.hide();
              this.errMsg = 'Unauthorized user!'
              return;
            }

            let passParam = {
              "adid": username,
              "role": "SiteController"
            }
            this.commonService.samlauth(passParam, '/micosoftLogin').subscribe(
              res => {
                console.log('response', res?.data);
                if (res && res['status'] == 'Success') {
                  localStorage.clear();
                  localStorage.setItem('username', res['data']['username']);
                  localStorage.setItem('token', res['token']);
                  localStorage.setItem('logintype', 'sitecontroller');
                  localStorage.removeItem("columnCheckStock");
                  localStorage.removeItem("columnSettingStock");
                  const roleName = res['data']['roleName'] || '';
                  const roleArray = roleName.split(',');
                  localStorage.setItem('roleName', roleName);
                  if (res['data']['adminAccess'] == true) {
                    localStorage.setItem('adminAccess', res['data']['adminAccess']);
                    // this.commonService.routeToAdmin();
                    this.commonService.routeToPage('./admin');
                  } else if (res['data']['adminAccess'] == false && res['data']['roleName'] == 'LogisticOfficer') {
                    localStorage.setItem('adminAccess', res['data']['adminAccess']);
                    localStorage.setItem('roleName', res['data']['roleName']);
                    this.commonService.routeToLogisticDashboard();
                  } else if (roleArray.length === 1 && roleArray.includes('AllFrieghtMaster')) {
                    this.commonService.routeToPage('./All-Master/frieght');
                    return;
                  } else if (roleArray.includes('AllFrieghtMaster') && roleArray.length > 1) {
                    // localStorage.setItem('roleNameArray', res['data']['roleName'])
                    res['data']['plantCode'] ? localStorage.setItem('plantCode', res['data']['plantCode']) : '';
                    this.commonService.routeToPage('./All-Master/frieght');
                    return;
                  }
                  else {
                    // this.commonService.routeToDashboard();
                    if (res['data']['roleName']) {
                      // localStorage.setItem('roleName', res['data']['roleName']);
                      localStorage.setItem('roleNameArray', res['data']['roleName'])
                      res['data']['plantCode'] ? localStorage.setItem('plantCode', res['data']['plantCode']) : '';
                    } else {
                      localStorage.setItem('roleName', '');
                    }
                    this.commonService.routeToPage('./dashboard');
                  }
                } else {
                  this.isLoader = false;
                }
                // this.commonService.spinner.hide();


              },
              error => {
                // this.commonService.spinner.hide();
                this.router.navigate(['login']);

                this.errMsg = error?.error?.message;
                console.log('Error fetching : ', error);

              }
            )

          },
          error => {
            console.error('Error calling Node.js function:', error);

            // this.commonService.spinner.hide();
            this.errMsg = 'Unauthorized user!'
            return;
          }
        );

    }
  }

  customTokenValidator(control: AbstractControl): ValidationErrors | null {
    const tokenValue: any = control.value;
    // const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    // const emailPattern = /^[a-zA-Z][a-zA-Z0-9]*(?:[._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,3}$/;
    // const emailPattern = /^[a-zA-Z][a-zA-Z0-9]*(?:[._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:[-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,3}$/;
    const emailPattern = /^[a-zA-Z][a-zA-Z0-9]*(?:[._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]*(?:[-][a-zA-Z0-9]+)*(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,3}$/;
    const phoneDigit = /^\d{10}$/;
    const phonePattern = /^[6-9][0-9]{9}$/;
    const isNumeric = /^-?\d+(\.\d+)?$/;

    if (isNumeric.test(tokenValue)) {

      if (!phoneDigit.test(tokenValue)) {
        return { customError: 'Valid mobile number should consists 10 digits.' };
      } else if (!phonePattern.test(tokenValue)) {
        return { customError: 'Invalid mobile number.' };
      }
    } else {
      if (!emailPattern.test(tokenValue)) {
        return { customError: 'Invalid email id, Valid pattern should be like abc.xyz@domain.com' };
      }
    }
    return { invalidToken: true };
  }

  changeTab(option: any) {
    console.log('changeTab');
    this.activeTab = option;
    this.isLoader = false;
    this.loginErrorMsg = '';
  }

  sendOTP() {
    //added by suleman for CAD
    // localStorage.clear();
    // localStorage.setItem('username', 'MJUNCTION SERVICES LTD');
    // localStorage.setItem('token', 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJzeXN0ZW11c2VyIiwiaWF0IjoxNzQwMTE1NjY1LCJleHAiOjE3NDAyMDIwNjV9.hzcteXt9NHLZZKrBruiRCrIz8ILZbscezLBG7UbMR4wmBSf2zy3BBvXsqPx9EKqYbYIGIovfYvs1z8ySuV7w3gTHr-fV_v8bKYtY1ybHMwQyjoUROgEJJKWGCOxPW6DjSb7XbLqDVWRN6FCuwNr7L5XSDUoYWa4skwc2hX7Y17obuYxctJswGbxZ1WFw5MAi0Hstdgd7CRfzhBRnNK0eXQPljWlosgTo0At4WSFrKO9KBnOzgn9XpCQCGErDJkPpPLE8UjdhSBf_cuPVpK6TxHSYoi4ix0o9fVXbhYUKDZRydxFWE2ES8obcZ0Ccho2XYohyt-yNUnwpAMkEPW4MbQ');
    // localStorage.setItem('userdata', JSON.stringify({ "VENDORID": 1159, "ACCOUNTNUMBER": "0910028104", "NAME": "MJUNCTION SERVICES LTD", "REGION": "WB", "DISTRICT": "24 PARGANAS (NORTH)", "POSTALCODE": "700091", "EMAIL": "nafeesa.shaikh.ext@adani.com", "TELEPHONE": "033-66106100", "CITY": "NORTH 24 PARGANAS", "GST": "19AACCM5881C1ZE", "TAXNUMBER": "AACCM5881C", "CHARGEMECHANISM": null, "CINNUMBER": null, "CREATEDON": "2024-08-23T07:20:27.907+00:00", "ADDRESS": "GODREJ WATERSIDE;TOWER-I;3RD FLOOR PLOT-5; BLOCK-DP; SEC.-V; SALTLAKE CITY   NORTH 24 PARGANAS 700091", "VENDORACCOUNTGROUP": "ZN01", "CUSTOMERCODE": null, "COMPANYCODE": null, "PAYMENTTERM": null, "PAYMENTTERMDESC": null, "PAYMENTMETHOD": null, "PAYMENTMETHODDESC": " Bank Transfer ,", "ACTIVE": true, "TYPESOFVENDOR": null, "ROLE": null, "RCM/FCM": null }));
    // localStorage.setItem('logintype', 'vendor');
    // localStorage.removeItem("columnCheckStock");
    // localStorage.removeItem("columnSettingStock");


    // this.commonService.routeToPage('./dashboard');
    // return

    console.log('sendOTP');
    this.vendorLoginForm.controls['username'].status = 'valid';
    if (this.vendorLoginForm.controls['username'].errors && ['invalidToken']) {
      delete (this.vendorLoginForm.controls['username'].errors['invalidToken']);
    }
    let user_input = this.vendorLoginForm.controls['username'].value;
    let isMobileNumber = false;
    if (!isNaN(user_input)) {
      isMobileNumber = true;
    } else {
      isMobileNumber = false;
    }

    let json = {
      "pi_user": "user",
      "pi_data": {
        "Entity": isMobileNumber ? "ContactNumber" : "Email",
        "Email": user_input,
        "ContactNumber": user_input
      }
    }
    this.isLoader = true;
    this.commonService.sendOTP(json).subscribe((res: any) => {
      console.log(res);
      this.isLoader = false;
      this.vendorLoginForm['controls']['username'].disable();
      this.showOTPField = true;
      this.TimerCountdown();
    }, err => {
      console.log(err);
      this.isLoader = false;
      this.toastMsg = err['error']['validationMessage'] ? err['error']['validationMessage'] : 'Server Error! Please try again later!';
      this.errorToast = true;
      setTimeout(() => {
        this.errorToast = false;
      }, 5000);
    })
  }

  resendOTP() {
    console.log('resendOTP');
    this.timeLeft = OTP_TIMER;
    this.sendOTP();
  }

  loginSite(event: any) {
    // console.log('loginSite');
    this.loginErrorMsg = '';
    localStorage.setItem('division', this.siteLoginForm.value.division);
    // if (this.siteLoginForm.value.division === 'Cement') {
    let login_json = {
      username: this.siteLoginForm.value.username,
      password: this.siteLoginForm.value.password,
    }
    this.isLoader = true;
    this.commonService.login(login_json).subscribe(
      res => {
        console.log('Login successful:', res);
        this.commonService.routeToPage('./dashboard');
        this.isLoader = false;
        // Handle successful login
      },
      error => {
        console.error('Login error:', error);
        this.isLoader = false;
        console.log(error);
      this.loginErrorMsg = error['error']['message'] ? error['error']['message'] : 'Server Error! Please try again later!';
      // this.toastMsg = err['error']['message'];
      // this.errorToast = true;
      setTimeout(() => {
        this.errorToast = false;
      }, 5000);
        // Handle login error
      }
    );

    return;
    this.commonService.loginSite(login_json).subscribe((res: any) => {
      console.log(res);
      if (res && res['status'] == 'Success') {
        localStorage.clear();
        localStorage.setItem('username', res['data']['username']);
        localStorage.setItem('token', res['data']['token']);
        localStorage.setItem('logintype', 'sitecontroller');
        localStorage.setItem('division', res['data']['division']);
        localStorage.removeItem("columnCheckStock");
        localStorage.removeItem("columnSettingStock");
        const roleName = res['data']['roleName'] || '';
        const roleArray = roleName.split(',');
        localStorage.setItem('roleName', roleName);

        // res['data']['roleName'] = 'CadAdmin'; // manual pass
        if (res['data']['adminAccess'] == true) {
          localStorage.setItem('adminAccess', res['data']['adminAccess']);
          // this.commonService.routeToAdmin();
          this.commonService.routeToPage('./admin');
        } else if (res['data']['adminAccess'] == false && res['data']['roleName'] == 'LogisticOfficer') {
          localStorage.setItem('adminAccess', res['data']['adminAccess']);
          localStorage.setItem('roleName', res['data']['roleName']);
          this.commonService.routeToLogisticDashboard();
        } else if (res['data']['roleName'] == 'CAD Admin') {
          localStorage.setItem('adminAccess', res['data']['adminAccess']);
          localStorage.setItem('roleName', res['data']['roleName']);
          this.commonService.routeToPage('./CAD');
        } else if (res['data']['roleName'] == 'Checker') {
          localStorage.setItem('adminAccess', res['data']['adminAccess']);
          localStorage.setItem('roleName', res['data']['roleName']);
          this.commonService.routeToPage('./CAD');
        } else if (res['data']['roleName'] == 'Project Manager') {
          localStorage.setItem('adminAccess', res['data']['adminAccess']);
          localStorage.setItem('roleName', res['data']['roleName']);
          this.commonService.routeToPage('./CAD');
          // } else if (res['data']['adminAccess'] == true && res['data']['roleName'] == 'Checker') {
          //   localStorage.setItem('adminAccess', res['data']['adminAccess']);
          //   localStorage.setItem('roleName', res['data']['roleName']);
          //   this.commonService.routeToPage('./CAD');

          // } else if (res['data']['adminAccess'] == true && res['data']['roleName'] == 'Project Manager') {
          // localStorage.setItem('adminAccess', res['data']['adminAccess']);
          // localStorage.setItem('roleName', res['data']['roleName']);
          // this.commonService.routeToPage('./CAD');
          // }
          // else if (res['data']['adminAccess'] == false && res['data']['roleName'] == 'Checker') {
          // localStorage.setItem('adminAccess', res['data']['adminAccess']);
          // localStorage.setItem('roleName', res['data']['roleName']);
          // this.commonService.routeToPage('./CAD');
        }
        else if(res['data']['roleName'] == 'BusinessUser'){
           localStorage.setItem('adminAccess', res['data']['adminAccess']);
           localStorage.setItem('roleName', res['data']['roleName']);
           localStorage.setItem('userdata', JSON.stringify(res['data']));
           this.commonService.routeToPage('./dashboard');
        }
        else if (res['data']['roleName'] == 'InvoiceReviewer') {
          localStorage.setItem('roleName', 'InvoiceReviewer');
          this.commonService.routeToPage('./paperless-work');
        } else if (roleArray.length === 1 && roleArray.includes('AllFrieghtMaster')) {
          this.commonService.routeToPage('./All-Master/frieght');
          return;
        } else if (roleArray.includes('AllFrieghtMaster') && roleArray.length > 1) {
          // localStorage.setItem('roleNameArray', res['data']['roleName'])
          res['data']['plantCode'] ? localStorage.setItem('plantCode', res['data']['plantCode']) : '';
          this.commonService.routeToPage('./All-Master/frieght');
          return;
        }
        else {
          // this.commonService.routeToDashboard();
          if (res['data']['roleName']) {
            // localStorage.setItem('roleName', res['data']['roleName']);
            localStorage.setItem('roleNameArray', res['data']['roleName'])
            res['data']['plantCode'] ? localStorage.setItem('plantCode', res['data']['plantCode']) : '';
          } else {
            localStorage.setItem('roleName', '');
          }
          this.commonService.routeToPage('./dashboard');
        }
      } else {
        this.isLoader = false;
      }
    }, err => {
      this.isLoader = false;
      console.log(err);
      this.loginErrorMsg = err['error']['message'] ? err['error']['message'] : 'Server Error! Please try again later!';
      // this.toastMsg = err['error']['message'];
      // this.errorToast = true;
      setTimeout(() => {
        this.errorToast = false;
      }, 5000);
    })
    // }
    // else {
    //   localStorage.setItem('roleName', 'Paperless Work Admin');
    //   this.commonService.routeToPage('./paperless-work');
    // }

  }

  loginVendor(event: any) {
    this.vendorLoginForm['controls']['username'].enable();
    let login_json = {
      username: this.vendorLoginForm.value.username,
      otp: this.vendorLoginForm.value.otp,
      vendorNo: this.vendorLoginForm.value.vendor_number.split('-')[0].trim(),
    }
    this.isLoader = true;

    this.commonService.loginVendor(login_json).subscribe(
      (res: any) => {
        console.log(res);
        if (res && res['status'] == 'Success') {
          this.isLoader = false;
          if (res['data']['ACTIVE'] == false) {
            this.loginErrorMsg = 'You are not authorise to login, please contact to admin';
            this.hideTimer = true;
            clearInterval(this.interval);
            this.vendorLoginForm.reset();
            this.showOTPField = false;
            return;
          }

          localStorage.clear();
          // localStorage.setItem('username', res['data']['name']);
          localStorage.setItem('username', res['data']['NAME']);
          localStorage.setItem('token', res['token']);
          localStorage.setItem('userdata', JSON.stringify(res['data']));
          localStorage.setItem('logintype', 'vendor');
          localStorage.setItem('division', this.vendorLoginForm.value.division);
          localStorage.removeItem("columnCheckStock");
          localStorage.removeItem("columnSettingStock");

          // Role-based routing
          if (res['data']['ROLE'] == 'AllFrieghtMaster') {
            localStorage.setItem('roleName', res['data']['ROLE']);
            this.commonService.routeToPage('All-Master');
            return;
          }

          if (this.vendorLoginForm.value.division === 'Cement') {
            if (res['data']['ROLE'] == 'PRIMARY') {
              localStorage.setItem('roleName', res['data']['ROLE']);
              this.commonService.routeToPage('./dashboard/all');
            } else if (res['data']['ROLE'] == 'CAD') {
              this.commonService.routeToPage('./CAD/vendor/home');
            } else {
              this.commonService.routeToPage('./dashboard');
            }
          } else {

            this.commonService.routeToPage('./paperless-work/vendor-home');
          }
        } else {
          // Handle case where status is not 'Success'
          this.isLoader = false;
        }
      },
      (err) => {
        this.isLoader = false;
        console.log(err);
        this.vendorLoginForm['controls']['username'].status = "VALID";
        this.vendorLoginForm.status = "VALID";
        this.loginErrorMsg = err['error']['message'] ? err['error']['message'] : 'Server Error! Please try again later!';

        setTimeout(() => {
          this.errorToast = false;
        }, 5000);
      }
    );

  }


  submitOTP() {
    console.log('submitOTP');

  }


  resetField() {
    console.log(('resetField'));

  }

  onInputChange() {
    console.log('onInputChange');

    if (this.vendorLoginForm.controls.username.errors['invalidToken'] == true) {

      let user_input = this.vendorLoginForm.controls['username'].value;
      let isMobileNumber = false;
      if (!isNaN(user_input)) {
        isMobileNumber = true;
      } else {
        isMobileNumber = false;
      }
      let json = {
        "pi_user": "user",
        "pi_data": {
          "Entity": isMobileNumber ? "ContactNumber" : "Email",
          // "Email": isMobileNumber ? '' : user_input,
          // "ContactNumber": isMobileNumber ? user_input : ''
          "Email": user_input,
          "ContactNumber": user_input
        }
      }

      this.commonService.getVendors(json).subscribe((res: any) => {
        console.log(res);
        if (res.status == 'Success' && res.data?.length > 0) {
          this.vendorArr = res['data'];
          this.vendorLoginForm.controls.vendor_number.enable();
          this.vendorLoginForm.controls.vendor_number.setValue(this.vendorArr[0]);
        }
      }, (err: any) => {
        console.log(err);
      })
    } else {
      this.vendorLoginForm.controls.vendor_number.disable();
      this.vendorLoginForm.controls.vendor_number.setValue('');
    }
  }

  TimerCountdown() {
    this.interval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.interval);
        this.hideTimer = true;
        this.otpCode = '';
      } else {
        this.hideTimer = false;
      }
    }, 1000);


  };

  samllogin() {
    window.location.href = 'https://vspeed.adani.com/saml/login'
  }

}
