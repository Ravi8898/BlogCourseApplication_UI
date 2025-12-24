import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClauseAndComplianceDocumentComponent } from './clause-and-compliance-document.component';

describe('ClauseAndComplianceDocumentComponent', () => {
  let component: ClauseAndComplianceDocumentComponent;
  let fixture: ComponentFixture<ClauseAndComplianceDocumentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClauseAndComplianceDocumentComponent]
    });
    fixture = TestBed.createComponent(ClauseAndComplianceDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
