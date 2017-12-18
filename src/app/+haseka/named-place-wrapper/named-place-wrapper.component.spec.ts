import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NamedPlaceWrapperComponent } from './named-place-wrapper.component';

describe('NamedPlaceWrapperComponent', () => {
  let component: NamedPlaceWrapperComponent;
  let fixture: ComponentFixture<NamedPlaceWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NamedPlaceWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NamedPlaceWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
