import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  profileForm1!: FormGroup;
  toastMsg: string = '';
  errorToast: boolean = false;
  successToast: boolean = false;
  userData: any = {};
  isEditMode: boolean = false;
  originalFormValues: any = {};
  isLoader: boolean = false;
  production: boolean = environment.production;

  constructor(
    private commonService: CommonService,
    private http: HttpClient) {
    // Initializing user data from local storage on component load
    const savedData = localStorage.getItem('userdata');
    if (savedData) {
      this.userData = JSON.parse(savedData);
    }
  }

  ngOnInit(): void {
    this.loadProfileForm1();
    this.patchFormData();
    this.profileForm1.disable(); // Keeping form read-only by default
  }

  /** Initialize the Reactive Form with validation rules **/
  loadProfileForm1() {
    this.profileForm1 = new FormGroup({
      // account_no: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      dateOfBirth: new FormControl('', [Validators.required]),
      addressLine1: new FormControl(''),
      addressLine2: new FormControl(''),
      region: new FormControl(''),
      district: new FormControl(''),
      postal_code: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone_no: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      city: new FormControl(''),
      country: new FormControl(''),
      state: new FormControl('')
    });
  }

  /** Map userData to Form Controls and handle Date formatting for HTML5 Input **/
  patchFormData() {
    const addr = this.userData.addressRequest || this.userData.address || {};

    let dobValue = '';
    if (this.userData.dateOfBirth) {
      const dateParts = this.userData.dateOfBirth.split('-');
      // Converting dd-mm-yyyy (from backend) to yyyy-mm-dd (for HTML Date Picker)
      if (dateParts.length === 3 && dateParts[0].length === 2) {
        dobValue = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      } else {
        dobValue = this.userData.dateOfBirth;
      }
    }

    this.profileForm1.patchValue({
      // account_no: this.userData.userId || '',
      name: `${this.userData.firstName || ''} ${this.userData.lastName || ''}`.trim(),
      dateOfBirth: dobValue,
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      region: addr.landmark || '',
      city: addr.city || '',
      postal_code: addr.postalCode || '',
      district: addr.district || '',
      state: addr.state || '',
      country: addr.country || '',
      email: this.userData.email || '',
      phone_no: this.userData.phoneNumber || ''
    });
  }

  /** Enable Edit mode and store current values for potential Cancel action **/
  Edit(event: any) {
    this.isEditMode = true;
    this.profileForm1.enable();
    this.profileForm1.get('account_no')?.disable();
    this.originalFormValues = this.profileForm1.getRawValue();
  }

  /** Revert form to its original state and exit Edit mode **/
  Cancel(event: any) {
    this.isEditMode = false;
    this.profileForm1.patchValue(this.originalFormValues);
    this.profileForm1.disable();
  }

  /** Handle Profile Update, Data Transformation, and Session Management **/
  Save(event: any) {
    if (this.profileForm1.invalid) {
      this.profileForm1.markAllAsTouched();
      this.showToast('Please fill all fields correctly', true);
      return;
    }

    this.isLoader = true;
    const formVal = this.profileForm1.getRawValue();

    // Splitting Name into First and Last for Backend compatibility
    const nameParts = formVal.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Check if sensitive credentials have changed to force re-login
    const isEmailChanged = this.userData.email !== formVal.email;
    const isPhoneChanged = this.userData.phoneNumber !== formVal.phone_no;

    const payload = {
      userId: this.userData.userId,
      firstName: firstName,
      lastName: lastName,
      email: formVal.email,
      phoneNumber: formVal.phone_no,
      dateOfBirth: formVal.dateOfBirth,
      addressRequest: {
        addressLine1: formVal.addressLine1,
        addressLine2: formVal.addressLine2,
        landmark: formVal.region,
        city: formVal.city,
        postalCode: formVal.postal_code,
        state: formVal.state,
        country: formVal.country,
        district: formVal.district
      }
    };

    /** API call to update user details and update LocalStorage on success **/
    this.commonService.updateUserById(payload).subscribe({
      next: (res: any) => {
        this.isLoader = false;
        if (res && res.status?.toUpperCase() === 'SUCCESS') {
          // Force logout if Email/Phone changed for security reasons
          if (isEmailChanged || isPhoneChanged) {
            this.showToast('Credentials updated. Please login again.', false);
            setTimeout(() => {
              localStorage.clear();
              window.location.href = '/login';
            }, 2500);
            return;
          }

          this.userData = res.data;
          localStorage.setItem('userdata', JSON.stringify(this.userData));
          this.isEditMode = false;
          this.profileForm1.disable();
          this.patchFormData();
          this.showToast(res.message || 'Profile updated!', false);
        } else {
          this.showToast(res.message || 'Update failed', true);
        }
      },
      error: (err) => {
        this.isLoader = false;
        // Handling specific 403 Forbidden errors (Session Expiry)
        const msg = err.status === 403 ? 'Session Expired!' : 'Server Error!';
        this.showToast(msg, true);
      }
    });
  }

  /** Centralized Toast Notification Handler **/
  showToast(msg: string, isError: boolean) {
    this.toastMsg = msg;
    if (isError) {
      this.errorToast = true;
      setTimeout(() => this.errorToast = false, 3000);
    } else {
      this.successToast = true;
      setTimeout(() => this.successToast = false, 3000);
    }
  }
}
