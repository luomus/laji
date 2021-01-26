import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OwnSubmissionsComponent } from './own-submissions.component';

describe('OwnSubmissionsComponent', () => {
  let component: OwnSubmissionsComponent;
  let fixture: ComponentFixture<OwnSubmissionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OwnSubmissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
