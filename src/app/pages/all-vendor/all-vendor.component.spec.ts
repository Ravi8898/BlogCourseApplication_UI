import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllVendorComponent } from './all-vendor.component';

describe('AllVendorComponent', () => {
  let component: AllVendorComponent;
  let fixture: ComponentFixture<AllVendorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllVendorComponent]
    });
    fixture = TestBed.createComponent(AllVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
