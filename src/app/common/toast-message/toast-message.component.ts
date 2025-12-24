import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-toast-message',
  templateUrl: './toast-message.component.html',
  styleUrls: ['./toast-message.component.scss']
})
export class ToastMessageComponent {

  @Input() successToast: boolean = false;
  @Input() errorToast: boolean = false;
  @Input() toastMsg: string = '';
  @Output() action = new EventEmitter();
  
  // ngOnChanges(changes: SimpleChanges) {

  // }
  performAction(){
    this.action.emit(this.toastMsg);
  }
}
