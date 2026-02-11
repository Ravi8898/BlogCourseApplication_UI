import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { ActivatedRoute, Router } from '@angular/router';
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

    onArticleCreated() {
        this.showAddPanel = false;
        this.getAllApprovedArticles(); // refresh list
    }

}
