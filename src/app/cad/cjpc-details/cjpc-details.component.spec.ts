import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CjpcDetailsComponent } from './cjpc-details.component';

describe('CjpcDetailsComponent', () => {
  let component: CjpcDetailsComponent;
  let fixture: ComponentFixture<CjpcDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CjpcDetailsComponent]
    });
    fixture = TestBed.createComponent(CjpcDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
