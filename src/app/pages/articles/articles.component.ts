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
      next: (res) => {
        this.articles = res.data; // adjust based on your API response
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
