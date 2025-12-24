import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorUploadInvoiceComponent } from './vendor-upload-invoice.component';

describe('VendorUploadInvoiceComponent', () => {
  let component: VendorUploadInvoiceComponent;
  let fixture: ComponentFixture<VendorUploadInvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VendorUploadInvoiceComponent]
    });
    fixture = TestBed.createComponent(VendorUploadInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
