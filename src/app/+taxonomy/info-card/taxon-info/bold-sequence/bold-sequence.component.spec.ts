import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoldSequenceComponent } from './bold-sequence.component';

describe('BoldSequenceComponent', () => {
  let component: BoldSequenceComponent;
  let fixture: ComponentFixture<BoldSequenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoldSequenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoldSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
