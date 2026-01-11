import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {

  constructor(
    private commonService: CommonService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbUrl();
    console.log('ToolsComponent loaded');
  }
}
