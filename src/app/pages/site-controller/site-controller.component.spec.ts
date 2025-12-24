import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteControllerComponent } from './site-controller.component';

describe('SiteControllerComponent', () => {
  let component: SiteControllerComponent;
  let fixture: ComponentFixture<SiteControllerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteControllerComponent]
    });
    fixture = TestBed.createComponent(SiteControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
