import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectedFieldItemComponent } from './selected-field-item.component';

describe('SelectedFieldItemComponent', () => {
  let component: SelectedFieldItemComponent;
  let fixture: ComponentFixture<SelectedFieldItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedFieldItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedFieldItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
