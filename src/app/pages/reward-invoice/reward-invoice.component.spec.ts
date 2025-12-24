import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardInvoiceComponent } from './reward-invoice.component';

describe('RewardInvoiceComponent', () => {
  let component: RewardInvoiceComponent;
  let fixture: ComponentFixture<RewardInvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RewardInvoiceComponent]
    });
    fixture = TestBed.createComponent(RewardInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
