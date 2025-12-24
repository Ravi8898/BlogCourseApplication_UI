import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginInputComponent } from './login-input.component';

describe('LoginInputComponent', () => {
  let component: LoginInputComponent;
  let fixture: ComponentFixture<LoginInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginInputComponent]
    });
    fixture = TestBed.createComponent(LoginInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
