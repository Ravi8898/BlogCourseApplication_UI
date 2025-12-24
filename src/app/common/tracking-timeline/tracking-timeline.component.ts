
import { Component, Input } from '@angular/core';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';

// export interface TrackingStatus {
//   date: string;
//   time: string;
//   status: string;
//   details: string;
//   reference?: string;
// }
@Component({
  selector: 'app-tracking-timeline',
  templateUrl: './tracking-timeline.component.html',
  styleUrls: ['./tracking-timeline.component.scss']
})
export class TrackingTimelineComponent {

  @Input() invoiceId: number | string = '';

  trackingSteps: any[] = [
    // { date: '05 - 01 - 2024', time: '10:00 AM', status: 'Order Placed', details: 'Your order has been placed successfully.' },
    // { date: '06 - 01 - 2024', time: '02:15 PM', status: 'Approve', details: 'Order has been approved.' },
    // { date: '08 - 01 - 2024', time: '07:30 PM', status: 'In Progress', details: 'Your order is being processed.' },
    // { date: '10 - 01 - 2024', time: '11:35 PM', status: 'Pending', details: 'Awaiting pickup by delivery agent.', reference: 'By 0916000799' },
    // { date: '12 - 01 - 2024', time: '03:20 AM', status: 'Reject', details: 'Order was rejected by the warehouse.' },
    // { date: '15 - 01 - 2024', time: '04:10 AM', status: 'Completed', details: 'Package delivered successfully.', reference: 'By Shree Chadda Roadline\nBarcode Number: CP3IN1003#10000000778' }
  ];

  constructor(
    private apiService: ApiService
  ) {

  }

  ngOnInit() {

    const url = 'checker/getInvoiceHistoryByinvoiceId';
    let passParam = {
      "invoiceid": this.invoiceId
    }
    this.apiService.dataPost(url, passParam).subscribe((data: any) => {
      const transformed = data?.data && data?.data.map((step: any) => ({
        date: moment(step.createddate).format('DD-MMM-YYYY'),
        time: moment(step.createddate).format('hh:mm A'),
        status: step.status,
        details: step.remark,
        reference: step.createdby || ''
      }));
      return this.trackingSteps = transformed;
    }, error => {
      console.error('Error fetching tracking details:', error);
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'pending';
      case 'reject': return 'reject';
      case 'accept': return 'approve';
      case 'in progress': return 'in-progress';
      case 'complete': return 'completed';
      default: return 'pending';
    }
  }
}
