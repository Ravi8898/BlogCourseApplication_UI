import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceAndRetentionComponent } from './advance-and-retention.component';

describe('AdvanceAndRetentionComponent', () => {
  let component: AdvanceAndRetentionComponent;
  let fixture: ComponentFixture<AdvanceAndRetentionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvanceAndRetentionComponent]
    });
    fixture = TestBed.createComponent(AdvanceAndRetentionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
