import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvasiveControlOwnSubmissionsComponent } from './invasive-control-own-submissions.component';

describe('InvasiveControlOwnSubmissionsComponent', () => {
  let component: InvasiveControlOwnSubmissionsComponent;
  let fixture: ComponentFixture<InvasiveControlOwnSubmissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvasiveControlOwnSubmissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvasiveControlOwnSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
