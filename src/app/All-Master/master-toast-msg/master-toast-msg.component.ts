import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-master-toast-msg',
  templateUrl: './master-toast-msg.component.html',
  styleUrls: ['./master-toast-msg.component.scss']
})
export class MasterToastMsgComponent {

  @Input() successToast: boolean = false;
  @Input() errorToast: boolean = false;
  @Input() toastMsg: string = '';
  @Output() action = new EventEmitter();

  // ngOnChanges(changes: SimpleChanges) {

  // }
  performAction(value:any){
    this.action.emit(this.toastMsg);
  }
}

