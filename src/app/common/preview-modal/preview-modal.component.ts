import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-preview-modal',
  templateUrl: './preview-modal.component.html',
  styleUrls: ['./preview-modal.component.scss']
})
export class PreviewModalComponent {

  @Input() base64Image: string = '';

  private modal: any;

  open(base64Image: string) {
    console.log('PreviewModalComponent open called with image:', base64Image);

    // base64Image is now Base64 preview string
    this.base64Image = base64Image;
    console.log(this.base64Image.substring(0, 50));
    const modalElement = document.getElementById('previewModal');
    this.modal = new (window as any).bootstrap.Modal(modalElement);
    this.modal.show();
  }

  close() {
    this.modal.hide();
    this.base64Image = '';
  }
}
