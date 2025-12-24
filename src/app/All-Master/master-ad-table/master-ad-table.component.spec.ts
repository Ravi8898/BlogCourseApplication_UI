import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterAdTableComponent } from './master-ad-table.component';

describe('MasterAdTableComponent', () => {
  let component: MasterAdTableComponent;
  let fixture: ComponentFixture<MasterAdTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MasterAdTableComponent]
    });
    fixture = TestBed.createComponent(MasterAdTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
