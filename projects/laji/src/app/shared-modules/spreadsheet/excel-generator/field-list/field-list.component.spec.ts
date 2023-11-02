import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FieldListComponent } from './field-list.component';

describe('FieldListComponent', () => {
  let component: FieldListComponent;
  let fixture: ComponentFixture<FieldListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
