import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ThemeResultComponent } from './theme-result.component';

describe('ThemeResultComponent', () => {
  let component: ThemeResultComponent;
  let fixture: ComponentFixture<ThemeResultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
