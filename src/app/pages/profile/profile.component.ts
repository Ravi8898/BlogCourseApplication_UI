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
    console.log(this.userData);
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

  // loadprofileForm1Value(){
  //   console.log(this.userData);
  //   this.profileForm1['controls']['account_no'].setValue(this.userData['id']);
  //   this.profileForm1['controls']['name'].setValue(this.userData['username']);
  //   this.profileForm1['controls']['street1'].setValue(this.userData['STREET HOUSE NUMBER']);
  //   this.profileForm1['controls']['street2'].setValue(this.userData['STREET 2']);
  //   this.profileForm1['controls']['street3'].setValue(this.userData['STREET 3']);
  //   this.profileForm1['controls']['street4'].setValue(this.userData['STREET 4']);
  //   this.profileForm1['controls']['region'].setValue(this.userData['REGION']);
  //   this.profileForm1['controls']['district'].setValue(this.userData['DISTRICT']);
  //   this.profileForm1['controls']['postal_code'].setValue(this.userData['POSTALCODE']);
  //   this.profileForm1['controls']['email'].setValue(this.userData['email']);
  //   this.profileForm1['controls']['phone_no'].setValue(this.userData['phoneNumber']);
  //   this.profileForm1['controls']['city'].setValue(this.userData['CITY']);
  //   this.profileForm1['controls']['gst'].setValue(this.userData['GST']);
  //   this.profileForm1['controls']['tax'].setValue(this.userData['PANNO']);
  //   this.profileForm1['controls']['vendor_group'].setValue(this.userData['VENDOR_ACT_GRP']);

  // }
}
