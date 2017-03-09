import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiFormComponent } from './nafi-form.component';

describe('NafiFormComponent', () => {
  let component: NafiFormComponent;
  let fixture: ComponentFixture<NafiFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NafiFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
