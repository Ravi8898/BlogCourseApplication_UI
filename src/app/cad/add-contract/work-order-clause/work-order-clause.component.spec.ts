import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderClauseComponent } from './work-order-clause.component';

describe('WorkOrderClauseComponent', () => {
  let component: WorkOrderClauseComponent;
  let fixture: ComponentFixture<WorkOrderClauseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkOrderClauseComponent]
    });
    fixture = TestBed.createComponent(WorkOrderClauseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
