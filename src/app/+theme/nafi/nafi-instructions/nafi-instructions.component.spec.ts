import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiInstructionsComponent } from './nafi-instructions.component';

describe('NafiInstructionsComponent', () => {
  let component: NafiInstructionsComponent;
  let fixture: ComponentFixture<NafiInstructionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NafiInstructionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
