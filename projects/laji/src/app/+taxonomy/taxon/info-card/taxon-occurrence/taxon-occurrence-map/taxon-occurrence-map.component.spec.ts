import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonOccurrenceMapComponent } from './taxon-occurrence-map.component';

describe('TaxonOccurrenceMapComponent', () => {
  let component: TaxonOccurrenceMapComponent;
  let fixture: ComponentFixture<TaxonOccurrenceMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonOccurrenceMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonOccurrenceMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
