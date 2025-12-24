import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardInchargeComponent } from './reward-incharge.component';

describe('RewardInchargeComponent', () => {
  let component: RewardInchargeComponent;
  let fixture: ComponentFixture<RewardInchargeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RewardInchargeComponent]
    });
    fixture = TestBed.createComponent(RewardInchargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
