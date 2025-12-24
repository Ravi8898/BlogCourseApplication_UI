import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldTypeComponent } from './hold-type.component';

describe('HoldTypeComponent', () => {
  let component: HoldTypeComponent;
  let fixture: ComponentFixture<HoldTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HoldTypeComponent]
    });
    fixture = TestBed.createComponent(HoldTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
