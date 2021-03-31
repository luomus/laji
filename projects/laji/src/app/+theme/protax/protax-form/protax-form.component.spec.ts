import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProtaxFormComponent } from './protax-form.component';

describe('ProtaxFormComponent', () => {
  let component: ProtaxFormComponent;
  let fixture: ComponentFixture<ProtaxFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtaxFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtaxFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
