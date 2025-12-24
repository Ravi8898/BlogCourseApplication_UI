import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionalVendorComponent } from './conditional-vendor.component';

describe('ConditionalVendorComponent', () => {
  let component: ConditionalVendorComponent;
  let fixture: ComponentFixture<ConditionalVendorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConditionalVendorComponent]
    });
    fixture = TestBed.createComponent(ConditionalVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
