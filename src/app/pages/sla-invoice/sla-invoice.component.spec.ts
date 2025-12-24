import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlaInvoiceComponent } from './sla-invoice.component';

describe('SlaInvoiceComponent', () => {
  let component: SlaInvoiceComponent;
  let fixture: ComponentFixture<SlaInvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SlaInvoiceComponent]
    });
    fixture = TestBed.createComponent(SlaInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
