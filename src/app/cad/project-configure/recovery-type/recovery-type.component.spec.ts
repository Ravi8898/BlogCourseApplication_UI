import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoveryTypeComponent } from './recovery-type.component';

describe('RecoveryTypeComponent', () => {
  let component: RecoveryTypeComponent;
  let fixture: ComponentFixture<RecoveryTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecoveryTypeComponent]
    });
    fixture = TestBed.createComponent(RecoveryTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
