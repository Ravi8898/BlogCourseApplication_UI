import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectConfigureComponent } from './project-configure.component';

describe('ProjectConfigureComponent', () => {
  let component: ProjectConfigureComponent;
  let fixture: ComponentFixture<ProjectConfigureComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectConfigureComponent]
    });
    fixture = TestBed.createComponent(ProjectConfigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
