import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CjpcHoldsComponent } from './cjpc-holds.component';

describe('CjpcHoldsComponent', () => {
  let component: CjpcHoldsComponent;
  let fixture: ComponentFixture<CjpcHoldsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CjpcHoldsComponent]
    });
    fixture = TestBed.createComponent(CjpcHoldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
