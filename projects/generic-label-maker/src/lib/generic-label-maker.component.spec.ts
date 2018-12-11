import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericLabelMakerComponent } from './generic-label-maker.component';

describe('GenericLabelMakerComponent', () => {
  let component: GenericLabelMakerComponent;
  let fixture: ComponentFixture<GenericLabelMakerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericLabelMakerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericLabelMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
