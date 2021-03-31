import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FindPersonComponent } from './find-person.component';

describe('FindPersonComponent', () => {
  let component: FindPersonComponent;
  let fixture: ComponentFixture<FindPersonComponent>;

  beforeEach(waitForAsync(() => {
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
