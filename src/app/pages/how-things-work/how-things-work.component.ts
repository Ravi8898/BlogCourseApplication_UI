import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-how-things-work',
  templateUrl: './how-things-work.component.html',
  styleUrls: ['./how-things-work.component.scss']
})
export class HowThingsWorkComponent implements OnInit {

  constructor(
    private commonService: CommonService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbUrl();
    console.log('How Things Work Component loaded');
  }
}
