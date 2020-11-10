import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeOwnSubmissionsComponent } from './theme-own-submissions.component';

describe('ThemeOwnSubmissionsComponent', () => {
  let component: ThemeOwnSubmissionsComponent;
  let fixture: ComponentFixture<ThemeOwnSubmissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeOwnSubmissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeOwnSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
