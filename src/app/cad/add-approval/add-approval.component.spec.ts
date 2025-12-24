import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddApprovalComponent } from './add-approval.component';

describe('AddApprovalComponent', () => {
  let component: AddApprovalComponent;
  let fixture: ComponentFixture<AddApprovalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddApprovalComponent]
    });
    fixture = TestBed.createComponent(AddApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
