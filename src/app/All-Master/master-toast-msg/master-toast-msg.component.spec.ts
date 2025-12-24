import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterToastMsgComponent } from './master-toast-msg.component';

describe('MasterToastMsgComponent', () => {
  let component: MasterToastMsgComponent;
  let fixture: ComponentFixture<MasterToastMsgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MasterToastMsgComponent]
    });
    fixture = TestBed.createComponent(MasterToastMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
