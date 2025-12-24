import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllMasterDataComponent } from './all-master-data.component';

describe('AllMasterDataComponent', () => {
  let component: AllMasterDataComponent;
  let fixture: ComponentFixture<AllMasterDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllMasterDataComponent]
    });
    fixture = TestBed.createComponent(AllMasterDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
