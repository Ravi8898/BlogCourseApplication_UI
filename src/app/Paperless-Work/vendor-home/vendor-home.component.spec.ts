import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorHomeComponent } from './vendor-home.component';

describe('VendorHomeComponent', () => {
  let component: VendorHomeComponent;
  let fixture: ComponentFixture<VendorHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VendorHomeComponent]
    });
    fixture = TestBed.createComponent(VendorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
