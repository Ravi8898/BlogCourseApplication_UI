import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadVendorHomeComponent } from './cad-vendor-home.component';

describe('CadVendorHomeComponent', () => {
  let component: CadVendorHomeComponent;
  let fixture: ComponentFixture<CadVendorHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CadVendorHomeComponent]
    });
    fixture = TestBed.createComponent(CadVendorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
