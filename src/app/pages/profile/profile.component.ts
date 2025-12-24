import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  profileForm: any;
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
    this.loadProfileForm();
    this.loadProfileFormValue();
  }

  loadProfileForm(){
    this.profileForm = new FormGroup({
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

  loadProfileFormValue(){
    this.profileForm['controls']['account_no'].setValue(this.userData['ACCOUNTNUMBER']);
    this.profileForm['controls']['name'].setValue(this.userData['NAME']);
    this.profileForm['controls']['street1'].setValue(this.userData['STREET HOUSE NUMBER']);
    this.profileForm['controls']['street2'].setValue(this.userData['STREET 2']);
    this.profileForm['controls']['street3'].setValue(this.userData['STREET 3']);
    this.profileForm['controls']['street4'].setValue(this.userData['STREET 4']);
    this.profileForm['controls']['region'].setValue(this.userData['REGION']);
    this.profileForm['controls']['district'].setValue(this.userData['DISTRICT']);
    this.profileForm['controls']['postal_code'].setValue(this.userData['POSTALCODE']);
    this.profileForm['controls']['email'].setValue(this.userData['EMAIL']);
    this.profileForm['controls']['phone_no'].setValue(this.userData['TELEPHONENO']);
    this.profileForm['controls']['city'].setValue(this.userData['CITY']);
    this.profileForm['controls']['gst'].setValue(this.userData['GST']);
    this.profileForm['controls']['tax'].setValue(this.userData['PANNO']);
    this.profileForm['controls']['vendor_group'].setValue(this.userData['VENDOR_ACT_GRP']);

    this.profileForm1['account_no'] = this.userData['ACCOUNTNUMBER'];
    this.profileForm1['name'] = this.userData['NAME'];
    this.profileForm1['street1'] = this.userData['STREET HOUSE NUMBER'];
    this.profileForm1['street2'] = this.userData['STREET 2'];
    this.profileForm1['street3'] = this.userData['STREET 3'];
    this.profileForm1['street4'] = this.userData['STREET 4'];
    this.profileForm1['region'] = this.userData['REGION'];
    this.profileForm1['district'] = this.userData['DISTRICT'];
    this.profileForm1['postal_code'] = this.userData['POSTALCODE'];
    this.profileForm1['email'] = this.userData['EMAIL'];
    this.profileForm1['phone_no'] = this.userData['TELEPHONENO'];
    this.profileForm1['city'] = this.userData['CITY'];
    this.profileForm1['gst'] = this.userData['GST'];
    this.profileForm1['tax'] = this.userData['PANNO'];
    this.profileForm1['vendor_group'] = this.userData['VENDOR_ACT_GRP'];
  }
}
