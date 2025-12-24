import { Component } from '@angular/core';
import * as moment from 'moment';
import { BreadcrumbService } from 'src/app/common/breadcrumb/breadcrumb.service';

@Component({
  selector: 'app-project-configure',
  templateUrl: './project-configure.component.html',
  styleUrls: ['./project-configure.component.scss']
})
export class ProjectConfigureComponent {

  constructor(
    private breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbService.setBreadcrumbUrl();

  }

  panels = [
    { title: 'Currency', isOpen: false },
    { title: 'Department', isOpen: false },
    { title: 'Document Type', isOpen: false },
    { title: 'Advance Type', isOpen: false },
    { title: 'Retention', isOpen: false },
    { title: 'Invoice Type', isOpen: false },
    { title: 'Clause Type', isOpen: false },
    { title: 'Compliance Category', isOpen: false },
    { title: 'Compliance Type', isOpen: false },
    { title: 'Hold Type', isOpen: false },
    { title: 'Recovery Type', isOpen: false },
    { title: 'Tax Deduction Type', isOpen: false },
  ];


  togglePanel(panel: any) {
    this.panels.forEach(p => {
      p.isOpen = (p === panel) ? !p.isOpen : false;
    });
  }

}
