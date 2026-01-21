import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-preview-modal',
  templateUrl: './preview-modal.component.html',
  styleUrls: ['./preview-modal.component.scss']
})
export class PreviewModalComponent {

  @Input() imageUrl: string = '';

  private modal: any;

  open(imageUrl: string) {
    console.log('PreviewModalComponent open called with image:', imageUrl);

    // imageUrl is now Base64 preview string
    this.imageUrl = imageUrl;
    console.log(this.imageUrl.substring(0, 50));
    const modalElement = document.getElementById('previewModal');
    this.modal = new (window as any).bootstrap.Modal(modalElement);
    this.modal.show();
  }

  close() {
    this.modal.hide();
    this.imageUrl = '';
  }
}
