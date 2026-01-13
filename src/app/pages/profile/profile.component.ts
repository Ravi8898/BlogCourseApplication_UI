import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  profileForm1: any = {};
  toastMsg:any = '';
  errorToast:any = false;
  successToast:any = false;
  userData:any = {};

  constructor(){
    if(localStorage.getItem('userdata')){
      this.userData = JSON.parse(localStorage.getItem('userdata') || '{}');
    }
  }

  ngOnInit():void{
    this.loadprofileForm1();
    console.log("Inside profile ngOnInit :: "+this.userData);
    // this.loadprofileForm1Value();
  }

  loadprofileForm1(){
    this.profileForm1 = new FormGroup({
      account_no: new FormControl(''),
      name: new FormControl(''),
      street1: new FormControl(''),
      street2: new FormControl(''),
      street3: new FormControl(''),
      street4: new FormControl(''),
      region: new FormControl(''),
      district: new FormControl(''),
      postal_code: new FormControl(''),
      email: new FormControl(''),
      phone_no: new FormControl(''),
      city: new FormControl(''),
      gst: new FormControl(''),
      tax: new FormControl(''),
      vendor_group: new FormControl(''),
    })
  }
}