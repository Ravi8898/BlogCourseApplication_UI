import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CjpcListComponent } from './cjpc-list.component';

describe('CjpcListComponent', () => {
  let component: CjpcListComponent;
  let fixture: ComponentFixture<CjpcListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CjpcListComponent]
    });
    fixture = TestBed.createComponent(CjpcListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
