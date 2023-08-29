import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { YearSliderComponent } from './year-slider.component';

describe('YearSliderComponent', () => {
  let component: YearSliderComponent;
  let fixture: ComponentFixture<YearSliderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ YearSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YearSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
