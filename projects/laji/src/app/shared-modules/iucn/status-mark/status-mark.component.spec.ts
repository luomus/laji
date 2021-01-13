import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StatusMarkComponent } from './status-mark.component';

describe('StatusMarkComponent', () => {
  let component: StatusMarkComponent;
  let fixture: ComponentFixture<StatusMarkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusMarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
