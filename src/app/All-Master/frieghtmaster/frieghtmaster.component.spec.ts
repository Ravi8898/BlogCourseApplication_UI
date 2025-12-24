import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrieghtmasterComponent } from './frieghtmaster.component';

describe('FrieghtmasterComponent', () => {
  let component: FrieghtmasterComponent;
  let fixture: ComponentFixture<FrieghtmasterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FrieghtmasterComponent]
    });
    fixture = TestBed.createComponent(FrieghtmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
