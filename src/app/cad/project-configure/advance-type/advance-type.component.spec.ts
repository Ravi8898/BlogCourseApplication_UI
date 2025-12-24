import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceTypeComponent } from './advance-type.component';

describe('AdvanceTypeComponent', () => {
  let component: AdvanceTypeComponent;
  let fixture: ComponentFixture<AdvanceTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvanceTypeComponent]
    });
    fixture = TestBed.createComponent(AdvanceTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
