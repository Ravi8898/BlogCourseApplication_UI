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
    // Fetch user data stored after login
    const data = localStorage.getItem('userdata');
    if (data) {
      this.userData = JSON.parse(data);
    }

    // Create form structure
    this.initForm();

    // Fill form with user values
    this.setFormValues();
  }

  initForm(): void {
    this.profileForm = new FormGroup({
      // Read-only account number
      account_no: new FormControl({ value: '', disabled: true }),

      // Full name (required)
      name: new FormControl('', Validators.required),

      // Address fields
      addressLine1: new FormControl(''),
      addressLine2: new FormControl(''),
      landmark: new FormControl(''),
      city: new FormControl(''),
      district: new FormControl(''),
      state: new FormControl(''),
      country: new FormControl(''),
      postalCode: new FormControl(''),

      // Email with validation
      email: new FormControl('', [Validators.required, Validators.email]),

      // Phone number with Indian format validation
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ])
    });
  }

  setFormValues(): void {
    // Populate form fields from userData
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

    // Save a snapshot to restore if user clicks cancel
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
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.forceLogout();
      return;
    }

    const emailChanged =
      this.profileForm.value.email !== this.originalProfileData.email;

    const phoneChanged =
      this.profileForm.value.phone !== this.originalProfileData.phone;

    const nameParts = this.profileForm.value.name.trim().split(' ');

    // Payload sent to backend
    const payload = {
      userId: this.userData.userId,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),
      email: this.profileForm.value.email,
      phoneNumber: this.profileForm.value.phone,
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

    // Call backend API to update profile
    this.http.post(
      `${environment.apiUrl}/user/updateUserById`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: (res: any) => {
        if (res.status === 'SUCCESS') {

          // Normal update
          if (!emailChanged && !phoneChanged) {
            localStorage.setItem('userdata', JSON.stringify(res.data));
            this.userData = res.data;
            this.setFormValues();
            this.isEditMode = false;

            this.showToast('Profile updated successfully', 'success');
            return;
          }

          // Sensitive update
          this.showToast(
            'Profile updated successfully. Please login again.',
            'success'
          );

          setTimeout(() => {
            this.forceLogout();
          }, 3000);
        }
      },
      error: () => {
        this.showToast('Session expired', 'error');
        this.forceLogout();
      }
    });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    if (type === 'success') {
      this.toastr.success(message, 'Success', {
        timeOut: 3000,
        closeButton: true,
        progressBar: true
      });
    } else {
      this.toastr.error(message, 'Error', {
        timeOut: 3000,
        closeButton: true,
        progressBar: true
      });
    }
  }


  forceLogout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
