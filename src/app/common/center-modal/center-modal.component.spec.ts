import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterModalComponent } from './center-modal.component';

describe('CenterModalComponent', () => {
  let component: CenterModalComponent;
  let fixture: ComponentFixture<CenterModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterModalComponent]
    });
    fixture = TestBed.createComponent(CenterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
