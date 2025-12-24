import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeductionOfTaxesComponent } from './deduction-of-taxes.component';

describe('DeductionOfTaxesComponent', () => {
  let component: DeductionOfTaxesComponent;
  let fixture: ComponentFixture<DeductionOfTaxesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeductionOfTaxesComponent]
    });
    fixture = TestBed.createComponent(DeductionOfTaxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
