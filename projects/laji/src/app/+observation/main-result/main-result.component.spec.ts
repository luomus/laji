import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainResultComponent } from './main-result.component';

describe('MainResultComponent', () => {
  let component: MainResultComponent;
  let fixture: ComponentFixture<MainResultComponent>;

  beforeEach(async(() => {
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
