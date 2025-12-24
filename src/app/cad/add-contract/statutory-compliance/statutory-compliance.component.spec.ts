import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatutoryComplianceComponent } from './statutory-compliance.component';

describe('StatutoryComplianceComponent', () => {
  let component: StatutoryComplianceComponent;
  let fixture: ComponentFixture<StatutoryComplianceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatutoryComplianceComponent]
    });
    fixture = TestBed.createComponent(StatutoryComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
