import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss']
})
export class DeleteModalComponent {

  @Output() closeModal = new EventEmitter<void>();
  @Input() title: string = '';
 
  close() {
    this.closeModal.emit();
  }

  confirmDelete(){
    
  }

}
