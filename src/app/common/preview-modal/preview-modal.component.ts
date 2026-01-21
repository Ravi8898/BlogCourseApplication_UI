import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-preview-modal',
  templateUrl: './preview-modal.component.html',
  styleUrls: ['./preview-modal.component.css']
})
export class PreviewModalComponent {

  @Input() imageUrl: string = '';

  private modal: any;

  open() {
    console.log('PreviewModalComponent open called with imageUrl:', this.imageUrl);
    // this.imageUrl = imageUrl;
    const modalElement = document.getElementById('previewModal');
    console.log('Imageurl:', modalElement?.getAttribute('imageUrl'));
    this.modal = new (window as any).bootstrap.Modal(modalElement);
    this.modal.show();
  }

  close() {
    this.modal?.hide();
    this.imageUrl = '';
  }
}
