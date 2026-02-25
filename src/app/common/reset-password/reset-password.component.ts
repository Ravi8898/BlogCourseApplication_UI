import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { encryptPassword } from 'src/app/utils/encryption.util';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {

  resetForm!: FormGroup;
  token: string = '';
  isLoading = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.errorMsg = 'Invalid or missing reset token';
      return;
    }

    // 2️ Create form
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // 3️ Password match validation
  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  // 4️ Submit reset password
  onSubmit() {

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const encryptedPassword = encryptPassword(
      this.resetForm.value.newPassword
    );

    const payload = {
      token: this.token,
      newPassword: encryptedPassword
    };

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.commonService.resetPassword(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMsg = res.message || 'Password reset successfully';

        // Redirect to login after success
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err?.error?.message || 'Reset password failed';
      }
    });
  }

  showNewPassword = false;
  toggleNewPassword() {
  this.showNewPassword = !this.showNewPassword;
  }
  showConfirmPassword = false;
  toggleConfirmPassword() {
  this.showConfirmPassword = !this.showConfirmPassword;
  }
  
}
