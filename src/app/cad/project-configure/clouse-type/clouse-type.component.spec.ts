import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClouseTypeComponent } from './clouse-type.component';

describe('ClouseTypeComponent', () => {
  let component: ClouseTypeComponent;
  let fixture: ComponentFixture<ClouseTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClouseTypeComponent]
    });
    fixture = TestBed.createComponent(ClouseTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
