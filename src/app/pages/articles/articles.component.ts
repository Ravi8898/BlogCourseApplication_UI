import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {

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
    this.formData.content = '';
    this.showAddPanel = false;
  }
  onSubmit(formRef: NgForm) {

  }
  formData: any = {
    title: '',
    description: '',
    content: ''
  };

  resetForm(form: any) {
    this.formData.title = '';
    this.formData.description = '';
    this.formData.content = '';
  }

  createArticle(event: any) {
    event.preventDefault();

    // Reset toasts
    this.successToast = false;
    this.errorToast = false;
    this.toastMsg = '';

    // Basic validation
    if (!this.formData.title || !this.formData.description || !this.formData.content) {
      this.errorToast = true;
      this.toastMsg = 'Please fill all required fields';
      return;
    }

    const payload = {
      title: this.formData.title,
      description: this.formData.description,
      content: this.formData.content
    };

    this.loading = true;

    this.commonService.createArticle(payload).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res && res.status === 'SUCCESS') {
          // Success toast
          this.toastMsg = res.message || 'Article created successfully';
          this.successToast = true;

          // Refresh list
          this.getArticlesByUser();

          // Reset form & close panel
          this.resetForm(null);
          this.showAddPanel = false;

          setTimeout(() => {
            this.successToast = false;
          }, 3000);
        } else {
          // API returned failure
          this.toastMsg = res?.message || 'Failed to create article';
          this.errorToast = true;

          setTimeout(() => {
            this.errorToast = false;
          }, 3000);
        }
      },
      error: (err) => {
        this.loading = false;

        this.toastMsg =
          err?.error?.message || 'Server error while creating article';
        this.errorToast = true;

        setTimeout(() => {
          this.errorToast = false;
        }, 3000);

        console.error(err);
      }
    });
  }

  goToAllArticles() {
    this.router.navigate(['/dashboard/all-articles']);
  }



}
