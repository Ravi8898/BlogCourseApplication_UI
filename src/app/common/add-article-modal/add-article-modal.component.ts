import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { ViewChild } from '@angular/core';
import { PreviewModalComponent } from '../preview-modal/preview-modal.component';

@Component({
    selector: 'app-add-article-modal',
    templateUrl: './add-article-modal.component.html'
})
export class AddArticleModalComponent {

    @Input() show = false;
    @Output() closeModal = new EventEmitter<void>();
    @Output() articleCreated = new EventEmitter<void>();
    @ViewChild('previewModal') previewModal!: PreviewModalComponent;
    previewImageUrl: string = '';


    constructor(private commonService: CommonService) { }

    formData = {
        title: '',
        description: '',
        sections: [{
            key: 'Section 1',
            explanation: '',
            imageUrl: '',
            base64Image: '',
            uploading: false
        }]
    };

    openPreview(base64Image: string) {
        this.previewImageUrl = base64Image;
        this.previewModal.open(base64Image);
    }


    close() {
        this.resetForm();
        this.closeModal.emit();
    }

    resetForm() {
        this.formData = {
            title: '',
            description: '',
            sections: [{
                key: 'Section 1',
                explanation: '',
                imageUrl: '',
                base64Image: '',
                uploading: false
            }]
        };
    }

    addSection() {
        const i = this.formData.sections.length + 1;
        this.formData.sections.push({
            key: 'Section ' + i,
            explanation: '',
            imageUrl: '',
            base64Image: '',
            uploading: false
        });
    }

    deleteSection(index: number) {
        if (this.formData.sections.length === 1) return;
        this.formData.sections.splice(index, 1);
    }

    uploadImage(event: any, index: number) {
        const file = event.target.files[0];
        if (!file) return;

        this.formData.sections[index].uploading = true;

        this.commonService.uploadImage(file).subscribe(res => {
            this.formData.sections[index].imageUrl = res.data.imageUrl;
            this.formData.sections[index].base64Image =
                `data:${file.type};base64,${res.data.base64}`;
            this.formData.sections[index].uploading = false;
        });
    }

    createArticle(event: Event) {
        event.preventDefault();

        const sections: any = {};
        this.formData.sections.forEach(s => {
            sections[s.key] = {
                explanation: s.explanation,
                imageUrl: s.imageUrl
                    ? 'resources\\uploads\\article\\images\\' + s.imageUrl
                    : null
            };
        });

        const payload = {
            title: this.formData.title,
            description: this.formData.description,
            content: { sections }
        };

        this.commonService.createArticle(payload).subscribe(() => {
            this.articleCreated.emit();
            this.close();
        });
    }
    onSubmit(formRef: any) {
        // form submission is handled in createArticle()
    }

}
