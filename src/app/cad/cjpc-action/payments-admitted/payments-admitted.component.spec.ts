import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsAdmittedComponent } from './payments-admitted.component';

describe('PaymentsAdmitedComponent', () => {
  let component: PaymentsAdmittedComponent;
  let fixture: ComponentFixture<PaymentsAdmittedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentsAdmittedComponent]
    });
    fixture = TestBed.createComponent(PaymentsAdmittedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
