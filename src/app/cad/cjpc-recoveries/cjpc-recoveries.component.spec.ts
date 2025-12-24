import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CjpcRecoveriesComponent } from './cjpc-recoveries.component';

describe('CjpcRecoveriesComponent', () => {
  let component: CjpcRecoveriesComponent;
  let fixture: ComponentFixture<CjpcRecoveriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CjpcRecoveriesComponent]
    });
    fixture = TestBed.createComponent(CjpcRecoveriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
