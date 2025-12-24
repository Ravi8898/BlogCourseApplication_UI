import { Component, Input, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-payments-admitted',
  templateUrl: './payments-admitted.component.html',
  styleUrls: ['./payments-admitted.component.scss']
})
export class PaymentsAdmittedComponent {

  @Input() CJPCID: string = '';
  @Input() invoiceId: number = 0;
  @Input() invoiceTypeName: string = '';
  @Input() SummaryDetailsA: any[] = [];

  paymentDetails: any

  constructor(
    private apiService: ApiService
  ) {

  }

  ngOnInit() {
    this.getPaymentadmittedDetails()
  }

  getPaymentadmittedDetails() {
    let url = 'checker/getcjpcPaymentDetails'
    let passParams = {
      "cjpcid": this.CJPCID,
      "billtype": this.invoiceTypeName,
      "invoiceId": this.invoiceId
    }
    this.apiService.dataPost(url, passParams).subscribe(
      (res: any) => {
        console.log('response', res);
        this.paymentDetails = res.data[0]

      }, error => {
        this.apiService.handleError(error)
      }
    )
  }
}


