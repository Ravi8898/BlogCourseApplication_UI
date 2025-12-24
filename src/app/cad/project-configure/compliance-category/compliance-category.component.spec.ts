import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceCategoryComponent } from './compliance-category.component';

describe('ComplianceCategoryComponent', () => {
  let component: ComplianceCategoryComponent;
  let fixture: ComponentFixture<ComplianceCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComplianceCategoryComponent]
    });
    fixture = TestBed.createComponent(ComplianceCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
