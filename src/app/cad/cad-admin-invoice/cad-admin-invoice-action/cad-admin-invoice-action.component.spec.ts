import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadAdminInvoiceActionComponent } from './cad-admin-invoice-action.component';

describe('CadAdminInvoiceActionComponent', () => {
  let component: CadAdminInvoiceActionComponent;
  let fixture: ComponentFixture<CadAdminInvoiceActionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CadAdminInvoiceActionComponent]
    });
    fixture = TestBed.createComponent(CadAdminInvoiceActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
