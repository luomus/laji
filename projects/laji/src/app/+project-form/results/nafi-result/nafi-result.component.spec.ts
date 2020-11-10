import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiResultComponent } from './nafi-result.component';

describe('NafiResultComponent', () => {
  let component: NafiResultComponent;
  let fixture: ComponentFixture<NafiResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NafiResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
