import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetentionReleaseComponent } from './retention-release.component';

describe('RetentionReleaseComponent', () => {
  let component: RetentionReleaseComponent;
  let fixture: ComponentFixture<RetentionReleaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RetentionReleaseComponent]
    });
    fixture = TestBed.createComponent(RetentionReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
