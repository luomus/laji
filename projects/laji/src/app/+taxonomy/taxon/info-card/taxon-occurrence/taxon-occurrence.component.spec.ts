import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonOccurrenceComponent } from './taxon-occurrence.component';

describe('TaxonOccurrenceComponent', () => {
  let component: TaxonOccurrenceComponent;
  let fixture: ComponentFixture<TaxonOccurrenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonOccurrenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonOccurrenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
