import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderAdvanceComponent } from './work-order-advance.component';

describe('WorkOrderAdvanceComponent', () => {
  let component: WorkOrderAdvanceComponent;
  let fixture: ComponentFixture<WorkOrderAdvanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkOrderAdvanceComponent]
    });
    fixture = TestBed.createComponent(WorkOrderAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
