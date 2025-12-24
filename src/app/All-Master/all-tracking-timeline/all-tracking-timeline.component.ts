import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { CommonService } from '../../services/common.service';
import { AllMaterService } from 'src/app/services/all-mater.service';

@Component({
  selector: 'app-all-tracking-timeline',
  templateUrl: './all-tracking-timeline.component.html',
  styleUrls: ['./all-tracking-timeline.component.scss']
})
export class AllTrackingTimelineComponent implements OnInit {

  @Input() frateId: number | string = '';

  trackingSteps: any[] = [
    // { date: '05 - 01 - 2024', time: '10:00 AM', status: 'Order Placed', details: 'Your order has been placed successfully.' },
    // { date: '06 - 01 - 2024', time: '02:15 PM', status: 'Approve', details: 'Order has been approved.' },
    // { date: '08 - 01 - 2024', time: '07:30 PM', status: 'In Progress', details: 'Your order is being processed.' },
    // { date: '10 - 01 - 2024', time: '11:35 PM', status: 'Pending', details: 'Awaiting pickup by delivery agent.', reference: 'By 0916000799' },
    // { date: '12 - 01 - 2024', time: '03:20 AM', status: 'Reject', details: 'Order was rejected by the warehouse.' },
    // { date: '15 - 01 - 2024', time: '04:10 AM', status: 'Completed', details: 'Package delivered successfully.', reference: 'By Shree Chadda Roadline\nBarcode Number: CP3IN1003#10000000778' }
  ];

  constructor(
  private commonService: CommonService,
  private allService: AllMaterService,
  ) {

  }
   ngOnInit(): void {
    if (this.frateId) {
      this.getFreightHistory(this.frateId);
    }
  }
   getFreightHistory(id: number | string) {
    let url = 'inboundALLFreightRates/getHistory/' + this.frateId;
    this.allService.getDataForAll(url).subscribe({
      next: (response: any) => {
        if (response?.status === 'Success' && Array.isArray(response.data)) {
          // this.trackingSteps = response.data.map((item: any) => ({

          //   date: moment(item.updatedDate).format('DD-MMM-YYYY'),
          //   time: moment(item.updatedDate).format('hh:mm A'),
          //   // status: `Version ${item.version}`,
          //   details: item.remarks,
          //   reference: `Updated By: ${item.updatedBy}`,
          //   newRate: item.newALLRate
          // }));
        this.trackingSteps = response.data.map((item: any) => {
          console.log(item);

  const isUpdated = !!item.updatedDate;
  const dateToUse = isUpdated ? item.updatedDate : item.createdDate;
  const localUser = localStorage.getItem('userName') || localStorage.getItem('loginUser') ;

  return {
    date: (moment as any)(dateToUse).format('DD-MMM-YYYY'),
    time: (moment as any)(dateToUse).format('hh:mm A'),
    details: isUpdated ? 'Updated Entry' : 'Created Entry',
    reference: `By: ${item.updatedBy || item.createdBy || localUser}`,
    newRate: item.newALLRate
  };
});
        } else {
          this.trackingSteps = [];
        }
      },
      error: () => {
        console.error('Error fetching freight history:', );
      }
    });
  }

}

