import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  profileForm!: FormGroup;
  userData: any = {};
  isEditMode = false;
  originalProfileData: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
     // Get user data from localStorage
    const data = localStorage.getItem('userdata');
    if (data) {
      this.userData = JSON.parse(data);
    }

    this.initForm();
    this.setFormValues();
  }

  initForm(): void {
    this.profileForm = new FormGroup({
      account_no: new FormControl({ value: '', disabled: true }),
      name: new FormControl('', Validators.required),

      addressLine1: new FormControl(''),
      addressLine2: new FormControl(''),
      landmark: new FormControl(''),
      city: new FormControl(''),
      district: new FormControl(''),
      state: new FormControl(''),
      country: new FormControl(''),
      postalCode: new FormControl(''),

      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ])
    });
  }

  // Patch form with user data
  setFormValues(): void {
    this.profileForm.patchValue({
      account_no: this.userData.userId,
      name: `${this.userData.firstName || ''} ${this.userData.lastName || ''}`,
      addressLine1: this.userData.address?.addressLine1 || '',
      addressLine2: this.userData.address?.addressLine2 || '',
      landmark: this.userData.address?.landmark || '',
      city: this.userData.address?.city || '',
      district: this.userData.address?.district || '',
      state: this.userData.address?.state || '',
      country: this.userData.address?.country || '',
      postalCode: this.userData.address?.postalCode || '',
      email: this.userData.email || '',
      phone: this.userData.phoneNumber || ''
    });

    // Store original data (for cancel functionality)
    this.originalProfileData = { ...this.profileForm.getRawValue() };
  }

  edit(): void {
    this.isEditMode = true;
  }

  cancel(): void {
    this.profileForm.patchValue(this.originalProfileData);
    this.isEditMode = false;
  }

  save(): void {
    // Stop if form is invalid
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    // Get JWT token
    const token = localStorage.getItem('token');
    if (!token) {
      this.forceLogout();
      return;
    }

    // Split full name into first & last name
    const nameParts = this.profileForm.value.name.trim().split(' ');

    // Payload sent to backend
    const payload = {
      userId: this.userData.userId,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),

      // Email & phone updated with SAME logic
      email: this.profileForm.value.email,
      phoneNumber: this.profileForm.value.phone,

      // Address object
      addressRequest: {
        addressLine1: this.profileForm.value.addressLine1,
        addressLine2: this.profileForm.value.addressLine2,
        landmark: this.profileForm.value.landmark,
        city: this.profileForm.value.city,
        district: this.profileForm.value.district,
        state: this.profileForm.value.state,
        country: this.profileForm.value.country,
        postalCode: this.profileForm.value.postalCode
      }
    };

    // API call to update profile
    this.http.post(
      `${environment.apiUrl}/user/updateUserById`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: (res: any) => {

        // If update successful
        if (res?.status === 'SUCCESS') {

          // Show success toast
          this.toastr.success(
            'Profile updated successfully. Please login again.',
            'Success',
            { timeOut: 3000 }
          );

          // Logout after 3 seconds
          setTimeout(() => {
            this.forceLogout();
          }, 3000);

        } else {
          // API responded but failed
          this.toastr.error(
            'Profile update failed',
            'Error',
            { timeOut: 3000 }
          );
        }
      },

      // API error (token expired / server error)
      error: () => {
        this.toastr.error(
          'Session expired',
          'Error',
          { timeOut: 3000 }
        );
        this.forceLogout();
      }
    });
  }

  forceLogout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
