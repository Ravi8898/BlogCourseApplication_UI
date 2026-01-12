import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {

  constructor(
    private commonService: CommonService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbUrl();
    console.log('CourseComponent loaded');
  }
}
