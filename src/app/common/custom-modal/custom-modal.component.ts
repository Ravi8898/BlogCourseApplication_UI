import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-custom-modal',
  templateUrl: './custom-modal.component.html',
  styleUrls: ['./custom-modal.component.scss']
})
export class CustomModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() onClickCross = new EventEmitter<void>();

  @Input() title: string = ''

  ngOnInit() {
    document.body.classList.add('custom-modal-open'); //For body section overlay hide
  }

  ngOnDestroy() {
    document.body.classList.remove('custom-modal-open');
  }

  close() {
    this.closeModal.emit();
  }

  crossClick() {
    this.onClickCross.emit();
  }
}
