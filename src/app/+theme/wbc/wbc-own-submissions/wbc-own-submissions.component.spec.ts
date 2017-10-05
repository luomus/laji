import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcOwnSubmissionsComponent } from './wbc-own-submissions.component';

describe('WbcOwnSubmissionsComponent', () => {
  let component: WbcOwnSubmissionsComponent;
  let fixture: ComponentFixture<WbcOwnSubmissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcOwnSubmissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcOwnSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
