import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContractComponent } from './add-contract.component';

describe('AddContractComponent', () => {
  let component: AddContractComponent;
  let fixture: ComponentFixture<AddContractComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddContractComponent]
    });
    fixture = TestBed.createComponent(AddContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
