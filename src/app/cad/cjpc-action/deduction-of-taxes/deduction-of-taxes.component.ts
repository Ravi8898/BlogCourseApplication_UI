import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-deduction-of-taxes',
  templateUrl: './deduction-of-taxes.component.html',
  styleUrls: ['./deduction-of-taxes.component.scss']
})
export class DeductionOfTaxesComponent {
  @Input() CJPCID: string = '';
  @Input() invoiceTypeName: string = '';
  @Input() invoiceId: number = 0;

  @Output() updatePaymentDetails: EventEmitter<any> = new EventEmitter<any>();

  paymentDetails: any;
  tdsPer: any;
  isLoader: boolean = false;

  constructor(
    private apiService: ApiService,
  ) {

  }

  ngOnInit() {
    this.getPaymentDetails();
  }

  getPaymentDetails() {
    let url = 'checker/getcjpcPaymentDetails'
    let passParams = {
      "cjpcid": this.CJPCID,
      "billtype": this.invoiceTypeName,
      "invoiceId": this.invoiceId
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        // console.log('response', res);
        this.paymentDetails = res.data[0]

      }, error => {
        this.apiService.handleError(error)
      }
    )
  }

  calculate() {
    this.isLoader = true;
    let url = 'contract/setTDSCjpc'
    let passParams = {
      "cjpcId": this.CJPCID,
      "tdsRate": this.tdsPer
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        this.getPaymentDetails();
        this.updatePaymentDetails.emit(true);


        this.isLoader = false;
      }, error => {
        this.isLoader = false;
        this.apiService.handleError(error)
      }
    )
  }
}
