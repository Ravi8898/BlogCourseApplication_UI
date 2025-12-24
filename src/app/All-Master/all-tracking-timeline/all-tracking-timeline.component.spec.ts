import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTrackingTimelineComponent } from './all-tracking-timeline.component';

describe('AllTrackingTimelineComponent', () => {
  let component: AllTrackingTimelineComponent;
  let fixture: ComponentFixture<AllTrackingTimelineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllTrackingTimelineComponent]
    });
    fixture = TestBed.createComponent(AllTrackingTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
