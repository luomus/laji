import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AvailableFieldsComponent } from './available-fields.component';

describe('FieldAddComponent', () => {
  let component: AvailableFieldsComponent;
  let fixture: ComponentFixture<AvailableFieldsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AvailableFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
