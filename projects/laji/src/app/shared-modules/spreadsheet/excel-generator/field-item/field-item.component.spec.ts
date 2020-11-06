import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldItemComponent } from './field-item.component';

describe('FieldItemComponent', () => {
  let component: FieldItemComponent;
  let fixture: ComponentFixture<FieldItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
