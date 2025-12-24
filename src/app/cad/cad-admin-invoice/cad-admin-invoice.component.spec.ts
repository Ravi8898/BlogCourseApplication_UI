import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadAdminInvoiceComponent } from './cad-admin-invoice.component';

describe('CadAdminInvoiceComponent', () => {
  let component: CadAdminInvoiceComponent;
  let fixture: ComponentFixture<CadAdminInvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CadAdminInvoiceComponent]
    });
    fixture = TestBed.createComponent(CadAdminInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
