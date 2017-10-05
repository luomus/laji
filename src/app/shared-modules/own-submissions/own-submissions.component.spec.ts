import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnSubmissionsComponent } from './own-submissions.component';

describe('OwnSubmissionsComponent', () => {
  let component: OwnSubmissionsComponent;
  let fixture: ComponentFixture<OwnSubmissionsComponent>;

  beforeEach(async(() => {
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
