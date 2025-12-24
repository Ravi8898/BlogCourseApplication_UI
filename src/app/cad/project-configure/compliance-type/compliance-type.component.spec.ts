import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceTypeComponent } from './compliance-type.component';

describe('ComplianceTypeComponent', () => {
  let component: ComplianceTypeComponent;
  let fixture: ComponentFixture<ComplianceTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComplianceTypeComponent]
    });
    fixture = TestBed.createComponent(ComplianceTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
