import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { KerttuOccurrenceTableComponent } from './kerttu-occurrence-table.component';

describe('KerttuOccurrenceTableComponent', () => {
  let component: KerttuOccurrenceTableComponent;
  let fixture: ComponentFixture<KerttuOccurrenceTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KerttuOccurrenceTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KerttuOccurrenceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
