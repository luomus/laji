import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusMarkComponent } from './status-mark.component';

describe('StatusMarkComponent', () => {
  let component: StatusMarkComponent;
  let fixture: ComponentFixture<StatusMarkComponent>;

  beforeEach(async(() => {
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
