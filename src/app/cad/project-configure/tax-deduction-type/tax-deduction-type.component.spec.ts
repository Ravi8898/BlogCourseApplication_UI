import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxDeductionTypeComponent } from './tax-deduction-type.component';

describe('TaxDeductionTypeComponent', () => {
  let component: TaxDeductionTypeComponent;
  let fixture: ComponentFixture<TaxDeductionTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaxDeductionTypeComponent]
    });
    fixture = TestBed.createComponent(TaxDeductionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
