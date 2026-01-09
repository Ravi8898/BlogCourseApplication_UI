import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {

  forgotForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ])
  });

  isLoading = false;

  constructor(private commonService: CommonService) {}

  onSubmit() {
    if (this.forgotForm.invalid) {
      return;
    }
  
    const email = this.forgotForm.get('email')?.value;
  
    if (!email) {
      return;
    }
  
    this.commonService.forgotPassword({ email }).subscribe({
      next: (res) => {
        console.log(res);
        this.forgotForm.reset();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  
}
