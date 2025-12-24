import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CjpcActionComponent } from './cjpc-action.component';

describe('CjpcActionComponent', () => {
  let component: CjpcActionComponent;
  let fixture: ComponentFixture<CjpcActionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CjpcActionComponent]
    });
    fixture = TestBed.createComponent(CjpcActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
