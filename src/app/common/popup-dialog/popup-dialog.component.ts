import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-popup-dialog',
  templateUrl: './popup-dialog.component.html',
  styleUrls: ['./popup-dialog.component.scss']
})
export class PopupDialogComponent {
  @Input() showPopup: boolean = true;
  @Input() popupMessage: string = 'Data saved successfully!';


  ngOnInit(): void {

  }

  hide(): void {
    this.showPopup = false;
  }

  show(): void {
    this.showPopup = true;
  }
}
