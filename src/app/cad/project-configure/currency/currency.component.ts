import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})
export class CurrencyComponent {

  currencyModal: boolean = false;
  currentDate = moment(new Date).format("YYYY-MM-DD");
  // currencies = ["Baht", "Dinar", "Dirham", "Dollar", "Dong", "Euro", "Franc", "Forint", "Krona", "Krone", "Leu", "Lira", "Naira", "Peso", "Pound", "Rand", "Real", "Rial", "Ringgit", "Riyal", "Ruble", "Rupee", "Rupiah", "Shekel", "Shilling", "Sol", "Taka", "Won", "Yen", "Złoty"];
  // currencyCodes = ["AED", "BHD", "BDT", "BRL", "CHF", "CLP", "CNY", "COP", "CZK", "DKK", "EGP", "EUR", "GBP", "HKD", "HUF", "IDR", "ILS", "INR", "JPY", "KES", "KRW", "KWD", "LKR", "MXN", "MYR", "NGN", "NOK", "NZD", "OMR", "PEN", "PHP", "PKR", "PLN", "QAR", "RON", "RUB", "SAR", "SEK", "SGD", "THB", "TRY", "USD", "VND", "ZAR"];
  // countries = ["Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia", "Czech Republic", "Denmark", "Egypt", "Finland", "France", "Germany", "Greece", "Hungary", "India", "Indonesia", "Ireland", "Israel", "Italy", "Japan", "Kenya", "Kuwait", "Malaysia", "Mexico", "Netherlands", "New Zealand", "Nigeria", "Norway", "Oman", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Thailand", "Turkey", "United Arab Emirates", "United Kingdom", "United States", "Vietnam"];
  // countryCodes = ["ARG", "AUS", "AUT", "BGD", "BEL", "BRA", "CAN", "CHE", "CHL", "CHN", "COL", "CZE", "DEU", "DNK", "EGY", "ESP", "FIN", "FRA", "GBR", "GRC", "HUN", "IDN", "IND", "IRL", "ISR", "ITA", "JPN", "KEN", "KOR", "KWT", "LKA", "MEX", "MYS", "NGA", "NLD", "NOR", "NZL", "OMN", "PAK", "PER", "PHL", "POL", "PRT", "QAT", "ROU", "RUS", "SAU", "SGP", "SWE", "THA", "TUR", "UAE", "USA", "VNM", "ZAF"];
  currencyData = [
    { name: "Baht", code: "THB", country: "Thailand", countryCode: "THA" },
    { name: "Dirham", code: "AED", country: "United Arab Emirates", countryCode: "ARE" },
    { name: "Dinar", code: "KWD", country: "Kuwait", countryCode: "KWT" },
    { name: "Dinar", code: "BHD", country: "Bahrain", countryCode: "BHR" },
    { name: "Dinar", code: "IQD", country: "Iraq", countryCode: "IRQ" },
    { name: "Dinar", code: "JOD", country: "Jordan", countryCode: "JOR" },
    { name: "Dinar", code: "TND", country: "Tunisia", countryCode: "TUN" },
    { name: "Dollar", code: "AUD", country: "Australia", countryCode: "AUS" },
    { name: "Dollar", code: "CAD", country: "Canada", countryCode: "CAN" },
    { name: "Dollar", code: "HKD", country: "Hong Kong", countryCode: "HKG" },
    { name: "Dollar", code: "NZD", country: "New Zealand", countryCode: "NZL" },
    { name: "Dollar", code: "SGD", country: "Singapore", countryCode: "SGP" },
    { name: "Dollar", code: "USD", country: "United States", countryCode: "USA" },
    { name: "Dong", code: "VND", country: "Vietnam", countryCode: "VNM" },
    { name: "Euro", code: "EUR", country: "European Union", countryCode: "EU" },
    { name: "Forint", code: "HUF", country: "Hungary", countryCode: "HUN" },
    { name: "Franc", code: "CHF", country: "Switzerland", countryCode: "CHE" },
    { name: "Krona", code: "SEK", country: "Sweden", countryCode: "SWE" },
    { name: "Krone", code: "DKK", country: "Denmark", countryCode: "DNK" },
    { name: "Krone", code: "NOK", country: "Norway", countryCode: "NOR" },
    { name: "Leu", code: "RON", country: "Romania", countryCode: "ROU" },
    { name: "Lira", code: "TRY", country: "Turkey", countryCode: "TUR" },
    { name: "Naira", code: "NGN", country: "Nigeria", countryCode: "NGA" },
    { name: "Peso", code: "ARS", country: "Argentina", countryCode: "ARG" },
    { name: "Peso", code: "CLP", country: "Chile", countryCode: "CHL" },
    { name: "Peso", code: "COP", country: "Colombia", countryCode: "COL" },
    { name: "Peso", code: "MXN", country: "Mexico", countryCode: "MEX" },
    { name: "Peso", code: "PHP", country: "Philippines", countryCode: "PHL" },
    { name: "Peso", code: "UYU", country: "Uruguay", countryCode: "URY" },
    { name: "Real", code: "BRL", country: "Brazil", countryCode: "BRA" },
    { name: "Rial", code: "IRR", country: "Iran", countryCode: "IRN" },
    { name: "Rial", code: "OMR", country: "Oman", countryCode: "OMN" },
    { name: "Rial", code: "QAR", country: "Qatar", countryCode: "QAT" },
    { name: "Riyal", code: "SAR", country: "Saudi Arabia", countryCode: "SAU" },
    { name: "Ruble", code: "RUB", country: "Russia", countryCode: "RUS" },
    { name: "Rupee", code: "INR", country: "India", countryCode: "IND" },
    { name: "Rupee", code: "LKR", country: "Sri Lanka", countryCode: "LKA" },
    { name: "Rupee", code: "MUR", country: "Mauritius", countryCode: "MUS" },
    { name: "Rupee", code: "NPR", country: "Nepal", countryCode: "NPL" },
    { name: "Rupee", code: "PKR", country: "Pakistan", countryCode: "PAK" },
    { name: "Shilling", code: "KES", country: "Kenya", countryCode: "KEN" },
    { name: "Shilling", code: "UGX", country: "Uganda", countryCode: "UGA" },
    { name: "Shilling", code: "TZS", country: "Tanzania", countryCode: "TZA" },
    { name: "Shekel", code: "ILS", country: "Israel", countryCode: "ISR" },
    { name: "Sol", code: "PEN", country: "Peru", countryCode: "PER" },
    { name: "Taka", code: "BDT", country: "Bangladesh", countryCode: "BGD" },
    { name: "Won", code: "KRW", country: "South Korea", countryCode: "KOR" },
    { name: "Yen", code: "JPY", country: "Japan", countryCode: "JPN" },
    { name: "Złoty", code: "PLN", country: "Poland", countryCode: "POL" }
  ];


  isLoader: boolean = false;
  submitted: boolean = false;

  currencyForm: FormGroup;

  errorMessage: string = '';
  successPopup: boolean = false;
  popupMessage: string = '';
  currencyId: string = '0';
  isEdit: boolean = false;
  isUpdated: boolean = false;
  originalFormValues: any = {}
  currencies: string[];
  currencyCodes: string[];
  countries: string[];
  countryCodes: string[];

  constructor(
    private apiService: ApiService,
    private formService: FormService,
    private fb: FormBuilder
  ) {
    this.currencies = [...new Set(this.currencyData.map(item => item.name))];
    this.currencyCodes = this.currencyData.map(item => item.code).sort();
    this.countries = this.currencyData.map(item => item.country).sort();
    this.countryCodes = this.currencyData.map(item => item.countryCode).sort();
    this.currencyForm = this.fb.group({
      currencyname: ['', Validators.required],
      currencycode: ['', [Validators.required, Validators.maxLength(3)]], // Max length is 3,
      countryname: ['', Validators.required],
      countrycode: ['', [Validators.required, Validators.maxLength(3)]] // Max length is 3,
    });
    console.log('this.curernyctdata', this.currencyData.length)
  }

  columns = [
    { header: 'Currency ID', field: 'lookUpMasterId' },
    { header: 'Currency Code', field: 'currencycode' },
    { header: 'Currency Name', field: 'currencyname' },
    { header: 'Country Name', field: 'countryname' },
    { header: 'Country Code', field: 'countrycode' },
    { header: 'Action', field: 'action', value: ['edit'] }
  ];

  currencyDetails: any[] = [];

  ngOnInit() {
    this.getCurrencyDetails();
    this.currencyForm.valueChanges.subscribe(() => {
      if (this.isEdit) {
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.currencyForm);
        console.log('this.isUpdated', this.isUpdated)
      }
    });
    this.currencyForm.get('currencycode')?.valueChanges.subscribe(selectedCurrencyCode => {
      // console.log('curency name updated',selectedCurrencyCode)
      if (!selectedCurrencyCode) {
        this.currencyForm.patchValue({
          countryname: null,
          countrycode: null
        })
        // this.currencyForm.updateValueAndValidity()
      }
      else {
        this.updateFields(selectedCurrencyCode);
      }
    });

  }
  updateFields(selectedCurrencyCode: string | null) {
    // this.currencyForm.get('currencycode')?.valueChanges.subscribe(selectedCode => {
    if (selectedCurrencyCode) {
      const selectedCurrency = this.currencyData.find(c => c.code === selectedCurrencyCode);
      // console.log('selectedCurrency')
      if (selectedCurrency) {
        this.currencyForm.patchValue({
          currencycode: selectedCurrency.code,  
          currencyname: selectedCurrency.name,
          countryname: selectedCurrency.country,
          countrycode: selectedCurrency.countryCode
        });

      }
      this.currencyForm.get('countryname')?.disable()
      this.currencyForm.get('countrycode')?.disable()
    }
    // });
  }
  onCurrencyNameChange(value: any) {
    this.currencyForm.patchValue({
      currencycode:null,
      countryname: null,
      countrycode: null
    });
    this.currencyForm.updateValueAndValidity()

    let selectedCurrency: any = this.currencyData.find(c => c.name === value) || '';

    this.updateFields(selectedCurrency?.code)
  }
  getCurrencyDetails() {
    this.isLoader = true;
    const json = {
      "lookUpName": "currency",
      "id": 0
    }
    this.apiService.dataPost('master/getLookUpMaster', json).subscribe(
      (res: any) => {
        this.currencyDetails = res.data
        this.isLoader = false;
      },
      (error: any) => {
        this.apiService.handleError(error);
        this.isLoader = false;
      }
    );
  }

  onEdit(value: any) {
    // console.log('Edit', value);
    this.currencyModal = true;
    this.isEdit = true
    this.currencyId = value.lookUpMasterId;
    this.currencyForm.patchValue({
      currencyname: value.currencyname,
      currencycode: value.currencycode,
      countryname: value.countryname,
      countrycode: value.countrycode
    });
    this.originalFormValues = this.currencyForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.currencyForm);
  }

  addCurrency() {
    this.currencyId = "0";
    this.currencyModal = true;
    this.currencyForm.reset();
  }

  resetForm() {
    this.currencyId = "0";
    this.isEdit = false
    this.submitted = false
    this.errorMessage = '';
    this.currencyForm.reset();
  }

  closeCurrencyModal() {
    this.currencyModal = false;
    this.resetForm()
    this.errorMessage = ''
  }

  openCurrencyModal() {
    this.currencyModal = true;
  }

  saveData() {
    console.log(this.currencyForm);

    this.submitted = true;
    this.formService.trimFormValues(this.currencyForm)
    if (this.currencyForm.invalid) {
      this.currencyForm.markAllAsTouched()
      return;
    }

    let formData = this.currencyForm.getRawValue();
    const data = {
      "lookUpMasterId": this.currencyId ? this.currencyId : 0,
      "lookUpName": "currency",
      "lookUpValue": formData.currencyname.trim(),
      "code": formData.currencycode.trim(),
      "description": "",
      "additionalInfo": {
        "currencyname": formData.currencyname?.trim(),
        "currencycode": formData.currencycode?.trim(),
        "countryname": formData.countryname?.trim(),
        "countrycode": formData.countrycode?.trim()
      },
      "isActive": true,
      "loginuser": this.apiService.getUserName()
    };

    this.isLoader = true;
    this.apiService.dataPost('master/addLookUpMaster', data).subscribe(response => {
      this.submitted = false;
      this.isLoader = false;
      this.successPopup = true;
      this.popupMessage = this.isEdit ? 'Data Updated Successfully' : 'Data Saved Successfully'
      this.isEdit = false
      this.closeCurrencyModal();
      this.getCurrencyDetails();
      this.resetForm();
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);
    }, error => {
      this.errorMessage = this.apiService.handleError(error);
      this.isLoader = false;
      this.submitted = false;

    });
  }

  onDelete(value: any) {
    console.log('Delete', value);
    let json = {
      "lookUpMasterId": value.lookUpMasterId,
      "isActive": false,
      "loginuser": this.apiService.getUserName()
    }
    this.apiService.dataPost('master/addLookUpMaster', json).subscribe(response => {
      this.getCurrencyDetails();
    }, error => {
      console.log('Error while deleting data', error);

    });
  }

}
