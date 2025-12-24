import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  @Input() label: string = 'Upload File';
  @Input() isRequired: boolean = false;
  @Input() allowedFormats: string = '.pdf,.doc,.docx';
  @Input() allowMultiple: boolean = false;
  @Input() clearFile: File[] = [];
  @Input() disabled: boolean = false;

  @Output() filesSelected = new EventEmitter<File[]>();

  selectedFiles: File[] = [];

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFiles = Array.from(input.files);
      this.filesSelected.emit(this.selectedFiles);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.selectedFiles = Array.from(event.dataTransfer.files);
      this.filesSelected.emit(this.selectedFiles);
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.filesSelected.emit(this.selectedFiles);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  cleanFile() {
    this.selectedFiles = [];
    this.filesSelected.emit(this.selectedFiles);
    
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
