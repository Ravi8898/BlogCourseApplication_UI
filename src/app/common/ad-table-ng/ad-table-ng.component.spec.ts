import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdTableNgComponent } from './ad-table-ng.component';

describe('AdTableNgComponent', () => {
  let component: AdTableNgComponent;
  let fixture: ComponentFixture<AdTableNgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdTableNgComponent]
    });
    fixture = TestBed.createComponent(AdTableNgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
