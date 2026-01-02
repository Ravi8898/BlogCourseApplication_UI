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
  production: boolean = environment.production;
  formType = 'login'
  activeTab = 'tab1';
  errMsg = '';
  isLoader = false;
  isShown = true;
  otpErr = '';

  otpForm: any;
  otpUsername = false;
  siteLoginForm: any;
  registerForm: any;
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
    this.loadRegisterForm();
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

  
  login(event : any) {
    const loginData = {
      username: this.siteLoginForm.controls['username'].value,
      password: this.siteLoginForm.controls['password'].value
    };
    this.commonService.login(loginData).subscribe(
      res => {
        localStorage.clear();
        localStorage.setItem('userId', res['data']['userId']);
        localStorage.setItem('firstName', res['data']['firstName']);
        localStorage.setItem('lastName', res['data']['lastName']);
        localStorage.setItem('username', res['data']['firstName'] + ' ' + res['data']['lastName']);
        localStorage.setItem('email', res['data']['email']);
        localStorage.setItem('phoneNumber', res['data']['phoneNumber']);
        localStorage.setItem('role', res['data']['role']);
        localStorage.setItem('address', JSON.stringify(res['data']['address']));
        localStorage.setItem('token', res['data']['token']);
        localStorage.setItem('userdata', JSON.stringify(res['data']));
        console.log('Login successful:', res);
        console.log("inside login :: ",res['data']['username']);
        console.log("inside login localStorage:: ",localStorage.getItem('username'));
        this.commonService.routeToPage('./dashboard');
        // Handle successful login
      },
      error => {
      this.isLoader = false;
      console.log(error);
      this.loginErrorMsg = error['error']['message'] ? error['error']['message'] : 'Server Error! Please try again later!';
      // this.toastMsg = err['error']['message'];
      // this.errorToast = true;
      setTimeout(() => {
        this.errorToast = false;
      }, 5000);
      }
    );
  }

  loadRegisterForm(){
    this.registerForm = new FormGroup({
      firstname: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      lastname: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      mobile: new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]),
      password: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      role: new FormControl('', [Validators.required, Validators.maxLength(50)]),      
    })
  }

  register(event:any){
    console.log('resgiter');

    let json = {
      firstname: this.registerForm.value.firstname,
      lastname: this.registerForm.value.lastname,
      email: this.registerForm.value.email,
      mobile: this.registerForm.value.mobile,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role,
    }

    this.commonService.register(json).subscribe(res=>{
      console.log(res);
    },err=>{
      console.log(err);
      
    })
  }

}
