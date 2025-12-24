import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadAdminHomeComponent } from './cad-admin-home.component';

describe('CadAdminHomeComponent', () => {
  let component: CadAdminHomeComponent;
  let fixture: ComponentFixture<CadAdminHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CadAdminHomeComponent]
    });
    fixture = TestBed.createComponent(CadAdminHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
