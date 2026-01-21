import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, NgForm, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
@Component({
    selector: 'app-all-articles',
    templateUrl: './all-articles.component.html',
    styleUrls: ['./all-articles.component.scss']
})
export class AllArticlesComponent implements OnInit {

    loading = false;

    articles: any[] = [];
    articleTableList: any[] = [];
    articleApiList: any[] = [];
    articleSearchObject: any[] = [];

    // table config
    showActionColumn = false;

    // toast
    successToast = false;
    errorToast = false;
    toastMsg = '';

    constructor(
        private commonService: CommonService,
        private breadcrumbService: BreadcrumbService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumbUrl();
        this.getAllApprovedArticles();
    }

    getAllApprovedArticles() {
        this.loading = true;

        this.commonService.getAllArticles().subscribe({
            next: (res: any) => {
                const allArticles = res?.data || [];

                // ✅ only APPROVED articles
                this.articleApiList = allArticles.filter(
                    (a: any) => a.articleStatus === 'APPROVED'
                );

                this.prepareArticleTable(this.articleApiList);
                this.setArticleFilterField();

                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.articleApiList = [];
                this.articleTableList = [];
            }
        });
    }

    prepareArticleTable(data: any[]) {
        this.articleTableList = [];

        data.forEach((item: any) => {
            this.articleTableList.push({
                Title: item.title,
                Description: item.description,
                Status: item.articleStatus,
                Author: item.authorId || '-',
                'Reviewed By': item.reviewedBy || '-',
                'Reviewed At': item.reviewedAt
                    ? new Date(item.reviewedAt).toDateString()
                    : '-'
            });
        });
    }

    setArticleFilterField() {
        this.articleSearchObject = [
            {
                forLabel: 'Title',
                forContrl: 'title',
                forPlace: 'Enter Title'
            },
            {
                forLabel: 'Description',
                forContrl: 'description',
                forPlace: 'Enter Description'
            },
            {
                forLabel: 'Author',
                forContrl: 'authorId',
                forPlace: 'Enter Author'
            }
        ];
    }

    applyArticleSearch(data: any) {
        let filterData = data.pi_filterjson;
        let filtered = this.articleApiList;

        Object.keys(filterData).forEach((key) => {
            if (filterData[key]) {
                filtered = filtered.filter((item: any) =>
                    item[key]?.toString().toLowerCase()
                        .includes(filterData[key].toLowerCase())
                );
            }
        });

        this.prepareArticleTable(filtered);
    }

    goToMyArticles() {
        this.router.navigate(['/dashboard/all-articles/my-articles']);
    }
    showAddPanel = false;

    openAddArticlePanel() {
        this.showAddPanel = true;
    }

    closeAddArticlePanel() {
        this.showAddPanel = false;
    }
    closeAddEditModal() {
        this.formData.title = '';
        this.formData.description = '';
        this.formData.sections = [
            {
                key: '',
                explanation: '',
                imageUrl: null,
                uploading: false
            }
        ];
        this.showAddPanel = false;
    }
    onSubmit(formRef: NgForm) {

    }

    formData = {
        title: '',
        description: '',
        sections: [
            {
                key: 'Section1',
                explanation: '',
                imageUrl: null,
                uploading: false
            }
        ]
    };

    resetForm(form: any) {
        this.formData = {
            title: '',
            description: '',
            sections: [
                {
                    key: 'Section 1',
                    explanation: '',
                    imageUrl: null,
                    uploading: false
                }
            ]
        };
    }

    createArticle(event: any) {
        event.preventDefault();

        this.successToast = false;
        this.errorToast = false;
        this.toastMsg = '';

        if (!this.formData.title || !this.formData.description || this.formData.sections.length === 0) {
            this.errorToast = true;
            this.toastMsg = 'Please fill all required fields';
            return;
        }

        const sectionsPayload: any = {};

        this.formData.sections.forEach(section => {
            if (!section.key || !section.explanation) return;

            sectionsPayload[section.key] = {
                explanation: section.explanation,
                imageUrl: section.imageUrl || null
            };
        });

        const payload = {
            title: this.formData.title,
            description: this.formData.description,
            content: {
                sections: sectionsPayload
            }
        };

        this.loading = true;

        this.commonService.createArticle(payload).subscribe({
            next: (res: any) => {
                this.loading = false;

                if (res?.status === 'SUCCESS') {
                    this.toastMsg = res.message || 'Article created successfully';
                    this.successToast = true;

                    this.goToMyArticles();
                    this.resetForm(null);
                    this.showAddPanel = false;

                    setTimeout(() => {
                        this.successToast = false;
                        this.toastMsg = '';
                    }, 3000);
                } else {
                    this.toastMsg = res?.message || 'Failed to create article';
                    this.errorToast = true;

                    setTimeout(() => {
                        this.errorToast = false;
                        this.toastMsg = '';
                    }, 3000);
                }
            },
            error: (err) => {
                this.loading = false;

                this.toastMsg = err?.error?.message || 'Server error while creating article';
                this.errorToast = true;

                setTimeout(() => {
                    this.errorToast = false;
                    this.toastMsg = '';
                }, 3000);
            }
        });
    }

    uploadImage(event: any, index: number) {

        const file = event.target.files[0];
        if (!file) return;

        this.formData.sections[index].uploading = true;

        this.commonService.uploadImage(file).subscribe({
            next: (res: any) => {

                // Adjust according to backend response structure
                const imageUrl = res?.data;

                if (!imageUrl) {
                    this.toastMsg = 'Invalid image upload response';
                    this.errorToast = true;
                    this.formData.sections[index].uploading = false;
                    return;
                }

                // Assign image URL to correct section
                this.formData.sections[index].imageUrl = imageUrl;
                this.formData.sections[index].uploading = false;

                this.toastMsg = 'Image uploaded successfully';
                this.successToast = true;

                setTimeout(() => {
                    this.successToast = false;
                    this.toastMsg = '';
                }, 3000);
            },
            error: () => {
                this.formData.sections[index].uploading = false;

                this.toastMsg = 'Image upload failed';
                this.errorToast = true;

                setTimeout(() => {
                    this.errorToast = false;
                    this.toastMsg = '';
                }, 3000);
            }
        });
    }


    addSection() {
        const nextIndex = this.formData.sections.length + 1;

        this.formData.sections.push({
            key: 'Section' + nextIndex,
            explanation: '',
            imageUrl: null,
            uploading: false
        });

    }

    deleteSection(index: number) {

        // Do not allow deleting last remaining section (optional safety)
        if (this.formData.sections.length === 1) {
            this.toastMsg = 'At least one section is required';
            this.errorToast = true;
            // Auto-hide toast after 5 seconds
            setTimeout(() => {
                this.errorToast = false;
                this.toastMsg = '';
            }, 3000);
            return;
        }

        this.formData.sections.splice(index, 1);
    }

}
