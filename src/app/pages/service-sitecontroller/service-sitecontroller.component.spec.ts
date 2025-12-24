import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceSitecontrollerComponent } from './service-sitecontroller.component';

describe('ServiceSitecontrollerComponent', () => {
  let component: ServiceSitecontrollerComponent;
  let fixture: ComponentFixture<ServiceSitecontrollerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceSitecontrollerComponent]
    });
    fixture = TestBed.createComponent(ServiceSitecontrollerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
