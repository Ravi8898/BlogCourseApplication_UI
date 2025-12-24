import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceVendorComponent } from './service-invoice.component';

describe('ServiceVendorComponent', () => {
  let component: ServiceVendorComponent;
  let fixture: ComponentFixture<ServiceVendorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceVendorComponent]
    });
    fixture = TestBed.createComponent(ServiceVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
