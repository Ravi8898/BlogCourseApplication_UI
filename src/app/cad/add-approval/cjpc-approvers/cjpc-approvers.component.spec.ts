import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CJPCApproversComponent } from './cjpc-approvers.component';

describe('CJPCApproversComponent', () => {
  let component: CJPCApproversComponent;
  let fixture: ComponentFixture<CJPCApproversComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CJPCApproversComponent]
    });
    fixture = TestBed.createComponent(CJPCApproversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
