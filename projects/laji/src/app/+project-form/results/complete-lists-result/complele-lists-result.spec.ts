import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteListsResultComponent } from './complete-lists-result.component';

describe('CompleteListsResultComponent', () => {
  let component: CompleteListsResultComponent;
  let fixture: ComponentFixture<CompleteListsResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompleteListsResultComponent]
    });
    fixture = TestBed.createComponent(CompleteListsResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
