import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelMakerComponent } from './label-maker.component';

describe('LabelMakerComponent', () => {
  let component: LabelMakerComponent;
  let fixture: ComponentFixture<LabelMakerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelMakerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
