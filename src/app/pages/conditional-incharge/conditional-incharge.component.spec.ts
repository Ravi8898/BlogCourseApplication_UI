import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionalInchargeComponent } from './conditional-incharge.component';

describe('ConditionalInchargeComponent', () => {
  let component: ConditionalInchargeComponent;
  let fixture: ComponentFixture<ConditionalInchargeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConditionalInchargeComponent]
    });
    fixture = TestBed.createComponent(ConditionalInchargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
