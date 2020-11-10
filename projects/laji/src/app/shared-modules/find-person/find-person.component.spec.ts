import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindPersonComponent } from './find-person.component';

describe('FindPersonComponent', () => {
  let component: FindPersonComponent;
  let fixture: ComponentFixture<FindPersonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindPersonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
