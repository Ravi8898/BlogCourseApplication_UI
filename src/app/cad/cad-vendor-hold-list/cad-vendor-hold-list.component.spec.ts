import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadVendorHoldListComponent } from './cad-vendor-hold-list.component';

describe('CadVendorHoldListComponent', () => {
  let component: CadVendorHoldListComponent;
  let fixture: ComponentFixture<CadVendorHoldListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CadVendorHoldListComponent]
    });
    fixture = TestBed.createComponent(CadVendorHoldListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
