import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-center-modal',
  templateUrl: './center-modal.component.html',
  styleUrls: ['./center-modal.component.scss']
})
export class CenterModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Input() title: string = '';

  close() {
    this.closeModal.emit();
  }

}
