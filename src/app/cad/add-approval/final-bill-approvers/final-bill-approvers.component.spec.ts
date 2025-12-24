import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalBillApproversComponent } from './final-bill-approvers.component';

describe('FinalBillApproversComponent', () => {
  let component: FinalBillApproversComponent;
  let fixture: ComponentFixture<FinalBillApproversComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FinalBillApproversComponent]
    });
    fixture = TestBed.createComponent(FinalBillApproversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
