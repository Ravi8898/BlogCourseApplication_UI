import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentApproversComponent } from './department-approvers.component';

describe('DepartmentApproversComponent', () => {
  let component: DepartmentApproversComponent;
  let fixture: ComponentFixture<DepartmentApproversComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DepartmentApproversComponent]
    });
    fixture = TestBed.createComponent(DepartmentApproversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
