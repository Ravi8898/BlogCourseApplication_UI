import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFrieghtBillComponent } from './add-frieght-bill.component';

describe('AddFrieghtBillComponent', () => {
  let component: AddFrieghtBillComponent;
  let fixture: ComponentFixture<AddFrieghtBillComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddFrieghtBillComponent]
    });
    fixture = TestBed.createComponent(AddFrieghtBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
