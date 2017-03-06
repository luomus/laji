import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiComponent } from './nafi.component';

describe('NafiComponent', () => {
  let component: NafiComponent;
  let fixture: ComponentFixture<NafiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NafiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
