import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { PreviewModalComponent } from 'src/app/common/preview-modal/preview-modal.component';


@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {

  @ViewChild('previewModal') previewModal!: PreviewModalComponent;

  successToast = false;
  errorToast = false;
  toastMsg = '';
  articles: any[] = [];
  articleTableList: any[] = [];
  articleApiList: any[] = [];
  articleSearchObject: any[] = [];
  addfrieghtform!: FormGroup;

  showActionColumn = false;
  loading = false;

  showToast(msg: string, isError: boolean) {
    this.successToast = false;
    this.errorToast = false;
    this.toastMsg = '';
    this.toastMsg = msg;
  
    if (isError) {
      this.errorToast = true;
      setTimeout(() => this.errorToast = false, 3000);
    } else {
      this.successToast = true;
      setTimeout(() => this.successToast = false, 3000);
    }
  }

  constructor(
    private commonService: CommonService,
    private breadcrumbService: BreadcrumbService, private router: Router, private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbUrl();
    this.getArticlesByUser();

  }

  getArticlesByUser() {
    this.loading = true;

    this.commonService.getAllArticlesByUserId().subscribe({
      next: (res: any) => {
        this.articleApiList = res.data;
        console.log(this.articleApiList);
        this.prepareArticleTable(res.data);
        this.setArticleFilterField();
        // adjust based on your API response
        this.showActionColumn = this.articleApiList.length > 0 ? true : false;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.showActionColumn = false;
      }
    });
  }

  prepareArticleTable(data: any[]) {
    this.articleTableList = [];

    data.forEach((item: any, index: number) => {
      this.articleTableList.push({
        "Title": item.title,
        "Description": item.description,
        "Status": this.formatStatus(item.articleStatus),
        "Reviewed By": item.reviewedBy || '-',
        "Reviewed At": item.reviewedAt
          ? new Date(item.reviewedAt).toDateString()
          : '-'
        // "PDF": item.pdfPath ? 'View PDF' : '-',
      });
    });
  }

  formatStatus(status: string): string {
    if (!status) return '-';
  
    return status
      .toLowerCase()              // pending_approval
      .split('_')                 // ['pending', 'approval']
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');                 // Pending Approval
  }
  

  onSendForApproval(rowIndex: number) {

    console.log('Row index:', rowIndex);
    console.log('API list:', this.articleApiList);

    const article = this.articleApiList[rowIndex];

    if (!article) {
      alert('Article not found');
      return;
    }

    const payload = {
      articleId: article.articleId,        
      articleStatus: 'PENDING_APPROVAL'
    };

    console.log('Send for approval payload:', payload);

    this.commonService.updateArticleStatus(payload).subscribe({
      next: (res: any) => {
        if (res.status === 'SUCCESS') {

          // update UI
          this.articleTableList[rowIndex]['Status'] = 'PENDING_APPROVAL';

          // hide action button
          this.showActionColumn = false;

          this.showToast(
            'Article sent for approval to Admin ',
            false
          );

          this.getArticlesByUser();
        }
        else {
          this.showToast(
            'Failed to send article for approval',
            true
          );
        }
      },
      error: () => {
        alert('Unable to send article for approval');
      }
    });
  }

  setArticleFilterField() {
    this.articleSearchObject = [
      {
        forLabel: "Title",
        forContrl: "title",
        forPlace: "Enter Title"
      },
      {
        forLabel: "Description",
        forContrl: "description",
        forPlace: "Enter Description"
      },
      {
        forLabel: "Status",
        forContrl: "articleStatus",
        forPlace: "Enter Status"
      },
      {
        forLabel: "Reviewed By",
        forContrl: "reviewedBy",
        forPlace: "Reviewed By"
      },
      {
        forLabel: "Reviewed At",
        forContrl: "reviewedAt",
        forPlace: "Reviewed At"
      }
    ];
  }

  onDeleteArticle(index: number) {
    const article = this.articleApiList[index];
  
    const payload = {
      articleId: article.articleId,
      isActive: 'N'
    };
  
    this.commonService.deleteArticle(payload).subscribe({
      next: (res: any) => {
        if (res.status === 'SUCCESS') {
          this.showToast('Article deleted successfully', false);
          this.getArticlesByUser();
        } else {
          this.showToast(res.message || 'Delete failed', true);
        }
      },
      error: () => {
        this.showToast('Unable to delete article', true);
      }
    });
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
        imageUrl: '',
        base64Image: '',
        uploading: false
      }
    ];
    this.showAddPanel = false;
  }
  onSubmit(formRef: NgForm) {

  }

  goToAllArticles() {
    this.router.navigate(['/dashboard/all-articles']);
  }
  
  formData = {
    title: '',
    description: '',
    sections: [
      {
        key: 'Section 1',
        explanation: '',
        imageUrl: '',
        base64Image: '',
        uploading: false
      }
    ]
  };
  base64Image: string = '';

  resetForm() {
    this.formData = {
      title: '',
      description: '',
      sections: [
        {
          key: 'Section 1',
          explanation: '',
          imageUrl: '',
          base64Image: '',
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
        imageUrl: section.imageUrl && section.imageUrl.trim() !== '' 
        ? 'resources\\uploads\\article\\images\\' + section.imageUrl : null
        // imageUrl: 'resources\\uploads\\article\\images\\' + section.imageUrl || null
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

          this.getArticlesByUser();
          this.resetForm();
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

        const base64 = res?.data?.base64;
        const imageUrl = res?.data?.imageUrl; 
        if (!base64 || !imageUrl) {
          this.showToast('Invalid image upload response', true);
          this.formData.sections[index].uploading = false;
          return;
        }
        // Create preview Base64 image
        const previewImage = `data:${file.type};base64,${base64}`;

        // Store both values per section
        this.formData.sections[index].base64Image = previewImage;
        this.formData.sections[index].imageUrl = imageUrl;
        this.formData.sections[index].uploading = false;

        this.toastMsg = res.message || 'Image uploaded successfully';
        this.successToast = true;

        setTimeout(() => {
          this.successToast = false;
          this.toastMsg = '';
        }, 3000);
      },

      error: (error : any) => {
        this.formData.sections[index].uploading = false;

        this.toastMsg = error?.message || 'Image upload failed';
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
      key: 'Section ' + nextIndex,
      explanation: '',
      imageUrl: '',
      base64Image: '',
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

  previewImageUrl: string = '';
  
  openPreview(base64Image: string) {
    console.log('Opening preview for:', base64Image);
    this.previewImageUrl = base64Image;
    this.previewModal.open(base64Image);
  }

}