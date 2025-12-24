import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SamlCallbackComponent } from './saml-callback.component';

describe('SamlCallbackComponent', () => {
  let component: SamlCallbackComponent;
  let fixture: ComponentFixture<SamlCallbackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SamlCallbackComponent]
    });
    fixture = TestBed.createComponent(SamlCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
