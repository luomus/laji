import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MainResultComponent } from './main-result.component';

describe('MainResultComponent', () => {
  let component: MainResultComponent;
  let fixture: ComponentFixture<MainResultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MainResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
