import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-popup-alert',
  templateUrl: './popup-alert.component.html',
  styleUrls: ['./popup-alert.component.scss']
})
export class PopupAlertComponent {

  @Input() message: string = '';
  @Output() response = new EventEmitter<boolean>();
  @Input() showPopupAlert: boolean = true;

  onResponse(answer: boolean) {
    this.response.emit(answer);
  }
  
}
