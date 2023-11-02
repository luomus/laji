import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FieldValueMapComponent } from './field-value-map.component';

describe('FieldValueMapComponent', () => {
  let component: FieldValueMapComponent;
  let fixture: ComponentFixture<FieldValueMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldValueMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldValueMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
