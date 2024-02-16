import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteListsResultMapComponent } from './complete-lists-result-map.component';

describe('CompleteListsResultMapComponent', () => {
  let component: CompleteListsResultMapComponent;
  let fixture: ComponentFixture<CompleteListsResultMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompleteListsResultMapComponent]
    });
    fixture = TestBed.createComponent(CompleteListsResultMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
