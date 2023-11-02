import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NafiResultComponent } from './nafi-result.component';

describe('NafiResultComponent', () => {
  let component: NafiResultComponent;
  let fixture: ComponentFixture<NafiResultComponent>;

  beforeEach(waitForAsync(() => {
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
