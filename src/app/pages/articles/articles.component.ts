import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {

  articles: any[] = [];
  articleTableList: any[] = [];
  articleApiList: any[] = [];
  articleSearchObject: any[] = [];

  loading = false;

  constructor(
  private commonService: CommonService,
  private breadcrumbService: BreadcrumbService
 ) {}

ngOnInit(): void {
  this.breadcrumbService.setBreadcrumbUrl(); // 👈 ADD THIS
  this.getArticlesByUser();

}

  getArticlesByUser() {
    this.loading = true;

    this.commonService.getAllArticlesByUserId().subscribe({
      next: (res: any) => {
        this.articleApiList = res.data;
        this.prepareArticleTable(res.data);
        this.setArticleFilterField();
       // adjust based on your API response
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  prepareArticleTable(data: any[]) {
  this.articleTableList = [];

  data.forEach((item: any, index: number) => {
    this.articleTableList.push({
      "#": index + 1,
      "Title": item.title,
      "Description": item.description,
      "Status": item.articleStatus,
      "Reviewed By": item.reviewedBy || '-',
      "Reviewed At": item.reviewedAt
        ? new Date(item.reviewedAt).toDateString()
        : '-',
      "PDF": item.pdfPath ? 'View PDF' : '-',
    });
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
      forLabel: "Status",
      forContrl: "articleStatus",
      forPlace: "Enter Status"
    },
    {
      forLabel: "Reviewed By",
      forContrl: "reviewedBy",
      forPlace: "Reviewed By"
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


}
